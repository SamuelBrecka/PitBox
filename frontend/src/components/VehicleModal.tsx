import React, { useState } from 'react';
import { X, Car, Upload, AlertCircle, CheckCircle2, Image as ImageIcon } from 'lucide-react';
import { vehicleApi } from '../api/vehicleApi';
import { compressVehicleImage, CompressionResult } from '../utils/compression';
import { CreateVehiclePayload, UpdateVehiclePayload, Vehicle } from '../types/vehicle';

interface VehicleModalProps {
  vehicle?: Vehicle | null; // null for Create, populated for Edit
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: Vehicle) => void;
}

const FUEL_TYPES = [
  { value: 'PETROL', label: 'Petrol (Gasoline)' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'HYBRID', label: 'Hybrid / PHEV' },
  { value: 'EV', label: 'Electric (EV)' },
];

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(vehicle);

  const [manufacturer, setManufacturer] = useState(vehicle?.manufacturer || '');
  const [model, setModel] = useState(vehicle?.model || '');
  const [manufactureYear, setManufactureYear] = useState<number | string>(vehicle?.manufactureYear || new Date().getFullYear());
  const [licensePlate, setLicensePlate] = useState(vehicle?.licensePlate || '');
  const [fuelType, setFuelType] = useState(vehicle?.fuelType || 'DIESEL');
  const [currentMileage, setCurrentMileage] = useState<number | string>(vehicle?.currentMileage ?? 0);
  const [vin, setVin] = useState(vehicle?.vin || '');
  const [engineInfo, setEngineInfo] = useState(vehicle?.engineInfo || '');

  // Photo compression state
  const [compressedResult, setCompressedResult] = useState<CompressionResult | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setCompressing(true);
    setError(null);
    try {
      const result = await compressVehicleImage(file);
      setCompressedResult(result);
    } catch {
      setError('Failed to process image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manufacturer.trim() || !model.trim() || !licensePlate.trim()) {
      setError('Please fill in all required fields (Make, Model, License Plate).');
      return;
    }

    const yearNum = Number(manufactureYear);
    if (isNaN(yearNum) || yearNum < 1900 || yearNum > 2100) {
      setError('Manufacture year must be between 1900 and 2100.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let saved: Vehicle;

      if (isEditing && vehicle) {
        const payload: UpdateVehiclePayload = {
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          manufactureYear: yearNum,
          licensePlate: licensePlate.trim().toUpperCase(),
          fuelType,
          vin: vin.trim() || undefined,
          engineInfo: engineInfo.trim() || undefined,
        };
        saved = await vehicleApi.updateVehicle(vehicle.id, payload);
      } else {
        const mileageNum = Number(currentMileage) || 0;
        const payload: CreateVehiclePayload = {
          manufacturer: manufacturer.trim(),
          model: model.trim(),
          manufactureYear: yearNum,
          licensePlate: licensePlate.trim().toUpperCase(),
          fuelType,
          currentMileage: mileageNum,
          vin: vin.trim() || undefined,
          engineInfo: engineInfo.trim() || undefined,
        };
        saved = await vehicleApi.createVehicle(payload);
      }

      // If photo was selected, upload compressed image
      if (compressedResult) {
        saved = await vehicleApi.uploadPhoto(saved.id, compressedResult.file);
      }

      onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      const errorMessage = (err as { response?: { data?: { error?: string } } })?.response?.data?.error
        || 'An error occurred while saving vehicle.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitbox-dark/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-2xl shadow-xl border border-pitbox-seafoam/60 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-pitbox-steel text-white">
          <div className="flex items-center space-x-2">
            <Car className="w-5 h-5 text-pitbox-seafoam" />
            <h3 className="font-bold text-lg">
              {isEditing ? 'Edit Vehicle Profile' : 'Add New Vehicle'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Photo Upload & In-Browser Compression */}
          <div className="bg-pitbox-cream/40 p-3.5 rounded-xl border border-pitbox-seafoam/60">
            <span className="text-xs font-semibold text-pitbox-dark uppercase tracking-wider block mb-2">
              Vehicle Photo (In-Browser Auto Compression)
            </span>
            <div className="flex items-center gap-4">
              <div className="w-20 h-20 rounded-xl bg-pitbox-cream border border-pitbox-seafoam flex items-center justify-center overflow-hidden shrink-0">
                {compressedResult ? (
                  <img src={compressedResult.previewUrl} alt="Preview" className="w-full h-full object-cover" />
                ) : vehicle?.photoPath ? (
                  <img src={vehicle.photoPath} alt={vehicle.model} className="w-full h-full object-cover" />
                ) : (
                  <ImageIcon className="w-8 h-8 text-pitbox-glacier" />
                )}
              </div>

              <div className="flex-1">
                <label className="inline-flex items-center px-3 py-1.5 text-xs font-semibold text-pitbox-steel bg-white hover:bg-pitbox-seafoam/20 border border-pitbox-seafoam rounded-lg cursor-pointer transition shadow-xs">
                  <Upload className="w-3.5 h-3.5 mr-1.5" />
                  {compressing ? 'Compressing...' : 'Choose Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleImageChange}
                    disabled={compressing}
                  />
                </label>

                {compressedResult && (
                  <div className="mt-2 text-xs text-slate-600 flex items-center space-x-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      {compressedResult.originalSizeKb} KB &rarr;{' '}
                      <strong className="text-emerald-700 font-bold">{compressedResult.compressedSizeKb} KB</strong>{' '}
                      ({Math.round((1 - compressedResult.compressedSizeKb / compressedResult.originalSizeKb) * 100)}% smaller)
                    </span>
                  </div>
                )}
                <p className="text-[11px] text-slate-500 mt-1">
                  Photos are compressed down to ~200 KB in your browser before upload.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">Make / Manufacturer *</label>
              <input
                type="text"
                required
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. Skoda, BMW, Audi"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">Model *</label>
              <input
                type="text"
                required
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. Octavia, 320d, Golf"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">Manufacture Year *</label>
              <input
                type="number"
                required
                min={1900}
                max={2100}
                value={manufactureYear}
                onChange={(e) => setManufactureYear(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">License Plate *</label>
              <input
                type="text"
                required
                value={licensePlate}
                onChange={(e) => setLicensePlate(e.target.value.toUpperCase())}
                placeholder="e.g. BA-123XY"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono uppercase font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">Fuel Type *</label>
              <select
                value={fuelType}
                onChange={(e) => setFuelType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm bg-white"
              >
                {FUEL_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {!isEditing && (
              <div>
                <label className="block text-xs font-semibold text-pitbox-dark mb-1">Current Mileage (km) *</label>
                <input
                  type="number"
                  min={0}
                  required
                  value={currentMileage}
                  onChange={(e) => setCurrentMileage(e.target.value)}
                  placeholder="e.g. 145000"
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">Engine Information (Optional)</label>
              <input
                type="text"
                value={engineInfo}
                onChange={(e) => setEngineInfo(e.target.value)}
                placeholder="e.g. 2.0 TDI 110 kW"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-pitbox-dark mb-1">VIN (Optional)</label>
              <input
                type="text"
                maxLength={17}
                value={vin}
                onChange={(e) => setVin(e.target.value.toUpperCase())}
                placeholder="17-character VIN"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono uppercase"
              />
            </div>
          </div>

          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading || compressing}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || compressing}
              className="px-5 py-2 text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Vehicle'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
