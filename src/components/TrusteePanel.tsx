"use client";

import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { X, Clock, AlertTriangle, CheckCircle, Loader2, ChevronDown, Timer, RotateCcw, UserPlus, Copy, Check } from "lucide-react";
import { submitDelayUpdate, removeDelay, addTrustee, type TrusteeSession, type DelayUpdate, type NewTrusteeCredentials } from "@/lib/trustee-utils";
import { type DaySchedule, formatTime } from "@/lib/event-utils";

interface TrusteePanelProps {
  session: TrusteeSession;
  allDays: DaySchedule[];
  delayMap: Map<string, DelayUpdate>;
  onClose: () => void;
  onLogout: () => void;
  onUpdateSubmitted: () => void;
}

export function TrusteePanel({ session, allDays, delayMap, onClose, onLogout, onUpdateSubmitted }: TrusteePanelProps) {
  const [selectedEventId, setSelectedEventId] = useState("");
  const [inputMode, setInputMode] = useState<"delay" | "time">("delay");
  const [delayMinutes, setDelayMinutes] = useState("");
  const [newStartTime, setNewStartTime] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const [removingDelay, setRemovingDelay] = useState(false);

  // ─── Admin: Add Trustee state (only for EPOQUE2026) ──
  const isAdmin = session.code === "EPOQUE2026";
  const [showAddTrustee, setShowAddTrustee] = useState(false);
  const [newTrusteeName, setNewTrusteeName] = useState("");
  const [newTrusteeRoll, setNewTrusteeRoll] = useState("");
  const [addingTrustee, setAddingTrustee] = useState(false);
  const [newCredentials, setNewCredentials] = useState<NewTrusteeCredentials | null>(null);
  const [copied, setCopied] = useState(false);

  // Flatten all events with day info for the dropdown
  const allEvents = useMemo(() => {
    return allDays.flatMap(d =>
      d.events.map(e => ({ ...e, dayName: d.day, date: d.date }))
    );
  }, [allDays]);

  const selectedEvent = useMemo(
    () => allEvents.find(e => e.id === selectedEventId),
    [selectedEventId, allEvents]
  );

  const addMinutes = (time: string, mins: number): string => {
    const [h, m] = time.split(":").map(Number);
    const total = h * 60 + m + mins;
    const newH = Math.floor(total / 60) % 24;
    const newM = total % 60;
    return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
  };

  const handleSubmit = async () => {
    setError("");
    setSuccess(false);

    if (!selectedEvent) {
      setError("Please select an event.");
      return;
    }

    let computedNewTime: string;
    let computedDelay: number;

    if (inputMode === "delay") {
      const mins = parseInt(delayMinutes);
      if (isNaN(mins) || mins <= 0) {
        setError("Delay must be greater than 0 minutes.");
        return;
      }
      computedNewTime = addMinutes(selectedEvent.start, mins);
      computedDelay = mins;
    } else {
      if (!newStartTime) {
        setError("Please enter a new start time.");
        return;
      }
      computedNewTime = newStartTime;
      const [origH, origM] = selectedEvent.start.split(":").map(Number);
      const [newH, newM] = newStartTime.split(":").map(Number);
      computedDelay = (newH * 60 + newM) - (origH * 60 + origM);

      if (computedDelay <= 0) {
        setError("Event cannot start earlier than scheduled time.");
        return;
      }
    }

    // Final safety check
    if (computedNewTime <= selectedEvent.start) {
      setError("Event cannot start earlier than scheduled time.");
      return;
    }

    setLoading(true);
    try {
      const result = await submitDelayUpdate({
        event_id: selectedEvent.id,
        original_start_time: selectedEvent.start,
        new_start_time: computedNewTime,
        delay_minutes: computedDelay,
        updated_by: session.name,
        updater_library_id: session.library_id,
      });

      if (result.success) {
        setSuccess(true);
        onUpdateSubmitted();
        setSelectedEventId("");
        setDelayMinutes("");
        setNewStartTime("");
        setTimeout(() => setSuccess(false), 4000);
      } else {
        setError(result.error || "Failed to submit update.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setLoading(false);
  };

  // Check if selected event has an active delay
  const selectedEventHasDelay = selectedEventId ? delayMap.has(selectedEventId) : false;

  const handleMarkOnTime = async () => {
    if (!selectedEventId) return;
    setError("");
    setSuccess(false);
    setRemovingDelay(true);

    try {
      const result = await removeDelay(selectedEventId);
      if (result.success) {
        setSuccess(true);
        setSuccessMsg("Event marked as ON TIME!");
        onUpdateSubmitted();
        setSelectedEventId("");
        setTimeout(() => { setSuccess(false); setSuccessMsg(""); }, 4000);
      } else {
        setError(result.error || "Failed to remove delay.");
      }
    } catch {
      setError("Network error. Please try again.");
    }
    setRemovingDelay(false);
  };

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

      {/* Panel */}
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: "spring", damping: 30, stiffness: 300 }}
        className="relative w-full md:max-w-lg bg-[#0a0a19] border border-white/10 rounded-t-3xl md:rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.8)] max-h-[90dvh] overflow-y-auto"
      >
        {/* Top accent */}
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-neon-blue via-neon-purple to-neon-pink" />
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-neon-blue/10 rounded-full blur-[60px] pointer-events-none" />

        {/* Drag handle — mobile */}
        <div className="flex justify-center pt-3 pb-1 md:hidden">
          <div className="w-10 h-1 bg-white/20 rounded-full" />
        </div>

        <div className="p-5 md:p-8">
          {/* Close */}
          <button
            onClick={onClose}
            className="absolute top-3 right-3 md:top-4 md:right-4 p-2 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-colors z-20"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="flex items-center gap-3 mb-2">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-neon-blue/20 to-neon-purple/20 border border-white/10 flex items-center justify-center shadow-[0_0_15px_rgba(0,240,255,0.2)]">
              <Timer className="w-5 h-5 text-neon-blue" />
            </div>
            <div>
              <h2 className="text-lg font-display font-bold text-white">Delay Update Panel</h2>
              <p className="text-[11px] text-gray-500 font-display">Logged in as <span className="text-neon-cyan">{session.name}</span></p>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={onLogout}
            className="text-[10px] text-gray-500 hover:text-red-400 font-display tracking-wide mb-5 transition-colors"
          >
            ← Logout
          </button>

          {/* Event Selector */}
          <div className="mb-4">
            <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">SELECT EVENT</label>
            <div className="relative">
              <select
                value={selectedEventId}
                onChange={(e) => {
                  setSelectedEventId(e.target.value);
                  setError("");
                  setSuccess(false);
                }}
                className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 pr-10 text-sm text-white outline-none focus:border-neon-cyan/50 focus:bg-white/[0.07] transition-all font-display appearance-none cursor-pointer"
              >
                <option value="" className="bg-[#0a0a19] text-gray-400">Choose an event...</option>
                {allDays.map(day => (
                  <optgroup key={day.day} label={`${day.day} — ${day.date}`} className="bg-[#0a0a19]">
                    {day.events.map(event => (
                      <option key={event.id} value={event.id} className="bg-[#0a0a19] text-white">
                        {event.name} ({event.start} – {event.end}) • {event.venue}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 pointer-events-none" />
            </div>
          </div>

          {/* Selected event info */}
          {selectedEvent && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              className="mb-4 px-3.5 py-3 bg-white/[0.03] border border-white/5 rounded-xl overflow-hidden"
            >
              <div className="flex items-center gap-2 text-sm text-white font-display font-semibold mb-1">{selectedEvent.name}</div>
              <div className="flex items-center gap-4 text-xs text-gray-400">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatTime(selectedEvent.start)} - {formatTime(selectedEvent.end)}</span>
                <span>{selectedEvent.dayName}</span>
                <span>{selectedEvent.venue}</span>
              </div>
            </motion.div>
          )}

          {/* Input mode toggle */}
          <div className="flex gap-2 mb-4">
            <button
              onClick={() => { setInputMode("delay"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-display font-medium tracking-wide transition-all active:scale-95 ${
                inputMode === "delay"
                  ? "bg-neon-blue/15 text-neon-blue border border-neon-blue/40 shadow-[0_0_10px_rgba(0,240,255,0.15)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              Delay by Minutes
            </button>
            <button
              onClick={() => { setInputMode("time"); setError(""); }}
              className={`flex-1 py-2.5 rounded-xl text-xs font-display font-medium tracking-wide transition-all active:scale-95 ${
                inputMode === "time"
                  ? "bg-neon-purple/15 text-neon-purple border border-neon-purple/40 shadow-[0_0_10px_rgba(138,43,226,0.15)]"
                  : "bg-white/5 text-gray-400 border border-white/10 hover:bg-white/10"
              }`}
            >
              Set New Time
            </button>
          </div>

          {/* Input field */}
          <div className="mb-5">
            {inputMode === "delay" ? (
              <div>
                <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">DELAY DURATION (MINUTES)</label>
                <input
                  type="number"
                  min="1"
                  value={delayMinutes}
                  onChange={(e) => setDelayMinutes(e.target.value)}
                  placeholder="e.g. 30"
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-neon-blue/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600"
                />
                {selectedEvent && delayMinutes && parseInt(delayMinutes) > 0 && (
                  <p className="text-[11px] text-gray-500 mt-1.5 font-display">
                    New start: <span className="text-neon-cyan">{formatTime(addMinutes(selectedEvent.start, parseInt(delayMinutes)))}</span>
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">NEW START TIME</label>
                <input
                  type="time"
                  value={newStartTime}
                  onChange={(e) => setNewStartTime(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-neon-purple/50 focus:bg-white/[0.07] transition-all font-display [color-scheme:dark]"
                />
                {selectedEvent && (
                  <p className="text-[11px] text-gray-500 mt-1.5 font-display">
                    Original: <span className="text-gray-400">{formatTime(selectedEvent.start)}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Error */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-3.5 py-2.5 bg-red-500/10 border border-red-500/30 rounded-xl text-xs text-red-400 font-display flex items-center gap-2"
            >
              <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
              {error}
            </motion.div>
          )}

          {/* Success */}
          {success && (
            <motion.div
              initial={{ opacity: 0, y: -5 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-4 px-3.5 py-2.5 bg-green-500/10 border border-green-500/30 rounded-xl text-xs text-green-400 font-display flex items-center gap-2"
            >
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              {successMsg || "Delay update submitted successfully!"}
            </motion.div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={loading || !selectedEventId}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-neon-blue to-neon-purple text-white font-display font-bold text-sm tracking-wide active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(0,240,255,0.15)]"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4" />
                <span>Submit Delay Update</span>
              </>
            )}
          </button>

          {/* Mark On Time */}
          {selectedEventHasDelay && (
            <button
              onClick={handleMarkOnTime}
              disabled={removingDelay}
              className="w-full mt-3 py-3 rounded-xl bg-green-500/10 border border-green-500/30 text-green-400 font-display font-bold text-sm tracking-wide active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 hover:bg-green-500/20"
            >
              {removingDelay ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Removing delay...</span>
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4" />
                  <span>Mark As On Time</span>
                </>
              )}
            </button>
          )}

          {/* ─── Admin: Add New Trustee (PRANAY only) ─── */}
          {isAdmin && (
            <div className="mt-6 pt-5 border-t border-white/10">
              <button
                onClick={() => { setShowAddTrustee(!showAddTrustee); setNewCredentials(null); setError(""); }}
                className="flex items-center gap-2 text-xs text-neon-pink hover:text-white font-display tracking-wide transition-colors mb-3"
              >
                <UserPlus className="w-3.5 h-3.5" />
                {showAddTrustee ? "Hide" : "Add New Trustee"}
              </button>

              {showAddTrustee && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  className="overflow-hidden"
                >
                  <div className="flex flex-col gap-3 mb-4">
                    <div>
                      <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">PERSON NAME</label>
                      <input
                        type="text"
                        value={newTrusteeName}
                        onChange={(e) => setNewTrusteeName(e.target.value.toUpperCase())}
                        placeholder="e.g. ADITYA KUMAR"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-neon-pink/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600 uppercase"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] text-gray-400 font-display mb-1.5 block tracking-wide">ROLL / LIBRARY ID</label>
                      <input
                        type="text"
                        value={newTrusteeRoll}
                        onChange={(e) => setNewTrusteeRoll(e.target.value)}
                        placeholder="e.g. 2428CSEAI1150"
                        className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm text-white outline-none focus:border-neon-pink/50 focus:bg-white/[0.07] transition-all font-display placeholder:text-gray-600"
                      />
                    </div>
                  </div>

                  <button
                    onClick={async () => {
                      setError("");
                      setNewCredentials(null);
                      if (!newTrusteeName.trim() || !newTrusteeRoll.trim()) {
                        setError("Both fields are required.");
                        return;
                      }
                      setAddingTrustee(true);
                      const result = await addTrustee(newTrusteeName, newTrusteeRoll);
                      if (result.success && result.credentials) {
                        setNewCredentials(result.credentials);
                        setNewTrusteeName("");
                        setNewTrusteeRoll("");
                      } else {
                        setError(result.error || "Failed to add trustee.");
                      }
                      setAddingTrustee(false);
                    }}
                    disabled={addingTrustee}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-neon-pink to-neon-purple text-white font-display font-bold text-sm tracking-wide active:scale-[0.97] transition-transform disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(255,0,128,0.15)]"
                  >
                    {addingTrustee ? (
                      <><Loader2 className="w-4 h-4 animate-spin" /><span>Adding...</span></>
                    ) : (
                      <><UserPlus className="w-4 h-4" /><span>Generate & Add Trustee</span></>
                    )}
                  </button>

                  {/* Generated Credentials Card */}
                  {newCredentials && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-4 p-4 bg-green-500/[0.07] border border-green-500/30 rounded-xl"
                    >
                      <p className="text-xs text-green-400 font-display font-bold mb-3 flex items-center gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Trustee Created! Share these credentials:
                      </p>
                      <div className="bg-black/30 rounded-lg p-3 font-mono text-xs text-white space-y-1.5">
                        <p>Trustee Code: <span className="text-neon-cyan font-bold">{newCredentials.code}</span></p>
                        <p>Name: <span className="text-neon-cyan font-bold">{newCredentials.name}</span></p>
                        <p>Library ID: <span className="text-neon-cyan font-bold">{newCredentials.library_id}</span></p>
                      </div>
                      <button
                        onClick={() => {
                          const text = `EPOQUE Trustee Credentials\n\nCode: ${newCredentials.code}\nName: ${newCredentials.name}\nLibrary ID: ${newCredentials.library_id}\n\nUse these to log in at the schedule website.`;
                          navigator.clipboard.writeText(text);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }}
                        className="mt-3 w-full py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 font-display text-xs tracking-wide active:scale-95 transition-all hover:bg-white/10 flex items-center justify-center gap-1.5"
                      >
                        {copied ? (
                          <><Check className="w-3.5 h-3.5 text-green-400" /><span className="text-green-400">Copied!</span></>
                        ) : (
                          <><Copy className="w-3.5 h-3.5" /><span>Copy Credentials</span></>
                        )}
                      </button>
                    </motion.div>
                  )}
                </motion.div>
              )}
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
