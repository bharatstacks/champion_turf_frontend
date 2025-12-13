// import { useState, useMemo } from 'react';
// import {
//   format,
//   startOfMonth,
//   endOfMonth,
//   eachDayOfInterval,
//   isSameMonth,
//   isSameDay,
//   isToday,
//   addMonths,
//   subMonths,
//   startOfWeek,
//   endOfWeek,
// } from 'date-fns';
// import { useApp } from '@/contexts/AppContext';
// import { Booking, Turf } from '@/types';
// import { ChevronLeft, ChevronRight, Clock, User, Phone, IndianRupee } from 'lucide-react';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   HoverCard,
//   HoverCardContent,
//   HoverCardTrigger,
// } from '@/components/ui/hover-card';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { cn } from '@/lib/utils';

// interface BookingCalendarProps {
//   onDateClick?: (date: Date) => void;
//   onBookingClick?: (booking: Booking) => void;
// }

// export function BookingCalendar({ onDateClick, onBookingClick }: BookingCalendarProps) {
//   const { bookings, turfs } = useApp();
//   const [currentDate, setCurrentDate] = useState(new Date());
//   const [selectedTurfId, setSelectedTurfId] = useState<string>('all');

//   const monthStart = startOfMonth(currentDate);
//   const monthEnd = endOfMonth(currentDate);
//   const calendarStart = startOfWeek(monthStart);
//   const calendarEnd = endOfWeek(monthEnd);

//   const days = useMemo(
//     () => eachDayOfInterval({ start: calendarStart, end: calendarEnd }),
//     [calendarStart, calendarEnd]
//   );

//   const filteredBookings = useMemo(() => {
//     return bookings.filter((booking) =>
//       selectedTurfId === 'all' ? true : booking.turfId === selectedTurfId
//     );
//   }, [bookings, selectedTurfId]);

//   const getBookingsForDay = (date: Date) => {
//     return filteredBookings.filter((booking) =>
//       isSameDay(new Date(booking.date), date)
//     );
//   };

//   const getTurf = (turfId: string): Turf | undefined => {
//     return turfs.find((t) => t.id === turfId);
//   };

//   const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
//   const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));

//   return (
//     <div className="rounded-xl border border-border bg-card">
//       {/* Header */}
//       <div className="flex items-center justify-between border-b border-border p-4">
//         <div className="flex items-center gap-4">
//           <div className="flex items-center gap-2">
//             <Button variant="outline" size="icon" onClick={prevMonth}>
//               <ChevronLeft className="h-4 w-4" />
//             </Button>
//             <h2 className="min-w-[180px] text-center text-lg font-semibold">
//               {format(currentDate, 'MMMM yyyy')}
//             </h2>
//             <Button variant="outline" size="icon" onClick={nextMonth}>
//               <ChevronRight className="h-4 w-4" />
//             </Button>
//           </div>
//           <Button
//             variant="ghost"
//             size="sm"
//             onClick={() => setCurrentDate(new Date())}
//           >
//             Today
//           </Button>
//         </div>

//         <Select value={selectedTurfId} onValueChange={setSelectedTurfId}>
//           <SelectTrigger className="w-[180px]">
//             <SelectValue placeholder="All Turfs" />
//           </SelectTrigger>
//           <SelectContent>
//             <SelectItem value="all">All Turfs</SelectItem>
//             {turfs.map((turf) => (
//               <SelectItem key={turf.id} value={turf.id}>
//                 <div className="flex items-center gap-2">
//                   <div
//                     className="h-3 w-3 rounded-full"
//                     style={{ backgroundColor: turf.color }}
//                   />
//                   {turf.name}
//                 </div>
//               </SelectItem>
//             ))}
//           </SelectContent>
//         </Select>
//       </div>

//       {/* Day headers */}
//       <div className="grid grid-cols-7 border-b border-border">
//         {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
//           <div
//             key={day}
//             className="px-2 py-3 text-center text-sm font-medium text-muted-foreground"
//           >
//             {day}
//           </div>
//         ))}
//       </div>

//       {/* Calendar grid */}
//       <div className="grid grid-cols-7">
//         {days.map((day, idx) => {
//           const dayBookings = getBookingsForDay(day);
//           const isCurrentMonth = isSameMonth(day, currentDate);
//           const isCurrentDay = isToday(day);

