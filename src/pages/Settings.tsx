import { MainLayout } from '@/components/layout/MainLayout';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Moon, Sun, Bell, Shield, Database } from 'lucide-react';

const Settings = () => {
  return (
    <MainLayout>
      <div className="max-w-2xl space-y-8">
        {/* Header */}
        <div className="animate-fade-in opacity-0">
          <h1 className="text-3xl font-bold text-foreground">Settings</h1>
          <p className="text-muted-foreground">
            Manage your application preferences.
          </p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Appearance */}
          <div className="rounded-xl border border-border bg-card p-6 animate-fade-in opacity-0 stagger-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Sun className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Appearance</h3>
                <p className="text-sm text-muted-foreground">Customize the look of the app</p>
              </div>
            </div>
            <div className="flex items-center justify-between py-3 border-t border-border">
              <div>
                <p className="font-medium text-foreground">Dark Mode</p>
                <p className="text-sm text-muted-foreground">Use dark theme</p>
              </div>
              <Switch />
            </div>
          </div>

          {/* Notifications */}
          <div className="rounded-xl border border-border bg-card p-6 animate-fade-in opacity-0 stagger-2">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Bell className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Notifications</h3>
                <p className="text-sm text-muted-foreground">Configure alert preferences</p>
              </div>
            </div>
            <div className="space-y-4 border-t border-border pt-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Booking Reminders</p>
                  <p className="text-sm text-muted-foreground">Get notified before bookings</p>
                </div>
                <Switch defaultChecked />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium text-foreground">Payment Alerts</p>
                  <p className="text-sm text-muted-foreground">Notify on pending payments</p>
                </div>
                <Switch defaultChecked />
              </div>
            </div>
          </div>

          {/* Data */}
          <div className="rounded-xl border border-border bg-card p-6 animate-fade-in opacity-0 stagger-3">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Database className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Data Management</h3>
                <p className="text-sm text-muted-foreground">Manage your application data</p>
              </div>
            </div>
            <div className="flex gap-3 border-t border-border pt-4">
              <Button variant="outline">Export Data</Button>
              <Button variant="outline">Import Data</Button>
            </div>
          </div>

          {/* Connect Backend */}
          <div className="rounded-xl border border-dashed border-primary/50 bg-accent/30 p-6 animate-fade-in opacity-0 stagger-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg gradient-primary glow-sm">
                <Shield className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">Connect Backend</h3>
                <p className="text-sm text-muted-foreground">
                  Enable Lovable Cloud for persistent data storage and user authentication
                </p>
              </div>
            </div>
            <p className="text-sm text-muted-foreground mb-4">
              Currently, data is stored locally in your browser. Connect to Lovable Cloud to save your turfs and bookings permanently.
            </p>
            <Button>Enable Cloud Storage</Button>
          </div>
        </div>
      </div>
    </MainLayout>
  );
};

export default Settings;
