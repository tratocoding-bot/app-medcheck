-- ============================================================
-- PART 2: FUNCTIONS, TRIGGERS, RPCs
-- ============================================================

-- Trigger function: validate is_correct server-side
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
  SELECT options INTO opts FROM public.clinical_questions WHERE id = NEW.question_id;
  IF opts IS NULL THEN RAISE EXCEPTION 'Question not found'; END IF;
  correct_option := NULL;
  FOR i IN 0..jsonb_array_length(opts) - 1 LOOP
    opt := opts->i;
    IF (opt->>'is_correct')::boolean = true THEN
      correct_option := i;
      EXIT;
    END IF;
  END LOOP;
  IF correct_option IS NULL THEN RAISE EXCEPTION 'No correct option found for question'; END IF;
  NEW.is_correct := (NEW.selected_option = correct_option);
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_validate_answer ON public.user_answers;
CREATE TRIGGER trg_validate_answer
  BEFORE INSERT ON public.user_answers
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_answer_correctness();

-- Auto-update user_stats on answer insert
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
  INSERT INTO public.user_stats (user_id) VALUES (NEW.user_id) ON CONFLICT (user_id) DO NOTHING;
  SELECT * INTO current_stats FROM public.user_stats WHERE user_id = NEW.user_id;
  new_streak := COALESCE(current_stats.streak, 0);
  IF current_stats.last_active_date = yesterday THEN
    new_streak := new_streak + 1;
  ELSIF current_stats.last_active_date IS DISTINCT FROM today THEN
    new_streak := 1;
  END IF;
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

-- RPC: get_clinical_questions (without is_correct)
CREATE OR REPLACE FUNCTION public.get_clinical_questions()
RETURNS TABLE (
  id uuid, theme text, scenario text, question text, difficulty text,
  explanation text, display_order integer, created_at timestamptz, options jsonb
)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path TO 'public'
AS $$
  SELECT id, theme, scenario, question, difficulty, explanation, display_order, created_at,
    (SELECT jsonb_agg(jsonb_build_object('text', elem->>'text') ORDER BY ord)
     FROM jsonb_array_elements(options) WITH ORDINALITY AS t(elem, ord)) AS options
  FROM public.clinical_questions
  ORDER BY display_order ASC NULLS LAST;
$$;

-- RPC: submit_answer
CREATE OR REPLACE FUNCTION public.submit_answer(p_question_id uuid, p_selected_option integer)
RETURNS jsonb
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
DECLARE
  v_correct_option integer;
  v_opts jsonb;
  v_is_correct boolean;
  v_explanation text;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT options, explanation INTO v_opts, v_explanation FROM public.clinical_questions WHERE id = p_question_id;
  IF v_opts IS NULL THEN RAISE EXCEPTION 'Question not found'; END IF;
  v_correct_option := NULL;
  FOR i IN 0..jsonb_array_length(v_opts) - 1 LOOP
    IF (v_opts->i->>'is_correct')::boolean = true THEN
      v_correct_option := i; EXIT;
    END IF;
  END LOOP;
  v_is_correct := (p_selected_option = v_correct_option);
  INSERT INTO public.user_answers (user_id, question_id, selected_option, is_correct)
  VALUES (auth.uid(), p_question_id, p_selected_option, v_is_correct);
  RETURN jsonb_build_object('is_correct', v_is_correct, 'correct_option', v_correct_option, 'explanation', v_explanation);
END;
$$;

