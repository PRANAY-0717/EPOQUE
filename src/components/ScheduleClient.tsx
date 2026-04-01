"use client";

import { useState, useMemo, useEffect } from "react";
import { getEventStatus } from "@/lib/event-utils";
import scheduleData from "@/data/schedule.json";
import { DaySelector } from "@/components/DaySelector";
import { VenueSelector } from "@/components/VenueSelector";
import { EventGrid } from "@/components/EventGrid";
import { motion, AnimatePresence } from "framer-motion";
import { Search, QrCode } from "lucide-react";
import { SearchOverlay } from "@/components/SearchOverlay";
import { QRModal } from "@/components/QRModal";

export function ScheduleClient() {
  const [selectedDayIdx, setSelectedDayIdx] = useState(0);
  const [selectedVenue, setSelectedVenue] = useState<string>("All Venues");
  const [statusFilter, setStatusFilter] = useState<"all" | "ongoing" | "upcoming">("all");
  
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isQROpen, setIsQROpen] = useState(false);

  // Live Now logic
  const [now, setNow] = useState(new Date());
  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const liveEvents = useMemo(() => {
    const live: any[] = [];
    scheduleData.forEach(d => {
      d.events.forEach(e => {
        const [startH, startM] = e.start.split(":").map(Number);
        const [endH, endM] = e.end.split(":").map(Number);
        const sTime = new Date(d.date); sTime.setHours(startH, startM);
        const eTime = new Date(d.date); eTime.setHours(endH, endM);
        if (now >= sTime && now <= eTime) {
          live.push({ ...e, dateStr: d.date });
        }
      });
    });
    return live;
  }, [now]);

  const currentDay = scheduleData[selectedDayIdx];
  const allVenuesList = currentDay.events.map((e) => e.venue);
  const uniqueVenues = ["All Venues", ...Array.from(new Set(allVenuesList))];

  useMemo(() => {
    if (selectedVenue !== "All Venues" && !uniqueVenues.includes(selectedVenue)) {
      setSelectedVenue("All Venues");
    }
  }, [selectedDayIdx, selectedVenue, uniqueVenues]);

  const filteredEvents = currentDay.events.filter(e => {
    const venueMatch = selectedVenue === "All Venues" || e.venue === selectedVenue;
    if (!venueMatch) return false;
    if (statusFilter === "all") return true;
    const status = getEventStatus(e, currentDay.date, now);
    return status === statusFilter;
  }).sort((a, b) => a.start.localeCompare(b.start));

  return (
    <div className="min-h-screen min-h-[100dvh] pb-24 pt-20 md:pt-28 px-3 md:px-8 max-w-6xl mx-auto flex flex-col items-center">
      {/* Navbar */}
      <nav className="fixed top-0 left-0 right-0 z-50 py-3 md:py-4 px-4 md:px-6 bg-[#030308]/80 backdrop-blur-2xl border-b border-white/5 shadow-[0_4px_30px_rgba(0,0,0,0.5)]">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-neon-blue to-neon-purple shadow-neon-blue flex items-center justify-center shrink-0">
              <span className="font-display font-bold text-black text-xs md:text-sm">EQ</span>
            </div>
            <h1 className="text-base md:text-xl font-display font-bold tracking-widest text-gradient">
              EPOQUE <span className="text-white/80 font-normal hidden sm:inline">2026</span>
            </h1>
          </div>
          <div className="flex items-center gap-2 md:gap-4">
            <button 
              onClick={() => setIsSearchOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors text-white/60 hover:text-white active:scale-95"
            >
              <Search className="w-4 h-4" />
              <span className="text-xs md:text-sm font-display tracking-wide">Search Events</span>
            </button>
            <button 
              onClick={() => setIsQROpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 md:px-4 md:py-2.5 rounded-xl border border-neon-cyan/50 text-neon-cyan shadow-[0_0_10px_rgba(0,240,255,0.2)] hover:bg-neon-cyan/20 active:scale-95 transition-all"
            >
              <QrCode className="w-4 h-4" />
              <span className="text-xs md:text-sm font-display tracking-wide">Gate Entry</span>
            </button>
          </div>
        </div>
      </nav>

      {/* Main Flow */}
      <div className="w-full flex flex-col items-center gap-5 md:gap-8 z-10">
        
        {/* Live Now Banner */}
        <AnimatePresence>
          {liveEvents.length > 0 && (
            <motion.div 
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="w-full overflow-hidden"
            >
              <div className="flex items-center gap-2 mb-3">
                <div className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500"></span>
                </div>
                <h2 className="text-base md:text-xl font-display font-bold text-white tracking-widest">LIVE NOW</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pb-4 border-b border-white/5">
                {liveEvents.map(le => (
                  <div key={le.id} className="bg-red-500/10 border border-red-500/30 p-3 md:p-4 rounded-xl text-left flex justify-between items-center cursor-pointer active:bg-red-500/20 hover:bg-red-500/20 transition-colors">
                    <div className="min-w-0">
                      <h3 className="font-display font-bold text-white text-sm md:text-base truncate">{le.name}</h3>
                      <p className="text-xs text-gray-400">{le.venue}</p>
                    </div>
                    <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center text-red-400 shrink-0 ml-2">
                      <span className="text-[10px] font-bold leading-none">GO</span>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Day Selector */}
        <DaySelector 
          days={scheduleData.map(d => ({ day: d.day, date: d.date }))} 
          selectedIdx={selectedDayIdx} 
          onSelect={setSelectedDayIdx} 
        />
        
        {/* Venue Selector */}
        <VenueSelector 
          venues={uniqueVenues} 
          selected={selectedVenue} 
          onSelect={setSelectedVenue} 
        />

        {/* Status Filter */}
        <div className="flex items-center gap-2 md:gap-3 overflow-x-auto w-full justify-center pb-1">
          {([
            { key: "all" as const, label: "All", icon: null },
            { key: "ongoing" as const, label: "Ongoing", dotColor: "bg-green-400" },
            { key: "upcoming" as const, label: "Upcoming", dotColor: "bg-yellow-400" },
          ]).map((item) => {
            const isActive = statusFilter === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setStatusFilter(item.key)}
                className={`relative flex items-center gap-1.5 px-3 md:px-4 py-2 rounded-full text-xs md:text-sm font-medium transition-all active:scale-95 whitespace-nowrap ${
                  isActive
                    ? "bg-white/10 text-white border border-white/20 shadow-[0_0_10px_rgba(255,255,255,0.1)]"
                    : "text-gray-400 hover:text-white hover:bg-white/5 border border-transparent"
                }`}
              >
                {item.dotColor && (
                  <span className={`w-1.5 h-1.5 md:w-2 md:h-2 rounded-full ${item.dotColor} ${isActive ? "animate-pulse" : "opacity-50"}`} />
                )}
                <span className="font-display tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>

        {/* Events Grid */}
        <AnimatePresence mode="wait">
          <motion.div 
            key={`${selectedDayIdx}-${selectedVenue}-${statusFilter}`}
            initial={{ opacity: 0, y: 20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="w-full"
          >
            <EventGrid events={filteredEvents} currentDayDate={currentDay.date} />
          </motion.div>
        </AnimatePresence>

      </div>

      {/* Footer trademark */}
      <footer className="w-full mt-16 pb-6 flex flex-col items-center gap-2 z-10">
        <div className="w-16 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        <p className="text-xs md:text-sm text-gray-500 font-display tracking-wide flex items-center gap-1.5">
          Made with <span className="text-red-500 animate-pulse">♥</span> by <span className="text-white font-medium">Pranay</span>
        </p>
        <a
          href="https://www.instagram.com/pranay_codes_717?igsh=M3FtcjFjb3EzdnN2"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-[11px] md:text-xs text-gray-500 hover:text-neon-pink transition-colors font-display"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
          @pranay_codes_717
        </a>
      </footer>

      {isSearchOpen && <SearchOverlay allDays={scheduleData} onClose={() => setIsSearchOpen(false)} />}
      {isQROpen && <QRModal onClose={() => setIsQROpen(false)} />}
    </div>
  );
}
