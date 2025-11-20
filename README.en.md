# Gooddamn - Scrum Planning Poker

**English** | [繁體中文](./README.md)

---

A real-time, clean, and beautiful Scrum Planning Poker application that makes remote agile estimation easy for teams.

![Planning Poker](https://img.shields.io/badge/Planning-Poker-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-green)

## ✨ Features

### Core Functionality
- 🎯 **Real-time Voting System** - All votes synchronized instantly
- 👥 **Multi-user Collaboration** - Support multiple rooms running simultaneously
- 🎨 **Custom Room Names** - Auto-numbering for duplicate names (Room - 2, Room - 3...)
- 🔄 **Quick Reset** - Start new estimation rounds with one click

### UI/UX Enhancements
- 🌟 **Golden Highlight** - Auto-highlight most voted option on Reveal (no highlight on ties)
- 💫 **Shake Animation** - Highlighted cards feature gentle shake effect
- 🎴 **Optimized Card Design** - Clear display of names and voting information
- 📱 **Responsive Layout** - Perfect support for all screen sizes
- 🌑 **Dark Theme** - Eye-friendly and professional visual design

### Smart Features
- 🏠 **Room List** - Real-time display of all available rooms
- 🧹 **Auto Cleanup** - Empty rooms automatically deleted to keep system clean
- 🎲 **Fibonacci Sequence** - Standard agile estimation options (1, 2, 3, 5, 8, 13, 20, ?)

## 🛠️ Tech Stack

### Frontend
- **React 18** - Modern UI framework
- **Zustand** - Lightweight state management
- **Tailwind CSS 4.0** - CSS-first configuration for rapid styling
- **Socket.IO Client** - Real-time bidirectional communication
- **Vite** - Lightning-fast development experience

### Backend
- **Node.js** - JavaScript runtime environment
- **Express** - Minimalist web framework
- **Socket.IO** - WebSocket real-time communication
- **UUID** - Unique room ID generation

## 📖 Usage Guide

1. **Enter Name** - Input your name on first visit
2. **Enter Lobby** - View available rooms or create a new one
3. **Start Estimation** - Select your points and wait for other members
4. **Reveal** - Room owner can show/hide all votes
5. **Reset** - Start next round after completion

## 🎯 Project Structure

```
gooddamn/
├── src/                    # Frontend source code
│   ├── components/         # React components
│   ├── pages/             # Page components
│   ├── store/             # Zustand state management
│   └── lib/               # Utils and configuration
├── server/                # Backend source code
│   └── index.js           # Express + Socket.IO server
└── public/                # Static assets
```

## 🎨 Feature Showcase

### Golden Highlight for Most Votes
When votes are revealed, the option with the most votes is automatically highlighted with a golden gradient, helping teams reach consensus quickly.

**Highlight Rules:**
- ✅ Clear majority: Highlighted in gold with shake
- ⚠️ Tied votes: No highlight (avoid misleading)
- 📊 All same: No highlight
- 👤 Single vote: No highlight

### Smart Room Name Numbering
Duplicate room names are automatically numbered, making it easy for teams to create multiple rooms for similar purposes:
- `Daily Standup` → `Daily Standup - 2` → `Daily Standup - 3`

## 👨‍💻 Author

RJ Chang

---

⭐ If this project helps you, feel free to give it a Star!
