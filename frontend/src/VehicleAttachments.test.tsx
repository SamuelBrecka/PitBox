import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AttachmentLightbox } from './components/AttachmentLightbox';
import { UploadAttachmentModal } from './components/UploadAttachmentModal';
import { Attachment, ServiceRecord } from './types/serviceRecord';
import { attachmentApi } from './api/attachmentApi';

const mockAttachments: Attachment[] = [
  {
    id: 'att-1',
    serviceRecordId: 'rec-1',
    fileName: 'faktura.pdf',
    storagePath: '/uploads/attachments/faktura.pdf',
    contentType: 'application/pdf',
    fileSizeBytes: 204800,
    uploadedAt: '2026-10-25T10:00:00Z',
  },
  {
    id: 'att-2',
    serviceRecordId: 'rec-1',
    fileName: 'brzdy.jpg',
    storagePath: '/uploads/attachments/brzdy.jpg',
    contentType: 'image/jpeg',
    fileSizeBytes: 512000,
    uploadedAt: '2026-10-25T10:05:00Z',
  },
];

const mockServiceRecords: ServiceRecord[] = [
  {
    id: 'rec-1',
    vehicleId: 'veh-1',
    serviceDate: '2026-10-25',
    mileageAtService: 152000,
    category: 'MAINTENANCE',
    workshopName: 'PitBox Workshop',
    totalCost: 150,
    notes: 'Výmena oleja a filtrov',
    createdAt: '2026-10-25T10:00:00Z',
    items: [],
    attachments: mockAttachments,
  },
];

describe('AttachmentLightbox Component', () => {
  it('renders image lightbox and handles navigation and keyboard escape', () => {
    const onClose = vi.fn();
    const onNavigate = vi.fn();

    render(
      <AttachmentLightbox
        attachments={mockAttachments}
        currentIndex={1}
        isOpen={true}
        onClose={onClose}
        onNavigate={onNavigate}
      />
    );

    expect(screen.getByText('brzdy.jpg')).toBeInTheDocument();
    expect(screen.getByText(/2 \/ 2/)).toBeInTheDocument();

    // Next navigation button
    const nextBtn = screen.getByRole('button', { name: /Nasledujúci súbor/i });
    fireEvent.click(nextBtn);
    expect(onNavigate).toHaveBeenCalledWith(0);

    // Escape key
    fireEvent.keyDown(window, { key: 'Escape' });
    expect(onClose).toHaveBeenCalled();
  });

  it('renders PDF view in lightbox with link to open in new tab', () => {
    render(
      <AttachmentLightbox
        attachments={mockAttachments}
        currentIndex={0}
        isOpen={true}
        onClose={vi.fn()}
        onNavigate={vi.fn()}
      />
    );

    expect(screen.getAllByText('faktura.pdf').length).toBeGreaterThan(0);
    expect(screen.getByText('Otvoriť PDF v novom okne')).toBeInTheDocument();
  });
});

describe('UploadAttachmentModal Component', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('allows selecting service record and uploading files', async () => {
    const uploadSpy = vi.spyOn(attachmentApi, 'uploadAttachments').mockResolvedValue([
      {
        id: 'att-3',
        serviceRecordId: 'rec-1',
        fileName: 'doklad.pdf',
        storagePath: '/uploads/attachments/doklad.pdf',
        contentType: 'application/pdf',
        fileSizeBytes: 102400,
        uploadedAt: '2026-10-26T12:00:00Z',
      },
    ]);

    const onClose = vi.fn();
    const onSuccess = vi.fn();

    render(
      <UploadAttachmentModal
        vehicleId="veh-1"
        serviceRecords={mockServiceRecords}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('Nahrať dokument alebo fotografiu')).toBeInTheDocument();

    // Dropdown has the record
    const select = screen.getByLabelText(/Priradiť k servisnému záznamu/i);
    expect(select).toBeInTheDocument();

    // Upload mock file via hidden input
    const file = new File(['dummy content'], 'doklad.pdf', { type: 'application/pdf' });
    const input = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(input, { target: { files: [file] } });

    // File should be queued
    expect(screen.getByText('doklad.pdf')).toBeInTheDocument();

    // Submit form
    const submitBtn = screen.getByRole('button', { name: /Nahrať súbory/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(uploadSpy).toHaveBeenCalledWith('veh-1', 'rec-1', [file]);
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });
});
