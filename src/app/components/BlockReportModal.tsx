import { useState } from "react";
import { X, Ban, Flag, Check } from "lucide-react";

interface BlockReportModalProps {
  type: 'block' | 'report';
  userName: string;
  onConfirm: (reason?: string) => void;
  onClose: () => void;
}

const REPORT_REASONS = [
  "Spam or unsolicited messages",
  "Inappropriate media or content",
  "Harassment or cyberbullying",
  "Fake identity or impersonation",
  "Other security concern",
];

export function BlockReportModal({ type, userName, onConfirm, onClose }: BlockReportModalProps) {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [submitted, setSubmitted] = useState(false);

  const handleAction = () => {
    setSubmitted(true);
    if (type === 'report') {
      try {
        const saved = localStorage.getItem("anonote_admin_reports");
        const list = saved ? JSON.parse(saved) : [];
        list.unshift({
          id: `rep_${Date.now()}`,
          targetUser: userName,
          reason: selectedReason,
          timestamp: new Date().toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }),
          status: "pending",
        });
        localStorage.setItem("anonote_admin_reports", JSON.stringify(list));
      } catch (e) {
        console.error("Failed to save report to admin queue", e);
      }
    }
    setTimeout(() => {
      onConfirm(type === 'report' ? selectedReason : undefined);
      onClose();
    }, 1200);
  };

  if (submitted) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
        <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-sm p-6 text-center space-y-3 shadow-2xl">
          <div className="w-12 h-12 bg-green-500/20 text-green-400 rounded-full flex items-center justify-center mx-auto">
            <Check className="w-6 h-6" />
          </div>
          <h3 className="text-white font-semibold text-lg">
            {type === 'block' ? `Blocked ${userName}` : `Reported ${userName}`}
          </h3>
          <p className="text-xs text-gray-400">
            {type === 'block'
              ? "This user has been blocked and can no longer contact you."
              : "Thank you. Our security team will review this report."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 p-4 backdrop-blur-xs">
      <div className="bg-[#1c1c1e] border border-gray-800 rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        <div className="px-6 py-4 border-b border-gray-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            {type === 'block' ? (
              <Ban className="w-5 h-5 text-red-400" />
            ) : (
              <Flag className="w-5 h-5 text-red-400" />
            )}
            <h3 className="text-white font-semibold text-lg">
              {type === 'block' ? `Block ${userName}?` : `Report ${userName}`}
            </h3>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {type === 'block' ? (
            <p className="text-sm text-gray-300 leading-relaxed">
              Blocked contacts will no longer be able to send you messages or call you. They will not be notified that you blocked them.
            </p>
          ) : (
            <div>
              <p className="text-sm text-gray-300 mb-3">
                Please select a reason for reporting this anonymous user:
              </p>
              <div className="space-y-2">
                {REPORT_REASONS.map((reason) => (
                  <div
                    key={reason}
                    onClick={() => setSelectedReason(reason)}
                    className={`p-3 rounded-xl border cursor-pointer text-sm transition-colors ${
                      selectedReason === reason
                        ? "bg-red-500/15 border-red-500 text-white font-medium"
                        : "bg-[#2c2c2e]/40 border-gray-800 hover:bg-[#2c2c2e] text-gray-300"
                    }`}
                  >
                    {reason}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-[#111111] border-t border-gray-800 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleAction}
            className="px-5 py-2 rounded-lg text-sm font-medium text-white bg-red-600 hover:bg-red-700 transition-colors"
          >
            {type === 'block' ? "Block Contact" : "Submit Report"}
          </button>
        </div>
      </div>
    </div>
  );
}
