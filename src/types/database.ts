// 定义数据库模型的类型接口

// 用户档案接口
export interface Profile {
  id: string;                    // 用户唯一标识符
  username: string;              // 用户名
  height: number | null;         // 身高（厘米）
  weight: number | null;         // 体重（千克）
  goal: 'increase' | 'decrease' | 'maintain' | null;  // 健身目标：增重、减重或保持
  created_at: string;           // 创建时间
  updated_at: string;           // 更新时间
}

// 运动项目接口
export interface Exercise {
  id: number;                   // 运动项目唯一标识符
  name: string;                 // 运动名称
  type: 'strength' | 'cardio';  // 运动类型：力量训练或有氧运动
  calories_per_unit: number;    // 每单位（组/分钟）消耗的卡路里
  created_at: string;           // 创建时间
  demonstration_photos: string[] | null;  // 示范图片URL数组
  description: string | null;    // 运动描述
  video: string | null;         // 教学视频URL
}

// 训练计划接口
export interface Plan {
  id: number;                   // 计划唯一标识符
  user_id: string;              // 用户ID
  date: string;                 // 计划日期
  exercise_id: number;          // 运动项目ID
  sets: number;                 // 训练组数
  reps: number;                 // 每组重复次数/时长（分钟）
  completed: boolean;           // 是否完成
  created_at: string;           // 创建时间
  exercises?: Exercise;         // 关联的运动项目信息
}

// 活动日志接口
export interface ActivityLog {
  id: string;                   // 日志唯一标识符
  user_id: string;              // 用户ID
  action: string;               // 操作类型
  details: Record<string, any>; // 操作详情
  created_at: string;           // 创建时间
}