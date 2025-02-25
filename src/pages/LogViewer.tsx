import React, { useState, useEffect } from 'react';
import { Header } from '../components/layout/Header';
import { PageContainer } from '../components/layout/PageContainer';
import { Search, Filter, RefreshCw, Download, Calendar } from 'lucide-react';
import { LogLevel, LogCategory, queryLogs } from '../utils/logger';

// 日志图标和颜色配置
const logConfig = {
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

function LogViewer() {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState<LogLevel | 'all'>('all');
  const [selectedCategory, setSelectedCategory] = useState<LogCategory | 'all'>('all');
  const [dateRange, setDateRange] = useState({
    start: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 days ago
    end: new Date()
  });

  const fetchLogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await queryLogs({
        level: selectedLevel === 'all' ? undefined : selectedLevel,
        category: selectedCategory === 'all' ? undefined : selectedCategory,
        search: searchTerm || undefined,
        startDate: dateRange.start,
        endDate: dateRange.end,
        limit: 100
      });
      setLogs(data);
    } catch (err) {
      setError('获取日志失败: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, [selectedLevel, selectedCategory, searchTerm, dateRange]);

  const handleExport = () => {
    const exportData = JSON.stringify(logs, null, 2);
    const blob = new Blob([exportData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `logs-${new Date().toISOString()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header showBackButton />
      <PageContainer>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">系统日志</h1>
            <div className="flex items-center space-x-4">
              <button
                onClick={fetchLogs}
                className={`rounded-lg bg-gray-100 p-2 text-gray-600 hover:bg-gray-200 ${
                  isLoading ? 'animate-spin' : ''
                }`}
                disabled={isLoading}
              >
                <RefreshCw className="h-5 w-5" />
              </button>
              <button
                onClick={handleExport}
                className="rounded-lg bg-indigo-600 p-2 text-white hover:bg-indigo-700"
                disabled={isLoading}
              >
                <Download className="h-5 w-5" />
              </button>
            </div>
          </div>

          {/* 过滤器 */}
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                <input
                  type="text"
                  placeholder="搜索日志..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 pl-10 pr-4 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value as LogLevel | 'all')}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">所有级别</option>
                <option value="debug">Debug</option>
                <option value="info">Info</option>
                <option value="warn">Warning</option>
                <option value="error">Error</option>
              </select>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value as LogCategory | 'all')}
                className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                <option value="all">所有类别</option>
                <option value="user">用户行为</option>
                <option value="system">系统操作</option>
                <option value="workout">训练相关</option>
                <option value="auth">认证相关</option>
                <option value="database">数据库操作</option>
                <option value="performance">性能监控</option>
              </select>
              <div className="flex items-center space-x-2">
                <input
                  type="date"
                  value={dateRange.start.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start: new Date(e.target.value)
                  }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
                <span className="text-gray-500">至</span>
                <input
                  type="date"
                  value={dateRange.end.toISOString().split('T')[0]}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end: new Date(e.target.value)
                  }))}
                  className="rounded-lg border border-gray-300 px-3 py-2 focus:border-indigo-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* 错误提示 */}
          {error && (
            <div className="rounded-lg bg-red-50 p-4 text-red-700">
              {error}
            </div>
          )}

          {/* 日志列表 */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <p className="text-gray-500">加载中...</p>
              </div>
            ) : logs.length === 0 ? (
              <div className="rounded-lg bg-gray-50 p-8 text-center">
                <p className="text-gray-500">没有找到匹配的日志记录</p>
              </div>
            ) : (
              logs.map((log, index) => (
                <div
                  key={index}
                  className="rounded-lg bg-white p-4 shadow-sm transition-all duration-200 hover:shadow-md"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{logConfig.icons[log.level]}</span>
                      <span className="text-lg">{logConfig.icons[log.category]}</span>
                      <span className="text-sm text-gray-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium`}
                      style={{ backgroundColor: `${logConfig.colors[log.level]}20`, color: logConfig.colors[log.level] }}
                    >
                      {log.level.toUpperCase()}
                    </span>
                  </div>
                  <p className="mt-2 text-gray-900">{log.message}</p>
                  {log.data && (
                    <pre className="mt-2 overflow-x-auto rounded bg-gray-50 p-2 text-sm text-gray-700">
                      {JSON.stringify(log.data, null, 2)}
                    </pre>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      </PageContainer>
    </div>
  );
}

export default LogViewer;