"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Smartphone, Share } from "lucide-react";

export function InstallPrompt() {
  const [show, setShow] = useState(false);
  const [isIOS, setIsIOS] = useState(false);

  useEffect(() => {
    // Don't show if already dismissed permanently
    const dismissed = localStorage.getItem("epoque-install-dismissed");
    if (dismissed === "permanent") return;

    // Don't show if already in standalone (added to home screen)
    if (window.matchMedia("(display-mode: standalone)").matches) return;
    if ((navigator as any).standalone) return;

    // Only show on mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (!isMobile) return;

    const isIOSDevice = /iPhone|iPad|iPod/i.test(navigator.userAgent);
    setIsIOS(isIOSDevice);

    // Small delay so it appears after splash
    const timer = setTimeout(() => setShow(true), 2800);
    return () => clearTimeout(timer);
  }, []);

  const handleDone = () => {
    localStorage.setItem("epoque-install-dismissed", "permanent");
    setShow(false);
  };

  const handleDontWant = () => {
    localStorage.setItem("epoque-install-dismissed", "permanent");
    setShow(false);
  };

  const handleLater = () => {
    // Don't save — will show again on next visit
    setShow(false);
  };

  if (!show) return null;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[150] bg-black/60 backdrop-blur-sm flex items-end md:items-center justify-center p-4"
          onClick={handleLater}
        >
          <motion.div
            initial={{ y: 100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 100, opacity: 0 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm bg-[#0a0a1a] border border-white/10 rounded-2xl p-6 shadow-[0_0_60px_rgba(0,240,255,0.1)]"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-neon-cyan/20 to-neon-purple/20 border border-white/10 flex items-center justify-center">
                  <Smartphone className="w-5 h-5 text-neon-cyan" />
                </div>
                <div>
                  <h3 className="text-sm font-display font-bold text-white">Add to Home Screen</h3>
                  <p className="text-[10px] text-gray-500 font-display">Open instantly like an app</p>
                </div>
              </div>
              <button onClick={handleLater} className="p-1 rounded-full hover:bg-white/5">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            <div className="bg-white/[0.03] border border-white/5 rounded-xl p-4 mb-5">
              {isIOS ? (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0">1</div>
                    <p className="text-xs text-gray-300">
                      Tap the <Share className="inline w-3.5 h-3.5 text-neon-cyan" /> <span className="text-white font-medium">Share</span> button at the bottom
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0">2</div>
                    <p className="text-xs text-gray-300">
                      Scroll down & tap <span className="text-white font-medium">&quot;Add to Home Screen&quot;</span>
                    </p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0">1</div>
                    <p className="text-xs text-gray-300">
                      Tap <span className="text-white font-medium text-lg leading-none">⋮</span> (3 dots) in the top-right of Chrome
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-md bg-neon-cyan/10 flex items-center justify-center text-neon-cyan text-xs font-bold shrink-0">2</div>
                    <p className="text-xs text-gray-300">
                      Scroll down & tap <span className="text-white font-medium">&quot;Add to home screen&quot;</span>
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Buttons */}
            <div className="flex flex-col gap-2">
              <button
                onClick={handleDone}
                className="w-full py-2.5 rounded-xl bg-gradient-to-r from-neon-cyan to-neon-blue text-black font-display font-bold text-sm tracking-wide active:scale-95 transition-transform"
              >
                Done ✓
              </button>
              <div className="flex gap-2">
                <button
                  onClick={handleLater}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-display text-xs tracking-wide active:scale-95 transition-transform hover:bg-white/10"
                >
                  Later
                </button>
                <button
                  onClick={handleDontWant}
                  className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-500 font-display text-xs tracking-wide active:scale-95 transition-transform hover:bg-white/10"
                >
                  Don&apos;t show again
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
