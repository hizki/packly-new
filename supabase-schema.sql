-- Packly Database Schema for Supabase
-- Run this in Supabase SQL Editor to set up the database

-- Enable RLS
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon, authenticated;

-- Users profile table (extends auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  has_initialized_base_lists BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- Base Lists table
CREATE TABLE base_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL, -- 'activity', 'accommodation', 'companion'
  category TEXT NOT NULL, -- 'camping', 'beach', 'hotel', etc.
  items JSONB NOT NULL DEFAULT '[]',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  owner_id UUID REFERENCES auth.users(id),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Tip Lists table  
CREATE TABLE tip_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL, -- 'day_before', 'before_leaving'
  tips JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Custom Lists table
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL,
  category TEXT,
  name TEXT,
  icon TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  is_default BOOLEAN DEFAULT false,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Packing Lists table
CREATE TABLE packing_lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  destinations JSONB NOT NULL DEFAULT '[]',
  activities JSONB NOT NULL DEFAULT '[]',
  accommodation TEXT,
  companions JSONB NOT NULL DEFAULT '[]',
  amenities JSONB NOT NULL DEFAULT '[]',
  is_favorite BOOLEAN DEFAULT false,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT,
  is_sample BOOLEAN DEFAULT false
);

-- Enable Row Level Security
ALTER TABLE base_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- Base lists: Public read, auth users can create
CREATE POLICY "Public can view base lists" ON base_lists FOR SELECT USING (true);
CREATE POLICY "Auth users can create base lists" ON base_lists FOR INSERT WITH CHECK (auth.uid() = created_by_id);

-- Tip lists: Public read, auth users can create  
CREATE POLICY "Public can view tip lists" ON tip_lists FOR SELECT USING (true);
CREATE POLICY "Auth users can create tip lists" ON tip_lists FOR INSERT WITH CHECK (auth.uid() = created_by_id);

-- Lists: Users can only access their own
CREATE POLICY "Users can view own lists" ON lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own lists" ON lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own lists" ON lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own lists" ON lists FOR DELETE USING (auth.uid() = owner_id);

-- Packing lists: Users can only access their own
CREATE POLICY "Users can view own packing lists" ON packing_lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own packing lists" ON packing_lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own packing lists" ON packing_lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own packing lists" ON packing_lists FOR DELETE USING (auth.uid() = owner_id); 