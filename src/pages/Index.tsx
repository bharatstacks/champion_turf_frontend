import { useMemo } from 'react';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { TodaysBookings } from '@/components/dashboard/TodaysBookings';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { CalendarDays, IndianRupee, Repeat, TrendingUp } from 'lucide-react';
import { isToday } from 'date-fns';

const Index = () => {
  const { bookings, turfs } = useApp();

  const stats = useMemo(() => {
    const totalBookings = bookings.filter((b) => b.status !== 'cancelled').length;
    const todaysBookings = bookings.filter(
      (b) => isToday(new Date(b.date)) && b.status !== 'cancelled'
    ).length;
    const pendingBalance = bookings.reduce((acc, b) => acc + b.amountBalance, 0);
    const activeRecurring = new Set(
      bookings.filter((b) => b.recurringGroupId).map((b) => b.recurringGroupId)
    ).size;
    const totalRevenue = bookings.reduce((acc, b) => acc + b.amountPaid, 0);

    return {
      totalBookings,
      todaysBookings,
      pendingBalance,
      activeRecurring,
      totalRevenue,
    };
  }, [bookings]);

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="animate-fade-in opacity-0">
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-sm sm:text-base text-muted-foreground">
            Welcome back! Here's what's happening with your turfs.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatsCard
            title="Total Bookings"
            value={stats.totalBookings}
            icon={CalendarDays}
            trend={{ value: 12, isPositive: true }}
            className="animate-fade-in opacity-0 stagger-1"
          />
          <StatsCard
            title="Today's Bookings"
            value={stats.todaysBookings}
            icon={TrendingUp}
            className="animate-fade-in opacity-0 stagger-2"
          />
          <StatsCard
            title="Pending Balance"
            value={`₹${stats.pendingBalance.toLocaleString()}`}
            icon={IndianRupee}
            className="animate-fade-in opacity-0 stagger-3"
          />
          <StatsCard
            title="Recurring Patterns"
            value={stats.activeRecurring}
            icon={Repeat}
            className="animate-fade-in opacity-0 stagger-4"
          />
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 animate-fade-in opacity-0 stagger-5">
            <TodaysBookings />
          </div>
          <div className="animate-fade-in opacity-0 stagger-5">
            <QuickActions />
          </div>
        </div>

        {/* Revenue Summary */}
        <div className="rounded-xl border border-border bg-card p-6 animate-fade-in opacity-0">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Revenue</p>
              <p className="text-4xl font-bold text-foreground">
                ₹{stats.totalRevenue.toLocaleString()}
              </p>
            </div>
            <div className="text-right">
              <p className="text-sm font-medium text-muted-foreground">Active Turfs</p>
              <p className="text-4xl font-bold text-primary">
                {turfs.filter((t) => t.isActive).length}
              </p>
            </div>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Index;
