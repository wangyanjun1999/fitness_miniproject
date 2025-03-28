import { createClient } from '@supabase/supabase-js';

// Supabase 配置
const supabaseUrl = 'https://mdnknaftcdkkasbqvuam.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kbmtuYWZ0Y2Rra2FzYnF2dWFtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDA1MTkxMjIsImV4cCI6MjA1NjA5NTEyMn0.7NwopO_ivTqv2uAEzGq39kTbbDLgJwVpjeiUGt8Rr6s';

// 创建 Supabase 客户端
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// 运动项目指导内容数据
const exerciseGuidance = [
  {
    name: 'Bench Press',
    photos: [
      'https://images.unsplash.com/photo-1534368786749-b63e05c52a1f?w=800',
      'https://images.unsplash.com/photo-1571388208497-71bedc66e932?w=800'
    ],
    description: 'A classic strength exercise that primarily targets the chest, shoulders, and triceps. Lie on a bench with feet flat on the floor, grip the bar slightly wider than shoulder-width, lower it to your chest, then press back up.',
    video: 'https://www.youtube.com/watch?v=rT7DgCr-3pg'
  },
  {
    name: 'Shoulder Press',
    photos: [
      'https://images.unsplash.com/photo-1532029837206-abbe2b7620e3?w=800',
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800'
    ],
    description: 'An effective exercise for building shoulder strength and stability. With dumbbells at shoulder height, palms facing forward, press the weights upward until your arms are fully extended overhead.',
    video: 'https://www.youtube.com/watch?v=qEwKCR5JCog'
  },
  {
    name: 'Lunges',
    photos: [
      'https://images.unsplash.com/photo-1434608519344-49d77a699e1d?w=800',
      'https://images.unsplash.com/photo-1595078475945-44ad57a3a130?w=800'
    ],
    description: 'A functional exercise that works your lower body one leg at a time. Step forward with one leg, lowering your hips until both knees are bent at about a 90-degree angle, then push back to the starting position.',
    video: 'https://www.youtube.com/watch?v=QOVaHwm-Q6U'
  },
  {
    name: 'Dumbbell Rows',
    photos: [
      'https://images.unsplash.com/photo-1603287681836-b174ce5074c4?w=800',
      'https://images.unsplash.com/photo-1598268030450-8843e0e6576f?w=800'
    ],
    description: 'An excellent exercise for building a strong back and biceps. Bend at the waist with a flat back, hold a dumbbell in one hand, and pull it up alongside your torso while keeping your elbow close to your body.',
    video: 'https://www.youtube.com/watch?v=pYcpY20QaE8'
  },
  {
    name: 'Plank',
    photos: [
      'https://images.unsplash.com/photo-1566241142559-40e1dab266c6?w=800',
      'https://images.unsplash.com/photo-1571019613576-2b22c76fd955?w=800'
    ],
    description: 'A fundamental core-strengthening exercise that engages multiple muscle groups. Position your body in a straight line from head to heels, supported by your forearms and toes, and hold the position.',
    video: 'https://www.youtube.com/watch?v=yeKv5oX_6GY'
  },
  {
    name: 'Bicep Curls',
    photos: [
      'https://images.unsplash.com/photo-1581009137042-c552e485697a?w=800',
      'https://images.unsplash.com/photo-1590507621108-433608c97823?w=800'
    ],
    description: 'A targeted exercise for building bicep strength and definition. Hold dumbbells with palms facing forward, keep your elbows close to your torso, and curl the weights up toward your shoulders.',
    video: 'https://www.youtube.com/watch?v=ykJmrZ5v0Oo'
  },
  {
    name: 'Running',
    photos: [
      'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=800',
      'https://images.unsplash.com/photo-1486218119243-13883505764c?w=800'
    ],
    description: 'A fundamental cardio exercise that improves endurance and burns calories. Maintain good posture with a slight forward lean, land midfoot, and keep your arms at a 90-degree angle, moving them from hip to chin.',
    video: 'https://www.youtube.com/watch?v=_kGESn8ArrU'
  },
  {
    name: 'Cycling',
    photos: [
      'https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800',
      'https://images.unsplash.com/photo-1507035895480-2b3156c31fc8?w=800'
    ],
    description: 'An effective low-impact cardio exercise. Adjust the bike seat height so your legs are almost fully extended at the lowest pedal position, engage your core, and maintain a steady cadence.',
    video: 'https://www.youtube.com/watch?v=sRDQkK-ixGM'
  },
  {
    name: 'Swimming',
    photos: [
      'https://images.unsplash.com/photo-1600965962324-79f764fe7b63?w=800',
      'https://images.unsplash.com/photo-1560090995-01632a28895b?w=800'
    ],
    description: 'A full-body, low-impact cardio workout. For freestyle swimming, keep your body flat in the water, rotate your torso with each stroke, and maintain a steady kick from your hips.',
    video: 'https://www.youtube.com/watch?v=pFN2n7CRqhw'
  },
  {
    name: 'Burpees',
    photos: [
      'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
      'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800'
    ],
    description: 'A high-intensity exercise that works your entire body. Begin standing, drop into a squat position with hands on the ground, kick feet back into a plank, return to squat, and jump up explosively.',
    video: 'https://www.youtube.com/watch?v=TU8QYVW0gDU'
  },
  {
    name: 'Mountain Climbers',
    photos: [
      'https://images.unsplash.com/photo-1577221084712-45b0445d2b00?w=800',
      'https://images.unsplash.com/photo-1567598508481-65985588e295?w=800'
    ],
    description: 'A dynamic exercise that works your core, shoulders, and legs while elevating your heart rate. Start in a plank position and alternate driving each knee toward your chest in a running motion.',
    video: 'https://www.youtube.com/watch?v=nmwgirgXLYM'
  },
  {
    name: 'High Knees',
    photos: [
      'https://images.unsplash.com/photo-1599058917765-a780eda07a3e?w=800',
      'https://images.unsplash.com/photo-1434596922112-19c563067271?w=800'
    ],
    description: 'A cardio exercise that increases heart rate and strengthens leg muscles. Run in place, lifting your knees toward your chest as high as possible while maintaining a quick pace.',
    video: 'https://www.youtube.com/watch?v=tx5rgpDAJRI'
  },
  {
    name: 'Jumping Jacks',
    photos: [
      'https://images.unsplash.com/photo-1601422407692-ec4eeec1d9b3?w=800',
      'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800'
    ],
    description: 'A classic cardio exercise that works your whole body. Start with feet together and arms at your sides, then jump while spreading your legs and raising your arms overhead, then return to the starting position.',
    video: 'https://www.youtube.com/watch?v=c4DAnQ6DtF8'
  }
];

