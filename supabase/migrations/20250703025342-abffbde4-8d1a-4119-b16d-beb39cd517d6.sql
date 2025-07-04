
-- Create projects table with password protection
CREATE TABLE public.projects (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create entries table to store observation data
CREATE TABLE public.entries (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES public.projects(id) ON DELETE CASCADE NOT NULL,
  srno TEXT NOT NULL,
  part_name TEXT NOT NULL,
  op_number TEXT NOT NULL,
  observation TEXT NOT NULL,
  before_photo_url TEXT,
  after_photo_url TEXT,
  action_plan TEXT NOT NULL,
  responsibility TEXT NOT NULL,
  remarks TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.entries ENABLE ROW LEVEL SECURITY;

-- Create policies for projects (public access but password protected at app level)
CREATE POLICY "Anyone can view projects" 
  ON public.projects 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create projects" 
  ON public.projects 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update projects" 
  ON public.projects 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete projects" 
  ON public.projects 
  FOR DELETE 
  USING (true);

-- Create policies for entries
CREATE POLICY "Anyone can view entries" 
  ON public.entries 
  FOR SELECT 
  USING (true);

CREATE POLICY "Anyone can create entries" 
  ON public.entries 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "Anyone can update entries" 
  ON public.entries 
  FOR UPDATE 
  USING (true);

CREATE POLICY "Anyone can delete entries" 
  ON public.entries 
  FOR DELETE 
  USING (true);

-- Create storage bucket for images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('project-images', 'project-images', true);

-- Create storage policies
CREATE POLICY "Anyone can upload images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'project-images');

CREATE POLICY "Anyone can view images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'project-images');

CREATE POLICY "Anyone can delete images" 
  ON storage.objects 
  FOR DELETE 
  USING (bucket_id = 'project-images');
