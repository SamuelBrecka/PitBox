import React, { useEffect, useCallback } from 'react';
import { X, ChevronLeft, ChevronRight, Download, FileText } from 'lucide-react';
import { Attachment } from '../types/serviceRecord';

interface AttachmentLightboxProps {
  attachments: Attachment[];
  currentIndex: number;
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (index: number) => void;
}

export const AttachmentLightbox: React.FC<AttachmentLightboxProps> = ({
  attachments,
  currentIndex,
  isOpen,
  onClose,
  onNavigate,
}) => {
  const current = attachments[currentIndex];

  const handlePrev = useCallback(() => {
    if (attachments.length > 1) {
      onNavigate((currentIndex - 1 + attachments.length) % attachments.length);
    }
  }, [attachments.length, currentIndex, onNavigate]);

  const handleNext = useCallback(() => {
    if (attachments.length > 1) {
      onNavigate((currentIndex + 1) % attachments.length);
    }
  }, [attachments.length, currentIndex, onNavigate]);

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || !current) return null;

  const isPdf = current.contentType === 'application/pdf';

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex flex-col items-center justify-between bg-black/90 backdrop-blur-md p-4 sm:p-6"
    >
      {/* Top Bar */}
      <div className="w-full flex items-center justify-between text-white py-2 px-4 z-10">
        <div className="flex items-center space-x-3 truncate">
          <span className="font-bold text-sm sm:text-base truncate">{current.fileName}</span>
          <span className="text-xs text-slate-400 font-mono hidden sm:inline">
            ({(current.fileSizeBytes / 1024).toFixed(0)} KB)
          </span>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded font-mono">
            {currentIndex + 1} / {attachments.length}
          </span>
        </div>

        <div className="flex items-center space-x-2">
          <a
            href={current.storagePath}
            download={current.fileName}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition flex items-center space-x-1 text-xs font-semibold"
            title="Stiahnuť súbor"
          >
            <Download className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Stiahnuť</span>
          </a>
          <button
            type="button"
            onClick={onClose}
            aria-label="Zatvoriť"
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="relative flex-1 w-full max-w-5xl flex items-center justify-center my-4 overflow-hidden">
        {attachments.length > 1 && (
          <button
            type="button"
            onClick={handlePrev}
            aria-label="Predchádzajúci súbor"
            className="absolute left-2 sm:left-4 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition"
          >
            <ChevronLeft className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}

        <div className="flex items-center justify-center max-h-[80vh] max-w-full">
          {isPdf ? (
            <div className="bg-white p-8 rounded-2xl text-center text-pitbox-dark max-w-md shadow-2xl">
              <FileText className="w-16 h-16 text-rose-600 mx-auto mb-3" />
              <h4 className="font-bold text-base truncate">{current.fileName}</h4>
              <p className="text-xs text-slate-500 mt-1">
                Veľkosť: {(current.fileSizeBytes / 1024).toFixed(0)} KB
              </p>
              <div className="mt-6 flex justify-center gap-3">
                <a
                  href={current.storagePath}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-pitbox-steel text-white rounded-xl text-xs font-semibold hover:bg-pitbox-steel/90 transition"
                >
                  Otvoriť PDF v novom okne
                </a>
              </div>
            </div>
          ) : (
            <img
              src={current.storagePath}
              alt={current.fileName}
              className="max-h-[75vh] max-w-full object-contain rounded-lg shadow-2xl"
            />
          )}
        </div>

        {attachments.length > 1 && (
          <button
            type="button"
            onClick={handleNext}
            aria-label="Nasledujúci súbor"
            className="absolute right-2 sm:right-4 z-20 p-2 sm:p-3 rounded-full bg-white/10 hover:bg-white/30 text-white transition"
          >
            <ChevronRight className="w-6 h-6 sm:w-8 sm:h-8" />
          </button>
        )}
      </div>

      {/* Bottom hint */}
      <div className="text-xs text-slate-400 py-1 font-medium text-center">
        Použite šípky na klávesnici alebo kláves <kbd className="bg-white/10 px-1.5 py-0.5 rounded text-white font-mono">Esc</kbd> na zatvorenie
      </div>
    </div>
  );
};