// 已有指导内容的运动项目
const existingGuidanceExercises = ['Push-ups', 'Pull-ups', 'Squats', 'Deadlifts', 'Jump Rope'];

// 主函数：更新运动项目的指导内容
async function updateExerciseGuidance() {
  console.log('Starting to update exercise guidance...');
  
  try {
    // 获取所有运动项目
    const { data: exercises, error } = await supabase
      .from('exercises')
      .select('id, name');
    
    if (error) {
      throw error;
    }
    
    if (!exercises || exercises.length === 0) {
      console.log('No exercises found in the database.');
      return;
    }
    
    console.log(`Found ${exercises.length} exercises. Processing...`);
    
    // 更新每个运动项目的指导内容
    for (const exercise of exercises) {
      // 跳过已有指导内容的运动项目
      if (existingGuidanceExercises.includes(exercise.name)) {
        console.log(`Skipping ${exercise.name} as it already has guidance content.`);
        continue;
      }
      
      // 查找匹配的指导内容
      const guidance = exerciseGuidance.find(g => g.name === exercise.name);
      
      if (guidance) {
        // 更新运动项目的指导内容
        const { error: updateError } = await supabase
          .from('exercises')
          .update({
            demonstration_photos: guidance.photos,
            description: guidance.description,
            video: guidance.video
          })
          .eq('id', exercise.id);
        
        if (updateError) {
          console.error(`Error updating ${exercise.name}:`, updateError);
        } else {
          console.log(`Successfully updated guidance for ${exercise.name}`);
        }
      } else {
        console.log(`No guidance content found for ${exercise.name}`);
      }
    }
    
    console.log('Exercise guidance update completed.');
  } catch (error) {
    console.error('Error updating exercise guidance:', error);
  }
}

// 执行更新函数
updateExerciseGuidance(); 