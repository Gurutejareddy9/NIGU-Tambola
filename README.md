# Tambola Multiplayer Game

A real-time multiplayer Tambola (Housie) game built with Node.js, Socket.IO, and vanilla JavaScript.

## 🎯 Features

- **Real-time Multiplayer**: Play with friends over LAN
- **Room-based System**: Create/join rooms with 6-character codes
- **Automatic Number Picking**: Computer picks numbers every 5 seconds
- **Audio Announcements**: Numbers are announced when picked
- **Manual Ticket Marking**: Click numbers on your ticket to mark them
- **Win Pattern Claims**: Claim Early Five, Top Line, Middle Line, Bottom Line, Four Corners, Full House
- **Number History**: View recently called numbers
- **Responsive Design**: Works on desktop and mobile

## 🚀 Quick Start

1. **Install Dependencies**:
   ```bash
   npm install
   ```

2. **Start the Server**:
   ```bash
   node server-rooms.js
   ```

3. **Access the Game**:
   - **Local**: http://localhost:3002
   - **Network**: http://[your-ip]:3002

## 🎮 How to Play

1. **Enter your name** and continue
2. **Create a room** or **join an existing room**
3. **Wait for players** to join (minimum 2 players)
4. **Start the game** (host only)
5. **Watch numbers being called** automatically
6. **Click numbers on your ticket** when you see them called
7. **Claim wins** when you complete patterns

## 📁 Project Structure

```
NIGU/
├── app.html              # Main Single Page Application
├── server-rooms.js       # Main server with room management
├── gameLogic.js          # Ticket generation and win checking
├── roomManager.js        # Room and player management
├── package.json          # Dependencies
└── README.md            # This file
```

## 🛠️ Technology Stack

- **Backend**: Node.js, Express.js, Socket.IO
- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Real-time**: Socket.IO for live updates
- **Audio**: Web Speech API for number announcements

## 🎲 Game Rules

- **Ticket**: 3 rows × 9 columns with 15 numbers
- **Number Picking**: 1-90 numbers picked randomly
- **Win Patterns**:
  - Early Five: First 5 matched numbers
  - Top/Middle/Bottom Line: Complete row
  - Four Corners: All corner numbers
  - Full House: All 15 numbers

## 🌐 Network Play

The server runs on `0.0.0.0:3002`, so other devices on your LAN can join using your computer's IP address.

## 📝 License

This project is open source and available under the MIT License.