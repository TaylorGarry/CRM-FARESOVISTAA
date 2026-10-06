import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth.ts';
import { isAdminUser } from '../utils/permissions';
interface HeaderProps { isSidebarOpen: boolean; setIsSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>; }
const Header: React.FC<HeaderProps> = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const { user, logout } = useAuth(); const navigate = useNavigate(); const location = useLocation(); const [dropdownOpen, setDropdownOpen] = useState(false); const [now, setNow] = useState(new Date());
  useEffect(() => { const timer = window.setInterval(() => setNow(new Date()), 1000); return () => window.clearInterval(timer); }, []);
  const name = user?.isAdmin ? 'Admin' : user?.user_login || 'User'; const page = location.pathname.split('/').filter(Boolean).pop()?.replace(/-/g, ' ') || 'dashboard';
  return <header className="app-header fixed left-0 right-0 top-0 z-50 h-17 bg-white"><div className="flex h-full items-center justify-between px-4 sm:px-6"><div className="flex min-w-0 items-center gap-3"><button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="icon-button" aria-label="Toggle navigation"><svg className="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="1.8" d="M4 6h16M4 12h16M4 18h16" /></svg></button><Link to="/dashboard" className="flex items-center gap-2.5"><img src="/faresovista-logo.png" alt="Faresovista" className="size-8 rounded-md object-cover" />
  <span className="hidden text-[13px] font-bold tracking-[.16em] text-[#18345f] sm:block"><small className="ml-2 text-[12px] font-semibold tracking-[.12em] text-[#60708a]">AIRLINE CRM</small></span></Link><span className="mx-2 hidden h-5 w-px bg-[#e4e8f0] lg:block" /></div>
  <div className="flex items-center gap-2 sm:gap-4">
    <time className="hidden text-lg font-bold text-[#60708a] xl:block">
      {now.toLocaleString(undefined, { weekday: 'short', month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' ,second: '2-digit', hour12: true})}</time>
      <button className="icon-button relative" aria-label="Notifications">
        <svg className="size-4.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="1.8" d="M15 17h5l-1.4-1.4A2 2 0 0118 14.2V11a6 6 0 00-12 0v3.2c0 .5-.2 1-.6 1.4L4 17h5m6 0v1a3 3 0 01-6 0v-1" /></svg>
          <span className="notification-dot">8</span></button><div className="relative">
            <button onClick={() => setDropdownOpen(v => !v)} className="flex items-center gap-2 rounded-md p-1.5 hover:bg-[#f5f7fc]">
              <span className="grid size-8 place-items-center rounded-md bg-[#e8e8ff] text-xs font-bold text-[#3478d4]">{name.charAt(0).toUpperCase()}</span>
              <span className="hidden text-left sm:block"><strong className="block text-xs font-semibold text-[#18345f]">{name}</strong><small className="block text-[10px] text-[#8c98aa]">{user?.isAdmin ? 'Administrator' : 'Operations user'}</small></span><svg className="size-3.5 text-[#8c98aa]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" d="M6 9l6 6 6-6" /></svg></button>{dropdownOpen && <div className="absolute right-0 mt-2 w-48 rounded-lg border border-[#e4e8f0] bg-white py-1 shadow-lg">{isAdminUser(user) && <Link to="/change-password" onClick={() => setDropdownOpen(false)} className="block px-4 py-2.5 text-xs font-medium text-[#18345f] hover:bg-[#f5f7fc]">Change Password</Link>}<button onClick={async () => { setDropdownOpen(false); await logout(); navigate('/login'); }} className="w-full px-4 py-2.5 text-left text-sm font-bold text-[#bb1616] hover:bg-[#fff5f5]">Log Out</button></div>}</div></div></div></header>;
};
export default Header;
