-- Jalpaiguri Connect - Supabase PostgreSQL Schema
-- Run this in your Supabase SQL Editor to set up all tables and security policies

-- 1. Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  phone TEXT,
  email TEXT,
  age INTEGER,
  gender TEXT,
  blood_group TEXT,
  location TEXT,
  role TEXT DEFAULT 'citizen',
  coordinates JSONB,
  avatar_url TEXT,
  is_volunteer BOOLEAN DEFAULT FALSE,
  is_blood_donor BOOLEAN DEFAULT FALSE,
  language TEXT DEFAULT 'English',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Civic Reports Table
CREATE TABLE IF NOT EXISTS public.civic_reports (
  id TEXT PRIMARY KEY,
  category TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT NOT NULL,
  photo_url TEXT,
  status TEXT DEFAULT 'Submitted',
  upvotes INTEGER DEFAULT 1,
  reporter_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reporter_name TEXT,
  ward TEXT,
  timeline JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Local Trade Workers Table
CREATE TABLE IF NOT EXISTS public.workers (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  profession TEXT NOT NULL,
  category TEXT NOT NULL,
  rating NUMERIC(2,1) DEFAULT 5.0,
  review_count INTEGER DEFAULT 1,
  distance TEXT DEFAULT '1.0 km',
  availability TEXT DEFAULT 'Available Now',
  starting_price TEXT,
  avatar_url TEXT,
  phone TEXT NOT NULL,
  verified BOOLEAN DEFAULT FALSE,
  experience TEXT,
  location TEXT NOT NULL,
  skills TEXT[],
  bio TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Service Requests / Bookings Table
CREATE TABLE IF NOT EXISTS public.service_requests (
  id TEXT PRIMARY KEY,
  worker_id TEXT REFERENCES public.workers(id) ON DELETE CASCADE,
  worker_name TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  user_name TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  service_category TEXT NOT NULL,
  description TEXT NOT NULL,
  location TEXT NOT NULL,
  preferred_date TEXT,
  preferred_time TEXT,
  status TEXT DEFAULT 'Submitted',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Blood Donors Table
CREATE TABLE IF NOT EXISTS public.blood_donors (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  location TEXT NOT NULL,
  distance TEXT DEFAULT '1.2 km',
  phone TEXT NOT NULL,
  last_donated TEXT DEFAULT 'Never',
  donations_count INTEGER DEFAULT 0,
  verified BOOLEAN DEFAULT TRUE,
  available BOOLEAN DEFAULT TRUE,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. Urgent Blood Requests Table
CREATE TABLE IF NOT EXISTS public.blood_requests (
  id TEXT PRIMARY KEY,
  patient_name TEXT NOT NULL,
  blood_group TEXT NOT NULL,
  hospital TEXT NOT NULL,
  units INTEGER DEFAULT 1,
  needed_by TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  status TEXT DEFAULT 'Urgent',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Community Emergency & Civic Alerts Table
CREATE TABLE IF NOT EXISTS public.emergency_alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  type TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  severity TEXT DEFAULT 'Medium',
  confirmed_count INTEGER DEFAULT 1,
  coordinates JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Lost & Found Items Table
CREATE TABLE IF NOT EXISTS public.lost_found_items (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('Lost', 'Found')),
  title TEXT NOT NULL,
  area TEXT NOT NULL,
  contact TEXT NOT NULL,
  reward TEXT,
  status TEXT DEFAULT 'Open',
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.civic_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.service_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_donors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blood_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.emergency_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lost_found_items ENABLE ROW LEVEL SECURITY;

-- Public Read Policies
CREATE POLICY "Public read profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Public read civic reports" ON public.civic_reports FOR SELECT USING (true);
CREATE POLICY "Anyone can insert civic reports" ON public.civic_reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update civic reports" ON public.civic_reports FOR UPDATE USING (true);

CREATE POLICY "Public read workers" ON public.workers FOR SELECT USING (true);
CREATE POLICY "Anyone can register worker" ON public.workers FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read blood donors" ON public.blood_donors FOR SELECT USING (true);
CREATE POLICY "Anyone can register blood donor" ON public.blood_donors FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read blood requests" ON public.blood_requests FOR SELECT USING (true);
CREATE POLICY "Anyone can insert blood requests" ON public.blood_requests FOR INSERT WITH CHECK (true);

CREATE POLICY "Public read alerts" ON public.emergency_alerts FOR SELECT USING (true);
CREATE POLICY "Anyone can insert alerts" ON public.emergency_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update alert confirmations" ON public.emergency_alerts FOR UPDATE USING (true);

CREATE POLICY "Public read lost found" ON public.lost_found_items FOR SELECT USING (true);
CREATE POLICY "Anyone can insert lost found" ON public.lost_found_items FOR INSERT WITH CHECK (true);
