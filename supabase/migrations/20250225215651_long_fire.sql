/*
  # Add Exercise Data and Indexes

  1. Data Population
    - Add initial exercise data to the exercises table
    - Common strength and cardio exercises with calorie information
  
  2. Additional Indexes
    - Add index on plans(date) for faster date-based queries
    - Add index on plans(user_id, date) for user-specific date queries
*/

-- Add initial exercises
DO $$
BEGIN
  -- Strength exercises (calories per set)
  INSERT INTO exercises (name, type, calories_per_unit)
  VALUES
    ('Push-ups', 'strength', 7),
    ('Pull-ups', 'strength', 10),
    ('Squats', 'strength', 8),
    ('Deadlifts', 'strength', 12),
    ('Bench Press', 'strength', 10),
    ('Shoulder Press', 'strength', 8),
    ('Lunges', 'strength', 6),
    ('Dumbbell Rows', 'strength', 7),
    ('Plank', 'strength', 5),
    ('Bicep Curls', 'strength', 4)
  ON CONFLICT (name) DO NOTHING;

  -- Cardio exercises (calories per minute)
  INSERT INTO exercises (name, type, calories_per_unit)
  VALUES
    ('Running', 'cardio', 12),
    ('Cycling', 'cardio', 10),
    ('Swimming', 'cardio', 13),
    ('Jump Rope', 'cardio', 12),
    ('Burpees', 'cardio', 10),
    ('Mountain Climbers', 'cardio', 8),
    ('High Knees', 'cardio', 8),
    ('Jumping Jacks', 'cardio', 8)
  ON CONFLICT (name) DO NOTHING;
END $$;

-- Add useful indexes
CREATE INDEX IF NOT EXISTS idx_plans_date ON plans(date);
CREATE INDEX IF NOT EXISTS idx_plans_user_date ON plans(user_id, date);