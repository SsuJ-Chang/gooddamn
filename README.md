# Gooddamn - Scrum Planning Poker

[English](./README.en.md) | **繁體中文**

---

一個即時、簡潔且美觀的 Scrum Planning Poker 應用程式，讓遠端團隊能輕鬆進行敏捷估點。

![Planning Poker](https://img.shields.io/badge/Planning-Poker-orange)
![React](https://img.shields.io/badge/React-18-blue)
![Socket.IO](https://img.shields.io/badge/Socket.IO-4-green)

## ✨ 功能特色

### 核心功能
- 🎯 **即時投票系統** - 所有投票狀態即時同步
- 👥 **多人協作** - 支援多個房間同時運行
- 🎨 **自訂房間名稱** - 重複名稱自動編號（Room - 2, Room - 3...）
- 🔄 **快速重置** - 一鍵開始新回合估點

### UI/UX 優化
- 🌟 **金色凸顯** - Reveal 時自動標記最多票的選項（平手不凸顯）
- 💫 **微震動動畫** - 凸顯卡片帶有柔和的震動效果
- 🎴 **優化卡片設計** - 清晰的名稱與投票資訊呈現
- 📱 **響應式佈局** - 完美支援各種螢幕尺寸
- 🌑 **深色主題** - 護眼且專業的視覺設計

### 智能功能
- 🏠 **房間列表** - 即時顯示所有可用房間
- 🧹 **自動清理** - 空房間自動刪除，保持系統整潔
- 🎲 **Fibonacci 數列** - 標準的敏捷估點選項（1, 2, 3, 5, 8, 13, 20, ?）

## 🛠️ 技術棧

### 前端
- **React 18** - 現代化的 UI 框架
- **Zustand** - 輕量級狀態管理
- **Tailwind CSS 4.0** - CSS-first 配置，快速樣式開發
- **Socket.IO Client** - 即時雙向通訊
- **Vite** - 極速開發體驗

### 後端
- **Node.js** - JavaScript 運行環境
- **Express** - 簡潔的 Web 框架
- **Socket.IO** - WebSocket 即時通訊
- **UUID** - 唯一房間 ID 生成

## 📖 使用說明

1. **輸入名字** - 首次進入時輸入您的名字
2. **進入大廳** - 查看可用房間或創建新房間
3. **開始估點** - 選擇您的點數並等待其他成員
4. **Reveal** - 房主可以顯示/隱藏所有投票
5. **重新開始** - 完成後可重置投票進行下一輪

## 🎯 專案結構

```
gooddamn/
├── src/                    # 前端原始碼
│   ├── components/         # React 元件
│   ├── pages/             # 頁面元件
│   ├── store/             # Zustand 狀態管理
│   └── lib/               # 工具與配置
├── server/                # 後端原始碼
│   └── index.js           # Express + Socket.IO 伺服器
└── public/                # 靜態資源
```

## 🎨 特色功能展示

### 金色凸顯最多票
當 Reveal 投票結果時，得票最多的選項會自動以金色漸層凸顯，幫助團隊快速達成共識。

**凸顯規則：**
- ✅ 明確多數：凸顯金色並震動
- ⚠️ 票數平手：不凸顯（避免誤導）
- 📊 全部相同：不凸顯
- 👤 單一投票：不凸顯

### 房間名稱智能編號
重複的房間名稱會自動加上編號，讓團隊能輕鬆創建多個相似用途的房間：
- `Daily Standup` → `Daily Standup - 2` → `Daily Standup - 3`

## 👨‍💻 作者

RJ Chang

---

⭐ 如果這個專案對您有幫助，歡迎給個 Star！
