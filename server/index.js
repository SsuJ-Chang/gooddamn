const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const { v4: uuidv4 } = require('uuid');
require('dotenv').config();

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
const adminSockets = new Set();
const roomBans = new Map();
const adminAuthFailures = new Map();
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD;
const BAN_DURATION_MS = 1 * 60 * 1000;
const ROOM_DURATION_MS = 2 * 60 * 60 * 1000;

const parsePositiveInt = (value, fallback) => {
  const parsed = Number.parseInt(value, 10);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback;
};

const ADMIN_AUTH_MAX_ATTEMPTS = parsePositiveInt(process.env.ADMIN_AUTH_MAX_ATTEMPTS, 5);
const ADMIN_AUTH_COOLDOWN_MS = parsePositiveInt(process.env.ADMIN_AUTH_COOLDOWN_MS, 300000);

// HELPERS
const sanitizeName = (value, fallback = 'Guest') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 20) : fallback;
};

const sanitizeRoomName = (value, fallback = 'New Room') => {
  if (typeof value !== 'string') return fallback;
  const trimmed = value.trim();
  return trimmed ? trimmed.slice(0, 20) : fallback;
};

const getClientAddress = (socket) => {
  // 優先檢查 x-forwarded-for (適用於 Proxy/Lightsail 環境)
  const forwarded = socket?.handshake?.headers['x-forwarded-for'];
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return socket?.handshake?.address || 'unknown';
};

/**
 * 集中處理房間銷毀邏輯
 * @param {string} roomId 房間 ID
 * @param {string} reason 銷毀原因 (發送給客戶端)
 */
const destroyRoom = (roomId, reason = 'Room closed.') => {
  const room = rooms[roomId];
  if (!room) return;

  console.log(`[Room] Destroying room ${roomId}. Reason: ${reason}`);
  
  // 通知房間內所有使用者
  io.to(roomId).emit('roomExpired', { message: reason });
  
  // 執行 Socket 離開 (非必要但較乾淨)
  const usersInRoom = Object.keys(room.users);
  usersInRoom.forEach(userId => {
    const s = io.sockets.sockets.get(userId);
    if (s) s.leave(roomId);
  });

  // 清除資料
  delete rooms[roomId];
  roomBans.delete(roomId);
};

const getRoomBanMap = (roomId) => {
  if (!roomBans.has(roomId)) {
    roomBans.set(roomId, new Map());
  }
  return roomBans.get(roomId);
};

const cleanupRoomBans = (roomId) => {
  const banMap = roomBans.get(roomId);
  if (!banMap) return;
  const now = Date.now();
  for (const [key, entry] of banMap) {
    if (entry.expiresAt <= now) banMap.delete(key);
  }
  if (banMap.size === 0) roomBans.delete(roomId);
};

const addRoomBan = (roomId, { name, address }) => {
  if (!name && !address) return;
  const banMap = getRoomBanMap(roomId);
  const expiresAt = Date.now() + BAN_DURATION_MS;
  if (address && address !== 'unknown') {
    banMap.set(`addr:${address}`, { type: 'addr', address, expiresAt });
  }
  if (name) {
    banMap.set(`name:${name}`, { type: 'name', name, expiresAt });
  }
};

const isRoomBanned = (roomId, { name, address }) => {
  const banMap = roomBans.get(roomId);
  if (!banMap) return false;
  cleanupRoomBans(roomId);
  if (address && address !== 'unknown' && banMap.has(`addr:${address}`)) return true;
  if (name && banMap.has(`name:${name}`)) return true;
  return false;
};

const getAdminAuthFailure = (address) => {
  const now = Date.now();
  const entry = adminAuthFailures.get(address);
  if (!entry) return { attempts: 0, lockedUntil: 0 };
  if (entry.lockedUntil && entry.lockedUntil <= now) {
    adminAuthFailures.delete(address);
    return { attempts: 0, lockedUntil: 0 };
  }
  return entry;
};

