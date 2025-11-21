import { useState, useEffect } from 'react';
import { useStore } from '../store/useStore';

/**
 * 大廳頁面元件
 *
 * 此頁面在使用者輸入名字後顯示。
 * 它提供兩個主要功能：建立新房間或透過房間列表加入現有房間。
 */
export function LobbyPage() {


  // 從 Zustand store 取得必要的 actions 和狀態。
  // 注意我們如何在單個 hook 中從 store 選擇多個項目。
  const name = useStore((state) => state.name);
  const roomList = useStore((state) => state.roomList);
  const createRoom = useStore((state) => state.createRoom);
  const joinRoom = useStore((state) => state.joinRoom);
  const getRoomList = useStore((state) => state.getRoomList);
  const error = useStore((state) => state.error);

  // 在元件載入時取得房間列表。
  useEffect(() => {
    getRoomList();
  }, [getRoomList]);



  return (
    <div className="flex h-screen flex-col items-center justify-center bg-gray-900">
      {/* 響應式容器：手機版減少 padding */}
      <div className="rounded-lg bg-gray-800 p-6 sm:p-8 shadow-2xl w-full max-w-md">
        {/* 響應式標題：手機版較小字體 */}
        <h1 className="mb-2 text-center text-2xl sm:text-3xl font-bold text-white">Lobby</h1>
        <p className="mb-8 text-center text-base sm:text-lg text-gray-300">
          Welcome, <span className="font-bold text-primary-orange">{name}</span>! Let's Gooddamn!
        </p>

        {/* 建立房間區塊 */}
        <div className="mb-8">
          {/* 響應式次標題 */}
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-white">Create a New Room</h2>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const roomNameInput = document.getElementById('room-name-input');
              const roomName = roomNameInput.value.trim() || `${name}'s Room`;
              createRoom(roomName);
            }}
            className="flex flex-col gap-4"
          >
            {/* 響應式輸入框 */}
            <input
              type="text"
              placeholder="Enter Room Name (Optional)"
              className="rounded-md border-2 border-gray-600 bg-gray-700 px-4 py-2.5 sm:py-3 text-lg text-white placeholder-gray-400 focus:border-primary-orange focus:outline-none focus:ring-2 focus:ring-primary-orange"
              id="room-name-input"
            />
            {/* 響應式按鈕 */}
            <button
              type="submit"
              className="w-full rounded-md bg-primary-orange px-4 py-2.5 sm:py-3 text-lg font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-orange focus:ring-offset-2 focus:ring-offset-gray-800"
            >
              Create Room
            </button>
          </form>
        </div>

        {/* 可用房間列表區塊 */}
        <div className="mb-8">
          {/* 響應式次標題 */}
          <h2 className="mb-4 text-lg sm:text-xl font-semibold text-white">Available Rooms</h2>
          {roomList.length === 0 ? (
            <p className="text-center text-gray-400">No rooms available. Create one!</p>
          ) : (
            <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
              {roomList.map((room) => (
                <div
                  key={room.id}
                  className="flex items-center justify-between rounded-md bg-gray-700 p-3 sm:p-4 shadow-md transition-colors hover:bg-gray-600"
                >
                  <div>
                    <h3 className="font-bold text-white">{room.name}</h3>
                    <p className="text-sm text-gray-400">
                      Host: {room.ownerName} • {room.userCount}/{room.maxUsers} Users
                    </p>
                  </div>
                  <button
                    onClick={() => joinRoom(room.id)}
                    className="rounded-md bg-green-600 px-3 py-1 text-sm font-bold text-white shadow-sm transition-transform hover:scale-105 hover:bg-green-500 focus:outline-none focus:ring-2 focus:ring-green-500"
                    disabled={room.userCount >= room.maxUsers}
                  >
                    {room.userCount >= room.maxUsers ? 'Full' : 'Join'}
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>



        {/*
          錯誤顯示：如果 `error` 狀態不為 null，表示伺服器發送了錯誤
          （例如，房間未找到），我們將向使用者顯示它。
        */}
        {error && (
          <p className="mt-4 text-center text-red-400">{error}</p>
        )}
      </div>
    </div >
  );
}
