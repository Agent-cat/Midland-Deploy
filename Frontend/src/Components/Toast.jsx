import React, { useEffect } from "react";
import { X } from "lucide-react";

const Toast = ({ message, type = "error", onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed top-4 right-4 z-50 animate-slide-in">
      <div className="flex items-center gap-3 bg-red-400 px-6 py-4 shadow-2xl rounded-xl text-white">
        <div className="flex-1">
          <p className="font-medium tracking-wide">{message}</p>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 rounded-full transition-all duration-200 hover:scale-110 hover:bg-red-500"
        >
          <X size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
};

export default Toast;
