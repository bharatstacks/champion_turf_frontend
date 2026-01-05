import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { format } from 'date-fns';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { BookingForm } from '@/components/bookings/BookingForm';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Plus, Search, MoreHorizontal, Edit, Trash2, CalendarX } from 'lucide-react';
import { Booking } from '@/types';
import { cn } from '@/lib/utils';

const Bookings = () => {
  const { bookings, turfs, deleteBooking, deleteRecurringGroup } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bookingToDelete, setBookingToDelete] = useState<Booking | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [turfFilter, setTurfFilter] = useState<string>('all');
  const [recurringFilter, setRecurringFilter] = useState<boolean | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams,bookings?.length, bookings,turfs?.length, turfs]);

  const getTurf = (turfId: string) => turfs?.find((t) => t._id === turfId);

  const filteredBookings = bookings?.filter((booking) => {
      const matchesSearch =
        booking?.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        booking?.phoneNumber?.includes(searchTerm);
      const matchesStatus = statusFilter === 'all' || booking.status === statusFilter;
      const matchesTurf = turfFilter === 'all' || booking.turfId?.id === turfFilter;
      const matchesRecurring = recurringFilter === null || booking.isRecurring === recurringFilter;
      return matchesSearch && matchesStatus && matchesTurf && matchesRecurring;
    })
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingBooking(null);
  };

  const handleDeleteClick = (booking: Booking) => {
    setBookingToDelete(booking);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = (deleteAll: boolean) => {
    if (!bookingToDelete) return;

    if (deleteAll && bookingToDelete.recurringGroupId) {
      deleteRecurringGroup(bookingToDelete.recurringGroupId);
    } else {
      deleteBooking(bookingToDelete._id);
    }

    setDeleteDialogOpen(false);
    setBookingToDelete(null);
  };

  return (
    <MainLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in opacity-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Bookings</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage all your turf bookings in one place.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            New Booking
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 animate-fade-in opacity-0 stagger-1">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search by name or phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="confirmed">Confirmed</SelectItem>
              <SelectItem value="pending">Pending Payment</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
          <Select value={turfFilter} onValueChange={setTurfFilter}>
            <SelectTrigger className="w-full sm:w-[150px]">
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
          <Select 
            value={recurringFilter === null ? 'all' : recurringFilter ? 'recurring' : 'single'} 
            onValueChange={(v) => setRecurringFilter(v === 'all' ? null : v === 'recurring')}
          >
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="single">Single</SelectItem>
              <SelectItem value="recurring">Recurring</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="rounded-xl border border-border bg-card animate-fade-in opacity-0 stagger-2">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Turf</TableHead>
                <TableHead>Date & Time</TableHead>
                <TableHead>Payment</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredBookings?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="h-32 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <CalendarX className="mb-2 h-8 w-8 text-muted-foreground" />
                      <p className="text-muted-foreground">No bookings found</p>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                filteredBookings?.map((booking) => {
                  let turf = turfs?.find((t) => t._id == booking.turfId?._id);
                  if(turf === undefined){
                    turf = turfs?.find((t) => t._id == booking.turfId);
                  }
                  return (
                    <TableRow key={booking.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{booking.customerName}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.phoneNumber}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div
                            className="h-3 w-3 rounded-full"
                            style={{ backgroundColor: turf?.color }}
                          />
                          <span>{turf?.name  || 'Turf not found'}</span>
                          {booking.isRecurring && (
                            <Badge variant="outline" className="text-xs">
                              Recurring
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p>{format(new Date(booking.date), 'MMM d, yyyy')}</p>
                          <p className="text-sm text-muted-foreground">
                            {booking.startTime} - {booking.endTime}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <p className="text-xs text-muted-foreground">
                            Total: ₹{booking.totalAmount}
                          </p>
                          <p className="font-medium text-turf-green">₹{booking.amountPaid} paid</p>
                          {booking.amountBalance > 0 && (
                            <p className="text-sm text-destructive">
                              ₹{booking.amountBalance} pending
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            booking.status === 'confirmed'
                              ? 'default'
                              : booking.status === 'pending'
                              ? 'secondary'
                              : booking.status === 'completed'
                              ? 'outline'
                              : 'destructive'
                          }
                          className={cn(
                            booking.status === 'confirmed' && 'bg-turf-green hover:bg-turf-green/90',
                            booking.status === 'completed' && 'bg-blue-600 hover:bg-blue-600/90 text-white border-blue-600'
                          )}
                        >
                          {booking.status === 'pending' ? 'Pending Payment' : booking.status}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEdit(booking)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleDeleteClick(booking)}
                              className="text-destructive"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </div>

        <BookingForm
          open={formOpen}
          onOpenChange={handleClose}
          booking={editingBooking}
        />

        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Delete Booking</AlertDialogTitle>
              <AlertDialogDescription>
                {bookingToDelete?.isRecurring
                  ? 'This is a recurring booking. Do you want to delete just this booking or all bookings in the series?'
                  : 'Are you sure you want to delete this booking? This action cannot be undone.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              {bookingToDelete?.isRecurring ? (
                <>
                  <AlertDialogAction
                    onClick={() => handleDeleteConfirm(false)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete This Only
                  </AlertDialogAction>
                  <AlertDialogAction
                    onClick={() => handleDeleteConfirm(true)}
                    className="bg-destructive hover:bg-destructive/90"
                  >
                    Delete All
                  </AlertDialogAction>
                </>
              ) : (
                <AlertDialogAction
                  onClick={() => handleDeleteConfirm(false)}
                  className="bg-destructive hover:bg-destructive/90"
                >
                  Delete
                </AlertDialogAction>
              )}
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </MainLayout>
  );
};

export default Bookings;
