import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Timer as TimerIcon, Play, Pause, RotateCcw, Settings } from 'lucide-react';

interface TimerProps {
  onComplete?: () => void;  // 计时器完成时的回调函数
}

export default function Timer({ onComplete }: TimerProps) {
  // 状态管理
  const [isRunning, setIsRunning] = useState(false);        // 计时器是否运行中
  const [currentTime, setCurrentTime] = useState(0);        // 当前剩余时间（秒）
  const [cycles, setCycles] = useState(3);                  // 循环次数
  const [workTime, setWorkTime] = useState(30);            // 运动时间（秒）
  const [restTime, setRestTime] = useState(10);            // 休息时间（秒）
  const [currentCycle, setCurrentCycle] = useState(1);     // 当前循环次数
  const [isResting, setIsResting] = useState(false);       // 是否处于休息状态
  const [showSettings, setShowSettings] = useState(false);  // 是否显示设置面板
  
  // 引用管理
  const intervalRef = useRef<number>();                    // 计时器间隔引用
  const audioContextRef = useRef<AudioContext>();          // 音频上下文引用

  // 初始化音频上下文
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return () => {
      if (audioContextRef.current?.state !== 'closed') {
        audioContextRef.current?.close();
      }
    };
  }, []);

  // 播放提示音
  const playBeep = useCallback(() => {
    if (!audioContextRef.current) return;

    // 创建音频节点
    const oscillator = audioContextRef.current.createOscillator();
    const gainNode = audioContextRef.current.createGain();

    // 连接音频节点
    oscillator.connect(gainNode);
    gainNode.connect(audioContextRef.current.destination);

    // 设置音频参数
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(880, audioContextRef.current.currentTime); // A5音符

    // 设置音量渐变
    gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
    gainNode.gain.linearRampToValueAtTime(0.5, audioContextRef.current.currentTime + 0.01);
    gainNode.gain.linearRampToValueAtTime(0, audioContextRef.current.currentTime + 0.2);

    // 播放音频
    oscillator.start(audioContextRef.current.currentTime);
    oscillator.stop(audioContextRef.current.currentTime + 0.2);
  }, []);

  // 重置计时器
  const resetTimer = useCallback(() => {
    setIsRunning(false);
    setCurrentTime(workTime);
    setCurrentCycle(1);
    setIsResting(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [workTime]);

  // 当运动时间改变时重置计时器
  useEffect(() => {
    resetTimer();
  }, [workTime, resetTimer]);

  // 计时器主逻辑
  useEffect(() => {
    if (!isRunning) return;

    intervalRef.current = window.setInterval(() => {
      setCurrentTime(time => {
        if (time <= 1) {
          playBeep();
          
          // 当前间隔结束
          if (isResting) {
            // 休息时间结束
            if (currentCycle >= cycles) {
              // 所有循环完成
              setIsRunning(false);
              if (onComplete) onComplete();
              return 0;
            } else {
              // 开始下一个循环
              setCurrentCycle(c => c + 1);
              setIsResting(false);
              return workTime;
            }
          } else {
            // 运动时间结束，开始休息
            setIsResting(true);
            return restTime;
          }
        }
        
        // 最后3秒播放提示音
        if (time <= 4) {
          playBeep();
        }
        
        return time - 1;
      });
    }, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, currentCycle, cycles, workTime, restTime, isResting, playBeep, onComplete]);

  // 切换计时器状态
  const toggleTimer = () => {
    if (!isRunning && currentTime === 0) {
      resetTimer();
    }
    setIsRunning(!isRunning);
  };

  // 格式化时间显示
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      {/* 标题栏 */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900 flex items-center">
          <TimerIcon className="h-5 w-5 mr-2" />
          Workout Timer
        </h3>
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <Settings className="h-5 w-5" />
        </button>
      </div>

      {showSettings ? (
        // 设置面板
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Number of Cycles</label>
            <input
              type="number"
              min="1"
              max="10"
              value={cycles}
              onChange={(e) => setCycles(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Work Time (seconds)</label>
            <input
              type="number"
              min="5"
              max="300"
              value={workTime}
              onChange={(e) => setWorkTime(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Rest Time (seconds)</label>
            <input
              type="number"
              min="5"
              max="120"
              value={restTime}
              onChange={(e) => setRestTime(Number(e.target.value))}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <button
            onClick={() => {
              resetTimer();
              setShowSettings(false);
            }}
            className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
          >
            Apply Settings
          </button>
        </div>
      ) : (
        // 计时器显示
        <>
          <div className="text-center mb-6">
            <div className="text-5xl font-bold text-gray-900 mb-2">
              {formatTime(currentTime)}
            </div>
            <div className="text-sm text-gray-500">
              {isResting ? 'Rest Time' : 'Work Time'} • Cycle {currentCycle}/{cycles}
            </div>
          </div>

          {/* 控制按钮 */}
          <div className="flex justify-center space-x-4">
            <button
              onClick={toggleTimer}
              className={`flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-white ${
                isRunning
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }`}
            >
              {isRunning ? (
                <>
                  <Pause className="h-5 w-5 mr-2" />
                  Pause
                </>
              ) : (
                <>
                  <Play className="h-5 w-5 mr-2" />
                  {currentTime === 0 ? 'Start' : 'Resume'}
                </>
              )}
            </button>
            <button
              onClick={resetTimer}
              className="flex items-center px-4 py-2 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200"
            >
              <RotateCcw className="h-5 w-5 mr-2" />
              Reset
            </button>
          </div>

          {/* 进度条 */}
          <div className="mt-4 h-2 bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full transition-all duration-1000 ${
                isResting ? 'bg-yellow-500' : 'bg-green-500'
              }`}
              style={{
                width: `${(currentTime / (isResting ? restTime : workTime)) * 100}%`
              }}
            />
          </div>
        </>
      )}
    </div>
  );
}