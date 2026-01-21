import { FiUsers, FiLogOut, FiCheck } from 'react-icons/fi';
import { RoomTimer } from './RoomTimer';

/**
 * Header 頁首元件
 *
 * 此元件顯示房間的頂層資訊，例如房間名稱、ID 和參與者數量。
 * 它還提供「離開」按鈕。
 * 這是一個「展示型」元件；它只是顯示透過 props 傳遞給它的資料。
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {string} props.roomName - 房間的名稱
 * @param {number} props.userCount - 目前在房間中的使用者數量
 * @param {number} props.votedCount - 已投票的使用者數量 (mobile only)
 * @param {number} props.expiresAt - 房間過期時間戳
 * @param {function} props.onLeave - 點擊「離開」按鈕時要呼叫的函數
 */
export function Header({ roomName, userCount, votedCount, expiresAt, onLeave }) {

  return (
    // 響應式 Header：手機版減少 padding
    <header className="flex flex-wrap items-center justify-between gap-2 sm:gap-4 rounded-lg bg-bg-secondary p-2 sm:p-4 shadow-md border border-bg-tertiary">
      {/* 左側區塊：房間名稱和倒數計時 */}
      <div className="flex flex-col gap-1">
        <h1 className="text-lg sm:text-2xl font-bold text-text-primary">
          {roomName || 'Planning Poker'}
        </h1>
        {/* 房間倒數計時器 */}
        {expiresAt && <RoomTimer expiresAt={expiresAt} />}
      </div>

      {/* 右側區塊：使用者數量、投票統計（手機版）和離開按鈕 */}
      <div className="flex items-center gap-2 sm:gap-6">
        {/* 投票統計：只在手機版且有 votedCount 時顯示 */}
        {votedCount !== undefined && (
          <div className="flex items-center gap-1 text-sm sm:hidden">
            <FiCheck className="text-primary-light" />
            <span className="font-semibold text-text-primary">
              {votedCount}/{userCount}
            </span>
          </div>
        )}

        {/* 使用者數量：桌面版顯示 */}
        <div className="hidden sm:flex items-center gap-2 text-lg">
          <FiUsers className="text-text-muted" />
          <span className="font-semibold text-text-primary">{userCount}</span>
        </div>

        {/* 離開按鈕：手機版只顯示圖標，桌面版顯示文字 */}
        <button
          onClick={onLeave}
          className="flex items-center gap-2 rounded-md bg-red-600 px-2 sm:px-4 py-1.5 sm:py-2 font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-bg-secondary"
        >
          <FiLogOut />
          <span className="hidden sm:inline">Leave</span>
        </button>
      </div>
    </header>
  );
}

