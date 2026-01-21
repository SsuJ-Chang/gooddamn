import { create } from 'zustand';
import { socket } from '../lib/socket';

/**
 * Zustand 狀態管理 Store
 *
 * 此檔案定義整個應用程式的中央狀態管理。
 * Zustand 允許我們建立一個「store」，它是我們應用程式狀態的單一真實來源。
 * 元件可以「訂閱」此 store，當它們使用的狀態部分發生變化時會自動重新渲染。
 *
 * `create((set, get) => ({ ... }))`: 這是 Zustand 建立 store 的主要函數。
 * `set`: 用於更新狀態的函數。它會將新狀態與現有狀態合併。
 * `get`: 用於獲取當前狀態的函數，在 actions 內部進行計算時很有用。
 */
export const useStore = create((set, get) => ({
  // =================================================================================================
  // STATE: 狀態：我們的應用程式持有的資料
  // =================================================================================================

  /**
   * `isConnected`: 用於追蹤 Socket.IO 伺服器連線狀態的布林值。
   * 有助於向使用者顯示載入指示器或連線狀態。
   */
  isConnected: false,

  /**
   * `name`: 當前使用者的名字，在第一個畫面輸入。
   * 初始為 `null`，在使用者提供名字後設定。
   */
  name: null,

  /**
   * `room`: 代表使用者所在 poker 房間的主要物件。
   * 包含房間 ID、房間中的使用者、投票等詳細資訊。
   * 當使用者不在房間中時為 `null`。
   */
  room: null,

  /**
   * `clientId`: Socket.IO 伺服器分配給此客戶端的唯一 ID。
   * 對於在房間中的所有使用者中識別當前使用者至關重要。
   */
  clientId: null,

  /**
   * `error`: 儲存從伺服器收到的任何錯誤訊息（例如，房間未找到）。
   */
  error: null,

  /**
   * `roomList`: 在大廳中顯示的可用房間列表。
   * 每個項目包含 { id, name, ownerName, userCount, maxUsers }。
   */
  roomList: [],

  // =================================================================================================
  // ACTIONS: 動作：元件可以呼叫以與狀態或伺服器互動的函數
  // =================================================================================================

  /**
   * `connect`: 建立與 Socket.IO 伺服器的連線並設定事件監聽器。
   * 這是我們前端狀態和後端伺服器之間的橋樑。
   */
  connect: () => {
    // 如果已經連線，防止多次連線
    if (get().isConnected) return;

    // --- 註冊 Socket.IO 事件監聽器 ---

    socket.on('connect', () => {
      // 成功連線時，更新我們的狀態
      set({ isConnected: true, clientId: socket.id });
      // 向伺服器註冊使用者
      socket.emit('register', { name: get().name });
    });

    socket.on('disconnect', () => {
      // 斷線時，更新我們的狀態並清理房間
      set({ isConnected: false, room: null });
    });

    socket.on('roomStateUpdated', (roomData) => {
      // 這是最重要的事件。伺服器在房間狀態變化時發送此事件。
      // （例如，使用者加入、離開、投票或投票被揭示）。
      // 我們用來自伺服器的新資料更新本地 `room` 狀態。
      // 成功進入房間時才清除錯誤
      set({ room: roomData, error: null });
    });

    socket.on('roomListUpdated', (roomList) => {
      // 伺服器發送更新的房間列表
      set({ roomList });
    });

    socket.on('roomError', (errorData) => {
      // 伺服器發送了一個錯誤。我們儲存它以便 UI 可以顯示它。
      console.log('[Socket] Received roomError:', errorData);
      set({ error: errorData });
    });

    socket.on('roomExpired', (data) => {
      // 房間已過期，將使用者踢回大廳
      console.log('[Socket] Room expired:', data);
      set({ room: null, error: data });
    });

    // 手動連線 socket。`autoConnect` 在 `socket.js` 中被設定為 false
    socket.connect();
  },

  /**
   * `setName`: 設定使用者名字並連線到 socket
   * @param {string} name - 使用者輸入的名字
   */
  setName: (name) => {
    set({ name });
    // 一旦設定了名字，我們就可以建立與伺服器的連線
    get().connect();
  },

  /**
   * `createRoom`: 向伺服器發送事件以建立新的 poker 房間
   * @param {string} roomName - 要建立的房間名稱
   */
  createRoom: (roomName) => {
    // 我們將名字與請求一起發送
    // 伺服器期望 { roomName, maxUsers }
    socket.emit('createRoom', { roomName, maxUsers: 10 });
  },

  /**
   * `joinRoom`: 向伺服器發送事件以加入現有房間
   * @param {string} roomId - 要加入的房間 ID
   */
  joinRoom: (roomId) => {
    if (!roomId) return;
    socket.emit('joinRoom', { roomId });
  },

  /**
   * `leaveRoom`: 發送事件以離開當前房間並重置本地狀態
   */
  leaveRoom: () => {
    const { room } = get();
    if (room) {
      socket.emit('leaveRoom', { roomId: room.id });
      // 我們也立即清除本地房間狀態以實現更快的 UI 轉換
      set({ room: null });
    }
  },

  /**
   * `vote`: 發送事件以在當前房間中投票
   * @param {string} value - 投票值（例如，'5', '13', '?'）
   */
  vote: (value) => {
    const { room } = get();
    if (room) {
      socket.emit('vote', { roomId: room.id, vote: value });
    }
  },

  /**
   * `showVotes`: 發送事件以揭示房間中的所有投票（僅房主）
   */
  showVotes: () => {
    const { room } = get();
    if (room) {
      socket.emit('showVotes', { roomId: room.id });
    }
  },

  /**
   * `resetVotes`: 發送事件以開始新的投票回合（僅房主）
   */
  resetVotes: () => {
    const { room } = get();
    if (room) {
      socket.emit('resetVotes', { roomId: room.id });
    }
  },

  /**
   * `getRoomList`: 從伺服器請求當前的房間列表
   */
  getRoomList: () => {
    socket.emit('getRoomList');
  },
}));
