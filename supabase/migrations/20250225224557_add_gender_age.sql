/*
  Add gender and age fields to profiles table
  
  Changes:
  1. Add gender field (enum: 'male', 'female', 'other')
  2. Add age field (integer with validation)
  3. Add check constraint to ensure age is reasonable
*/

-- Ensure table exists
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE,
  updated_at TIMESTAMP WITH TIME ZONE,
  username TEXT UNIQUE,
  full_name TEXT,
  avatar_url TEXT,
  PRIMARY KEY (id)
);

-- Add new columns if they don't exist
DO $$ 
BEGIN
    -- Add gender column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'gender'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN gender TEXT CHECK (gender IN ('male', 'female', 'other'));
    END IF;

    -- Add age column if it doesn't exist
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'profiles' 
        AND column_name = 'age'
    ) THEN
        ALTER TABLE profiles
        ADD COLUMN age INTEGER CHECK (age >= 0 AND age <= 150);
    END IF;
END $$;

-- Add comments for documentation
COMMENT ON COLUMN profiles.gender IS 'User''s gender (male, female, or other)';
COMMENT ON COLUMN profiles.age IS 'User''s age in years';

-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;

-- Create new policy
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);