// import React, { useEffect, useRef, useState } from 'react';
// import { NavLink } from 'react-router-dom';
// import { useAuth } from '../hooks/useAuth';
// import { isAdminUser, loadUserPermission, normalizePath } from '../utils/permissions';

// interface SidebarProps {
//   isOpen: boolean;
// }

// interface MenuItem {
//   title: string;
//   icon: React.ReactNode;
//   path?: string;
//   subItems?: { title: string; path: string }[];
// }

// const menuItems: MenuItem[] = [
//   {
//     title: 'Dashboard',
//     path: '/dashboard',
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
//       </svg>
//     ),
//   },
//   {
//     title: 'User Access Manager',
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//       </svg>
//     ),
//     subItems: [
//       { title: 'Create User', path: '/users/create' },
//       { title: 'Create Role', path: '/users/roles' },
//       { title: 'Role & Permission', path: '/users/permissions' },
//     ],
//   },
// {
//   title: 'Manage Master',
//   icon: (
//     <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
//     </svg>
//   ),
//   subItems: [
//     { title: 'Type of Booking', path: '/master/booking-types' },
//     { title: 'Currency Specification', path: '/master/currencies' },
//     { title: 'Charging Bifurcation', path: '/master/sources' },
//     { title: 'Card Type', path: '/master/card-types' },
//     { title: 'Email Template', path: '/master/email-templates' },
//     { title: 'Manage Sale Types', path: '/master/sale-types' },
//     { title: 'Assign Booking Status', path: '/master/assign-booking-status' },
//   ],
// },
//   {
//     title: 'Booking Management',
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//       </svg>
//     ),
//     subItems: [
//       { title: 'All Bookings', path: '/bookings/all' },
//       { title: 'Pending Holds', path: '/bookings/holds' },
//     ],
//   },
//   {
//     title: 'Attendance System',
//     icon: (
//       <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
//       </svg>
//     ),
//     subItems: [
//       { title: 'Daily Logs', path: '/attendance/logs' },
//       { title: 'Summary', path: '/attendance/summary' },
//     ],
//   },
// ];

// const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
//   const { user } = useAuth();
//   const isAdmin = isAdminUser(user);
//   const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
//     'User Access Manager': true, // Default open menu
//   });
//   const [visibleMenuItems, setVisibleMenuItems] = useState<MenuItem[]>(menuItems);
//   const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
//   const [hoveredMenuTop, setHoveredMenuTop] = useState(0);
//   const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

//   const showCollapsedMenu = (title: string, top?: number) => {
//     if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
//     if (top !== undefined) setHoveredMenuTop(top);
//     setHoveredMenu(title);
//   };

//   const hideCollapsedMenu = () => {
//     hoverTimeout.current = setTimeout(() => setHoveredMenu(null), 150);
//   };

//   useEffect(() => {
//     if (isAdmin) {
//       setVisibleMenuItems(menuItems);
//       return;
//     }

//     const loadPermissions = async () => {
//       try {
//         const permissionData = await loadUserPermission(user);

//         if (!permissionData) {
//           setVisibleMenuItems([]);
//           return;
//         }

//         setVisibleMenuItems(menuItems.flatMap(item => {
//           if (item.title === 'Dashboard' && !permissionData.dashboardAllowed) return [];
//           if (!item.subItems) return [item];
//           const subItems = item.subItems.filter(subItem => permissionData.allowedPaths.has(normalizePath(subItem.path)));
//           return subItems.length > 0 ? [{ ...item, subItems }] : [];
//         }));
//       } catch (error) {
//         console.error('Error loading menu permissions:', error);
//         setVisibleMenuItems([]);
//       }
//     };

//     loadPermissions();
//   }, [isAdmin, user?.user_role]);

//   const toggleSubMenu = (title: string) => {
//     setOpenMenus((prev) => ({
//       ...prev,
//       [title]: !prev[title],
//     }));
//   };

//   return (
//     <aside
//       className={`fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 overflow-y-auto ${
//         isOpen ? 'w-64' : 'w-20'
//       }`}
//     >
//       <div className="p-3 space-y-1 font-[Arial,Helvetica,sans-serif]">
//         {visibleMenuItems.map((item) => {
//           const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
//           const isSubMenuOpen = openMenus[item.title];

