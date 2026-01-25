import { useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { Loading } from '../components/Loading';
import { RoomPage } from './RoomPage';
import { Toast } from '../components/Toast';

export function RoomGuardPage() {
  const { roomId } = useParams();
  const navigate = useNavigate();

  const room = useStore((state) => state.room);
  const name = useStore((state) => state.name);
  const roomExists = useStore((state) => state.roomExists);
  const roomCheckLoading = useStore((state) => state.roomCheckLoading);
  const roomCheckData = useStore((state) => state.roomCheckData);
  const checkRoom = useStore((state) => state.checkRoom);
  const clearRoomCheck = useStore((state) => state.clearRoomCheck);
  const error = useStore((state) => state.error);
  const clearError = useStore((state) => state.clearError);

  useEffect(() => {
    // 1. 如果 store 已經有這個房間且名字已填，直接過
    if (room && room.id === roomId && name) {
      return;
    }

    // 2. 如果 store 的房間不對或是根本沒房間，發起檢查
    if (!room || room.id !== roomId) {
      checkRoom(roomId);
    }

    return () => {
      // 離開頁面時清理狀態是好習慣，但要注意不要影響正在運行的 socket
    };
  }, [roomId, room, name, checkRoom]);

  // 監聽檢查結果
  useEffect(() => {
    if (roomExists === false) {
      // 房間不存在
      console.log('[RoomGuard] Room not found');
    } else if (roomExists === true && !name) {
      // 房間存在但沒名字，導向首頁填寫名字
      navigate('/', {
        state: {
          roomId,
          roomName: roomCheckData?.name
        }
      });
    }
  }, [roomExists, name, roomId, roomCheckData, navigate]);

  // 處理錯誤
  if (roomExists === false) {
    return (
      <div className="flex flex-col items-center">
        <Toast
          message="Room not found or expired."
          type="error"
          onClose={() => {
            clearRoomCheck();
            navigate('/');
          }}
        />
        <button
          onClick={() => navigate('/')}
          className="mt-4 text-primary hover:underline"
        >
          Go back to Home
        </button>
      </div>
    );
  }

  // 如果連線報錯（例如被 Ban）
  if (error) {
    return (
      <div className="flex flex-col items-center">
        <Toast
          message={error.message || "An error occurred"}
          type="error"
          onClose={() => {
            clearError();
            navigate('/');
          }}
        />
      </div>
    );
  }

  // 載入中
  if (roomCheckLoading || (!room && roomExists === null)) {
    return <Loading message="Checking room availability..." />;
  }

  // 進入房間
  if (room && room.id === roomId && name) {
    return <RoomPage />;
  }

  // 預設
  return <Loading message="Entering room..." />;
}
