-- Migration: Consolidate Lists System (Simplified)
-- This migration updates the existing database to match our consolidated system

-- Step 1: Rename has_initialized_base_lists to has_initialized_lists
ALTER TABLE users RENAME COLUMN has_initialized_base_lists TO has_initialized_lists;

-- Step 2: Remove is_sample and is_default columns from existing tables (if they exist)
ALTER TABLE lists DROP COLUMN IF EXISTS is_sample;
ALTER TABLE lists DROP COLUMN IF EXISTS is_default;
ALTER TABLE tip_lists DROP COLUMN IF EXISTS is_sample;
ALTER TABLE packing_lists DROP COLUMN IF EXISTS is_sample;

-- Step 3: Remove is_default from list_types (if it exists)
ALTER TABLE list_types DROP COLUMN IF EXISTS is_default;

-- Step 4: Update RLS policies for tip_lists to ensure proper user ownership
-- Drop old policies that might exist
DROP POLICY IF EXISTS "Public can view tip lists" ON tip_lists;
DROP POLICY IF EXISTS "Auth users can create tip lists" ON tip_lists;

-- Create proper user-owned policies for tip_lists
CREATE POLICY "Users can view own tip lists" ON tip_lists FOR SELECT USING (auth.uid() = owner_id);
CREATE POLICY "Users can create own tip lists" ON tip_lists FOR INSERT WITH CHECK (auth.uid() = owner_id);
CREATE POLICY "Users can update own tip lists" ON tip_lists FOR UPDATE USING (auth.uid() = owner_id);
CREATE POLICY "Users can delete own tip lists" ON tip_lists FOR DELETE USING (auth.uid() = owner_id);

-- Step 5: Update list_types policies (if the old policy exists)
DROP POLICY IF EXISTS "Public can view default list types" ON list_types;
CREATE POLICY "Users can view list types" ON list_types FOR SELECT USING (true);

-- Migration complete
-- The system is now consolidated to use only the 'lists' table for all user lists 