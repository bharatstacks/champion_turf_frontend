import { useEffect, useMemo, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { Booking } from '@/types';
import { useApp } from '@/contexts/AppContext';
import {
  useBookingCalculations,
  checkBookingOverlap,
  calculateDuration,
} from '@/hooks/useBookingCalculations';
import { CalendarIcon, Repeat, AlertTriangle, Calculator, Clock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

const bookingSchema = z.object({
  turfId: z.string().min(1, 'Please select a turf'),
  customerName: z.string().min(1, 'Name is required').max(100),
  phoneNumber: z.string().min(10, 'Enter a valid phone number').max(15),
  // date: z.date({ required_error: 'Date is required' }),

  startDate: z.date({ required_error: 'Start date is required' }),
  endDate: z.date({ required_error: 'End date is required' }),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  pricePerHour: z.number().min(0, 'Price must be >= 0'),
  amountPaid: z.number().min(0, 'Amount must be 0 or more'),
  isRecurring: z.boolean(),
  recurringFrequency: z.string().optional(),
  recurringEndDate: z.date().optional(),
  status: z.enum(['confirmed', 'pending', 'cancelled', 'completed']),
}).refine((data) => {
  const start = new Date(data.startDate);
  const [sh, sm] = data.startTime.split(':').map(Number);
  start.setHours(sh, sm, 0, 0);

  const end = new Date(data.endDate);
  const [eh, em] = data.endTime.split(':').map(Number);
  end.setHours(eh, em, 0, 0);

  return end > start;
}, {
  message: 'End date & time must be after start date & time',
  path: ['endTime'],
});

type BookingFormData = z.infer<typeof bookingSchema>;

const timeSlots = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minutes = i % 2 === 0 ? '00' : '30';
  return `${hour.toString().padStart(2, '0')}:${minutes}`;
});

interface BookingFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  booking?: Booking | null;
  selectedDate?: Date;
}

