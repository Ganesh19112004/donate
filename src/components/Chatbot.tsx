import { useState } from "react";
import { MessageSquare, X } from "lucide-react";

const Chatbot = () => {
  const [open, setOpen] = useState(false);

  return (
    <>
      {/* 🔵 Floating Chat Button */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-[999999]
                     bg-gradient-to-r from-blue-600 to-indigo-600
                     text-white p-4 rounded-full shadow-2xl
                     hover:scale-110 transition-transform"
        >
          <MessageSquare size={24} />
        </button>
      )}

      {/* 🟢 Chat Window */}
      {open && (
        <div
          className="fixed bottom-6 right-6 z-[999999]
                     w-[380px] h-[560px]
                     bg-white rounded-2xl shadow-2xl
                     flex flex-col overflow-hidden
                     border border-gray-200"
        >
          {/* 🔷 Header */}
          <div
            className="flex items-center justify-between
                       px-4 py-3
                       bg-gradient-to-r from-blue-600 to-indigo-600
                       text-white"
          >
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center">
                🤝
              </div>
              <div>
                <p className="font-semibold leading-none">DenaSetu Assistant</p>
                <span className="text-xs opacity-80">Online • AI Support</span>
              </div>
            </div>

            <button
              onClick={() => setOpen(false)}
              className="hover:bg-white/20 p-1 rounded"
            >
              <X size={18} />
            </button>
          </div>

          {/* 🧠 Chatbot iframe */}
          <iframe
            src="https://cdn.botpress.cloud/webchat/v3.5/shareable.html?configUrl=https://files.bpcontent.cloud/2026/01/04/07/20260104074144-XBKL5RW2.json"
            title="DenaSetu Chatbot"
            className="flex-1 w-full border-none"
          />

          {/* 🔻 Footer */}
          <div className="text-xs text-center text-gray-400 py-2 bg-gray-50">
            Powered by DenaSetu AI • Do not share OTP or payment details
          </div>
        </div>
      )}
    </>
  );
};

export default Chatbot;
