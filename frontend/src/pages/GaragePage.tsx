import React from 'react';
import { Car, Plus, ShieldCheck, Gauge, Wrench } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const GaragePage: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
      {/* Top Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-6 border-b border-pitbox-seafoam/50 gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-semibold text-pitbox-steel bg-pitbox-seafoam/50 px-2.5 py-0.5 rounded-full mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Authenticated &middot; JWT Session Active</span>
          </div>
          <h1 className="text-3xl font-extrabold text-pitbox-steel">
            Welcome back, {user?.fullName || 'Owner'}!
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Manage your vehicles, odometer readings, and upcoming service intervals.
          </p>
        </div>

        <div>
          <button
            type="button"
            className="inline-flex items-center px-4 py-2.5 rounded-lg text-sm font-semibold text-white bg-pitbox-steel hover:bg-pitbox-steel/90 shadow-sm transition"
            onClick={() => alert('Vehicle CRUD and photo upload will be unlocked in Step 3!')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add Vehicle
          </button>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-steel/10 text-pitbox-steel flex items-center justify-center shrink-0">
            <Car className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Registered Vehicles</span>
            <p className="text-2xl font-bold text-pitbox-dark">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-glacier/20 text-pitbox-glacier flex items-center justify-center shrink-0">
            <Gauge className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Active Reminders</span>
            <p className="text-2xl font-bold text-pitbox-dark">0</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-pitbox-seafoam/60 shadow-sm flex items-center space-x-4">
          <div className="w-12 h-12 rounded-lg bg-pitbox-seafoam/50 text-pitbox-steel flex items-center justify-center shrink-0">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Total Spent</span>
            <p className="text-2xl font-bold text-pitbox-dark">€0.00</p>
          </div>
        </div>
      </div>

      {/* Empty State / Step 3 Preview */}
      <div className="mt-10 bg-white rounded-2xl border border-dashed border-pitbox-seafoam/80 p-12 text-center max-w-2xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-2xl bg-pitbox-cream text-pitbox-steel mx-auto flex items-center justify-center mb-4 border border-pitbox-seafoam">
          <Car className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-pitbox-dark">No Vehicles in Your Garage Yet</h2>
        <p className="text-sm text-slate-600 mt-2 max-w-md mx-auto">
          Your digital service book is ready. Step 3 of the implementation roadmap will introduce vehicle creation,
          compressed photo uploads, and mileage logs.
        </p>
        <div className="mt-6">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 text-sm font-semibold text-pitbox-steel bg-pitbox-seafoam/40 hover:bg-pitbox-seafoam rounded-lg border border-pitbox-seafoam transition"
            onClick={() => alert('Vehicle CRUD and photo upload will be unlocked in Step 3!')}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            Add First Vehicle
          </button>
        </div>
      </div>
    </div>
  );
};
