/*
  # Add system logs table

  1. New Tables
    - `system_logs`
      - `id` (uuid, primary key)
      - `level` (text) - 日志级别 (debug, info, warn, error)
      - `category` (text) - 日志类别 (user, system, workout, auth, database, performance)
      - `message` (text) - 日志消息
      - `data` (jsonb) - 额外数据
      - `timestamp` (timestamptz) - 记录时间

  2. Security
    - Enable RLS on `system_logs` table
    - Add policy for authenticated users to read logs
    - Add policy for system to insert logs
*/

-- Create system_logs table
CREATE TABLE IF NOT EXISTS system_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  level TEXT NOT NULL CHECK (level IN ('debug', 'info', 'warn', 'error')),
  category TEXT NOT NULL CHECK (
    category IN ('user', 'system', 'workout', 'auth', 'database', 'performance')
  ),
  message TEXT NOT NULL,
  data JSONB,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for better query performance
CREATE INDEX IF NOT EXISTS system_logs_timestamp_idx ON system_logs (timestamp DESC);
CREATE INDEX IF NOT EXISTS system_logs_level_idx ON system_logs (level);
CREATE INDEX IF NOT EXISTS system_logs_category_idx ON system_logs (category);

-- Enable Row Level Security
ALTER TABLE system_logs ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Authenticated users can read logs"
  ON system_logs
  FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "System can insert logs"
  ON system_logs
  FOR INSERT
  TO authenticated
  WITH CHECK (true);