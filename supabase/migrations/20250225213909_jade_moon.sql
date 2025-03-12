/*
  # Update profiles table policies

  1. Changes
    - Add policy to allow users to insert their own profile during registration
    
  2. Security
    - Maintains existing RLS policies
    - Adds new policy for profile creation
    - Ensures users can only create their own profile
*/

-- Add policy for profile creation during registration
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);