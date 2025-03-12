/*
  # Add media information to exercises table

  1. Schema Changes
    - Add new columns to exercises table:
      - demonstration_photos (text array): URLs to demonstration photos
      - description (text): Detailed exercise description
      - video (text): URL to tutorial video

  2. Data Updates
    - Add sample media information for existing exercises
*/

-- Add new columns
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS demonstration_photos TEXT[],
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS video TEXT;

-- Update existing exercises with sample data
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=800',
    'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
  ],
  description = 'A compound exercise that targets multiple muscle groups including the chest, shoulders, and triceps. Start in a plank position with hands slightly wider than shoulder-width apart.',
  video = 'https://www.youtube.com/watch?v=IODxDxX7oi4'
WHERE name = 'Push-ups';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a34?w=800',
    'https://images.unsplash.com/photo-1598971639058-fab3c3109a35?w=800'
  ],
  description = 'A challenging bodyweight exercise that works your back, biceps, and core. Grip the bar with hands slightly wider than shoulder-width and pull your body up until your chin clears the bar.',
  video = 'https://www.youtube.com/watch?v=eGo4IYlbE5g'
WHERE name = 'Pull-ups';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2156?w=800'
  ],
  description = 'A fundamental lower body exercise that targets your quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart and lower your body as if sitting back into a chair.',
  video = 'https://www.youtube.com/watch?v=aclHkVaku9U'
WHERE name = 'Squats';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3439?w=800'
  ],
  description = 'A compound exercise that primarily targets your posterior chain. Keep your back straight and hinge at the hips while keeping the bar close to your legs.',
  video = 'https://www.youtube.com/watch?v=op9kVnSso6Q'
WHERE name = 'Deadlifts';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe62?w=800'
  ],
  description = 'A cardio exercise that improves coordination and burns calories. Keep your elbows close to your sides and jump with both feet, rotating the rope with your wrists.',
  video = 'https://www.youtube.com/watch?v=FJmRQ5iTXKE'
WHERE name = 'Jump Rope';

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_type_name ON exercises(type, name);