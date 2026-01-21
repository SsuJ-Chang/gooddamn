import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { UserCard } from '../components/UserCard';
import { VotingPanel } from '../components/VotingPanel';
import { RoomControls } from '../components/RoomControls';
import { VoteResults } from '../components/VoteResults';

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

  // 計算已投票的人數（用於手機版 Header 顯示）
  const votedCount = users.filter((u) => u.vote !== null).length;

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

    // 計算有效投票數（排除 null 和 '?'）
    const validVoteCount = users.filter(u => u.vote && u.vote !== '?').length;

    // 如果沒有任何有效投票或只有一個人投票，則不凸顯
    const voteValues = Object.keys(voteCounts);
    if (voteValues.length === 0 || validVoteCount === 0 || validVoteCount === 1) {
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
    // 主要容器：使用 flex 垂直置中，避免不必要的 scrollbar
    <div className="flex-1 bg-bg-primary flex flex-col overflow-hidden">
      {/* 內容區域：可滾動、置中 */}
      <div className="flex-1 flex flex-col justify-center mx-auto max-w-7xl w-full p-2 sm:p-4 overflow-auto">
        <div className="flex flex-col gap-3 sm:gap-6 py-4">
          {/* 1. Header 元件 - 傳遞投票統計給手機版顯示 */}
          <Header
            roomName={room.name}
            userCount={users.length}
            votedCount={votedCount}
            expiresAt={room.expiresAt}
            onLeave={leaveRoom}
          />

          {/* 2. 使用者卡片的主要內容區域 - 響應式顯示 */}
          {/* 手機版（< 640px）隱藏，平板和桌面版顯示 */}
          {/* 所有使用者都顯示，但只對有投票的使用者應用高亮效果 */}
          <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 sm:gap-6">
            {users.map((user) => (
              <UserCard
                key={user.id}
                user={user}
                isCurrentUser={user.id === clientId}
                isHost={user.id === room.owner}
                votesVisible={room.votesVisible}
                isHighlighted={room.votesVisible && user.vote !== null && user.vote === highlightValue}
              />
            ))}
          </div>

          {/* 3. 投票結果統計（手機版專用）- 只在 votesVisible 時顯示 */}
          {room.votesVisible && (
            <VoteResults users={users} highlightValue={highlightValue} />
          )}

          {/* 4. 投票和控制的底部區域 - 響應式間距 */}
          <div className="flex flex-col items-center gap-3 sm:gap-6">
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
    </div>
  );
}
