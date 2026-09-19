/**
 * Kisan-Q Real-Time Slot Synchronization Utility
 * Ensures that booking slots reflect live operational hours and past slots
 * are automatically marked as passed and prevented from booking.
 */

export interface TimeSlotConfig {
  time: string;
  defaultCapacity: number;
}

export const STANDARD_MANDI_SLOTS: TimeSlotConfig[] = [
  { time: '07:30 - 08:30 AM', defaultCapacity: 4 },
  { time: '08:30 - 09:30 AM', defaultCapacity: 5 },
  { time: '09:30 - 10:30 AM', defaultCapacity: 3 },
  { time: '10:30 - 11:30 AM', defaultCapacity: 0 }, // full demo
  { time: '11:30 - 12:30 PM', defaultCapacity: 8 },
  { time: '12:30 - 01:30 PM', defaultCapacity: 5 },
  { time: '01:30 - 02:30 PM', defaultCapacity: 6 },
  { time: '02:30 - 03:30 PM', defaultCapacity: 2 },
  { time: '03:30 - 04:30 PM', defaultCapacity: 0 }, // full demo
  { time: '04:30 - 05:30 PM', defaultCapacity: 4 },
  { time: '05:30 - 06:30 PM', defaultCapacity: 5 }
];

/**
 * Format a Date object to YYYY-MM-DD in local time
 */
export function getLocalDateString(d: Date = new Date()): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

/**
 * Parse time slot strings like "08:30 - 09:30 AM" or "11:30 - 12:30 PM" into minutes from midnight
 */
export function parseSlotTimeRange(slotStr: string): { startMinutes: number; endMinutes: number } {
  const parts = slotStr.split('-').map(s => s.trim());
  if (parts.length !== 2) return { startMinutes: 0, endMinutes: 1440 };

  const endPart = parts[1]; // e.g. "09:30 AM", "12:30 PM", "02:30 PM"
  const isEndPM = endPart.toUpperCase().includes('PM');
  const isEndAM = endPart.toUpperCase().includes('AM');

  const endMatch = endPart.match(/(\d+):(\d+)/);
  let endHour = endMatch ? parseInt(endMatch[1], 10) : 0;
  const endMin = endMatch ? parseInt(endMatch[2], 10) : 0;
  if (isEndPM && endHour < 12) endHour += 12;
  if (isEndAM && endHour === 12) endHour = 0;
  const endMinutes = endHour * 60 + endMin;

  const startPart = parts[0]; // e.g. "07:30", "11:30", "01:30"
  const startMatch = startPart.match(/(\d+):(\d+)/);
  let startHour = startMatch ? parseInt(startMatch[1], 10) : 0;
  const startMin = startMatch ? parseInt(startMatch[2], 10) : 0;

  if (startPart.toUpperCase().includes('PM')) {
    if (startHour < 12) startHour += 12;
  } else if (startPart.toUpperCase().includes('AM')) {
    if (startHour === 12) startHour = 0;
  } else {
    // Infer AM/PM based on end marker and hour values
    if (isEndAM) {
      if (startHour === 12) startHour = 0;
    } else if (isEndPM) {
      if (startHour < 12) {
        // e.g. 11:30 AM transitioning to 12:30 PM
        if (startHour >= 7 && startHour <= 11) {
          // Morning start
        } else {
          // Afternoon start e.g. 01:30 - 02:30 PM
          startHour += 12;
        }
      }
    }
  }

  const startMinutes = startHour * 60 + startMin;
  return { startMinutes, endMinutes };
}

/**
 * Check if a time slot has already passed for a given date.
 * Allows a 10-minute grace buffer after slot start.
 */
export function isSlotPassed(slotStr: string, dateStr: string, now: Date = new Date()): boolean {
  const todayStr = getLocalDateString(now);

  // Past dates are completely passed
  if (dateStr < todayStr) return true;
  // Future dates have not passed
  if (dateStr > todayStr) return false;

  // It is today: compare against current time
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const { startMinutes } = parseSlotTimeRange(slotStr);

  // Slot has passed if current time is past start time + 10 minute grace
  return currentMinutes > (startMinutes + 10);
}

/**
 * Check if all slots for a given date are already passed
 */
export function areAllSlotsPassed(slots: { time: string }[], dateStr: string, now: Date = new Date()): boolean {
  return slots.every(s => isSlotPassed(s.time, dateStr, now));
}

/**
 * Find the first upcoming, available (non-full, non-passed) slot
 */
export function getFirstAvailableSlot(
  slots: { time: string; isFull?: boolean }[],
  dateStr: string,
  now: Date = new Date()
): string | null {
  for (const s of slots) {
    if (!s.isFull && !isSlotPassed(s.time, dateStr, now)) {
      return s.time;
    }
  }
  return null;
}
