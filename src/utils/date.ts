// 日期处理工具函数
export const getStartOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

export const getEndOfDay = (date: Date = new Date()): Date => {
  const newDate = new Date(date);
  newDate.setHours(23, 59, 59, 999);
  return newDate;
};

export const getStartOfMonth = (year: number, month: number): Date => {
  return new Date(year, month, 1);
};

export const getEndOfMonth = (year: number, month: number): Date => {
  return new Date(year, month + 1, 0, 23, 59, 59, 999);
};

export const isValidDate = (date: Date): boolean => {
  return date instanceof Date && !isNaN(date.getTime());
};

export const formatDate = (date: Date): string => {
  if (!isValidDate(date)) {
    throw new Error('Invalid date');
  }
  return date.toISOString();
};