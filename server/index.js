
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
const votingPatterns = require('./votingPatterns');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST'],
  },
});

// 資料結構：存儲所有房間
const rooms = {};
// 資料結構：映射 socket ID 到使用者資訊
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log(`[Connection] User connected: ${socket.id}`);

  // 使用者註冊事件：當使用者連線後，他們首先發送他們的名字
  // 使用者註冊事件：當使用者連線後，他們首先發送他們的名字
  socket.on('register', ({ name }) => {
    // 🛡️ 保護機制：確保名字存在且為字串，防止 Admin Page 直接連線造成的崩潰
    const safeName = (name && typeof name === 'string') ? name : 'Guest';
    const sanitizedName = safeName.slice(0, 20);
    
    userSocketMap[socket.id] = { name: sanitizedName };
    console.log(`[Register] User ${socket.id} registered as "${sanitizedName}"`);
  });

  // 獲取房間列表事件：使用者請求查看所有可用的房間
  socket.on('getRoomList', () => {
    console.log(`[Room List] User ${socket.id} requested room list.`);
    const roomList = Object.entries(rooms).map(([id, room]) => ({
      id,
      name: room.name,
      ownerName: room.users[room.owner]?.name || 'N/A',
      userCount: Object.keys(room.users).length,
      maxUsers: room.maxUsers,
    }));
    socket.emit('roomListUpdated', roomList);
  });

  // 建立房間事件：使用者想要建立一個新的 poker 房間
  socket.on('createRoom', ({ roomName, maxUsers }) => {
    // 🛡️ 保護機制：限制最大房間數量
    const MAX_ROOMS = 30;
    const currentRoomCount = Object.keys(rooms).length;
    
    if (currentRoomCount >= MAX_ROOMS) {
      console.log(`[Error] Room limit reached (${MAX_ROOMS}). User ${socket.id} cannot create room.`);
      socket.emit('roomError', { message: `Room limit reached (${MAX_ROOMS}). Please try again later or join an existing room.` });
      return;
    }

    const roomId = uuidv4();
    const sanitizedRoomName = roomName.slice(0, 20);
    const ownerId = socket.id;

    // 檢查重複的房間名稱，如果需要則加上編號
    let finalRoomName = sanitizedRoomName;
    const existingRoomNames = Object.values(rooms).map(room => room.name);
    
    if (existingRoomNames.includes(finalRoomName)) {
      let counter = 2;
      // 持續遞增計數器直到找到唯一的名稱
      while (existingRoomNames.includes(`${sanitizedRoomName} - ${counter}`)) {
        counter++;
      }
      finalRoomName = `${sanitizedRoomName} - ${counter}`;
    }

    // 🛡️ 房間超時設定：1 小時
    const ROOM_TIMEOUT_MS = 60 * 60 * 1000; // 1 hour in milliseconds
    const createdAt = Date.now();
    const expiresAt = createdAt + ROOM_TIMEOUT_MS;

    rooms[roomId] = {
      id: roomId,
      name: finalRoomName,
      owner: ownerId,
      maxUsers: maxUsers || 10,
      users: {},
      votesVisible: false,
      votingPattern: 'fibonacci',
      createdAt: createdAt,
      expiresAt: expiresAt,
    };

    // 設定房間自動過期刪除
    setTimeout(() => {
      if (rooms[roomId]) {
        console.log(`[Timeout] Room "${finalRoomName}" (ID: ${roomId}) has expired and will be deleted.`);
        // 通知所有在房間內的使用者
        io.to(roomId).emit('roomExpired', { message: 'Room has expired after 1 hour.' });
        // 刪除房間
        delete rooms[roomId];
        // 更新房間列表
        io.emit('roomListUpdated', getRoomListPayload());
      }
    }, ROOM_TIMEOUT_MS);

    console.log(`[Room] User ${socket.id} created room "${finalRoomName}" (ID: ${roomId}) [${currentRoomCount + 1}/${MAX_ROOMS}] - expires at ${new Date(expiresAt).toLocaleTimeString()}`);
    const joined = joinRoom(roomId, socket);

    if (!joined) {
      console.log(`[Room] User ${socket.id} failed to join created room ${roomId}. Deleting room.`);
      delete rooms[roomId];
    }
  });

  // 加入房間事件：使用者想要加入一個現有的房間
  socket.on('joinRoom', ({ roomId }) => {
    joinRoom(roomId, socket);
  });

  // 離開房間事件：使用者想要離開他們目前的房間
  socket.on('leaveRoom', ({ roomId }) => {
    leaveRoom(roomId, socket);
  });

  // 踢出使用者事件：房主想要將某人踢出房間
  socket.on('kickUser', ({ roomId, targetSocketId }) => {
    const room = rooms[roomId];
    // 🛡️ 保護機制：只有房主可以踢人，且不能踢自己
    if (room && room.owner === socket.id && targetSocketId !== socket.id) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      if (targetSocket) {
        console.log(`[Kick] Owner ${socket.id} kicked user ${targetSocketId} from room ${roomId}`);
        // 通知目標使用者被踢出了
        targetSocket.emit('roomError', { message: 'You have been kicked from the room by the host.' });
        targetSocket.emit('kicked');
        // 執行離開房間邏輯
        leaveRoom(roomId, targetSocket);
      }
    }
  });

  // 投票事件：使用者提交他們的投票
  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (room && room.users[socket.id]) {
      room.users[socket.id].vote = vote;
      console.log(`[Vote] User ${socket.id} in room ${roomId} voted: ${vote}`);
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  // 顯示投票事件：房主想要揭示所有投票
  socket.on('showVotes', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id) {
      room.votesVisible = true;
      console.log(`[Vote] Owner ${socket.id} revealed votes in room ${roomId}`);
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  // 重置投票事件：房主想要開始新的投票回合
  socket.on('resetVotes', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id) {
      room.votesVisible = false;
      for (const userId in room.users) {
        room.users[userId].vote = null;
      }
      console.log(`[Vote] Owner ${socket.id} reset votes in room ${roomId}`);
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });


  // --- 管理員專用事件 ---

  // 取得管理員資料：回傳所有房間和使用者的完整列表
  socket.on('adminGetData', () => {
    // 簡單回傳整個 rooms 物件即可，前端再處理顯示
    socket.emit('adminDataUpdated', rooms);
  });

  // 管理員刪除房間
  socket.on('adminDeleteRoom', ({ roomId }) => {
    if (rooms[roomId]) {
      console.log(`[Admin] Deleting room ${roomId}`);
      io.to(roomId).emit('roomError', { message: 'This room has been closed by RJ.' });
      io.to(roomId).emit('roomExpired', { message: 'Admin closed the room.' }); // 確保前端清除狀態
      delete rooms[roomId];
      io.emit('roomListUpdated', getRoomListPayload());
      // 更新管理員介面
      io.emit('adminDataUpdated', rooms);
    }
  });

  // 管理員踢除使用者
  socket.on('adminDeleteUser', ({ roomId, userId }) => {
    const room = rooms[roomId];
    if (room && room.users[userId]) {
      const targetSocket = io.sockets.sockets.get(userId);
      console.log(`[Admin] Kicking user ${userId} from room ${roomId}`);
      
      if (targetSocket) {
        targetSocket.emit('roomError', { message: 'You have been removed by RJ.' });
        targetSocket.emit('kicked');
        leaveRoom(roomId, targetSocket);
      } else {
        // 如果 socket 已經斷線但在房間資料中還在（邊緣情況），手動清理
        delete room.users[userId];
        if (Object.keys(room.users).length === 0) {
          delete rooms[roomId];
        } else if (room.owner === userId) {
             // 轉移房主邏輯簡化版：直接給下一個人
             room.owner = Object.keys(room.users)[0];
        }
         io.to(roomId).emit('roomStateUpdated', room);
      }
      // 更新管理員介面
      io.emit('adminDataUpdated', rooms);
    }
  });

  // 核彈按鈕：刪除所有房間
  socket.on('adminNuke', () => {
    console.log(`[Admin] NUKING ALL ROOMS`);
    Object.keys(rooms).forEach(roomId => {
        io.to(roomId).emit('roomError', { message: 'Server reset by administrator.' });
        io.to(roomId).emit('roomExpired', { message: 'Server reset.' });
    });
    // 清空物件
    for (const key in rooms) delete rooms[key];
    
    io.emit('roomListUpdated', getRoomListPayload());
    io.emit('adminDataUpdated', rooms);
  });

  // 斷線事件：使用者的連線中斷
  socket.on('disconnect', () => {
    console.log(`[Connection] User disconnected: ${socket.id}`);
    // 檢查使用者是否在任何房間中，如果是則將他們移除
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        leaveRoom(roomId, socket);
      }
    }
    delete userSocketMap[socket.id];
  });
});

