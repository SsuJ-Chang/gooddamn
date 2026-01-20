import { useState } from 'react';
import { useStore } from '../store/useStore';

/**
 * 名字輸入頁面元件
 *
 * 這是使用者看到的第一個頁面。這是一個簡單的表單，詢問使用者的名字。
 * 一旦提交名字，它將被儲存到全域狀態中，使用者將進入大廳頁面。
 */
export function NameInputPage() {
  // `useState` 是一個 React Hook，讓你可以在元件中添加狀態變數。
  // 這裡，`localName` 將儲存文字輸入框的當前值。
  // `setLocalName` 是用來更新它的函數。
  const [localName, setLocalName] = useState('');

  // 我們從 Zustand store 取得 `setName` 函數。我們只需要這個 action。
  const setName = useStore((state) => state.setName);

  /**
   * 處理表單提交
   * @param {Event} e - 表單提交事件
   */
  const handleSubmit = (e) => {
    // `e.preventDefault()` 防止瀏覽器重新載入頁面，這是表單的預設行為。
    e.preventDefault();

    // 去除名字的空白字元並檢查是否不為空。
    const trimmedName = localName.trim();
    if (trimmedName) {
      // 呼叫 store 的 `setName` action 來更新全域狀態。
      // 這將觸發 `App` 元件顯示 `LobbyPage`。
      setName(trimmedName);
    }
  };

  return (
    <div className="flex h-screen flex-col items-center justify-center bg-bg-primary">
      {/* 響應式容器：手機版減少 padding */}
      <div className="rounded-lg bg-bg-secondary p-6 sm:p-8 shadow-2xl w-full max-w-sm border border-bg-tertiary">
        {/* 響應式標題：手機版較小字體 */}
        <h1 className="mb-6 text-center text-2xl sm:text-3xl font-bold text-text-primary">
          Welcome to Gooddamn
        </h1>
        {/*
          表單上的 `onSubmit` 事件是處理提交的標準方式。
          它適用於點擊按鈕和在輸入欄位按 Enter 鍵。
        */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="name-input" className="sr-only">您的名字</label>
          {/* 響應式輸入框：手機版減少垂直 padding */}
          <input
            id="name-input"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Enter your name"
            className="rounded-md border-2 border-bg-tertiary bg-bg-tertiary px-4 py-2.5 sm:py-3 text-lg text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary"
            required
            autoFocus
          />
          {/* 響應式按鈕：手機版減少垂直 padding */}
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2.5 sm:py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-secondary disabled:opacity-50"
            disabled={!localName.trim()}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
