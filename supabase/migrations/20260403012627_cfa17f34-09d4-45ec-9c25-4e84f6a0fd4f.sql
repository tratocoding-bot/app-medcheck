
-- Simulado sessions table
CREATE TABLE public.simulado_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  total_questions INTEGER NOT NULL DEFAULT 0,
  correct_answers INTEGER NOT NULL DEFAULT 0,
  time_seconds INTEGER,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  is_completed BOOLEAN NOT NULL DEFAULT false
);

ALTER TABLE public.simulado_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own sessions" ON public.simulado_sessions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own sessions" ON public.simulado_sessions FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users can view their own sessions" ON public.simulado_sessions FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can view completed sessions for ranking" ON public.simulado_sessions FOR SELECT USING (is_completed = true);

-- Simulado questions table (separate from clinical_questions for isolation)
CREATE TABLE public.simulado_questions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  theme TEXT NOT NULL,
  scenario TEXT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL,
  difficulty TEXT DEFAULT 'dificil',
  explanation TEXT,
  display_order INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.simulado_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage simulado questions" ON public.simulado_questions FOR ALL USING (has_role(auth.uid(), 'admin'));

-- Simulado answers table
CREATE TABLE public.simulado_answers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES public.simulado_sessions(id) ON DELETE CASCADE NOT NULL,
  question_id UUID REFERENCES public.simulado_questions(id) NOT NULL,
  user_id UUID NOT NULL,
  selected_option INTEGER NOT NULL,
  is_correct BOOLEAN NOT NULL,
  answered_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

ALTER TABLE public.simulado_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own simulado answers" ON public.simulado_answers FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own simulado answers" ON public.simulado_answers FOR SELECT TO authenticated USING (auth.uid() = user_id);

-- RPC to get simulado questions (without is_correct)
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

-- RPC to submit simulado answer
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

  SELECT options, explanation INTO v_opts, v_explanation
  FROM public.simulado_questions WHERE id = p_question_id;

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

  -- Update session stats
  UPDATE public.simulado_sessions SET
    total_questions = total_questions + 1,
    correct_answers = correct_answers + (CASE WHEN v_is_correct THEN 1 ELSE 0 END)
  WHERE id = p_session_id AND user_id = auth.uid();

  RETURN jsonb_build_object('is_correct', v_is_correct, 'correct_option', v_correct_option, 'explanation', v_explanation);
END;
$$;

-- RPC for ranking (top scores per level)
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
