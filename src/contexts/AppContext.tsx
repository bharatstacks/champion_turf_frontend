import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Turf, Booking } from '@/types';
import { mockTurfs, mockBookings } from '@/data/mockData';
import { addWeeks, addMonths, addDays, isBefore, startOfDay } from 'date-fns';
import { get, post, put, del } from '../utils/apiUtil'; // Import the post method from apiUtil

interface AppContextType {
  turfs: Turf[];
  bookings: Booking[];
  addTurf: (turf: Omit<Turf, 'id' | 'createdAt'>) => void;
  updateTurf: (id: string, turf: Partial<Turf>) => void;
  deleteTurf: (id: string) => void;
  addBooking: (booking: Omit<Booking, 'id' | 'createdAt'>) => any;
  updateBooking: (id: string, booking: Partial<Booking>) => void;
  deleteBooking: (id: string) => void;
  deleteRecurringGroup: (groupId: string) => void;
  getBookingList: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [turfs, setTurfs] = useState<Turf[]>();
  const [bookings, setBookings] = useState<Booking[]>();
  const [tempBookings, setTempBookings] = useState<Booking[]>();


  useEffect(() => {
    getTurfList()
    getBookingList()
  }, [turfs?.length, bookings?.length]);

  const getTurfList = async () => {
    try {
      const response = await get<any>('turf/'); // Use post utility function
      console.log('Turf list fetched successfully:', response);

      setTurfs(response?.turfs)
      // Handle success (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (e.g., show error message)
    }
  }

  const getBookingList = async () => {
    try {
      const response = await get<any>('booking/'); // Use post utility function
      console.log('Booking list fetched successfully:', response);

      setBookings(response?.bookings)
      // Handle success (e.g., show success message, redirect, etc.)
    } catch (error) {
      console.error('Error creating booking:', error);
      // Handle error (e.g., show error message)
    }
  }

  const getBookingListForUpdate = async () => {
    try {
      const response = await get<any>('booking/'); // Use post utility function
      console.log('Booking list fetched for updates successfully:', response);

      setTempBookings(response?.bookings)
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

  const updateTurf = async (id: string, updates: Partial<Turf>) => {
    const response = await put<any>(`turf/${id}`, { ...updates, _id: id }); // Use post utility function
    console.log('Turf updated successfully:', response);
    setTurfs((prev) =>
      prev.map((turf) => (turf._id === id ? { ...turf, ...updates } : turf))
    );
  };

  const deleteTurf = async (id: string) => {
    const response = await del<any>(`turf/${id}`);
    console.log('Turf deleted successfully:', response);
    setTurfs((prev) => prev.filter((turf) => turf._id !== id));
    // setBookings((prev) => prev.filter((booking) => booking.turfId !== id));
  };

  // ---------- BOOKING CRUD ----------
  const addBooking = async (booking: Omit<Booking, 'id' | 'createdAt'>) => {

    const newBooking: Booking = {
      ...booking,
      id: generateId(), // FIXED
      createdAt: new Date(),
    };

    return await post<Booking>('booking/', newBooking); // Use post utility function

    // try {
    //   const response = await post<Booking>('booking/', newBooking); // Use post utility function
    //   console.log('Booking created successfully:', response);
    //   // Handle success (e.g., show success message, redirect, etc.)
    // } catch (error) {
    //   console.error('Error creating booking:', error);
    //   // Handle error (e.g., show error message)
    // }

    // setBookings((prev) => [...prev, newBooking]);
    // }
  };

  const updateBooking = async (id: string, updates: Partial<Booking>) => {
    try {
      const response = await put<any>(`booking/${id}`, { ...updates, _id: id });
      console.log('Booking updated successfully:', response);
      if (response.message == "Booking updated successfully") {
        getBookingList();
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      // Optionally, show an error toast or handle failure
    }
  };

  const deleteBooking = async (id: string) => {
    const response = await del<any>(`booking/${id}`);
    console.log('Booking deleted successfully:', response);
    if (response.message == "Booking deleted successfully") {
      getBookingList();
    }
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
        getBookingList,
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

