import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Turf, Booking } from '@/types';
import { mockTurfs, mockBookings } from '@/data/mockData';
import { addWeeks, addMonths, addDays, isBefore, startOfDay } from 'date-fns';
import { post } from '../utils/apiUtil'; // Import the post method from apiUtil
import { get } from '../utils/apiUtil';

interface AppContextType {
  turfs: Turf[];
  bookings: Booking[];
  addTurf: (turf: Omit<Turf, 'id' | 'createdAt'>) => void;
  updateTurf: (id: string, turf: Partial<Turf>) => void;
  deleteTurf: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => void;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  deleteRecurringGroup: (groupId: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [turfs, setTurfs] = useState<Turf[]>();
  const [bookings, setBookings] = useState<Booking[]>(mockBookings);


  useEffect(() => {

    getTurfList()
    
  }, []);

  const getTurfList = async () => {
      try {
      const response = await get<any>('turf/'); // Use post utility function
      console.log('Booking created successfully:', response);
      
      setTurfs(response?.turfs)
      // Handle success (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (e.g., show error message)
    }
  }

  // ✅ UNIVERSAL ID GENERATOR
  const generateId = () =>
    (typeof crypto !== 'undefined' && crypto.randomUUID)
      ? crypto.randomUUID()
      : Math.random().toString(36).substring(2) + Date.now().toString(36);

  // ---------- TURF CRUD ----------
  const addTurf = async (turf: Omit<Turf, 'id' | 'createdAt'>) => {
    const newTurf: Turf = {
      ...turf,
      id: generateId(), // FIXED
      createdAt: new Date(),
    };
    try {
      const response = await post<any>('turf/', newTurf); // Use post utility function
      console.log('Booking created successfully:', response);
      // Handle success (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (e.g., show error message)
    }

    setTurfs((prev) => [...prev, newTurf]);
  };

  const updateTurf = (id: string, updates: Partial<Turf>) => {
    setTurfs((prev) =>
      prev.map((turf) => (turf.id === id ? { ...turf, ...updates } : turf))
    );
  };

  const deleteTurf = (id: string) => {
    setTurfs((prev) => prev.filter((turf) => turf.id !== id));
    setBookings((prev) => prev.filter((booking) => booking.turfId !== id));
  };

  // ---------- BOOKING CRUD ----------
  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {
    if (booking.isRecurring && booking.recurringPattern) {

      const recurringGroupId = generateId(); // FIXED

      const generatedBookings: Booking[] = [];
      let currentDate = startOfDay(new Date(booking.date));
      const endDate = startOfDay(new Date(booking.recurringPattern.endDate));

      while (isBefore(currentDate, endDate) || currentDate.getTime() === endDate.getTime()) {
        const shouldAdd =
          booking.recurringPattern.frequency === 'daily' ||
          (booking.recurringPattern.frequency === 'weekly' &&
            currentDate.getDay() === booking.recurringPattern.dayOfWeek) ||
          (booking.recurringPattern.frequency === 'monthly' &&
            currentDate.getDate() === new Date(booking.date).getDate());

        if (shouldAdd) {
          generatedBookings.push({
            ...booking,
            id: generateId(), // FIXED
            date: new Date(currentDate),
            recurringGroupId,
            createdAt: new Date(),
          });
        }

        currentDate =
          booking.recurringPattern.frequency === 'daily'
            ? addDays(currentDate, 1)
            : booking.recurringPattern.frequency === 'weekly'
              ? addDays(currentDate, 1)
              : addMonths(currentDate, 1);
      }

      setBookings((prev) => [...prev, ...generatedBookings]);

    } else {
      const newBooking: Booking = {
        ...booking,
        id: generateId(), // FIXED
        createdAt: new Date(),
      };

      try {
        const response = await post<Booking>('booking/', newBooking); // Use post utility function
        console.log('Booking created successfully:', response);
        // Handle success (e.g., show success message, redirect, etc.)
      } catch (error) {
        console.error('Error creating booking:', error);
        // Handle error (e.g., show error message)
      }

      setBookings((prev) => [...prev, newBooking]);
    }
  };

  const updateBooking = (id: string, updates: Partial<Booking>) => {
    setBookings((prev) =>
      prev.map((booking) =>
        booking.id === id ? { ...booking, ...updates } : booking
      )
    );
  };

  const deleteBooking = (id: string) => {
    setBookings((prev) => prev.filter((booking) => booking.id !== id));
  };

  const deleteRecurringGroup = (groupId: string) => {
    setBookings((prev) =>
      prev.filter((booking) => booking.recurringGroupId !== groupId)
    );
  };

  return (
    <AppContext.Provider
      value={{
        turfs,
        bookings,
        addTurf,
        updateTurf,
        deleteTurf,
        addBooking,
        updateBooking,
        deleteBooking,
        deleteRecurringGroup,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
}

