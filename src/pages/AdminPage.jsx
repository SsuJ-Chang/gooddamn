import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';
import { Link } from 'react-router-dom';
import { NavHeader } from '../components/NavHeader';
import { FiTrash2, FiRefreshCw, FiAlertTriangle, FiZap, FiHome, FiUsers } from 'react-icons/fi';

export function AdminPage() {
  // 1. Store Hooks (Top Level)
  const adminData = useStore((state) => state.adminData);
  const fetchAdminData = useStore((state) => state.fetchAdminData);
  const deleteRoom = useStore((state) => state.adminDeleteRoom);
  const deleteUser = useStore((state) => state.adminDeleteUser);
  const nukeRooms = useStore((state) => state.adminNuke);

  const isAuthenticated = useStore((state) => state.adminIsAuthenticated);
  const authenticate = useStore((state) => state.adminAuth);

  const connect = useStore((state) => state.connect);
  const isConnected = useStore((state) => state.isConnected);

  // 2. Local State Hooks (Must be Top Level)
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // 這些原本被放在 conditional return 之後，導致了 Crash
  const [selectedRooms, setSelectedRooms] = useState(new Set());
  const [selectedUsers, setSelectedUsers] = useState(new Set());

  // 3. Effects (Top Level)
  // 處理登入提交
  const handleLogin = (e) => {
    e.preventDefault();
    authenticate(password);
    setTimeout(() => {
      if (!useStore.getState().adminIsAuthenticated) {
        setErrorMsg('Invalid Password');
      }
    }, 1000);
  };

  useEffect(() => {
    if (!isConnected) {
      connect();
    }
    if (isAuthenticated) {
      fetchAdminData();
      const interval = setInterval(fetchAdminData, 3000);
      return () => clearInterval(interval);
    }
  }, [fetchAdminData, isAuthenticated, isConnected, connect]);

  // 4. Helper Functions
  const toggleRoom = (roomId) => {
    const newSelected = new Set(selectedRooms);
    if (newSelected.has(roomId)) {
      newSelected.delete(roomId);
    } else {
      newSelected.add(roomId);
    }
    setSelectedRooms(newSelected);
  };

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

  const handleDestroySelected = () => {
    if (!window.confirm(`Are you sure you want to destroy ${selectedRooms.size} rooms and ${selectedUsers.size} users?`)) return;

    selectedRooms.forEach(roomId => {
      deleteRoom(roomId);
    });

    selectedUsers.forEach(key => {
      const [roomId, userId] = key.split(':');
      if (!selectedRooms.has(roomId)) {
        deleteUser(roomId, userId);
      }
    });

    setSelectedRooms(new Set());
    setSelectedUsers(new Set());
  };

  const handleNuke = () => {
    if (window.confirm('WARNING: THIS WILL DELETE ALL ROOMS AND KICK ALL USERS. ARE YOU SURE?')) {
      if (window.confirm('DOUBLE CHECK: This action cannot be undone.')) {
        nukeRooms();
      }
    }
  };

  // 5. Conditional Rendering
  // 如果未認證，回傳登入 UI
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-bg-primary text-text-primary font-sans flex items-center justify-center p-4">
        <div className="bg-bg-secondary p-8 rounded-2xl shadow-2xl border border-white/5 w-full max-w-md">
          <h1 className="text-2xl font-bold mb-6 text-center">Be GOD</h1>
          <form onSubmit={handleLogin} className="space-y-4">
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              className="w-full bg-bg-tertiary border border-white/10 rounded px-4 py-2 focus:outline-none focus:border-primary transition-colors text-center font-mono text-lg text-white"
              autoFocus
            />
            {errorMsg && <p className="text-red-400 text-sm text-center">{errorMsg}</p>}
            <button
              type="submit"
              className="w-full bg-primary hover:bg-primary-light text-white font-bold py-2 px-4 rounded transition-all active:scale-95"
            >
              Go
            </button>
          </form>

        </div>
      </div>
    );
  }

  // 如果已認證但資料未載入
  if (!adminData) return <div className="p-8 text-center bg-bg-primary min-h-screen text-text-primary">Loading Admin Data...</div>;

  const roomIds = Object.keys(adminData);
  const totalUsers = roomIds.reduce((sum, id) => sum + Object.keys(adminData[id].users || {}).length, 0);

  // 認證後的 Dashboard UI
  return (
    <div className="min-h-screen bg-bg-primary text-text-primary font-sans p-4 sm:p-8">
      <NavHeader />
      <div className="max-w-6xl mx-auto pt-20">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-red-400 flex items-center gap-2">🔥 God Mode</h1>

          <div className="flex items-center gap-6 text-text-muted">
            <div className="flex items-center gap-2" title={`Rooms: ${roomIds.length}/30`}>
              <FiHome className="text-xl" />
              <span className="font-mono text-sm">({roomIds.length}/30)</span>
            </div>
            <div className="flex items-center gap-2" title={`Users: ${totalUsers}/300`}>
              <FiUsers className="text-xl" />
              <span className="font-mono text-sm">({totalUsers}/300)</span>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8 p-4 bg-bg-secondary/50 rounded-xl border border-white/5">
          <button
            onClick={fetchAdminData}
            className="p-2.5 rounded bg-bg-tertiary hover:bg-bg-card-hover transition-colors text-xl"
            title="Refresh Data"
          >
            <FiRefreshCw />
          </button>

          <button
            onClick={handleDestroySelected}
            disabled={selectedRooms.size === 0 && selectedUsers.size === 0}
            className="px-6 py-2 bg-red-600 text-white rounded font-bold hover:bg-red-700 disabled:opacity-30 disabled:cursor-not-allowed flex items-center gap-2 transition-all"
          >
            <FiTrash2 /> Kick!
          </button>

          <div className="flex-1" />

          <button
            onClick={handleNuke}
            className="px-6 py-2 bg-red-800 hover:bg-red-900 border border-red-500 text-white rounded font-bold shadow-lg transition-all flex items-center gap-2 active:scale-95"
          >
            <span>☢️ BOOM!</span>
          </button>
        </div>

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
                      onClick={() => { if (window.confirm('Delete this room?')) deleteRoom(roomId); }}
                      className="text-red-400 hover:text-red-300 p-2 hover:bg-red-400/10 rounded-full transition-colors"
                      title="Delete Room"
                    >
                      <FiTrash2 size={20} />
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
                            onClick={() => { if (window.confirm(`Kick ${user.name}?`)) deleteUser(roomId, userId); }}
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
