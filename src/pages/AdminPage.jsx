import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { FiTrash2, FiRefreshCw, FiAlertTriangle, FiZap } from 'react-icons/fi';

/**
 * 隱藏的管理員儀表板
 * 路徑: /taiwanno1111111111111
 */
export function AdminPage() {
  const fetchAdminData = useStore((state) => state.fetchAdminData);
  const connect = useStore((state) => state.connect);
  const isConnected = useStore((state) => state.isConnected);
  const adminData = useStore((state) => state.adminData);
  const adminDeleteRoom = useStore((state) => state.adminDeleteRoom);
  const adminDeleteUser = useStore((state) => state.adminDeleteUser);
  const adminNuke = useStore((state) => state.adminNuke);

  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set()); // Format: "roomId:userId"

  useEffect(() => {
    // 確保 socket 已連線
    if (!isConnected) {
      connect();
    }
    fetchAdminData();
    // 設置定時重整以防 Socket 漏接
    const interval = setInterval(fetchAdminData, 5000);
    return () => clearInterval(interval);
  }, [fetchAdminData, connect, isConnected]);

  // 處理房間勾選
  const toggleRoom = (roomId) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
      // 取消選取房間時，也取消選取該房間的所有使用者
      // (雖然邏輯上刪除房間就會刪除使用者，但為了 UI 一致性)
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
  };

  // 處理使用者勾選
  const toggleUser = (roomId, userId) => {
    const key = `${roomId}:${userId}`;
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(key)) {
      newSelected.delete(key);
    } else {
      newSelected.add(key);
    }
    setSelectedUsers(newSelected);
  };

  // 執行選取刪除
  const handleDestroySelected = () => {
    if (!window.confirm(`Are you sure you want to destroy ${selectedRooms.size} rooms and ${selectedUsers.size} users?`)) return;

    // 刪除選取的房間
    selectedRooms.forEach(roomId => {
      adminDeleteRoom(roomId);
    });

    // 刪除選取的使用者
    selectedUsers.forEach(key => {
      const [roomId, userId] = key.split(':');
      // 如果房間已經被選取要刪除，就不需要單獨刪除使用者了
      if (!selectedRooms.has(roomId)) {
        adminDeleteUser(roomId, userId);
      }
    });

    // 清空選取
    setSelectedRooms(new Set());
    setSelectedUsers(new Set());
  };

  const handleNuke = () => {
    if (window.confirm('WARNING: THIS WILL DELETE ALL ROOMS AND KICK ALL USERS. ARE YOU SURE?')) {
      if (window.confirm('DOUBLE CHECK: This action cannot be undone.')) {
        adminNuke();
      }
    }
  };

  if (!adminData) return <div className="p-8 text-center bg-bg-primary min-h-screen text-text-primary">Loading Admin Data...</div>;

  const roomIds = Object.keys(adminData);

  return (
    <div className="min-h-screen bg-bg-primary p-4 sm:p-8 text-text-primary">
      <div className="max-w-6xl mx-auto">
        <header className="flex flex-col sm:flex-row items-center justify-between mb-8 gap-4">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FiZap className="text-yellow-400 animate-pulse" /> GOD MODE
          </h1>
          <div className="flex gap-2">
            <button
              onClick={fetchAdminData}
              className="p-2 rounded bg-bg-tertiary hover:bg-bg-card-hover transition-colors"
            >
              <FiRefreshCw />
            </button>
            <button
              onClick={handleDestroySelected}
              disabled={selectedRooms.size === 0 && selectedUsers.size === 0}
              className="px-4 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <FiTrash2 /> DESTROY Selected
            </button>
            <button
              onClick={handleNuke}
              className="px-4 py-2 bg-red-800 text-white rounded font-bold hover:bg-red-900 border-2 border-red-500 animate-pulse flex items-center gap-2"
            >
              <FiAlertTriangle /> BOOM!
            </button>
          </div>
        </header>

        <div className="grid grid-cols-1 gap-6">
          {roomIds.length === 0 ? (
            <div className="text-center py-12 text-text-muted bg-bg-secondary rounded-lg">
              No active rooms on server.
            </div>
          ) : (
            roomIds.map(roomId => {
              const room = adminData[roomId];
              const userIds = Object.keys(room.users || {});

              return (
                <div key={roomId} className={`bg-bg-secondary rounded-lg border-2 p-4 transition-colors ${selectedRooms.has(roomId) ? 'border-red-500 bg-red-500/10' : 'border-bg-tertiary'}`}>
                  {/* Room Header */}
                  <div className="flex items-center gap-4 mb-4 pb-2 border-b border-bg-tertiary">
                    <input
                      type="checkbox"
                      checked={selectedRooms.has(roomId)}
                      onChange={() => toggleRoom(roomId)}
                      className="w-6 h-6 accent-red-500 cursor-pointer"
                    />
                    <div className="flex-1">
                      <h2 className="text-xl font-bold flex items-center gap-2">
                        {room.name}
                        <span className="text-sm font-normal text-text-muted">({roomId})</span>
                      </h2>
                      <div className="text-sm text-text-secondary">
                        Owner: {room.users[room.owner]?.name || 'Unknown'} | Created: {new Date(room.createdAt).toLocaleTimeString()}
                      </div>
                    </div>
                    {/* Individual Room Actions */}
                    <button
                      onClick={() => { if (window.confirm('Delete this room?')) adminDeleteRoom(roomId); }}
                      className="text-red-400 hover:text-red-300 px-3 py-1 border border-red-400/30 rounded"
                    >
                      Delete Room
                    </button>
                  </div>

                  {/* Users List */}
                  <div className="pl-8 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                    {userIds.map(userId => {
                      const user = room.users[userId];
                      const key = `${roomId}:${userId}`;
                      const isSelected = selectedUsers.has(key) || selectedRooms.has(roomId);

                      return (
                        <div key={userId} className={`flex items-center gap-3 p-2 rounded bg-bg-tertiary ${isSelected ? 'ring-1 ring-red-400' : ''}`}>
                          <input
                            type="checkbox"
                            checked={selectedUsers.has(key) || selectedRooms.has(roomId)}
                            onChange={() => toggleUser(roomId, userId)}
                            disabled={selectedRooms.has(roomId)} // 如果房間被選了，強制選取
                            className="w-4 h-4 accent-red-500 cursor-pointer"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate">{user.name}</div>
                            <div className="text-xs text-text-muted truncate">{userId}</div>
                          </div>
                          <button
                            onClick={() => { if (window.confirm(`Kick ${user.name}?`)) adminDeleteUser(roomId, userId); }}
                            className="text-red-400 hover:text-red-300 p-1"
                            title="Kick"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      );
                    })}
                    {userIds.length === 0 && (
                      <div className="text-text-muted italic text-sm">No users in room</div>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
