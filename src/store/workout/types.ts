// 训练动作模板接口定义
export interface ExerciseTemplate {
  id: string;
  name: string;
  category: 'strength' | 'cardio';
  difficulty: 1 | 2 | 3;
  target_muscles: string[];
  equipment: string[];
  description: string;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

// 训练偏好接口
export interface WorkoutPreferences {
  difficulty: 'easy' | 'medium' | 'hard';
  focus_areas: string[];
  time_per_session: number;
}

// 训练计划状态管理接口
export interface WorkoutPlanState {
  currentPlan: WorkoutPlan | null;
  exercises: Exercise[];
  isLoading: boolean;
  error: string | null;
  
  // 获取用户训练计划
  fetchUserPlan: (userId: string) => Promise<void>;
  // 创建新训练计划
  createPlan: (plan: CreatePlanInput) => Promise<void>;
  // 删除训练计划
  deletePlan: (planId: string) => Promise<void>;
}

// 训练记录状态管理接口
export interface WorkoutRecordState {
  records: WorkoutRecord[];
  isLoading: boolean;
  error: string | null;
  
  // 记录训练完成情况
  recordWorkout: (record: CreateRecordInput) => Promise<void>;
  // 获取月度训练记录
  fetchMonthlyRecords: (userId: string, year: number, month: number) => Promise<void>;
}

// 创建训练计划输入参数
export interface CreatePlanInput {
  user_id: string;
  name: string;
  description: string;
  frequency: number;
  preferences?: WorkoutPreferences;
}

// 创建训练记录输入参数
export interface CreateRecordInput {
  user_id: string;
  exercise_id: string;
  completed_sets: number;
  completed_reps: number;
  training_data?: {
    duration: number;
    intensity: number;
    calories_burned: number;
  };
  notes?: string;
}

// 训练统计接口
export interface WorkoutStatistics {
  user_id: string;
  workout_date: string;
  exercises_completed: number;
  total_duration: number;
  total_calories: number;
  weekly_workout_count: number;
}