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
  Plus,
  Wrench,
  Building2,
  Paperclip,
  UploadCloud,
  Eye,
  Download,
  ExternalLink,
} from 'lucide-react';
import { useParams, Link, useNavigate } from '../router/Router';
import { vehicleApi } from '../api/vehicleApi';
import { serviceRecordApi } from '../api/serviceRecordApi';
import { attachmentApi } from '../api/attachmentApi';
import { MileageLog, Vehicle } from '../types/vehicle';
import { ServiceCategory, ServiceRecord, Attachment } from '../types/serviceRecord';
import { compressVehicleImage } from '../utils/compression';
import { QuickMileageModal } from '../components/QuickMileageModal';
import { VehicleModal } from '../components/VehicleModal';
import { ServiceRecordModal } from '../components/ServiceRecordModal';
import { AttachmentLightbox } from '../components/AttachmentLightbox';
import { UploadAttachmentModal } from '../components/UploadAttachmentModal';

const CATEGORY_BADGES: Record<ServiceCategory, { label: string; classes: string }> = {
  MAINTENANCE: {
    label: 'Bežná údržba',
    classes: 'bg-pitbox-seafoam/60 text-pitbox-steel border-pitbox-seafoam',
  },
  REPAIR: {
    label: 'Oprava',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  INSPECTION: {
    label: 'Kontrola (STK / EK)',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  },
  OTHER: {
    label: 'Iné / Úpravy',
    classes: 'bg-slate-100 text-slate-700 border-slate-200',
  },
};

const FUEL_LABELS: Record<string, string> = {
  PETROL: 'Benzín',
  DIESEL: 'Nafta',
  HYBRID: 'Hybrid',
  EV: 'Elektro',
};

const ITEM_TYPE_LABELS: Record<string, string> = {
  PART: 'DIEL',
  FLUID: 'KVAPALINA',
  LABOR: 'PRÁCA',
};

export const VehicleDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [mileageLogs, setMileageLogs] = useState<MileageLog[]>([]);
  const [serviceRecords, setServiceRecords] = useState<ServiceRecord[]>([]);
  const [vehicleAttachments, setVehicleAttachments] = useState<Attachment[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [galleryFilter, setGalleryFilter] = useState<'ALL' | 'PHOTOS' | 'DOCS'>('ALL');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active tab
  const [activeTab, setActiveTab] = useState<
    'service_history' | 'mileage_logs' | 'documents' | 'reminders' | 'analytics'
  >('service_history');

  // Modals & upload
  const [isQuickMileageOpen, setIsQuickMileageOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isServiceModalOpen, setIsServiceModalOpen] = useState(false);
  const [isUploadAttachmentOpen, setIsUploadAttachmentOpen] = useState(false);
  const [editingServiceRecord, setEditingServiceRecord] = useState<ServiceRecord | null>(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxAttachments, setLightboxAttachments] = useState<Attachment[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const loadData = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError(null);
    try {
      const [vData, logsData, recordsData, attachmentsData] = await Promise.all([
        vehicleApi.getVehicle(id),
        vehicleApi.getMileageLogs(id),
        serviceRecordApi.getServiceRecords(id),
        attachmentApi.getAttachmentsByVehicle(id).catch(() => [] as Attachment[]),
      ]);
      setVehicle(vData);
      setMileageLogs(logsData);
      setServiceRecords(recordsData);
      setVehicleAttachments(attachmentsData);
    } catch {
      setError('Vozidlo sa nenašlo alebo sa nepodarilo načítať údaje.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshVehicleAndRecords = useCallback(async () => {
    if (!id) return;
    const [vData, logsData, recordsData, attachmentsData] = await Promise.all([
      vehicleApi.getVehicle(id),
      vehicleApi.getMileageLogs(id),
      serviceRecordApi.getServiceRecords(id),
      attachmentApi.getAttachmentsByVehicle(id).catch(() => [] as Attachment[]),
    ]);
    setVehicle(vData);
    setMileageLogs(logsData);
    setServiceRecords(recordsData);
    setVehicleAttachments(attachmentsData);
  }, [id]);

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !vehicle) return;

    setUploadingPhoto(true);
    try {
      const compressed = await compressVehicleImage(file);
      const updated = await vehicleApi.uploadPhoto(vehicle.id, compressed.file);
      setVehicle(updated);
    } catch {
      alert('Nepodarilo sa nahrať skomprimovanú fotografiu vozidla.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleDelete = async () => {
    if (!vehicle) return;
    const ok = window.confirm(`Odstrániť vozidlo ${vehicle.manufacturer} ${vehicle.model}? Túto akciu nie je možné vrátiť späť.`);
    if (!ok) return;

    try {
      await vehicleApi.deleteVehicle(vehicle.id);
      navigate('/garage', true);
    } catch {
      alert('Nepodarilo sa odstrániť vozidlo.');
    }
  };

  const handleMileageUpdated = (updated: Vehicle) => {
    setVehicle(updated);
    if (id) {
      vehicleApi.getMileageLogs(id).then(setMileageLogs);
    }
  };

  const handleDeleteServiceRecord = async (record: ServiceRecord) => {
    if (!vehicle) return;
    const ok = window.confirm(`Odstrániť servisný záznam zo dňa ${record.serviceDate}?`);
    if (!ok) return;

    try {
      await serviceRecordApi.deleteServiceRecord(vehicle.id, record.id);
      refreshVehicleAndRecords();
    } catch {
      alert('Nepodarilo sa odstrániť servisný záznam.');
    }
  };

  const handleDeleteAttachment = async (recordId: string, attachmentId: string) => {
    if (!vehicle) return;
    const ok = window.confirm('Naozaj chcete odstrániť túto prílohu?');
    if (!ok) return;

    try {
      await attachmentApi.deleteAttachment(vehicle.id, recordId, attachmentId);
      refreshVehicleAndRecords();
    } catch {
      alert('Nepodarilo sa odstrániť prílohu.');
    }
  };

  const openLightbox = (items: Attachment[], index: number) => {
    setLightboxAttachments(items);
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const filteredServiceRecords =
    selectedCategory === 'ALL'
      ? serviceRecords
      : serviceRecords.filter((r) => r.category === selectedCategory);

  const totalServiceSpend = filteredServiceRecords.reduce((acc, r) => acc + Number(r.totalCost || 0), 0);

  const filteredAttachments = vehicleAttachments.filter((a) => {
    if (galleryFilter === 'PHOTOS') return a.contentType.startsWith('image/');
    if (galleryFilter === 'DOCS') return a.contentType === 'application/pdf';
    return true;
  });

  if (loading) {
    return (
      <div className="flex-1 max-w-7xl mx-auto px-4 py-12 w-full flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3 text-slate-500">
          <Car className="w-10 h-10 text-pitbox-glacier animate-bounce" />
          <p className="text-sm font-semibold">Načítava sa profil vozidla...</p>
        </div>
      </div>
    );
  }

  if (error || !vehicle) {
    return (
      <div className="flex-1 max-w-xl mx-auto px-4 py-16 w-full text-center">
        <div className="bg-white p-8 rounded-2xl border border-rose-200 shadow-sm">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
          <h2 className="text-xl font-bold text-pitbox-dark">Profil vozidla nie je k dispozícii</h2>
          <p className="text-sm text-slate-600 mt-2">{error || 'Vozidlo sa nepodarilo nájsť.'}</p>
          <div className="mt-6">
            <Link
              to="/garage"
              className="inline-flex items-center px-4 py-2 rounded-lg text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90"
            >
              <ArrowLeft className="w-4 h-4 mr-1.5" />
              Späť do garáže
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
          Späť do garáže
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
              <span className="text-sm font-medium mt-2 text-slate-400">Profilová fotografia nebola nahraná</span>
            </div>
          )}

          {/* Dark gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          {/* Change photo button */}
          <label className="absolute top-4 right-4 inline-flex items-center px-3 py-1.5 rounded-xl bg-black/50 hover:bg-black/70 backdrop-blur-md text-white text-xs font-semibold cursor-pointer border border-white/20 transition shadow-sm">
            <Camera className="w-4 h-4 mr-1.5 text-pitbox-seafoam" />
            <span>{uploadingPhoto ? 'Kompresia a nahrávanie...' : 'Zmeniť fotku'}</span>
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
                  {FUEL_LABELS[vehicle.fuelType] || vehicle.fuelType}
                </span>
                <span className="text-white/80 text-xs font-semibold">
                  Rok {vehicle.manufactureYear}
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
            <span className="text-xs text-slate-600 font-medium uppercase tracking-wide">Aktuálny stav tachometra:</span>
            <span className="text-lg font-extrabold text-pitbox-steel font-mono">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
            <button
              type="button"
              onClick={() => setIsQuickMileageOpen(true)}
              className="ml-2 inline-flex items-center px-2.5 py-1 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-lg shadow-2xs transition"
            >
              + Rýchla úprava
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <button
              type="button"
              onClick={() => {
                setEditingServiceRecord(null);
                setIsServiceModalOpen(true);
              }}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Zapísať servis
            </button>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(true)}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-pitbox-steel bg-white border border-pitbox-seafoam hover:bg-pitbox-seafoam/20 transition"
            >
              <Edit3 className="w-3.5 h-3.5 mr-1.5" />
              Upraviť údaje
            </button>
            <button
              type="button"
              onClick={handleDelete}
              className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs font-semibold text-rose-600 bg-white border border-rose-200 hover:bg-rose-50 transition"
            >
              <Trash2 className="w-3.5 h-3.5 mr-1.5" />
              Odstrániť vozidlo
            </button>
          </div>
        </div>
      </div>

      {/* Technical Specifications Grid */}
      <div className="mt-8 bg-white rounded-2xl border border-pitbox-seafoam/60 p-6 shadow-xs">
        <h3 className="text-sm font-bold text-pitbox-steel uppercase tracking-wider mb-4">
          Technické špecifikácie vozidla
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Car className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Značka a model</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark truncate">
              {vehicle.manufacturer} {vehicle.model}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Calendar className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Rok výroby</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark font-mono">
              {vehicle.manufactureYear}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Fuel className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Druh paliva</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark uppercase">
              {FUEL_LABELS[vehicle.fuelType] || vehicle.fuelType}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Cpu className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>Motorizácia</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark truncate">
              {vehicle.engineInfo || 'Neuvedené'}
            </p>
          </div>

          <div className="bg-pitbox-cream/40 p-3 rounded-xl border border-pitbox-seafoam/40 sm:col-span-2">
            <div className="flex items-center space-x-1.5 text-xs text-slate-500 mb-1">
              <Hash className="w-3.5 h-3.5 text-pitbox-glacier" />
              <span>VIN číslo</span>
            </div>
            <p className="text-sm font-bold text-pitbox-dark font-mono tracking-wider truncate">
              {vehicle.vin || 'Neuvedené'}
            </p>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-8">
        <div className="border-b border-pitbox-seafoam/60 flex flex-wrap gap-6">
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
            <span>Servisná história ({serviceRecords.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('documents')}
            className={`pb-3 text-sm font-bold flex items-center space-x-2 border-b-2 transition ${
              activeTab === 'documents'
                ? 'border-pitbox-steel text-pitbox-steel'
                : 'border-transparent text-slate-500 hover:text-pitbox-steel'
            }`}
          >
            <Paperclip className="w-4 h-4" />
            <span>Dokumenty a galéria ({vehicleAttachments.length})</span>
          </button>

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
            <span>História tachometra ({mileageLogs.length})</span>
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
            <span>Pripomienky a intervaly</span>
            <span className="text-[10px] bg-pitbox-seafoam text-pitbox-steel px-1.5 py-0.5 rounded font-mono">
              Krok 6
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
            <span>Náklady a štatistiky</span>
            <span className="text-[10px] bg-pitbox-seafoam text-pitbox-steel px-1.5 py-0.5 rounded font-mono">
              Krok 6
            </span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="mt-6">
          {/* 1. SERVICE HISTORY TAB */}
          {activeTab === 'service_history' && (
            <div className="space-y-6">
              {/* Filter & Summary Bar */}
              <div className="bg-white rounded-2xl border border-pitbox-seafoam/60 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-1.5">
                  {(['ALL', 'MAINTENANCE', 'REPAIR', 'INSPECTION', 'OTHER'] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
                        selectedCategory === cat
                          ? 'bg-pitbox-steel text-white shadow-2xs'
                          : 'bg-pitbox-cream/60 text-slate-600 hover:bg-pitbox-seafoam/30'
                      }`}
                    >
                      {cat === 'ALL' ? 'Všetky záznamy' : CATEGORY_BADGES[cat].label}
                    </button>
                  ))}
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4">
                  <div className="text-right">
                    <span className="text-[10px] uppercase tracking-wider text-slate-500 block font-semibold">
                      Súčet filtrovaných
                    </span>
                    <span className="text-base font-extrabold text-pitbox-steel font-mono">
                      €{totalServiceSpend.toFixed(2)}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceRecord(null);
                      setIsServiceModalOpen(true);
                    }}
                    className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Nový servisný záznam
                  </button>
                </div>
              </div>

              {/* Timeline List */}
              {filteredServiceRecords.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-10 text-center">
                  <Wrench className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
                  <h4 className="font-bold text-pitbox-dark">Žiadne servisné záznamy</h4>
                  <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                    Zaznamenajte prvú návštevu servisu, výmenu oleja alebo kontrolu STK s podrobným rozpisom dielov, práce a príloh.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingServiceRecord(null);
                      setIsServiceModalOpen(true);
                    }}
                    className="mt-4 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl shadow-xs transition"
                  >
                    <Plus className="w-4 h-4 mr-1" />
                    Pridať prvý servisný záznam
                  </button>
                </div>
              ) : (
                <div className="relative pl-6 border-l-2 border-pitbox-seafoam space-y-6">
                  {filteredServiceRecords.map((record) => {
                    const badge = CATEGORY_BADGES[record.category] || CATEGORY_BADGES.OTHER;
                    const recordAttachments = record.attachments || [];

                    return (
                      <div key={record.id} className="relative bg-white rounded-2xl border border-pitbox-seafoam/60 shadow-xs overflow-hidden">
                        {/* Timeline Node Dot */}
                        <div className="absolute -left-[31px] top-6 w-3.5 h-3.5 rounded-full bg-pitbox-steel border-2 border-white" />

                        {/* Card Header */}
                        <div className="px-6 py-4 bg-pitbox-cream/40 border-b border-pitbox-seafoam/40 flex flex-wrap items-center justify-between gap-3">
                          <div className="flex flex-wrap items-center gap-2.5">
                            <span className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full border ${badge.classes}`}>
                              {badge.label}
                            </span>
                            <span className="text-xs font-bold text-pitbox-dark font-mono flex items-center">
                              <Calendar className="w-3.5 h-3.5 mr-1 text-pitbox-glacier" />
                              {record.serviceDate}
                            </span>
                            <span className="text-xs font-extrabold text-pitbox-steel font-mono bg-white px-2 py-0.5 rounded border border-pitbox-seafoam/60">
                              {record.mileageAtService.toLocaleString()} km
                            </span>
                            {record.workshopName && (
                              <span className="text-xs text-slate-600 flex items-center">
                                <Building2 className="w-3.5 h-3.5 mr-1 text-slate-400" />
                                {record.workshopName}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center space-x-3">
                            <span className="text-base font-extrabold text-pitbox-steel font-mono">
                              €{Number(record.totalCost).toFixed(2)}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setEditingServiceRecord(record);
                                setIsServiceModalOpen(true);
                              }}
                              aria-label="Upraviť servisný záznam"
                              className="p-1.5 text-slate-500 hover:text-pitbox-steel rounded-lg hover:bg-white transition"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteServiceRecord(record)}
                              aria-label="Odstrániť servisný záznam"
                              className="p-1.5 text-slate-500 hover:text-rose-600 rounded-lg hover:bg-white transition"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Line Items Table */}
                        <div className="px-6 py-4">
                          <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                              <thead>
                                <tr className="border-b border-slate-100 text-[10px] font-bold uppercase text-slate-400 tracking-wider">
                                  <th className="pb-2">Popis položky</th>
                                  <th className="pb-2">Typ</th>
                                  <th className="pb-2 text-center">Mn.</th>
                                  <th className="pb-2 text-right">Jedn. cena</th>
                                  <th className="pb-2 text-right">Spolu</th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-slate-100 text-xs">
                                {record.items.map((item, idx) => (
                                  <tr key={item.id || idx}>
                                    <td className="py-2 font-semibold text-pitbox-dark">{item.name}</td>
                                    <td className="py-2">
                                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-mono">
                                        {ITEM_TYPE_LABELS[item.itemType] || item.itemType}
                                      </span>
                                    </td>
                                    <td className="py-2 text-center font-mono text-slate-600">{item.quantity}</td>
                                    <td className="py-2 text-right font-mono text-slate-600">
                                      €{Number(item.unitPrice).toFixed(2)}
                                    </td>
                                    <td className="py-2 text-right font-mono font-bold text-pitbox-dark">
                                      €{Number(item.totalPrice ?? item.quantity * item.unitPrice).toFixed(2)}
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>

                          {record.notes && (
                            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                              <span className="font-semibold text-pitbox-dark mr-1">Poznámky:</span>
                              {record.notes}
                            </div>
                          )}

                          {/* Attachments Section in Card */}
                          {recordAttachments.length > 0 && (
                            <div className="mt-3 pt-3 border-t border-slate-100">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-2 flex items-center">
                                <Paperclip className="w-3 h-3 mr-1 text-pitbox-glacier" />
                                Prílohy a doklady ({recordAttachments.length})
                              </span>

                              <div className="flex flex-wrap items-center gap-2">
                                {/* Image thumbnails */}
                                {recordAttachments
                                  .filter((a) => !a.contentType.includes('pdf'))
                                  .map((img) => (
                                    <button
                                      key={img.id}
                                      type="button"
                                      onClick={() => openLightbox(recordAttachments, recordAttachments.indexOf(img))}
                                      className="group relative w-12 h-12 rounded-lg overflow-hidden border border-pitbox-seafoam/80 hover:border-pitbox-steel transition shadow-2xs focus:outline-none focus:ring-2 focus:ring-pitbox-steel/40"
                                    >
                                      <img
                                        src={img.storagePath}
                                        alt={img.fileName}
                                        className="w-full h-full object-cover transition duration-150 group-hover:scale-110"
                                        loading="lazy"
                                      />
                                      <div className="absolute inset-0 bg-pitbox-dark/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                        <Eye className="w-3.5 h-3.5 text-white" />
                                      </div>
                                    </button>
                                  ))}

                                {/* PDF document pills */}
                                {recordAttachments
                                  .filter((a) => a.contentType.includes('pdf'))
                                  .map((doc) => (
                                    <a
                                      key={doc.id}
                                      href={doc.storagePath}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="inline-flex items-center px-2.5 py-1.5 rounded-lg border border-slate-200 bg-pitbox-cream/40 hover:bg-white hover:border-pitbox-glacier text-xs text-pitbox-dark transition shadow-2xs max-w-[220px]"
                                    >
                                      <FileText className="w-3.5 h-3.5 text-rose-600 mr-1.5 shrink-0" />
                                      <span className="truncate text-xs font-semibold mr-1.5">{doc.fileName}</span>
                                      <span className="text-[10px] text-slate-400 font-mono shrink-0">
                                        {(doc.fileSizeBytes / 1024).toFixed(0)} KB
                                      </span>
                                      <ExternalLink className="w-3 h-3 ml-1 text-slate-400 shrink-0" />
                                    </a>
                                  ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 2. DOCUMENTS & GALLERY TAB */}
          {activeTab === 'documents' && (
            <div className="space-y-6">
              {/* Filter & Upload Toolbar */}
              <div className="bg-white rounded-2xl border border-pitbox-seafoam/60 p-4 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                {/* Filter Pills */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {[
                    { key: 'ALL', label: 'Všetko', count: vehicleAttachments.length },
                    {
                      key: 'PHOTOS',
                      label: 'Fotografie',
                      count: vehicleAttachments.filter((a) => !a.contentType.includes('pdf')).length,
                    },
                    {
                      key: 'DOCS',
                      label: 'Faktúry a dokumenty (PDF)',
                      count: vehicleAttachments.filter((a) => a.contentType.includes('pdf')).length,
                    },
                  ].map((f) => (
                    <button
                      key={f.key}
                      type="button"
                      onClick={() => setGalleryFilter(f.key as 'ALL' | 'PHOTOS' | 'DOCS')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold transition flex items-center space-x-1.5 ${
                        galleryFilter === f.key
                          ? 'bg-pitbox-steel text-white shadow-2xs'
                          : 'bg-pitbox-cream/60 text-slate-600 hover:bg-pitbox-seafoam/30'
                      }`}
                    >
                      <span>{f.label}</span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                          galleryFilter === f.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
                        }`}
                      >
                        {f.count}
                      </span>
                    </button>
                  ))}
                </div>

                {/* Direct Upload Action */}
                <button
                  type="button"
                  onClick={() => setIsUploadAttachmentOpen(true)}
                  className="inline-flex items-center px-3.5 py-2 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl shadow-xs transition shrink-0"
                >
                  <UploadCloud className="w-4 h-4 mr-1.5" />
                  Nahrať prílohu
                </button>
              </div>

              {/* Empty State */}
              {filteredAttachments.length === 0 ? (
                <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-12 text-center">
                  <div className="w-12 h-12 rounded-full bg-pitbox-seafoam/40 flex items-center justify-center text-pitbox-steel mx-auto mb-3">
                    <Paperclip className="w-6 h-6 text-pitbox-glacier" />
                  </div>
                  <h4 className="font-bold text-pitbox-dark text-base">Žiadne dokumenty ani fotografie</h4>
                  <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                    Nahrajte servisné faktúry, protokoly technickej a emisnej kontroly (STK/EK) alebo fotografie dielov a opráv.
                  </p>
                  <button
                    type="button"
                    onClick={() => setIsUploadAttachmentOpen(true)}
                    className="mt-4 inline-flex items-center px-4 py-2 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl shadow-xs transition"
                  >
                    <UploadCloud className="w-4 h-4 mr-1.5" />
                    Nahrať prvú prílohu
                  </button>
                </div>
              ) : (
                /* Responsive Gallery Grid */
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                  {filteredAttachments.map((att) => {
                    const isPdf = att.contentType.includes('pdf');
                    const linkedRecord = serviceRecords.find((r) => r.id === att.serviceRecordId);

                    return (
                      <div
                        key={att.id}
                        className="group bg-white rounded-2xl border border-pitbox-seafoam/60 shadow-xs overflow-hidden flex flex-col transition hover:shadow-md hover:border-pitbox-glacier"
                      >
                        {/* Media Thumbnail Container */}
                        <div className="relative aspect-4/3 bg-pitbox-cream/50 overflow-hidden flex items-center justify-center">
                          {isPdf ? (
                            <div className="flex flex-col items-center justify-center p-4 text-center">
                              <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-1 font-bold text-sm shadow-2xs">
                                PDF
                              </div>
                              <span className="text-[10px] text-slate-400 font-mono">
                                {(att.fileSizeBytes / 1024).toFixed(0)} KB
                              </span>
                            </div>
                          ) : (
                            <img
                              src={att.storagePath}
                              alt={att.fileName}
                              className="w-full h-full object-cover transition duration-200 group-hover:scale-105"
                              loading="lazy"
                            />
                          )}

                          {/* Hover overlay with action buttons */}
                          <div className="absolute inset-0 bg-pitbox-dark/60 opacity-0 group-hover:opacity-100 flex items-center justify-center space-x-2 transition p-2">
                            {isPdf ? (
                              <a
                                href={att.storagePath}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="p-2 bg-white text-pitbox-steel rounded-lg hover:bg-pitbox-seafoam transition shadow-xs"
                                title="Otvoriť PDF"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <button
                                type="button"
                                onClick={() => openLightbox(filteredAttachments, filteredAttachments.indexOf(att))}
                                className="p-2 bg-white text-pitbox-steel rounded-lg hover:bg-pitbox-seafoam transition shadow-xs"
                                title="Zväčšiť fotografiu"
                              >
                                <Eye className="w-4 h-4" />
                              </button>
                            )}
                            <a
                              href={att.storagePath}
                              download={att.fileName}
                              className="p-2 bg-white text-pitbox-steel rounded-lg hover:bg-pitbox-seafoam transition shadow-xs"
                              title="Stiahnuť súbor"
                            >
                              <Download className="w-4 h-4" />
                            </a>
                            <button
                              type="button"
                              onClick={() => handleDeleteAttachment(att.serviceRecordId, att.id)}
                              className="p-2 bg-white text-rose-600 rounded-lg hover:bg-rose-50 transition shadow-xs"
                              title="Odstrániť prílohu"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>

                        {/* Card Meta Footer */}
                        <div className="p-3 flex flex-col justify-between flex-1 bg-white">
                          <div>
                            <p
                              className="text-xs font-bold text-pitbox-dark truncate"
                              title={att.fileName}
                            >
                              {att.fileName}
                            </p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">
                              {new Date(att.uploadedAt).toLocaleDateString('sk-SK')} • {(att.fileSizeBytes / 1024).toFixed(0)} KB
                            </p>
                          </div>

                          {/* Linked Service Badge */}
                          <div className="mt-2.5 pt-2 border-t border-slate-100">
                            {linkedRecord ? (
                              <span
                                className="inline-block max-w-full truncate text-[10px] font-bold text-pitbox-steel bg-pitbox-seafoam/50 px-2 py-0.5 rounded"
                                title={`${linkedRecord.serviceDate} (${linkedRecord.mileageAtService.toLocaleString()} km)`}
                              >
                                Servis {linkedRecord.serviceDate}
                              </span>
                            ) : (
                              <span className="text-[10px] text-slate-400 italic">Príloha servisu</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* 3. MILEAGE LOGS TAB */}
          {activeTab === 'mileage_logs' && (
            <div className="bg-white rounded-2xl border border-pitbox-seafoam/60 overflow-hidden shadow-xs">
              <div className="px-6 py-4 border-b border-pitbox-seafoam/40 flex items-center justify-between">
                <div>
                  <h4 className="font-bold text-pitbox-dark text-sm">Auditná história tachometra</h4>
                  <p className="text-xs text-slate-500">
                    Nemenná história zaznamenaná pri manuálnych úpravách a servisných záznamoch.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setIsQuickMileageOpen(true)}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-lg shadow-2xs transition"
                >
                  Zapísať stav
                </button>
              </div>

              {mileageLogs.length === 0 ? (
                <div className="p-8 text-center text-slate-500 text-sm">
                  Zatiaľ neboli zaznamenané žiadne záznamy tachometra.
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
                            Zaznamenané dňa {log.recordedAt}
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

          {/* 4. REMINDERS TAB */}
          {activeTab === 'reminders' && (
            <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-8 text-center">
              <ShieldCheck className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
              <h4 className="font-bold text-pitbox-dark">Pripomienky a vizuálne ukazovatele</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Krok 6 prinesie ukazovatele zostávajúcej životnosti oleja, odpočítavanie do STK a automatické posúvanie intervalov.
              </p>
            </div>
          )}

          {/* 5. ANALYTICS TAB */}
          {activeTab === 'analytics' && (
            <div className="bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-8 text-center">
              <PieChart className="w-10 h-10 text-pitbox-glacier mx-auto mb-2" />
              <h4 className="font-bold text-pitbox-dark">Štatistiky nákladov a TCO analytika</h4>
              <p className="text-xs text-slate-600 mt-1 max-w-md mx-auto">
                Krok 6 prinesie grafy mesačných nákladov, metriky nákladov na kilometer a sledovanie celkových výdavkov na vozidlo.
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

      <ServiceRecordModal
        vehicleId={vehicle.id}
        currentVehicleMileage={vehicle.currentMileage}
        record={editingServiceRecord}
        isOpen={isServiceModalOpen}
        onClose={() => {
          setIsServiceModalOpen(false);
          setEditingServiceRecord(null);
        }}
        onSuccess={() => {
          refreshVehicleAndRecords();
        }}
      />

      <UploadAttachmentModal
        vehicleId={vehicle.id}
        serviceRecords={serviceRecords}
        isOpen={isUploadAttachmentOpen}
        onClose={() => setIsUploadAttachmentOpen(false)}
        onSuccess={() => {
          refreshVehicleAndRecords();
        }}
      />

      <AttachmentLightbox
        attachments={lightboxAttachments}
        currentIndex={lightboxIndex}
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        onNavigate={(idx) => setLightboxIndex(idx)}
      />
    </div>
  );
};
