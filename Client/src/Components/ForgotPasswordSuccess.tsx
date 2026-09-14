import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const ForgotPasswordSuccess: React.FC = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/login');
    }, 3000);

    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="min-h-screen flex bg-gradient-to-br from-[#0a0e1a] via-[#0d1b2a] to-[#1b2a3a]">
      {/* Left Section - Brand/Info */}
      <div className="hidden lg:flex lg:w-1/2 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-20 right-20 w-64 h-64 bg-yellow-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-yellow-500/5 rounded-full blur-3xl"></div>
        
        <div>
          <div className="flex items-center gap-3 mb-12">
            <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-xl flex items-center justify-center shadow-lg shadow-yellow-500/20">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
            <div>
              <span className="text-2xl font-bold text-white tracking-tight">FARESOVISTA</span>
              <span className="block text-xs text-yellow-400 font-medium tracking-wider">AIRLINE OPERATIONS CRM</span>
            </div>
          </div>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white leading-tight mb-4">
              ACCOUNT RECOVERY
            </h1>
            <p className="text-yellow-400 text-lg mb-2">
              Check your email
            </p>
            <p className="text-white/60 text-sm">
              We've sent password reset instructions to your registered email address.
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></span>
              <span className="text-xs text-yellow-400 font-medium">SYSTEMS OPERATIONAL</span>
            </div>
            <span className="text-xs text-white/30">V2.4.0</span>
          </div>
          <span className="text-xs text-white/30">SECURE ENTERPRISE WORKSPACE</span>
        </div>
      </div>

      {/* Right Section - Success Message */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 lg:p-12">
        <div className="w-full max-w-md">
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl text-center">
            <div className="w-20 h-20 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Check Your Email</h2>
            <p className="text-white/60 text-sm mb-2">
              We've sent password reset instructions to your registered email address.
            </p>
            <p className="text-xs text-white/30">
              Redirecting to login...
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordSuccess;