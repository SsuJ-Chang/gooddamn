import { FaCheck } from 'react-icons/fa';

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
    // 響應式投票面板：手機版減少按鈕大小和間距，增加觸控反饋
    <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
      {VOTE_VALUES.map((value) => {
        // 確定此按鈕是否是使用者當前選擇的按鈕
        const isSelected = currentUserVote === value;

        return (
          <button
            key={value}
            onClick={() => onVote(value)}
            disabled={disabled}
            className={`
              relative
              w-14 sm:w-16 h-16 sm:h-20
              flex items-center justify-center 
              rounded-lg border-2
              text-xl sm:text-2xl font-bold 
              transition-all duration-200
              ${isSelected
                ? 'bg-gradient-to-br from-primary to-primary-light border-primary shadow-2xl shadow-primary/90 ring-4 ring-primary/60 text-white z-10' // 選中狀態：漸層背景、強陰影、光環、提升層級
                : 'bg-bg-tertiary border-bg-card text-text-primary' // 預設狀態樣式
              }
              ${disabled
                ? 'opacity-50 cursor-not-allowed' // 停用狀態樣式
                : isSelected
                  ? 'cursor-pointer' // 選中時不需要 hover 效果
                  : 'hover:border-primary hover:scale-105 active:scale-95 active:bg-primary/30 cursor-pointer' // 未選中時的 hover 和 active 樣式
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

