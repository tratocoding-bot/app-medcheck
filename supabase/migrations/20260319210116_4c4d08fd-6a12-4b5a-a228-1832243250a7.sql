
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  perfil TEXT CHECK (perfil IN ('concluinte', 'medico', '4ano')),
  crm TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own roles" ON public.user_roles FOR SELECT USING (auth.uid() = user_id);

-- Security definer function for role checks
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- Create checklist_progress table
CREATE TABLE public.checklist_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  item_id TEXT NOT NULL,
  checked BOOLEAN DEFAULT false,
  checked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, item_id)
);

ALTER TABLE public.checklist_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own progress" ON public.checklist_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own progress" ON public.checklist_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own progress" ON public.checklist_progress FOR UPDATE USING (auth.uid() = user_id);

-- Create checklist_notes table
CREATE TABLE public.checklist_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  section_id TEXT NOT NULL,
  content TEXT,
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, section_id)
);

ALTER TABLE public.checklist_notes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notes" ON public.checklist_notes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own notes" ON public.checklist_notes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own notes" ON public.checklist_notes FOR UPDATE USING (auth.uid() = user_id);

-- Create enamed_dates table (public read, admin write)
CREATE TABLE public.enamed_dates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_name TEXT NOT NULL,
  event_date TEXT NOT NULL,
  status TEXT CHECK (status IN ('confirmed', 'pending', 'done')),
  is_critical BOOLEAN DEFAULT false,
  display_order INT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.enamed_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read dates" ON public.enamed_dates FOR SELECT USING (true);
CREATE POLICY "Admins can insert dates" ON public.enamed_dates FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update dates" ON public.enamed_dates FOR UPDATE USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete dates" ON public.enamed_dates FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Create app_config table (public read, admin write)
CREATE TABLE public.app_config (
  key TEXT PRIMARY KEY,
  value TEXT,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.app_config ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read config" ON public.app_config FOR SELECT USING (true);
CREATE POLICY "Admins can manage config" ON public.app_config FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create trigger function for profile creation on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (NEW.id, NEW.raw_user_meta_data->>'full_name');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert default enamed_dates
INSERT INTO public.enamed_dates (event_name, event_date, status, is_critical, display_order) VALUES
  ('Publicação do Edital e início das inscrições', '~Jul 2026', 'pending', true, 1),
  ('Prazo final de inscrição', '~Ago 2026', 'pending', true, 2),
  ('Prazo para pagamento da taxa (R$330)', '~Ago 2026', 'pending', false, 3),
  ('Período de atendimento especial', '~Ago 2026', 'pending', false, 4),
  ('Cartão de Confirmação disponível', '~Set 2026', 'pending', false, 5),
  ('DIA DA PROVA - ENAMED 2026', '13/09/2026', 'confirmed', true, 6),
  ('Divulgação dos resultados individuais', '~Nov 2026', 'pending', false, 7),
  ('Processo de recursos', '~Nov 2026', 'pending', false, 8);
