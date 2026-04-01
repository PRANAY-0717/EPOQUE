"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { X, Loader2 } from "lucide-react";

interface QRModalProps {
  onClose: () => void;
}

export function QRModal({ onClose }: QRModalProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/70 backdrop-blur-lg"
      />

      {/* Modal — fullscreen on mobile, centered card on desktop */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full h-[92dvh] md:h-[85vh] md:max-w-2xl bg-[#0a0a19] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_0_60px_rgba(0,0,0,0.9)] flex flex-col"
      >
        {/* Top accent bar */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-cyan to-neon-blue z-10" />

        {/* Drag handle (mobile) */}
        <div className="flex justify-center pt-2 pb-0 md:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 md:px-5 py-2.5 md:py-3 border-b border-white/10 bg-black/40 backdrop-blur-sm shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-neon-cyan animate-pulse" />
            <span className="text-xs md:text-sm font-display font-medium text-white/80 tracking-wide">
              Epoque Dashboard
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/5 hover:bg-white/10 active:scale-95 text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Iframe container */}
        <div className="flex-1 relative">
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-[#0a0a19] z-10">
              <div className="flex flex-col items-center gap-3">
                <Loader2 className="w-7 h-7 md:w-8 md:h-8 text-neon-cyan animate-spin" />
                <span className="text-xs md:text-sm text-gray-400 font-display">Loading Dashboard...</span>
              </div>
            </div>
          )}
          <iframe
            src="https://epoque.kiet.edu/dashboard"
            className="w-full h-full border-0"
            onLoad={() => setIsLoading(false)}
            allow="camera; microphone"
            style={{ background: "#fff", borderRadius: "0 0 1.5rem 1.5rem" }}
          />
        </div>
      </motion.div>
    </div>
  );
}
