import { Link } from 'react-router-dom';
import { CalendarPlus, MapPin, Calendar, ArrowRight } from 'lucide-react';
import { cn } from '@/lib/utils';

const actions = [
  {
    to: '/bookings?new=true',
    icon: CalendarPlus,
    label: 'New Booking',
    description: 'Schedule a new booking',
    color: 'from-turf-green/20 to-turf-green/5',
    iconColor: 'text-turf-green',
  },
  {
    to: '/turfs?new=true',
    icon: MapPin,
    label: 'Add Turf',
    description: 'Create a new turf',
    color: 'from-turf-blue/20 to-turf-blue/5',
    iconColor: 'text-turf-blue',
  },
  {
    to: '/calendar',
    icon: Calendar,
    label: 'View Calendar',
    description: 'See all bookings',
    color: 'from-turf-orange/20 to-turf-orange/5',
    iconColor: 'text-turf-orange',
  },
];

export function QuickActions() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <h3 className="mb-4 text-lg font-semibold text-foreground">Quick Actions</h3>
      
      <div className="space-y-3">
        {actions.map((action, index) => (
          <Link
            key={action.to}
            to={action.to}
            className={cn(
              'group flex items-center gap-4 rounded-lg p-3 transition-all duration-200 hover:bg-muted/50 animate-fade-in opacity-0',
              `stagger-${index + 1}`
            )}
          >
            <div
              className={cn(
                'flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br',
                action.color
              )}
            >
              <action.icon className={cn('h-5 w-5', action.iconColor)} />
            </div>
            
            <div className="flex-1">
              <p className="font-medium text-foreground">{action.label}</p>
              <p className="text-sm text-muted-foreground">{action.description}</p>
            </div>

            <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
          </Link>
        ))}
      </div>
    </div>
  );
}
