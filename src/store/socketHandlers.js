import { socket } from '../lib/socket';

/**
 * Socket 事件處理中心
 */
export const initSocketHandlers = (storeActions) => {
  const { set, get } = storeActions;

  socket.on('connect', () => {
    const { name } = get();
    console.log('[Socket] Connected. ID:', socket.id);
    set({ isConnected: true, clientId: socket.id });
    if (name) socket.emit('register', { name });
  });

  socket.on('disconnect', () => {
    set({ isConnected: false, adminIsAuthenticated: false });
  });

  socket.on('roomStateUpdated', (roomData) => {
    console.log('[Socket] roomStateUpdated:', roomData?.id);
    set({ room: roomData, error: null });
  });

  socket.on('roomCheckResult', ({ exists, roomData }) => {
    set({ 
      roomExists: exists, 
      roomCheckLoading: false,
      roomCheckData: roomData || null
    });
  });

  socket.on('adminDataUpdated', (adminData) => {
    set({ adminData });
  });

  socket.on('adminAuthResult', ({ success }) => {
    set({ adminIsAuthenticated: success });
    if (success) socket.emit('adminGetData');
  });

  socket.on('roomError', (errorData) => {
    console.log('[Socket] roomError:', errorData);
    set({ error: errorData });
  });

  socket.on('roomExpired', (data) => {
    set({ room: null, error: data });
  });

  socket.on('kicked', () => {
    console.log('[Socket] Kicked from room');
    set({ 
      room: null, 
      roomExists: null,
      error: { message: 'You have been removed from this room.' }
    });
  });
};
