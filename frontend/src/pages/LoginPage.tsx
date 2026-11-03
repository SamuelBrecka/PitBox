import React, { useState, useEffect } from 'react';
import { LogIn, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export const LoginPage: React.FC = () => {
  const { login, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/garage', true);
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Vyplňte prosím všetky polia.');
      return;
    }

    setIsSubmitting(true);
    try {
      await login({ email: email.trim(), password });
      navigate('/garage');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Nesprávny e-mail alebo heslo. Skúste to prosím znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-pitbox-seafoam/60">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-pitbox-steel/10 text-pitbox-steel mb-3">
            <LogIn className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-pitbox-dark">Prihlásenie do PitBoxu</h2>
          <p className="text-sm text-slate-600 mt-1">Prístup k vašej garáži a záznamom o vozidlách</p>
        </div>

        {error && (
          <div
            data-testid="login-error"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="login-email">
              E-mailová adresa
            </label>
            <input
              id="login-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="mechanik@priklad.sk"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="login-password">
              Heslo
            </label>
            <input
              id="login-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-pitbox-steel hover:bg-pitbox-steel/90 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-60 flex items-center justify-center text-sm"
          >
            {isSubmitting ? 'Prihlasovanie...' : 'Prihlásiť sa'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Ešte nemáte účet?{' '}
          <Link to="/register" className="font-semibold text-pitbox-steel hover:underline">
            Vytvoriť účet
          </Link>
        </div>
      </div>
    </div>
  );
};
