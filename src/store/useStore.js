import { create } from 'zustand';
import { socket } from '../lib/socket';
import { initSocketHandlers } from './socketHandlers';

const SOCKET_OPERATION_TIMEOUT_MS = 5000;

const waitForSocketConnection = () => {
  if (socket.connected) return Promise.resolve();

  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      socket.off('connect', handleConnect);
      reject(new Error('Connection timed out. Please try again.'));
    }, SOCKET_OPERATION_TIMEOUT_MS);

    function handleConnect() {
      clearTimeout(timeout);
      resolve();
    }

    socket.once('connect', handleConnect);
  });
};

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
  adminAuthError: null,
  adminAuthAttempts: 0,
  adminAuthMaxAttempts: null,

  // ACTIONS
  connect: () => {
    if (!get().isSocketInitialized) {
      initSocketHandlers({ set, get });
      set({ isSocketInitialized: true });
    }
    if (!socket.connected) socket.connect();
  },

  emitWhenConnected: async (event, payload, callback) => {
    get().connect();
    await waitForSocketConnection();
    socket.emit(event, payload, callback);
  },

  setName: (name) => {
    set({ name });
    get().emitWhenConnected('register', { name }).catch((error) => {
      set({ error: { message: error.message } });
    });
  },

  createRoom: (roomName) => {
    const userName = get().name;
    get().emitWhenConnected('createRoom', { roomName, maxUsers: 10, userName }).catch((error) => {
      set({ error: { message: error.message } });
    });
  },

  joinRoom: (roomId) => {
    if (!roomId) return;
    const userName = get().name;
    get().emitWhenConnected('joinRoom', { roomId, userName }).catch((error) => {
      set({ error: { message: error.message } });
    });
  },

  leaveRoom: () => {
    const { room } = get();
    if (room) {
      get().emitWhenConnected('leaveRoom', { roomId: room.id }).catch(() => {});
      set({ room: null });
    }
  },

  vote: (value) => {
    const { room } = get();
    if (room) {
      get().emitWhenConnected('vote', { roomId: room.id, vote: value }).catch((error) => {
        set({ error: { message: error.message } });
      });
    }
  },

  showVotes: () => {
    const { room } = get();
    if (room) {
      get().emitWhenConnected('showVotes', { roomId: room.id }).catch((error) => {
        set({ error: { message: error.message } });
      });
    }
  },

  resetVotes: () => {
    const { room } = get();
    if (room) {
      get().emitWhenConnected('resetVotes', { roomId: room.id }).catch((error) => {
        set({ error: { message: error.message } });
      });
    }
  },

  checkRoom: (roomId) => {
    set({ roomCheckLoading: true, roomExists: null, roomCheckData: null });
    get().emitWhenConnected('checkRoom', { roomId }).catch((error) => {
      set({
        roomCheckLoading: false,
        error: { message: error.message },
      });
    });
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
      get().emitWhenConnected('kickUser', { roomId: room.id, targetSocketId }, (response) => {
          console.log('[Frontend] kickUser acknowledgment:', response);
      }).catch((error) => {
        set({ error: { message: error.message } });
      });
    }
  },

  // --- 管理員 Actions ---
  adminAuth: (password) => {
    set({ adminAuthError: null });
    get().emitWhenConnected('adminAuth', { password }).catch((error) => {
      set({ adminAuthError: error.message });
    });
  },

  fetchAdminData: () => {
    get().emitWhenConnected('adminGetData').catch(() => {});
  },

  adminDeleteRoom: (roomId) => {
    get().emitWhenConnected('adminDeleteRoom', { roomId }).catch((error) => {
      set({ adminAuthError: error.message });
    });
  },

  adminDeleteUser: (roomId, userId) => {
    console.log(`[Frontend] Action: adminDeleteUser. Room: ${roomId}, Target: ${userId}`);
    get().emitWhenConnected('adminDeleteUser', { roomId, userId }, (response) => {
        console.log('[Frontend] adminDeleteUser acknowledgment:', response);
    }).catch((error) => {
      set({ adminAuthError: error.message });
    });
  },

  adminNuke: () => {
    get().emitWhenConnected('adminNuke').catch((error) => {
      set({ adminAuthError: error.message });
    });
  },
}));
