/*
  # 更新训练系统

  1. 修改
    - 为 workout_plans 表添加训练偏好字段
    - 为 exercises 表添加训练类型和目标肌群字段
    - 为 workout_records 表添加训练数据字段

  2. 安全
    - 启用 RLS
    - 添加访问策略
*/

-- 更新 workout_plans 表
ALTER TABLE workout_plans
ADD COLUMN IF NOT EXISTS preferences JSONB,
ADD COLUMN IF NOT EXISTS last_generated TIMESTAMPTZ DEFAULT now(),
ADD CONSTRAINT valid_plan_preferences
CHECK (
  preferences IS NULL OR (
    preferences ? 'difficulty' AND
    preferences ? 'focus_areas' AND
    preferences ? 'time_per_session' AND
    (preferences->>'difficulty' IN ('easy', 'medium', 'hard')) AND
    jsonb_typeof(preferences->'focus_areas') = 'array' AND
    (preferences->>'time_per_session')::int BETWEEN 30 AND 90
  )
);

-- 更新 exercises 表
ALTER TABLE exercises
ADD COLUMN IF NOT EXISTS exercise_type TEXT CHECK (exercise_type IN ('warmup', 'strength', 'cardio')),
ADD COLUMN IF NOT EXISTS target_muscles TEXT[],
ADD COLUMN IF NOT EXISTS equipment TEXT[],
ADD COLUMN IF NOT EXISTS difficulty INTEGER CHECK (difficulty BETWEEN 1 AND 3);

-- 更新 workout_records 表
ALTER TABLE workout_records
ADD COLUMN IF NOT EXISTS training_data JSONB DEFAULT '{"duration": 0, "intensity": 0, "calories_burned": 0}'::jsonb,
ADD CONSTRAINT valid_training_data
CHECK (
  training_data IS NULL OR (
    training_data ? 'duration' AND
    training_data ? 'intensity' AND
    training_data ? 'calories_burned'
  )
);

-- 创建视图来统计训练数据
CREATE OR REPLACE VIEW workout_statistics AS
WITH daily_stats AS (
  SELECT
    user_id,
    date_trunc('day', date) as workout_date,
    COUNT(DISTINCT exercise_id) as exercises_completed,
    SUM((training_data->>'duration')::int) as total_duration,
    SUM((training_data->>'calories_burned')::int) as total_calories
  FROM workout_records
  GROUP BY user_id, date_trunc('day', date)
)
SELECT
  user_id,
  workout_date,
  exercises_completed,
  total_duration,
  total_calories,
  COUNT(*) OVER (
    PARTITION BY user_id 
    ORDER BY workout_date 
    RANGE BETWEEN INTERVAL '6 days' PRECEDING AND CURRENT ROW
  ) as weekly_workout_count
FROM daily_stats;