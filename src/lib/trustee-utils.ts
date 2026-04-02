import { supabase } from "./supabaseClient";
import type { EventItem, MergedEventItem } from "./event-utils";

// ─── Types ─────────────────────────────────────────────

export interface Trustee {
  id: string;
  code: string;
  name: string;
  library_id: string;
  is_active: boolean;
}

export interface DelayUpdate {
  id: string;
  event_id: string;
  original_start_time: string;
  new_start_time: string;
  delay_minutes: number;
  updated_by: string;
  updater_library_id: string;
  created_at: string;
}

export interface TrusteeSession {
  name: string;
  code: string;
  library_id: string;
}

// ─── Verify Trustee ────────────────────────────────────

export async function verifyTrustee(
  code: string,
  name: string,
  libraryId: string
): Promise<{ success: boolean; error?: string }> {
  const { data, error } = await supabase
    .from("trustees")
    .select("*")
    .eq("code", code.trim())
    .eq("library_id", libraryId.trim())
    .eq("is_active", true)
    .single();

  if (error || !data) {
    return { success: false, error: "Invalid credentials. Check your code and library ID." };
  }

  // Name check (exact match — must be in CAPS)
  if (data.name !== name.trim()) {
    return { success: false, error: "Name does not match. Make sure it's in CAPS." };
  }

  return { success: true };
}

// ─── Submit Delay Update ───────────────────────────────

export async function submitDelayUpdate(params: {
  event_id: string;
  original_start_time: string;
  new_start_time: string;
  delay_minutes: number;
  updated_by: string;
  updater_library_id: string;
}): Promise<{ success: boolean; error?: string }> {
  // Client-side validation: no early starts
  if (params.new_start_time < params.original_start_time) {
    return { success: false, error: "Event cannot start earlier than scheduled time." };
  }

  if (params.delay_minutes <= 0) {
    return { success: false, error: "Delay must be greater than 0 minutes." };
  }

  const { error } = await supabase.from("event_updates").insert([params]);

  if (error) {
    console.error("Supabase insert error:", error);
    return { success: false, error: "Failed to submit update. Please try again." };
  }

  return { success: true };
}

// ─── Fetch Latest Delay Updates ────────────────────────

export async function fetchDelayUpdates(): Promise<Map<string, DelayUpdate>> {
  const map = new Map<string, DelayUpdate>();

  try {
    const { data, error } = await supabase
      .from("event_updates")
      .select("*")
      .order("created_at", { ascending: false });

    if (error || !data) return map;

    // Latest update per event_id wins (already sorted desc)
    for (const update of data) {
      if (!map.has(update.event_id)) {
        map.set(update.event_id, update as DelayUpdate);
      }
    }
  } catch {
    // Supabase not configured or network error — graceful fallback
  }

  return map;
}

// ─── Merge Delays Into Events (NON-DESTRUCTIVE) ───────

export function mergeEventUpdates(
  events: EventItem[],
  delayMap: Map<string, DelayUpdate>
): MergedEventItem[] {
  return events.map((event) => {
    const update = delayMap.get(event.id);
    if (!update) return event;

    // Keep same duration, shift end time
    const duration = timeDiffMinutes(event.start, event.end);
    const newEnd = addMinutesToTime(update.new_start_time, duration);

    return {
      ...event,
      originalStart: event.start,
      start: update.new_start_time,
      end: newEnd,
      delayMinutes: update.delay_minutes,
      delayedBy: update.updated_by,
      delayedByLibraryId: update.updater_library_id,
    };
  });
}

// ─── Mask Library ID ───────────────────────────────────

export function maskLibraryId(id: string): string {
  if (id.length <= 4) return "****";
  return id.slice(0, -4) + "****";
}

// ─── Remove Delay (Mark On Time) ──────────────────────

export async function removeDelay(eventId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from("event_updates")
      .delete()
      .eq("event_id", eventId);

    if (error) return { success: false, error: error.message };
    return { success: true };
  } catch {
    return { success: false, error: "Network error." };
  }
}

// ─── Time Helpers (internal) ───────────────────────────

function timeDiffMinutes(start: string, end: string): number {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  return (eH * 60 + eM) - (sH * 60 + sM);
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}
