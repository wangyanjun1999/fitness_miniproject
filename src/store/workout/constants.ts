// 错误类型定义
export const ErrorType = {
  VALIDATION: 'VALIDATION_ERROR',
  DATABASE: 'DATABASE_ERROR',
  AUTHENTICATION: 'AUTH_ERROR',
  NETWORK: 'NETWORK_ERROR',
  UNKNOWN: 'UNKNOWN_ERROR'
} as const;

// 错误消息常量
export const ERROR_MESSAGES = {
  // 验证错误
  VALIDATION: {
    INVALID_FREQUENCY: '训练频率必须在1-7天之间',
    INVALID_SETS: '训练组数必须大于0',
    INVALID_REPS: '训练次数必须大于0',
    INVALID_REST: '休息时间必须大于0',
    INVALID_DATE: '日期格式无效',
    MISSING_REQUIRED: '缺少必要的参数'
  },
  // 数据库操作错误
  DATABASE: {
    FETCH_PLAN: '获取训练计划失败',
    CREATE_PLAN: '创建训练计划失败',
    UPDATE_PLAN: '更新训练计划失败',
    DELETE_PLAN: '删除训练计划失败',
    FETCH_RECORDS: '获取训练记录失败',
    CREATE_RECORD: '创建训练记录失败',
    UPDATE_RECORD: '更新训练记录失败',
    DELETE_RECORD: '删除训练记录失败',
    FETCH_EXERCISES: '获取训练动作失败'
  },
  // 认证错误
  AUTH: {
    UNAUTHORIZED: '用户未登录或登录已过期',
    FORBIDDEN: '没有权限执行此操作'
  },
  // 网络错误
  NETWORK: {
    CONNECTION_FAILED: '网络连接失败',
    TIMEOUT: '请求超时',
    SERVER_ERROR: '服务器错误'
  }
};

// 训练参数配置
export const trainingConfig = {
  // 增肌训练参数
  muscleGain: {
    // 力量训练参数 - 按难度级别
    strength: {
      // 高级训练者
      3: {
        beginner: { sets: 3, reps: 8, rest: 120 },    // 初学阶段
        intermediate: { sets: 4, reps: 10, rest: 90 }, // 进阶阶段
        advanced: { sets: 5, reps: 12, rest: 60 }      // 熟练阶段
      },
      // 中级训练者
      2: {
        beginner: { sets: 3, reps: 6, rest: 120 },
        intermediate: { sets: 3, reps: 8, rest: 90 },
        advanced: { sets: 4, reps: 10, rest: 90 }
      },
      // 初级训练者
      1: {
        beginner: { sets: 2, reps: 6, rest: 120 },
        intermediate: { sets: 3, reps: 6, rest: 120 },
        advanced: { sets: 3, reps: 8, rest: 90 }
      }
    },
    // 有氧训练参数 - 热身用
    cardio: {
      beginner: { sets: 2, reps: 20, rest: 60 },
      intermediate: { sets: 2, reps: 25, rest: 45 },
      advanced: { sets: 2, reps: 30, rest: 30 }
    }
  },
  // 减脂训练参数
  fatLoss: {
    // 有氧训练参数 - 按难度级别
    cardio: {
      // 高级训练者
      3: {
        beginner: { sets: 3, reps: 30, rest: 45 },
        intermediate: { sets: 4, reps: 30, rest: 30 },
        advanced: { sets: 5, reps: 30, rest: 20 }
      },
      // 中级训练者
      2: {
        beginner: { sets: 3, reps: 25, rest: 60 },
        intermediate: { sets: 3, reps: 30, rest: 45 },
        advanced: { sets: 4, reps: 30, rest: 30 }
      },
      // 初级训练者
      1: {
        beginner: { sets: 2, reps: 20, rest: 90 },
        intermediate: { sets: 3, reps: 20, rest: 60 },
        advanced: { sets: 3, reps: 25, rest: 45 }
      }
    },
    // 力量训练参数 - 代谢提升
    strength: {
      beginner: { sets: 2, reps: 12, rest: 60 },
      intermediate: { sets: 3, reps: 15, rest: 45 },
      advanced: { sets: 3, reps: 15, rest: 30 }
    }
  }
};