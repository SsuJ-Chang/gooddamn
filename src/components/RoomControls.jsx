import { FiEye, FiRefreshCw } from 'react-icons/fi';

/**
 * RoomControls Component
 *
 * Displays the administrative controls for the room owner, specifically
 * the "Reveal Votes" and "New Round" buttons.
 *
 * @param {object} props - The properties passed to the component.
 * @param {function} props.onShowVotes - Function to call to reveal the votes.
 * @param {function} props.onResetVotes - Function to call to start a new voting round.
 * @param {boolean} props.votesVisible - Whether votes are currently visible, to disable the reveal button.
 */
export function RoomControls({ onShowVotes, onResetVotes, votesVisible }) {
  return (
    <div className="flex items-center justify-center gap-4 rounded-lg bg-gray-800 p-4 shadow-md">
      <button
        onClick={onShowVotes}
        disabled={votesVisible}
        className="flex items-center gap-2 rounded-md bg-indigo-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:scale-100"
      >
        <FiEye />
        <span>Reveal</span>
      </button>

      <button
        onClick={onResetVotes}
        className="flex items-center gap-2 rounded-md bg-gray-600 px-6 py-3 font-bold text-white shadow-lg transition-transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 focus:ring-offset-gray-800"
      >
        <FiRefreshCw />
        <span>New Round</span>
      </button>
    </div>
  );
}
