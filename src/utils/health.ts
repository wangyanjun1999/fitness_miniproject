// 健康相关的工具函数

// 计算BMI（体重指数）
export const calculateBMI = (height: string, weight: string) => {
  if (height && weight) {
    const heightInMeters = Number(height) / 100;  // 将身高从厘米转换为米
    const weightInKg = Number(weight);            // 体重（千克）
    const bmi = weightInKg / (heightInMeters * heightInMeters);  // BMI计算公式：体重/身高²
    return bmi.toFixed(1);  // 保留一位小数
  }
  return null;
};

// 根据BMI值获取体重状态分类
export const getBMICategory = (bmi: number) => {
  if (bmi < 18.5) return { category: 'Underweight', color: 'text-blue-600' };   // 体重过轻
  if (bmi < 25) return { category: 'Normal weight', color: 'text-green-600' };  // 正常体重
  if (bmi < 30) return { category: 'Overweight', color: 'text-yellow-600' };    // 超重
  return { category: 'Obese', color: 'text-red-600' };                          // 肥胖
};