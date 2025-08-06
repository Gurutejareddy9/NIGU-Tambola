# 🎯 Multiplayer Tambola Game

A real-time multiplayer Tambola (Housie) game built with Node.js, Socket.io, and HTML5. Play with friends over your local network!

## 🌟 Features

- **🎮 Real-time Multiplayer**: Play with multiple players simultaneously
- **👑 Game Master Role**: One player controls the game and picks numbers
- **🎫 Auto-generated Tickets**: Each player gets a valid Tambola ticket
- **🏆 Win Detection**: Automatic verification of winning patterns
- **📱 Responsive Design**: Works on desktop, tablet, and mobile
- **🔊 Real-time Updates**: Live updates for all game events
- **🌐 LAN Support**: Play over local network without internet

## 🎯 Winning Patterns

- **Early Five**: First 5 matched numbers
- **Top Line**: All numbers in first row
- **Middle Line**: All numbers in second row  
- **Bottom Line**: All numbers in third row
- **Four Corners**: All corner numbers matched
- **Full House**: All 15 numbers on ticket

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Clone or download the project files**
2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the server**:
   ```bash
   npm start
   ```

4. **Access the game**:
   - **Local**: http://localhost:3000
   - **Network**: http://[YOUR_IP]:3000

### For Development
```bash
npm run dev
```

## 🎮 How to Play

### Setting Up the Game

1. **Start the server** on one computer (this will be the host)
2. **Share the network URL** with other players
3. **Players join** by entering their name (optional)
4. **First player becomes Game Master** automatically

### Game Flow

1. **Game Master** clicks "Pick Number" to call numbers
2. **All players** see the called number in real-time
3. **Numbers are marked** automatically on each player's ticket
4. **Players can claim wins** when they achieve winning patterns
5. **Server verifies** all win claims automatically

### Game Master Controls

- **Pick Number**: Calls the next random number (1-90)
- **Transfer Role**: Can transfer Game Master role to another player
- **Game Management**: Controls the overall game flow

### Player Features

- **Auto-generated Ticket**: Each player gets a unique valid ticket
- **Real-time Updates**: See called numbers instantly
- **Win Claims**: Claim wins through the dropdown menu
- **Player List**: See all connected players
- **Connection Status**: Real-time connection indicators

## 🌐 Network Setup

### Finding Your IP Address

**On Windows:**
```bash
ipconfig
```

**On macOS/Linux:**
```bash
ifconfig
# or
ip addr
```

### Connecting Players

1. **Host computer**: Start the server
2. **Note the network IP** shown in console
3. **Other players**: Open `http://[HOST_IP]:3000` in their browsers
4. **Join the game** with their preferred names

## 📁 Project Structure

```
multiplayer-tambola/
├── server.js          # Node.js server with Socket.io
├── client.html        # Client-side game interface
├── package.json       # Dependencies and scripts
├── README-MULTIPLAYER.md  # This file
└── index.html         # Single-player version
```

## 🔧 Technical Details

### Server (server.js)
- **Express.js**: Web server framework
- **Socket.io**: Real-time communication
- **Game Logic**: Ticket generation, win verification
- **Player Management**: Connection handling, role assignment

### Client (client.html)
- **Socket.io Client**: Real-time communication
- **HTML5/CSS3**: Modern responsive interface
- **Vanilla JavaScript**: Game logic and UI updates
- **Real-time Updates**: Live game state synchronization

### Communication Protocol

**Server → Client Events:**
- `gameJoined`: Player successfully joined
- `numberPicked`: New number called
- `playerList`: Updated player list
- `winClaimed`: Valid win announcement
- `gameMasterChanged`: Role transfer

**Client → Server Events:**
- `joinGame`: Player joining request
- `pickNumber`: Game master picking number
- `claimWin`: Player claiming win
- `transferGameMaster`: Role transfer request

## 🎨 Customization

### Styling
- Modify CSS in `client.html` for visual changes
- Update color schemes, fonts, and layouts
- Add animations and effects

### Game Rules
- Edit win patterns in `checkWinningPatterns()` function
- Modify ticket generation logic
- Add new game modes or features

### Server Configuration
- Change port number in `server.js`
- Add authentication or room system
- Implement game persistence

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Check if server is running
- Verify IP address and port
- Ensure firewall allows connections

**"Players not seeing updates"**
- Check network connectivity
- Verify Socket.io connection
- Refresh browser if needed

**"Game Master not working"**
- Check if Game Master is connected
- Verify role assignment
- Try transferring role to another player

### Debug Mode
Enable debug logging by adding to `server.js`:
```javascript
const io = socketIo(server, {
    cors: { origin: "*" }
});
```

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design supported

## 🔒 Security Notes

- **Local Network Only**: Designed for LAN play
- **No Authentication**: Players can join freely
- **No Data Persistence**: Game state resets on server restart
- **Input Validation**: Server validates all win claims

## 🚀 Future Enhancements

- **Rooms System**: Multiple concurrent games
- **Chat Feature**: In-game messaging
- **Game History**: Save and replay games
- **Custom Rules**: Configurable game settings
- **Audio Effects**: Sound notifications
- **Leaderboards**: Player statistics tracking

## 📄 License

This project is open source and available under the MIT License.

## 🤝 Contributing

Feel free to submit issues, feature requests, or pull requests to improve the game!

---

**Enjoy playing Multiplayer Tambola! 🎲🎉** 