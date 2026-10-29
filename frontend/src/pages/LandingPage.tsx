import React, { useEffect, useState } from 'react';
import { Wrench, Gauge, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '../router/Router';
import { useAuth } from '../context/AuthContext';

const SHOWCASE_ITEMS = [
  {
    title: 'Visual Garage Profiles',
    subtitle: 'Fleet Overview',
    description: 'Store photos, VINs, engine specs, and registration plates for every vehicle you own.',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
    alt: 'Modern vehicle parked in a clean bright space',
    icon: ShieldCheck,
  },
  {
    title: 'Service & Receipt Archive',
    subtitle: 'Maintenance Log',
    description: 'Record itemized repairs, workshop notes, and compressed invoice photos in seconds.',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80',
    alt: 'Clean automotive engine bay and maintenance inspection',
    icon: Wrench,
  },
  {
    title: 'Odometer & Interval Alerts',
    subtitle: 'Smart Reminders',
    description: 'Log forward-only mileage readings and stay ahead of oil changes and STK inspections.',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80',
    alt: 'Vehicle dashboard and road view representing mileage tracking',
    icon: Gauge,
  },
];

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
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto px-6 py-14 sm:py-20 w-full">
      {/* Minimalist Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-pitbox-glacier mb-3">
          PitBox Digital Logbook
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Digital Service Book &amp; Vehicle History
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          A calm, clutter-free place to track your vehicle mileage, maintenance records, and upcoming intervals.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/garage"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
            >
              Go to My Garage
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
              >
                Create Free Account
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              >
                Sign In
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Featured Vehicle Card with Real Photography */}
      <div className="mt-12 bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden grid grid-cols-1 md:grid-cols-12">
        <div className="md:col-span-5 relative h-56 md:h-auto bg-slate-100">
          <img
            src="https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=900&q=80"
            alt="2019 Škoda Octavia Combi 2.0 TDI showcase vehicle"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              Live Profile Preview
            </span>
          </div>
          <div className="absolute bottom-3 left-3 bg-white/95 backdrop-blur-xs text-slate-900 font-mono font-semibold text-xs px-2.5 py-1 rounded-md border border-slate-200/90 shadow-2xs tracking-wider">
            1AB 2345
          </div>
        </div>

        <div className="md:col-span-7 p-6 sm:p-8 flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 pb-5 border-b border-slate-100">
            <div>
              <span className="text-[11px] font-semibold uppercase tracking-wider text-pitbox-glacier">
                Daily Driver &middot; Diesel
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                2019 Škoda Octavia Combi 2.0 TDI
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                VIN: TMBJJ7NE5K0123456 &middot; 110 kW (150 HP)
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Up to Date
            </span>
          </div>

          <div className="pt-5 grid grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Odometer</span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 font-mono">
                144,100 km
              </p>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Oil Service</span>
              <p className="text-base sm:text-lg font-semibold text-pitbox-steel mt-0.5">
                78% Life
              </p>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Inspection</span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5">
                In 42 Days
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Visual Showcase Gallery */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Inside Your Logbook
          </h3>
          <span className="text-xs text-slate-400">Built for clarity</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {SHOWCASE_ITEMS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="bg-white rounded-2xl border border-slate-200/80 overflow-hidden flex flex-col hover:border-slate-300 transition-colors duration-200"
              >
                <div className="h-36 w-full bg-slate-100 relative overflow-hidden">
                  <img
                    src={item.image}
                    alt={item.alt}
                    loading="lazy"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute top-2.5 left-2.5 bg-white/90 backdrop-blur-xs px-2.5 py-0.5 rounded-full border border-slate-200/80 inline-flex items-center gap-1.5">
                    <Icon className="w-3 h-3 text-pitbox-steel" />
                    <span className="text-[10px] font-semibold text-slate-700">
                      {item.subtitle}
                    </span>
                  </div>
                </div>
                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Quiet Footer Status */}
      <div className="mt-12 pt-4 border-t border-slate-200/60 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <span>Zero-bloat architecture &middot; Strict tenant isolation</span>
        <div className="inline-flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
          <span data-testid="backend-status" className="font-mono text-[11px] text-slate-500">
            {backendStatus}
          </span>
        </div>
      </div>
    </div>
  );
};
