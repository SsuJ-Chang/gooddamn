import { io } from 'socket.io-client';

/**
 * Socket.IO 使用端初始化
 *
 * 此模組處理 Socket.IO 使用端實例的設定和匯出。
 * 透過集中管理，我們確保整個應用程式使用單一、一致的
 * 後端伺服器連線。
 */

// 後端伺服器的 URL
// Docker 環境: 使用空字符串（相對路徑），通過 Nginx 代理訪問
// 開發環境: http://localhost:3001
// 生產環境: 您的 EC2 IP 或域名
const URL = import.meta.env.VITE_SOCKET_URL || '';

/**
 * `socket` 實例。
 *
 * 我們在這裡初始化連線。
 * `io(URL)`: 建立到指定 URL 伺服器的連線。
 * `{ autoConnect: false }`: 這是一個重要的優化。我們告訴 socket
 * 實例在建立時不要自動連線。我們將在狀態管理 store (`useStore.js`) 中
 * 手動呼叫 `socket.connect()`，當使用者實際準備好上線時。
 * 這可以防止使用者只是打開應用程式時產生不必要的連線。
 */
export const socket = io(URL, {
  autoConnect: false,
});
