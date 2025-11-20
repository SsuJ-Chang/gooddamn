import { create } from 'zustand';
import { socket } from '../lib/socket';

/**
 * Zustand State Management Store
 *
 * This file defines the central state management for the entire application.
 * Zustand allows us to create a "store" which is a single source of truth for our app's state.
 * Components can "subscribe" to this store and will automatically re-render when parts of the state they use change.
 *
 * `create((set, get) => ({ ... }))`: This is the main function from Zustand to create a store.
 * `set`: A function to update the state. It merges the new state with the existing state.
 * `get`: A function to get the current state, useful for calculations within actions.
 */
export const useStore = create((set, get) => ({
  // =================================================================================================
  // STATE: The data that our application holds.
  // =================================================================================================

  /**
   * `isConnected`: A boolean to track the connection status to the Socket.IO server.
   * Helps in showing loading indicators or connection status to the user.
   */
  isConnected: false,

  /**
   * `name`: The name of the current user, entered on the first screen.
   * `null` initially, set after the user provides their name.
   */
  name: null,

  /**
   * `room`: The main object representing the poker room the user is in.
   * Contains details like room ID, users in the room, votes, etc.
   * `null` when the user is not in a room.
   */
  room: null,

  /**
   * `clientId`: The unique ID assigned by the Socket.IO server to this client.
   * Crucial for identifying the current user among all users in a room.
   */
  clientId: null,

  /**
   * `error`: Stores any error message received from the server (e.g., room not found).
   */
  error: null,

  /**
   * `roomList`: A list of available rooms to display in the Lobby.
   * Each item contains { id, name, ownerName, userCount, maxUsers }.
   */
  roomList: [],

  // =================================================================================================
  // ACTIONS: Functions that components can call to interact with the state or the server.
  // =================================================================================================

  /**
   * `connect`: Establishes the connection to the Socket.IO server and sets up event listeners.
   * This is the bridge between our frontend state and the backend server.
   */
  connect: () => {
    // Prevent connecting multiple times if already connected.
    if (get().isConnected) return;

    // --- Register Socket.IO Event Listeners ---

    socket.on('connect', () => {
      // On successful connection, update our state.
      set({ isConnected: true, clientId: socket.id });
      // Register the user with the server
      socket.emit('register', { name: get().name });
    });

    socket.on('disconnect', () => {
      // On disconnection, update our state and clean up the room.
      set({ isConnected: false, room: null });
    });

    socket.on('roomStateUpdated', (roomData) => {
      // This is the most important event. The server sends this whenever the room's state changes.
      // (e.g., a user joins, leaves, votes, or votes are revealed).
      // We update our local `room` state with the fresh data from the server.
      set({ room: roomData, error: null });
    });

    socket.on('roomListUpdated', (roomList) => {
      // The server sends the updated list of rooms.
      set({ roomList });
    });

    socket.on('error', (errorMessage) => {
      // The server sent an error. We store it so the UI can display it.
      set({ error: errorMessage });
    });

    // Manually connect the socket. `autoConnect` was set to false in `socket.js`.
    socket.connect();
  },

  /**
   * `setName`: Sets the user's name and connects to the socket.
   * @param {string} name - The name entered by the user.
   */
  setName: (name) => {
    set({ name });
    // Once the name is set, we can establish the connection to the server.
    get().connect();
  },

  /**
   * `createRoom`: Emits an event to the server to create a new poker room.
   * @param {string} roomName - The name of the room to create.
   */
  createRoom: (roomName) => {
    // We send our name along with the request.
    // Server expects { roomName, maxUsers }
    socket.emit('createRoom', { roomName, maxUsers: 10 });
  },

  /**
   * `joinRoom`: Emits an event to the server to join an existing room.
   * @param {string} roomId - The ID of the room to join.
   */
  joinRoom: (roomId) => {
    if (!roomId) return;
    socket.emit('joinRoom', { roomId });
  },

  /**
   * `leaveRoom`: Emits an event to leave the current room and resets local state.
   */
  leaveRoom: () => {
    const { room } = get();
    if (room) {
      socket.emit('leaveRoom', { roomId: room.id });
      // We also immediately clear the local room state for a faster UI transition.
      set({ room: null });
    }
  },

  /**
   * `vote`: Emits an event to cast a vote in the current room.
   * @param {string} value - The vote value (e.g., '5', '13', '?').
   */
  vote: (value) => {
    const { room } = get();
    if (room) {
      socket.emit('vote', { roomId: room.id, vote: value });
    }
  },

  /**
   * `showVotes`: Emits an event to reveal all votes in the room. (Owner only)
   */
  showVotes: () => {
    const { room } = get();
    if (room) {
      socket.emit('showVotes', { roomId: room.id });
    }
  },

  /**
   * `resetVotes`: Emits an event to start a new voting round. (Owner only)
   */
  resetVotes: () => {
    const { room } = get();
    if (room) {
      socket.emit('resetVotes', { roomId: room.id });
    }
  },

  /**
   * `getRoomList`: Requests the current list of rooms from the server.
   */
  getRoomList: () => {
    socket.emit('getRoomList');
  },
}));
