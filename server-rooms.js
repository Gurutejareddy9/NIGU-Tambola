const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const RoomManager = require('./roomManager');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Initialize room manager
const roomManager = new RoomManager();

// Serve main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.html'));
});

// Serve static files
app.use(express.static(path.join(__dirname)));

// API endpoint to get all active rooms (for admin purposes)
app.get('/api/rooms', (req, res) => {
    const rooms = roomManager.getAllRooms();
    res.json(rooms);
});

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle room creation
    socket.on('createRoom', (hostName) => {
        const name = hostName || 'Host';
        const room = roomManager.createRoom(socket.id, name);
        
        // Join the room namespace
        socket.join(room.code);
        
        // Send room code back to host
        socket.emit('roomCreated', {
            roomCode: room.code,
            playerName: name,
            ticket: room.host.ticket,
            isHost: true
        });
        
        // Broadcast updated player list to room
        io.to(room.code).emit('playerListUpdated', {
            players: room.players.map(p => ({
                name: p.name,
                isHost: p.isHost
            }))
        });
        
        console.log(`Room ${room.code} created by ${name}`);
    });
    
    // Handle room joining
    socket.on('joinRoom', (data) => {
        const { roomCode, playerName } = data;
        const name = playerName || 'Player';
        
        const result = roomManager.joinRoom(roomCode, socket.id, name);
        
        if (result.success) {
            // Join the room namespace
            socket.join(roomCode);
            
            // Send confirmation to player
            socket.emit('roomJoined', {
                roomCode: roomCode,
                playerName: name,
                ticket: result.player.ticket,
                isHost: false,
                calledNumbers: result.room.calledNumbers,
                winStatus: result.room.winStatus
            });
            
            // Broadcast updated player list to room
            io.to(roomCode).emit('playerListUpdated', {
                players: result.room.players.map(p => ({
                    name: p.name,
                    isHost: p.isHost
                }))
            });
            
            // Notify other players about new player
            socket.to(roomCode).emit('playerJoined', {
                playerName: name
            });
            
            console.log(`Player ${name} joined room ${roomCode}`);
        } else {
            socket.emit('joinError', {
                error: result.error
            });
        }
    });
    
    // Handle number picking (host only)
    socket.on('pickNumber', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        
        if (!room) {
            socket.emit('error', 'You are not in a room');
            return;
        }
        
        // Check if player is host
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', 'Only the host can pick numbers');
            return;
        }
        
        const result = roomManager.pickNumber(room.code);
        
        if (result.success) {
            // Broadcast number to all players in room
            io.to(room.code).emit('numberPicked', {
                number: result.number,
                calledNumbers: result.calledNumbers,
                totalPicked: result.calledNumbers.length
            });
            
            console.log(`Number ${result.number} picked in room ${room.code}`);
        } else {
            socket.emit('error', result.error);
        }
    });
    
    // Handle game start
    socket.on('startGame', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        
        if (!room) {
            socket.emit('error', 'You are not in a room');
            return;
        }
        
        // Check if player is host
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || !player.isHost) {
            socket.emit('error', 'Only the host can start the game');
            return;
        }
        
        // Check if enough players
        if (room.players.length < 2) {
            socket.emit('error', 'Need at least 2 players to start the game');
            return;
        }
        
        // Start automatic number picking
        room.isGameActive = true;
        room.autoPickInterval = setInterval(() => {
            if (room.isGameActive && room.calledNumbers.length < 90) {
                const result = roomManager.pickNumber(room.code);
                if (result.success) {
                    io.to(room.code).emit('numberPicked', {
                        number: result.number,
                        calledNumbers: result.calledNumbers,
                        totalPicked: result.calledNumbers.length
                    });
                    console.log(`Auto-picked number ${result.number} in room ${room.code}`);
                }
            } else if (room.calledNumbers.length >= 90) {
                // Game finished - all numbers called
                clearInterval(room.autoPickInterval);
                io.to(room.code).emit('gameFinished', {
                    message: 'All numbers have been called!',
                    calledNumbers: room.calledNumbers
                });
                console.log(`Game finished in room ${room.code} - all numbers called`);
            }
        }, 5000); // Pick a number every 5 seconds
        
        // Broadcast game start to all players in room with their tickets
        room.players.forEach(player => {
            io.to(player.socketId).emit('gameStarted', {
                message: 'Game started! Numbers will be picked automatically every 5 seconds.',
                timestamp: new Date().toISOString(),
                ticket: player.ticket
            });
        });
        
        console.log(`Game started in room ${room.code} by ${player.name} - Auto-picking enabled`);
    });
    
    // Handle win claim
    socket.on('claimWin', (data) => {
        const { pattern } = data;
        const room = roomManager.getRoomBySocket(socket.id);
        
        if (!room) {
            socket.emit('error', 'You are not in a room');
            return;
        }
        
        const result = roomManager.claimWin(room.code, socket.id, pattern);
        
        if (result.success) {
            // Broadcast win to all players in room
            io.to(room.code).emit('winClaimed', {
                playerName: result.player,
                pattern: pattern,
                timestamp: new Date().toISOString()
            });
            
            // Update win status for all players
            io.to(room.code).emit('winStatusUpdated', {
                winStatus: result.winStatus
            });
            
            // If game ended, notify all players
            if (result.gameEnded) {
                io.to(room.code).emit('gameEnded', {
                    sessionId: room.sessionId,
                    winners: result.winStatus
                });
            }
            
            console.log(`Player ${result.player} claimed ${pattern} in room ${room.code}`);
        } else {
            socket.emit('claimRejected', {
                pattern: pattern,
                error: result.error
            });
        }
    });
    
    // Handle player disconnect
    socket.on('disconnect', () => {
        const result = roomManager.removePlayer(socket.id);
        
        if (result) {
            if (result.deleted) {
                console.log(`Room ${result.roomCode} deleted`);
            } else {
                // Stop automatic number picking if game was active
                if (result.room.autoPickInterval) {
                    clearInterval(result.room.autoPickInterval);
                    result.room.isGameActive = false;
                    console.log(`Stopped auto-picking in room ${result.roomCode} due to player disconnect`);
                }
                
                // Notify remaining players
                io.to(result.roomCode).emit('playerLeft', {
                    playerName: result.player
                });
                
                // Update player list
                io.to(result.roomCode).emit('playerListUpdated', {
                    players: result.room.players.map(p => ({
                        name: p.name,
                        isHost: p.isHost
                    }))
                });
                
                // If new host was assigned, notify them
                const newHost = result.room.players.find(p => p.isHost);
                if (newHost) {
                    io.to(newHost.socketId).emit('hostAssigned', {
                        message: 'You are now the host'
                    });
                }
                
                console.log(`Player ${result.player} left room ${result.roomCode}`);
            }
        }
    });
    
    // Handle room info request
    socket.on('getRoomInfo', () => {
        const room = roomManager.getRoomBySocket(socket.id);
        
        if (room) {
            const roomInfo = roomManager.getRoomInfo(room.code);
            socket.emit('roomInfo', roomInfo);
        } else {
            socket.emit('error', 'You are not in a room');
        }
    });
});

// Clean up inactive rooms every hour
setInterval(() => {
    roomManager.cleanupInactiveRooms();
}, 60 * 60 * 1000);

// Start server
const PORT = process.env.PORT || 3002;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`🎯 Room-based Tambola Server running on port ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${getLocalIP()}:${PORT}`);
});

// Get local IP address
function getLocalIP() {
    const { networkInterfaces } = require('os');
    const nets = networkInterfaces();
    
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
} 