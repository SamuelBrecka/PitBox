import React, { useEffect, useState } from 'react';
import { Wrench, Gauge, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from '../router/Router';
import { useAuth } from '../context/AuthContext';

const SHOWCASE_ITEMS = [
  {
    title: 'Vizuálne profily vozidiel',
    subtitle: 'Prehľad vozového parku',
    description: 'Uchovávajte fotografie, čísla VIN, špecifikácie motora a evidenčné čísla pre každé vaše vozidlo.',
    image:
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=700&q=80',
    alt: 'Moderné vozidlo zaparkované v čistom svetlom priestore',
    icon: ShieldCheck,
  },
  {
    title: 'Archív servisov a bločkov',
    subtitle: 'Servisný denník',
    description: 'Zaznamenávajte položkové opravy, poznámky zo servisu a komprimované fotografie faktúr v priebehu pár sekúnd.',
    image:
      'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=700&q=80',
    alt: 'Čistý motorový priestor automobilu a kontrola údržby',
    icon: Wrench,
  },
  {
    title: 'Tachometer a upozornenia na intervaly',
    subtitle: 'Inteligentné pripomienky',
    description: 'Zapisujte stav najazdených kilometrov a majte prehľad o výmenách oleja a kontrolách STK.',
    image:
      'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=700&q=80',
    alt: 'Palubná doska vozidla a pohľad na cestu znázorňujúci sledovanie kilometrov',
    icon: Gauge,
  },
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const [backendStatus, setBackendStatus] = useState<string>('Kontrola...');

  useEffect(() => {
    fetch('/api/health')
      .then((res) => res.json())
      .then((data) => setBackendStatus(data.status ?? 'ONLINE'))
      .catch(() => setBackendStatus('PRIPRAVENÉ (SAMOSTATNÉ)'));
  }, []);

  return (
    <div className="flex-1 flex flex-col justify-between max-w-5xl mx-auto px-6 py-14 sm:py-20 w-full">
      {/* Minimalist Hero Section */}
      <div className="text-center max-w-2xl mx-auto">
        <p className="text-xs font-semibold uppercase tracking-widest text-pitbox-glacier mb-3">
          Digitálny denník PitBox
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-slate-900 leading-tight">
          Digitálna servisná knižka a história vozidla
        </h1>
        <p className="mt-4 text-base sm:text-lg text-slate-500 leading-relaxed max-w-xl mx-auto">
          Prehľadné a čisté miesto na sledovanie stavu tachometra, záznamov o údržbe a nadchádzajúcich servisných intervalov.
        </p>

        <div className="mt-8 flex items-center justify-center gap-3">
          {isAuthenticated ? (
            <Link
              to="/garage"
              className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
            >
              Prejsť do mojej garáže
              <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          ) : (
            <>
              <Link
                to="/register"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-white bg-pitbox-steel hover:bg-pitbox-steel/90 transition-colors duration-200 cursor-pointer"
              >
                Vytvoriť bezplatný účet
                <ArrowRight className="ml-2 w-4 h-4" />
              </Link>
              <Link
                to="/login"
                className="inline-flex items-center px-6 py-2.5 rounded-full text-sm font-medium text-slate-600 bg-white border border-slate-200 hover:border-slate-300 hover:text-slate-900 transition-colors duration-200 cursor-pointer"
              >
                Prihlásiť sa
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
            alt="Ukážkové vozidlo 2019 Škoda Octavia Combi 2.0 TDI"
            className="w-full h-full object-cover"
          />
          <div className="absolute top-3 left-3">
            <span className="bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-medium px-2.5 py-1 rounded-full border border-slate-200/80 shadow-2xs">
              Ukážka profilu naživo
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
                Denné jazdenie &middot; Nafta
              </span>
              <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                2019 Škoda Octavia Combi 2.0 TDI
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                VIN: TMBJJ7NE5K0123456 &middot; 110 kW (150 k)
              </p>
            </div>
            <span className="self-start inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2.5 py-0.5 rounded-full">
              <CheckCircle2 className="w-3 h-3" />
              Aktuálne
            </span>
          </div>

          <div className="pt-5 grid grid-cols-3 gap-4">
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Tachometer</span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5 font-mono">
                144 100 km
              </p>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Výmena oleja</span>
              <p className="text-base sm:text-lg font-semibold text-pitbox-steel mt-0.5">
                78 % životnosť
              </p>
            </div>
            <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-100">
              <span className="text-[11px] text-slate-400 block">Kontrola STK</span>
              <p className="text-base sm:text-lg font-semibold text-slate-900 mt-0.5">
                O 42 dní
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Visual Showcase Gallery */}
      <div className="mt-10">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xs font-semibold uppercase tracking-widest text-slate-400">
            Vo vašej servisnej knižke
          </h3>
          <span className="text-xs text-slate-400">Navrhnuté pre prehľadnosť</span>
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
        <span>Odľahčená architektúra &middot; Prísna izolácia dát používateľov</span>
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
