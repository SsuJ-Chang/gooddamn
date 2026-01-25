import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import App from './App.jsx';
import './index.css';

/**
 * React 應用程式進入點
 *
 * 此檔案是整個 React 應用程式的起始點。
 *
 * 1.  `import React from 'react'`: 匯入 React 函式庫，這是定義和使用 React 元件所必需的。
 * 2.  `import ReactDOM from 'react-dom/client'`: 匯入用於與 DOM（頁面的 HTML 結構）互動的函式庫。
 * 3.  `import App from './App.jsx'`: 匯入應用程式的主要根元件。所有其他元件都將是此元件的子元件。
 * 4.  `import './index.css'`: 匯入全域樣式表。這包含我們的 Tailwind CSS 指令和任何全域樣式。
 *
 * 5.  `ReactDOM.createRoot(document.getElementById('root'))`: 這會在 `index.html` 中找到 id 為 "root" 的 `<div>`。
 *     這個 `div` 是整個 React 應用程式將被渲染的容器。
 *
 * 6.  `.render(...)`: 這是啟動渲染過程的函數。
 *
 * 7.  `<React.StrictMode>`: 這是一個特殊的 React 元件，有助於在應用程式中發現潛在問題。
 *     它會為其子元件啟動額外的檢查和警告。它不會渲染任何可見的 UI，僅在開發模式下運行。
 */
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
