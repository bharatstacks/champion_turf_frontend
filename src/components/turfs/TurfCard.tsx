import { Turf } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { MapPin, Edit, Trash2, IndianRupee } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface TurfCardProps {
  turf: Turf;
  onEdit: (turf: Turf) => void;
}

export function TurfCard({ turf, onEdit }: TurfCardProps) {
  const { deleteTurf, bookings } = useApp();
  
  const turfBookings = bookings?.filter((b) => b.turfId === turf.id);
  const activeBookings = turfBookings?.filter((b) => b.status !== 'cancelled').length;

  return (
    <div className="group relative overflow-hidden rounded-xl border border-border bg-card transition-all duration-300 hover:border-primary/30 hover:glow-sm">
      {/* Color bar */}
      <div
        className="h-2 w-full"
        style={{ backgroundColor: turf.color }}
      />
      
      <div className="p-6">
        <div className="mb-4 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div
              className="flex h-12 w-12 items-center justify-center rounded-lg"
              style={{ backgroundColor: `${turf.color}20` }}
            >
              <MapPin className="h-6 w-6" style={{ color: turf.color }} />
            </div>
            <div>
              <h3 className="font-semibold text-foreground">{turf.name}</h3>
              <Badge variant={turf.isActive ? 'default' : 'secondary'} className="mt-1">
                {turf.isActive ? 'Active' : 'Inactive'}
              </Badge>
            </div>
          </div>
          
          <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => onEdit(turf)}
            >
              <Edit className="h-4 w-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete {turf.name}?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete this turf and all {activeBookings} associated bookings.
                    This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => deleteTurf(turf._id)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>

        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {turf.description}
        </p>

        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-1 text-foreground">
            <IndianRupee className="h-4 w-4" />
            <span className="font-semibold">{turf.pricePerHour}</span>
            <span className="text-sm text-muted-foreground">/hour</span>
          </div>
          <span className="text-sm text-muted-foreground">
            {activeBookings} bookings
          </span>
        </div>
      </div>
    </div>
  );
}
