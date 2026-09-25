import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import {
  getFirstAllowedPath,
  isAdminUser,
  loadUserPermission,
} from '../utils/permissions';

const EyeIcon = ({ visible }: { visible: boolean }) => (
  <svg
    className="size-4"
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {visible ? (
      <>
        <path d="M2.062 12.348a1 1 0 0 1 0-.696 10.75 10.75 0 0 1 19.876 0 1 1 0 0 1 0 .696 10.75 10.75 0 0 1-19.876 0" />
        <circle cx="12" cy="12" r="3" />
      </>
    ) : (
      <>
        <path d="m2 2 20 20" />
        <path d="M6.71 6.71C4.82 7.99 3.24 9.91 2.06 11.65a1 1 0 0 0 0 .7 10.75 10.75 0 0 0 19.88 0 1 1 0 0 0 0-.7 18.3 18.3 0 0 0-4.13-4.95" />
        <path d="M9.88 9.88a3 3 0 0 0 4.24 4.24" />
        <path d="M12 5.25c3.46 0 6.52 2.04 8.52 5.03" />
      </>
    )}
  </svg>
);

const BrandLockup = () => (
  <div className="flex items-center gap-3">
    <img
      src="/faresovista-logo.png"
      alt="Faresovista"
      className="size-10 rounded-xl object-cover shadow-sm"
    />
    <span className="leading-none">
      <strong className="block text-sm font-bold tracking-[0.18em] text-[#f4f0e7]">
        FARESOVISTA
      </strong>
      <small className="mt-1 block text-[9px] font-semibold tracking-[0.24em] text-[#8c96a2]">
        AIRLINE OPERATIONS CRM
      </small>
    </span>
  </div>
);

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, user, isAuthenticated } = useAuth();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const stat = params.get('stat');
    if (stat === 'Invalid username or password') {
      setError('Invalid username or password');
    }

    if (!isAuthenticated || !user) return;

    let active = true;
    const redirectAfterLogin = async () => {
      if (isAdminUser(user)) {
        navigate('/dashboard', { replace: true });
        return;
      }

      try {
        const permission = await loadUserPermission(user);
        if (active) {
          navigate(
            permission ? getFirstAllowedPath(permission.allowedPaths) : '/dashboard',
            { replace: true }
          );
        }
      } catch {
        if (active) navigate('/dashboard', { replace: true });
      }
    };

    redirectAfterLogin();
    return () => {
      active = false;
    };
  }, [location, isAuthenticated, navigate, user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email || !password) {
        setError('Please enter both username/email and password');
        setIsLoading(false);
        return;
      }

      await login(email, password);
    } catch (err: any) {
      setError(err.message || 'Invalid username or password');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#0b0f14] font-[Arial,Helvetica,sans-serif] text-[#f4f0e7] min-[701px]:grid-cols-[minmax(380px,0.7fr)_minmax(420px,1.3fr)] min-[901px]:grid-cols-[minmax(500px,1.08fr)_minmax(480px,0.92fr)]">
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#0b0f14] min-[701px]:block">
        <img
          src="https://plus.unsplash.com/premium_photo-1679830513886-e09cd6dc3137?w=1200&auto=format&fit=crop&q=80&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8ZmxpZ2h0fGVufDB8fDB8fHww"
          alt=""
          className="absolute inset-0 size-full object-cover object-center"
          aria-hidden="true"
        />
        <div
          className="absolute inset-0 bg-[linear-gradient(135deg,rgba(11,15,20,0.58),rgba(11,15,20,0.25))]"
          aria-hidden="true"
        />
        <div className="absolute inset-0 bg-[#0b0f14]/35" aria-hidden="true" />
        <div className="flight-grid" aria-hidden="true">
          <div className="flight-grid__latitude flight-grid__latitude--one" />
          <div className="flight-grid__latitude flight-grid__latitude--two" />
          <div className="flight-grid__longitude flight-grid__longitude--one" />
          <div className="flight-grid__longitude flight-grid__longitude--two" />
          <div className="flight-grid__route flight-grid__route--one" />
          <div className="flight-grid__route flight-grid__route--two" />
          <span className="flight-grid__node flight-grid__node--one" />
          <span className="flight-grid__node flight-grid__node--two" />
          <span className="flight-grid__node flight-grid__node--three" />
          <div className="flight-grid__coordinates">
            40&deg; 41&apos; 21.1&quot; N
            <br />
            74&deg; 02&apos; 40.2&quot; W
          </div>
        </div>

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-10.5 py-13 min-[901px]:px-25">
          <BrandLockup />

          <div className="max-w-127.5 py-[10vh]">
            <p className="mb-5 text-[10px] font-bold tracking-[0.23em] text-[#d6b36a]">
              TRAVEL &amp; AIRLINE OPERATIONS
            </p>
            <h1 className="m-0 text-[44px] font-normal leading-[0.98] tracking-normal text-[#f4f0e7] min-[901px]:text-[52px] min-[1200px]:text-[70px]">
              Precision in
              <br />
              <em className="not-italic text-[#e6cc93]">every operation.</em>
            </h1>
            <p className="mt-7.5 max-w-87.5 text-[15px] leading-[1.75] text-[#8c96a2]">
              One intelligent workspace for the people, routes, and decisions that keep your network moving.
            </p>
          </div>

          <div className="flex items-center gap-2.75 text-[10px] uppercase tracking-[0.12em] text-[#8c96a2]">
            <span className="size-1.5 rounded-full bg-[#d6b36a] shadow-[0_0_0_4px_rgba(214,179,106,0.13)]" />
            <span>Systems operational</span>
            <span className="h-px w-7 bg-[rgba(231,226,211,0.15)]" />
            <span>v2.4.0</span>
          </div>
        </div>
      </aside>

      <section className="relative flex min-h-screen min-w-0 flex-col justify-center overflow-x-hidden border-l border-white/5 bg-[#121820] px-6 py-7 min-[421px]:px-8 min-[701px]:px-13 min-[701px]:py-10.5 min-[901px]:px-24 min-[1200px]:px-32">
        <div className="mb-19 mt-2 flex min-[701px]:hidden">
          <BrandLockup />
        </div>

        <div className="m-auto min-w-0 w-full max-w-115 min-[701px]:max-w-97.5">
          <div className="mb-9.5">
            <p className="mb-3.5 text-[10px] font-bold tracking-[0.23em] text-[#d6b36a]">
              WELCOME BACK
            </p>
            <h2 className="m-0 text-[28px] font-normal leading-tight tracking-normal text-[#f4f0e7] min-[421px]:text-[32px]">
              Sign in to your workspace
            </h2>
            <p className="mt-3 text-sm leading-[1.6] text-[#8c96a2]">
              Enter your credentials to access the airline operations control center.
            </p>
          </div>

          {error && (
            <div className="mb-5 rounded bg-[#d17d72]/10 px-3.5 py-3 text-sm text-[#d17d72] ring-1 ring-[#d17d72]/20">
              {error}
            </div>
          )}

          <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit}>
            <label className="flex flex-col gap-2 text-sm font-semibold text-[#f4f0e7]">
              Username or email
              <input
                autoComplete="username"
                type="text"
                placeholder="you@faresovista.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
                className="h-13 rounded border border-[rgba(231,226,211,0.15)] bg-[#ffffff] px-3.5 text-sm font-bold text-[#000000] outline-none transition placeholder:text-[#999999] focus:border-[#d6b36a] focus:ring-4 focus:ring-[#d6b36a]/10 disabled:opacity-70"
              />
            </label>

            <label className="flex flex-col gap-2 text-sm font-semibold text-[#f4f0e7]" htmlFor="password">
              Password
              <span className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  aria-invalid={Boolean(error)}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  className="h-13 w-full rounded border border-[rgba(231,226,211,0.15)] bg-[#ffffff] px-3.5 pr-12 text-sm font-bold text-[#000000] outline-none transition placeholder:text-[#999999] focus:border-[#d6b36a] focus:ring-4 focus:ring-[#d6b36a]/10 disabled:opacity-70"
                />
                <button
                  type="button"
                  className="absolute right-0 top-0 grid h-13 w-12 place-items-center text-[#8c96a2] transition hover:text-[#d6b36a]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  onClick={() => setShowPassword((value) => !value)}
                >
                  <EyeIcon visible={showPassword} />
                </button>
              </span>
            </label>

            <div className="flex flex-col items-start gap-3 text-xs min-[421px]:flex-row min-[421px]:items-center min-[421px]:justify-between min-[421px]:gap-4">
              <Link to="/forgot-password" className="font-bold text-[#d6b36a] hover:underline">
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="login-submit-button inline-flex h-12.5 text-base font-bold w-full items-center justify-center gap-2 rounded bg-[#d6b36a] px-5 cursor-pointer text-white shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-[#e6cc93] disabled:cursor-wait disabled:opacity-70"
            >
              {isLoading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>

          <p className="mt-10 text-center text-xs leading-5 text-[#8c96a2]">
            Need help accessing your account?{' '}
            <a href="mailto:support@faresovista.com" className="font-bold text-[#d6b36a] hover:underline">
              Contact support
            </a>
          </p>
        </div>

        <div className="mt-18 flex flex-wrap items-center justify-center gap-2 text-center text-[7px] uppercase tracking-[0.12em] text-[#65707b] min-[421px]:gap-2.75 min-[421px]:text-[8px] min-[701px]:mt-auto min-[701px]:text-[9px]">
          <span>SECURE ENTERPRISE WORKSPACE</span>
          <span className="h-px w-7 bg-[rgba(231,226,211,0.15)]" />
          <span>AUTHENTICATION</span>
        </div>
      </section>
    </main>
  );
};

export default Login;