const recordAdminAuthFailure = (address) => {
  const now = Date.now();
  const current = getAdminAuthFailure(address);
  const attempts = current.attempts + 1;
  const lockedUntil = attempts >= ADMIN_AUTH_MAX_ATTEMPTS ? now + ADMIN_AUTH_COOLDOWN_MS : 0;
  const next = { attempts, lockedUntil };
  adminAuthFailures.set(address, next);
  return next;
};

io.on('connection', (socket) => {
  console.log(`[Connection] User connected: ${socket.id}`);

  socket.on('register', ({ name }) => {
    const sn = sanitizeName(name);
    userSocketMap[socket.id] = { name: sn };
    console.log(`[Register] ${socket.id} -> ${sn}`);
  });

  socket.on('checkRoom', ({ roomId }) => {
    const room = rooms[roomId];
    if (room) {
      socket.emit('roomCheckResult', { exists: true, roomData: { id: room.id, name: room.name } });
    } else {
      socket.emit('roomCheckResult', { exists: false });
    }
  });

  socket.on('createRoom', ({ roomName, maxUsers, userName }) => {
    if (userName && !userSocketMap[socket.id]) {
      userSocketMap[socket.id] = { name: sanitizeName(userName) };
    }
    const MAX_ROOMS = 30;
    if (Object.keys(rooms).length >= MAX_ROOMS) {
      return socket.emit('roomError', { message: 'Room limit reached.' });
    }
    const roomId = uuidv4();
    const srn = sanitizeRoomName(roomName);
    const ownerId = socket.id;
    let finalName = srn;
    const existing = Object.values(rooms).map(r => r.name);
    if (existing.includes(finalName)) {
      let c = 2;
      while (existing.includes(`${srn} - ${c}`)) c++;
      finalName = `${srn} - ${c}`;
    }
    const expiresAt = Date.now() + ROOM_DURATION_MS;
    rooms[roomId] = {
      id: roomId,
      name: finalName,
      owner: ownerId,
      maxUsers: maxUsers || 10,
      users: {},
      votesVisible: false,
      votingPattern: 'fibonacci',
      createdAt: Date.now(),
      expiresAt: expiresAt,
    };
    joinRoom(roomId, socket);
  });

  socket.on('joinRoom', ({ roomId, userName }) => {
    if (userName && !userSocketMap[socket.id]) {
        userSocketMap[socket.id] = { name: sanitizeName(userName) };
    }
    joinRoom(roomId, socket);
  });

  socket.on('leaveRoom', ({ roomId }) => {
    leaveRoom(roomId, socket);
  });

  socket.on('kickUser', ({ roomId, targetSocketId }, callback) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id && targetSocketId !== socket.id) {
      const targetSocket = io.sockets.sockets.get(targetSocketId);
      const targetUser = room.users[targetSocketId];
      if (targetUser) {
          addRoomBan(roomId, { name: targetUser.name, address: targetSocket ? getClientAddress(targetSocket) : null });
      }
      if (targetSocket) {
        targetSocket.emit('kicked');
        leaveRoom(roomId, targetSocket);
        targetSocket.disconnect(true);
        if (callback) callback({ success: true, message: 'Kicked.' });
      } else if (targetUser) {
        delete room.users[targetSocketId];
        io.to(roomId).emit('roomStateUpdated', room);
        if (callback) callback({ success: true, message: 'Zombie cleaned.' });
      }
    }
  });

  socket.on('vote', ({ roomId, vote }) => {
    const room = rooms[roomId];
    if (room && room.users[socket.id]) {
      room.users[socket.id].vote = vote;
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  socket.on('showVotes', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id) {
      room.votesVisible = true;
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  socket.on('resetVotes', ({ roomId }) => {
    const room = rooms[roomId];
    if (room && room.owner === socket.id) {
      room.votesVisible = false;
      for (const id in room.users) room.users[id].vote = null;
      io.to(roomId).emit('roomStateUpdated', room);
    }
  });

  socket.on('adminAuth', ({ password }) => {
    const address = getClientAddress(socket);
    const failure = getAdminAuthFailure(address);
    if (failure.lockedUntil && failure.lockedUntil > Date.now()) {
      const retryAfterMs = failure.lockedUntil - Date.now();
      socket.emit('adminAuthResult', {
        success: false,
        locked: true,
        attempts: failure.attempts,
        maxAttempts: ADMIN_AUTH_MAX_ATTEMPTS,
        retryAfterMs,
      });
      return;
    }

    if (ADMIN_PASSWORD && password && password === ADMIN_PASSWORD) {
      adminAuthFailures.delete(address);
      adminSockets.add(socket.id);
      socket.emit('adminAuthResult', { success: true });
    } else {
      const nextFailure = recordAdminAuthFailure(address);
      socket.emit('adminAuthResult', {
        success: false,
        locked: Boolean(nextFailure.lockedUntil),
        attempts: nextFailure.attempts,
        maxAttempts: ADMIN_AUTH_MAX_ATTEMPTS,
        retryAfterMs: nextFailure.lockedUntil ? nextFailure.lockedUntil - Date.now() : 0,
      });
    }
  });

  socket.on('adminGetData', () => {
    if (adminSockets.has(socket.id)) socket.emit('adminDataUpdated', rooms);
  });

  socket.on('adminDeleteRoom', ({ roomId }) => {
    if (adminSockets.has(socket.id)) {
      destroyRoom(roomId, 'God closed room.');
      io.emit('adminDataUpdated', rooms);
    }
  });

  socket.on('adminDeleteUser', ({ roomId, userId }, callback) => {
    if (!adminSockets.has(socket.id)) return;
    const room = rooms[roomId];
    if (room && room.users[userId]) {
      const ts = io.sockets.sockets.get(userId);
      addRoomBan(roomId, { name: room.users[userId].name, address: ts ? getClientAddress(ts) : null });
      if (ts) {
        ts.emit('kicked');
        leaveRoom(roomId, ts);
        ts.disconnect(true);
      } else {
        delete room.users[userId];
        if (Object.keys(room.users).length === 0) {
            destroyRoom(roomId, 'Room empty.');
        } else if (room.owner === userId) {
            room.owner = Object.keys(room.users)[0];
        }
        io.to(roomId).emit('roomStateUpdated', room);
      }
      io.emit('adminDataUpdated', rooms);
      if (callback) callback({ success: true });
    }
  });

  socket.on('adminNuke', () => {
    if (!adminSockets.has(socket.id)) return;
    Object.keys(rooms).forEach(id => destroyRoom(id, 'Server reset.'));
    // 清除所有封鎖 (可選)
    roomBans.clear();
    io.emit('adminDataUpdated', rooms);
  });

  socket.on('disconnect', () => {
    for (const rid in rooms) {
      if (rooms[rid].users[socket.id]) {
        leaveRoom(rid, socket);
      }
    }
    delete userSocketMap[socket.id];
    adminSockets.delete(socket.id);
  });
});

function joinRoom(roomId, socket) {
  const room = rooms[roomId];
  const user = userSocketMap[socket.id];
  if (room && user && Object.keys(room.users).length < room.maxUsers) {
    if (isRoomBanned(roomId, { name: user.name, address: getClientAddress(socket) })) {
      socket.emit('roomError', { message: 'Access denied.' });
      return false;
    }
    socket.join(roomId);
    room.users[socket.id] = { ...user, id: socket.id, vote: null };
    io.to(roomId).emit('roomStateUpdated', room);
    return true;
  }
  socket.emit('roomError', { message: 'Join failed.' });
  return false;
}

function leaveRoom(roomId, socket) {
  const room = rooms[roomId];
  if (room) {
    socket.leave(roomId);
    delete room.users[socket.id];
    if (Object.keys(room.users).length === 0) {
      destroyRoom(roomId, 'Room empty.');
    } else if (room.owner === socket.id) {
      room.owner = Object.keys(room.users)[0];
      io.to(roomId).emit('roomStateUpdated', room);
    } else {
      io.to(roomId).emit('roomStateUpdated', room);
    }
  }
}

setInterval(() => {
  const now = Date.now();
  for (const rid in rooms) {
    if (rooms[rid].expiresAt && now > rooms[rid].expiresAt) {
      destroyRoom(rid, 'Room expired.');
    }
  }
}, 60000);

server.listen(3001, () => {
  console.log('SERVER RUNNING ON PORT 3001');
});
