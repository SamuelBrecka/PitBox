import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import React from 'react';
import { GaragePage } from './pages/GaragePage';
import { QuickMileageModal } from './components/QuickMileageModal';
import { Vehicle } from './types/vehicle';
import { vehicleApi } from './api/vehicleApi';
import { AuthContext } from './context/AuthContext';
import { Router } from './router/Router';

const mockVehicle: Vehicle = {
  id: 'veh-123',
  manufacturer: 'Skoda',
  model: 'Octavia Combi',
  manufactureYear: 2020,
  licensePlate: 'BA-999ZZ',
  fuelType: 'DIESEL',
  currentMileage: 150000,
  photoPath: null,
  createdAt: '2026-10-26T12:00:00Z',
};

const renderWithContext = (ui: React.ReactNode) => {
  return render(
    <Router>
      <AuthContext.Provider
        value={{
          user: { id: 'user-1', email: 'owner@pitbox.io', fullName: 'Car Owner', role: 'ROLE_USER' },
          token: 'token',
          isAuthenticated: true,
          isLoading: false,
          login: vi.fn(),
          register: vi.fn(),
          logout: vi.fn(),
        }}
      >
        {ui}
      </AuthContext.Provider>
    </Router>
  );
};

describe('Garage & Vehicle Management (Step 3)', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('renders garage with vehicles list and KPI count', async () => {
    vi.spyOn(vehicleApi, 'getVehicles').mockResolvedValue([mockVehicle]);

    renderWithContext(<GaragePage />);

    await waitFor(() => {
      expect(screen.getByText('Skoda Octavia Combi')).toBeInTheDocument();
      expect(screen.getByText('BA-999ZZ')).toBeInTheDocument();
      expect(screen.getByText(/150[,\s\u00A0]?000\s*km/)).toBeInTheDocument();
      expect(screen.getByText('1')).toBeInTheDocument(); // Registered vehicles count KPI
    });
  });

  it('renders empty state when no vehicles exist', async () => {
    vi.spyOn(vehicleApi, 'getVehicles').mockResolvedValue([]);

    renderWithContext(<GaragePage />);

    await waitFor(() => {
      expect(screen.getByText(/No Vehicles in Your Garage Yet/i)).toBeInTheDocument();
      expect(screen.getByText(/Add First Vehicle/i)).toBeInTheDocument();
    });
  });

  it('validates forward-only odometer entry in QuickMileageModal', async () => {
    const handleSuccess = vi.fn();
    const handleClose = vi.fn();

    render(
      <QuickMileageModal
        vehicle={mockVehicle}
        isOpen={true}
        onClose={handleClose}
        onSuccess={handleSuccess}
      />
    );

    expect(screen.getByText(/Current Reading:/i)).toBeInTheDocument();
    expect(screen.getByText(/150[,\s\u00A0]?000\s*km/)).toBeInTheDocument();

    const input = screen.getByLabelText(/New Odometer Reading/i);
    const submitBtn = screen.getByRole('button', { name: /Update Reading/i });

    // Submit button should be disabled when empty
    expect(submitBtn).toBeDisabled();

    // Type a lower or equal value (150000)
    fireEvent.change(input, { target: { value: '150000' } });
    expect(submitBtn).toBeDisabled();

    // Type a higher value (152000)
    fireEvent.change(input, { target: { value: '152000' } });
    expect(submitBtn).not.toBeDisabled();
    expect(screen.getByText(/\+2[,\s\u00A0]?000\s*km forward progression/i)).toBeInTheDocument();

    // Use shortcut chip (+1,000 km)
    const plus1000Btn = screen.getByRole('button', { name: /\+1,000 km/i });
    fireEvent.click(plus1000Btn);
    expect(screen.getByText(/\+1[,\s\u00A0]?000\s*km forward progression/i)).toBeInTheDocument();

    // Mock API success
    vi.spyOn(vehicleApi, 'updateMileage').mockResolvedValue({
      ...mockVehicle,
      currentMileage: 151000,
    });

    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(vehicleApi.updateMileage).toHaveBeenCalledWith('veh-123', { mileage: 151000 });
      expect(handleSuccess).toHaveBeenCalled();
      expect(handleClose).toHaveBeenCalled();
    });
  });
});
