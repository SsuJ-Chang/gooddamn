import { useState, useEffect } from 'react';

/**
 * 房間倒數計時器元件
 * 顯示房間剩餘時間，最後 5 分鐘變紅色
 * 
 * @param {number} expiresAt - 房間過期時間戳（毫秒）
 */
export function RoomTimer({ expiresAt }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!expiresAt) return;

    const calculateTimeLeft = () => {
      const now = Date.now();
      const remaining = Math.max(0, expiresAt - now);
      return remaining;
    };

    // 初始計算
    setTimeLeft(calculateTimeLeft());

    // 每秒更新
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  if (timeLeft === null) return null;

  // 格式化時間 H:MM:SS
  const hours = Math.floor(timeLeft / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formattedTime = `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  // 最後 5 分鐘變紅色
  const isWarning = timeLeft <= 5 * 60 * 1000;

  return (
    <div className={`flex items-center gap-1 text-sm font-mono ${isWarning ? 'text-red-400' : 'text-text-muted'}`}>
      <span>⏱️</span>
      <span>{formattedTime}</span>
    </div>
  );
}
