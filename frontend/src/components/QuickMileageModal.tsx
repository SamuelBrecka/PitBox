import React, { useState } from 'react';
import { Gauge, X, AlertCircle, ArrowUpRight } from 'lucide-react';
import { vehicleApi } from '../api/vehicleApi';
import { Vehicle } from '../types/vehicle';

interface QuickMileageModalProps {
  vehicle: Vehicle;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (updated: Vehicle) => void;
}

export const QuickMileageModal: React.FC<QuickMileageModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [mileage, setMileage] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const numericMileage = parseInt(mileage, 10);
  const isValid = !isNaN(numericMileage) && numericMileage > vehicle.currentMileage;
  const mileageDiff = !isNaN(numericMileage) && numericMileage > vehicle.currentMileage ? numericMileage - vehicle.currentMileage : 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid) {
      setError(`Odometer reading must be greater than current reading (${vehicle.currentMileage.toLocaleString()} km).`);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const updated = await vehicleApi.updateMileage(vehicle.id, { mileage: numericMileage });
      onSuccess(updated);
      onClose();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'Failed to update mileage. Please try again.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const setRelative = (delta: number) => {
    const next = vehicle.currentMileage + delta;
    setMileage(next.toString());
    setError(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitbox-dark/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-pitbox-seafoam/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between px-6 py-4 bg-pitbox-steel text-white">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-pitbox-seafoam" />
            <h3 className="font-bold text-lg">Update Odometer</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Vehicle</span>
            <p className="text-base font-bold text-pitbox-dark">
              {vehicle.manufacturer} {vehicle.model}{' '}
              <span className="text-xs font-mono bg-pitbox-cream px-2 py-0.5 rounded border border-pitbox-seafoam/80 text-pitbox-steel ml-1">
                {vehicle.licensePlate}
              </span>
            </p>
          </div>

          <div className="bg-pitbox-cream/50 p-3.5 rounded-xl border border-pitbox-seafoam/50 flex items-center justify-between">
            <span className="text-xs text-slate-600 font-medium">Current Reading:</span>
            <span className="text-sm font-bold text-pitbox-steel font-mono">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
          </div>

          <div>
            <label htmlFor="newMileageInput" className="block text-xs font-semibold text-pitbox-dark mb-1">
              New Odometer Reading (km) *
            </label>
            <div className="relative">
              <input
                id="newMileageInput"
                type="number"
                min={vehicle.currentMileage + 1}
                value={mileage}
                onChange={(e) => {
                  setMileage(e.target.value);
                  setError(null);
                }}
                placeholder={`e.g. ${vehicle.currentMileage + 1000}`}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-pitbox-dark font-mono text-base font-semibold"
                autoFocus
              />
              <span className="absolute right-3.5 top-3 text-xs font-medium text-slate-400">km</span>
            </div>

            {mileageDiff > 0 && (
              <p className="text-xs text-emerald-600 mt-1.5 flex items-center font-medium">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
                +{mileageDiff.toLocaleString()} km forward progression
              </p>
            )}
          </div>

          {/* Quick Increment Shortcuts */}
          <div>
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block mb-1.5">
              Quick Shortcuts:
            </span>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setRelative(500)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-pitbox-seafoam bg-pitbox-cream hover:bg-pitbox-seafoam/40 text-pitbox-steel transition"
              >
                +500 km
              </button>
              <button
                type="button"
                onClick={() => setRelative(1000)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-pitbox-seafoam bg-pitbox-cream hover:bg-pitbox-seafoam/40 text-pitbox-steel transition"
              >
                +1,000 km
              </button>
              <button
                type="button"
                onClick={() => setRelative(5000)}
                className="flex-1 py-1.5 px-2 text-xs font-medium rounded-lg border border-pitbox-seafoam bg-pitbox-cream hover:bg-pitbox-seafoam/40 text-pitbox-steel transition"
              >
                +5,000 km
              </button>
            </div>
          </div>

          {error && (
            <div className="flex items-start space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!isValid || loading}
              className="px-5 py-2 text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl transition shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Saving...' : 'Update Reading'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