-- RPC: reset_user_stats
CREATE OR REPLACE FUNCTION public.reset_user_stats(p_reset_type text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  IF p_reset_type = 'xp' THEN
    UPDATE public.user_stats SET xp = 0, clinical_level = 'interno', updated_at = now() WHERE user_id = auth.uid();
  ELSIF p_reset_type = 'streak' THEN
    UPDATE public.user_stats SET streak = 0, updated_at = now() WHERE user_id = auth.uid();
  ELSIF p_reset_type = 'accuracy' THEN
    DELETE FROM public.user_answers WHERE user_id = auth.uid();
    UPDATE public.user_stats SET questions_answered = 0, questions_correct = 0, enamed_score = 0, updated_at = now() WHERE user_id = auth.uid();
  ELSIF p_reset_type = 'score' THEN
    UPDATE public.user_stats SET enamed_score = 0, updated_at = now() WHERE user_id = auth.uid();
  ELSIF p_reset_type = 'all' THEN
    DELETE FROM public.user_answers WHERE user_id = auth.uid();
    UPDATE public.user_stats SET xp = 0, streak = 0, questions_answered = 0, questions_correct = 0, enamed_score = 0, clinical_level = 'interno', last_active_date = NULL, updated_at = now() WHERE user_id = auth.uid();
  ELSE
    RAISE EXCEPTION 'Invalid reset type: %', p_reset_type;
  END IF;
END;
$$;

-- RPC: get_simulado_questions (without is_correct)
CREATE OR REPLACE FUNCTION public.get_simulado_questions(p_level INTEGER)
RETURNS TABLE(id UUID, level INTEGER, theme TEXT, scenario TEXT, question TEXT, difficulty TEXT, explanation TEXT, display_order INTEGER, options JSONB)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT id, level, theme, scenario, question, difficulty, explanation, display_order,
    (SELECT jsonb_agg(jsonb_build_object('text', elem->>'text') ORDER BY ord)
     FROM jsonb_array_elements(options) WITH ORDINALITY AS t(elem, ord)) AS options
  FROM public.simulado_questions
  WHERE level = p_level
  ORDER BY display_order ASC NULLS LAST;
$$;

-- RPC: submit_simulado_answer
CREATE OR REPLACE FUNCTION public.submit_simulado_answer(p_session_id UUID, p_question_id UUID, p_selected_option INTEGER)
RETURNS JSONB
LANGUAGE plpgsql SECURITY DEFINER SET search_path = 'public'
AS $$
DECLARE
  v_correct_option INTEGER;
  v_opts JSONB;
  v_is_correct BOOLEAN;
  v_explanation TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Not authenticated'; END IF;
  SELECT options, explanation INTO v_opts, v_explanation FROM public.simulado_questions WHERE id = p_question_id;
  IF v_opts IS NULL THEN RAISE EXCEPTION 'Question not found'; END IF;
  v_correct_option := NULL;
  FOR i IN 0..jsonb_array_length(v_opts) - 1 LOOP
    IF (v_opts->i->>'is_correct')::boolean = true THEN
      v_correct_option := i; EXIT;
    END IF;
  END LOOP;
  v_is_correct := (p_selected_option = v_correct_option);
  INSERT INTO public.simulado_answers (session_id, question_id, user_id, selected_option, is_correct)
  VALUES (p_session_id, p_question_id, auth.uid(), p_selected_option, v_is_correct);
  UPDATE public.simulado_sessions SET
    total_questions = total_questions + 1,
    correct_answers = correct_answers + (CASE WHEN v_is_correct THEN 1 ELSE 0 END)
  WHERE id = p_session_id AND user_id = auth.uid();
  RETURN jsonb_build_object('is_correct', v_is_correct, 'correct_option', v_correct_option, 'explanation', v_explanation);
END;
$$;

-- RPC: get_simulado_ranking
CREATE OR REPLACE FUNCTION public.get_simulado_ranking(p_level INTEGER)
RETURNS TABLE(user_id UUID, full_name TEXT, best_score NUMERIC, best_time INTEGER, attempts BIGINT)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = 'public'
AS $$
  SELECT 
    s.user_id,
    COALESCE(p.full_name, 'Anônimo') AS full_name,
    MAX(CASE WHEN s.total_questions > 0 THEN ROUND((s.correct_answers::numeric / s.total_questions) * 100, 1) ELSE 0 END) AS best_score,
    MIN(s.time_seconds) AS best_time,
    COUNT(*) AS attempts
  FROM public.simulado_sessions s
  LEFT JOIN public.profiles p ON p.id = s.user_id
  WHERE s.level = p_level AND s.is_completed = true
  GROUP BY s.user_id, p.full_name
  ORDER BY best_score DESC, best_time ASC
  LIMIT 50;
$$;

-- RPC: get_daily_challenge
CREATE OR REPLACE FUNCTION public.get_daily_challenge()
RETURNS TABLE(id uuid, theme text, scenario text, question text, difficulty text, explanation text, display_order integer, created_at timestamptz, options jsonb)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  WITH numbered AS (
    SELECT cq.id, cq.theme, cq.scenario, cq.question, cq.difficulty, cq.explanation, cq.display_order, cq.created_at,
      (SELECT jsonb_agg(jsonb_build_object('text', elem->>'text') ORDER BY ord)
       FROM jsonb_array_elements(cq.options) WITH ORDINALITY AS t(elem, ord)) AS options,
      ROW_NUMBER() OVER (ORDER BY cq.id) - 1 AS rn,
      COUNT(*) OVER () AS total
    FROM public.clinical_questions cq
  )
  SELECT n.id, n.theme, n.scenario, n.question, n.difficulty, n.explanation, n.display_order, n.created_at, n.options
  FROM numbered n
  WHERE n.rn = (
    (EXTRACT(DOY FROM CURRENT_DATE)::int + EXTRACT(YEAR FROM CURRENT_DATE)::int) % n.total
  )
  LIMIT 1;
$$;

-- RPC: get_spaced_repetition_questions
CREATE OR REPLACE FUNCTION public.get_spaced_repetition_questions(_user_id uuid)
RETURNS TABLE(id uuid, theme text, scenario text, question text, difficulty text, explanation text, display_order integer, created_at timestamptz, options jsonb)
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT cq.id, cq.theme, cq.scenario, cq.question, cq.difficulty, cq.explanation, cq.display_order, cq.created_at,
    (SELECT jsonb_agg(jsonb_build_object('text', elem->>'text') ORDER BY ord)
     FROM jsonb_array_elements(cq.options) WITH ORDINALITY AS t(elem, ord)) AS options
  FROM public.clinical_questions cq
  WHERE cq.id IN (
    SELECT ua.question_id FROM public.user_answers ua
    WHERE ua.user_id = _user_id AND ua.is_correct = false
    GROUP BY ua.question_id
    HAVING NOT bool_or(ua.is_correct)
  )
  ORDER BY (SELECT MAX(ua2.answered_at) FROM public.user_answers ua2 WHERE ua2.question_id = cq.id AND ua2.user_id = _user_id) ASC
  LIMIT 10;
$$;
