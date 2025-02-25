/*
  # 创建训练相关表

  1. 新建表
    - `workout_plans`: 训练计划表
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键关联 profiles)
      - `name` (text)
      - `description` (text)
      - `frequency` (integer)
      - `created_at` (timestamptz)
    
    - `exercises`: 训练项目表
      - `id` (uuid, 主键)
      - `plan_id` (uuid, 外键关联 workout_plans)
      - `name` (text)
      - `sets` (integer)
      - `reps` (integer)
      - `rest_time` (integer)
      - `notes` (text)
    
    - `workout_records`: 训练记录表
      - `id` (uuid, 主键)
      - `user_id` (uuid, 外键关联 profiles)
      - `exercise_id` (uuid, 外键关联 exercises)
      - `completed_sets` (integer)
      - `completed_reps` (integer)
      - `date` (timestamptz)
      - `notes` (text)

  2. 安全
    - 为所有表启用 RLS
    - 添加策略确保用户只能访问自己的数据
*/

-- 创建训练计划表
CREATE TABLE workout_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  frequency INTEGER NOT NULL CHECK (frequency > 0 AND frequency <= 7),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 创建训练项目表
CREATE TABLE exercises (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID REFERENCES workout_plans(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  sets INTEGER NOT NULL CHECK (sets > 0),
  reps INTEGER NOT NULL CHECK (reps > 0),
  rest_time INTEGER NOT NULL CHECK (rest_time > 0),
  notes TEXT
);

-- 创建训练记录表
CREATE TABLE workout_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) NOT NULL,
  exercise_id UUID REFERENCES exercises(id) ON DELETE CASCADE NOT NULL,
  completed_sets INTEGER NOT NULL CHECK (completed_sets >= 0),
  completed_reps INTEGER NOT NULL CHECK (completed_reps >= 0),
  date TIMESTAMPTZ DEFAULT now(),
  notes TEXT
);

-- 启用行级安全性
ALTER TABLE workout_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE workout_records ENABLE ROW LEVEL SECURITY;

-- 训练计划的访问策略
CREATE POLICY "Users can view own workout plans"
  ON workout_plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout plans"
  ON workout_plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workout plans"
  ON workout_plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- 训练项目的访问策略
CREATE POLICY "Users can view exercises of own plans"
  ON exercises
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = exercises.plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create exercises for own plans"
  ON exercises
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM workout_plans
      WHERE workout_plans.id = exercises.plan_id
      AND workout_plans.user_id = auth.uid()
    )
  );

-- 训练记录的访问策略
CREATE POLICY "Users can view own workout records"
  ON workout_records
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own workout records"
  ON workout_records
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);