-- Run this in your Supabase SQL Editor to create the ratings table

CREATE TABLE public.ratings (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  created_at timestamp with time zone DEFAULT now(),
  device_id text,
  ip_address text,
  CONSTRAINT ratings_pkey PRIMARY KEY (id)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anonymous inserts so public users can rate
CREATE POLICY "Allow anonymous insert access" 
ON public.ratings 
FOR INSERT 
TO anon 
WITH CHECK (true);
