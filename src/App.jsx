import { useStore } from './store/useStore';
import { NameInputPage } from './pages/NameInputPage';
import { LobbyPage } from './pages/LobbyPage';
import { RoomPage } from './pages/RoomPage';
import { NavHeader } from './components/NavHeader';
import { Footer } from './components/Footer';
import { AdminPage } from './pages/AdminPage';

/**
 * 主應用程式元件 (App.jsx)
 *
 * 此元件作為應用程式的主要「路由器」。
 * 它根據應用程式的當前狀態來決定顯示哪個頁面，
 * 狀態由 `useStore` (Zustand) hook 管理。
 */
function App() {
  // `useStore` 是我們用來存取全域狀態的 hook。
  // 我們使用選擇器函數來訂閱特定的狀態片段。
  // 只有當 `name` 或 `room` 的值改變時，元件才會重新渲染。
  // 這是一個關鍵的效能優化。
  const name = useStore((state) => state.name);
  const room = useStore((state) => state.room);

  /**
   * 此函數決定要渲染哪個元件（頁面）。
   * 這是一種簡單的條件式渲染形式，類似路由器的功能。
   */
  const renderCurrentPage = () => {
    // 🕵️ 隱藏的管理員路由
    // 優先檢查此路徑，這樣即使有狀態也能強制進入管理頁面
    if (window.location.pathname === '/taiwanno1111111111111') {
      return <AdminPage />;
    }

    // 如果使用者在房間裡，顯示 RoomPage。
    if (room) {
      return <RoomPage />;
    }
    // 如果使用者已設定名字但不在房間中，顯示 LobbyPage。
    if (name) {
      return <LobbyPage />;
    }
    // 否則，使用者需要輸入名字，所以顯示 NameInputPage。
    return <NameInputPage />;
  };

  // 應用程式的主容器。確保一致的佈局。
  // 使用 flex 佈局讓 Footer 始終在底部
  return (
    <div className="min-h-screen flex flex-col bg-bg-primary">
      {/* 導航頭部 */}
      <NavHeader />

      {/* 主要內容區域 - 加上頂部 padding 避免被固定的 Header 遮住 */}
      <main className="flex-1 flex flex-col items-center justify-center pt-14 sm:pt-16">
        {renderCurrentPage()}
      </main>

      {/* 頁尾 */}
      <Footer />
    </div>
  );
}

export default App;
