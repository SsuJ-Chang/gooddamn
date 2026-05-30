const { spawn } = require('node:child_process');
const { io } = require('socket.io-client');

const PORT = 3101;
const SERVER_URL = `http://127.0.0.1:${PORT}`;
const ALLOWED_ORIGIN = 'https://gooddamn.test';
const BLOCKED_ORIGIN = 'https://blocked.test';
const EXPECTED_VOTES = ['1', '2', '3', '5', '8', '13', '20', '?'];

let serverProcess;

const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const fail = (message) => {
  throw new Error(message);
};

const waitForServer = () => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => reject(new Error('Server did not start in time')), 10000);

  serverProcess.stdout.on('data', (chunk) => {
    const output = chunk.toString();
    process.stdout.write(output);
    if (output.includes(`SERVER RUNNING ON PORT ${PORT}`)) {
      clearTimeout(timeout);
      resolve();
    }
  });

  serverProcess.stderr.on('data', (chunk) => {
    process.stderr.write(chunk.toString());
  });

  serverProcess.on('exit', (code) => {
    clearTimeout(timeout);
    reject(new Error(`Server exited early with code ${code}`));
  });
});

const connectSocket = ({ origin = ALLOWED_ORIGIN, transports = ['polling'] } = {}) => new Promise((resolve, reject) => {
  const socket = io(SERVER_URL, {
    transports,
    timeout: 3000,
    extraHeaders: { Origin: origin },
  });

  const timeout = setTimeout(() => {
    socket.close();
    reject(new Error(`Timed out connecting with origin ${origin}`));
  }, 5000);

  socket.once('connect', () => {
    clearTimeout(timeout);
    resolve(socket);
  });

  socket.once('connect_error', (error) => {
    clearTimeout(timeout);
    socket.close();
    reject(error);
  });
});

const onceWithTimeout = (socket, event, timeoutMs = 5000) => new Promise((resolve, reject) => {
  const timeout = setTimeout(() => {
    socket.off(event, handleEvent);
    reject(new Error(`Timed out waiting for ${event}`));
  }, timeoutMs);

  function handleEvent(payload) {
    clearTimeout(timeout);
    resolve(payload);
  }

  socket.once(event, handleEvent);
});

const expectBlockedOrigin = async () => {
  try {
    const socket = await connectSocket({ origin: BLOCKED_ORIGIN });
    socket.close();
    fail('Blocked origin connected unexpectedly');
  } catch {
    console.log('ok - blocked origin rejected');
  }
};

const testAdminRateLimit = async () => {
  const socket = await connectSocket();
  const results = [];

  socket.emit('adminAuth', { password: 'wrong-1' });
  results.push(await onceWithTimeout(socket, 'adminAuthResult'));

  socket.emit('adminAuth', { password: 'wrong-2' });
  results.push(await onceWithTimeout(socket, 'adminAuthResult'));

  socket.emit('adminAuth', { password: 'secret' });
  results.push(await onceWithTimeout(socket, 'adminAuthResult'));

  socket.close();

  if (results[0].success !== false || results[0].attempts !== 1 || results[0].locked) {
    fail(`Unexpected first admin failure: ${JSON.stringify(results[0])}`);
  }
  if (results[1].success !== false || results[1].attempts !== 2 || !results[1].locked) {
    fail(`Unexpected second admin failure: ${JSON.stringify(results[1])}`);
  }
  if (results[2].success !== false || results[2].attempts !== 2 || !results[2].locked) {
    fail(`Admin lock did not block valid password: ${JSON.stringify(results[2])}`);
  }

  console.log('ok - admin rate limit enforced');
};

const testRoomFlow = async () => {
  const socket = await connectSocket();

  socket.emit('register', { name: 'Smoke' });
  socket.emit('createRoom', { roomName: 'Smoke Room', maxUsers: 10, userName: 'Smoke' });

  const room = await onceWithTimeout(socket, 'roomStateUpdated');
  const roomId = room.id;
  const userId = socket.id;
  const duration = room.expiresAt - Date.now();

  if (JSON.stringify(room.votingValues) !== JSON.stringify(EXPECTED_VOTES)) {
    fail(`Unexpected voting values: ${JSON.stringify(room.votingValues)}`);
  }
  if (duration < 7100000 || duration > 7300000) {
    fail(`Unexpected room duration: ${duration}`);
  }

  socket.emit('vote', { roomId, vote: '3' });
  const votedRoom = await onceWithTimeout(socket, 'roomStateUpdated');
  if (votedRoom.users[userId].vote !== '3') {
    fail('Valid vote was not recorded');
  }

  socket.emit('vote', { roomId, vote: '999' });
  const voteError = await onceWithTimeout(socket, 'roomError');
  if (voteError.message !== 'Invalid vote.') {
    fail(`Unexpected vote error: ${JSON.stringify(voteError)}`);
  }

  socket.emit('showVotes', { roomId });
  const revealedRoom = await onceWithTimeout(socket, 'roomStateUpdated');
  if (revealedRoom.votesVisible !== true || revealedRoom.users[userId].vote !== '3') {
    fail('Reveal did not preserve valid vote');
  }

  socket.emit('resetVotes', { roomId });
  const resetRoom = await onceWithTimeout(socket, 'roomStateUpdated');
  if (resetRoom.votesVisible !== false || resetRoom.users[userId].vote !== null) {
    fail('Reset did not clear vote state');
  }

  socket.emit('leaveRoom', { roomId });
  socket.close();

  console.log('ok - room voting flow works');
};

const main = async () => {
  serverProcess = spawn(process.execPath, ['index.js'], {
    cwd: 'server',
    env: {
      ...process.env,
      PORT: String(PORT),
      ADMIN_PASSWORD: 'secret',
      ADMIN_AUTH_MAX_ATTEMPTS: '2',
      ADMIN_AUTH_COOLDOWN_MS: '60000',
      CLIENT_ORIGIN: ALLOWED_ORIGIN,
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  await waitForServer();
  await delay(100);

  const allowedSocket = await connectSocket();
  allowedSocket.close();
  console.log('ok - allowed origin connected');

  await expectBlockedOrigin();
  await testAdminRateLimit();
  await testRoomFlow();

  console.log('smoke test passed');
};

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(() => {
    if (serverProcess) {
      serverProcess.kill();
    }
  });
