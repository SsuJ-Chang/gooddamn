import { FiEye, FiRefreshCw } from 'react-icons/fi';

/**
 * 房間控制元件
 *
 * 顯示房主的管理控制項，特別是
 * 「顯示投票」和「新回合」按鈕。
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {function} props.onShowVotes - 呼叫以揭示投票的函數
 * @param {function} props.onResetVotes - 呼叫以開始新投票回合的函數
 * @param {boolean} props.votesVisible - 投票目前是否可見，用於停用揭示按鈕
 */
export function RoomControls({ onShowVotes, onResetVotes, votesVisible }) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg bg-gray-800 p-4 shadow-md">
      <button
        onClick={onShowVotes}
        disabled={votesVisible}
        className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:scale-100"
      >
        <FiEye />
        <span>Reveal</span>
      </button>

      <button
        onClick={onResetVotes}
        className="flex items-center gap-2 rounded-md bg-gray-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <FiRefreshCw />
        <span>New Round</span>
      </button>
    </div>
  );
}
