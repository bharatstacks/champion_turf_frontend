import { useMemo } from 'react';
import { Turf, Booking } from '@/types';
import { format, isSameDay } from 'date-fns';

export function calculateDuration(
  watchedStartDate: Date,
  startTime: string,
  watchedEndDate: Date,
  endTime: string
): number {
  if (!watchedStartDate || !watchedEndDate || !startTime || !endTime) {
    return 0;
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startDateTime = new Date(watchedStartDate);
  startDateTime.setHours(startHour, startMin, 0, 0);

  const endDateTime = new Date(watchedEndDate);
  endDateTime.setHours(endHour, endMin, 0, 0);

  const diffMs = endDateTime.getTime() - startDateTime.getTime();

  // Convert milliseconds → hours
  return Math.max(0, diffMs / (1000 * 60 * 60));
}


export function calculateTotalAmount(
  pricePerHour: number,
  durationHours: number
): number {
  return pricePerHour * durationHours;
}

export function calculateBalance(totalAmount: number, amountPaid: number): number {
  return Math.max(0, totalAmount - amountPaid);
}

export function validateTimeSlotRecurrance(startTime: string, endTime: string): string | null {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    return 'End time must be after start time';
  }
  return null;
}

export function validateTimeSlot(
  watchedStartDate: Date,
  startTime: string,
  watchedEndDate: Date,
  endTime: string
): string | null {
  if (!watchedStartDate || !watchedEndDate || !startTime || !endTime) {
    return null;
  }

  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);

  const startDateTime = new Date(watchedStartDate);
  startDateTime.setHours(startHour, startMin, 0, 0);

  const endDateTime = new Date(watchedEndDate);
  endDateTime.setHours(endHour, endMin, 0, 0);

  if (endDateTime <= startDateTime) {
    return 'End date & time must be after start date & time';
  }

  return null;
}


export function checkBookingOverlap(
  turfId: string,
  date: Date,
  startTime: string,
  EndDate: Date,
  endTime: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): Booking | null {
  const [newStartHour, newStartMin] = startTime.split(':').map(Number);
  const [newEndHour, newEndMin] = endTime.split(':').map(Number);
  const newStartMinutes = newStartHour * 60 + newStartMin;
  const newEndMinutes = newEndHour * 60 + newEndMin;

  if (!existingBookings)
    existingBookings = []

  for (const booking of existingBookings) {
    if (booking.id === excludeBookingId) continue;
    if (booking.turfId !== turfId) continue;
    if (booking.status === 'cancelled') continue;
    // if (!isSameDay(new Date(booking.date), date)) continue;

    const [existingStartHour, existingStartMin] = booking.startTime.split(':').map(Number);
    const [existingEndHour, existingEndMin] = booking.endTime.split(':').map(Number);
    const existingStartMinutes = existingStartHour * 60 + existingStartMin;
    const existingEndMinutes = existingEndHour * 60 + existingEndMin;

    // Check for overlap
    if (newStartMinutes < existingEndMinutes && newEndMinutes > existingStartMinutes) {
      return booking;
    }
  }

  return null;
}

export function useBookingCalculations(
  turf: Turf | undefined,
  startTime: string,
  endTime: string,
  watchedStartDate,
  watchedEndDate,
  amountPaid: number,
  manualPricePerHour: number,
  isRecurring,
  watchedRecurringFrequency
) {
  return useMemo(() => {
    let duration = calculateDuration(watchedStartDate, startTime, watchedEndDate, endTime);
    let pricePerHour =
      manualPricePerHour !== undefined
        ? manualPricePerHour
        : turf?.pricePerHour ?? 0;
    let totalAmount = turf ? calculateTotalAmount(pricePerHour, duration) : 0;
    let balance = calculateBalance(totalAmount, amountPaid);
    let timeError = validateTimeSlot(watchedStartDate, startTime, watchedEndDate, endTime);
    

    // const pricePerHour = manualPricePerHour || (turf ? turf.pricePerHour : 0);

    if (isRecurring) {
      timeError = validateTimeSlotRecurrance(startTime, endTime);
       
      let occurrences = 0;
      let currentDate = new Date(watchedStartDate);
      const endDate = new Date(watchedEndDate);
      let totalHours
      let totalRecurringAmount = 0
      let totalRecurringBalance = 0

      while (currentDate <= endDate) {
        const shouldCount =
          watchedRecurringFrequency === 'daily' ||
          (watchedRecurringFrequency === 'weekly' &&
            currentDate.getDay() === watchedStartDate.getDay()) ||
          (watchedRecurringFrequency === 'monthly' &&
            currentDate.getDate() === watchedStartDate.getDate());

        if (shouldCount) {
          occurrences++;
        }

        // ⏱️ HOURS CALCULATION (NEW)
        const [startHour, startMin] = startTime.split(':').map(Number);
        const [endHour, endMin] = endTime.split(':').map(Number);

        const minutesPerOccurrence =
          endHour * 60 + endMin - (startHour * 60 + startMin);

        const hoursPerOccurrence = Math.max(0, minutesPerOccurrence / 60);
        totalHours = hoursPerOccurrence * occurrences;
 

        // Move forward
        if (watchedRecurringFrequency === 'daily') {
          currentDate.setDate(currentDate.getDate() + 1);
        } else if (watchedRecurringFrequency === 'weekly') {
          currentDate.setDate(currentDate.getDate() + 7);
        } else {
          currentDate.setMonth(currentDate.getMonth() + 1);
        }
      }

      totalRecurringAmount = pricePerHour * totalHours;
      totalRecurringBalance = Math.max(
        0,
        totalRecurringAmount - amountPaid
      );

      duration = totalHours
      totalAmount = totalRecurringAmount
      balance = totalRecurringBalance

     

    }

    return {
      duration,
      totalAmount,
      balance,
      timeError,
      // pricePerHour: turf?.pricePerHour || 0,
      pricePerHour
    };
  },
    [turf,
      startTime,
      endTime,
      watchedStartDate,
      watchedEndDate,
      amountPaid,
      manualPricePerHour,
      isRecurring,
      watchedRecurringFrequency
    ]);
}
