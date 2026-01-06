import { useMemo } from 'react';
import { Turf, Booking } from '@/types';
import { format, isSameDay } from 'date-fns';

export function calculateDuration(startTime: string, endTime: string): number {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;
  return Math.max(0, (endMinutes - startMinutes) / 60);
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

export function validateTimeSlot(startTime: string, endTime: string): string | null {
  const [startHour, startMin] = startTime.split(':').map(Number);
  const [endHour, endMin] = endTime.split(':').map(Number);
  const startMinutes = startHour * 60 + startMin;
  const endMinutes = endHour * 60 + endMin;

  if (endMinutes <= startMinutes) {
    return 'End time must be after start time';
  }
  return null;
}

export function checkBookingOverlap(
  turfId: string,
  date: Date,
  startTime: string,
  endTime: string,
  existingBookings: Booking[],
  excludeBookingId?: string
): Booking | null {
  const [newStartHour, newStartMin] = startTime.split(':').map(Number);
  const [newEndHour, newEndMin] = endTime.split(':').map(Number);
  const newStartMinutes = newStartHour * 60 + newStartMin;
  const newEndMinutes = newEndHour * 60 + newEndMin;

  if(!existingBookings)
    existingBookings = []
  
  for (const booking of existingBookings) {
    if (booking.id === excludeBookingId) continue;
    if (booking.turfId !== turfId) continue;
    if (booking.status === 'cancelled') continue;
    if (!isSameDay(new Date(booking.date), date)) continue;

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
  amountPaid: number,
   manualPricePerHour: number
) {
  return useMemo(() => {
    const duration = calculateDuration(startTime, endTime);
    const pricePerHour =
    manualPricePerHour !== undefined
      ? manualPricePerHour
      : turf?.pricePerHour ?? 0;
    const totalAmount = turf ? calculateTotalAmount(pricePerHour, duration) : 0;
    const balance = calculateBalance(totalAmount, amountPaid);
    const timeError = validateTimeSlot(startTime, endTime);

    // const pricePerHour = manualPricePerHour || (turf ? turf.pricePerHour : 0);
  

    return {
      duration,
      totalAmount,
      balance,
      timeError,
      // pricePerHour: turf?.pricePerHour || 0,
      pricePerHour
    };
  }, [turf, startTime, endTime, amountPaid, manualPricePerHour ]);
}
