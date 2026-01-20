/**
 * 導航頭部元件
 * 
 * 仿照 suguru 專案的 Header 樣式
 * 包含 logo 和專案名稱（漸層色）
 */
export function NavHeader() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 flex justify-between items-center px-4 sm:px-8 py-3 sm:py-4 bg-bg-primary/80 backdrop-blur-xl border-b border-white/5">
      {/* Logo 區塊 */}
      <a href="/" className="flex items-center gap-2">
        <img
          src="/logo.png"
          alt="Gooddamn"
          className="h-8 sm:h-9 w-auto"
        />
        <span className="text-lg sm:text-xl font-bold bg-gradient-to-r from-primary via-primary-light to-primary-soft bg-clip-text text-transparent">
          Gooddamn
        </span>
      </a>
    </nav>
  );
}
