import { QRCodeSVG } from 'qrcode.react';

/**
 * QR Code 彈窗組件
 * 
 * 顯示房間 URL 的 QR Code，方便手機掃描加入
 */
export function QRCodeModal({ isOpen, onClose, roomUrl }) {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50"
      onClick={onClose}
    >
      <div
        className="rounded-lg bg-bg-secondary p-8 shadow-2xl border border-bg-tertiary max-w-md"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-col items-center gap-6">


          {/* QR Code */}
          <div className="bg-white p-4 rounded-lg">
            <QRCodeSVG
              value={roomUrl}
              size={256}
              level="M"
              includeMargin={true}
            />
          </div>



          {/* 關閉按鈕 */}
          <button
            onClick={onClose}
            className="w-full rounded-md bg-bg-tertiary px-4 py-2 text-lg font-bold text-text-primary hover:bg-bg-card-hover transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
