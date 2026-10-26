import React, { useEffect, useState } from 'react';
import { Car, Plus, ShieldCheck, Gauge, Wrench, RefreshCw, AlertCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle } from '../types/vehicle';
import { VehicleCard } from '../components/VehicleCard';
import { VehicleModal } from '../components/VehicleModal';
import { QuickMileageModal } from '../components/QuickMileageModal';

export const GaragePage: React.FC = () => {
  const { user } = useAuth();

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modals
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [quickMileageVehicle, setQuickMileageVehicle] = useState<Vehicle | null>(null);
  const [isQuickMileageOpen, setIsQuickMileageOpen] = useState(false);

  const loadVehicles = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await vehicleApi.getVehicles();
      setVehicles(data);
    } catch {
      setError('Failed to load your garage vehicles. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleOpenAddVehicle = () => {
    setEditingVehicle(null);
    setIsVehicleModalOpen(true);
  };

  const handleOpenEditVehicle = (v: Vehicle) => {
    setEditingVehicle(v);
    setIsVehicleModalOpen(true);
  };

  const handleOpenQuickMileage = (v: Vehicle) => {
    setQuickMileageVehicle(v);
    setIsQuickMileageOpen(true);
  };

  const handleDeleteVehicle = async (v: Vehicle) => {
    const confirmed = window.confirm(`Are you sure you want to delete ${v.manufacturer} ${v.model} (${v.licensePlate})? All service records and logs will be permanently deleted.`);
    if (!confirmed) return;

    try {
      await vehicleApi.deleteVehicle(v.id);
      setVehicles((prev) => prev.filter((item) => item.id !== v.id));
    } catch {
      alert('Failed to delete vehicle.');
    }
  };

  const handleVehicleSaved = (saved: Vehicle) => {
    setVehicles((prev) => {
      const index = prev.findIndex((v) => v.id === saved.id);
      if (index >= 0) {
        const copy = [...prev];
        copy[index] = saved;
        return copy;
      }
      return [saved, ...prev];
    });
  };

  const handleMileageUpdated = (updated: Vehicle) => {
    setVehicles((prev) => prev.map((v) => (v.id === updated.id ? updated : v)));
  };

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-pitbox-seafoam/50 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-pitbox-steel bg-pitbox-seafoam/50 px-2.5 py-0.5 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated &middot; JWT Session Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-pitbox-steel">
            Welcome back, {user?.fullName || 'Owner'}!
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your vehicles, odometer readings, and upcoming service intervals.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            type="button"
            onClick={loadVehicles}
            title="Refresh Garage"
            className="p-2.5 rounded-lg border border-pitbox-seafoam text-pitbox-steel bg-white hover:bg-pitbox-cream transition"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 shadow-sm transition"
            onClick={handleOpenAddVehicle}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-steel/10 text-pitbox-steel flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Vehicles</span>
            <p className="text-2xl font-bold text-pitbox-dark">{vehicles.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-glacier/20 text-pitbox-glacier flex items-center justify-center shrink-0">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Reminders</span>
            <p className="text-2xl font-bold text-pitbox-dark">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-seafoam/50 text-pitbox-steel flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Spent</span>
            <p className="text-2xl font-bold text-pitbox-dark">€0.00</p>
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-8 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Vehicles Grid or Empty State */}
      <div className="mt-8">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 rounded-2xl bg-white border border-pitbox-seafoam/40 animate-pulse" />
            ))}
          </div>
        ) : vehicles.length > 0 ? (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-pitbox-dark">My Garage Vehicles</h2>
              <span className="text-xs font-semibold text-slate-500">
                {vehicles.length} {vehicles.length === 1 ? 'vehicle' : 'vehicles'} registered
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {vehicles.map((v) => (
                <VehicleCard
                  key={v.id}
                  vehicle={v}
                  onQuickMileage={handleOpenQuickMileage}
                  onEdit={handleOpenEditVehicle}
                  onDelete={handleDeleteVehicle}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-12 text-center max-w-2xl mx-auto shadow-xs">
            <div className="w-16 h-16 rounded-2xl bg-pitbox-cream text-pitbox-steel mx-auto flex items-center justify-center mb-4 border border-pitbox-seafoam">
              <Car className="w-8 h-8" />
            </div>
            <h2 className="text-xl font-bold text-pitbox-dark">No Vehicles in Your Garage Yet</h2>
            <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
              Your digital service book is ready. Add your first vehicle to start tracking odometer readings, maintenance history, and service intervals.
            </p>
            <div className="mt-6">
              <button
                type="button"
                className="inline-flex items-center px-4 py-2 text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-lg shadow-sm transition"
                onClick={handleOpenAddVehicle}
              >
                <Plus className="w-4 h-4 mr-1.5" />
                Add First Vehicle
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      <VehicleModal
        vehicle={editingVehicle}
        isOpen={isVehicleModalOpen}
        onClose={() => setIsVehicleModalOpen(false)}
        onSuccess={handleVehicleSaved}
      />

      {quickMileageVehicle && (
        <QuickMileageModal
          vehicle={quickMileageVehicle}
          isOpen={isQuickMileageOpen}
          onClose={() => {
            setIsQuickMileageOpen(false);
            setQuickMileageVehicle(null);
          }}
          onSuccess={handleMileageUpdated}
        />
      )}
    </div>
  );
};
