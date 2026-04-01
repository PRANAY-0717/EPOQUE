export type EventItem = {
  id: string;
  name: string;
  venue: string;
  start: string; // HH:mm
  end: string;   // HH:mm
};

export type DaySchedule = {
  day: string;
  date: string; // YYYY-MM-DD
  events: EventItem[];
};

export type EventStatus = "upcoming" | "ongoing" | "completed";

// To make testing easier, we can pass a 'now' parameter, otherwise it defaults to new Date()
export function getEventStatus(event: EventItem, dateStr: string, now: Date = new Date()): EventStatus {
  const [startH, startM] = event.start.split(":").map(Number);
  const [endH, endM] = event.end.split(":").map(Number);
  
  const startTime = new Date(dateStr);
  startTime.setHours(startH, startM, 0, 0);
  
  const endTime = new Date(dateStr);
  endTime.setHours(endH, endM, 0, 0);

  if (now < startTime) return "upcoming";
  if (now >= startTime && now <= endTime) return "ongoing";
  return "completed";
}

export function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const date = new Date();
  date.setHours(parseInt(h), parseInt(m), 0);
  return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit", hour12: true });
}

export function getDurationMinutes(start: string, end: string): number {
  const [sH, sM] = start.split(":").map(Number);
  const [eH, eM] = end.split(":").map(Number);
  return (eH * 60 + eM) - (sH * 60 + sM);
}

// Conflict detector for 'My Schedule'
export function checkConflicts(events: (EventItem & { date: string })[]): [EventItem, EventItem] | null {
  for (let i = 0; i < events.length; i++) {
    for (let j = i + 1; j < events.length; j++) {
      if (events[i].date === events[j].date) {
        const start1 = parseInt(events[i].start.replace(":", ""));
        const end1 = parseInt(events[i].end.replace(":", ""));
        const start2 = parseInt(events[j].start.replace(":", ""));
        const end2 = parseInt(events[j].end.replace(":", ""));
        
        // overlaps if (StartA < EndB) and (EndA > StartB)
        if (start1 < end2 && end1 > start2) {
          return [events[i], events[j]];
        }
      }
    }
  }
  return null;
}
