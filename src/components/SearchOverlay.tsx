"use client";

import { useState, useMemo, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, X, MapPin, Clock } from "lucide-react";
import { DaySchedule, MergedEventItem, formatTime } from "@/lib/event-utils";
import { EventDetailModal } from "./EventDetailModal";

interface SearchOverlayProps {
  allDays: DaySchedule[];
  onClose: () => void;
}

export function SearchOverlay({ allDays, onClose }: SearchOverlayProps) {
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState<(MergedEventItem & { dateStr: string; dayName: string }) | null>(null);

  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    
    const results: (MergedEventItem & { dateStr: string; dayName: string })[] = [];
    allDays.forEach(day => {
      day.events.forEach(event => {
        if (
          event.name.toLowerCase().includes(q) ||
          event.venue.toLowerCase().includes(q) ||
          day.day.toLowerCase().includes(q)
        ) {
          results.push({ ...event, dateStr: day.date, dayName: day.day });
        }
      });
    });
    
    return results;
  }, [query, allDays]);

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/95 backdrop-blur-xl">
      <div className="absolute top-0 right-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
      
      <div className="w-full max-w-4xl mx-auto p-3 md:p-8 pt-4 md:pt-16 flex-1 flex flex-col">
        {/* Search bar */}
        <div className="flex items-center gap-2 md:gap-4 mb-4 md:mb-8">
          <div className="flex-1 relative">
            <Search className="absolute left-3 md:left-4 top-1/2 -translate-y-1/2 w-5 h-5 md:w-6 md:h-6 text-neon-cyan" />
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search events, venues..."
              className="w-full bg-white/5 border border-white/10 rounded-xl md:rounded-2xl py-3.5 md:py-5 pl-11 md:pl-14 pr-4 md:pr-6 text-base md:text-xl text-white outline-none focus:border-neon-cyan/50 focus:bg-white/10 transition-all font-display placeholder:text-gray-500 shadow-[inset_0_0_20px_rgba(0,0,0,0.5)]"
            />
          </div>
          <button 
            onClick={onClose}
            className="p-3.5 md:p-5 rounded-xl md:rounded-2xl bg-white/5 hover:bg-white/10 active:scale-95 transition-all border border-white/10 text-gray-400 hover:text-white shrink-0"
          >
            <X className="w-5 h-5 md:w-6 md:h-6" />
          </button>
        </div>

        {/* Results */}
        <div className="flex-1 overflow-y-auto -mx-3 px-3 md:mx-0 md:px-0">
          {query && searchResults.length === 0 && (
            <div className="text-center text-gray-400 mt-16 md:mt-20 font-display">
              <span className="text-neon-pink text-sm md:text-base">No results for &quot;{query}&quot;</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 pb-20">
            <AnimatePresence>
              {searchResults.map((result, i) => (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                  key={result.id}
                  onClick={() => setSelectedEvent(result)}
                  className="bg-white/5 border border-white/10 p-4 md:p-5 rounded-xl md:rounded-2xl cursor-pointer active:bg-white/15 hover:bg-white/10 hover:border-neon-purple/50 transition-all group overflow-hidden relative touch-manipulation"
                >
                  <div className="flex justify-between items-start mb-2 gap-2">
                    <h3 className="text-sm md:text-lg font-display font-bold text-white group-hover:text-neon-cyan transition-colors leading-snug">{result.name}</h3>
                    <span className="text-[10px] md:text-xs bg-neon-purple/20 text-neon-purple px-2 py-0.5 md:py-1 rounded font-medium border border-neon-purple/30 shrink-0 whitespace-nowrap">
                      {result.dayName}
                    </span>
                  </div>
                  
                  <div className="flex flex-col gap-1.5 md:gap-2 text-xs md:text-sm text-gray-400 mt-3">
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-neon-blue shrink-0" />
                      <span>{formatTime(result.start)} - {formatTime(result.end)}</span>
                      {result.originalStart && (
                        <span className="text-[10px] text-gray-500 line-through ml-1">{formatTime(result.originalStart)}</span>
                      )}
                    </div>
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-neon-pink shrink-0" />
                      <span>{result.venue}</span>
                    </div>
                    {result.delayMinutes && result.delayMinutes > 0 && (
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="text-[10px] md:text-xs text-red-400 font-display font-medium">🔴 Delayed by {result.delayMinutes}m</span>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal 
            event={selectedEvent} 
            dateStr={selectedEvent.dateStr} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </div>
  );
}
