/**
 * The standard Fibonacci sequence used for planning poker.
 */
const VOTE_VALUES = ['1', '2', '3', '5', '8', '13', '20', '?'];

/**
 * VotingPanel Component
 *
 * Displays the list of voting buttons (e.g., '1', '2', '3', '5', ...).
 *
 * @param {object} props - The properties passed to the component.
 * @param {string|null} props.currentUserVote - The current vote of the user, to highlight the selected button.
 * @param {function} props.onVote - The function to call when a vote button is clicked.
 * @param {boolean} props.disabled - Whether the voting buttons should be disabled (e.g., after votes are revealed).
 */
export function VotingPanel({ currentUserVote, onVote, disabled }) {
  return (
    <div className="flex flex-wrap justify-center gap-4">
      {VOTE_VALUES.map((value) => {
        // Determine if this button is the one the user has currently selected.
        const isSelected = currentUserVote === value;

        return (
          <button
            key={value}
            onClick={() => onVote(value)}
            disabled={disabled}
            className={`
              w-16 h-20 
              flex items-center justify-center 
              rounded-lg border-2
              text-2xl font-bold 
              transition-all duration-150
              ${isSelected
                ? 'bg-primary-orange border-primary-orange scale-110' // Selected state styles
                : 'bg-gray-700 border-gray-600' // Default state styles
              }
              ${disabled
                ? 'opacity-50 cursor-not-allowed' // Disabled state styles
                : 'hover:border-primary-orange hover:scale-105' // Hover styles for enabled buttons
              }
            `}
          >
            {value}
          </button>
        );
      })}
    </div>
  );
}
