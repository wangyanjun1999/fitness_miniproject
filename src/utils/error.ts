import { AppError, ErrorType } from '../types/database';

// 创建错误实例
export const createError = (
  type: ErrorType,
  message: string,
  details?: Record<string, any>
): AppError => {
  return new AppError(message, type, details);
};

// 统一错误处理
export const handleError = (error: unknown, defaultMessage: string): string => {
  if (error instanceof AppError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return defaultMessage;
};

// 错误消息常量
export const ERROR_MESSAGES = {
  VALIDATION: {
    INVALID_FREQUENCY: '训练频率必须在1-7天之间',
    INVALID_SETS: '训练组数必须大于0',
    INVALID_REPS: '训练次数必须大于0',
    INVALID_REST: '休息时间必须大于0',
    INVALID_DATE: '日期格式无效',
    MISSING_REQUIRED: '缺少必要的参数'
  },
  DATABASE: {
    FETCH_PLAN: '获取训练计划失败',
    CREATE_PLAN: '创建训练计划失败',
    UPDATE_PLAN: '更新训练计划失败',
    DELETE_PLAN: '删除训练计划失败',
    FETCH_RECORDS: '获取训练记录失败',
    CREATE_RECORD: '创建训练记录失败',
    UPDATE_RECORD: '更新训练记录失败',
    DELETE_RECORD: '删除训练记录失败'
  },
  AUTH: {
    UNAUTHORIZED: '用户未登录或登录已过期',
    FORBIDDEN: '没有权限执行此操作'
  },
  NETWORK: {
    CONNECTION_FAILED: '网络连接失败',
    TIMEOUT: '请求超时',
    SERVER_ERROR: '服务器错误'
  }
} as const;