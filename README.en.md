# Gooddamn - Scrum Planning Poker

**English** | [繁體中文](./README.md)

---

A real-time, clean, and beautiful tool for easy agile estimation.

![Planning Poker](https://img.shields.io/badge/Planning-Poker-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-green)

## ✨ Features

### Core Functionality
- 🎯 **Real-time Voting** - Instant synchronization of all voting statuses.
- 🔗 **Direct URL Sharing** - Join rooms directly via URL; no more manual searching.
- 📱 **QR Code Access** - Built-in QR Code generator for quick mobile joins.
- 🎨 **Custom Room Names** - Smart auto-numbering for duplicate names (Room - 2, Room - 3...).
- 🧹 **Auto Cleanup** - Expired or empty rooms are automatically detected and deleted.

### Host Controls
- 👁️ **Reveal Votes** - The host controls when to show the results to ensure a fair process.
- 🔄 **New Round** - Reset everyone's vote with one click to start the next task.
- 🛡️ **Member Management** - Remove intruders or inactive users with a simple click.
- 🚫 **Smart Banning** - Kicked users are temporarily restricted from re-entering the room.

### UI/UX Enhancements
- ⏳ **Seamless Loading** - Global loading indicators for smooth state transitions.
- 🌟 **Golden Consensus** - Automatically highlights the most voted value after reveal.
- 🌑 **Sleek Dark Mode** - Professional and eye-friendly visual design.
- 📱 **Fully Responsive** - Consistent experience across mobile, tablet, and desktop.

## 🛠️ Tech Stack

### Frontend
- **React 18** + **React Router** - Modern navigation and UI framework
- **Zustand** - High-performance state management
- **Tailwind CSS 4.0** - Optimized dark-theme styles
- **Socket.IO Client** - Real-time communication

### Backend
- **Node.js** + **Express** - Lightweight backend engine
- **Socket.IO** - Bidirectional WebSocket communication
- **UUID** - Secure unique identifier generation

## 📖 Usage Guide

### 1. Create a Room
Enter your name and a room name on the home page, then click "Create Room".

### 2. Invite Members
Share your room in two ways:
*   **Copy Link**: Click the "Link icon" in the navigation bar.
*   **QR Code**: Click the "QR Code icon" to show a scannable code.

### 3. Hosting a Session
*   Members join and cast their votes.
*   Click **Reveal Votes** to show the consensus.
*   Click **New Round** to clear votes for the next item.
*   If needed, click the **X** on any user card to remove them.

## 🎯 Project Structure

```
gooddamn/
├── src/                    # Frontend source code
│   ├── components/         # Reusable components (Header, Toast, Modals)
│   ├── pages/             # Route pages and guard logic
│   └── store/             # State logic and Socket event hub
├── server/                # Backend Node.js code
└── public/                # Static assets
```

## 👨‍💻 Author

RJ Chang

---

⭐ If this project helps you, feel free to give it a Star!
