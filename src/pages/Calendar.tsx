
// src/pages/Calendar.tsx
import { useState } from 'react';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookingCalendar } from '@/components/bookings/BookingCalendar';
import { Booking } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { BookingForm } from '@/components/bookings/BookingForm';

type ViewMode = 'day' | 'week' | 'month';

const Calendar = () => {
  const { turfs } = useApp();

  const [formOpen, setFormOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>();
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [viewMode, setViewMode] = useState<ViewMode>('week');
  const [turfFilter, setTurfFilter] = useState<string>('all');      // turf id or "all"
  const [turfTypeFilter, setTurfTypeFilter] = useState<string>('all'); // turf.type or "all"

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setEditingBooking(null);
    setFormOpen(true);
  };

  const handleBookingClick = (booking: Booking) => {
    setEditingBooking(booking);
    setSelectedDate(undefined);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    // setSelectedDate(undefined);
    // setEditingBooking(null);
    if (!open) {
    setSelectedDate(undefined);
    setEditingBooking(null);
  }
  };

  // collect unique turf types from your turfs list
  const turfTypes = Array.from(
    new Set(turfs?.map((t) => t.name).filter(Boolean))   // if your field name is different, change t.type
  ) as string[];

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header + Filters */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between animate-fade-in opacity-0">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Calendar</h1>
            <p className="text-muted-foreground">
              View and manage all bookings across your turfs.
            </p>
          </div>

          <div className="flex flex-wrap gap-2 items-center">
            {/* View filter: Day / Week / Month */}
            <Select value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="View" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Day</SelectItem>
                <SelectItem value="week">Week</SelectItem>
                <SelectItem value="month">Month</SelectItem>
              </SelectContent>
            </Select>

            {/* Turf filter: all turfs or specific turf */}
            <Select value={turfFilter} onValueChange={setTurfFilter}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Turf" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Turfs</SelectItem>
                {turfs?.map((turf) => (
                  <SelectItem key={turf._id} value={turf._id}>
                    {turf.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Turf type filter */}
            <Select
              value={turfTypeFilter}
              onValueChange={setTurfTypeFilter}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Turf Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                {turfTypes.map((type) => (
                  <SelectItem key={type} value={type}>
                    {type}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Calendar */}
        <div className="animate-fade-in opacity-0 stagger-1">
          <BookingCalendar
            onDateClick={handleDateClick}
            onBookingClick={handleBookingClick}
            viewMode={viewMode}
            turfFilter={turfFilter}
            turfTypeFilter={turfTypeFilter}
          />
        </div>

        <BookingForm
          open={formOpen}
          onOpenChange={handleClose}
          booking={editingBooking}
          selectedDate={selectedDate}
        />
      </div>
    </MainLayout>
  );
};

export default Calendar;

