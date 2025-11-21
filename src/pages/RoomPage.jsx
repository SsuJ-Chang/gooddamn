import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { UserCard } from '../components/UserCard';
import { VotingPanel } from '../components/VotingPanel';
import { RoomControls } from '../components/RoomControls';

/**
 * 房間頁面元件
 *
 * 這是 Planning Poker 會議進行的主要頁面。
 * 它是一個「容器」元件，從 store 中獲取所有必要的資料，
 * 然後將資料傳遞給較小的「展示型」子元件。
 * 這種模式有助於保持程式碼組織良好。
 */
export function RoomPage() {
  // 從 store 選擇此頁面及其子元件所需的所有狀態和 actions
  const room = useStore((state) => state.room);
  const clientId = useStore((state) => state.clientId);
  const leaveRoom = useStore((state) => state.leaveRoom);
  const vote = useStore((state) => state.vote);
  const showVotes = useStore((state) => state.showVotes);
  const resetVotes = useStore((state) => state.resetVotes);

  // 優雅地處理載入/空狀態是一個好習慣
  if (!room || !room.users) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading room...
      </div>
    );
  }

  // 衍生狀態：從基礎狀態計算元件所需的值
  const users = Object.values(room.users);
  const currentUser = users.find((u) => u.id === clientId);
  const isOwner = room.owner === clientId;

  // 計算哪個投票值應該被凸顯（最多票的選項）
  // 只有在有明確獲勝者時才凸顯（沒有平手）
  const calculateMostVotedValue = () => {
    if (!room.votesVisible) return null;

    // 統計每個投票值的出現次數
    const voteCounts = {};
    users.forEach((user) => {
      if (user.vote && user.vote !== '?') { // 排除 '?' 投票不計入統計
        voteCounts[user.vote] = (voteCounts[user.vote] || 0) + 1;
      }
    });

    // 如果沒有投票或只有一個人投票，則不凸顯
    const voteValues = Object.keys(voteCounts);
    if (voteValues.length === 0 || users.filter(u => u.vote && u.vote !== '?').length === 1) {
      return null;
    }

    // 找出最大票數
    const maxCount = Math.max(...Object.values(voteCounts));

    // 找出所有具有最大票數的值
    const mostVotedValues = voteValues.filter(v => voteCounts[v] === maxCount);

    // 只有在有唯一獲勝者時才凸顯（沒有平手）
    return mostVotedValues.length === 1 ? mostVotedValues[0] : null;
  };

  const highlightValue = calculateMostVotedValue();

  return (
    // 主要佈局，垂直置中
    <div className="flex h-screen items-center justify-center bg-gray-900 p-4 overflow-hidden">
      <div className="flex w-full max-w-7xl flex-col gap-6">
        {/* 1. Header 元件 */}
        <Header
          roomName={room.name}
          roomId={room.id}
          userCount={users.length}
          onLeave={leaveRoom}
        />

        {/* 2. 使用者卡片的主要內容區域 */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
          {users.map((user) => (
            <UserCard
              key={user.id}
              user={user}
              isCurrentUser={user.id === clientId}
              votesVisible={room.votesVisible}
              isHighlighted={room.votesVisible && user.vote === highlightValue}
            />
          ))}
        </div>

        {/* 3. 投票和控制的底部區域 */}
        <div className="flex flex-col items-center gap-6">
          {/* VotingPanel 投票面板 */}
          <VotingPanel
            currentUserVote={currentUser?.vote}
            onVote={vote}
            disabled={room.votesVisible}
          />

          {/* RoomControls 只在當前使用者是房主時顯示 */}
          {isOwner && (
            <RoomControls
              onShowVotes={showVotes}
              onResetVotes={resetVotes}
              votesVisible={room.votesVisible}
            />
          )}
        </div>
      </div>
    </div>
  );
}
