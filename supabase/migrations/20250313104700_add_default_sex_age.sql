BEGIN;

-- Add columns if they don't exist
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

-- Set default values for existing records
UPDATE profiles 
SET gender = 'other',
    age = 0
WHERE gender IS NULL OR age IS NULL;

-- Add NOT NULL constraints and default values
ALTER TABLE profiles
ALTER COLUMN gender SET NOT NULL,
ALTER COLUMN gender SET DEFAULT 'other',
ALTER COLUMN age SET NOT NULL,
ALTER COLUMN age SET DEFAULT 0;

-- Add comments for documentation
COMMENT ON COLUMN profiles.gender IS 'User''s gender (male, female, or other)';
COMMENT ON COLUMN profiles.age IS 'User''s age in years';

COMMIT;