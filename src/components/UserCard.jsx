import { FiCheck, FiHelpCircle } from 'react-icons/fi';

/**
 * 使用者卡片元件
 *
 * 此元件顯示房間中單個使用者的卡片。它顯示他們的名字
 * 和投票狀態（未投票、已投票或投票值）。
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {object} props.user - 使用者物件，包含名字和投票
 * @param {boolean} props.isCurrentUser - 如果此卡片代表正在查看應用程式的人，則為 true
 * @param {boolean} props.votesVisible - 如果投票已被房主揭示，則為 true
 * @param {boolean} props.isHighlighted - 如果此卡片擁有最多票的值，則為 true
 */
export function UserCard({ user, isCurrentUser, votesVisible, isHighlighted = false }) {
  // 衍生布林值，用於輕鬆檢查使用者是否已提交投票
  const hasVoted = user.vote !== null;

  return (
    // 卡片的主要容器 - 響應式高度和樣式
    // `relative` 對於在其內部絕對定位使用者名稱至關重要
    // `h-32 sm:h-40` 手機版較矮，桌面版較高
    // `rounded-lg` 給它漂亮的圓角
    // `bg-primary-orange` 從我們的主題設定背景顏色
    // `overflow-hidden` 是一個好習慣，確保沒有東西溢出圓角
    <div className={`relative h-32 sm:h-40 rounded-lg text-white shadow-lg overflow-hidden border-2 ${isHighlighted
      ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300 ring-4 ring-yellow-400 animate-[gentle-shake_0.5s_ease-in-out_infinite]'
      : 'bg-primary-orange border-white'
      }`}>
      {/*
       * 投票顯示容器 - 響應式大小
       * 定位在卡片高度的上方
       * text-5xl sm:text-7xl 手機版較小的圖標/數字
      */}
      <div className="flex h-full w-full items-start justify-center pt-7">
        {!votesVisible ? (
          // --- 在投票顯示之前要展示的內容 ---
          hasVoted ? (
            // 如果使用者已投票，顯示綠色勾選記號 - 響應式大小
            <FiCheck className="text-5xl sm:text-7xl text-green-300 drop-shadow-lg" />
          ) : (
            // 如果使用者尚未投票，顯示灰色問號 - 響應式大小
            <FiHelpCircle className="text-5xl sm:text-7xl text-gray-200 drop-shadow-lg" />
          )
        ) : (
          // --- 在投票顯示之後要展示的內容 ---
          // 顯示使用者的投票值 - 響應式字體大小
          <span className="text-5xl sm:text-7xl font-bold" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.5)' }}>{user.vote || '-'}</span>
        )}
      </div>

      {/*
       * 使用者名稱顯示 - 響應式字體和位置
       * 此 div 定位在卡片底部
       * `absolute`: 將元素從正常佈局流程中取出
       * `bottom-3 sm:bottom-5`: 手機版離底部較近，桌面版較遠
       * `left-1/2 -translate-x-1/2`: 這是完美水平置中的標準技巧
       *   它將元素的左邊緣移動到中心，然後將其向左移動自身寬度的一半
       * `w-full text-center`: 確保內部文字居中（如果換行）
       * `isCurrentUser ? 'underline' : ''`: 我們為當前使用者的名字加底線，幫助他們找到自己的卡片
      */}
      <div
        className={`absolute bottom-3 sm:bottom-5 left-1/2 w-full -translate-x-1/2 px-2 text-center text-lg sm:text-xl font-bold truncate ${isCurrentUser ? 'underline' : ''
          }`}
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
      >
        {user.name}
      </div>
    </div>
  );
}
