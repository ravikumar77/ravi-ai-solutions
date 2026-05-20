
-- Roles
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public
AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role)
$$;

CREATE POLICY "Users view own roles" ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins manage roles" ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- Services
CREATE TABLE public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  icon TEXT,
  price TEXT,
  sort_order INT NOT NULL DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone views active services" ON public.services FOR SELECT
  USING (is_active = true OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins insert services" ON public.services FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update services" ON public.services FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete services" ON public.services FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Leads
CREATE TABLE public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  help_with TEXT,
  goal TEXT,
  stage TEXT,
  needs TEXT,
  best_time TEXT,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can submit a lead" ON public.leads FOR INSERT
  WITH CHECK (true);
CREATE POLICY "Admins view leads" ON public.leads FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update leads" ON public.leads FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete leads" ON public.leads FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Updated_at trigger for services
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END;
$$;
CREATE TRIGGER services_updated_at BEFORE UPDATE ON public.services
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Seeds
INSERT INTO public.services (title, description, icon, price, sort_order) VALUES
('n8n Workflow Audit & Setup', 'A deep audit of your current operations followed by a fully configured n8n environment with production-ready workflows tailored to your business.', 'Workflow', 'From $1,499', 1),
('Custom OpenClaw & AI Agent Integration', 'Design and deployment of bespoke AI agents using OpenClaw and the latest LLMs — integrated directly into your stack to automate decision-making.', 'Bot', 'From $2,499', 2),
('Full-Stack Automation Architecture', 'End-to-end architecture for autonomous businesses: APIs, databases, AI agents, and orchestration layers built to scale.', 'Cpu', 'From $4,999', 3);
