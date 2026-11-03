export type ServiceCategory = 'MAINTENANCE' | 'REPAIR' | 'INSPECTION' | 'OTHER';
export type ServiceItemType = 'PART' | 'LABOR' | 'FLUID';

export interface ServiceItem {
  id?: string;
  name: string;
  itemType: ServiceItemType;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
}

export interface ServiceRecord {
  id: string;
  vehicleId: string;
  serviceDate: string;
  mileageAtService: number;
  category: ServiceCategory;
  workshopName?: string | null;
  totalCost: number;
  notes?: string | null;
  createdAt: string;
  items: ServiceItem[];
}

export interface CreateServiceItemPayload {
  name: string;
  itemType: ServiceItemType;
  quantity: number;
  unitPrice: number;
}

export interface CreateServiceRecordPayload {
  serviceDate: string;
  mileageAtService: number;
  category: ServiceCategory;
  workshopName?: string;
  notes?: string;
  items: CreateServiceItemPayload[];
}
