# 健身助手应用

一个现代化的健身追踪和管理应用，帮助用户记录和规划他们的健身活动。

## 功能特点

### 1. 用户管理
- 邮箱注册和登录
- 个人资料管理（身高、体重、健身目标）
- BMI计算和健康状态评估

### 2. 训练计划
- 添加和管理每日训练计划
- 支持力量训练和有氧运动
- 基于BMI的个性化训练推荐
- 训练完成状态追踪
- 训练计划日历视图

### 3. 数据统计
- 训练完成率统计
- 卡路里消耗计算
- 训练类型分布图表
- 活动日志记录

### 4. 训练工具
- 可定制的间歇训练计时器
- 运动示范图片和视频
- 详细的运动说明

## 技术架构

### 前端技术
- React 18
- TypeScript
- Tailwind CSS
- Recharts（数据可视化）
- Lucide React（图标）
- React Router（路由管理）
- Zustand（状态管理）

### 后端服务
- Supabase（后端即服务）
  - 身份认证
  - PostgreSQL 数据库
  - 行级安全策略
  - 实时数据同步

## 数据模型

### 用户档案 (profiles)
```sql
- id: UUID (主键)
- username: 用户名
- height: 身高（厘米）
- weight: 体重（千克）
- goal: 健身目标（增重/减重/保持）
- created_at: 创建时间
- updated_at: 更新时间
```

### 运动项目 (exercises)
```sql
- id: 序号 (主键)
- name: 运动名称
- type: 运动类型（力量/有氧）
- calories_per_unit: 单位卡路里消耗
- demonstration_photos: 示范图片
- description: 运动描述
- video: 教学视频链接
```

### 训练计划 (plans)
```sql
- id: 序号 (主键)
- user_id: 用户ID
- date: 计划日期
- exercise_id: 运动项目ID
- sets: 组数
- reps: 次数/时长
- completed: 完成状态
```

### 活动日志 (activity_logs)
```sql
- id: UUID (主键)
- user_id: 用户ID
- action: 操作类型
- details: 操作详情
- created_at: 创建时间
```

## 安全特性

### 数据访问控制
- 所有表启用行级安全策略（RLS）
- 用户只能访问自己的数据
- 运动项目表允许所有认证用户读取

### 身份认证
- 基于邮箱和密码的认证
- 密码最小长度要求
- 会话管理和自动登录

## 使用指南

### 1. 注册/登录
1. 访问应用首页
2. 选择"Create new account"进行注册
3. 填写邮箱、用户名和密码
4. 使用注册的邮箱和密码登录

### 2. 个人资料设置
1. 点击底部导航栏的"Profile"
2. 填写身高和体重信息
3. 选择健身目标
4. 点击"Save Changes"保存

### 3. 添加训练计划
1. 在仪表板或日历页面点击"Add Workout"
2. 选择运动类型（力量/有氧）
3. 选择具体的运动项目
4. 设置组数和重复次数/时长
5. 选择日期
6. 点击"Add Workout"确认添加

### 4. 使用训练计时器
1. 在仪表板页面找到计时器组件
2. 点击设置图标配置训练参数
   - 循环次数
   - 运动时间
   - 休息时间
3. 点击开始按钮开始计时
4. 根据提示音切换运动和休息

### 5. 查看统计数据
1. 在仪表板页面查看：
   - 今日训练完成率
   - 卡路里消耗
   - 训练类型分布

### 6. 查看活动日志
1. 点击底部导航栏的"Logs"
2. 查看所有活动记录
3. 使用搜索和筛选功能查找特定记录

## 开发指南

### 环境要求
- Node.js 18+
- npm 9+

### 本地开发
1. 克隆项目代码
2. 安装依赖：`npm install`
3. 配置环境变量：
   ```
   VITE_SUPABASE_URL=你的Supabase项目URL
   VITE_SUPABASE_ANON_KEY=你的Supabase匿名密钥
   ```
4. 启动开发服务器：`npm run dev`

### 数据库迁移
1. 确保已安装Supabase CLI
2. 运行迁移：`supabase db push`

### 代码规范
- 使用TypeScript强类型
- 遵循React Hooks规范
- 使用Tailwind CSS进行样式设计
- 保持组件的单一职责

## 部署说明

### 前端部署
1. 构建生产版本：`npm run build`
2. 将`dist`目录部署到静态托管服务

### Supabase设置
1. 创建新的Supabase项目
2. 运行数据库迁移脚本
3. 配置身份认证设置
4. 设置行级安全策略

## 贡献指南

### 提交PR
1. Fork项目仓库
2. 创建功能分支
3. 提交变更
4. 创建Pull Request

### 代码审查标准
- 确保类型安全
- 维护现有的代码风格
- 更新相关文档
- 添加必要的测试

## 许可证

MIT License