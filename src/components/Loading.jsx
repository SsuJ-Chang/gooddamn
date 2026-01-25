import React from 'react';

/**
 * Loading 載入中元件
 *
 * 一個共用的載入頁面/元件，用於建立房間、加入房間或檢查房間等等待狀態。
 * 統一了全站的等待視覺表現。
 *
 * @param {object} props
 * @param {string} props.message - 顯示在 spinner 下方的文字
 */
export function Loading({ message = 'Loading...' }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-primary py-8 h-full min-h-[50vh]">
      <div className="rounded-lg bg-bg-secondary p-8 shadow-2xl border border-bg-tertiary">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
          <p className="text-text-secondary font-medium animate-pulse">{message}</p>
        </div>
      </div>
    </div>
  );
}
