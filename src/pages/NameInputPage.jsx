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
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
      <div className="rounded-lg bg-gray-800 p-8 shadow-2xl w-full max-w-sm">
        <h1 className="mb-6 text-center text-3xl font-bold text-white">
          Welcome to Gooddamn
        </h1>
        {/*
          表單上的 `onSubmit` 事件是處理提交的標準方式。
          它適用於點擊按鈕和在輸入欄位按 Enter 鍵。
        */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <label htmlFor="name-input" className="sr-only">您的名字</label>
          <input
            id="name-input"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Enter your name"
            className="rounded-md border-2 border-gray-600 bg-gray-700 px-4 py-3 text-lg text-white placeholder-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange"
            required
            autoFocus
          />
          <button
            type="submit"
            className="rounded-md bg-primary-orange px-4 py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50"
            disabled={!localName.trim()}
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
}
