"use client";

import { motion } from "framer-motion";
import { X, AlertCircle, User, CreditCard, Clock } from "lucide-react";
import { maskLibraryId } from "@/lib/trustee-utils";
import { formatTime, type MergedEventItem } from "@/lib/event-utils";

interface DelayInfoModalProps {
  event: MergedEventItem;
  onClose: () => void;
}

export function DelayInfoModal({ event, onClose }: DelayInfoModalProps) {
  if (!event.delayMinutes) return null;

  return (
    <div className="fixed inset-0 z-[110] flex items-end md:items-center justify-center">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, y: 60, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 60, scale: 0.95 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
        className="relative w-full md:max-w-sm bg-[#0a0a19] border border-white/10 rounded-t-3xl md:rounded-2xl overflow-hidden shadow-[0_0_40px_rgba(0,0,0,0.8)]"
      >
        {/* Top accent — red for delay */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-red-500 via-orange-500 to-red-500" />

        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="p-5 md:p-6">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-2.5 mb-5">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 border border-red-500/30 flex items-center justify-center">
              <AlertCircle className="w-4.5 h-4.5 text-red-400" />
            </div>
            <div>
              <h3 className="text-sm font-display font-bold text-white">Event Delayed</h3>
              <p className="text-[10px] text-gray-500 font-display">{event.name}</p>
            </div>
          </div>

          {/* Info rows */}
          <div className="flex flex-col gap-2.5">
            {/* Delay amount */}
            <div className="flex items-center gap-3 bg-red-500/[0.07] border border-red-500/20 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-red-400 shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-display">Delay Duration</p>
                <p className="text-sm text-white font-display font-semibold">{event.delayMinutes} minutes</p>
              </div>
            </div>

            {/* Time change */}
            <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
              <Clock className="w-4 h-4 text-neon-blue shrink-0" />
              <div>
                <p className="text-xs text-gray-400 font-display">Updated Time</p>
                <p className="text-sm text-white font-display">
                  <span className="line-through text-gray-500 mr-2">{event.originalStart ? formatTime(event.originalStart) : "—"}</span>
                  →
                  <span className="text-neon-cyan ml-2 font-semibold">{formatTime(event.start)}</span>
                </p>
              </div>
            </div>

            {/* Updated by */}
            {event.delayedBy && (
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                <User className="w-4 h-4 text-neon-purple shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-display">Updated By</p>
                  <p className="text-sm text-white font-display font-medium">{event.delayedBy}</p>
                </div>
              </div>
            )}

            {/* Library ID (masked) */}
            {event.delayedByLibraryId && (
              <div className="flex items-center gap-3 bg-white/[0.03] border border-white/5 p-3 rounded-xl">
                <CreditCard className="w-4 h-4 text-gray-500 shrink-0" />
                <div>
                  <p className="text-xs text-gray-400 font-display">Library ID</p>
                  <p className="text-sm text-gray-300 font-display font-mono tracking-wide">{maskLibraryId(event.delayedByLibraryId)}</p>
                </div>
              </div>
            )}
          </div>

          {/* Close button */}
          <button
            onClick={onClose}
            className="w-full mt-5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-400 font-display text-xs tracking-wide active:scale-95 transition-transform hover:bg-white/10 hover:text-white"
          >
            Close
          </button>
        </div>
      </motion.div>
    </div>
  );
}