/**
 * joinRoom 函數：處理使用者加入房間的邏輯
 * @param {string} roomId - 要加入的房間 ID
 * @param {object} socket - Socket.IO socket 物件
 * @returns {boolean} - 如果成功加入則返回 true，否則返回 false
 */
function joinRoom(roomId, socket) {
  const room = rooms[roomId];
  const user = userSocketMap[socket.id];

  if (room && user && Object.keys(room.users).length < room.maxUsers) {
    socket.join(roomId);
    room.users[socket.id] = { ...user, id: socket.id, vote: null };
    console.log(`[Room] User ${socket.id} ("${user.name}") joined room ID: ${roomId}`);

    const roomList = getRoomListPayload();
    io.emit('roomListUpdated', roomList);
    io.to(roomId).emit('roomStateUpdated', room);
    return true;
  } else {
    // 處理錯誤：房間已滿或使用者未註冊
    console.log(`[Error] User ${socket.id} failed to join room ${roomId}. Room full or user not registered.`);
    return false;
  }
}

/**
 * leaveRoom 函數：處理使用者離開房間的邏輯
 * @param {string} roomId - 要離開的房間 ID
 * @param {object} socket - Socket.IO socket 物件
 */
function leaveRoom(roomId, socket) {
  const room = rooms[roomId];
  if (room) {
    socket.leave(roomId);
    const userName = room.users[socket.id]?.name;
    delete room.users[socket.id];
    console.log(`[Room] User ${socket.id} ("${userName}") left room ID: ${roomId}`);

    // 如果房間空了，刪除它
    if (Object.keys(room.users).length === 0) {
      delete rooms[roomId];
      console.log(`[Room] Room ${roomId} is empty and has been deleted.`);
    } else {
      // 如果房主離開了，將房主轉移給第一個使用者
      if (room.owner === socket.id) {
        room.owner = Object.keys(room.users)[0];
        console.log(`[Room] Owner left. New owner of room ${roomId} is ${room.owner}`);
      }
      io.to(roomId).emit('roomStateUpdated', room);
    }
    
    const roomList = getRoomListPayload();
    io.emit('roomListUpdated', roomList);
  }
}

/**
 * getRoomListPayload 函數：生成房間列表的有效載荷
 * @returns {Array} - 房間列表陣列
 */
function getRoomListPayload() {
    return Object.entries(rooms).map(([id, room]) => ({
        id,
        name: room.name,
        ownerName: room.users[room.owner]?.name || 'N/A',
        userCount: Object.keys(room.users).length,
        maxUsers: room.maxUsers,
    }));
}

// 垃圾回收：每 60 秒清理空房間
setInterval(() => {
  let cleaned = false;
  for (const roomId in rooms) {
    if (Object.keys(rooms[roomId].users).length === 0) {
      console.log(`[GC] Deleting empty room ${roomId}`);
      delete rooms[roomId];
      cleaned = true;
    }
  }
  if (cleaned) {
    io.emit('roomListUpdated', getRoomListPayload());
  }
}, 60000);

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});