export function BookingForm({ open, onOpenChange, booking, selectedDate }: BookingFormProps) {
  const { addBooking, updateBooking, turfs, bookings, getBookingList } = useApp();

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      turfId: '',
      customerName: '',
      phoneNumber: '',
      startDate: selectedDate || new Date(),
      endDate: selectedDate || new Date(),
      startTime: '10:00',
      endTime: '11:00',
      pricePerHour: 0,
      amountPaid: 0,
      isRecurring: false,
      status: 'confirmed',
    },
  });

  const [startDateOpen, setStartDateOpen] = useState(false);
  const [endDateOpen, setEndDateOpen] = useState(false);
  const watchedTurfId = form.watch('turfId');
  const watchedStartTime = form.watch('startTime');
  const watchedEndTime = form.watch('endTime');
  const watchedAmountPaid = form.watch('amountPaid');
  // const watchedDate = form.watch('date');
  // const watchedStartDate = form.watch('startDate');
  const watchedStartDate = useWatch({
    control: form.control,
    name: 'startDate',
  });

  const watchedEndDate = form.watch('endDate');
  const isRecurring = form.watch('isRecurring');
  // const watchedRecurringEndDate = form.watch('recurringEndDate');
  const watchedRecurringFrequency = form.watch('recurringFrequency');


  const selectedTurf = useMemo(
    () => turfs?.find((t) => t._id === watchedTurfId),
    [turfs, watchedTurfId]
  );
  const watchedPricePerHour = form.watch('pricePerHour');


  const { duration, totalAmount, balance, timeError, pricePerHour } = useBookingCalculations(
    selectedTurf,
    watchedStartTime,
    watchedEndTime,
    watchedStartDate,
    watchedEndDate,
    watchedAmountPaid,
    watchedPricePerHour,
    isRecurring,
    watchedRecurringFrequency
  );

  // Calculate recurring booking totals
  // const recurringInfo = useMemo(() => {
  //   if (
  //     !isRecurring ||
  //     !watchedEndDate ||
  //     !watchedRecurringFrequency ||
  //     !watchedStartDate
  //   ) {
  //     return null;
  //   }

  //   let occurrences = 0;
  //   let currentDate = new Date(watchedStartDate);
  //   const endDate = new Date(watchedEndDate);

  //   while (currentDate <= endDate) {
  //     const shouldCount =
  //       watchedRecurringFrequency === 'daily' ||
  //       (watchedRecurringFrequency === 'weekly' &&
  //         currentDate.getDay() === watchedStartDate.getDay()) ||
  //       (watchedRecurringFrequency === 'monthly' &&
  //         currentDate.getDate() === watchedStartDate.getDate());

  //     if (shouldCount) {
  //       occurrences++;
  //     }

  //     // Move forward
  //     if (watchedRecurringFrequency === 'daily') {
  //       currentDate.setDate(currentDate.getDate() + 1);
  //     } else if (watchedRecurringFrequency === 'weekly') {
  //       currentDate.setDate(currentDate.getDate() + 7);
  //     } else {
  //       currentDate.setMonth(currentDate.getMonth() + 1);
  //     }
  //   }

  //   const totalRecurringAmount = totalAmount * occurrences;
  //   const totalRecurringBalance = Math.max(
  //     0,
  //     totalRecurringAmount - watchedAmountPaid
  //   );

  //   return {
  //     occurrences,
  //     totalRecurringAmount,
  //     totalRecurringBalance,
  //   };
  // }, [
  //   isRecurring,
  //   watchedEndDate,
  //   watchedRecurringFrequency,
  //   watchedStartDate,
  //   totalAmount,
  //   watchedAmountPaid,
  // ]);


  // Check for overlapping bookings
  const overlapWarning = useMemo(() => {
    if (!watchedTurfId || timeError) return null;

    return checkBookingOverlap(
      watchedTurfId,
      watchedStartDate,
      watchedStartTime,
      watchedEndDate,
      watchedEndTime,
      bookings,
      booking?.id
    );
  }, [
    watchedTurfId,
    watchedStartDate,
    watchedStartTime,
    watchedEndDate,
    watchedEndTime,
    bookings,
    booking?.id,
    timeError,
  ]);


  useEffect(() => {
    if (booking) {
      const turf = turfs.find((t) => t._id === booking.turfId);

      form.reset({
        turfId: booking.turfId?._id || '',
        customerName: booking.customerName,
        phoneNumber: booking.phoneNumber,
        startDate: new Date(booking.startDate),
        endDate: new Date(booking.endDate),
        startTime: booking.startTime,
        endTime: booking.endTime,
        pricePerHour:
          // if booking has custom price, use it
          (booking as any).pricePerHour ??
          // else fallback to turf default
          turf?.pricePerHour ??
          0,
        amountPaid: booking.amountPaid,
        isRecurring: booking.isRecurring,
        recurringFrequency: booking.recurringPattern?.frequency,
        recurringEndDate: booking.recurringPattern?.endDate
          ? new Date(booking.recurringPattern.endDate)
          : undefined,
        status: booking.status,
      });
    } else {
      const defaultTurf = turfs ? turfs[0] : null;
      const baseDate = selectedDate || new Date();
      form.reset({
        turfId: '',
        customerName: '',
        phoneNumber: '',
        startDate: baseDate,
        endDate: baseDate, // ✅ default same day
        startTime: '10:00',
        endTime: '11:00',
        pricePerHour: 0,
        amountPaid: 0,
        isRecurring: false,
        status: 'confirmed',
      });
    }
  }, [booking, selectedDate, form, turfs]);
  // 👇 watch selected turf
  //const watchedTurfId = form.watch('turfId');

  useEffect(() => {
    if (!watchedTurfId) return;

    const turf = turfs.find((t) => t._id === watchedTurfId);
    if (!turf) return;

    // Update rate when turf changes
    const pricePerHour = form.getValues('pricePerHour');
    if (pricePerHour <= 0) {
      form.setValue('pricePerHour', turf.pricePerHour ?? 0, {
        shouldDirty: true,
        shouldValidate: true,
      });
    }
  }, [watchedTurfId, turfs, form]);

  const onSubmit = async (data: BookingFormData) => {
    if (timeError) {
      toast.error(timeError);
      return;
    }

    const finalTotalAmount = totalAmount;
    const finalBalance = balance;

    const bookingData = {
      turfId: data.turfId,
      customerName: data.customerName,
      phoneNumber: data.phoneNumber,
      startDate: data.startDate,
      endDate: data.endDate,

      startTime: data.startTime,
      endTime: data.endTime,
      pricePerHour: data.pricePerHour,
      totalAmount: isRecurring ? totalAmount : finalTotalAmount, // Per booking total for recurring
      amountPaid: data.amountPaid,
      amountBalance: finalBalance,
      isRecurring: data.isRecurring,
      status: data.status,
      recurringPattern: data.isRecurring && data.recurringFrequency && data.endDate
        ? {
          frequency: data.recurringFrequency as 'daily' | 'weekly' | 'monthly',
          dayOfWeek: data.startDate.getDay(),
          endDate: data.endDate,
        }
        : undefined,
    };

    if (booking) {
      updateBooking(booking._id, {
        ...bookingData,
        pricePerHour: data.pricePerHour,
        totalAmount: totalAmount,
        amountPaid: data.amountPaid,
        amountBalance: balance,
      });
      toast.success('Booking updated successfully');
    } else {
      if (overlapWarning) {
        toast.warning(`Warning: This slot overlaps with ${overlapWarning.customerName}'s booking`);
      }
      try {
        let res = await addBooking(bookingData);
        toast.success('Booking created successfully');
        getBookingList()
        onOpenChange(false);
      } catch (error) {
        if (error?.response?.data?.message)
          toast.error(error?.response?.data?.message);
        console.error('Error creating booking:', error);
      }

    }

  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{booking ? 'Edit Booking' : 'New Booking'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="turfId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Turf</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select turf" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {turfs.filter((t) => t.isActive).map((turf) => (
                        <SelectItem key={turf._id} value={turf._id}>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: turf.color }}
                            />
                            {turf.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Rate per Hour (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      step={50}
                      placeholder="Enter rate per hour"
                      {...field}
                      value={field.value ?? ''}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="customerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Customer Name</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter Name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phoneNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phone Number</FormLabel>
                    <FormControl>
                      <Input placeholder="Enter 10 digit phone number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>


            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>

                  <Popover open={startDateOpen} onOpenChange={setStartDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick start date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={(date) => {
                          if (!date) return;

                          // ✅ update form value
                          field.onChange(new Date(date));

                          // ✅ close calendar
                          setStartDateOpen(false);
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />


            {/* 
            <FormField
              control={form.control}
              name="startDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Start Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick start date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            /> */}


            <FormField
              control={form.control}
              name="endDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>End Date</FormLabel>

                  <Popover open={endDateOpen} onOpenChange={setEndDateOpen}>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button variant="outline" className="w-full justify-start">
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {field.value ? format(field.value, 'PPP') : 'Pick end date'}
                        </Button>
                      </FormControl>
                    </PopoverTrigger>

                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        disabled={(date) =>
                          date < form.getValues('startDate')
                        }
                        onSelect={(date) => {
                          if (!date) return;

                          // ✅ update form value
                          field.onChange(new Date(date));

                          // ✅ close calendar
                          setEndDateOpen(false);
                        }}
                      />
                    </PopoverContent>
                  </Popover>

                  <FormMessage />
                </FormItem>
              )}
            />



            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Time</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className={cn(timeError && 'border-destructive')}>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {timeSlots.map((time) => (
                          <SelectItem key={time} value={time}>
                            {time}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {timeError && (
                      <p className="text-sm text-destructive">{timeError}</p>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Auto-calculated summary */}
            {selectedTurf && !timeError && (
              <div className="rounded-lg border border-border bg-muted/30 p-4 space-y-2">
                <div className="flex items-center gap-2 text-sm font-medium mb-3">
                  <Calculator className="h-4 w-4 text-primary" />
                  <span>Auto-Calculated Summary</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="h-3 w-3 text-muted-foreground" />
                    <span className="text-muted-foreground">Duration:</span>
                  </div>
                  <span className="font-medium">{duration} hour(s)</span>

                  <span className="text-muted-foreground">Rate:</span>
                  <span className="font-medium">₹{pricePerHour}/hr</span>

                  <span className="text-muted-foreground">Total Amount:</span>
                  <span className="font-semibold text-primary">₹{totalAmount}</span>

                  <span className="text-muted-foreground">Balance:</span>
                  <span className={cn(
                    "font-semibold",
                    balance > 0 ? "text-destructive" : "text-turf-green"
                  )}>
                    ₹{balance}
                  </span>
                </div>
              </div>
            )}

            {/* Overlap warning */}
            {overlapWarning && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  This slot overlaps with an existing booking by {overlapWarning.customerName} ({overlapWarning.startTime} - {overlapWarning.endTime})
                </AlertDescription>
              </Alert>
            )}

            <FormField
              control={form.control}
              name="amountPaid"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Amount Paid (₹)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="confirmed">Confirmed</SelectItem>
                      <SelectItem value="pending">Pending Payment</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                      <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* {!booking && ( */}
            <>
              <FormField
                control={form.control}
                name="isRecurring"
                render={({ field }) => (
                  <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                    <div className="flex items-center gap-3">
                      <Repeat className="h-5 w-5 text-muted-foreground" />
                      <div className="space-y-0.5">
                        <FormLabel>Recurring Booking</FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Repeat this booking on a schedule
                        </p>
                      </div>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              {isRecurring && (
                <div className="space-y-4 rounded-lg border border-border p-4 bg-muted/30">
                  <FormField
                    control={form.control}
                    name="recurringFrequency"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Frequency</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select frequency" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="daily">Daily</SelectItem>
                            <SelectItem value="weekly">Weekly (Same day each week)</SelectItem>
                            <SelectItem value="monthly">Monthly (Same date each month)</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* <FormField
                      control={form.control}
                      name="recurringEndDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>End Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    'w-full justify-start text-left font-normal',
                                    !field.value && 'text-muted-foreground'
                                  )}
                                >
                                  <CalendarIcon className="mr-2 h-4 w-4" />
                                  {field.value ? format(field.value, 'PPP') : 'Pick end date'}
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                initialFocus
                                className="pointer-events-auto"
                                disabled={(date) => date < new Date()}
                              />
                            </PopoverContent>
                          </Popover>
                          <FormMessage />
                        </FormItem>
                      )}
                    /> */}

                  {/* Recurring summary */}
                  {/* {recurringInfo && recurringInfo.occurrences > 0 && (
                      <div className="rounded-lg bg-primary/10 p-3 space-y-1">
                        <p className="text-sm font-medium text-primary">Recurring Summary</p>
                        <div className="grid grid-cols-2 gap-1 text-sm">
                          <span className="text-muted-foreground">Total Bookings:</span>
                          <span className="font-medium">{recurringInfo.occurrences}</span>

                          <span className="text-muted-foreground">Total Cost:</span>
                          <span className="font-semibold">₹{recurringInfo.totalRecurringAmount}</span>

                          <span className="text-muted-foreground">Total Balance:</span>
                          <span className={cn(
                            "font-semibold",
                            recurringInfo.totalRecurringBalance > 0 ? "text-destructive" : "text-turf-green"
                          )}>
                            ₹{recurringInfo.totalRecurringBalance}
                          </span>
                        </div>
                      </div>
                    )} */}
                </div>
              )}
            </>
            {/* )} */}

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                className="flex-1"
                disabled={!!timeError}
              >
                {booking ? 'Update' : 'Create'} Booking
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
