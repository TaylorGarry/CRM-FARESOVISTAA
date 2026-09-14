import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { apiService } from "../services/api.ts";

const PlaneIcon = ({ className = 'size-5' }: { className?: string }) => (
  <svg
    className={className}
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    <path d="M17.8 19.2 16 11l3.5-3.5C21 6 21.5 4 21 3c-1-.5-3 0-4.5 1.5L13 8 4.8 6.2c-.5-.1-.9.1-1.1.5l-.3.5c-.2.5-.1 1 .3 1.3L9 12l-2 3H4l-1 1 3 2 2 3 1-1v-3l3-2 3.5 5.3c.3.4.8.5 1.3.3l.5-.2c.4-.3.6-.7.5-1.2z" />
  </svg>
);

const BrandLockup = () => (
  <div className="flex items-center gap-3">
    <span className="grid size-10 place-items-center rounded-xl bg-[#d6b36a] text-[#0b0f14] shadow-sm">
      <PlaneIcon />
    </span>
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

const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      if (!email) {
        setError('Please enter your email or username');
        setIsLoading(false);
        return;
      }

      await apiService.forgotPassword({ email_id: email });
      setSuccess(true);
      
      setTimeout(() => {
        navigate('/forgot-password-success');
      }, 3000);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to send reset instructions');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="grid min-h-screen grid-cols-1 overflow-x-hidden bg-[#0b0f14] font-[Arial,Helvetica,sans-serif] text-[#f4f0e7] min-[701px]:grid-cols-[minmax(380px,0.7fr)_minmax(420px,1.3fr)] min-[901px]:grid-cols-[minmax(500px,1.08fr)_minmax(480px,0.92fr)]">
      {/* Left Section - Brand/Info */}
      <aside className="relative hidden min-h-screen overflow-hidden bg-[#0b0f14] min-[701px]:block">
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

        <div className="relative z-10 flex min-h-screen flex-col justify-between px-[42px] py-[52px] min-[901px]:px-20 min-[1200px]:px-[100px]">
          <BrandLockup />

          <div className="max-w-[510px] py-[10vh]">
            <p className="mb-5 text-[10px] font-bold tracking-[0.23em] text-[#d6b36a]">
              ACCOUNT RECOVERY
            </p>
            <h1 className="m-0 text-[44px] font-normal leading-[0.98] tracking-normal text-[#f4f0e7] min-[901px]:text-[52px] min-[1200px]:text-[70px]">
              Forgot your
              <br />
              <em className="not-italic text-[#e6cc93]">password?</em>
            </h1>
            <p className="mt-[30px] max-w-[350px] text-[15px] leading-[1.75] text-[#8c96a2]">
              Enter your registered email or username to begin the password recovery process.
            </p>
          </div>

          <div className="flex items-center gap-[11px] text-[10px] uppercase tracking-[0.12em] text-[#8c96a2]">
            <span className="size-[6px] rounded-full bg-[#d6b36a] shadow-[0_0_0_4px_rgba(214,179,106,0.13)]" />
            <span>Systems operational</span>
            <span className="h-px w-7 bg-[rgba(231,226,211,0.15)]" />
            <span>v2.4.0</span>
          </div>
        </div>
      </aside>

      {/* Right Section - Form */}
      <section className="relative flex min-h-screen min-w-0 flex-col justify-center overflow-x-hidden border-l border-white/[0.05] bg-[#121820] px-6 py-7 min-[421px]:px-8 min-[701px]:px-[52px] min-[701px]:py-[42px] min-[901px]:px-24 min-[1200px]:px-32">
        <div className="mb-[76px] mt-2 flex min-[701px]:hidden">
          <BrandLockup />
        </div>

        <div className="m-auto min-w-0 w-full max-w-[460px] min-[701px]:max-w-[390px]">
          <div className="mb-[38px]">
            <p className="mb-3.5 text-[10px] font-bold tracking-[0.23em] text-[#d6b36a]">
              RESET PASSWORD
            </p>
            <h2 className="m-0 text-[28px] font-normal leading-tight tracking-normal text-[#f4f0e7] min-[421px]:text-[32px]">
              Forgot your password?
            </h2>
            <p className="mt-3 text-sm leading-[1.6] text-[#8c96a2]">
              Enter your registered email or username to begin the password recovery process.
            </p>
          </div>

          {success ? (
            <div className="p-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-sm">
              ✅ Reset instructions sent! Redirecting to login...
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-5 rounded bg-[#d17d72]/10 px-3.5 py-3 text-sm text-[#d17d72] ring-1 ring-[#d17d72]/20">
                  {error}
                </div>
              )}

              <form noValidate className="flex flex-col gap-5" onSubmit={handleSubmit}>
                <label className="flex flex-col gap-2 text-sm font-semibold text-[#f4f0e7]">
                  Email or username
                  <input
                    type="email"
                    placeholder="you@faresovista.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="h-[52px] rounded border border-[rgba(231,226,211,0.15)] bg-[#18212b] px-3.5 text-sm font-normal text-[#f4f0e7] outline-none transition placeholder:text-[#66717d] focus:border-[#d6b36a] focus:ring-4 focus:ring-[#d6b36a]/10 disabled:opacity-70"
                  />
                </label>

                <button
                  type="submit"
                  disabled={isLoading}
                  className="inline-flex h-[50px] text-base font-bold w-full items-center justify-center gap-2 rounded bg-[#d6b36a] px-5 cursor-pointer text-[#0b0f14] shadow-[0_8px_24px_rgba(0,0,0,0.18)] transition hover:bg-[#e6cc93] disabled:cursor-wait disabled:opacity-70"
                >
                  {isLoading ? 'Sending...' : 'Send reset instructions'}
                  {!isLoading && (
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  )}
                </button>
              </form>
            </>
          )}

          <div className="mt-6 text-center">
            <Link to="/login" className="text-xs font-bold text-[#d6b36a] hover:underline inline-flex items-center gap-1.5">
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>

        <div className="mt-18 flex flex-wrap items-center justify-center gap-2 text-center text-[7px] uppercase tracking-[0.12em] text-[#65707b] min-[421px]:gap-[11px] min-[421px]:text-[8px] min-[701px]:mt-auto min-[701px]:text-[9px]">
          <span>SECURE ENTERPRISE WORKSPACE</span>
          <span className="h-px w-7 bg-[rgba(231,226,211,0.15)]" />
          <span>AUTHENTICATION</span>
        </div>
      </section>
    </main>
  );
};

export default ForgotPassword;