//           return (
//             <div
//               key={idx}
//               className={cn(
//                 'min-h-[120px] border-b border-r border-border p-2 transition-colors hover:bg-muted/30 cursor-pointer',
//                 !isCurrentMonth && 'bg-muted/20',
//                 idx % 7 === 6 && 'border-r-0'
//               )}
//               onClick={() => onDateClick?.(day)}
//             >
//               <div
//                 className={cn(
//                   'mb-2 flex h-7 w-7 items-center justify-center rounded-full text-sm',
//                   isCurrentDay && 'bg-primary text-primary-foreground font-semibold',
//                   !isCurrentDay && !isCurrentMonth && 'text-muted-foreground'
//                 )}
//               >
//                 {format(day, 'd')}
//               </div>

//               <div className="space-y-1">
//                 {dayBookings.slice(0, 3).map((booking) => {
//                   const turf = getTurf(booking.turfId);
//                   return (
//                     <HoverCard key={booking.id} openDelay={100} closeDelay={50}>
//                       <HoverCardTrigger asChild>
//                         <button
//                           className="w-full text-left"
//                           onClick={(e) => {
//                             e.stopPropagation();
//                             onBookingClick?.(booking);
//                           }}
//                         >
//                           <div
//                             className="flex items-center gap-1 rounded px-1.5 py-0.5 text-xs font-medium text-white transition-opacity hover:opacity-80"
//                             style={{ backgroundColor: turf?.color || '#666' }}
//                           >
//                             <span className="truncate">{booking.startTime}</span>
//                             <span className="truncate flex-1">{booking.customerName.split(' ')[0]}</span>
//                           </div>
//                         </button>
//                       </HoverCardTrigger>
//                       <HoverCardContent
//                         className="w-72"
//                         side="right"
//                         align="start"
//                       >
//                         <div className="space-y-3">
//                           <div className="flex items-center justify-between">
//                             <div className="flex items-center gap-2">
//                               <div
//                                 className="h-3 w-3 rounded-full"
//                                 style={{ backgroundColor: turf?.color }}
//                               />
//                               <span className="font-medium">{turf?.name}</span>
//                             </div>
//                             <Badge
//                               variant={
//                                 booking.status === 'confirmed'
//                                   ? 'default'
//                                   : booking.status === 'pending'
//                                   ? 'secondary'
//                                   : 'destructive'
//                               }
//                               className={cn(
//                                 booking.status === 'confirmed' && 'bg-turf-green'
//                               )}
//                             >
//                               {booking.status}
//                             </Badge>
//                           </div>

//                           <div className="space-y-2 text-sm">
//                             <div className="flex items-center gap-2">
//                               <User className="h-4 w-4 text-muted-foreground" />
//                               <span>{booking.customerName}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Phone className="h-4 w-4 text-muted-foreground" />
//                               <span>{booking.phoneNumber}</span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <Clock className="h-4 w-4 text-muted-foreground" />
//                               <span>
//                                 {booking.startTime} - {booking.endTime}
//                               </span>
//                             </div>
//                             <div className="flex items-center gap-2">
//                               <IndianRupee className="h-4 w-4 text-muted-foreground" />
//                               <span>
//                                 ₹{booking.amountPaid} paid
//                                 {booking.amountBalance > 0 && (
//                                   <span className="text-destructive">
//                                     {' '}
//                                     (₹{booking.amountBalance} pending)
//                                   </span>
//                                 )}
//                               </span>
//                             </div>
//                           </div>

//                           {booking.isRecurring && (
//                             <Badge variant="outline" className="text-xs">
//                               Recurring booking
//                             </Badge>
//                           )}
//                         </div>
//                       </HoverCardContent>
//                     </HoverCard>
//                   );
//                 })}
//                 {dayBookings.length > 3 && (
//                   <div className="text-xs text-muted-foreground pl-1">
//                     +{dayBookings.length - 3} more
//                   </div>
//                 )}
//               </div>
//             </div>
//           );
//         })}
//       </div>
//     </div>
//   );
// }



// src/components/bookings/BookingCalendar.tsx
import React, { useMemo, useState } from 'react';
import {
  format,
  startOfWeek,
  addDays,
  isSameDay,
  startOfDay,
  startOfMonth,
  endOfMonth,
} from 'date-fns';
import { Booking } from '@/types';
import { useApp } from '@/contexts/AppContext';

type ViewMode = 'day' | 'week' | 'month';

type BookingCalendarProps = {
  onDateClick: (date: Date) => void;
  onBookingClick: (booking: Booking) => void;
  viewMode: ViewMode;
  turfFilter: string;      // "all" or turfId
  turfTypeFilter: string;  // "all" or turf type
};

