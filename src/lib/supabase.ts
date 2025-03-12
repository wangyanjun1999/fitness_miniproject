// 引入Supabase客户端创建函数
import { createClient } from '@supabase/supabase-js';

// 从环境变量中获取Supabase配置
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;         // Supabase项目URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // 匿名访问密钥

// 验证环境变量是否存在
if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// 创建并导出Supabase客户端实例
export const supabase = createClient(supabaseUrl, supabaseAnonKey);