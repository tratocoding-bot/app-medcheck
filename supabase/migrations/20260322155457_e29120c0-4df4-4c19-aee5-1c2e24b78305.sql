
-- Clinical questions table
CREATE TABLE public.clinical_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  theme text NOT NULL,
  scenario text NOT NULL,
  question text NOT NULL,
  options jsonb NOT NULL,
  explanation text,
  difficulty text DEFAULT 'intermediario',
  display_order int,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE public.clinical_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions" ON public.clinical_questions FOR SELECT USING (true);
CREATE POLICY "Admins can manage questions" ON public.clinical_questions FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- User answers table
CREATE TABLE public.user_answers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  question_id uuid REFERENCES public.clinical_questions(id) ON DELETE CASCADE NOT NULL,
  selected_option int NOT NULL,
  is_correct boolean NOT NULL,
  answered_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_answers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own answers" ON public.user_answers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can view their own answers" ON public.user_answers FOR SELECT USING (auth.uid() = user_id);

-- User stats table
CREATE TABLE public.user_stats (
  user_id uuid PRIMARY KEY,
  xp int DEFAULT 0,
  streak int DEFAULT 0,
  last_active_date date,
  enamed_score int DEFAULT 0,
  clinical_level text DEFAULT 'interno',
  questions_answered int DEFAULT 0,
  questions_correct int DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.user_stats ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own stats" ON public.user_stats FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own stats" ON public.user_stats FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own stats" ON public.user_stats FOR UPDATE USING (auth.uid() = user_id);