//           return (
//             <div
//               key={item.title}
//               className="relative"
//               onMouseEnter={(event) => !isOpen && showCollapsedMenu(item.title, event.currentTarget.getBoundingClientRect().top)}
//               onMouseLeave={() => !isOpen && hideCollapsedMenu()}
//             >
//               {hasSubItems ? (
//                 <button
//                   onClick={() => toggleSubMenu(item.title)}
//                   className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
//                     isSubMenuOpen
//                       ? 'bg-sky-50 text-sky-600'
//                       : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
//                   }`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <span className={isSubMenuOpen ? 'text-sky-600' : 'text-slate-500'}>
//                       {item.icon}
//                     </span>
//                     {isOpen && <span>{item.title}</span>}
//                   </div>
//                   {isOpen && (
//                     <svg
//                       className={`w-4 h-4 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}
//                       fill="none"
//                       stroke="currentColor"
//                       viewBox="0 0 24 24"
//                     >
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                     </svg>
//                   )}
//                 </button>
//               ) : (
//                 <NavLink
//                   to={item.path || '#'}
//                   className={({ isActive }) =>
//                     `flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition ${
//                       isActive
//                         ? 'bg-sky-50 text-sky-600'
//                         : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
//                     }`
//                   }
//                 >
//                   <span className="text-slate-500">{item.icon}</span>
//                   {isOpen && <span>{item.title}</span>}
//                 </NavLink>
//               )}

//               {/* Sub-Items (Accordion Dropdown) */}
//               {hasSubItems && isSubMenuOpen && isOpen && (
//                 <div className="ml-4 mt-1 pl-4 border-l border-slate-200 space-y-1">
//                   {item.subItems?.map((sub) => (
//                     <NavLink
//                       key={sub.path}
//                       to={sub.path}
//                       className={({ isActive }) =>
//                         `block py-2 px-3 text-xs rounded-lg transition font-medium ${
//                           isActive
//                             ? 'bg-sky-600 text-white font-semibold'
//                             : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50/50'
//                         }`
//                       }
//                     >
//                       {sub.title}
//                     </NavLink>
//                   ))}
//                 </div>
//               )}

//               {hasSubItems && !isOpen && hoveredMenu === item.title && (
//                 <div
//                   className="fixed left-20 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
//                   style={{ top: hoveredMenuTop }}
//                   onMouseEnter={() => showCollapsedMenu(item.title)}
//                   onMouseLeave={hideCollapsedMenu}
//                 >
//                   <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-800">
//                     {item.title}
//                   </div>
//                   <div className="mt-1 space-y-1">
//                     {item.subItems?.map((sub) => (
//                       <NavLink
//                         key={sub.path}
//                         to={sub.path}
//                         className={({ isActive }) =>
//                           `block rounded-lg px-3 py-2 text-xs font-medium transition ${
//                             isActive
//                               ? 'bg-sky-600 text-white font-semibold'
//                               : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
//                           }`
//                         }
//                       >
//                         {sub.title}
//                       </NavLink>
//                     ))}
//                   </div>
//                 </div>
//               )}
//             </div>
//           );
//         })}
//       </div>

      
//     </aside>
//   );
// };

// export default Sidebar;



import React, { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { isAdminUser, loadUserPermission, normalizePath } from '../utils/permissions';

interface SidebarProps {
  isOpen: boolean;
}

interface MenuItem {
  title: string;
  icon: React.ReactNode;
  path?: string;
  subItems?: { title: string; path: string }[];
}

const menuItems: MenuItem[] = [
  {
    title: 'Dashboard',
    path: '/dashboard',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
      </svg>
    ),
  },
  {
    title: 'User Access Manager',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
      </svg>
    ),
    subItems: [
      { title: 'Create User', path: '/users/create' },
      { title: 'Create Role', path: '/users/roles' },
      { title: 'Role & Permission', path: '/users/permissions' },
    ],
  },
  {
    title: 'Manage Master',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
    subItems: [
      { title: 'Type of Booking', path: '/master/booking-types' },
      { title: 'Currency Specification', path: '/master/currencies' },
      { title: 'Charging Bifurcation', path: '/master/sources' },
      { title: 'Card Type', path: '/master/card-types' },
      { title: 'Email Template', path: '/master/email-templates' },
      { title: 'Manage Sale Types', path: '/master/sale-types' },
      { title: 'Assign Booking Status', path: '/master/assign-booking-status' },
    ],
  },
  {
    title: 'Booking Management',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
    subItems: [
      { title: 'All Bookings', path: '/bookings/all' },
      { title: 'Pending Holds', path: '/bookings/holds' },
    ],
  },
  // ===== NEW: IP Restrictions (top-level) =====
  {
    title: 'IP Restrictions',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
      </svg>
    ),
    subItems: [
      { title: 'IP Restriction', path: '/users/ip-restriction' },
    ],
  },
  // ===== END NEW =====
  {
    title: 'Attendance System',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    subItems: [
      { title: 'Daily Logs', path: '/attendance/logs' },
      { title: 'Summary', path: '/attendance/summary' },
    ],
  },
];

