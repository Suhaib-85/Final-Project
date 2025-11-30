// src/services/socketio.js
import { Server as SocketServer } from 'socket.io';
import config from '../../config/index.js';

let io;

const initSocket = (server) => {
    io = new SocketServer(server, {
        cors: {
            origin: config.FRONTEND_URL,
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log(`Socket connected: ${socket.id}`);

        socket.on('join_idea_room', (data) => {
            const roomName = `idea:${data.ideaId}`;
            socket.join(roomName);
        });

        socket.on('join_user_room', (data) => {
            const roomName = `user:${data.userId}`;
            socket.join(roomName);
        });

        socket.on('disconnect', () => {
            console.log(`Socket disconnected: ${socket.id}`);
        });
    });

    return io;
};

const getIo = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};

export { initSocket, getIo };