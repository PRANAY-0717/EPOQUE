"use client";

import { motion } from "framer-motion";
import { EventItem, formatTime, getDurationMinutes } from "@/lib/event-utils";
import { X, MapPin, Clock, Calendar } from "lucide-react";
import { useEffect } from "react";

interface EventDetailModalProps {
  event: EventItem;
  dateStr: string;
  onClose: () => void;
}

export function EventDetailModal({ event, dateStr, onClose }: EventDetailModalProps) {
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, []);

  const duration = getDurationMinutes(event.start, event.end);
  const formattedDate = new Date(dateStr).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/60 backdrop-blur-md"
      />
      
      {/* Modal — slides up from bottom on mobile, centered on desktop */}
      <motion.div 
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full md:max-w-lg bg-[#0a0a19] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[85dvh] overflow-y-auto"
      >
        {/* Drag handle for mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>
        
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-purple/20 rounded-full blur-[60px] pointer-events-none" />
        
        <div className="p-5 md:p-8">
          <button 
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>
          
          <div className="inline-block px-3 py-1 mb-3 md:mb-4 rounded-full bg-neon-cyan/10 border border-neon-cyan/20 text-neon-cyan text-[10px] md:text-xs font-display tracking-widest font-bold uppercase">
            {event.venue}
          </div>
          
          <h2 className="text-2xl md:text-3xl font-display font-bold text-white mb-5 md:mb-6 drop-shadow-[0_0_10px_rgba(255,255,255,0.3)] leading-tight">
            {event.name}
          </h2>
          
          <div className="flex flex-col gap-3 md:gap-4 text-gray-300">
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 text-sm md:text-base">
              <Calendar className="w-4 h-4 md:w-5 md:h-5 text-neon-pink shrink-0" />
              <span>{formattedDate}</span>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 text-sm md:text-base">
              <Clock className="w-4 h-4 md:w-5 md:h-5 text-neon-blue shrink-0" />
              <div className="flex flex-col">
                <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
                <span className="text-[10px] md:text-xs text-gray-500">{duration} Minutes</span>
              </div>
            </div>
            <div className="flex items-center gap-3 bg-white/5 p-3 rounded-xl border border-white/5 text-sm md:text-base">
              <MapPin className="w-4 h-4 md:w-5 md:h-5 text-neon-purple shrink-0" />
              <span>{event.venue}</span>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