const HOURS = Array.from({ length: 24 }, (_, i) => i);
const TOTAL_MINUTES = 24 * 60;

type LaidOutBooking = {
  booking: Booking;
  startMin: number;
  endMin: number;
  lane: number;
  laneCount: number;
};

// Given bookings for ONE day, assign each to a "lane"
// so overlapping bookings are side-by-side instead of on top of each other.
const layoutBookingsForDay = (bookings: Booking[]): LaidOutBooking[] => {
  const sorted = [...bookings].sort((a, b) => {
    const aStart = timeStringToMinutes(a.startTime);
    const bStart = timeStringToMinutes(b.startTime);
    if (aStart !== bStart) return aStart - bStart;
    const aEnd = timeStringToMinutes(a.endTime);
    const bEnd = timeStringToMinutes(b.endTime);
    return aEnd - bEnd;
  });

  const lanes: { endMin: number }[] = [];
  const placed: LaidOutBooking[] = [];

  sorted.forEach((booking) => {
    const startMin = timeStringToMinutes(booking.startTime);
    const endMin = timeStringToMinutes(booking.endTime);

    // find first lane where this booking doesn't overlap
    let laneIndex = lanes.findIndex((lane) => lane.endMin <= startMin);
    if (laneIndex === -1) {
      laneIndex = lanes.length;
      lanes.push({ endMin });
    } else {
      lanes[laneIndex].endMin = endMin;
    }

    placed.push({
      booking,
      startMin,
      endMin,
      lane: laneIndex,
      laneCount: 0, // fill later
    });
  });

  const laneCount = Math.max(1, lanes.length);
  return placed.map((p) => ({ ...p, laneCount }));
};


const timeStringToMinutes = (time: string): number => {
  if (!time) return 0;
  const [hStr, mStr] = time.split(':');
  const h = Number(hStr) || 0;
  const m = Number(mStr) || 0;
  return h * 60 + m;
};

