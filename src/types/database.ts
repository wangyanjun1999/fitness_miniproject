// 数据库类型定义
export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  height: number | null;
  weight: number | null;
  age: number | null;
  gender: 'MALE' | 'FEMALE' | 'OTHER' | null;
  fitness_goal: 'MUSCLE_GAIN' | 'FAT_LOSS' | null;
  training_preferences?: {
    difficulty: 'easy' | 'medium' | 'hard';
    focus_areas: string[];
    time_per_session: number;
  };
  created_at: string;
  updated_at: string;
}

// 训练计划类型
export interface WorkoutPlan {
  id: string;
  user_id: string;
  name: string;
  description: string;
  frequency: number;
  preferences?: {
    difficulty: 'easy' | 'medium' | 'hard';
    focus_areas: string[];
    time_per_session: number;
  };
  last_generated: string;
  created_at: string;
}

// 训练项目类型
export interface Exercise {
  id: string;
  plan_id: string;
  name: string;
  sets: number;
  reps: number;
  rest_time: number;
  exercise_type: 'warmup' | 'strength' | 'cardio';
  target_muscles: string[];
  equipment: string[];
  difficulty: 1 | 2 | 3;
  notes: string | null;
}

// 训练记录类型
export interface WorkoutRecord {
  id: string;
  user_id: string;
  exercise_id: string;
  completed_sets: number;
  completed_reps: number;
  date: string;
  training_data?: {
    duration: number;
    intensity: number;
    calories_burned: number;
  };
  notes: string | null;
}

// 训练统计类型
export interface WorkoutStatistics {
  user_id: string;
  workout_date: string;
  exercises_completed: number;
  total_duration: number;
  total_calories: number;
  weekly_workout_count: number;
}

// 认证状态类型
export interface AuthState {
  user: Profile | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (data: Partial<Profile>) => Promise<void>;
}

// 错误类型
export type ErrorType = 
  | 'VALIDATION_ERROR'
  | 'DATABASE_ERROR'
  | 'AUTH_ERROR'
  | 'NETWORK_ERROR'
  | 'UNKNOWN_ERROR';

// 自定义错误类
export class AppError extends Error {
  constructor(
    message: string,
    public type: ErrorType,
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

// 系统日志类型
export interface SystemLog {
  id: string;
  level: 'debug' | 'info' | 'warn' | 'error';
  category: 'user' | 'system' | 'workout' | 'auth' | 'database' | 'performance';
  message: string;
  data?: any;
  timestamp: string;
}

// 训练动作库类型
export interface ExerciseLibrary {
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