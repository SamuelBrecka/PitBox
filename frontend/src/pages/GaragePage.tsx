import React, { useEffect, useMemo, useState } from 'react';
import {
  Car,
  Plus,
  RefreshCw,
  AlertCircle,
  Gauge,
  CalendarClock,
  Wrench,
  Search,
  CheckCircle2,
  ArrowUpRight,
} from 'lucide-react';
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
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFuel, setSelectedFuel] = useState<string>('ALL');

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
    const confirmed = window.confirm(
      `Are you sure you want to delete ${v.manufacturer} ${v.model} (${v.licensePlate})? All service records and logs will be permanently deleted.`
    );
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

  const totalMileage = useMemo(
    () => vehicles.reduce((acc, v) => acc + (v.currentMileage || 0), 0),
    [vehicles]
  );

  const formattedFleetDistance = useMemo(() => {
    if (totalMileage >= 1000) {
      return `${(totalMileage / 1000).toFixed(1)}k km`;
    }
    return `${totalMileage} km`;
  }, [totalMileage]);

  const fuelTypes = useMemo(() => {
    const unique = Array.from(new Set(vehicles.map((v) => v.fuelType)));
    return ['ALL', ...unique];
  }, [vehicles]);

  const filteredVehicles = useMemo(() => {
    return vehicles.filter((v) => {
      const matchesFuel = selectedFuel === 'ALL' || v.fuelType === selectedFuel;
      const q = searchQuery.trim().toLowerCase();
      if (!q) return matchesFuel;
      return (
        matchesFuel &&
        (v.manufacturer.toLowerCase().includes(q) ||
          v.model.toLowerCase().includes(q) ||
          v.licensePlate.toLowerCase().includes(q))
      );
    });
  }, [vehicles, selectedFuel, searchQuery]);

  return (
    <div className="flex-1 max-w-6xl mx-auto px-6 py-10 w-full">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-8 border-b border-slate-200/80">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-pitbox-glacier mb-1">
            Owner Dashboard
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Welcome back, {user?.fullName || 'Owner'}!
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Track odometer readings, upcoming service intervals, and vehicle records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={loadVehicles}
            title="Refresh Garage"
            aria-label="Refresh Garage"
            className="p-2.5 rounded-full border border-slate-200 text-slate-500 bg-white hover:text-slate-900 hover:border-slate-300 transition-colors duration-200 cursor-pointer"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>

          <button
            type="button"
            className="inline-flex items-center px-4 py-2.5 rounded-full text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
            onClick={handleOpenAddVehicle}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* Bento KPI Summary Strip */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Registered Vehicles</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">{vehicles.length}</p>
            <span className="text-xs text-slate-400">Active in your garage</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pitbox-steel/10 text-pitbox-steel flex items-center justify-center shrink-0">
            <Car className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Fleet Distance</span>
            <p className="text-2xl font-bold text-slate-900 mt-1 font-mono">
              {formattedFleetDistance}
            </p>
            <span className="text-xs text-slate-400">Combined odometer total</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pitbox-glacier/15 text-pitbox-glacier flex items-center justify-center shrink-0">
            <Gauge className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200/80 flex items-center justify-between">
          <div>
            <span className="text-xs font-medium text-slate-500">Service Status</span>
            <p className="text-2xl font-bold text-slate-900 mt-1">All Clear</p>
            <span className="text-xs text-emerald-600 font-medium inline-flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              No overdue intervals
            </span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-pitbox-seafoam/50 text-pitbox-steel flex items-center justify-center shrink-0">
            <CalendarClock className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Error state */}
      {error && (
        <div className="mt-6 p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="w-5 h-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Asymmetric Dashboard Grid: Vehicles (2 cols) + Companion Widgets (1 col) */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left/Center Column: Garage Vehicles */}
        <div className="lg:col-span-2 space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="text-lg font-semibold text-slate-900">Your Fleet</h2>

            {vehicles.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Filter vehicles..."
                    aria-label="Filter vehicles"
                    className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-200 rounded-full text-slate-700 placeholder:text-slate-400 focus:outline-hidden focus:border-pitbox-steel"
                  />
                </div>

                {fuelTypes.length > 2 && (
                  <div className="flex items-center gap-1 bg-white p-1 rounded-full border border-slate-200">
                    {fuelTypes.map((fuel) => (
                      <button
                        key={fuel}
                        type="button"
                        onClick={() => setSelectedFuel(fuel)}
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium transition-colors duration-200 cursor-pointer ${
                          selectedFuel === fuel
                            ? 'bg-pitbox-steel text-white'
                            : 'text-slate-500 hover:text-slate-900'
                        }`}
                      >
                        {fuel}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {[1, 2].map((i) => (
                <div
                  key={i}
                  className="h-64 rounded-2xl bg-white border border-slate-200/70 animate-pulse"
                />
              ))}
            </div>
          ) : vehicles.length > 0 ? (
            filteredVehicles.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filteredVehicles.map((v) => (
                  <VehicleCard
                    key={v.id}
                    vehicle={v}
                    onQuickMileage={handleOpenQuickMileage}
                    onEdit={handleOpenEditVehicle}
                    onDelete={handleDeleteVehicle}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white rounded-2xl border border-slate-200/80 p-10 text-center">
                <p className="text-sm font-medium text-slate-700">
                  No vehicles match your filter criteria.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedFuel('ALL');
                  }}
                  className="mt-3 text-xs font-medium text-pitbox-steel hover:underline cursor-pointer"
                >
                  Reset filters
                </button>
              </div>
            )
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
              <div className="w-12 h-12 rounded-full bg-slate-100 text-pitbox-steel mx-auto flex items-center justify-center mb-4">
                <Car className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-slate-900">
                No Vehicles in Your Garage Yet
              </h3>
              <p className="text-sm text-slate-500 mt-1.5 max-w-md mx-auto">
                Add your first vehicle to begin tracking odometer readings, maintenance history, and service intervals.
              </p>
              <div className="mt-6">
                <button
                  type="button"
                  className="inline-flex items-center px-5 py-2.5 text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-full transition-colors duration-200 cursor-pointer"
                  onClick={handleOpenAddVehicle}
                >
                  <Plus className="w-4 h-4 mr-1.5" />
                  Add First Vehicle
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Companion Widgets */}
        <aside className="space-y-6">
          {/* Quick Odometer Action Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Gauge className="w-4 h-4 text-pitbox-steel" />
                <h3 className="text-sm font-semibold text-slate-900">Quick Odometer Log</h3>
              </div>
              <span className="text-[11px] font-medium text-pitbox-steel bg-pitbox-seafoam/40 px-2 py-0.5 rounded-full">
                Forward-Only
              </span>
            </div>
            <p className="text-xs text-slate-500 leading-relaxed">
              Keep service reminders accurate by logging your current mileage after long trips or refueling.
            </p>

            {vehicles.length > 0 ? (
              <div className="mt-4 space-y-2">
                {vehicles.slice(0, 3).map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => handleOpenQuickMileage(v)}
                    className="w-full flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-pitbox-seafoam/25 border border-slate-200/60 transition-colors duration-200 text-left cursor-pointer"
                  >
                    <div className="min-w-0 pr-2">
                      <p className="text-xs font-semibold text-slate-800 truncate">
                        {v.model} ({v.manufactureYear})
                      </p>
                      <p className="text-[11px] text-slate-400 font-mono">
                        {v.fuelType} &middot; Log new reading
                      </p>
                    </div>
                    <span className="inline-flex items-center text-xs font-medium text-pitbox-steel shrink-0">
                      Update
                      <ArrowUpRight className="w-3.5 h-3.5 ml-0.5" />
                    </span>
                  </button>
                ))}
              </div>
            ) : (
              <button
                type="button"
                onClick={handleOpenAddVehicle}
                className="mt-4 w-full py-2 px-3 rounded-xl border border-dashed border-slate-300 text-xs font-medium text-slate-600 hover:border-pitbox-steel hover:text-pitbox-steel transition-colors duration-200 cursor-pointer"
              >
                + Register a vehicle to log mileage
              </button>
            )}
          </div>

          {/* Standard Maintenance Checklist Widget */}
          <div className="bg-white rounded-2xl border border-slate-200/80 p-5">
            <div className="flex items-center gap-2 mb-3">
              <Wrench className="w-4 h-4 text-pitbox-glacier" />
              <h3 className="text-sm font-semibold text-slate-900">Recommended Intervals</h3>
            </div>
            <ul className="space-y-3 text-xs">
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Engine Oil &amp; Filter</span>
                <span className="font-mono font-medium text-slate-800">15,000 km / 1 yr</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Brake Fluid Flush</span>
                <span className="font-mono font-medium text-slate-800">2 years</span>
              </li>
              <li className="flex items-center justify-between py-1.5 border-b border-slate-100">
                <span className="text-slate-600">Cabin &amp; Air Filter</span>
                <span className="font-mono font-medium text-slate-800">30,000 km</span>
              </li>
              <li className="flex items-center justify-between py-1.5">
                <span className="text-slate-600">State Inspection (STK)</span>
                <span className="font-mono font-medium text-slate-800">2 years</span>
              </li>
            </ul>
          </div>
        </aside>
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
