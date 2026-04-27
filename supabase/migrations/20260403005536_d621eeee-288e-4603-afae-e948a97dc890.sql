
-- ============================================================
-- 1. SECURITY: Restrict clinical_questions direct SELECT to admins only
-- ============================================================
DROP POLICY IF EXISTS "Anyone can read questions" ON public.clinical_questions;

-- 2. Create RPC to fetch questions WITHOUT is_correct (prevents cheating)
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

-- 3. Create RPC to submit answers server-side (returns correctness)
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
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT options, explanation INTO v_opts, v_explanation
  FROM public.clinical_questions WHERE id = p_question_id;

  IF v_opts IS NULL THEN
    RAISE EXCEPTION 'Question not found';
  END IF;

  v_correct_option := NULL;
  FOR i IN 0..jsonb_array_length(v_opts) - 1 LOOP
    IF (v_opts->i->>'is_correct')::boolean = true THEN
      v_correct_option := i;
      EXIT;
    END IF;
  END LOOP;

  v_is_correct := (p_selected_option = v_correct_option);

  INSERT INTO public.user_answers (user_id, question_id, selected_option, is_correct)
  VALUES (auth.uid(), p_question_id, p_selected_option, v_is_correct);

  RETURN jsonb_build_object(
    'is_correct', v_is_correct,
    'correct_option', v_correct_option,
    'explanation', v_explanation
  );
END;
$$;

-- 4. Create RPC for resetting stats (replaces direct UPDATE)
CREATE OR REPLACE FUNCTION public.reset_user_stats(p_reset_type text)
RETURNS void
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

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

-- 5. Remove direct UPDATE policy from user_stats (triggers/RPCs handle updates)
DROP POLICY IF EXISTS "Users can update their own stats" ON public.user_stats;

-- 6. Tighten profiles policies to authenticated role only
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT TO authenticated USING (auth.uid() = id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- 7. Explicit admin-only policies on user_roles to prevent privilege escalation
CREATE POLICY "Only admins can insert roles" ON public.user_roles FOR INSERT TO authenticated WITH CHECK (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can update roles" ON public.user_roles FOR UPDATE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Only admins can delete roles" ON public.user_roles FOR DELETE TO authenticated USING (has_role(auth.uid(), 'admin'::app_role));
