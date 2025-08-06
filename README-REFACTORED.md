# 🎯 Refactored Multiplayer Tambola System

A clean, modern UI/UX flow for offline LAN multiplayer Tambola (Housie) game using room codes.

## 🌟 New Features

- **🎨 Clean UI/UX Flow**: Modern, intuitive interface with smooth transitions
- **🚪 Room-Based System**: Create or join rooms using 6-character codes
- **👤 User Authentication**: Simple name-based login with localStorage persistence
- **🎮 Host Controls**: Dedicated host interface for game management
- **📱 Responsive Design**: Works perfectly on desktop, tablet, and mobile
- **🔔 Real-time Updates**: Live notifications and status messages
- **🎯 Focused Gameplay**: Streamlined game interface for better experience

## 🎯 Game Flow

### 1. **Login** (`login.html`)
- Enter player name
- Name is saved to localStorage
- Redirects to dashboard

### 2. **Dashboard** (`dashboard.html`)
- Welcome message with player name
- Two main options:
  - **Create Room**: Start a new game as host
  - **Join Room**: Join existing game with room code

### 3. **Create Room** (`create-room.html`)
- Generates unique 6-character room code
- Shows connected players list
- Copy room code button
- Start game button (enabled when ≥2 players)
- Real-time player join notifications

### 4. **Join Room** (`join-room.html`)
- Input 6-character room code
- Validates room existence
- Shows waiting room with other players
- Waits for host to start game

### 5. **Game** (`game.html`)
- Clean, focused game interface
- Tambola ticket display (9x3 grid)
- Real-time number calling
- Win claim system
- Player list and game status

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the game**:
   - **Local**: http://localhost:3002
   - **Network**: http://[YOUR_IP]:3002

### For Development
```bash
npm run dev
```

## 🎮 How to Play

### Setting Up a Game

1. **Start the server** on one computer (host)
2. **Open the game** in browser: `http://localhost:3002`
3. **Enter your name** and click "Continue"
4. **Click "Create Room"** to start a new game
5. **Share the room code** with other players on your network
6. **Wait for players to join** (minimum 2 players)
7. **Click "Start Game"** when ready

### Joining a Game

1. **Open the game** in browser: `http://[HOST_IP]:3002`
2. **Enter your name** and click "Continue"
3. **Click "Join Room"**
4. **Enter the 6-character room code** provided by the host
5. **Wait in the waiting room** for the host to start the game

### Gameplay

1. **Host picks numbers** using the "Pick Number" button
2. **All players see called numbers** in real-time
3. **Numbers are automatically marked** on each player's ticket
4. **Players can claim wins** when they achieve winning patterns
5. **Server validates all win claims** automatically

## 🏆 Winning Patterns

- **Early Five**: First 5 matched numbers
- **Top Line**: All numbers in first row
- **Middle Line**: All numbers in second row  
- **Bottom Line**: All numbers in third row
- **Four Corners**: All corner numbers matched
- **Full House**: All 15 numbers on ticket

## 📁 File Structure

```
NIGU/
├── login.html              # Player name entry
├── dashboard.html          # Main menu with create/join options
├── create-room.html        # Room creation and management
├── join-room.html          # Room joining interface
├── game.html              # Main game interface
├── server-rooms.js        # Socket.io server with room management
├── roomManager.js         # Room and player management logic
├── gameLogic.js           # Game logic and win validation
├── package.json           # Dependencies and scripts
└── README-REFACTORED.md   # This file
```

## 🔧 Technical Details

### Frontend
- **Pure HTML/CSS/JavaScript**: No frameworks, fast and lightweight
- **Socket.io Client**: Real-time communication
- **LocalStorage**: Player name persistence
- **Responsive Design**: CSS Grid and Flexbox
- **Modern UI**: Gradients, animations, and smooth transitions

### Backend
- **Node.js + Express**: Web server
- **Socket.io**: Real-time bidirectional communication
- **Room Management**: Automatic room creation, joining, and cleanup
- **Game Logic**: Ticket generation, win validation, number picking

### Communication Events

**Client → Server:**
- `createRoom`: Create new room
- `joinRoom`: Join existing room
- `startGame`: Host starts the game
- `pickNumber`: Host picks next number
- `claimWin`: Player claims win

**Server → Client:**
- `roomCreated`: Room creation confirmation
- `roomJoined`: Room join confirmation
- `gameStarted`: Game start notification
- `numberPicked`: New number called
- `winClaimed`: Win announcement
- `playerListUpdated`: Updated player list
- `error`: Error messages

## 🎨 UI/UX Features

### Design Principles
- **Clean & Modern**: Minimalist design with clear hierarchy
- **Intuitive Navigation**: Logical flow from login to game
- **Visual Feedback**: Loading states, animations, and notifications
- **Accessibility**: High contrast, readable fonts, clear buttons
- **Mobile-First**: Responsive design that works on all devices

### Color Scheme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Success**: Green gradient (#4ecdc4 to #44a08d)
- **Warning**: Orange gradient (#ff6b6b to #ee5a24)
- **Accent**: Pink gradient (#f093fb to #f5576c)

### Animations
- **Smooth Transitions**: Hover effects and state changes
- **Loading Spinners**: Visual feedback for async operations
- **Toast Notifications**: Non-intrusive status messages
- **Pulse Effects**: Highlight important game events

## 🌐 Network Setup

### Finding Your IP Address

**On macOS/Linux:**
```bash
ifconfig
# or
ip addr
```

**On Windows:**
```bash
ipconfig
```

### Connecting Players

1. **Host computer**: Start the server
2. **Note the network IP** shown in console
3. **Other players**: Open `http://[HOST_IP]:3002` in their browsers
4. **Follow the login flow** to join the game

## 🔒 Security & Privacy

- **Local Network Only**: Designed for LAN play without internet
- **No Data Persistence**: Game state resets on server restart
- **Input Validation**: Server validates all game actions
- **No Authentication**: Simple name-based identification
- **Room Isolation**: Players only see their own room

## 🐛 Troubleshooting

### Common Issues

**"Cannot connect to server"**
- Check if server is running on port 3002
- Verify IP address and port
- Ensure firewall allows connections

**"Room not found"**
- Check room code spelling (case-sensitive)
- Ensure room was created and is active
- Try refreshing the page

**"Players not seeing updates"**
- Check network connectivity
- Verify Socket.io connection
- Refresh browser if needed

**"Game not starting"**
- Ensure at least 2 players are connected
- Check if you're the host
- Verify all players are in the same room

## 🚀 Future Enhancements

- **Chat System**: In-game messaging between players
- **Game History**: Save and replay previous games
- **Custom Rules**: Configurable game settings
- **Audio Effects**: Sound notifications and background music
- **Leaderboards**: Player statistics and rankings
- **Multiple Rooms**: Support for concurrent games
- **Spectator Mode**: Watch games without playing

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design supported

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing the refactored Multiplayer Tambola! 🎲🎉** 