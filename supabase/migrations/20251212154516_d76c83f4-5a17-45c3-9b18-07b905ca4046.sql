-- Create profiles table for username-based login
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  username TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create reports table matching Google Sheet structure
CREATE TABLE public.reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  username TEXT NOT NULL,
  report_code TEXT NOT NULL,
  report_date DATE NOT NULL,
  team TEXT,
  installer_1 TEXT,
  installer_2 TEXT,
  installer_3 TEXT,
  installer_4 TEXT,
  -- Installation section
  install_address TEXT,
  install_payment_method TEXT,
  install_amount NUMERIC DEFAULT 0,
  install_notes TEXT,
  install_material_open INTEGER DEFAULT 0,
  install_material_replenish INTEGER DEFAULT 0,
  measure_colleague TEXT,
  install_doors INTEGER DEFAULT 0,
  install_windows INTEGER DEFAULT 0,
  install_aluminum INTEGER DEFAULT 0,
  install_old_removed INTEGER DEFAULT 0,
  -- Order section
  order_address TEXT,
  order_payment_method TEXT,
  order_amount NUMERIC DEFAULT 0,
  order_data_type TEXT,
  order_material_open INTEGER DEFAULT 0,
  order_material_replenish INTEGER DEFAULT 0,
  order_reorder INTEGER DEFAULT 0,
  order_measure_colleague TEXT,
  order_reorder_location TEXT,
  order_notes TEXT,
  responsibility_option TEXT,
  urgency TEXT,
  install_difficulty TEXT,
  order_install_doors INTEGER DEFAULT 0,
  order_install_windows INTEGER DEFAULT 0,
  order_install_aluminum INTEGER DEFAULT 0,
  order_old_removed INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- Enable RLS on reports
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- RLS policies for reports - users can only see/edit their own reports
CREATE POLICY "Users can view their own reports"
  ON public.reports FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own reports"
  ON public.reports FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own reports"
  ON public.reports FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own reports"
  ON public.reports FOR DELETE
  USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
  BEFORE UPDATE ON public.reports
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();