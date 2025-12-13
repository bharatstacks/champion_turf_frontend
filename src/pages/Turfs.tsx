import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '@/contexts/AppContext';
import { MainLayout } from '@/components/layout/MainLayout';
import { TurfCard } from '@/components/turfs/TurfCard';
import { TurfForm } from '@/components/turfs/TurfForm';
import { Button } from '@/components/ui/button';
import { Plus, MapPin } from 'lucide-react';
import { Turf } from '@/types';

const Turfs = () => {
  const { turfs } = useApp();
  const [searchParams, setSearchParams] = useSearchParams();
  const [formOpen, setFormOpen] = useState(false);
  const [editingTurf, setEditingTurf] = useState<Turf | null>(null);

  useEffect(() => {
    if (searchParams.get('new') === 'true') {
      setFormOpen(true);
      setSearchParams({});
    }
  }, [searchParams, setSearchParams]);

  const handleEdit = (turf: Turf) => {
    setEditingTurf(turf);
    setFormOpen(true);
  };

  const handleClose = () => {
    setFormOpen(false);
    setEditingTurf(null);
  };

  return (
    <MainLayout>
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in opacity-0">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Turfs</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Manage your sports facilities and venues.
            </p>
          </div>
          <Button onClick={() => setFormOpen(true)} className="gap-2 w-full sm:w-auto">
            <Plus className="h-4 w-4" />
            Add Turf
          </Button>
        </div>

        {/* Turfs Grid */}
        {turfs?.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-card/50 py-16 animate-fade-in opacity-0">
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-muted">
              <MapPin className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">No turfs yet</h3>
            <p className="mb-4 text-sm text-muted-foreground">
              Create your first turf to start managing bookings.
            </p>
            <Button onClick={() => setFormOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Add First Turf
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {turfs?.map((turf, index) => (
              <div
                key={turf.id}
                className={`animate-fade-in opacity-0 stagger-${Math.min(index + 1, 5)}`}
              >
                <TurfCard turf={turf} onEdit={handleEdit} />
              </div>
            ))}
          </div>
        )}

        <TurfForm open={formOpen} onOpenChange={handleClose} turf={editingTurf} />
      </div>
    </MainLayout>
  );
};

export default Turfs;
