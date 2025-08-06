const { generateTicketNumbers, checkWinningPatterns } = require('./gameLogic');

class RoomManager {
    constructor() {
        this.rooms = new Map(); // roomCode -> roomData
        this.socketToRoom = new Map(); // socketId -> roomCode
    }

    // Generate unique 6-character alphanumeric room code
    generateRoomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code;
        do {
            code = '';
            for (let i = 0; i < 6; i++) {
                code += chars.charAt(Math.floor(Math.random() * chars.length));
            }
        } while (this.rooms.has(code));
        return code;
    }

    // Create a new room
    createRoom(hostSocketId, hostName) {
        const roomCode = this.generateRoomCode();
        const hostTicket = generateTicketNumbers();
        
        const room = {
            code: roomCode,
            host: {
                socketId: hostSocketId,
                name: hostName,
                ticket: hostTicket
            },
            players: [
                {
                    socketId: hostSocketId,
                    name: hostName,
                    ticket: hostTicket,
                    isHost: true
                }
            ],
            calledNumbers: [],
            winStatus: {
                earlyFive: null,
                topLine: null,
                middleLine: null,
                bottomLine: null,
                fourCorners: null,
                fullHouse: null
            },
            isActive: true,
            createdAt: new Date().toISOString(),
            sessionId: `session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`
        };

        this.rooms.set(roomCode, room);
        this.socketToRoom.set(hostSocketId, roomCode);
        
        console.log(`Room created: ${roomCode} by ${hostName}`);
        return room;
    }

    // Join an existing room
    joinRoom(roomCode, playerSocketId, playerName) {
        const room = this.rooms.get(roomCode);
        
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (!room.isActive) {
            return { success: false, error: 'Room is not active' };
        }
        
        // Check if player already exists in room
        const existingPlayer = room.players.find(p => p.socketId === playerSocketId);
        if (existingPlayer) {
            return { success: false, error: 'Player already in room' };
        }
        
        // Check if name is already taken
        const nameTaken = room.players.find(p => p.name === playerName);
        if (nameTaken) {
            return { success: false, error: 'Name already taken' };
        }
        
        const playerTicket = generateTicketNumbers();
        const player = {
            socketId: playerSocketId,
            name: playerName,
            ticket: playerTicket,
            isHost: false
        };
        
        room.players.push(player);
        this.socketToRoom.set(playerSocketId, roomCode);
        
        console.log(`Player ${playerName} joined room ${roomCode}`);
        return { success: true, room, player };
    }

    // Get room by code
    getRoom(roomCode) {
        return this.rooms.get(roomCode);
    }

    // Get room by socket ID
    getRoomBySocket(socketId) {
        const roomCode = this.socketToRoom.get(socketId);
        return roomCode ? this.rooms.get(roomCode) : null;
    }

    // Pick a number in a room
    pickNumber(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        if (room.calledNumbers.length >= 90) {
            return { success: false, error: 'All numbers have been called' };
        }
        
        let number;
        do {
            number = Math.floor(Math.random() * 90) + 1;
        } while (room.calledNumbers.includes(number));
        
        room.calledNumbers.push(number);
        
        console.log(`Number ${number} picked in room ${roomCode}`);
        return { success: true, number, calledNumbers: room.calledNumbers };
    }

    // Claim a win in a room
    claimWin(roomCode, playerSocketId, pattern) {
        const room = this.rooms.get(roomCode);
        if (!room) {
            return { success: false, error: 'Room not found' };
        }
        
        const player = room.players.find(p => p.socketId === playerSocketId);
        if (!player) {
            return { success: false, error: 'Player not found' };
        }
        
        // Check if pattern already claimed
        if (room.winStatus[pattern]) {
            return { success: false, error: 'Pattern already claimed' };
        }
        
        // Validate win claim
        const winStatus = checkWinningPatterns(player.ticket, room.calledNumbers);
        
        if (winStatus[pattern]) {
            room.winStatus[pattern] = player.name;
            
            console.log(`Player ${player.name} claimed ${pattern} in room ${roomCode}`);
            
            // Check if full house is claimed (game end)
            if (pattern === 'fullHouse') {
                room.isActive = false;
                console.log(`Game ended in room ${roomCode}`);
            }
            
            return { 
                success: true, 
                player: player.name, 
                pattern,
                gameEnded: pattern === 'fullHouse',
                winStatus: room.winStatus
            };
        } else {
            return { success: false, error: 'Invalid win claim' };
        }
    }

    // Remove player from room
    removePlayer(socketId) {
        const roomCode = this.socketToRoom.get(socketId);
        if (!roomCode) {
            return null;
        }
        
        const room = this.rooms.get(roomCode);
        if (!room) {
            this.socketToRoom.delete(socketId);
            return null;
        }
        
        const playerIndex = room.players.findIndex(p => p.socketId === socketId);
        if (playerIndex === -1) {
            this.socketToRoom.delete(socketId);
            return null;
        }
        
        const player = room.players[playerIndex];
        room.players.splice(playerIndex, 1);
        this.socketToRoom.delete(socketId);
        
        console.log(`Player ${player.name} left room ${roomCode}`);
        
        // If no players left, delete room
        if (room.players.length === 0) {
            this.rooms.delete(roomCode);
            console.log(`Room ${roomCode} deleted (no players)`);
            return { roomCode, deleted: true };
        }
        
        // If host left, assign new host
        if (player.isHost && room.players.length > 0) {
            const newHost = room.players[0];
            newHost.isHost = true;
            room.host = {
                socketId: newHost.socketId,
                name: newHost.name,
                ticket: newHost.ticket
            };
            console.log(`New host assigned: ${newHost.name} in room ${roomCode}`);
        }
        
        return { roomCode, room, player: player.name };
    }

    // Get room info for client
    getRoomInfo(roomCode) {
        const room = this.rooms.get(roomCode);
        if (!room) {
            return null;
        }
        
        return {
            code: room.code,
            host: room.host.name,
            playerCount: room.players.length,
            calledNumbersCount: room.calledNumbers.length,
            isActive: room.isActive,
            winStatus: room.winStatus,
            createdAt: room.createdAt,
            sessionId: room.sessionId
        };
    }

    // Get all rooms (for admin purposes)
    getAllRooms() {
        return Array.from(this.rooms.values()).map(room => ({
            code: room.code,
            host: room.host.name,
            playerCount: room.players.length,
            isActive: room.isActive,
            createdAt: room.createdAt
        }));
    }

    // Clean up inactive rooms (older than 24 hours)
    cleanupInactiveRooms() {
        const now = new Date();
        const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        
        for (const [roomCode, room] of this.rooms.entries()) {
            const roomDate = new Date(room.createdAt);
            if (roomDate < oneDayAgo && !room.isActive) {
                // Remove all socket mappings for this room
                room.players.forEach(player => {
                    this.socketToRoom.delete(player.socketId);
                });
                this.rooms.delete(roomCode);
                console.log(`Cleaned up inactive room: ${roomCode}`);
            }
        }
    }
}

module.exports = RoomManager; 