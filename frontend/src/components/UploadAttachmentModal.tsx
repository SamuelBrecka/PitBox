import React, { useState, useRef } from 'react';
import { X, UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { ServiceRecord, Attachment } from '../types/serviceRecord';
import { attachmentApi } from '../api/attachmentApi';
import { compressServiceAttachment } from '../utils/compression';

interface UploadAttachmentModalProps {
  vehicleId: string;
  serviceRecords: ServiceRecord[];
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (uploaded: Attachment[]) => void;
}

export const UploadAttachmentModal: React.FC<UploadAttachmentModalProps> = ({
  vehicleId,
  serviceRecords,
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [selectedRecordId, setSelectedRecordId] = useState<string>(
    serviceRecords.length > 0 ? serviceRecords[0].id : ''
  );
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const [compressing, setCompressing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFiles(Array.from(e.target.files));
      setError(null);
    }
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRecordId) {
      setError('Vyberte servisný záznam, ku ktorému sa má príloha priradiť.');
      return;
    }

    if (files.length === 0) {
      setError('Vyberte aspoň jeden súbor.');
      return;
    }

    setLoading(true);
    setCompressing(true);
    setError(null);

    try {
      // Compress any images
      const processedFiles: File[] = [];
      for (const file of files) {
        if (file.type.startsWith('image/')) {
          const compressed = await compressServiceAttachment(file);
          processedFiles.push(compressed);
        } else {
          processedFiles.push(file);
        }
      }
      setCompressing(false);

      const uploaded = await attachmentApi.uploadAttachments(
        vehicleId,
        selectedRecordId,
        processedFiles
      );

      onSuccess(uploaded);
      onClose();
      setFiles([]);
    } catch (err: unknown) {
      setCompressing(false);
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ||
        'Nepodarilo sa nahrať prílohu.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-pitbox-dark/60 backdrop-blur-sm">
      <div className="bg-white w-full max-w-md rounded-2xl shadow-xl border border-pitbox-seafoam/60 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-pitbox-steel text-white">
          <div className="flex items-center space-x-2">
            <UploadCloud className="w-5 h-5 text-pitbox-seafoam" />
            <h3 className="font-bold text-base">Nahrať dokument alebo fotografiu</h3>
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
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="flex items-start space-x-2 text-xs text-rose-600 bg-rose-50 border border-rose-200 p-3 rounded-lg">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          {/* Service Record Target Dropdown */}
          <div>
            <label htmlFor="target-record" className="block text-xs font-semibold text-pitbox-dark mb-1">
              Priradiť k servisnému záznamu *
            </label>
            {serviceRecords.length === 0 ? (
              <p className="text-xs text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                Vozidlo nemá žiadne servisné záznamy. Najskôr pridajte servisný záznam na karte Servisná história.
              </p>
            ) : (
              <select
                id="target-record"
                required
                value={selectedRecordId}
                onChange={(e) => setSelectedRecordId(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-pitbox-steel/20 focus:border-pitbox-steel text-xs bg-white"
              >
                {serviceRecords.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.serviceDate} • {r.category} ({r.mileageAtService.toLocaleString()} km) – €{Number(r.totalCost).toFixed(2)}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* File Picker / Dropzone */}
          <div>
            <label className="block text-xs font-semibold text-pitbox-dark mb-1">
              Súbory na nahranie *
            </label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="cursor-pointer rounded-xl border-2 border-dashed border-slate-300 hover:border-pitbox-glacier p-6 text-center bg-pitbox-cream/20 hover:bg-white transition flex flex-col items-center justify-center gap-2"
            >
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/jpeg,image/png,image/webp,application/pdf"
                className="hidden"
                onChange={handleFileChange}
              />
              <UploadCloud className="w-8 h-8 text-pitbox-glacier" />
              <div>
                <p className="text-xs font-bold text-pitbox-dark">Kliknite pre výber súborov</p>
                <p className="text-[11px] text-slate-400">PDF faktúry, JPG, PNG, WEBP do 10 MB</p>
              </div>
            </div>
          </div>

          {/* Queued files list */}
          {files.length > 0 && (
            <div className="space-y-1.5 max-h-36 overflow-y-auto">
              {files.map((file, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 bg-slate-50 rounded-lg border border-slate-200 text-xs"
                >
                  <div className="flex items-center space-x-2 truncate pr-2">
                    {file.type === 'application/pdf' ? (
                      <FileText className="w-4 h-4 text-rose-600 shrink-0" />
                    ) : (
                      <div className="w-4 h-4 rounded bg-pitbox-glacier shrink-0" />
                    )}
                    <span className="truncate font-medium">{file.name}</span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      ({(file.size / 1024).toFixed(0)} KB)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveFile(idx)}
                    className="p-1 text-slate-400 hover:text-rose-600 rounded transition"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 transition"
            >
              Zrušiť
            </button>
            <button
              type="submit"
              disabled={loading || files.length === 0 || !selectedRecordId}
              className="inline-flex items-center px-5 py-2 text-xs font-bold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 rounded-xl transition shadow-xs disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
                  {compressing ? 'Kompresia...' : 'Nahrávanie...'}
                </>
              ) : (
                'Nahrať súbory'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
