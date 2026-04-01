"use client";

import { motion } from "framer-motion";

interface VenueSelectorProps {
  venues: string[];
  selected: string;
  onSelect: (venue: string) => void;
}

export function VenueSelector({ venues, selected, onSelect }: VenueSelectorProps) {
  return (
    <div className="w-full">
      <div className="flex items-center flex-wrap justify-center gap-2 md:gap-3 px-1 md:px-0">
        {venues.map((venue) => {
          const isActive = selected === venue;
          return (
            <button
              key={venue}
              onClick={() => onSelect(venue)}
              className={`relative px-4 md:px-5 py-2.5 md:py-3 rounded-full text-sm md:text-base font-medium transition-colors whitespace-nowrap active:scale-95
                ${isActive ? 'text-white' : 'text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20'}`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeVenue"
                  className="absolute inset-0 bg-neon-purple/20 border border-neon-purple shadow-[0_0_15px_rgba(138,43,226,0.4)] rounded-full"
                  transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                />
              )}
              <span className="relative z-10 font-display tracking-wide">{venue}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
