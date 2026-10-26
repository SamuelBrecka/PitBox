export interface Vehicle {
  id: string;
  userId?: string;
  manufacturer: string;
  model: string;
  manufactureYear: number;
  licensePlate: string;
  vin?: string | null;
  engineInfo?: string | null;
  fuelType: 'PETROL' | 'DIESEL' | 'EV' | 'HYBRID' | string;
  currentMileage: number;
  photoPath?: string | null;
  createdAt: string;
}

export interface CreateVehiclePayload {
  manufacturer: string;
  model: string;
  manufactureYear: number;
  licensePlate: string;
  vin?: string;
  engineInfo?: string;
  fuelType: string;
  currentMileage: number;
}

export interface UpdateVehiclePayload {
  manufacturer: string;
  model: string;
  manufactureYear: number;
  licensePlate: string;
  vin?: string;
  engineInfo?: string;
  fuelType: string;
}

export interface UpdateMileagePayload {
  mileage: number;
}

export interface MileageLog {
  id: string;
  vehicleId: string;
  mileage: number;
  recordedAt: string;
  source: string;
}
