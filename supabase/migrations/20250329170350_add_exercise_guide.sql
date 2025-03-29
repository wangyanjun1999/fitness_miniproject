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
    'https://images.unsplash.com/photo-1616803689943-5601631c7fec?w=800'
  ],
  description = 'A compound exercise that targets multiple muscle groups including the chest, shoulders, and triceps. Start in a plank position with hands slightly wider than shoulder-width apart.',
  video = 'https://www.youtube.com/watch?v=IODxDxX7oi4'
WHERE name = 'Push-ups';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1520334363269-c1b342d17261?w=800',
    'https://images.unsplash.com/photo-1598971475122-95a9004e2922?w=800'
  ],
  description = 'A challenging bodyweight exercise that works your back, biceps, and core. Grip the bar with hands slightly wider than shoulder-width and pull your body up until your chin clears the bar.',
  video = 'https://www.youtube.com/watch?v=eGo4IYlbE5g'
WHERE name = 'Pull-ups';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1536922246289-88c42f957773?w=800',
    'https://images.unsplash.com/photo-1612957824445-f0c090ff1af0?w=800'
  ],
  description = 'A fundamental lower body exercise that targets your quadriceps, hamstrings, and glutes. Stand with feet shoulder-width apart and lower your body as if sitting back into a chair.',
  video = 'https://www.youtube.com/watch?v=aclHkVaku9U'
WHERE name = 'Squats';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800',
    'https://images.unsplash.com/photo-1601106605547-7423365f86e0?w=800'
  ],
  description = 'A compound exercise that primarily targets your posterior chain. Keep your back straight and hinge at the hips while keeping the bar close to your legs.',
  video = 'https://www.youtube.com/watch?v=op9kVnSso6Q'
WHERE name = 'Deadlifts';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1603394595873-62d990afa49a?w=800',
    'https://images.unsplash.com/photo-1514994667787-b48ca37155f0?w=800'
  ],
  description = 'A cardio exercise that improves coordination and burns calories. Keep your elbows close to your sides and jump with both feet, rotating the rope with your wrists.',
  video = 'https://www.youtube.com/watch?v=FJmRQ5iTXKE'
WHERE name = 'Jump Rope';

UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1690731033723-ad718c6e585a?w=800',
    'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800'
  ],
  description = 'A classic strength exercise that primarily targets the chest, shoulders, and triceps. Lie on a bench with feet flat on the floor, grip the bar slightly wider than shoulder-width, lower it to your chest, then press back up.',
  video = 'https://www.youtube.com/watch?v=rT7DgCr-3pg'
WHERE name = 'Bench Press';

-- Shoulder Press
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800',
    'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'
  ],
  description = 'An effective exercise for building shoulder strength and stability. With dumbbells at shoulder height, palms facing forward, press the weights upward until your arms are fully extended overhead.',
  video = 'https://www.youtube.com/watch?v=qEwKCR5JCog'
WHERE name = 'Shoulder Press';

-- Lunges
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1540474527619-218b6018f891?w=800',
    'https://images.unsplash.com/photo-1650116385006-2a82a7b9941b?w=800'
  ],
  description = 'A functional exercise that works your lower body one leg at a time. Step forward with one leg, lowering your hips until both knees are bent at about a 90-degree angle, then push back to the starting position.',
  video = 'https://www.youtube.com/watch?v=QOVaHwm-Q6U'
WHERE name = 'Lunges';

-- Dumbbell Rows
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1585820114364-e6d77b1a3ca4?w=800',
    'https://images.unsplash.com/photo-1674834727149-00812f907676?w=800'
  ],
  description = 'An excellent exercise for building a strong back and biceps. Bend at the waist with a flat back, hold a dumbbell in one hand, and pull it up alongside your torso while keeping your elbow close to your body.',
  video = 'https://www.youtube.com/watch?v=pYcpY20QaE8'
WHERE name = 'Dumbbell Rows';

-- Plank
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800',
    'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800'
  ],
  description = 'A fundamental core-strengthening exercise that engages multiple muscle groups. Position your body in a straight line from head to heels, supported by your forearms and toes, and hold the position.',
  video = 'https://www.youtube.com/watch?v=yeKv5oX_6GY'
WHERE name = 'Plank';

-- Bicep Curls
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800',
    'https://images.unsplash.com/photo-1590507621108-433608c97823?w=800'
  ],
  description = 'A targeted exercise for building bicep strength and definition. Hold dumbbells with palms facing forward, keep your elbows close to your torso, and curl the weights up toward your shoulders.',
  video = 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
