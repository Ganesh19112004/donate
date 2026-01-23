import { useState } from "react";
import { MessageSquare, X, Minus } from "lucide-react";

const Chatbot = () => {
  const [open, setOpen] = useState(false);
  const [minimized, setMinimized] = useState(false);

  return (
    <>
      {/* 🔵 Floating Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[999999]
          bg-gradient-to-r from-blue-600 to-indigo-600
          text-white p-4 rounded-full shadow-2xl
          hover:scale-110 active:scale-95 transition-all
          animate-pulse"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* 🟢 Chat Window */}
      {open && (
        <div
          className={`fixed bottom-6 right-6 z-[999999]
          w-[380px] max-w-[95vw]
          h-[560px] max-h-[85vh]
          bg-white/90 backdrop-blur-xl
          rounded-2xl shadow-2xl
          flex flex-col overflow-hidden
          border border-gray-200
          transition-all duration-300
          ${minimized ? "h-[70px]" : ""}`}
        >
          {/* 🔷 Header */}
          <div className="flex items-center justify-between px-4 py-3
            bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
            
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
                  🤝
                </div>
                <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-white" />
              </div>
              <div>
                <p className="font-semibold leading-none">
                  DenaSetu Assistant
                </p>
                <span className="text-xs opacity-80">
                  Online • AI Support
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setMinimized(!minimized)}
                className="hover:bg-white/20 p-1 rounded"
              >
                <Minus size={16} />
              </button>

              <button
                onClick={() => {
                  setOpen(false);
                  setMinimized(false);
                }}
                className="hover:bg-white/20 p-1 rounded"
              >
                <X size={18} />
              </button>
            </div>
          </div>

          {/* 🧠 Chatbot */}
          {!minimized && (
            <>
              <iframe
                src="https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2026/01/04/07/20260104074144-XBKL5RW2.json"
                title="DenaSetu Chatbot"
                className="flex-1 w-full border-none"
              />

              {/* 🔻 Footer */}
              <div className="text-xs text-center text-gray-400 py-2 bg-gray-50">
                Powered by DenaSetu AI • Never share OTP or card details
              </div>
            </>
          )}
        </div>
      )}

      {/* ❌ Hide Botpress Share Button */}
      <style jsx global>{`
        iframe {
          border-radius: 0 0 1rem 1rem;
        }
        .bpw-share-button,
        .bpw-powered,
        .bpw-header-actions button {
          display: none !important;
        }
      `}</style>
    </>
  );
};

export default Chatbot;
