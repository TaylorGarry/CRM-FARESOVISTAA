// import React, { useState, useEffect } from 'react';
// import { useNavigate, useSearchParams } from 'react-router-dom';
// import { apiService } from '../services/api';

// const ResetPassword: React.FC = () => {
//   const [searchParams] = useSearchParams();
//   const [new_password, setNewPassword] = useState('');
//   const [confirm_password, setConfirmPassword] = useState('');
//   const [msg, setMsg] = useState<string | null>(null);
//   const [isLoading, setIsLoading] = useState(false);
//   const [isValid, setIsValid] = useState(false);
//   const navigate = useNavigate();

//   const code = searchParams.get('code');
//   const type = searchParams.get('type');

//   useEffect(() => {
//     const validate = async () => {
//       if (!code || !type) {
//         navigate('/login');
//         return;
//       }

//       try {
//         const data = await apiService.getResetPasswordData(code, type);
//         if (data.success) {
//           setIsValid(true);
//         } else {
//           navigate('/login');
//         }
//       } catch (error) {
//         navigate('/login');
//       }
//     };

//     validate();
//   }, [code, type, navigate]);

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();
//     setMsg(null);
//     setIsLoading(true);

//     try {
//       if (new_password !== confirm_password) {
//         setMsg('New Password and Confirm password is not match');
//         setIsLoading(false);
//         return;
//       }

//       if (!code || !type) {
//         setMsg('Invalid reset link');
//         setIsLoading(false);
//         return;
//       }

//       await apiService.resetPassword({
//         code,
//         type,
//         new_password,
//         confirm_password,
//       });

//       navigate('/login?reset=success');
//     } catch (err: any) {
//       setMsg(err.response?.data?.message || 'Password reset failed');
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   if (!isValid) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-white">
//         <div className="text-center">
//           <h3 className="text-xl font-light text-gray-600">Loading...</h3>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-white">
//       <div className="w-full max-w-md px-4">
//         <div className="bg-white shadow-lg rounded-lg p-8">
//           <form className="space-y-6" onSubmit={handleSubmit}>
//             {msg && (
//               <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded relative">
//                 <button 
//                   type="button"
//                   className="absolute right-2 top-2 text-red-500 hover:text-red-700"
//                   onClick={() => setMsg(null)}
//                 >
//                   ×
//                 </button>
//                 <span>{msg}</span>
//               </div>
//             )}

//             <h3 className="text-2xl font-light text-gray-800 text-center">
//               Change Password
//             </h3>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 New Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <i className="icon-lock text-gray-400"></i>
//                 </div>
//                 <input
//                   type="password"
//                   placeholder="New Password"
//                   value={new_password}
//                   onChange={(e) => setNewPassword(e.target.value)}
//                   disabled={isLoading}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             <div>
//               <label className="block text-sm font-medium text-gray-700 mb-1">
//                 Confirm Password
//               </label>
//               <div className="relative">
//                 <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                   <i className="icon-lock text-gray-400"></i>
//                 </div>
//                 <input
//                   type="password"
//                   placeholder="Confirm Password"
//                   value={confirm_password}
//                   onChange={(e) => setConfirmPassword(e.target.value)}
//                   disabled={isLoading}
//                   className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
//                 />
//               </div>
//             </div>

//             <div className="flex justify-end">
//               <button
//                 type="submit"
//                 name="submit"
//                 disabled={isLoading}
//                 className="bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-6 rounded-md transition-colors flex items-center gap-2 disabled:opacity-50"
//               >
//                 {isLoading ? 'Submitting...' : 'Submit'}
//                 <i className="m-icon-swapright"></i>
//               </button>
//             </div>
//           </form>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ResetPassword;



import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { apiService } from "../services/api.ts"

const ResetPassword: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [new_password, setNewPassword] = useState('');
  const [confirm_password, setConfirmPassword] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isValid, setIsValid] = useState(false);
  const navigate = useNavigate();

  const code = searchParams.get('code');
  const type = searchParams.get('type');

  useEffect(() => {
    const validate = async () => {
      if (!code || !type) {
        navigate('/login');
        return;
      }

      try {
        const data = await apiService.getResetPasswordData(code, type);
        if (data.success) {
          setIsValid(true);
        } else {
          navigate('/login');
        }
      } catch (error) {
        navigate('/login');
      }
    };

    validate();
  }, [code, type, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setIsLoading(true);

    try {
      if (new_password !== confirm_password) {
        setMsg('Passwords do not match');
        setIsLoading(false);
        return;
      }

      if (!code || !type) {
        setMsg('Invalid reset link');
        setIsLoading(false);
        return;
      }

      await apiService.resetPassword({
        code,
        type,
        new_password,
        confirm_password,
      });

      navigate('/login?reset=success');
    } catch (err: any) {
      setMsg(err.response?.data?.message || 'Password reset failed');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0d1b2a] to-[#1b2a3a]">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0a0e1a] via-[#0d1b2a] to-[#1b2a3a] p-4">
      <div className="w-full max-w-md">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 shadow-2xl">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white">Set New Password</h2>
            <p className="text-white/60 text-sm mt-1">
              Enter your new password below
            </p>
          </div>

          {msg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl text-sm">
              {msg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password"
                value={new_password}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                disabled={isLoading}
              />
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-white/80 mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm new password"
                value={confirm_password}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-white/30 focus:ring-2 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition"
                disabled={isLoading}
              />
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-[#0a0e1a] font-semibold py-3 px-4 rounded-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-yellow-500/20 hover:shadow-yellow-500/40"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5 text-[#0a0e1a]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Resetting...
                </span>
              ) : (
                'Reset Password'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link to="/login" className="text-sm text-yellow-400 hover:text-yellow-300 transition flex items-center justify-center gap-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
              Back to login
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;