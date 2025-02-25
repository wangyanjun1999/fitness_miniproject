/*
  # Add exercise library table

  1. New Tables
    - `exercise_library`
      - `id` (uuid, primary key)
      - `name` (text, unique)
      - `category` (text) - 'strength' or 'cardio'
      - `difficulty` (integer) - 1, 2, or 3
      - `target_muscles` (text[]) - array of target muscle groups
      - `equipment` (text[]) - array of required equipment
      - `description` (text)
      - `notes` (text)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Security
    - Enable RLS on `exercise_library` table
    - Add policy for authenticated users to read data
*/

-- Create exercise_library table
CREATE TABLE exercise_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('strength', 'cardio')),
  difficulty INTEGER NOT NULL CHECK (difficulty BETWEEN 1 AND 3),
  target_muscles TEXT[] NOT NULL,
  equipment TEXT[] NOT NULL,
  description TEXT NOT NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE exercise_library ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read exercise library"
  ON exercise_library
  FOR SELECT
  TO authenticated
  USING (true);

-- Insert initial exercise data
INSERT INTO exercise_library (name, category, difficulty, target_muscles, equipment, description, notes) VALUES
  ('俯卧撑', 'strength', 1, ARRAY['胸部', '三头肌', '肩部'], ARRAY['无'], '基础的上肢力量训练动作', '适合初学者的基础动作，可以通过改变手的位置来调整训练强度'),
  ('深蹲', 'strength', 1, ARRAY['大腿', '臀部', '核心'], ARRAY['无'], '全身性的下肢力量训练动作', '注意保持正确的姿势，膝盖不要超过脚尖'),
  ('平板支撑', 'strength', 1, ARRAY['核心', '肩部', '手臂'], ARRAY['无'], '加强核心稳定性的静态训练动作', '保持身体成一条直线，避免腰部下塌'),
  ('弓步蹲', 'strength', 2, ARRAY['大腿', '臀部', '核心'], ARRAY['无'], '单腿力量和平衡训练动作', '前后腿交替进行，注意保持平衡'),
  ('引体向上', 'strength', 3, ARRAY['背部', '二头肌', '肩部'], ARRAY['单杠'], '上肢拉力训练动作', '需要一定的基础力量，初学者可以先做辅助引体向上'),
  ('卷腹', 'strength', 1, ARRAY['腹部', '核心'], ARRAY['无'], '腹部力量训练动作', '注意控制呼吸，避免用力过猛'),
  ('倒立撑', 'strength', 3, ARRAY['肩部', '三头肌', '核心'], ARRAY['墙壁'], '高级上肢力量训练动作', '需要良好的平衡能力和上肢力量'),
  ('单腿硬拉', 'strength', 2, ARRAY['臀部', '大腿后侧', '核心'], ARRAY['无'], '单腿后链训练动作', '注意保持脊柱中立，髋关节折叠'),
  ('高抬腿', 'cardio', 1, ARRAY['核心', '髋部', '大腿'], ARRAY['无'], '提高心肺功能的有氧运动', '可以原地进行，也可以前进后退'),
  ('开合跳', 'cardio', 2, ARRAY['全身'], ARRAY['无'], '全身性的高强度有氧运动', '注意落地时膝盖缓冲，避免硬着陆'),
  ('波比跳', 'cardio', 3, ARRAY['全身'], ARRAY['无'], '高强度全身性训练动作', '结合了俯卧撑和跳跃，强度较大'),
  ('登山跑', 'cardio', 2, ARRAY['核心', '肩部', '大腿'], ARRAY['无'], '核心力量和心肺训练动作', '保持上身稳定，控制节奏'),
  ('跳绳', 'cardio', 1, ARRAY['小腿', '心肺'], ARRAY['跳绳'], '基础心肺训练动作', '适合作为热身运动，也可以用于高强度间歇训练'),
  ('箱式跳', 'cardio', 3, ARRAY['大腿', '臀部', '心肺'], ARRAY['跳箱'], '爆发力和心肺训练动作', '注意安全，确保跳箱稳固');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create trigger to automatically update updated_at
CREATE TRIGGER update_exercise_library_updated_at
  BEFORE UPDATE ON exercise_library
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();