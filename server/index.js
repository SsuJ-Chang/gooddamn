
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

const rooms = {};
const userSocketMap = {};

io.on('connection', (socket) => {
  console.log(`[Connection] User connected: ${socket.id}`);

  socket.on('register', ({ name }) => {
    const sanitizedName = name.slice(0, 20);
    userSocketMap[socket.id] = { name: sanitizedName };
    console.log(`[Register] User ${socket.id} registered as "${sanitizedName}"`);
  });

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

  socket.on('createRoom', ({ roomName, maxUsers }) => {
    const roomId = uuidv4();
    const sanitizedRoomName = roomName.slice(0, 20);
    const ownerId = socket.id;

    // Check for duplicate room names and add numbering if needed
    let finalRoomName = sanitizedRoomName;
    const existingRoomNames = Object.values(rooms).map(room => room.name);
    
    if (existingRoomNames.includes(finalRoomName)) {
      let counter = 2;
      // Keep incrementing counter until we find a unique name
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

  socket.on('joinRoom', ({ roomId }) => {
    joinRoom(roomId, socket);
  });

  socket.on('leaveRoom', ({ roomId }) => {
    leaveRoom(roomId, socket);
  });

  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (room && room.users[socket.id]) {
      room.users[socket.id].vote = vote;
      console.log(`[Vote] User ${socket.id} in room ${roomId} voted: ${vote}`);
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  socket.on('showVotes', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id) {
      room.votesVisible = true;
      console.log(`[Vote] Owner ${socket.id} revealed votes in room ${roomId}`);
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

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

  socket.on('disconnect', () => {
    console.log(`[Connection] User disconnected: ${socket.id}`);
    for (const roomId in rooms) {
      if (rooms[roomId].users[socket.id]) {
        leaveRoom(roomId, socket);
      }
    }
    delete userSocketMap[socket.id];
  });
});

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
    // Handle error: room full or user not registered
    console.log(`[Error] User ${socket.id} failed to join room ${roomId}. Room full or user not registered.`);
    return false;
  }
}

function leaveRoom(roomId, socket) {
  const room = rooms[roomId];
  if (room) {
    socket.leave(roomId);
    const userName = room.users[socket.id]?.name;
    delete room.users[socket.id];
    console.log(`[Room] User ${socket.id} ("${userName}") left room ID: ${roomId}`);

    if (Object.keys(room.users).length === 0) {
      delete rooms[roomId];
      console.log(`[Room] Room ${roomId} is empty and has been deleted.`);
    } else {
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

function getRoomListPayload() {
    return Object.entries(rooms).map(([id, room]) => ({
        id,
        name: room.name,
        ownerName: room.users[room.owner]?.name || 'N/A',
        userCount: Object.keys(room.users).length,
        maxUsers: room.maxUsers,
    }));
}

// Garbage Collection: Clean up empty rooms every 60 seconds
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
