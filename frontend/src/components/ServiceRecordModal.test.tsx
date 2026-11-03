import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ServiceRecordModal } from './ServiceRecordModal';
import { serviceRecordApi } from '../api/serviceRecordApi';

describe('ServiceRecordModal', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('dynamically adds line items, computes total cost, and submits payload', async () => {
    const createSpy = vi.spyOn(serviceRecordApi, 'createServiceRecord').mockResolvedValue({
      id: 'rec-1',
      vehicleId: 'veh-1',
      serviceDate: '2026-10-20',
      mileageAtService: 152000,
      category: 'MAINTENANCE',
      workshopName: 'AutoPro',
      totalCost: 105,
      notes: 'Oil & filter change',
      createdAt: '2026-10-20T12:00:00Z',
      items: [
        { id: 'i1', name: 'Engine Oil 5W-30', itemType: 'FLUID', quantity: 1, unitPrice: 45, totalPrice: 45 },
        { id: 'i2', name: 'Labor', itemType: 'LABOR', quantity: 2, unitPrice: 30, totalPrice: 60 },
      ],
    });

    const onSuccess = vi.fn();
    const onClose = vi.fn();

    render(
      <ServiceRecordModal
        vehicleId="veh-1"
        currentVehicleMileage={150000}
        isOpen={true}
        onClose={onClose}
        onSuccess={onSuccess}
      />
    );

    expect(screen.getByText('Nový servisný záznam')).toBeInTheDocument();

    // Update odometer to 152000 (> 150000) and verify auto-advance indicator
    fireEvent.change(screen.getByLabelText(/Stav tachometra pri servise/i), { target: { value: '152000' } });
    expect(screen.getByText(/Automaticky navýši tachometer vozidla z/i)).toBeInTheDocument();

    // Fill Item 1
    fireEvent.change(screen.getByLabelText('Popis položky 1'), { target: { value: 'Engine Oil 5W-30' } });
    fireEvent.change(screen.getByLabelText('Typ položky 1'), { target: { value: 'FLUID' } });
    fireEvent.change(screen.getByLabelText('Množstvo položky 1'), { target: { value: '1' } });
    fireEvent.change(screen.getByLabelText('Jednotková cena položky 1'), { target: { value: '45' } });

    // Add Item 2
    fireEvent.click(screen.getByRole('button', { name: /Pridať položku/i }));
    fireEvent.change(screen.getByLabelText('Popis položky 2'), { target: { value: 'Labor' } });
    fireEvent.change(screen.getByLabelText('Typ položky 2'), { target: { value: 'LABOR' } });
    fireEvent.change(screen.getByLabelText('Množstvo položky 2'), { target: { value: '2' } });
    fireEvent.change(screen.getByLabelText('Jednotková cena položky 2'), { target: { value: '30' } });

    // Check computed grand total €105.00
    expect(screen.getByText('€105.00')).toBeInTheDocument();

    // Submit form
    fireEvent.click(screen.getByRole('button', { name: /Uložiť záznam/i }));

    await waitFor(() => {
      expect(createSpy).toHaveBeenCalledWith(
        'veh-1',
        expect.objectContaining({
          mileageAtService: 152000,
          category: 'MAINTENANCE',
          items: [
            { name: 'Engine Oil 5W-30', itemType: 'FLUID', quantity: 1, unitPrice: 45 },
            { name: 'Labor', itemType: 'LABOR', quantity: 2, unitPrice: 30 },
          ],
        })
      );
      expect(onSuccess).toHaveBeenCalled();
      expect(onClose).toHaveBeenCalled();
    });
  });

  it('shows historical log hint when mileage is lower than current odometer', () => {
    render(
      <ServiceRecordModal
        vehicleId="veh-1"
        currentVehicleMileage={150000}
        isOpen={true}
        onClose={vi.fn()}
        onSuccess={vi.fn()}
      />
    );

    fireEvent.change(screen.getByLabelText(/Stav tachometra pri servise/i), { target: { value: '120000' } });
    expect(screen.getByText(/Historický záznam \(aktuálny stav tachometra zostáva/i)).toBeInTheDocument();
  });
});
