/**
 * Planning Poker 使用的標準 Fibonacci 數列
 */
const VOTE_VALUES = ['1', '2', '3', '5', '8', '13', '20', '?'];

/**
 * 投票面板元件
 *
 * 顯示投票按鈕列表（例如 '1', '2', '3', '5', ...）
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {string|null} props.currentUserVote - 使用者當前的投票，用於凸顯選中的按鈕
 * @param {function} props.onVote - 當按下投票按鈕時要呼叫的函數
 * @param {boolean} props.disabled - 投票按鈕是否應該被停用（例如，在投票揭示後）
 */
export function VotingPanel({ currentUserVote, onVote, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {VOTE_VALUES.map((value) => {
        // 確定此按鈕是否是使用者當前選擇的按鈕
        const isSelected = currentUserVote === value;

        return (
          <button
            key={value}
            onClick={() => onVote(value)}
            disabled={disabled}
            className={`
              w-16 h-20 
              flex items-center justify-center 
              rounded-lg border-2
              text-2xl font-bold 
              transition-all duration-150
              ${isSelected
                ? 'bg-primary-orange border-primary-orange scale-110' // 選中狀態樣式
                : 'bg-gray-700 border-gray-600' // 預設狀態樣式
              }
              ${disabled
                ? 'opacity-50 cursor-not-allowed' // 停用狀態樣式
                : 'hover:border-primary-orange hover:scale-105' // 啟用按鈕的 hover 樣式
              }
            `}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
