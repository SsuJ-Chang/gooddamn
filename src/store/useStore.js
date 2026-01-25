import { create } from 'zustand';
import { socket } from '../lib/socket';
import { initSocketHandlers } from './socketHandlers';

export const useStore = create((set, get) => ({
  isConnected: false,
  isSocketInitialized: false,
  name: null,
  room: null,
  clientId: null,
  error: null,
  roomExists: null,
  roomCheckLoading: false,
  roomCheckData: null,
  adminData: null,
  adminIsAuthenticated: false,

  // ACTIONS
  connect: () => {
    if (!get().isSocketInitialized) {
      initSocketHandlers({ set, get });
      set({ isSocketInitialized: true });
    }
    if (!socket.connected) socket.connect();
  },

  setName: (name) => {
    set({ name });
    get().connect();
    if (socket.connected) {
      socket.emit('register', { name });
    }
  },

  createRoom: (roomName) => {
    const userName = get().name;
    socket.emit('createRoom', { roomName, maxUsers: 10, userName });
  },

  joinRoom: (roomId) => {
    if (!roomId) return;
    const userName = get().name;
    socket.emit('joinRoom', { roomId, userName });
  },

  leaveRoom: () => {
    const { room } = get();
    if (room) {
      socket.emit('leaveRoom', { roomId: room.id });
      set({ room: null });
    }
  },

  vote: (value) => {
    const { room } = get();
    if (room) {
      socket.emit('vote', { roomId: room.id, vote: value });
    }
  },

  showVotes: () => {
    const { room } = get();
    if (room) socket.emit('showVotes', { roomId: room.id });
  },

  resetVotes: () => {
    const { room } = get();
    if (room) socket.emit('resetVotes', { roomId: room.id });
  },

  checkRoom: (roomId) => {
    get().connect();
    set({ roomCheckLoading: true, roomExists: null, roomCheckData: null });
    socket.emit('checkRoom', { roomId });
  },

  clearRoomCheck: () => {
    set({ roomExists: null, roomCheckLoading: false, roomCheckData: null });
  },

  clearError: () => {
    set({ error: null });
  },

  kickUser: (targetSocketId) => {
    const { room } = get();
    if (room) {
      console.log(`[Frontend] Action: kickUser. Room: ${room.id}, Target: ${targetSocketId}`);
      socket.emit('kickUser', { roomId: room.id, targetSocketId }, (response) => {
          console.log('[Frontend] kickUser acknowledgment:', response);
      });
    }
  },

  // --- 管理員 Actions ---
  adminAuth: (password) => {
     socket.emit('adminAuth', { password });
  },

  fetchAdminData: () => {
    socket.emit('adminGetData');
  },

  adminDeleteRoom: (roomId) => {
    socket.emit('adminDeleteRoom', { roomId });
  },

  adminDeleteUser: (roomId, userId) => {
    console.log(`[Frontend] Action: adminDeleteUser. Room: ${roomId}, Target: ${userId}`);
    socket.emit('adminDeleteUser', { roomId, userId }, (response) => {
        console.log('[Frontend] adminDeleteUser acknowledgment:', response);
    });
  },

  adminNuke: () => {
    socket.emit('adminNuke');
  },
}));
