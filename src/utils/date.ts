// 日期相关的工具函数

// 将日期格式化为 YYYY-MM-DD 格式
export const formatDate = (date: Date) => {
  return date.toISOString().split('T')[0];
};

// 获取指定月份的天数和第一天是星期几
export const getDaysInMonth = (date: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);      // 获取月份第一天
  const lastDay = new Date(year, month + 1, 0);   // 获取月份最后一天
  const daysInMonth = lastDay.getDate();          // 获取月份总天数
  const startingDay = firstDay.getDay();          // 获取第一天是星期几（0-6）
  return { daysInMonth, startingDay };
};

// 判断给定日期是否是今天
export const isToday = (date: string) => {
  return date === new Date().toISOString().split('T')[0];
};

// 判断给定日期是否是过去的日期
export const isPast = (dateStr: string) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);  // 设置时间为当天开始
  const date = new Date(dateStr);
  return date < today;
};