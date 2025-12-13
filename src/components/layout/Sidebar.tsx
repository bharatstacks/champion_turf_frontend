import { NavLink } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Calendar,
  MapPin,
  CalendarPlus,
  Settings,
  Zap,
  Shield,
  LogOut,
} from 'lucide-react';
import { Button } from '@/components/ui/button';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/turfs', icon: MapPin, label: 'Turfs' },
  { to: '/bookings', icon: CalendarPlus, label: 'Bookings' },
  { to: '/admin/dashboard', icon: Shield, label: 'Admin Panel' }
];

interface SidebarProps {
  onClose?: () => void;
}

export function Sidebar({ onClose }: SidebarProps) {
  const { currentAdmin, logout } = useAuth();

  const handleLogout = () => {
    logout();
    window.location.href = '/login';
  };

  return (
    <aside className="fixed left-0 top-0 z-40 h-screen w-64 border-r border-sidebar-border bg-sidebar">
      <div className="flex h-full flex-col">
        {/* Logo */}
        <div className="flex h-16 items-center gap-3 border-b border-sidebar-border px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg gradient-primary glow-sm">
            <Zap className="h-5 w-5 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold text-foreground">TurfManager</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                  isActive
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground glow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                )
              }
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </NavLink>
          ))}
          
          {/* Admin Section */}
          {currentAdmin && (
            <>
              <div className="my-2 border-t border-sidebar-border" />
              <NavLink
                to="/admin/dashboard"
                onClick={onClose}
                className={({ isActive }) =>
                  cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200',
                    isActive
                      ? 'bg-sidebar-accent text-sidebar-accent-foreground glow-sm'
                      : 'text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground'
                  )
                }
              >
                <Shield className="h-5 w-5" />
                Admin Panel
              </NavLink>
            </>
          )}
        </nav>

        {/* Footer */}
        <div className="border-t border-sidebar-border p-4 space-y-2">
          {currentAdmin && (
            <div className="mb-3 px-3 py-2 rounded-lg bg-sidebar-accent/30">
              <p className="text-xs text-sidebar-foreground/60 font-semibold">Logged in as</p>
              <p className="text-sm font-semibold text-sidebar-accent-foreground">{currentAdmin.name}</p>
            </div>
          )}
          <NavLink
            to="/settings"
            onClick={onClose}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-sidebar-foreground transition-all duration-200 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
          >
            <Settings className="h-5 w-5" />
            Settings
          </NavLink>
          {currentAdmin && (
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            >
              <LogOut className="h-5 w-5" />
              Logout
            </Button>
          )}
        </div>
      </div>
    </aside>
  );
}
