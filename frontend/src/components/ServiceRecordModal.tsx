import React, { useState, useEffect, useRef } from 'react';
import { X, Wrench, Plus, Trash2, AlertCircle, Gauge, Paperclip, UploadCloud, Loader2 } from 'lucide-react';
import { serviceRecordApi } from '../api/serviceRecordApi';
import { attachmentApi } from '../api/attachmentApi';
import { compressServiceAttachment } from '../utils/compression';
import {
  CreateServiceItemPayload,
  CreateServiceRecordPayload,
  ServiceCategory,
  ServiceItemType,
  ServiceRecord,
  Attachment,
} from '../types/serviceRecord';

interface ServiceRecordModalProps {
  vehicleId: string;
  currentVehicleMileage: number;
  record?: ServiceRecord | null;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (saved: ServiceRecord) => void;
}

const CATEGORIES: { value: ServiceCategory; label: string }[] = [
  { value: 'MAINTENANCE', label: 'Bežná údržba' },
  { value: 'REPAIR', label: 'Mechanická oprava' },
  { value: 'INSPECTION', label: 'Technická a emisná kontrola (STK / EK)' },
  { value: 'OTHER', label: 'Iné / Úpravy' },
];

const ITEM_TYPES: { value: ServiceItemType; label: string }[] = [
  { value: 'PART', label: 'Diel' },
  { value: 'FLUID', label: 'Kvapalina / Olej' },
  { value: 'LABOR', label: 'Práca' },
];

interface DraftItem {
  name: string;
  itemType: ServiceItemType;
  quantity: string | number;
  unitPrice: string | number;
}

