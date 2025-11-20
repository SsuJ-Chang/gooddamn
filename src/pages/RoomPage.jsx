import { useStore } from '../store/useStore';
import { Header } from '../components/Header';
import { UserCard } from '../components/UserCard';
import { VotingPanel } from '../components/VotingPanel';
import { RoomControls } from '../components/RoomControls';

/**
 * RoomPage Component
 *
 * This is the main page where the planning poker session happens.
 * It's a "container" component that fetches all the necessary data from the store
 * and then passes that data down to smaller, "presentational" child components.
 * This pattern is great for keeping your code organized.
 */
export function RoomPage() {
  // Select all the state and actions needed for this page and its children from the store.
  const room = useStore((state) => state.room);
  const clientId = useStore((state) => state.clientId);
  const leaveRoom = useStore((state) => state.leaveRoom);
  const vote = useStore((state) => state.vote);
  const showVotes = useStore((state) => state.showVotes);
  const resetVotes = useStore((state) => state.resetVotes);

  // It's good practice to handle loading/empty states gracefully.
  if (!room || !room.users) {
    return (
      <div className="flex h-screen items-center justify-center text-xl">
        Loading room...
      </div>
    );
  }

  // Derived state: calculate values needed by the components from the base state.
  const users = Object.values(room.users);
  const currentUser = users.find((u) => u.id === clientId);
  const isOwner = room.owner === clientId;

  // Calculate which vote value should be highlighted (most common vote)
  // Only highlight if there's a clear winner (no tie)
  const calculateMostVotedValue = () => {
    if (!room.votesVisible) return null;

    // Count occurrences of each vote value
    const voteCounts = {};
    users.forEach((user) => {
      if (user.vote && user.vote !== '?') { // Exclude '?' votes from counting
        voteCounts[user.vote] = (voteCounts[user.vote] || 0) + 1;
      }
    });

    // If no votes or only one person voted, don't highlight
    const voteValues = Object.keys(voteCounts);
    if (voteValues.length === 0 || users.filter(u => u.vote && u.vote !== '?').length === 1) {
      return null;
    }

    // Find the maximum vote count
    const maxCount = Math.max(...Object.values(voteCounts));

    // Find all values with the maximum count
    const mostVotedValues = voteValues.filter(v => voteCounts[v] === maxCount);

    // Only highlight if there's exactly one winner (no tie)
    return mostVotedValues.length === 1 ? mostVotedValues[0] : null;
  };

  const highlightValue = calculateMostVotedValue();

  return (
    // The main layout with vertical centering
    <div className="flex h-screen items-center justify-center bg-gray-900 p-4 overflow-hidden">
      <div className="flex w-full max-w-7xl flex-col gap-6">
        {/* 1. Header Component */}
        <Header
          roomName={room.name}
          roomId={room.id}
          userCount={users.length}
          onLeave={leaveRoom}
        />

        {/* 2. Main content area for the user cards */}
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

        {/* 3. Footer area for voting and controls */}
        <div className="flex flex-col items-center gap-6">
          {/* The VotingPanel is only shown if the user is not the owner or if votes are not visible */}
          <VotingPanel
            currentUserVote={currentUser?.vote}
            onVote={vote}
            disabled={room.votesVisible}
          />

          {/* The RoomControls are only shown if the current user is the room owner */}
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
