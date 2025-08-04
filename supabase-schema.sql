-- Packly Database Schema for Supabase
-- Run this in Supabase SQL Editor to set up the database

-- Enable RLS
ALTER DEFAULT PRIVILEGES GRANT ALL ON TABLES TO anon, authenticated;

-- Users profile table (extends auth.users)
CREATE TABLE users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT,
  full_name TEXT,
  has_initialized_lists BOOLEAN DEFAULT false,
  settings JSONB DEFAULT '{}',
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW()
);

-- List Types table - stores available list types/categories dynamically
CREATE TABLE list_types (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  type_group TEXT NOT NULL, -- 'activity', 'accommodation', 'companion'
  list_name TEXT NOT NULL, -- 'beach', 'camping', 'hotel', etc.
  display_name TEXT NOT NULL, -- 'Beach Trip', 'Camping', 'Hotel', etc.
  icon TEXT, -- emoji or icon identifier
  description TEXT,
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  UNIQUE(type_group, list_name)
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
  created_by TEXT
);

-- Lists table (consolidated from base_lists and lists)
CREATE TABLE lists (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  list_type TEXT NOT NULL,
  list_name TEXT,
  name TEXT,
  icon TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  owner_id UUID REFERENCES auth.users(id),
  created_date TIMESTAMPTZ DEFAULT NOW(),
  updated_date TIMESTAMPTZ DEFAULT NOW(),
  created_by_id UUID REFERENCES auth.users(id),
  created_by TEXT
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
  created_by TEXT
);

-- Enable Row Level Security
ALTER TABLE list_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE tip_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE packing_lists ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Users: Users can only access their own profile
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can create own profile" ON users FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

-- List types: Users can create and view list types
CREATE POLICY "Users can view list types" ON list_types FOR SELECT USING (true);
CREATE POLICY "Auth users can create list types" ON list_types FOR INSERT WITH CHECK (auth.uid() = created_by_id);
CREATE POLICY "Auth users can update own list types" ON list_types FOR UPDATE USING (auth.uid() = created_by_id);

-- Tip lists: Users can only access their own
CREATE POLICY "Users can view own tip lists" ON tip_lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own tip lists" ON tip_lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own tip lists" ON tip_lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own tip lists" ON tip_lists FOR DELETE USING (auth.uid() = owner_id);

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