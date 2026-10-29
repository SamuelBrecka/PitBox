import React from 'react';
import { Car, Edit3, Trash2, ArrowRight } from 'lucide-react';
import { Link } from '../router/Router';
import { Vehicle } from '../types/vehicle';

interface VehicleCardProps {
  vehicle: Vehicle;
  onQuickMileage: (vehicle: Vehicle) => void;
  onEdit: (vehicle: Vehicle) => void;
  onDelete: (vehicle: Vehicle) => void;
}

export const VehicleCard: React.FC<VehicleCardProps> = ({
  vehicle,
  onQuickMileage,
  onEdit,
  onDelete,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 hover:border-slate-300 transition-colors duration-200 flex flex-col overflow-hidden group">
      {/* Minimal Top Banner / Image */}
      <div className="h-40 w-full bg-slate-50 relative overflow-hidden flex items-center justify-center border-b border-slate-100">
        {vehicle.photoPath ? (
          <img
            src={vehicle.photoPath}
            alt={`${vehicle.manufacturer} ${vehicle.model}`}
            className="w-full h-full object-cover transition-opacity duration-200"
          />
        ) : (
          <Car className="w-12 h-12 stroke-1 text-slate-300" />
        )}

        {/* Clean License Plate Chip */}
        <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-slate-900 font-mono font-semibold text-xs px-2.5 py-1 rounded-md border border-slate-200/90 shadow-2xs tracking-wider">
          {vehicle.licensePlate}
        </div>

        {/* Subtle Fuel Type Badge */}
        <div className="absolute top-3 right-3">
          <span className="bg-white/90 backdrop-blur-xs text-slate-600 text-[10px] font-medium tracking-wider uppercase px-2.5 py-0.5 rounded-full border border-slate-200/80">
            {vehicle.fuelType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-5">
        <div>
          <div className="flex items-baseline justify-between gap-2">
            <h3 className="text-base font-semibold text-slate-900 truncate">
              {vehicle.manufacturer} {vehicle.model}
            </h3>
            <span className="text-xs text-slate-400 font-mono shrink-0">
              {vehicle.manufactureYear}
            </span>
          </div>

          {vehicle.engineInfo && (
            <p className="text-xs text-slate-500 mt-0.5 truncate">
              {vehicle.engineInfo}
            </p>
          )}
        </div>

        {/* Clean Odometer Row */}
        <div className="flex items-center justify-between py-2.5 px-3 rounded-xl bg-slate-50/80 border border-slate-100">
          <span className="text-xs text-slate-500">Odometer</span>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-900 font-mono">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
            <button
              type="button"
              onClick={() => onQuickMileage(vehicle)}
              title="Quick Odometer Update"
              className="text-[11px] font-medium text-pitbox-steel bg-white hover:bg-slate-100 px-2 py-0.5 rounded-md border border-slate-200 transition-colors duration-200 cursor-pointer"
            >
              + km
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-1 flex items-center justify-between">
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              aria-label="Edit Vehicle Profile"
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors duration-200 cursor-pointer"
              title="Edit Vehicle Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(vehicle)}
              aria-label="Delete Vehicle"
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors duration-200 cursor-pointer"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center text-xs font-medium text-pitbox-steel hover:text-pitbox-dark transition-colors duration-200 cursor-pointer"
          >
            <span>Open Logbook</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
