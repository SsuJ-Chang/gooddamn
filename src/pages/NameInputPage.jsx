import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Toast } from '../components/Toast';
import { Loading } from '../components/Loading';

/**
 * 名字輸入頁面元件
 *
 * 這是使用者看到的第一個頁面。支援兩種模式：
 * 1. 創建房間模式：名字輸入 + 房間名稱輸入
 * 2. 加入房間模式：顯示要加入的房間名稱 + 名字輸入
 */
export function NameInputPage() {
  const location = useLocation();
  const navigate = useNavigate();

  // 從 location state 取得房間資訊或錯誤訊息
  const { roomId, roomName, error: stateError } = location.state || {};
  const isJoinMode = !!roomId;

  // 本地狀態
  const [localName, setLocalName] = useState('');
  const [localRoomName, setLocalRoomName] = useState('');

  const [toastMessage, setToastMessage] = useState(stateError || null);
  const [isLoading, setIsLoading] = useState(false);

  // 當 location state 的 error 改變時（例如被導航回來時），更新 toast
  useEffect(() => {
    if (stateError) {
      setToastMessage(stateError);
      // 清除 history state 中的 error，避免重新整理後還在？ 
      // 這裡先簡單處理，主要是顯示出來
      window.history.replaceState({}, document.title);
    }
  }, [stateError]);

  // 從 store 取得必要的 actions
  const setName = useStore((state) => state.setName);
  const createRoom = useStore((state) => state.createRoom);
  const joinRoom = useStore((state) => state.joinRoom);
  const room = useStore((state) => state.room);
  const error = useStore((state) => state.error);
  const clearError = useStore((state) => state.clearError);

  // 監聽房間狀態變化，如果成功進入房間則跳轉
  useEffect(() => {
    if (room) {
      if (isJoinMode && room.id === roomId) {
        // 加入模式：如果是目標房間，跳轉
        // RoomGuardPage 會處理這裡，或者我們可以直接跳到 /room/:id
        // 為了安全起見，我們讓 App 路由處理，但這裡不需做什麼，因為 room 存在 App.jsx 會重新渲染？
        // 不，我們使用了 React Router，需要手動導航
        navigate(`/room/${room.id}`);
      } else if (!isJoinMode) {
        // 創建模式：只要有 room 就跳轉（假設是用戶剛創建的）
        navigate(`/room/${room.id}`);
      }
    }
  }, [room, isJoinMode, roomId, navigate]);

  // 監聽全局錯誤（例如加入失敗、房間已滿）
  useEffect(() => {
    if (error) {
      console.log('[NameInputPage] Received global error:', error);
      const msg = error.message || 'An error occurred';

      clearError();
      setIsLoading(false); // 停止載入狀態

      if (isJoinMode) {
        // 加入模式下失敗，回到首頁
        console.log('[NameInputPage] Join failed, redirecting to home with error');
        navigate('/', { state: { error: msg } });
      } else {
        // 創建模式下失敗，顯示 Toast
        console.log('[NameInputPage] Create failed, showing toast');
        setToastMessage(msg);
      }
    }
  }, [error, clearError, isJoinMode, navigate]);

  // Timeout Safety Net: 防止 Loading 狀態卡死
  useEffect(() => {
    let timer;
    if (isLoading) {
      timer = setTimeout(() => {
        console.log('[NameInputPage] Operation timed out');
        setIsLoading(false);

        const timeoutMsg = 'Connection timed out. Please try again.';

        if (isJoinMode) {
          navigate('/', { state: { error: timeoutMsg } });
        } else {
          setToastMessage(timeoutMsg);
        }
      }, 5000); // 5秒超時
    }
    return () => clearTimeout(timer);
  }, [isLoading, isJoinMode, navigate]);

  /**
   * 處理表單提交
   */
  const handleSubmit = (e) => {
    e.preventDefault();
    if (isLoading) return;

    const trimmedName = localName.trim();
    if (!trimmedName) return;

    // 設定名字到 store
    setName(trimmedName);
    setIsLoading(true);

    if (isJoinMode) {
      // 加入房間模式：直接加入指定的房間
      joinRoom(roomId);
      // 無需手動導航，RoomGuardPage 會處理
    } else {
      // 創建房間模式：創建新房間
      const finalRoomName = localRoomName.trim() || `${trimmedName}'s Room`;
      createRoom(finalRoomName);
    }
  };

  if (isLoading) {
    return <Loading message={isJoinMode ? 'Joining room...' : 'Creating room...'} />;
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center bg-bg-primary py-8">
      {toastMessage && (
        <Toast
          message={toastMessage}
          type="error"
          onClose={() => setToastMessage(null)}
        />
      )}
      <div className="rounded-lg bg-bg-secondary p-6 sm:p-8 shadow-2xl w-full max-w-sm border border-bg-tertiary">
        {/* 標題：根據模式顯示不同內容 */}
        <Link to="/" className="mb-6 block text-center text-2xl sm:text-3xl font-bold text-text-primary hover:text-primary transition-colors">
          Welcome to Gooddamn
        </Link>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {/* 名字輸入 */}
          <label htmlFor="name-input" className="sr-only">Your Name</label>
          <input
            id="name-input"
            type="text"
            value={localName}
            onChange={(e) => setLocalName(e.target.value)}
            placeholder="Enter your name"
            className="rounded-md border-2 border-bg-tertiary bg-bg-tertiary px-4 py-2.5 sm:py-3 text-lg text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary w-full"
            style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
            required
            autoFocus
          />

          {/* 房間名稱輸入（僅在創建房間模式顯示） */}
          {!isJoinMode && (
            <>
              <label htmlFor="room-name-input" className="sr-only">Room Name (Optional)</label>
              <input
                id="room-name-input"
                type="text"
                value={localRoomName}
                onChange={(e) => setLocalRoomName(e.target.value)}
                placeholder="Room name (Optional)"
                className="rounded-md border-2 border-bg-tertiary bg-bg-tertiary px-4 py-2.5 sm:py-3 text-lg text-text-primary placeholder-text-muted focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary w-full"
                style={{ backgroundColor: 'var(--color-bg-tertiary)' }}
              />
            </>
          )}

          {/* 提交按鈕 */}
          <button
            type="submit"
            className="rounded-md bg-primary px-4 py-2.5 sm:py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 hover:bg-primary-light focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-bg-secondary disabled:opacity-50"
            disabled={!localName.trim() || isLoading}
          >
            {isLoading
              ? (isJoinMode ? 'Joining...' : 'Creating...')
              : (isJoinMode ? 'Join Room' : 'Create Room')
            }
          </button>

          {/* 如果是加入模式，提供返回首頁的按鈕 */}

        </form>
      </div>
    </div>
  );
}