export const BookingCalendar: React.FC<BookingCalendarProps> = ({
  onDateClick,
  onBookingClick,
  viewMode,
  turfFilter,
  turfTypeFilter,
}) => {
  const { bookings, turfs } = useApp();

  const [currentDay, setCurrentDay] = useState<Date>(new Date());

  // ----- FILTER BY TURF + TURF TYPE -----
  const filteredBookings = useMemo(() => {
    return bookings.filter((b) => {
      const turf = turfs.find((t) => t._id === b.turfId);

      const turfMatch = turfFilter === 'all' || b.turfId === turfFilter;

      const typeMatch =
        turfTypeFilter === 'all' ||
        (turf && turf.name === turfTypeFilter); // change turf.type if your field is different

      return turfMatch && typeMatch;
    });
  }, [bookings, turfs, turfFilter, turfTypeFilter]);

  // ====== DAY VIEW ======
  const dayView = () => {
    const dayBookings = filteredBookings.filter((b) =>
      isSameDay(new Date(b.date), currentDay)
    );


    

    const handleBackgroundClick = (e: React.MouseEvent<HTMLDivElement>) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const minutes = (clickY / rect.height) * TOTAL_MINUTES;

      const clickedDate = startOfDay(currentDay);
      clickedDate.setMinutes(minutes);
      onDateClick(clickedDate);
    };

    return (
      <>
        {/* Date header */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentDay(addDays(currentDay, -1))}
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setCurrentDay(addDays(currentDay, 1))}
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &gt;
            </button>
            <div className="font-medium">
              {format(currentDay, 'EEE, dd MMM yyyy')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentDay(new Date())}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          >
            Today
          </button>
        </div>

        {/* Time grid */}
        <div className="relative flex border rounded-lg overflow-hidden h-[900px] bg-background">
          {/* Time labels */}
          <div className="w-16 border-r text-xs text-muted-foreground h-full">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: `${100 / 24}%` }}
              >
                <div className="absolute -top-2 right-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>
            ))}
          </div>

          {/* Column */}
          <div
            className="flex-1 relative cursor-pointer"
            onClick={handleBackgroundClick}
          >
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-dashed border-muted"
                style={{ top: `${(hour / 24) * 100}%` }}
              />
            ))}

            {dayBookings.map((booking) => {
              const startMin = timeStringToMinutes(booking.startTime);
              const endMin = timeStringToMinutes(booking.endTime);
              const top = (startMin / TOTAL_MINUTES) * 100;
              const height = ((endMin - startMin) / TOTAL_MINUTES) * 100;
              const turf = turfs.find((t) => t._id === booking.turfId);

              return (
                <button
                  key={booking.id}
                  type="button"
                  className="absolute left-2 right-2 rounded-md border shadow-sm text-xs text-left px-2 py-1 overflow-hidden hover:shadow-md bg-primary/10"
                  style={{
                    top: `${top}%`,
                    height: `${Math.max(height, 4)}%`,
                  }}
                  onClick={(ev) => {
                    ev.stopPropagation();
                    onBookingClick(booking);
                  }}
                >
                  <div className="font-semibold truncate">
                    {booking.customerName}
                  </div>
                  {turf && (
                    <div className="text-[10px] truncate">{turf.name}</div>
                  )}
                  <div className="text-[10px] text-muted-foreground">
                    {booking.startTime} – {booking.endTime}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </>
    );
  };

  // ====== WEEK VIEW ======
  const weekView = () => {
    const weekStart = startOfWeek(currentDay, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

    const bookingsByDay: Record<number, Booking[]> = {};
    weekDays.forEach((_, i) => (bookingsByDay[i] = []));

    filteredBookings.forEach((b) => {
      const d = new Date(b.date);
      weekDays.forEach((day, idx) => {
        if (isSameDay(d, day)) bookingsByDay[idx].push(b);
      });
    });

    Object.values(bookingsByDay).forEach((arr) =>
      arr.sort(
        (a, b) =>
          timeStringToMinutes(a.startTime) - timeStringToMinutes(b.startTime)
      )
    );

    const handleBackgroundClick = (
      e: React.MouseEvent<HTMLDivElement>,
      day: Date
    ) => {
      const rect = e.currentTarget.getBoundingClientRect();
      const clickY = e.clientY - rect.top;
      const minutes = (clickY / rect.height) * TOTAL_MINUTES;

      const clickedDate = startOfDay(day);
      clickedDate.setMinutes(minutes);
      onDateClick(clickedDate);
    };

    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setCurrentDay(addDays(currentDay, -7))}
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() => setCurrentDay(addDays(currentDay, 7))}
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &gt;
            </button>
            <div className="font-medium">
              {format(weekDays[0], 'dd MMM')} -{' '}
              {format(weekDays[6], 'dd MMM, yyyy')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentDay(new Date())}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          >
            Today
          </button>
        </div>

        {/* day headers */}
        <div className="ml-16 grid grid-cols-7 border-b text-xs text-muted-foreground">
          {weekDays.map((day, idx) => (
            <div
              key={idx}
              className="py-2 text-center border-l first:border-l-0 border-muted"
            >
              <div className="font-medium">{format(day, 'EEE')}</div>
              <div>{format(day, 'dd')}</div>
            </div>
          ))}
        </div>

        <div className="relative flex border rounded-lg overflow-hidden h-[900px] bg-background">
          {/* time labels */}
          <div className="w-16 border-r text-xs text-muted-foreground h-full">
            {HOURS.map((hour) => (
              <div
                key={hour}
                className="relative"
                style={{ height: `${100 / 24}%` }}
              >
                <div className="absolute -top-2 right-1">
                  {hour.toString().padStart(2, '0')}:00
                </div>
              </div>
            ))}
          </div>

          {/* columns */}
          <div className="flex-1 grid grid-cols-7 h-full">
            {weekDays.map((day, dayIndex) => (
              <div
                key={dayIndex}
                className="relative border-l border-muted cursor-pointer"
                onClick={(e) => handleBackgroundClick(e, day)}
              >
                {HOURS.map((hour) => (
                  <div
                    key={hour}
                    className="absolute left-0 right-0 border-t border-dashed border-muted"
                    style={{ top: `${(hour / 24) * 100}%` }}
                  />
                ))}

                {bookingsByDay[dayIndex]?.map((booking) => {
                  const startMin = timeStringToMinutes(booking.startTime);
                  const endMin = timeStringToMinutes(booking.endTime);
                  const top = (startMin / TOTAL_MINUTES) * 100;
                  const height =
                    ((endMin - startMin) / TOTAL_MINUTES) * 100;
                  const turf = turfs.find((t) => t._id === booking.turfId);

                  const amount = booking.totalAmount ?? 0;
const paid = booking.amountPaid ?? 0;
const balance = amount - paid;


                  return (
                    <button
                      key={booking.id}
                      type="button"
                      className="absolute left-1 right-1 rounded-md border shadow-sm text-[10px] text-left px-1 py-0.5 overflow-hidden hover:shadow-md bg-primary/10"
                      style={{
                        top: `${top}%`,
                        height: `${Math.max(height, 4)}%`,
                      }}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        onBookingClick(booking);
                      }}
                    >
                      <div className="font-semibold truncate">
                        {booking.customerName}
                      </div>
                      {turf && (
                        <div className="truncate text-[10px]">
                          {turf.name}
                        </div>
                      )}
                      <div className="text-[9px] text-muted-foreground">
                        {booking.startTime} – {booking.endTime}
                      </div>
                      <div className="text-[9px] flex justify-between">
    <span>₹{paid}/{amount}</span>
    <span
      className={
        balance > 0 ? 'text-red-500 font-medium' : 'text-green-600 font-medium'
      }
    >
      {balance > 0 ? `Bal ₹${balance}` : 'Paid'}
    </span>
  </div>
                    </button>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  // ====== MONTH VIEW (simple grid, no time slots) ======
  const monthView = () => {
    const monthStart = startOfMonth(currentDay);
    const monthEnd = endOfMonth(currentDay);

    // calendar grid start (Monday of first week)
    const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const days: Date[] = [];
    while (days.length === 0 || days[days.length - 1] <= monthEnd || days.length < 35) {
      days.push(addDays(gridStart, days.length));
    }

    return (
      <>
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() =>
                setCurrentDay(addDays(monthStart, -1)) // previous month
              }
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &lt;
            </button>
            <button
              type="button"
              onClick={() =>
                setCurrentDay(addDays(monthEnd, 1)) // next month
              }
              className="rounded-md border px-2 py-1 text-sm hover:bg-muted"
            >
              &gt;
            </button>
            <div className="font-medium">
              {format(currentDay, 'MMMM yyyy')}
            </div>
          </div>
          <button
            type="button"
            onClick={() => setCurrentDay(new Date())}
            className="rounded-md border px-3 py-1 text-sm hover:bg-muted"
          >
            Today
          </button>
        </div>

        <div className="grid grid-cols-7 border rounded-lg overflow-hidden bg-background">
          {/* weekday headers */}
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((d) => (
            <div
              key={d}
              className="border-b border-r p-2 text-xs font-medium text-center text-muted-foreground bg-muted/50 last:border-r-0"
            >
              {d}
            </div>
          ))}

          {/* days */}
          {days.map((day, idx) => {
            const isCurrentMonth = day.getMonth() === currentDay.getMonth();
            const dayBookings = filteredBookings.filter((b) =>
              isSameDay(new Date(b.date), day)
            );

            return (
              <div
                key={idx}
                className="border-r border-b p-1 text-xs min-h-[90px] cursor-pointer last:border-r-0"
                onClick={() => onDateClick(startOfDay(day))}
              >
                <div
                  className={`mb-1 flex items-center justify-between ${
                    isCurrentMonth ? 'text-foreground' : 'text-muted-foreground/60'
                  }`}
                >
                  <span>{format(day, 'd')}</span>
                  {dayBookings.length > 0 && (
                    <span className="text-[10px] rounded-full px-1 bg-primary/10">
                      {dayBookings.length}
                    </span>
                  )}
                </div>

                {/* few bookings summary */}
                <div className="space-y-0.5">
                  {dayBookings.slice(0, 3).map((booking) => {
                    const turf = turfs.find((t) => t._id === booking.turfId);
                    return (
                      <div
                        key={booking.id}
                        className="text-[10px] rounded px-1 py-0.5 bg-primary/5 hover:bg-primary/10 overflow-hidden"
                        onClick={(e) => {
                          e.stopPropagation();
                          onBookingClick(booking);
                        }}
                      >
                        <div className="truncate font-medium">
                          {booking.startTime} – {booking.endTime}
                        </div>
                        <div className="truncate">
                          {booking.customerName}
                          {turf ? ` · ${turf.name}` : ''}
                        </div>
                      </div>
                    );
                  })}
                  {dayBookings.length > 3 && (
                    <div className="text-[10px] text-muted-foreground">
                      +{dayBookings.length - 3} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </>
    );
  };

  // ====== RENDER BY VIEW MODE ======
  if (viewMode === 'day') return dayView();
  if (viewMode === 'week') return weekView();
  return monthView();
};
