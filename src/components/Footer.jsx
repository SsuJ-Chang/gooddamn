/**
 * 頁尾元件
 * 
 * 仿照 suguru 專案的 Footer 樣式
 * 包含版權聲明，年份自動更新
 */
export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="py-4 sm:py-6 bg-bg-secondary border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-8 text-center">
        {/* 版權聲明 */}
        <p className="text-sm text-text-muted">
          © {currentYear} RJ. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
