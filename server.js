const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const path = require('path');
const fs = require('fs').promises;
const { networkInterfaces } = require('os');

const app = express();
const server = http.createServer(app);
const io = socketIo(server);

// Serve static files
app.use(express.static(path.join(__dirname)));

// Serve client.html as the main page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'client.html'));
});

// Serve sessions page
app.get('/sessions', (req, res) => {
    res.sendFile(path.join(__dirname, 'sessions.html'));
});

// Serve leaderboard page
app.get('/leaderboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'leaderboard.html'));
});

// API endpoint to get session list
app.get('/api/sessions', async (req, res) => {
    try {
        const sessions = await getSessionList();
        res.json(sessions);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load sessions' });
    }
});

// API endpoint to get specific session
app.get('/api/sessions/:sessionId', async (req, res) => {
    try {
        const session = await loadSession(req.params.sessionId);
        if (session) {
            res.json(session);
        } else {
            res.status(404).json({ error: 'Session not found' });
        }
    } catch (error) {
        res.status(500).json({ error: 'Failed to load session' });
    }
});

// API endpoint to get leaderboard
app.get('/api/leaderboard', async (req, res) => {
    try {
        const leaderboard = await loadLeaderboard();
        res.json(leaderboard);
    } catch (error) {
        res.status(500).json({ error: 'Failed to load leaderboard' });
    }
});

// API endpoint to check for incomplete session
app.get('/api/incomplete-session', async (req, res) => {
    try {
        const session = await getLastIncompleteSession();
        res.json({ hasIncompleteSession: !!session, session });
    } catch (error) {
        res.status(500).json({ error: 'Failed to check incomplete session' });
    }
});

// Game state
const gameState = {
    players: new Map(), // socketId -> playerData
    pickedNumbers: [],
    gameMaster: null,
    isGameActive: false,
    currentNumber: null,
    sessionId: null,
    startTime: null,
    winners: {
        earlyFive: null,
        topLine: null,
        middleLine: null,
        bottomLine: null,
        fourCorners: null,
        fullHouse: null
    }
};

// File paths
const SESSIONS_DIR = './sessions';
const LEADERBOARD_FILE = './leaderboard.json';

// Ensure directories exist
async function ensureDirectories() {
    try {
        await fs.mkdir(SESSIONS_DIR, { recursive: true });
    } catch (error) {
        console.log('Sessions directory already exists');
    }
}

// Generate session ID
function generateSessionId() {
    return `session-${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}`;
}

// Save session to file
async function saveSession() {
    try {
        const sessionData = {
            sessionId: gameState.sessionId,
            startTime: gameState.startTime,
            endTime: new Date().toISOString(),
            players: Array.from(gameState.players.values()).map(player => ({
                name: player.name,
                id: player.id,
                ticket: player.ticket
            })),
            calledNumbers: gameState.pickedNumbers,
            winners: gameState.winners
        };

        const filename = `${gameState.sessionId}.json`;
        const filepath = path.join(SESSIONS_DIR, filename);
        await fs.writeFile(filepath, JSON.stringify(sessionData, null, 2));
        console.log(`Session saved: ${filename}`);
    } catch (error) {
        console.error('Error saving session:', error);
    }
}

// Load session from file
async function loadSession(sessionId) {
    try {
        const filepath = path.join(SESSIONS_DIR, `${sessionId}.json`);
        const data = await fs.readFile(filepath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        console.error('Error loading session:', error);
        return null;
    }
}

// Get all session files
async function getSessionList() {
    try {
        const files = await fs.readdir(SESSIONS_DIR);
        const sessions = [];
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filepath = path.join(SESSIONS_DIR, file);
                const data = await fs.readFile(filepath, 'utf8');
                const session = JSON.parse(data);
                sessions.push({
                    sessionId: session.sessionId,
                    startTime: session.startTime,
                    endTime: session.endTime,
                    playerCount: session.players.length,
                    calledNumbersCount: session.calledNumbers.length
                });
            }
        }
        
        return sessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime));
    } catch (error) {
        console.error('Error getting session list:', error);
        return [];
    }
}

