import { useApp } from '@/contexts/AppContext';
import { format, isToday } from 'date-fns';
import { Clock, User, Phone, MapPin } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export function TodaysBookings() {
  const { bookings, turfs } = useApp();

  const todaysBookings = bookings
    .filter((booking) => isToday(new Date(booking.date)))
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const getTurf = (turfId: string) => turfs?.find((t) => t.id === turfId);

  return (
    <div className="rounded-xl border border-border bg-card">
      <div className="border-b border-border px-6 py-4">
        <h3 className="text-lg font-semibold text-foreground">Today's Bookings</h3>
        <p className="text-sm text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      <div className="divide-y divide-border">
        {todaysBookings.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No bookings today</p>
            <p className="text-xs text-muted-foreground/70">Schedule some activities!</p>
          </div>
        ) : (
          todaysBookings.map((booking, index) => {
            const turf = getTurf(booking.turfId);
            return (
              <div
                key={booking.id}
                className={cn(
                  'flex items-center gap-4 px-6 py-4 transition-colors hover:bg-muted/50 animate-fade-in opacity-0',
                  `stagger-${Math.min(index + 1, 5)}`
                )}
              >
                <div
                  className="h-12 w-1 rounded-full"
                  style={{ backgroundColor: turf?.color }}
                />
                
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    <User className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium text-foreground">{booking.customerName}</span>
                    {booking.isRecurring && (
                      <Badge variant="secondary" className="text-xs">
                        Recurring
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {booking.startTime} - {booking.endTime}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {turf?.name}
                    </span>
                  </div>
                </div>

                <div className="text-right">
                  <Badge
                    variant={
                      booking.status === 'confirmed'
                        ? 'default'
                        : booking.status === 'pending'
                        ? 'secondary'
                        : 'destructive'
                    }
                    className={cn(
                      booking.status === 'confirmed' && 'bg-turf-green hover:bg-turf-green/90'
                    )}
                  >
                    {booking.status}
                  </Badge>
                  {booking.amountBalance > 0 && (
                    <p className="mt-1 text-xs text-destructive">
                      ₹{booking.amountBalance} pending
                    </p>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
