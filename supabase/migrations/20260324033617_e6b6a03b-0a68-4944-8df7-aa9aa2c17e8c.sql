
-- Trigger function: validate is_correct server-side by checking clinical_questions.options
CREATE OR REPLACE FUNCTION public.validate_answer_correctness()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  correct_option integer;
  opts jsonb;
  opt jsonb;
BEGIN
  -- Fetch the question options
  SELECT options INTO opts FROM public.clinical_questions WHERE id = NEW.question_id;
  
  IF opts IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;
  
  -- Find the correct option index
  correct_option := NULL;
  FOR i IN 0..jsonb_array_length(opts) - 1 LOOP
    opt := opts->i;
    IF (opt->>'is_correct')::boolean = true THEN
      correct_option := i;
      EXIT;
    END IF;
  END LOOP;
  
  IF correct_option IS NULL THEN
    RAISE EXCEPTION 'No correct option found for question';
  END IF;
  
  -- Override is_correct based on server-side validation
  NEW.is_correct := (NEW.selected_option = correct_option);
  
  RETURN NEW;
END;
$$;

-- Attach trigger to user_answers
DROP TRIGGER IF EXISTS trg_validate_answer ON public.user_answers;
CREATE TRIGGER trg_validate_answer
  BEFORE INSERT ON public.user_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_answer_correctness();

-- Also create a trigger to auto-update user_stats on answer insert
CREATE OR REPLACE FUNCTION public.update_stats_on_answer()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  current_stats record;
  today date := CURRENT_DATE;
  yesterday date := CURRENT_DATE - 1;
  new_streak integer;
  xp_gain integer;
BEGIN
  -- Ensure stats row exists
  INSERT INTO public.user_stats (user_id)
  VALUES (NEW.user_id)
  ON CONFLICT (user_id) DO NOTHING;
  
  SELECT * INTO current_stats FROM public.user_stats WHERE user_id = NEW.user_id;
  
  -- Calculate streak
  new_streak := COALESCE(current_stats.streak, 0);
  IF current_stats.last_active_date = yesterday THEN
    new_streak := new_streak + 1;
  ELSIF current_stats.last_active_date IS DISTINCT FROM today THEN
    new_streak := 1;
  END IF;
  
  -- Calculate XP
  xp_gain := CASE WHEN NEW.is_correct THEN 15 ELSE 3 END;
  
  UPDATE public.user_stats SET
    xp = COALESCE(xp, 0) + xp_gain,
    streak = new_streak,
    last_active_date = today,
    questions_answered = COALESCE(questions_answered, 0) + 1,
    questions_correct = COALESCE(questions_correct, 0) + (CASE WHEN NEW.is_correct THEN 1 ELSE 0 END),
    updated_at = now()
  WHERE user_id = NEW.user_id;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_update_stats ON public.user_answers;
CREATE TRIGGER trg_update_stats
  AFTER INSERT ON public.user_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_stats_on_answer();
