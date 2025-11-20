import { FiCheck, FiHelpCircle } from 'react-icons/fi';

/**
 * UserCard Component
 *
 * This component displays a single user's card in the room. It shows their name
 * and their voting status (not voted, voted, or their vote value).
 *
 * @param {object} props - The properties passed to the component.
 * @param {object} props.user - The user object, contains name and vote.
 * @param {boolean} props.isCurrentUser - True if this card represents the person viewing the app.
 * @param {boolean} props.votesVisible - True if the votes have been revealed by the room owner.
 * @param {boolean} props.isHighlighted - True if this card has the most voted value.
 */
export function UserCard({ user, isCurrentUser, votesVisible, isHighlighted = false }) {
  // A derived boolean to easily check if the user has submitted a vote.
  const hasVoted = user.vote !== null;

  return (
    // The main container for the card.
    // `relative` is crucial for positioning the user's name absolutely inside it.
    // `h-40` sets a fixed height. `rounded-lg` gives it nice rounded corners.
    // `bg-primary-orange` sets the background color from our theme.
    // `overflow-hidden` is a good practice to ensure nothing spills out of the rounded corners.
    <div className={`relative h-40 rounded-lg text-white shadow-lg overflow-hidden border-2 ${isHighlighted
        ? 'bg-gradient-to-br from-yellow-400 to-amber-500 border-yellow-300 ring-4 ring-yellow-400 animate-[gentle-shake_0.5s_ease-in-out_infinite]'
        : 'bg-primary-orange border-white'
      }`}>
      {/*
       * Vote Display Container
       * Positioned at 1/3 of the card height (instead of center)
       * text-7xl is ~1.5x larger than text-5xl (72px vs 48px)
      */}
      <div className="flex h-full w-full items-start justify-center pt-7">
        {!votesVisible ? (
          // --- Content to show BEFORE votes are revealed ---
          hasVoted ? (
            // If the user has voted, show a green checkmark.
            <FiCheck className="text-7xl text-green-300 drop-shadow-lg" />
          ) : (
            // If the user has not voted, show a gray question mark.
            <FiHelpCircle className="text-7xl text-gray-200 drop-shadow-lg" />
          )
        ) : (
          // --- Content to show AFTER votes are revealed ---
          // Display the user's vote value.
          <span className="text-7xl font-bold" style={{ textShadow: '4px 4px 4px rgba(0,0,0,0.5)' }}>{user.vote || '-'}</span>
        )}
      </div>

      {/*
       * User Name Display
       * This div is positioned at the bottom of the card.
       * `absolute`: Takes the element out of the normal layout flow.
       * `bottom-2`: Positions it 0.5rem (8px) from the bottom of the `relative` parent.
       * `left-1/2 -translate-x-1/2`: This is the standard trick for perfect horizontal centering.
       *   It moves the element's left edge to the center, then shifts it left by half of its own width.
       * `w-full text-center`: Ensures the text inside is centered if it wraps.
       * `isCurrentUser ? 'font-bold' : ''`: We make the current user's name bold to help them find their own card.
      */}
      <div
        className={`absolute bottom-5 left-1/2 w-full -translate-x-1/2 px-2 text-center text-xl font-bold truncate ${isCurrentUser ? 'underline' : ''
          }`}
        style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.5)' }}
      >
        {user.name}
      </div>
    </div>
  );
}
