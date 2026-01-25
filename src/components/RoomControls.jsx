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
 * @param {boolean} props.hasVotes - 房間內是否有人投票
 */
export function RoomControls({ onShowVotes, onResetVotes, votesVisible, hasVotes }) {
  return (
    // 響應式控制面板：手機版減少 padding 和間距
    <div className="flex items-center justify-center gap-2 sm:gap-4 rounded-lg bg-bg-secondary p-2 sm:p-4 shadow-md border border-bg-tertiary">
      {/* Reveal 按鈕 - 響應式 padding */}
      <button
        onClick={onShowVotes}
        disabled={votesVisible || !hasVotes}
        className="flex items-center gap-2 rounded-md bg-primary px-4 sm:px-6 py-2 sm:py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-secondary disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
      >
        <FiEye />
        <span>Reveal</span>
      </button>

      {/* New Round 按鈕 - 響應式 padding */}
      <button
        onClick={onResetVotes}
        disabled={!hasVotes}
        className="flex items-center gap-2 rounded-md bg-bg-tertiary px-4 sm:px-6 py-2 sm:py-3 font-bold text-text-primary shadow-lg transition-transform hover:scale-105 hover:bg-bg-card-hover focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-secondary disabled:opacity-50 disabled:scale-100 disabled:cursor-not-allowed"
      >
        <FiRefreshCw />
        <span>New Round</span>
      </button>
    </div>
  );
}
