const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const connectedUsers = new Map();
const rooms = ['Général', 'Gaming', 'Random', 'Tech'];

function getRandomColor() {
    const colors = ['#0d6efd', '#198754', '#dc3545', '#fd7e14', '#6f42c1', '#d63384', '#20c997', '#ffc107'];
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomAvatar() {
    const avatars = ['🐶','🐱','🐭','🐹','🐰','🦊','🐻','🐼','🐨','🐯','🦁','🐮','🐷','🐸','🐵','🐔','🐧','🐦','🦆','🦅','🦉','🦇','🐺','🐗','🐴','🦄','🐝','🐛','🦋','🐌','🐞','🐜','🪲','🐢','🐍','🦎','🦖','🦕','🐙','🦑','🦐','🦞','🦀','🐡','🐠','🐟','🐬','🐳','🐋','🦈','🐊','🐅','🐆','🦓','🦍','🦧'];
    return avatars[Math.floor(Math.random() * avatars.length)];
}

io.on('connection', (socket) => {
    socket.currentRoom = 'Général';

    socket.on('set username', (data) => {
        const username = (data.username || '').trim() || `Anonyme_${socket.id.slice(0, 5)}`;
        const avatar = data.avatar || getRandomAvatar();
        const userData = {
            username,
            color: getRandomColor(),
            avatar,
            status: 'active',
            lastActivity: Date.now()
        };
        connectedUsers.set(socket.id, userData);
        socket.join('Général');

        socket.emit('user joined', {
            message: `Bienvenue ${username} !`,
            username,
            color: userData.color,
            avatar,
            rooms
        });

        socket.broadcast.to('Général').emit('system message', {
            message: `${avatar} ${username} a rejoint le chat`,
            type: 'join',
            room: 'Général'
        });

        io.to('Général').emit('update users', {
            users: Array.from(connectedUsers.values()).filter(u => true),
            room: 'Général'
        });
    });

    socket.on('join room', (room) => {
        const user = connectedUsers.get(socket.id);
        if (!user || !rooms.includes(room)) return;

        const oldRoom = socket.currentRoom;
        socket.leave(oldRoom);
        socket.join(room);
        socket.currentRoom = room;

        socket.broadcast.to(oldRoom).emit('system message', {
            message: `${user.avatar} ${user.username} a quitté le salon`,
            type: 'leave',
            room: oldRoom
        });

        socket.broadcast.to(room).emit('system message', {
            message: `${user.avatar} ${user.username} a rejoint le salon`,
            type: 'join',
            room
        });

        io.to(oldRoom).emit('update users', {
            users: Array.from(connectedUsers.values()),
            room: oldRoom
        });

        io.to(room).emit('update users', {
            users: Array.from(connectedUsers.values()),
            room
        });

        socket.emit('room joined', { room });
    });

    socket.on('chat message', (data) => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;

        const messageData = {
            username: user.username,
            color: user.color,
            avatar: user.avatar,
            message: data.message.trim(),
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
            isOwn: false,
            room: socket.currentRoom,
            id: Date.now() + '_' + socket.id
        };

        user.lastActivity = Date.now();
        user.status = 'active';

        socket.emit('chat message', { ...messageData, isOwn: true });
        socket.broadcast.to(socket.currentRoom).emit('chat message', messageData);
    });

    socket.on('private message', (data) => {
        const sender = connectedUsers.get(socket.id);
        if (!sender) return;

        let targetSocketId = null;
        for (const [id, user] of connectedUsers) {
            if (user.username === data.to) {
                targetSocketId = id;
                break;
            }
        }

        if (!targetSocketId) return;

        const dmData = {
            from: sender.username,
            fromColor: sender.color,
            fromAvatar: sender.avatar,
            message: data.message.trim(),
            timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })
        };

        io.to(targetSocketId).emit('private message', dmData);
        socket.emit('private message', { ...dmData, isOwn: true, to: data.to });
    });

    socket.on('typing', () => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;
        user.lastActivity = Date.now();
        user.status = 'active';
        socket.broadcast.to(socket.currentRoom).emit('user typing', {
            username: user.username,
            avatar: user.avatar,
            room: socket.currentRoom
        });
    });

    socket.on('stop typing', () => {
        const user = connectedUsers.get(socket.id);
        if (!user) return;
        socket.broadcast.to(socket.currentRoom).emit('user stop typing', {
            username: user.username,
            room: socket.currentRoom
        });
    });

    socket.on('activity', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            user.lastActivity = Date.now();
            user.status = 'active';
        }
    });

    socket.on('disconnect', () => {
        const user = connectedUsers.get(socket.id);
        if (user) {
            io.to(socket.currentRoom).emit('system message', {
                message: `${user.avatar} ${user.username} a quitté le chat`,
                type: 'leave',
                room: socket.currentRoom
            });
            connectedUsers.delete(socket.id);
            io.to(socket.currentRoom).emit('update users', {
                users: Array.from(connectedUsers.values()),
                room: socket.currentRoom
            });
        }
    });
});

setInterval(() => {
    const now = Date.now();
    for (const [id, user] of connectedUsers) {
        if (now - user.lastActivity > 120000) {
            user.status = 'away';
        }
    }
    const allUsers = Array.from(connectedUsers.values());
    io.emit('status update', allUsers);
}, 30000);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log(`Serveur démarré sur http://localhost:${PORT}`);
});