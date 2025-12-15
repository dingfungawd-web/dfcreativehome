-- Add JSON columns to store multiple cases
ALTER TABLE public.reports 
ADD COLUMN IF NOT EXISTS completed_cases JSONB DEFAULT '[]'::jsonb,
ADD COLUMN IF NOT EXISTS follow_up_cases JSONB DEFAULT '[]'::jsonb;