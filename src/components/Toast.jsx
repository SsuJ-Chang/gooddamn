import { useEffect, useState } from 'react';

/**
 * Toast 通知元件
 * 
 * 顯示一個覆蓋在畫面上的通知，帶透明度背景
 * 5 秒後自動消失，底部有進度條動畫
 * 
 * @param {string} message - 要顯示的訊息
 * @param {string} type - 通知類型: 'error' | 'success' | 'info'
 * @param {function} onClose - 關閉時的回調函數
 */
export function Toast({ message, type = 'error', onClose }) {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(100);

  const duration = 5000; // 5 秒

  useEffect(() => {
    if (!message) return;

    // 進度條動畫
    const startTime = Date.now();
    const progressInterval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);
    }, 50);

    // 5 秒後自動消失
    const timeout = setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        onClose?.();
      }, 300); // 等待淡出動畫完成
    }, duration);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(timeout);
    };
  }, [message, onClose]);

  if (!message) return null;

  // 根據類型設定顏色
  const colors = {
    error: {
      bg: 'bg-red-900/90',
      border: 'border-red-500',
      progress: 'bg-red-500',
      icon: '⚠️',
    },
    success: {
      bg: 'bg-green-900/90',
      border: 'border-green-500',
      progress: 'bg-green-500',
      icon: '✅',
    },
    info: {
      bg: 'bg-blue-900/90',
      border: 'border-blue-500',
      progress: 'bg-blue-500',
      icon: 'ℹ️',
    },
  };

  const colorSet = colors[type] || colors.error;

  return (
    <div
      className={`fixed top-20 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
        }`}
    >
      <div
        className={`${colorSet.bg} ${colorSet.border} border rounded-lg shadow-2xl backdrop-blur-sm min-w-[300px] max-w-[90vw] overflow-hidden`}
      >
        {/* 訊息內容 */}
        <div className="px-4 py-3 flex items-center gap-3">
          <span className="text-xl">{colorSet.icon}</span>
          <p className="text-white font-medium">{message}</p>
          {/* 關閉按鈕 */}
          <button
            onClick={() => {
              setIsVisible(false);
              setTimeout(() => onClose?.(), 300);
            }}
            className="ml-auto text-white/60 hover:text-white transition-colors"
          >
            ✕
          </button>
        </div>

        {/* 進度條 */}
        <div className="h-1 bg-black/30">
          <div
            className={`h-full ${colorSet.progress} transition-all duration-50`}
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
