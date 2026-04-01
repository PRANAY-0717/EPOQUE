"use client";

import { motion } from "framer-motion";

interface DaySelectorProps {
  days: { day: string; date: string }[];
  selectedIdx: number;
  onSelect: (idx: number) => void;
}

export function DaySelector({ days, selectedIdx, onSelect }: DaySelectorProps) {
  return (
    <div className="flex p-1.5 md:p-2 bg-black/40 backdrop-blur-xl border border-white/10 rounded-xl md:rounded-2xl w-full max-w-lg mx-auto shadow-2xl relative z-20">
      {days.map((d, i) => {
        const isActive = i === selectedIdx;
        return (
          <button
            key={i}
            onClick={() => onSelect(i)}
            className="flex-1 relative py-3 md:py-4 px-1 md:px-2 rounded-lg md:rounded-xl transition-all duration-300 active:scale-95"
          >
            {isActive && (
              <motion.div
                layoutId="activeDay"
                className="absolute inset-0 bg-gradient-to-r from-neon-blue/20 to-neon-purple/20 border border-neon-cyan/50 shadow-[0_0_15px_rgba(0,240,255,0.3)] rounded-lg md:rounded-xl"
                transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
              />
            )}
            <div className="relative z-10 flex flex-col items-center gap-0.5 md:gap-1">
              <span className={`text-sm md:text-lg font-display font-semibold tracking-wide ${isActive ? 'text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'text-gray-400'}`}>
                {d.day}
              </span>
              <span className={`text-[11px] md:text-sm font-medium ${isActive ? 'text-neon-cyan' : 'text-gray-500'}`}>
                {new Date(d.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
            </div>
          </button>
        );
      })}
    </div>
  );
}
