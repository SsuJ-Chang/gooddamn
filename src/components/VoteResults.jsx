/**
 * 投票結果元件(手機版專用)
 *
 * 當投票被 Reveal 時,在手機版顯示投票統計結果
 * 取代被隱藏的 User Cards,確保用戶能看到投票結果
 *
 * @param {object} props - 傳遞給元件的屬性
 * @param {Array} props.users - 所有使用者的陣列
 * @param {string|null} props.highlightValue - 需要高亮顯示的投票值(獲得最多票的)
 */
export function VoteResults({ users, highlightValue }) {
  // 統計每個投票值的出現次數(排除未投票和 '?')
  const voteCounts = {};
  let totalVotes = 0;

  users.forEach((user) => {
    // 只計算有效投票:不為 null 且不為 '?'
    if (user.vote && user.vote !== '?') {
      voteCounts[user.vote] = (voteCounts[user.vote] || 0) + 1;
      totalVotes++;
    }
  });

  // 轉換為陣列並按票數排序(由多到少)
  const sortedVotes = Object.entries(voteCounts)
    .map(([value, count]) => ({
      value,
      count,
      percentage: (count / totalVotes) * 100,
    }))
    .sort((a, b) => b.count - a.count);

  // 找到最大票數,用於計算柱狀圖寬度
  const maxCount = sortedVotes.length > 0 ? sortedVotes[0].count : 1;

  return (
    <div className="sm:hidden bg-bg-secondary rounded-lg p-4 border border-bg-tertiary">
      {/* 投票統計列表 */}
      <div className="flex flex-col gap-3">
        {sortedVotes.map(({ value, count, percentage }) => {
          // 檢查是否為高亮值
          const isHighlighted = value === highlightValue;
          // 計算柱狀圖寬度百分比
          const barWidth = (count / maxCount) * 100;

          return (
            <div
              key={value}
              className={`rounded-lg p-3 ${isHighlighted
                ? 'bg-gradient-to-r from-yellow-400/20 to-amber-500/20 border border-yellow-400'
                : 'bg-bg-tertiary/50'
                }`}
            >
              {/* 頂部:投票值和統計 */}
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2">
                  <span
                    className={`text-2xl font-bold ${isHighlighted ? 'text-yellow-300' : 'text-primary'
                      }`}
                  >
                    {value}
                  </span>
                  {/* 高亮標記 */}
                  {isHighlighted && (
                    <span className="text-yellow-300 text-sm">👑</span>
                  )}
                </div>

                {/* 人數和百分比 */}
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-text-secondary">
                    {count}人
                  </span>
                  <span className="text-xs text-text-muted">
                    ({percentage.toFixed(0)}%)
                  </span>
                </div>
              </div>

              {/* 柱狀圖 */}
              <div className="h-2 bg-bg-tertiary rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${isHighlighted
                    ? 'bg-gradient-to-r from-yellow-400 to-amber-500'
                    : 'bg-primary'
                    }`}
                  style={{ width: `${barWidth}%` }}
                ></div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

