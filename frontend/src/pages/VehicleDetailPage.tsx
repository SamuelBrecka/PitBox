import React, { useEffect, useState, useCallback } from 'react';
import {
  Car,
  Gauge,
  ArrowLeft,
  Calendar,
  Fuel,
  Hash,
  Cpu,
  Clock,
  Camera,
  Edit3,
  Trash2,
  AlertCircle,
  FileText,
  Bell,
  PieChart,
  ShieldCheck,
} from 'lucide-react';
import { useParams, Link, useNavigate } from '../router/Router';
import { vehicleApi } from '../api/vehicleApi';
import { MileageLog, Vehicle } from '../types/vehicle';
import { compressVehicleImage } from '../utils/compression';
import { QuickMileageModal } from '../components/QuickMileageModal';
import { VehicleModal } from '../components/VehicleModal';

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<'mileage_logs' | 'service_history' | 'reminders' | 'analytics'>('mileage_logs');

  // Modals & upload
  const [isQuickMileageOpen, setIsQuickMileageOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [vData, logsData] = await Promise.all([
        vehicleApi.getVehicle(id),
        vehicleApi.getMileageLogs(id),
      ]);
      setVehicle(vData);
      setMileageLogs(logsData);
    } catch {
      setError('Vehicle not found or failed to load data.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) return;

    setUploadingPhoto(true);
    try {
      const compressed = await compressVehicleImage(file);
      const updated = await vehicleApi.uploadPhoto(vehicle.id, compressed.file);
      setVehicle(updated);
    } catch {
      alert('Failed to upload compressed vehicle photo.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    const ok = window.confirm(`Delete ${vehicle.manufacturer} ${vehicle.model}? This cannot be undone.`);
    if (!ok) return;

    try {
      await vehicleApi.deleteVehicle(vehicle.id);
      navigate('/garage', true);
    } catch {
      alert('Failed to delete vehicle.');
    }
  };

  const handleMileageUpdated = (updated: Vehicle) => {
    setVehicle(updated);
    // Reload logs
    if (id) {
      vehicleApi.getMileageLogs(id).then(setMileageLogs);
    }
  };

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-slate-500">
          <Car className="w-10 h-10 text-pitbox-glacier animate-bounce" />
          <p className="text-sm font-semibold">Loading vehicle profile...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 w-full text-center">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-pitbox-dark">Vehicle Profile Not Available</h2>
          <p className="text-sm text-slate-600 mt-2">{error || 'Vehicle could not be located.'}</p>
          <div className="mt-6">
            <Link
              to="/garage"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Return to Garage
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/garage"
          className="inline-flex items-center text-xs font-semibold text-pitbox-steel hover:text-pitbox-steel/80 transition"
        >
          <ArrowLeft className="w-4 h-4 mr-1" />
          Back to Garage
        </Link>
      </div>

      {/* Hero Header */}
      <div className="bg-white rounded-3xl border border-pitbox-seafoam/70 shadow-sm overflow-hidden">
        <div className="relative h-64 sm:h-80 w-full bg-slate-900 flex items-center justify-center overflow-hidden">
          {vehicle.photoPath ? (
            <img
              src={vehicle.photoPath}
              alt={`${vehicle.manufacturer} ${vehicle.model}`}
              className="w-full h-full object-cover opacity-90"
            />
          ) : (
            <div className="flex flex-col items-center justify-center text-slate-500">
              <Car className="w-24 h-24 stroke-1 text-pitbox-seafoam/40" />
              <span className="text-sm font-medium mt-2 text-slate-400">No profile photo uploaded</span>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Change photo button */}
          <label className="absolute top-4 right-4 inline-flex items-center px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold cursor-pointer border border-white/20 transition shadow-sm">
            <Camera className="w-4 h-4 mr-1.5 text-pitbox-seafoam" />
            <span>{uploadingPhoto ? 'Compressing & Uploading...' : 'Change Photo'}</span>
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handlePhotoUpload}
              disabled={uploadingPhoto}
            />
          </label>

          {/* Vehicle Title & License Plate */}
          <div className="absolute bottom-6 left-6 right-6 flex flex-col sm:flex-row sm:items-end justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="bg-pitbox-steel text-white text-[10px] font-bold px-2 py-0.5 rounded uppercase tracking-wider">
                  {vehicle.fuelType}
                </span>
                <span className="text-white/80 text-xs font-semibold">
                  Year {vehicle.manufactureYear}
                </span>
              </div>
              <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight drop-shadow-sm">
                {vehicle.manufacturer} {vehicle.model}
              </h1>
            </div>

            {/* License plate chip */}
            <div className="flex items-center self-start sm:self-auto shadow-lg">
              <div className="bg-blue-700 text-white text-xs font-bold px-2 py-1.5 rounded-l flex items-center justify-center border border-r-0 border-blue-900">
                SK
              </div>
              <div className="bg-white text-pitbox-dark font-mono font-extrabold text-sm sm:text-base px-3 py-1.5 rounded-r border border-slate-300 tracking-wider">
                {vehicle.licensePlate}
              </div>
            </div>
          </div>
        </div>

        {/* Action bar right below hero */}
        <div className="px-6 py-4 bg-pitbox-cream/40 border-t border-pitbox-seafoam/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Gauge className="w-5 h-5 text-pitbox-glacier" />
            <span className="text-xs text-slate-600 font-medium uppercase tracking-wide">Current Odometer:</span>
            <span className="text-lg font-extrabold text-pitbox-steel font-mono">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
            <button
              type="button"
              onClick={() => setIsQuickMileageOpen(true)}
              className="ml-2 inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-lg shadow-2xs transition"
            >
              + Quick Update
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-pitbox-steel bg-white border border-pitbox-seafoam hover:bg-pitbox-seafoam/20 transition"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Edit Specs
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Delete Vehicle
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications Grid */}
      <div className="mt-8 bg-white rounded-2xl border border-pitbox-seafoam/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-pitbox-steel uppercase tracking-wider mb-4">
          Vehicle Technical Specifications
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Car className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Make & Model</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark truncate">
              {vehicle.manufacturer} {vehicle.model}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Year</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark font-mono">
              {vehicle.manufactureYear}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Fuel className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Fuel Type</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark uppercase">
              {vehicle.fuelType}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Cpu className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Engine Info</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark truncate">
              {vehicle.engineInfo || 'N/A'}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40 sm:col-span-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Hash className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>VIN</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark font-mono tracking-wider truncate">
              {vehicle.vin || 'Not specified'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-pitbox-seafoam/60 flex space-x-6">
          <button
            type="button"
            onClick={() => setActiveTab('mileage_logs')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'mileage_logs'
                ? 'border-pitbox-steel text-pitbox-steel'
                : 'border-transparent text-slate-500 hover:text-pitbox-steel'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Odometer Audit Logs ({mileageLogs.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('service_history')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'service_history'
                ? 'border-pitbox-steel text-pitbox-steel'
                : 'border-transparent text-slate-500 hover:text-pitbox-steel'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Service History</span>
            <span className="text-[10px] bg-pitbox-seafoam text-pitbox-steel px-1.5 py-0.5 rounded font-mono">
              Step 4
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('reminders')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'reminders'
                ? 'border-pitbox-steel text-pitbox-steel'
                : 'border-transparent text-slate-500 hover:text-pitbox-steel'
            }`}
          >
            <Bell className="w-4 h-4" />
            <span>Reminders & Intervals</span>
            <span className="text-[10px] bg-pitbox-seafoam text-pitbox-steel px-1.5 py-0.5 rounded font-mono">
              Step 6
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('analytics')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'analytics'
                ? 'border-pitbox-steel text-pitbox-steel'
                : 'border-transparent text-slate-500 hover:text-pitbox-steel'
            }`}
          >
            <PieChart className="w-4 h-4" />
            <span>Costs & Analytics</span>
            <span className="text-[10px] bg-pitbox-seafoam text-pitbox-steel px-1.5 py-0.5 rounded font-mono">
              Step 6
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {activeTab === 'mileage_logs' && (
            <div className="bg-white rounded-2xl border border-pitbox-seafoam/60 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-pitbox-seafoam/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-pitbox-dark text-sm">Odometer Audit Trail</h4>
                  <p className="text-xs text-slate-500">
                    Immutable history recorded on manual updates and service entries.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickMileageOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-lg shadow-2xs transition"
                >
                  Log Reading
                </button>
              </div>

              {mileageLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  No odometer logs recorded yet.
                </div>
              ) : (
                <div className="divide-y divide-slate-100">
                  {mileageLogs.map((log, index) => (
                    <div key={log.id} className="px-6 py-3.5 flex items-center justify-between hover:bg-pitbox-cream/20 transition">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-lg bg-pitbox-glacier/20 text-pitbox-steel flex items-center justify-center text-xs font-bold">
                          #{mileageLogs.length - index}
                        </div>
                        <div>
                          <p className="text-sm font-extrabold text-pitbox-steel font-mono">
                            {log.mileage.toLocaleString()} km
                          </p>
                          <span className="text-[11px] text-slate-500">
                            Recorded on {log.recordedAt}
                          </span>
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] font-semibold bg-pitbox-cream px-2 py-0.5 rounded border border-pitbox-seafoam text-slate-600">
                          {log.source}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'service_history' && (
            <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-8 text-center">
              <FileText className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
              <h4 className="font-bold text-pitbox-dark">Service History & Invoices</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Step 4 will introduce line-item service entries (parts, labor, fluids), mechanic notes, and receipt attachments.
              </p>
            </div>
          )}

          {activeTab === 'reminders' && (
            <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-8 text-center">
              <ShieldCheck className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
              <h4 className="font-bold text-pitbox-dark">Reminders & Visual Gauges</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Step 6 will introduce Oil Life remaining gauges, inspection countdowns, and automated interval advancement.
              </p>
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-8 text-center">
              <PieChart className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
              <h4 className="font-bold text-pitbox-dark">Cost Statistics & TCO Analytics</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Step 6 will introduce monthly cost breakdown charts, cost-per-km metrics, and lifetime ownership expenditure tracking.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      <QuickMileageModal
        vehicle={vehicle}
        isOpen={isQuickMileageOpen}
        onClose={() => setIsQuickMileageOpen(false)}
        onSuccess={handleMileageUpdated}
      />

      <VehicleModal
        vehicle={vehicle}
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={(updated) => setVehicle(updated)}
      />
    </div>
  );
};