export const ServiceRecordModal: React.FC<ServiceRecordModalProps> = ({
  vehicleId,
  currentVehicleMileage,
  record,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const isEditing = Boolean(record);

  const todayIso = new Date().toISOString().split('T')[0];

  const [serviceDate, setServiceDate] = useState(record?.serviceDate || todayIso);
  const [mileageAtService, setMileageAtService] = useState<string | number>(
    record?.mileageAtService ?? currentVehicleMileage
  );
  const [category, setCategory] = useState<ServiceCategory>(record?.category || 'MAINTENANCE');
  const [workshopName, setWorkshopName] = useState(record?.workshopName || '');
  const [notes, setNotes] = useState(record?.notes || '');
  const [items, setItems] = useState<DraftItem[]>(
    record?.items && record.items.length > 0
      ? record.items.map((i) => ({
          name: i.name,
          itemType: i.itemType,
          quantity: i.quantity,
          unitPrice: i.unitPrice,
        }))
      : [{ name: '', itemType: 'PART', quantity: 1, unitPrice: '' }]
  );

  // Attachments state
  const [existingAttachments, setExistingAttachments] = useState<Attachment[]>(
    record?.attachments || []
  );
  const [queuedFiles, setQueuedFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      setServiceDate(record?.serviceDate || new Date().toISOString().split('T')[0]);
      setMileageAtService(record?.mileageAtService ?? currentVehicleMileage);
      setCategory(record?.category || 'MAINTENANCE');
      setWorkshopName(record?.workshopName || '');
      setNotes(record?.notes || '');
      setItems(
        record?.items && record.items.length > 0
          ? record.items.map((i) => ({
              name: i.name,
              itemType: i.itemType,
              quantity: i.quantity,
              unitPrice: i.unitPrice,
            }))
          : [{ name: '', itemType: 'PART', quantity: 1, unitPrice: '' }]
      );
      setExistingAttachments(record?.attachments || []);
      setQueuedFiles([]);
      setError(null);
    }
  }, [isOpen, record, currentVehicleMileage]);

  if (!isOpen) return null;

  const handleAddItem = () => {
    setItems((prev) => [...prev, { name: '', itemType: 'PART', quantity: 1, unitPrice: '' }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleItemChange = (index: number, field: keyof DraftItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, idx) => (idx === index ? { ...item, [field]: value } : item))
    );
  };

  const computeLineTotal = (item: DraftItem): number => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return Math.max(0, qty * price);
  };

  const grandTotal = items.reduce((sum, item) => sum + computeLineTotal(item), 0);
  const parsedMileage = Number(mileageAtService) || 0;
  const willAdvanceOdometer = parsedMileage > currentVehicleMileage;

  const handleFileDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const newFiles = Array.from(e.dataTransfer.files);
      setQueuedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFiles = Array.from(e.target.files);
      setQueuedFiles((prev) => [...prev, ...newFiles]);
    }
  };

  const handleRemoveQueuedFile = (index: number) => {
    setQueuedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleDeleteExistingAttachment = async (attachmentId: string) => {
    if (!record) return;
    if (!window.confirm('Naozaj chcete odstrániť túto prílohu?')) return;

    try {
      await attachmentApi.deleteAttachment(vehicleId, record.id, attachmentId);
      setExistingAttachments((prev) => prev.filter((a) => a.id !== attachmentId));
    } catch {
      alert('Nepodarilo sa odstrániť prílohu.');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!serviceDate) {
      setError('Dátum servisu je povinný.');
      return;
    }

    if (isNaN(parsedMileage) || parsedMileage < 0) {
      setError('Zadajte platný nezáporný stav tachometra.');
      return;
    }

    const validItems: CreateServiceItemPayload[] = [];
    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      const nameTrimmed = row.name.trim();
      const qty = Number(row.quantity);
      const unitPrice = Number(row.unitPrice);

      if (!nameTrimmed) {
        setError(`Položka č. ${i + 1} vyžaduje popis.`);
        return;
      }
      if (isNaN(qty) || qty < 1) {
        setError(`Množstvo položky č. ${i + 1} musí byť aspoň 1.`);
        return;
      }
      if (isNaN(unitPrice) || unitPrice < 0) {
        setError(`Jednotková cena položky č. ${i + 1} nemôže byť záporná.`);
        return;
      }

      validItems.push({
        name: nameTrimmed,
        itemType: row.itemType,
        quantity: Math.floor(qty),
        unitPrice: Number(unitPrice.toFixed(2)),
      });
    }

    const payload: CreateServiceRecordPayload = {
      serviceDate,
      mileageAtService: Math.floor(parsedMileage),
      category,
      workshopName: workshopName.trim() || undefined,
      notes: notes.trim() || undefined,
      items: validItems,
    };

    setLoading(true);
    setError(null);
    try {
      const saved =
        isEditing && record
          ? await serviceRecordApi.updateServiceRecord(vehicleId, record.id, payload)
          : await serviceRecordApi.createServiceRecord(vehicleId, payload);

      // Upload queued attachments if any
      if (queuedFiles.length > 0) {
        const processedFiles: File[] = [];
        for (const file of queuedFiles) {
          if (file.type.startsWith('image/')) {
            const compressed = await compressServiceAttachment(file);
            processedFiles.push(compressed);
          } else {
            processedFiles.push(file);
          }
        }
        const uploadedAttachments = await attachmentApi.uploadAttachments(
          vehicleId,
          saved.id,
          processedFiles
        );
        saved.attachments = [...(saved.attachments || []), ...uploadedAttachments];
      }

      onSuccess(saved);
      onClose();
    } catch (err: unknown) {
      const errorMessage =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Nepodarilo sa uložiť servisný záznam.';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitbox-dark/60 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white w-full max-w-3xl rounded-2xl shadow-xl border border-pitbox-seafoam/60 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-pitbox-steel text-white">
          <div className="flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-pitbox-seafoam" />
            <h3 className="font-bold text-lg">
              {isEditing ? 'Upraviť servisný záznam' : 'Nový servisný záznam'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvoriť"
            className="p-1 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[82vh] overflow-y-auto">
          {error && (
            <div className="flex items-start space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Header Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="service-date" className="block text-xs font-semibold text-pitbox-dark mb-1">
                Dátum servisu *
              </label>
              <input
                id="service-date"
                type="date"
                required
                value={serviceDate}
                onChange={(e) => setServiceDate(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono"
              />
            </div>

            <div>
              <label htmlFor="service-mileage" className="block text-xs font-semibold text-pitbox-dark mb-1">
                Stav tachometra pri servise (km) *
              </label>
              <input
                id="service-mileage"
                type="number"
                min={0}
                required
                value={mileageAtService}
                onChange={(e) => setMileageAtService(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm font-mono font-bold"
              />
              <div className="mt-1 flex items-center text-[11px]">
                <Gauge className="w-3.5 h-3.5 mr-1 text-pitbox-glacier shrink-0" />
                {willAdvanceOdometer ? (
                  <span className="text-emerald-700 font-semibold">
                    Automaticky navýši tachometer vozidla z {currentVehicleMileage.toLocaleString()} km
                  </span>
                ) : (
                  <span className="text-slate-500">
                    Historický záznam (aktuálny stav tachometra zostáva {currentVehicleMileage.toLocaleString()} km)
                  </span>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="service-category" className="block text-xs font-semibold text-pitbox-dark mb-1">
                Kategória servisu *
              </label>
              <select
                id="service-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as ServiceCategory)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm bg-white"
              >
                {CATEGORIES.map((c) => (
                  <option key={c.value} value={c.value}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="service-workshop" className="block text-xs font-semibold text-pitbox-dark mb-1">
                Názov servisu / svojpomocne
              </label>
              <input
                id="service-workshop"
                type="text"
                value={workshopName}
                onChange={(e) => setWorkshopName(e.target.value)}
                placeholder="napr. Autorizovaný servis, Bosch Car Service alebo svojpomocne"
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm"
              />
            </div>
          </div>

          {/* Dynamic Line Items */}
          <div className="bg-pitbox-cream/40 p-4 rounded-xl border border-pitbox-seafoam/60">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-xs font-bold text-pitbox-steel uppercase tracking-wider">
                  Položky servisu (Diely, kvapaliny a práca) *
                </h4>
                <p className="text-[11px] text-slate-500">
                  Pridajte jednotlivé položky faktúry; celková suma sa vypočíta automaticky.
                </p>
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="inline-flex items-center px-3 py-1.5 text-xs font-bold text-pitbox-steel bg-white hover:bg-pitbox-seafoam/30 border border-pitbox-seafoam rounded-lg transition shadow-2xs"
              >
                <Plus className="w-3.5 h-3.5 mr-1" />
                Pridať položku
              </button>
            </div>

            <div className="space-y-2.5">
              {items.map((item, idx) => {
                const lineTotal = computeLineTotal(item);
                return (
                  <div
                    key={idx}
                    className="grid grid-cols-12 gap-2 items-center bg-white p-2.5 rounded-lg border border-slate-200/80 shadow-2xs"
                  >
                    <div className="col-span-12 sm:col-span-5">
                      <label className="block text-[10px] font-semibold text-slate-500 sm:hidden mb-0.5">
                        Popis
                      </label>
                      <input
                        type="text"
                        required
                        aria-label={`Popis položky ${idx + 1}`}
                        value={item.name}
                        onChange={(e) => handleItemChange(idx, 'name', e.target.value)}
                        placeholder="napr. Motorový olej 5W-30, Olejový filter, Práca"
                        className="w-full px-2.5 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-pitbox-steel text-xs"
                      />
                    </div>

                    <div className="col-span-4 sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 sm:hidden mb-0.5">
                        Typ
                      </label>
                      <select
                        aria-label={`Typ položky ${idx + 1}`}
                        value={item.itemType}
                        onChange={(e) => handleItemChange(idx, 'itemType', e.target.value as ServiceItemType)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-pitbox-steel text-xs bg-white"
                      >
                        {ITEM_TYPES.map((t) => (
                          <option key={t.value} value={t.value}>
                            {t.label}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="col-span-3 sm:col-span-1">
                      <label className="block text-[10px] font-semibold text-slate-500 sm:hidden mb-0.5">
                        Mn.
                      </label>
                      <input
                        type="number"
                        min={1}
                        required
                        aria-label={`Množstvo položky ${idx + 1}`}
                        value={item.quantity}
                        onChange={(e) => handleItemChange(idx, 'quantity', e.target.value)}
                        className="w-full px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-pitbox-steel text-xs font-mono text-center"
                      />
                    </div>

                    <div className="col-span-3 sm:col-span-2">
                      <label className="block text-[10px] font-semibold text-slate-500 sm:hidden mb-0.5">
                        Cena (€)
                      </label>
                      <input
                        type="number"
                        min={0}
                        step="0.01"
                        required
                        aria-label={`Jednotková cena položky ${idx + 1}`}
                        value={item.unitPrice}
                        onChange={(e) => handleItemChange(idx, 'unitPrice', e.target.value)}
                        placeholder="0.00"
                        className="w-full px-2 py-1.5 rounded border border-slate-300 focus:outline-none focus:border-pitbox-steel text-xs font-mono text-right"
                      />
                    </div>

                    <div className="col-span-2 sm:col-span-2 flex items-center justify-end space-x-1.5">
                      <span className="text-xs font-extrabold text-pitbox-dark font-mono">
                        €{lineTotal.toFixed(2)}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(idx)}
                        disabled={items.length <= 1}
                        title="Odstrániť položku"
                        className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-3 pt-3 border-t border-pitbox-seafoam/60 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                Vypočítaná celková cena
              </span>
              <span className="text-lg font-extrabold text-pitbox-steel font-mono">
                €{grandTotal.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Attachments Section */}
          <div className="bg-pitbox-cream/30 p-4 rounded-xl border border-pitbox-seafoam/60 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-pitbox-steel uppercase tracking-wider flex items-center">
                  <Paperclip className="w-3.5 h-3.5 mr-1 text-pitbox-glacier" />
                  Prílohy a dokumentácia (Faktúry, STK protokoly, foto)
                </h4>
                <p className="text-[11px] text-slate-500">
                  Podporované formáty: JPG, PNG, WEBP a PDF (max. 10 MB na súbor). Fotografie sú komprimované v prehliadači.
                </p>
              </div>
              <span className="text-[11px] font-mono font-bold text-slate-500 bg-white px-2 py-0.5 rounded border border-slate-200">
                {existingAttachments.length + queuedFiles.length} súborov
              </span>
            </div>

            {/* Dropzone */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleFileDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`cursor-pointer rounded-xl border-2 border-dashed p-4 text-center transition flex flex-col items-center justify-center gap-1.5 ${
                isDragging
                  ? 'border-pitbox-steel bg-pitbox-seafoam/30 scale-[0.99]'
                  : 'border-slate-300 bg-white hover:border-pitbox-glacier hover:bg-pitbox-cream/20'
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileInputChange}
              />
              <div className="w-8 h-8 rounded-full bg-pitbox-seafoam/50 flex items-center justify-center text-pitbox-steel">
                <UploadCloud className="w-4 h-4" />
              </div>
              <p className="text-xs font-bold text-pitbox-dark">
                Presuňte súbory sem alebo <span className="text-pitbox-steel underline">vyberte z disku</span>
              </p>
              <p className="text-[10px] text-slate-400">
                Fotografie dielov, bločky alebo faktúry vo formáte PDF
              </p>
            </div>

            {/* Existing Attachments */}
            {existingAttachments.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                  Už uložené prílohy ({existingAttachments.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {existingAttachments.map((att) => (
                    <div
                      key={att.id}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-slate-200 text-xs shadow-2xs"
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        {att.contentType.includes('pdf') ? (
                          <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-[9px]">
                            PDF
                          </div>
                        ) : (
                          <img
                            src={att.storagePath}
                            alt={att.fileName}
                            className="w-7 h-7 object-cover rounded shrink-0 border border-slate-100"
                          />
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-pitbox-dark truncate text-xs">{att.fileName}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {(att.fileSizeBytes / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleDeleteExistingAttachment(att.id)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition shrink-0"
                        title="Odstrániť prílohu"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Queued Files */}
            {queuedFiles.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-pitbox-steel">
                  Pripravené na nahranie ({queuedFiles.length})
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {queuedFiles.map((qf, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-2 bg-white rounded-lg border border-pitbox-seafoam text-xs shadow-2xs"
                    >
                      <div className="flex items-center space-x-2 truncate pr-2">
                        {qf.type === 'application/pdf' ? (
                          <div className="w-7 h-7 rounded bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 font-bold text-[9px]">
                            PDF
                          </div>
                        ) : (
                          <div className="w-7 h-7 rounded bg-pitbox-glacier/30 text-pitbox-steel flex items-center justify-center shrink-0 font-bold text-[9px]">
                            FOTO
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-semibold text-pitbox-dark truncate text-xs">{qf.name}</p>
                          <p className="text-[10px] text-slate-400 font-mono">
                            {(qf.size / 1024).toFixed(0)} KB
                          </p>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemoveQueuedFile(idx)}
                        className="p-1 text-slate-400 hover:text-rose-600 rounded transition shrink-0"
                        title="Zrušiť nahranie"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Technician / Owner Notes */}
          <div>
            <label htmlFor="service-notes" className="block text-xs font-semibold text-pitbox-dark mb-1">
              Poznámky technika / majiteľa (voliteľné)
            </label>
            <textarea
              id="service-notes"
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Ďalšie poznámky z kontroly, čísla dielov alebo informácie o záruke..."
              className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-sm"
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center px-5 py-2 text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl transition shadow-sm disabled:opacity-50"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
              {loading ? 'Ukladanie...' : isEditing ? 'Uložiť zmeny' : 'Uložiť záznam'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
