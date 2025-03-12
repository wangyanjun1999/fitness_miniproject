/*
  # Initial Schema Setup for Fitness Assistant

  1. Tables
    - profiles (extends auth.users)
      - id (uuid, references auth.users)
      - username (text, unique)
      - height (float)
      - weight (float)
      - goal (text, enum)
      - created_at (timestamp)
    
    - exercises
      - id (serial)
      - name (text, unique)
      - type (text, enum)
      - calories_per_unit (float)
      - created_at (timestamp)
    
    - plans
      - id (serial)
      - user_id (uuid, references profiles)
      - date (date)
      - exercise_id (int, references exercises)
      - sets (int)
      - reps (int)
      - completed (boolean)
      - created_at (timestamp)

  2. Security
    - Enable RLS on all tables
    - Add policies for authenticated users
*/

-- Create profiles table
CREATE TABLE profiles (
  id UUID REFERENCES auth.users PRIMARY KEY,
  username TEXT UNIQUE NOT NULL,
  height FLOAT,
  weight FLOAT,
  goal TEXT CHECK (goal IN ('increase', 'decrease', 'maintain')),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create exercises table
CREATE TABLE exercises (
  id SERIAL PRIMARY KEY,
  name TEXT UNIQUE NOT NULL,
  type TEXT CHECK (type IN ('strength', 'cardio')) NOT NULL,
  calories_per_unit FLOAT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create plans table
CREATE TABLE plans (
  id SERIAL PRIMARY KEY,
  user_id UUID REFERENCES profiles(id) NOT NULL,
  date DATE NOT NULL,
  exercise_id INTEGER REFERENCES exercises(id) NOT NULL,
  sets INTEGER NOT NULL,
  reps INTEGER NOT NULL,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Everyone can read exercises"
  ON exercises FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can read own plans"
  ON plans FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own plans"
  ON plans FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own plans"
  ON plans FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own plans"
  ON plans FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);