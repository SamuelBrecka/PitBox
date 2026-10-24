import React, { useEffect, useState } from 'react';
import { Wrench, ShieldCheck, Gauge, CheckCircle2 } from 'lucide-react';

export const App: React.FC = () => {
  const [backendStatus, setBackendStatus] = useState<string>('Checking...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status ?? 'ONLINE'))
      .catch(() => setBackendStatus('READY (STANDALONE)'));
  }, []);

  return (
    <div className="min-h-screen bg-pitbox-cream text-pitbox-dark flex flex-col">
      {/* Navigation / Header */}
      <header className="bg-pitbox-steel text-white shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white/10 p-2 rounded-lg">
              <Wrench className="w-6 h-6 text-pitbox-seafoam" />
            </div>
            <span className="text-xl font-bold tracking-tight">PitBox</span>
            <span className="text-xs bg-pitbox-glacier/30 text-pitbox-seafoam px-2 py-0.5 rounded-full border border-pitbox-glacier/40 font-mono">
              v0.1.0
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-slate-200">System:</span>
            <span
              data-testid="backend-status"
              className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-pitbox-seafoam text-pitbox-dark"
            >
              <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-pitbox-steel" />
              {backendStatus}
            </span>
          </div>
        </div>
      </header>

      {/* Hero / Welcome */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 w-full">
        <div className="text-center max-w-3xl mx-auto">
          <h1 className="text-4xl font-extrabold tracking-tight text-pitbox-steel sm:text-5xl">
            Digital Service Book & Vehicle History
          </h1>
          <p className="mt-4 text-lg text-slate-600">
            A lightweight, zero-bloat digital service logbook for vehicle owners. Complete maintenance records,
            smart interval reminders, and total cost of ownership visibility.
          </p>
        </div>

        {/* Feature Cards previewing brand tokens */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
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
      </main>

      {/* Footer */}
      <footer className="border-t border-pitbox-seafoam/40 py-6 text-center text-xs text-slate-500">
        PitBox &copy; {new Date().getFullYear()} &middot; Digital Service Book
      </footer>
    </div>
  );
};

export default App;
