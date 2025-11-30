// server.js
import { createServer } from 'http';
import app from './src/app.js';
import connectDB from './config/db.js';
import config from './config/index.js';
import { initSocket } from './src/services/socketio.js';

// Connect to MongoDB
connectDB();

const server = createServer(app);

// Initialize Socket.IO
initSocket(server);

server.listen(config.PORT, () => console.log(`Server running on port ${config.PORT}`));