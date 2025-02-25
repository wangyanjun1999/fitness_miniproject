import { supabase } from '../lib/supabase';

// 日志级别定义
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

// 日志类别定义
export type LogCategory = 
  | 'user'      // 用户行为
  | 'system'    // 系统操作
  | 'workout'   // 训练相关
  | 'auth'      // 认证相关
  | 'database'  // 数据库操作
  | 'performance'; // 性能监控

// 日志条目接口
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  category: LogCategory;
  message: string;
  data?: any;
}

// 日志配置
const config = {
  minLevel: import.meta.env.DEV ? 'debug' : 'info' as LogLevel,
  enableConsole: import.meta.env.DEV,
  colors: {
    debug: '#7f8c8d',   // 灰色
    info: '#2ecc71',    // 绿色
    warn: '#f1c40f',    // 黄色
    error: '#e74c3c',   // 红色
  },
  icons: {
    debug: '🔍',
    info: 'ℹ️',
    warn: '⚠️',
    error: '❌',
    user: '👤',
    system: '🔧',
    workout: '🏋️‍♂️',
    auth: '🔐',
    database: '💾',
    performance: '⚡'
  }
};

// 日志级别权重
const levelWeight: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};

// 格式化日志消息
const formatLogMessage = (entry: LogEntry): string => {
  const timestamp = new Date(entry.timestamp).toLocaleTimeString();
  const icon = config.icons[entry.level];
  const categoryIcon = config.icons[entry.category];
  
  return `${timestamp} ${icon} ${categoryIcon} [${entry.category.toUpperCase()}] ${entry.message}`;
};

// 格式化日志数据
const formatLogData = (data: any): string => {
  try {
    if (typeof data === 'object') {
      return JSON.stringify(data, null, 2);
    }
    return String(data);
  } catch (error) {
    return '[无法序列化的数据]';
  }
};

// 创建日志条目
const createLogEntry = (
  level: LogLevel,
  category: LogCategory,
  message: string,
  data?: any
): LogEntry => ({
  timestamp: new Date().toISOString(),
  level,
  category,
  message,
  data
});

// 日志输出
const output = async (entry: LogEntry) => {
  if (levelWeight[entry.level] < levelWeight[config.minLevel]) {
    return;
  }

  // 控制台输出
  if (config.enableConsole) {
    const style = `color: ${config.colors[entry.level]}`;
    const formattedMessage = formatLogMessage(entry);
    
    console.groupCollapsed(`%c${formattedMessage}`, style);
    
    if (entry.data !== undefined) {
      console.log('详细信息:', entry.data);
    }
    
    if (entry.level === 'error') {
      console.trace('错误堆栈:');
    }
    
    console.groupEnd();
  }

  // 存储到 Supabase
  try {
    await supabase.from('system_logs').insert([{
      level: entry.level,
      category: entry.category,
      message: entry.message,
      data: entry.data,
      timestamp: entry.timestamp
    }]);
  } catch (error) {
    console.error('Failed to store log:', error);
  }
};

// 日志方法
export const logger = {
  debug: (category: LogCategory, message: string, data?: any) => {
    output(createLogEntry('debug', category, message, data));
  },

  info: (category: LogCategory, message: string, data?: any) => {
    output(createLogEntry('info', category, message, data));
  },

  warn: (category: LogCategory, message: string, data?: any) => {
    output(createLogEntry('warn', category, message, data));
  },

  error: (category: LogCategory, message: string, error?: Error | any) => {
    output(createLogEntry('error', category, message, {
      error: error instanceof Error ? {
        name: error.name,
        message: error.message,
        stack: error.stack
      } : error
    }));
  },

  // 性能监控专用方法
  performance: (operation: string, duration: number) => {
    output(createLogEntry(
      duration > 1000 ? 'warn' : 'info',
      'performance',
      `${operation} 耗时: ${duration}ms`,
      { operation, duration }
    ));
  }
};

// 性能监控装饰器
export function logPerformance() {
  return function (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor
  ) {
    const originalMethod = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const start = performance.now();
      try {
        const result = await originalMethod.apply(this, args);
        const duration = performance.now() - start;
        logger.performance(propertyKey, duration);
        return result;
      } catch (error) {
        const duration = performance.now() - start;
        logger.error('performance', `${propertyKey} 执行失败`, {
          error,
          duration,
          arguments: args
        });
        throw error;
      }
    };

    return descriptor;
  };
}

// 日志查询函数
export const queryLogs = async (params: {
  level?: LogLevel;
  category?: LogCategory;
  search?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
  offset?: number;
}) => {
  let query = supabase
    .from('system_logs')
    .select('*')
    .order('timestamp', { ascending: false });

  if (params.level) {
    query = query.eq('level', params.level);
  }

  if (params.category) {
    query = query.eq('category', params.category);
  }

  if (params.search) {
    query = query.or(`message.ilike.%${params.search}%,data->>'message'.ilike.%${params.search}%`);
  }

  if (params.startDate) {
    query = query.gte('timestamp', params.startDate.toISOString());
  }

  if (params.endDate) {
    query = query.lte('timestamp', params.endDate.toISOString());
  }

  if (params.limit) {
    query = query.limit(params.limit);
  }

  if (params.offset) {
    query = query.range(params.offset, params.offset + (params.limit || 50) - 1);
  }

  const { data, error } = await query;

  if (error) {
    throw error;
  }

  return data;
};