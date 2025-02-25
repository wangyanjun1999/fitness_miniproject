/*
  # Add category column to exercises table

  1. Changes
    - Add category column to exercises table
    - Add check constraint to ensure valid category values
*/

-- Add category column to exercises table
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS category TEXT CHECK (category IN ('strength', 'cardio'));

-- Update existing records to set category based on exercise_type
UPDATE exercises
SET category = 
  CASE 
    WHEN exercise_type = 'cardio' THEN 'cardio'
    ELSE 'strength'
  END
WHERE category IS NULL;

-- Make category column NOT NULL after setting default values
ALTER TABLE exercises
ALTER COLUMN category SET NOT NULL;