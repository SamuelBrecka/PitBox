import React, { useState, useEffect } from 'react';
import { UserPlus, AlertCircle } from 'lucide-react';
import { Link, useNavigate } from '../router/Router';
import { useAuth } from '../context/AuthContext';

export const RegisterPage: React.FC = () => {
  const { register, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
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

    if (!fullName.trim() || !email.trim() || !password) {
      setError('Vyplňte prosím všetky povinné polia.');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mať aspoň 6 znakov.');
    }

    if (password.length < 6) {
      return;
    }

    if (password !== confirmPassword) {
      setError('Heslá sa nezhodujú.');
      return;
    }

    setIsSubmitting(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
      });
      navigate('/garage');
    } catch (err: unknown) {
      const axiosError = err as { response?: { data?: { error?: string } } };
      setError(axiosError.response?.data?.error || 'Registrácia zlyhala. Skúste to prosím znova.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-md border border-pitbox-seafoam/60">
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-xl bg-pitbox-glacier/20 text-pitbox-steel mb-3">
            <UserPlus className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold text-pitbox-dark">Vytvorte si účet PitBox</h2>
          <p className="text-sm text-slate-600 mt-1">Začnite sledovať údržbu svojho vozidla ešte dnes</p>
        </div>

        {error && (
          <div
            data-testid="register-error"
            className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm flex items-start space-x-2"
          >
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="register-name">
              Celé meno
            </label>
            <input
              id="register-name"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Ján Novák"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="register-email">
              E-mailová adresa
            </label>
            <input
              id="register-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="jan.novak@priklad.sk"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="register-password">
              Heslo (min. 6 znakov)
            </label>
            <input
              id="register-password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1" htmlFor="register-confirm-password">
              Potvrdiť heslo
            </label>
            <input
              id="register-confirm-password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3 py-2 border border-slate-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-pitbox-steel focus:border-pitbox-steel text-sm text-pitbox-dark"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-pitbox-steel hover:bg-pitbox-steel/90 text-white font-medium rounded-lg shadow-sm transition disabled:opacity-60 flex items-center justify-center text-sm"
          >
            {isSubmitting ? 'Vytváranie účtu...' : 'Vytvoriť účet'}
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-slate-500">
          Už máte účet?{' '}
          <Link to="/login" className="font-semibold text-pitbox-steel hover:underline">
            Prihlásiť sa
          </Link>
        </div>
      </div>
    </div>
  );
};