WHERE name = 'Bicep Curls';

-- Running
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
    'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800'
  ],
  description = 'A fundamental cardio exercise that improves endurance and burns calories. Maintain good posture with a slight forward lean, land midfoot, and keep your arms at a 90-degree angle, moving them from hip to chin.',
  video = 'https://www.youtube.com/watch?v=_kGESn8ArrU'
WHERE name = 'Running';

-- Cycling
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
    'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800'
  ],
  description = 'An effective low-impact cardio exercise. Adjust the bike seat height so your legs are almost fully extended at the lowest pedal position, engage your core, and maintain a steady cadence.',
  video = 'https://www.youtube.com/watch?v=sRDQkK-ixGM'
WHERE name = 'Cycling';

-- Swimming
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1600965962102-9d260a71890d?w=800',
    'https://images.unsplash.com/photo-1560090995-01632a28895b?w=800'
  ],
  description = 'A full-body, low-impact cardio workout. For freestyle swimming, keep your body flat in the water, rotate your torso with each stroke, and maintain a steady kick from your hips.',
  video = 'https://www.youtube.com/watch?v=pFN2n7CRqhw'
WHERE name = 'Swimming';

-- Burpees
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://images.unsplash.com/photo-1739283180407-21e27d5c0735?w=800',
    'https://www.lavidalucida.com/wp-content/uploads/2021/09/como-hacer-burpees_opt.jpg?ezimgfmt=ng:webp/ngcb2'
  ],
  description = 'A high-intensity exercise that works your entire body. Begin standing, drop into a squat position with hands on the ground, kick feet back into a plank, return to squat, and jump up explosively.',
  video = 'https://www.youtube.com/watch?v=TU8QYVW0gDU'
WHERE name = 'Burpees';

-- Mountain Climbers
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://media1.popsugar-assets.com/files/thumbor/wxamMhoTR7CqLL3vZw2bgp6CDUU/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2016/12/13/004/n/1922729/6d2c0923f51ae949_5.-slow-mountain-climber/i/Circuit-2-Slow-Mountain-Climber.jpg',
    'https://media1.popsugar-assets.com/files/thumbor/j1KUbfKEjxtRIA4SGbFtNmPoOZw/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2018/11/11/923/n/1922729/9ddc9d2837369788_twisted-mountain-climber/i/Tabata-2-Twisted-Mountain-Climber.jpg'
  ],
  description = 'A dynamic exercise that works your core, shoulders, and legs while elevating your heart rate. Start in a plank position and alternate driving each knee toward your chest in a running motion.',
  video = 'https://www.youtube.com/watch?v=nmwgirgXLYM'
WHERE name = 'Mountain Climbers';

-- High Knees
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://th.bing.com/th/id/R.4aac484b8defed063cf54b2c02d972e1?rik=WLqq6bTSKHxpvg&pid=ImgRaw&r=0',
    'https://media1.popsugar-assets.com/files/thumbor/j9Ns9vUylr90E2tHl7Uie27bIvQ/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2014/10/14/845/n/1922729/8918e9c19e2f35ff_Plyometrics-High-Knee-Skips/i/High-Knees.jpg'
  ],
  description = 'A cardio exercise that increases heart rate and strengthens leg muscles. Run in place, lifting your knees toward your chest as high as possible while maintaining a quick pace.',
  video = 'https://www.youtube.com/watch?v=tx5rgpDAJRI'
WHERE name = 'High Knees';

-- Jumping Jacks
UPDATE exercises
SET 
  demonstration_photos = ARRAY[
    'https://media1.popsugar-assets.com/files/thumbor/I-yF8sY1H5bd-T2h_ODLMl6wFfc/fit-in/1024x1024/filters:format_auto-!!-:strip_icc-!!-/2015/02/20/992/n/1922729/d4fbc3fb8807a95e_3._Jumping-Jacks/i/Jumping-Jacks.jpg',
    'https://cdn.shopify.com/s/files/1/0075/4673/2662/files/how-to-do-jumping-jacks.jpg'
  ],
  description = 'A classic cardio exercise that works your whole body. Start with feet together and arms at your sides, then jump while spreading your legs and raising your arms overhead, then return to the starting position.',
  video = 'https://www.youtube.com/watch?v=c4DAnQ6DtF8'
WHERE name = 'Jumping Jacks'; 

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_exercises_type_name ON exercises(type, name);