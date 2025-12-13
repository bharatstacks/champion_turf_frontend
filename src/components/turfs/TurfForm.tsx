import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Turf } from '@/types';
import { useApp } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
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
import { toast } from 'sonner';

const turfSchema = z.object({
  name: z.string().min(1, 'Name is required').max(50),
  description: z.string().min(1, 'Description is required').max(200),
  pricePerHour: z.number().min(1, 'Price must be at least 1'),
  color: z.string(),
  isActive: z.boolean(),
});

type TurfFormData = z.infer<typeof turfSchema>;

const colorOptions = [
  'hsl(142, 76%, 36%)', // Green
  'hsl(199, 89%, 48%)', // Blue
  'hsl(25, 95%, 53%)',  // Orange
  'hsl(262, 83%, 58%)', // Purple
  'hsl(340, 82%, 52%)', // Pink
  'hsl(47, 96%, 53%)',  // Yellow
];

interface TurfFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  turf?: Turf | null;
}

export function TurfForm({ open, onOpenChange, turf }: TurfFormProps) {
  const { addTurf, updateTurf } = useApp();

  const form = useForm<TurfFormData>({
    resolver: zodResolver(turfSchema),
    defaultValues: {
      name: '',
      description: '',
      pricePerHour: 1000,
      color: colorOptions[0],
      isActive: true,
    },
  });

  useEffect(() => {
    if (turf) {
      form.reset({
        name: turf.name,
        description: turf.description,
        pricePerHour: turf.pricePerHour,
        color: turf.color,
        isActive: turf.isActive,
      });
    } else {
      form.reset({
        name: '',
        description: '',
        pricePerHour: 1000,
        color: colorOptions[0],
        isActive: true,
      });
    }
  }, [turf, form]);

  const onSubmit = (data: TurfFormData) => {
    if (turf) {
      updateTurf(turf.id, {
        name: data.name,
        description: data.description,
        pricePerHour: data.pricePerHour,
        color: data.color,
        isActive: data.isActive,
      });
      toast.success('Turf updated successfully');
    } else {
      addTurf({
        name: data.name,
        description: data.description,
        pricePerHour: data.pricePerHour,
        color: data.color,
        isActive: data.isActive,
      });
      
      toast.success('Turf created successfully');
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{turf ? 'Edit Turf' : 'Add New Turf'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Main Arena" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Premium 5-a-side football turf..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="pricePerHour"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price per Hour (₹)</FormLabel>
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
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2">
                      {colorOptions.map((color) => (
                        <button
                          key={color}
                          type="button"
                          className={`h-8 w-8 rounded-full border-2 transition-all ${
                            field.value === color
                              ? 'border-foreground scale-110'
                              : 'border-transparent hover:scale-105'
                          }`}
                          style={{ backgroundColor: color }}
                          onClick={() => field.onChange(color)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex items-center justify-between rounded-lg border border-border p-3">
                  <div className="space-y-0.5">
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Allow new bookings for this turf
                    </p>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button
                type="button"
                variant="outline"
                className="flex-1"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="flex-1">
                {turf ? 'Update' : 'Create'} Turf
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
