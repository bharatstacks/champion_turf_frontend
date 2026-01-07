export interface Turf {
  _id?: string;
  id: string;
  name: string;
  description: string;
  pricePerHour: number;
  color: string;
  isActive: boolean;
  createdAt: Date;
}

export interface Booking {
  _id: string;
  id: string;
  turfId: string;
  customerName: string;
  phoneNumber: string;
  startDate: Date;
  endDate: Date;

  startTime: string;
  endTime: string;
   pricePerHour?: number; 
  totalAmount: number;
  amountPaid: number;
  amountBalance: number;
  isRecurring: boolean;
  recurringPattern?: RecurringPattern;
  recurringGroupId?: string;
  status: 'confirmed' | 'pending' | 'cancelled' | 'completed';
  createdAt: Date;
}

export interface RecurringPattern {
  frequency: 'daily' | 'weekly' | 'monthly';
  dayOfWeek?: number; // 0-6 for weekly
  endDate: Date;
}

export interface DashboardStats {
  totalBookings: number;
  todaysBookings: number;
  pendingBalance: number;
  activeRecurring: number;
  totalRevenue: number;
}

export interface BookingConflict {
  booking: Booking;
  conflictDate: Date;
}

export interface Admin {
  id: string;
  username: string;
  email: string;
  password: string;
  name: string;
  role: 'super_admin' | 'admin';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  currentAdmin: Admin | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;
  addAdmin: (admin: Omit<Admin, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateAdmin: (id: string, admin: Partial<Admin>) => void;
  deleteAdmin: (id: string) => void;
  getAllAdmins: () => Admin[];
}
