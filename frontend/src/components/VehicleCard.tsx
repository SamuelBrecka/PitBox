import React from 'react';
import { Car, Gauge, Edit3, Trash2, ArrowRight } from 'lucide-react';
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
    <div className="bg-white rounded-2xl border border-pitbox-seafoam/70 shadow-xs hover:shadow-md transition flex flex-col overflow-hidden group">
      {/* Top Banner / Image */}
      <div className="h-44 w-full bg-slate-100 relative overflow-hidden flex items-center justify-center">
        {vehicle.photoPath ? (
          <img
            src={vehicle.photoPath}
            alt={`${vehicle.manufacturer} ${vehicle.model}`}
            className="w-full h-full object-cover group-hover:scale-102 transition duration-300"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-300">
            <Car className="w-16 h-16 stroke-1 text-pitbox-glacier/60" />
            <span className="text-xs font-medium text-slate-400 mt-1">No vehicle photo</span>
          </div>
        )}

        {/* License plate chip positioned on bottom-left of hero */}
        <div className="absolute bottom-3 left-3 flex items-center shadow-md">
          <div className="bg-blue-700 text-white text-[10px] font-bold px-1.5 py-1 rounded-l flex items-center justify-center border border-r-0 border-blue-900">
            SK
          </div>
          <div className="bg-white text-pitbox-dark font-mono font-extrabold text-xs px-2.5 py-1 rounded-r border border-slate-300 tracking-wider">
            {vehicle.licensePlate}
          </div>
        </div>

        {/* Fuel Type Pill badge on top-right */}
        <div className="absolute top-3 right-3">
          <span className="bg-pitbox-dark/80 backdrop-blur-xs text-white text-[10px] font-semibold tracking-wide uppercase px-2.5 py-1 rounded-full shadow-xs">
            {vehicle.fuelType}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div>
          <div className="flex items-baseline justify-between">
            <h3 className="text-lg font-bold text-pitbox-steel truncate">
              {vehicle.manufacturer} {vehicle.model}
            </h3>
            <span className="text-xs font-semibold text-slate-500 font-mono ml-2">
              {vehicle.manufactureYear}
            </span>
          </div>

          {vehicle.engineInfo && (
            <p className="text-xs text-slate-600 mt-0.5 truncate">
              {vehicle.engineInfo}
            </p>
          )}
        </div>

        {/* Odometer readout with Quick Update button */}
        <div className="bg-pitbox-cream/60 p-3 rounded-xl border border-pitbox-seafoam/50 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Gauge className="w-4 h-4 text-pitbox-glacier" />
            <span className="text-xs font-medium text-slate-600">Odometer:</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-sm font-bold text-pitbox-dark font-mono">
              {vehicle.currentMileage.toLocaleString()} km
            </span>
            <button
              type="button"
              onClick={() => onQuickMileage(vehicle)}
              title="Quick Odometer Update"
              className="text-[11px] font-semibold text-pitbox-steel bg-white hover:bg-pitbox-seafoam/30 px-2 py-0.5 rounded border border-pitbox-seafoam transition"
            >
              + km
            </button>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => onEdit(vehicle)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-pitbox-steel hover:bg-pitbox-seafoam/20 transition"
              title="Edit Vehicle Profile"
            >
              <Edit3 className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(vehicle)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
              title="Delete Vehicle"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>

          <Link
            to={`/vehicles/${vehicle.id}`}
            className="inline-flex items-center text-xs font-bold text-pitbox-steel hover:text-pitbox-steel/80 group-hover:translate-x-0.5 transition"
          >
            <span>Manage Vehicle</span>
            <ArrowRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>
      </div>
    </div>
  );
};