const Sidebar: React.FC<SidebarProps> = ({ isOpen }) => {
  const { user } = useAuth();
  const isAdmin = isAdminUser(user);
  const [openMenus, setOpenMenus] = useState<Record<string, boolean>>({
    'User Access Manager': true, // Default open menu
  });
  const [visibleMenuItems, setVisibleMenuItems] = useState<MenuItem[]>(menuItems);
  const [hoveredMenu, setHoveredMenu] = useState<string | null>(null);
  const [hoveredMenuTop, setHoveredMenuTop] = useState(0);
  const hoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const showCollapsedMenu = (title: string, top?: number) => {
    if (hoverTimeout.current) clearTimeout(hoverTimeout.current);
    if (top !== undefined) setHoveredMenuTop(top);
    setHoveredMenu(title);
  };

  const hideCollapsedMenu = () => {
    hoverTimeout.current = setTimeout(() => setHoveredMenu(null), 150);
  };

  useEffect(() => {
    if (isAdmin) {
      setVisibleMenuItems(menuItems);
      return;
    }

    const loadPermissions = async () => {
      try {
        const permissionData = await loadUserPermission(user);

        if (!permissionData) {
          setVisibleMenuItems([]);
          return;
        }

        setVisibleMenuItems(menuItems.flatMap(item => {
          if (item.title === 'Dashboard' && !permissionData.dashboardAllowed) return [];
          if (!item.subItems) return [item];
          const subItems = item.subItems.filter(subItem => permissionData.allowedPaths.has(normalizePath(subItem.path)));
          return subItems.length > 0 ? [{ ...item, subItems }] : [];
        }));
      } catch (error) {
        console.error('Error loading menu permissions:', error);
        setVisibleMenuItems([]);
      }
    };

    loadPermissions();
  }, [isAdmin, user?.user_role]);

  const toggleSubMenu = (title: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [title]: !prev[title],
    }));
  };

  return (
    <aside
      className={`fixed left-0 top-16 bottom-0 z-40 bg-white border-r border-slate-200 transition-all duration-300 overflow-y-auto ${
        isOpen ? 'w-64' : 'w-20'
      }`}
    >
      <div className="p-3 space-y-1 font-[Arial,Helvetica,sans-serif]">
        {visibleMenuItems.map((item) => {
          const hasSubItems = Boolean(item.subItems && item.subItems.length > 0);
          const isSubMenuOpen = openMenus[item.title];

          return (
            <div
              key={item.title}
              className="relative"
              onMouseEnter={(event) => !isOpen && showCollapsedMenu(item.title, event.currentTarget.getBoundingClientRect().top)}
              onMouseLeave={() => !isOpen && hideCollapsedMenu()}
            >
              {hasSubItems ? (
                <button
                  onClick={() => toggleSubMenu(item.title)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-xs font-semibold transition ${
                    isSubMenuOpen
                      ? 'bg-sky-50 text-sky-600'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className={isSubMenuOpen ? 'text-sky-600' : 'text-slate-500'}>
                      {item.icon}
                    </span>
                    {isOpen && <span>{item.title}</span>}
                  </div>
                  {isOpen && (
                    <svg
                      className={`w-4 h-4 transition-transform ${isSubMenuOpen ? 'rotate-180' : ''}`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  )}
                </button>
              ) : (
                <NavLink
                  to={item.path || '#'}
                  className={({ isActive }) =>
                    `flex items-center gap-3 p-2.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-sky-50 text-sky-600'
                        : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                    }`
                  }
                >
                  <span className="text-slate-500">{item.icon}</span>
                  {isOpen && <span>{item.title}</span>}
                </NavLink>
              )}

              {/* Sub-Items (Accordion Dropdown) */}
              {hasSubItems && isSubMenuOpen && isOpen && (
                <div className="ml-4 mt-1 pl-4 border-l border-slate-200 space-y-1">
                  {item.subItems?.map((sub) => (
                    <NavLink
                      key={sub.path}
                      to={sub.path}
                      className={({ isActive }) =>
                        `block py-2 px-3 text-xs rounded-lg transition font-medium ${
                          isActive
                            ? 'bg-sky-600 text-white font-semibold'
                            : 'text-slate-500 hover:text-sky-600 hover:bg-sky-50/50'
                        }`
                      }
                    >
                      {sub.title}
                    </NavLink>
                  ))}
                </div>
              )}

              {hasSubItems && !isOpen && hoveredMenu === item.title && (
                <div
                  className="fixed left-20 z-50 w-64 rounded-xl border border-slate-200 bg-white p-2 shadow-xl"
                  style={{ top: hoveredMenuTop }}
                  onMouseEnter={() => showCollapsedMenu(item.title)}
                  onMouseLeave={hideCollapsedMenu}
                >
                  <div className="border-b border-slate-100 px-3 py-2 text-xs font-bold text-slate-800">
                    {item.title}
                  </div>
                  <div className="mt-1 space-y-1">
                    {item.subItems?.map((sub) => (
                      <NavLink
                        key={sub.path}
                        to={sub.path}
                        className={({ isActive }) =>
                          `block rounded-lg px-3 py-2 text-xs font-medium transition ${
                            isActive
                              ? 'bg-sky-600 text-white font-semibold'
                              : 'text-slate-500 hover:bg-sky-50 hover:text-sky-600'
                          }`
                        }
                      >
                        {sub.title}
                      </NavLink>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </aside>
  );
};

export default Sidebar;
