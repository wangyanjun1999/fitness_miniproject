/*
  # Add training preferences validation

  1. Changes
    - Add constraint to validate training_preferences JSON structure
    - Ensures training preferences contain required fields and valid values
    
  2. Validation Rules
    - Must have difficulty, focus_areas, and time_per_session fields
    - difficulty must be 'easy', 'medium', or 'hard'
    - focus_areas must be an array
    - time_per_session must be between 30 and 90 minutes
*/

-- Add check constraint to validate training_preferences structure
DO $$ 
BEGIN
  -- Only add constraint if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.table_constraints 
    WHERE constraint_name = 'valid_training_preferences'
    AND table_name = 'profiles'
  ) THEN
    ALTER TABLE profiles
    ADD CONSTRAINT valid_training_preferences
    CHECK (
      training_preferences IS NULL OR (
        training_preferences ? 'difficulty' AND
        training_preferences ? 'focus_areas' AND
        training_preferences ? 'time_per_session' AND
        (training_preferences->>'difficulty' IN ('easy', 'medium', 'hard')) AND
        jsonb_typeof(training_preferences->'focus_areas') = 'array' AND
        (training_preferences->>'time_per_session')::int BETWEEN 30 AND 90
      )
    );
  END IF;
END $$;