// Load leaderboard
async function loadLeaderboard() {
    try {
        const data = await fs.readFile(LEADERBOARD_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // Return empty leaderboard if file doesn't exist
        return {};
    }
}

// Save leaderboard
async function saveLeaderboard(leaderboard) {
    try {
        await fs.writeFile(LEADERBOARD_FILE, JSON.stringify(leaderboard, null, 2));
    } catch (error) {
        console.error('Error saving leaderboard:', error);
    }
}

// Update leaderboard with winners
async function updateLeaderboard(winners) {
    try {
        const leaderboard = await loadLeaderboard();
        
        Object.entries(winners).forEach(([pattern, winner]) => {
            if (winner) {
                if (!leaderboard[winner]) {
                    leaderboard[winner] = {
                        totalGames: 0,
                        wins: {
                            earlyFive: 0,
                            topLine: 0,
                            middleLine: 0,
                            bottomLine: 0,
                            fourCorners: 0,
                            fullHouse: 0
                        }
                    };
                }
                
                leaderboard[winner].wins[pattern]++;
            }
        });
        
        // Update total games for all players
        Array.from(gameState.players.values()).forEach(player => {
            if (!leaderboard[player.name]) {
                leaderboard[player.name] = {
                    totalGames: 0,
                    wins: {
                        earlyFive: 0,
                        topLine: 0,
                        middleLine: 0,
                        bottomLine: 0,
                        fourCorners: 0,
                        fullHouse: 0
                    }
                };
            }
            leaderboard[player.name].totalGames++;
        });
        
        await saveLeaderboard(leaderboard);
    } catch (error) {
        console.error('Error updating leaderboard:', error);
    }
}

// Check for last incomplete session
async function getLastIncompleteSession() {
    try {
        const files = await fs.readdir(SESSIONS_DIR);
        const incompleteSessions = [];
        
        for (const file of files) {
            if (file.endsWith('.json')) {
                const filepath = path.join(SESSIONS_DIR, file);
                const data = await fs.readFile(filepath, 'utf8');
                const session = JSON.parse(data);
                
                // Check if session is incomplete (no full house winner)
                if (!session.winners.fullHouse) {
                    incompleteSessions.push(session);
                }
            }
        }
        
        if (incompleteSessions.length > 0) {
            return incompleteSessions.sort((a, b) => new Date(b.endTime) - new Date(a.endTime))[0];
        }
        
        return null;
    } catch (error) {
        console.error('Error checking incomplete sessions:', error);
        return null;
    }
}

// Generate valid Tambola ticket numbers
function generateTicketNumbers() {
    const ticket = Array(3).fill(null).map(() => Array(9).fill(null));
    
    // Define column ranges
    const columnRanges = [
        [1, 10], [11, 20], [21, 30], [31, 40], [41, 50],
        [51, 60], [61, 70], [71, 80], [81, 90]
    ];
    
    // Generate numbers for each row (5 numbers per row)
    for (let row = 0; row < 3; row++) {
        const selectedColumns = [];
        while (selectedColumns.length < 5) {
            const col = Math.floor(Math.random() * 9);
            if (!selectedColumns.includes(col)) {
                selectedColumns.push(col);
            }
        }
        
        // Fill selected columns with valid numbers
        selectedColumns.forEach(col => {
            const [min, max] = columnRanges[col];
            
            // Check if column already has numbers
            const existingNumbers = [];
            for (let r = 0; r < 3; r++) {
                if (ticket[r][col] !== null) {
                    existingNumbers.push(ticket[r][col]);
                }
            }
            
            // Find available numbers in this column range
            const availableNumbers = [];
            for (let num = min; num <= max; num++) {
                if (!existingNumbers.includes(num)) {
                    availableNumbers.push(num);
                }
            }
            
            // Select a random available number
            if (availableNumbers.length > 0) {
                const randomIndex = Math.floor(Math.random() * availableNumbers.length);
                ticket[row][col] = availableNumbers[randomIndex];
            }
        });
    }
    
    return ticket;
}

// Check winning patterns in Tambola
function checkWinningPatterns(ticket, markedNumbers) {
    const result = {
        earlyFive: false,
        topLine: false,
        middleLine: false,
        bottomLine: false,
        fullHouse: false,
        fourCorners: false
    };
    
    // Count matched numbers on the ticket
    let matchedCount = 0;
    
    for (let row = 0; row < 3; row++) {
        for (let col = 0; col < 9; col++) {
            if (ticket[row][col] !== null && markedNumbers.includes(ticket[row][col])) {
                matchedCount++;
            }
        }
    }
    
    // Early Five: First 5 matched numbers
    if (matchedCount >= 5) {
        result.earlyFive = true;
    }
    
    // Check each row for complete lines
    for (let row = 0; row < 3; row++) {
        let rowMatchedCount = 0;
        let rowTotalNumbers = 0;
        
        for (let col = 0; col < 9; col++) {
            if (ticket[row][col] !== null) {
                rowTotalNumbers++;
                if (markedNumbers.includes(ticket[row][col])) {
                    rowMatchedCount++;
                }
            }
        }
        
        // Check if all numbers in this row are matched
        if (rowMatchedCount === rowTotalNumbers && rowTotalNumbers > 0) {
            if (row === 0) result.topLine = true;
            if (row === 1) result.middleLine = true;
            if (row === 2) result.bottomLine = true;
        }
    }
    
    // Full House: All 15 numbers matched
    if (matchedCount === 15) {
        result.fullHouse = true;
    }
    
    // Four Corners: Check corner positions
    const cornerPositions = [
        [0, 0], [0, 8], [2, 0], [2, 8]
    ];
    
    let cornersMatched = 0;
    let cornersWithNumbers = 0;
    
    cornerPositions.forEach(([row, col]) => {
        if (ticket[row][col] !== null) {
            cornersWithNumbers++;
            if (markedNumbers.includes(ticket[row][col])) {
                cornersMatched++;
            }
        }
    });
    
    // Four Corners: All corner numbers (if any exist) are matched
    if (cornersWithNumbers > 0 && cornersMatched === cornersWithNumbers) {
        result.fourCorners = true;
    }
    
    return result;
}

// Generate random player name
function generatePlayerName() {
    const adjectives = ['Happy', 'Lucky', 'Smart', 'Quick', 'Bright', 'Clever', 'Wise', 'Sharp'];
    const nouns = ['Player', 'Gamer', 'Winner', 'Champion', 'Star', 'Hero', 'Master', 'Pro'];
    const adj = adjectives[Math.floor(Math.random() * adjectives.length)];
    const noun = nouns[Math.floor(Math.random() * nouns.length)];
    const number = Math.floor(Math.random() * 999) + 1;
    return `${adj}${noun}${number}`;
}

// Socket.io connection handling
io.on('connection', (socket) => {
    console.log(`Player connected: ${socket.id}`);
    
    // Handle player join
    socket.on('joinGame', (playerName) => {
        const name = playerName || generatePlayerName();
        const ticket = generateTicketNumbers();
        
        const playerData = {
            id: socket.id,
            name: name,
            ticket: ticket,
            joinedAt: new Date()
        };
        
        gameState.players.set(socket.id, playerData);
        
        // Initialize session if not already started
        if (!gameState.sessionId) {
            gameState.sessionId = generateSessionId();
            gameState.startTime = new Date().toISOString();
        }
        
        // Send player their ticket and game state
        socket.emit('gameJoined', {
            playerId: socket.id,
            playerName: name,
            ticket: ticket,
            pickedNumbers: gameState.pickedNumbers,
            isGameMaster: gameState.gameMaster === null,
            sessionId: gameState.sessionId
        });
        
        // If this is the first player, make them game master
        if (gameState.gameMaster === null) {
            gameState.gameMaster = socket.id;
            socket.emit('gameMasterRole', true);
        }
        
        // Broadcast player list to all clients
        broadcastPlayerList();
        
        console.log(`Player ${name} joined the game`);
    });
    
    // Handle game master picking a number
    socket.on('pickNumber', () => {
        if (socket.id !== gameState.gameMaster) {
            socket.emit('error', 'Only the game master can pick numbers');
            return;
        }
        
        if (gameState.pickedNumbers.length >= 90) {
            socket.emit('error', 'All numbers have been picked!');
            return;
        }
        
        let number;
        do {
            number = Math.floor(Math.random() * 90) + 1;
        } while (gameState.pickedNumbers.includes(number));
        
        gameState.pickedNumbers.push(number);
        gameState.currentNumber = number;
        gameState.isGameActive = true;
        
        // Broadcast the picked number to all players
        io.emit('numberPicked', {
            number: number,
            pickedNumbers: gameState.pickedNumbers,
            totalPicked: gameState.pickedNumbers.length
        });
        
        console.log(`Game master picked number: ${number}`);
    });
    
    // Handle win claim
    socket.on('claimWin', async (claimData) => {
        const player = gameState.players.get(socket.id);
        if (!player) {
            socket.emit('error', 'Player not found');
            return;
        }
        
        const { pattern } = claimData;
        const winStatus = checkWinningPatterns(player.ticket, gameState.pickedNumbers);
        
        if (winStatus[pattern]) {
            // Valid win claim
            const winMessage = {
                playerName: player.name,
                pattern: pattern,
                timestamp: new Date()
            };
            
            // Record the winner
            gameState.winners[pattern] = player.name;
            
            // Broadcast win to all players
            io.emit('winClaimed', winMessage);
            
            console.log(`Player ${player.name} claimed ${pattern} win!`);
            
            // If full house is claimed, end the game
            if (pattern === 'fullHouse') {
                // Save session and update leaderboard
                await saveSession();
                await updateLeaderboard(gameState.winners);
                
                // Broadcast game end
                io.emit('gameEnded', {
                    winners: gameState.winners,
                    sessionId: gameState.sessionId
                });
                
                // Reset game state for new game
                gameState.pickedNumbers = [];
                gameState.winners = {
                    earlyFive: null,
                    topLine: null,
                    middleLine: null,
                    bottomLine: null,
                    fourCorners: null,
                    fullHouse: null
                };
                gameState.sessionId = null;
                gameState.startTime = null;
                gameState.isGameActive = false;
            }
        } else {
            // Invalid claim
            socket.emit('claimRejected', {
                pattern: pattern,
                message: 'Invalid win claim'
            });
            
            console.log(`Invalid win claim from ${player.name} for ${pattern}`);
        }
    });
    
    // Handle game master transfer
    socket.on('transferGameMaster', (newGameMasterId) => {
        if (socket.id !== gameState.gameMaster) {
            socket.emit('error', 'Only the current game master can transfer role');
            return;
        }
        
        const newGameMaster = gameState.players.get(newGameMasterId);
        if (!newGameMaster) {
            socket.emit('error', 'Player not found');
            return;
        }
        
        gameState.gameMaster = newGameMasterId;
        
        // Notify both players
        socket.emit('gameMasterRole', false);
        io.to(newGameMasterId).emit('gameMasterRole', true);
        
        // Broadcast to all players
        io.emit('gameMasterChanged', {
            newGameMaster: newGameMaster.name,
            newGameMasterId: newGameMasterId
        });
        
        console.log(`Game master transferred to ${newGameMaster.name}`);
    });
    
    // Handle resume last game
    socket.on('resumeLastGame', async () => {
        if (socket.id !== gameState.gameMaster) {
            socket.emit('error', 'Only the game master can resume games');
            return;
        }
        
        const incompleteSession = await getLastIncompleteSession();
        if (incompleteSession) {
            // Restore game state
            gameState.sessionId = incompleteSession.sessionId;
            gameState.startTime = incompleteSession.startTime;
            gameState.pickedNumbers = incompleteSession.calledNumbers;
            gameState.winners = incompleteSession.winners;
            gameState.isGameActive = true;
            
            // Restore players
            incompleteSession.players.forEach(playerData => {
                const existingPlayer = Array.from(gameState.players.values())
                    .find(p => p.name === playerData.name);
                
                if (existingPlayer) {
                    existingPlayer.ticket = playerData.ticket;
                }
            });
            
            // Broadcast restored game state
            io.emit('gameResumed', {
                sessionId: gameState.sessionId,
                pickedNumbers: gameState.pickedNumbers,
                winners: gameState.winners
            });
            
            console.log(`Game resumed: ${gameState.sessionId}`);
        } else {
            socket.emit('error', 'No incomplete game found to resume');
        }
    });
    
    // Handle disconnect
    socket.on('disconnect', () => {
        const player = gameState.players.get(socket.id);
        if (player) {
            console.log(`Player ${player.name} disconnected`);
            gameState.players.delete(socket.id);
            
            // If game master disconnected, assign to next player
            if (socket.id === gameState.gameMaster) {
                const players = Array.from(gameState.players.values());
                if (players.length > 0) {
                    gameState.gameMaster = players[0].id;
                    io.to(players[0].id).emit('gameMasterRole', true);
                    io.emit('gameMasterChanged', {
                        newGameMaster: players[0].name,
                        newGameMasterId: players[0].id
                    });
                } else {
                    gameState.gameMaster = null;
                }
            }
            
            broadcastPlayerList();
        }
    });
});

// Broadcast player list to all clients
function broadcastPlayerList() {
    const players = Array.from(gameState.players.values()).map(player => ({
        id: player.id,
        name: player.name,
        isGameMaster: player.id === gameState.gameMaster
    }));
    
    io.emit('playerList', players);
}

// Start server
const PORT = process.env.PORT || 3001;
server.listen(PORT, '0.0.0.0', async () => {
    // Ensure directories exist
    await ensureDirectories();
    
    // Check for incomplete sessions
    const incompleteSession = await getLastIncompleteSession();
    if (incompleteSession) {
        console.log(`⚠️  Found incomplete session: ${incompleteSession.sessionId}`);
    }
    
    console.log(`🎯 Tambola Server running on port ${PORT}`);
    console.log(`🌐 Local: http://localhost:${PORT}`);
    console.log(`🌐 Network: http://${getLocalIP()}:${PORT}`);
    console.log(`📊 Sessions: http://localhost:${PORT}/sessions`);
    console.log(`🏆 Leaderboard: http://localhost:${PORT}/leaderboard`);
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