import React from 'react';
import { useAuth } from '../../hooks/useAuth';

const Dashboard: React.FC = () => {
  const { user } = useAuth();

  return (
    <div className="space-y-4 font-[Arial,Helvetica,sans-serif] text-[#f4f0e7]">
      {/* Welcome Section */}
      <div className="rounded-xl border border-[rgba(231,226,211,0.15)] bg-[#121820] p-6 shadow-sm mt-5">
        <p className="mb-2 text-[10px] font-bold tracking-[0.23em] text-[#d6b36a]">
          OPERATIONS CONTROL CENTER
        </p>
        <h1 className="text-2xl font-normal tracking-normal text-[#f4f0e7] min-[421px]:text-3xl">
          Welcome back, <span className="font-semibold text-[#e6cc93]">{user?.user_login || 'User'}</span>!
        </h1>
        <p className="mt-2 text-sm leading-[1.6] text-[#8c96a2]">
          Your airline operations workspace is fully synced and operational.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-4 min-[600px]:grid-cols-2 lg:grid-cols-4">
        {/* Active Flights */}
        <div className="rounded-xl border border-[rgba(231,226,211,0.15)] bg-[#121820] p-6 transition hover:border-[#d6b36a]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c96a2]">
                Active Flights
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#f4f0e7]">24</p>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-[#d6b36a]/10 text-[#d6b36a] ring-1 ring-[#d6b36a]/20">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </div>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="rounded-xl border border-[rgba(231,226,211,0.15)] bg-[#121820] p-6 transition hover:border-[#d6b36a]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c96a2]">
                Total Bookings
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#f4f0e7]">1,284</p>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-[#d6b36a]/10 text-[#d6b36a] ring-1 ring-[#d6b36a]/20">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* On-Time Rate */}
        <div className="rounded-xl border border-[rgba(231,226,211,0.15)] bg-[#121820] p-6 transition hover:border-[#d6b36a]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c96a2]">
                On-Time Rate
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#f4f0e7]">94.6%</p>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-[#d6b36a]/10 text-[#d6b36a] ring-1 ring-[#d6b36a]/20">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </div>

        {/* Crew Members */}
        <div className="rounded-xl border border-[rgba(231,226,211,0.15)] bg-[#121820] p-6 transition hover:border-[#d6b36a]/40">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#8c96a2]">
                Crew Members
              </p>
              <p className="mt-2 text-3xl font-bold tracking-tight text-[#f4f0e7]">86</p>
            </div>
            <div className="grid size-12 place-items-center rounded-xl bg-[#d6b36a]/10 text-[#d6b36a] ring-1 ring-[#d6b36a]/20">
              <svg className="size-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;