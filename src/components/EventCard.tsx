"use client";

import { useEffect, useState } from "react";
import { formatTime, getDurationMinutes, getEventStatus, EventStatus, EventItem } from "@/lib/event-utils";
import { Clock, MapPin, CalendarClock } from "lucide-react";

interface EventCardProps {
  event: EventItem;
  currentDayDate: string;
  onClick: () => void;
}

export function EventCard({ event, currentDayDate, onClick }: EventCardProps) {
  const [status, setStatus] = useState<EventStatus>("upcoming");
  const [countdownStr, setCountdownStr] = useState<string>("");

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const currentStatus = getEventStatus(event, currentDayDate, now);
      setStatus(currentStatus);

      if (currentStatus === "upcoming") {
        const [startH, startM] = event.start.split(":").map(Number);
        const startTime = new Date(currentDayDate);
        startTime.setHours(startH, startM, 0, 0);

        const diffMs = startTime.getTime() - now.getTime();
        if (diffMs > 0) {
          const hours = Math.floor(diffMs / (1000 * 60 * 60));
          const mins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
          if (hours > 24) {
            setCountdownStr(`in ${Math.floor(hours/24)}d ${Math.floor(hours%24)}h`);
          } else if (hours > 0) {
            setCountdownStr(`in ${hours}h ${mins}m`);
          } else {
            setCountdownStr(`in ${mins}m`);
          }
        }
      }
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, [event, currentDayDate]);

  const duration = getDurationMinutes(event.start, event.end);

  const statusConfig = {
    upcoming: { color: "text-yellow-400", bg: "bg-yellow-400/10", border: "border-yellow-400/50", label: "UPCOMING" },
    ongoing: { color: "text-green-400", bg: "bg-green-400/10", border: "border-green-400/50", label: "LIVE NOW" },
    completed: { color: "text-gray-400", bg: "bg-gray-400/10", border: "border-gray-400/50", label: "COMPLETED" },
  };

  const sc = statusConfig[status];

  return (
    <div 
      className="group h-full flex flex-col glass-panel rounded-xl md:rounded-2xl p-4 md:p-5 md:hover:-translate-y-1 transition-transform duration-300 relative touch-manipulation"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-neon-blue/0 to-neon-purple/0 group-hover:from-neon-blue/10 group-hover:to-neon-purple/10 transition-colors duration-500 rounded-xl md:rounded-2xl pointer-events-none" />
      <div className="absolute -inset-[1px] bg-gradient-to-r from-neon-cyan/50 via-neon-purple/50 to-neon-red/50 opacity-0 group-hover:opacity-100 rounded-xl md:rounded-2xl blur-sm transition-opacity duration-500 z-[-1]" />
      
      {/* Header row */}
      <div className="flex justify-between items-start mb-3 md:mb-4 relative z-10">
        <div className={`px-2 py-0.5 md:px-2.5 md:py-1 rounded-[6px] border text-[9px] md:text-[10px] font-display font-medium tracking-widest flex items-center gap-1.5 ${sc.bg} ${sc.border} ${sc.color}`}>
          {status === "ongoing" && (
            <span className="relative flex h-1.5 w-1.5 md:h-2 md:w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 md:h-2 md:w-2 bg-green-500"></span>
            </span>
          )}
          {sc.label}
        </div>
        <div className="text-[10px] md:text-xs text-gray-400 flex items-center gap-1 bg-black/40 px-1.5 py-0.5 md:px-2 md:py-1 rounded-[6px] border border-white/5">
          <CalendarClock className="w-3 h-3 md:w-3.5 md:h-3.5" />
          {duration}m
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 relative z-10">
        <h3 className="text-base md:text-xl font-display font-bold text-white mb-1 md:mb-2 group-hover:text-neon-cyan transition-colors leading-snug">{event.name}</h3>
        
        <div className="flex flex-col gap-1.5 md:gap-2 mt-3 md:mt-4 text-xs md:text-sm text-gray-300">
          <div className="flex items-center gap-1.5 md:gap-2">
            <Clock className="w-3.5 h-3.5 md:w-4 md:h-4 text-neon-blue shrink-0" />
            <span>{formatTime(event.start)} - {formatTime(event.end)}</span>
          </div>
          <div className="flex items-center gap-1.5 md:gap-2">
            <MapPin className="w-3.5 h-3.5 md:w-4 md:h-4 text-neon-purple shrink-0" />
            <span className="truncate">{event.venue}</span>
          </div>
        </div>
      </div>

      {/* Footer */}
      {status === "upcoming" && countdownStr && (
        <div className="mt-4 md:mt-6 pt-3 md:pt-4 border-t border-white/10 relative z-10">
          <div className="text-[10px] md:text-xs font-medium text-neon-pink">
            {countdownStr}
          </div>
        </div>
      )}
    </div>
  );
}
