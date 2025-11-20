import { FiUsers, FiLogOut } from 'react-icons/fi';

/**
 * Header Component
 *
 * This component displays the top-level information about the room, such as the
 * room name, ID, and number of participants. It also provides the "Leave" button.
 * It's a "presentational" component; it just displays data passed to it via props.
 *
 * @param {object} props - The properties passed to the component.
 * @param {string} props.roomName - The name of the room (not currently used by backend, but good for UI).
 * @param {string} props.roomId - The unique ID of the room.
 * @param {number} props.userCount - The number of users currently in the room.
 * @param {function} props.onLeave - The function to call when the "Leave" button is clicked.
 */
export function Header({ roomName, userCount, onLeave }) {

  return (
    <header className="flex flex-wrap items-center justify-between gap-4 rounded-lg bg-gray-800 p-4 shadow-md">
      {/* Left Section: Room Name and ID */}
      <div className="flex flex-col">
        <h1 className="text-2xl font-bold text-white">
          {roomName || 'Planning Poker'}
        </h1>

      </div>

      {/* Right Section: User Count and Leave Button */}
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2 text-lg">
          <FiUsers className="text-gray-400" />
          <span className="font-semibold text-white">{userCount}</span>
        </div>
        <button
          onClick={onLeave}
          className="flex items-center gap-2 rounded-md bg-red-600 px-4 py-2 font-bold text-white transition-colors hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800"
        >
          <FiLogOut />
          <span>Leave</span>
        </button>
      </div>
    </header>
  );
}
