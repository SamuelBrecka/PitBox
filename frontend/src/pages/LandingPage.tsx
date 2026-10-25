import React, { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Gauge, CheckCircle2, ArrowRight, Car } from 'lucide-react';
import { Link } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status ?? 'ONLINE'))
      .catch(() => setBackendStatus('READY (STANDALONE)'));
  }, []);

  return (
    <div className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
      {/* Hero Section */}
      <div className="text-center max-w-3xl mx-auto">
        <div className="inline-flex items-center space-x-2 bg-pitbox-seafoam/50 text-pitbox-steel px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider mb-6 border border-pitbox-seafoam">
          <span>Automotive Digital Logbook</span>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-pitbox-steel sm:text-5xl">
          Digital Service Book & Vehicle History
        </h1>
        <p className="mt-4 text-lg text-slate-600">
          A lightweight, zero-bloat digital service logbook for vehicle owners. Complete maintenance records,
          smart interval reminders, and total cost of ownership visibility.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          {isAuthenticated ? (
            <Link
              to="/garage"
              className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 shadow-sm transition"
            >
              Go to My Garage
              <ArrowRight className="ml-2 w-5 h-5" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 shadow-sm transition"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-3 rounded-lg text-base font-medium text-pitbox-steel bg-white border border-pitbox-seafoam hover:bg-slate-50 transition"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Visual Dashboard Teaser / Preview Card */}
      <div className="mt-14 max-w-4xl mx-auto bg-white rounded-2xl shadow-md border border-pitbox-seafoam/60 overflow-hidden">
        <div className="bg-gradient-to-r from-pitbox-steel to-pitbox-glacier px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Car className="w-6 h-6 text-pitbox-seafoam" />
            <div>
              <h2 className="font-bold text-lg leading-tight">2019 Škoda Octavia Combi 2.0 TDI</h2>
              <p className="text-xs text-pitbox-seafoam font-mono">VIN: TMBJJ7NE5K0123456 &middot; 1AB 2345</p>
            </div>
          </div>
          <span className="text-xs bg-white/20 px-3 py-1 rounded-full font-semibold">Active Profile</span>
        </div>
        <div className="p-6 grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-pitbox-cream/60 p-4 rounded-xl border border-pitbox-seafoam/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Odometer</span>
            <p className="text-2xl font-bold text-pitbox-dark mt-1">144,100 km</p>
            <p className="text-xs text-slate-500 mt-1">Updated +1,800 km last month</p>
          </div>
          <div className="bg-pitbox-cream/60 p-4 rounded-xl border border-pitbox-seafoam/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Oil Life Status</span>
            <p className="text-2xl font-bold text-pitbox-glacier mt-1">78% Remaining</p>
            <p className="text-xs text-slate-500 mt-1">Due in 9,400 km or 7 months</p>
          </div>
          <div className="bg-pitbox-cream/60 p-4 rounded-xl border border-pitbox-seafoam/40">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">State Inspection (STK)</span>
            <p className="text-2xl font-bold text-pitbox-steel mt-1">Due in 42 Days</p>
            <p className="text-xs text-slate-500 mt-1">Target date: 15. Dec 2026</p>
          </div>
        </div>
      </div>

      {/* Feature Value Cards */}
      <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-pitbox-seafoam/50 flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-pitbox-steel/10 flex items-center justify-center text-pitbox-steel mb-4">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-pitbox-dark">Service Timeline</h3>
          <p className="mt-2 text-sm text-slate-600">
            Chronological log with dynamic line items, workshop notes, and compressed receipt attachments.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-pitbox-seafoam/50 flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-pitbox-glacier/20 flex items-center justify-center text-pitbox-glacier mb-4">
            <Gauge className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-pitbox-dark">Smart Reminders</h3>
          <p className="mt-2 text-sm text-slate-600">
            Mileage, date, and hybrid triggers for oil changes, brakes, and STK inspections with circular gauge dials.
          </p>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-pitbox-seafoam/50 flex flex-col">
          <div className="w-12 h-12 rounded-lg bg-pitbox-seafoam/40 flex items-center justify-center text-pitbox-steel mb-4">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-semibold text-pitbox-dark">Lightweight & Private</h3>
          <p className="mt-2 text-sm text-slate-600">
            Stateless JWT authentication, containerized footprint (&lt; 400 MB RAM), and strict data isolation.
          </p>
        </div>
      </div>

      {/* System Health Status Indicator */}
      <div className="mt-12 text-center">
        <span className="text-xs text-slate-500 mr-2">Backend Connection:</span>
        <span
          data-testid="backend-status"
          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pitbox-seafoam text-pitbox-dark"
        >
          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-pitbox-steel" />
          {backendStatus}
        </span>
      </div>
    </div>
  );
};
