/**
 * Timezone Utilities for Wasillah Email System
 * 
 * Pakistan Standard Time (PKT) is UTC+5:00
 * This utility helps convert between local time and UTC for reminder scheduling
 */

// Pakistan Standard Time offset from UTC in hours
export const PKT_UTC_OFFSET = 5;

/**
 * Convert a local date/time to UTC ISO string
 * This ensures reminders are scheduled correctly regardless of user's timezone
 * 
 * @param dateString - Date in YYYY-MM-DD format (e.g., "2024-12-25")
 * @param timeString - Time in HH:mm format (e.g., "14:30")
 * @param timezone - Timezone offset in hours (default: PKT_UTC_OFFSET = 5)
 * @returns ISO string in UTC (e.g., "2024-12-25T09:30:00.000Z")
 */
export function convertLocalToUTC(
  dateString: string,
  timeString: string,
  timezone: number = PKT_UTC_OFFSET
): string {
  // Parse the local date and time
  const [year, month, day] = dateString.split('-').map(Number);
  const [hours, minutes] = timeString.split(':').map(Number);
  
  // Create date object in local time
  const localDate = new Date(year, month - 1, day, hours, minutes, 0, 0);
  
  // Subtract timezone offset to get UTC
  const utcDate = new Date(localDate.getTime() - (timezone * 60 * 60 * 1000));
  
  return utcDate.toISOString();
}

/**
 * Convert UTC ISO string to local date/time components
 * Useful for displaying scheduled reminders to users
 * 
 * @param utcIsoString - ISO string in UTC (e.g., "2024-12-25T09:30:00.000Z")
 * @param timezone - Timezone offset in hours (default: PKT_UTC_OFFSET = 5)
 * @returns Object with date and time in local timezone
 */
export function convertUTCToLocal(
  utcIsoString: string,
  timezone: number = PKT_UTC_OFFSET
): { date: string; time: string; datetime: Date } {
  const utcDate = new Date(utcIsoString);
  
  // Add timezone offset to get local time
  const localDate = new Date(utcDate.getTime() + (timezone * 60 * 60 * 1000));
  
  // Format date as YYYY-MM-DD
  const year = localDate.getFullYear();
  const month = String(localDate.getMonth() + 1).padStart(2, '0');
  const day = String(localDate.getDate()).padStart(2, '0');
  const dateString = `${year}-${month}-${day}`;
  
  // Format time as HH:mm
  const hours = String(localDate.getHours()).padStart(2, '0');
  const minutes = String(localDate.getMinutes()).padStart(2, '0');
  const timeString = `${hours}:${minutes}`;
  
  return {
    date: dateString,
    time: timeString,
    datetime: localDate
  };
}

/**
 * Get current time in Pakistan Standard Time
 * @returns Date object representing current PKT time
 */
export function getCurrentPKT(): Date {
  const now = new Date();
  return new Date(now.getTime() + (PKT_UTC_OFFSET * 60 * 60 * 1000));
}

/**
 * Format a date for display in Pakistan Standard Time
 * @param date - Date object or ISO string
 * @returns Formatted string like "December 25, 2024 at 2:30 PM PKT"
 */
export function formatPKTDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const localTime = convertUTCToLocal(dateObj.toISOString());
  
  const dateFormatted = new Date(localTime.date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  
  const [hours, minutes] = localTime.time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const displayHours = hours % 12 || 12;
  const timeFormatted = `${displayHours}:${String(minutes).padStart(2, '0')} ${period}`;
  
  return `${dateFormatted} at ${timeFormatted} PKT`;
}

/**
 * Validate that a scheduled time is in the future
 * @param dateString - Date in YYYY-MM-DD format
 * @param timeString - Time in HH:mm format
 * @param timezone - Timezone offset in hours (default: PKT_UTC_OFFSET = 5)
 * @returns true if the time is in the future
 */
export function isFutureTime(
  dateString: string,
  timeString: string,
  timezone: number = PKT_UTC_OFFSET
): boolean {
  const scheduledUTC = convertLocalToUTC(dateString, timeString, timezone);
  const scheduledTime = new Date(scheduledUTC).getTime();
  const now = Date.now();
  
  return scheduledTime > now;
}

/**
 * Get minimum date for reminder (tomorrow in PKT)
 * @returns Date string in YYYY-MM-DD format
 */
export function getMinimumReminderDate(): string {
  const pktNow = getCurrentPKT();
  const tomorrow = new Date(pktNow);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  const year = tomorrow.getFullYear();
  const month = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const day = String(tomorrow.getDate()).padStart(2, '0');
  
  return `${year}-${month}-${day}`;
}

/**
 * Example usage documentation
 * 
 * // When creating a reminder in Pakistan:
 * const reminderDate = "2024-12-25"; // December 25, 2024
 * const reminderTime = "14:30";      // 2:30 PM PKT
 * 
 * // Convert to UTC for storage
 * const utcIsoString = convertLocalToUTC(reminderDate, reminderTime);
 * // Result: "2024-12-25T09:30:00.000Z" (9:30 AM UTC = 2:30 PM PKT)
 * 
 * // When displaying a reminder:
 * const utcFromSheet = "2024-12-25T09:30:00.000Z";
 * const local = convertUTCToLocal(utcFromSheet);
 * console.log(local.date); // "2024-12-25"
 * console.log(local.time); // "14:30"
 * 
 * // Display formatted:
 * const formatted = formatPKTDateTime(utcFromSheet);
 * console.log(formatted); // "December 25, 2024 at 2:30 PM PKT"
 * 
 * // Validate future time:
 * const isValid = isFutureTime("2024-12-25", "14:30");
 * console.log(isValid); // true if in the future
 */
