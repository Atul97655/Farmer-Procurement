/**
 * Kisan-Q Real-Time Slot & Capacity Synchronization Utility
 * Dynamically computes slot availability, prevents booking passed slots,
 * and dynamically calculates FULL slots per centre, date, and live bookings.
 */

export interface DynamicTimeSlot {
  time: string;
  totalCapacity: number;
  availableCount: number;
  isFull: boolean;
}

export const STANDARD_MANDI_SLOTS: string[] = [
  '07:30 - 08:30 AM',
  '08:30 - 09:30 AM',
  '09:30 - 10:30 AM',
  '10:30 - 11:30 AM',
  '11:30 - 12:30 PM',
  '12:30 - 01:30 PM',
  '01:30 - 02:30 PM',
  '02:30 - 03:30 PM',
  '03:30 - 04:30 PM',
  '04:30 - 05:30 PM',
  '05:30 - 06:30 PM'
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
        if (startHour >= 7 && startHour <= 11) {
          // Morning start e.g. 11:30 AM - 12:30 PM
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

  return currentMinutes > (startMinutes + 10);
}

/**
 * Check if all slots for a given date are already passed
 */
export function areAllSlotsPassed(slots: { time: string }[], dateStr: string, now: Date = new Date()): boolean {
  return slots.every(s => isSlotPassed(s.time, dateStr, now));
}

/**
 * Dynamically computes slot capacity, reservations, and FULL status for a given centre, date,
 * taking into account live active bookings in app state.
 */
export function calculateDynamicSlots(
  dateStr: string,
  centre: { id: string; dailyCapacity?: number; currentLoad?: number; status?: string } | undefined,
  procurements: { centreId: string; slotDate: string; slotTime: string; queueStatus?: string }[] = []
): DynamicTimeSlot[] {
  const centreId = centre?.id || 'c-1';
  const dailyCapacity = centre?.dailyCapacity || 600;
  const currentLoad = centre?.currentLoad || 300;
  const status = centre?.status || 'NORMAL';

  // Base hourly vehicle capacity per 1-hour window (typically 6-10 vehicles/farmers)
  const baseHourlyQuota = Math.max(6, Math.min(10, Math.round(dailyCapacity / 75)));

  return STANDARD_MANDI_SLOTS.map(slotTime => {
    // Deterministic pseudo-random variation based on (centreId, dateStr, slotTime)
    let hash = 0;
    const seed = `${centreId}_${dateStr}_${slotTime}`;
    for (let i = 0; i < seed.length; i++) {
      hash = ((hash << 5) - hash) + seed.charCodeAt(i);
      hash |= 0;
    }
    const norm = Math.abs(hash);

    // Realistic mandi rush curve:
    // Peak hours: 10:30-11:30 AM, 11:30-12:30 PM, 02:30-03:30 PM
    let occupancyRate = 0.5; // base 50%
    if (slotTime.includes('10:30') || slotTime.includes('11:30') || slotTime.includes('02:30')) {
      occupancyRate = 0.82; // peak demand
    } else if (slotTime.includes('07:30') || slotTime.includes('05:30')) {
      occupancyRate = 0.35; // early or late
    } else {
      occupancyRate = 0.6;
    }

    // Adjust for centre load
    if (status === 'NEAR CAPACITY' || currentLoad / dailyCapacity > 0.8) {
      occupancyRate += 0.18;
    } else if (status === 'LOW' || currentLoad / dailyCapacity < 0.4) {
      occupancyRate -= 0.15;
    }

    // Calculate baseline booked slots
    const variance = (norm % 3) - 1; // -1, 0, or 1
    let baselineBooked = Math.round(baseHourlyQuota * occupancyRate) + variance;
    baselineBooked = Math.max(0, Math.min(baseHourlyQuota, baselineBooked));

    // Add actual live farmer bookings from app state for this exact centre, date, and slot
    const liveBookings = procurements.filter(p =>
      p.centreId === centreId &&
      p.slotDate === dateStr &&
      p.slotTime === slotTime &&
      p.queueStatus !== 'Cancelled'
    ).length;

    const totalBooked = Math.min(baseHourlyQuota, baselineBooked + liveBookings);
    const availableCount = Math.max(0, baseHourlyQuota - totalBooked);
    const isFull = availableCount === 0;

    return {
      time: slotTime,
      totalCapacity: baseHourlyQuota,
      availableCount,
      isFull
    };
  });
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
