
-- 1. Daily Challenge RPC: picks a deterministic question based on today's date
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

-- 2. Spaced Repetition RPC: returns questions the user got wrong, ordered by oldest answer
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
