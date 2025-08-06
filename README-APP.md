# 🎯 Tambola App - Single Page Application

A modern, app-like experience for multiplayer Tambola (Housie) with smooth transitions and seamless navigation.

## 🌟 App Features

- **📱 Single Page Application**: All functionality in one seamless interface
- **🎨 Smooth Transitions**: Beautiful slide animations between views
- **🚪 Room-Based Multiplayer**: Create or join rooms using 6-character codes
- **👤 User Persistence**: Player names saved automatically
- **🎮 Real-time Gameplay**: Live updates and notifications
- **📱 Responsive Design**: Works perfectly on all devices
- **🎯 Focused Experience**: Clean, distraction-free interface

## 🎯 App Flow

### 1. **Login View**
- Enter your player name
- Name is automatically saved for future visits
- Smooth transition to dashboard

### 2. **Dashboard View**
- Welcome message with your name
- Two main options:
  - **Create Room**: Start a new game as host
  - **Join Room**: Join existing game with room code
- Click any option to navigate seamlessly

### 3. **Create Room View**
- Generates unique 6-character room code
- Real-time player list updates
- Copy room code with one click
- Start game when ready (minimum 2 players)
- Back button to return to dashboard

### 4. **Join Room View**
- Enter 6-character room code
- Automatic validation and error handling
- Waiting room with live player updates
- Automatic transition to game when host starts

### 5. **Game View**
- Clean, focused game interface
- Tambola ticket display (9x3 grid)
- Real-time number calling
- Win claim system
- Host controls (if you're the host)
- Back button to return to dashboard

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

3. **Open the app**:
   - **Local**: http://localhost:3002
   - **Network**: http://[YOUR_IP]:3002

## 🎮 How to Use

### Setting Up a Game

1. **Open the app** in your browser
2. **Enter your name** and click "Continue"
3. **Click "Create Room"** on the dashboard
4. **Share the room code** with friends on your network
5. **Wait for players to join** (minimum 2 players)
6. **Click "Start Game"** when ready

### Joining a Game

1. **Open the app** in your browser
2. **Enter your name** and click "Continue"
3. **Click "Join Room"** on the dashboard
4. **Enter the 6-character room code** provided by the host
5. **Wait in the lobby** for the host to start the game

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

## 🎨 UI/UX Features

### Design Principles
- **App-like Experience**: Single page with smooth transitions
- **Intuitive Navigation**: Clear back buttons and logical flow
- **Visual Feedback**: Loading states, animations, and notifications
- **Accessibility**: High contrast, readable fonts, clear buttons
- **Mobile-First**: Responsive design that works on all devices

### Transitions
- **Slide Animations**: Smooth horizontal transitions between views
- **Loading States**: Visual feedback during async operations
- **Toast Notifications**: Non-intrusive status messages
- **Hover Effects**: Interactive elements with smooth animations

### Color Scheme
- **Primary**: Blue gradient (#667eea to #764ba2)
- **Success**: Green gradient (#4ecdc4 to #44a08d)
- **Warning**: Orange gradient (#ff6b6b to #ee5a24)
- **Accent**: Pink gradient (#f093fb to #f5576c)

## 🔧 Technical Implementation

### Frontend
- **Single Page Application**: All views in one HTML file
- **CSS Transitions**: Smooth animations between views
- **Socket.io Client**: Real-time communication
- **LocalStorage**: Player name persistence
- **Responsive Design**: CSS Grid and Flexbox

### Backend
- **Node.js + Express**: Web server
- **Socket.io**: Real-time bidirectional communication
- **Room Management**: Automatic room creation, joining, and cleanup
- **Game Logic**: Ticket generation, win validation, number picking

### View Management
- **CSS-based Transitions**: Smooth slide animations
- **State Management**: JavaScript-based view switching
- **Event Handling**: Socket.io events for real-time updates
- **Error Handling**: Graceful error messages and recovery

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
4. **Follow the app flow** to join the game

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
- **Offline Mode**: Single-player practice mode

## 📱 Browser Compatibility

- **Chrome**: Full support (recommended)
- **Firefox**: Full support
- **Safari**: Full support
- **Edge**: Full support
- **Mobile browsers**: Responsive design supported

## 📄 License

This project is open source and available under the MIT License.

---

**Enjoy playing the Tambola App! 🎲🎉**

*Experience the future of multiplayer gaming with our seamless, app-like interface!* 