import { FiUsers, FiLogOut } from 'react-icons/fi';

/**
 * Header 頁首元件
 *
 * 此元件顯示房間的頂層資訊，例如房間名稱、ID 和參與者數量。
 * 它還提供「離開」按鈕。
 * 這是一個「展示型」元件；它只是顯示透過 props 傳遞給它的資料。
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {string} props.roomName - 房間的名稱
 * @param {string} props.roomId - 房間的唯一 ID
 * @param {number} props.userCount - 目前在房間中的使用者數量
 * @param {function} props.onLeave - 點擊「離開」按鈕時要呼叫的函數
 */
export function Header({ roomName, userCount, onLeave }) {

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-800 p-4 shadow-md">
      {/* 左側區塊：房間名稱 */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white">
          {roomName || 'Planning Poker'}
        </h1>

      </div>

      {/* 右側區塊：使用者數量和離開按鈕 */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-lg">
          <FiUsers className="text-gray-400" />
          <span className="font-semibold text-white">{userCount}</span>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <FiLogOut />
          <span>Leave</span>
        </button>
      </div>
    </header>
  );
}
