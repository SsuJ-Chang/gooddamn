import { io } from 'socket.io-client';

/**
 * Socket.IO Client Initialization
 *
 * This module handles the setup and export of the Socket.IO client instance.
 * By centralizing it here, we ensure that the entire application uses a single, consistent
 * connection to the backend server.
 */

// URL of the backend server.
// In a real-world production app, this would likely come from an environment variable.
// For example: `const URL = process.env.NODE_ENV === 'production' ? 'https://your-production-url.com' : 'http://localhost:3000';`
const URL = 'http://localhost:3001';

/**
 * The `socket` instance.
 *
 * We initialize the connection here.
 * `io(URL)`: Creates the connection to the server at the specified URL.
 * `{ autoConnect: false }`: This is an important optimization. We are telling the socket
 * instance not to automatically connect on creation. We will manually call `socket.connect()`
 * in our state management store (`useStore.js`) when the user is actually ready to go online.
 * This prevents unnecessary connections when a user just opens the app.
 */
export const socket = io(URL, {
  autoConnect: false,
});
