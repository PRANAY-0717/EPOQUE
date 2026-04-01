"use client";

import { useState } from "react";
import { motion, AnimatePresence, Variants } from "framer-motion";
import { EventItem } from "@/lib/event-utils";
import { EventCard } from "./EventCard";
import { EventDetailModal } from "./EventDetailModal";

interface EventGridProps {
  events: EventItem[];
  currentDayDate: string;
}

const container: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const item: Variants = {
  hidden: { opacity: 0, y: 30, scale: 0.95 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring", stiffness: 260, damping: 20 } }
};

export function EventGrid({ events, currentDayDate }: EventGridProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventItem | null>(null);

  return (
    <>
      {events.length === 0 ? (
        <div className="w-full flex-1 flex flex-col items-center justify-center py-20 opacity-50">
          <div className="text-neon-blue font-display text-xl">NO EVENTS FOUND</div>
          <p className="text-sm mt-2">Try selecting another venue.</p>
        </div>
      ) : (
        <motion.div 
          variants={container}
          initial="hidden"
          animate="show"
          className="w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          {events.map((event) => (
            <motion.div key={event.id} variants={item} layout>
              <EventCard 
                event={event} 
                currentDayDate={currentDayDate} 
                onClick={() => setSelectedEvent(event)}
              />
            </motion.div>
          ))}
        </motion.div>
      )}

      <AnimatePresence>
        {selectedEvent && (
          <EventDetailModal 
            event={selectedEvent} 
            dateStr={currentDayDate} 
            onClose={() => setSelectedEvent(null)} 
          />
        )}
      </AnimatePresence>
    </>
  );
}
