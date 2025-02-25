/*
  # Add training preferences to profiles

  1. Changes
    - Add training_preferences JSONB column to profiles table
    - Add type validation for training_preferences structure
*/

-- Add training_preferences column
ALTER TABLE profiles
ADD COLUMN training_preferences JSONB;

-- Add check constraint to validate training_preferences structure
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