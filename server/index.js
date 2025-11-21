
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
  socket.on('register', ({ name }) => {
    const sanitizedName = name.slice(0, 20);
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

    rooms[roomId] = {
      id: roomId,
      name: finalRoomName,
      owner: ownerId,
      maxUsers: maxUsers || 10,
      users: {},
      votesVisible: false,
      votingPattern: 'fibonacci',
    };

    console.log(`[Room] User ${socket.id} created room "${finalRoomName}" (ID: ${roomId})`);
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
    room.users[socket.id] = { ...user, vote: null };
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
