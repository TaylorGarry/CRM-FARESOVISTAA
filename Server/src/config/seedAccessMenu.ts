// import { Module } from '../models/Auth/Module.model';
// import { Submodule } from '../models/Auth/Submodule.model';

// const accessMenu = [
//   {
//     id: 1,
//     name: 'User Access Manager',
//     children: [
//       { sub_id: 1, sub_name: 'Create User', sub_page: '/users/create' },
//       { sub_id: 2, sub_name: 'Create Role', sub_page: '/users/roles' },
//       { sub_id: 3, sub_name: 'Role & Permission', sub_page: '/users/permissions' }
//     ]
//   },
//   {
//     id: 2,
//     name: 'Manage Master',
//     children: [
//       { sub_id: 4, sub_name: 'Airports', sub_page: '/master/airports' },
//       { sub_id: 5, sub_name: 'Airlines', sub_page: '/master/airlines' }
//     ]
//   },
//   {
//     id: 3,
//     name: 'Booking Management',
//     children: [
//       { sub_id: 6, sub_name: 'All Bookings', sub_page: '/bookings/all' },
//       { sub_id: 7, sub_name: 'Pending Holds', sub_page: '/bookings/holds' }
//     ]
//   },
//   {
//     id: 4,
//     name: 'Attendance System',
//     children: [
//       { sub_id: 8, sub_name: 'Daily Logs', sub_page: '/attendance/logs' },
//       { sub_id: 9, sub_name: 'Summary', sub_page: '/attendance/summary' }
//     ]
//   }
// ];

// export const seedAccessMenu = async (): Promise<void> => {
//   for (const menu of accessMenu) {
//     await Module.updateOne(
//       { id: menu.id },
//       { $setOnInsert: { id: menu.id, name: menu.name, status: 'Enabled' } },
//       { upsert: true }
//     );

//     for (const child of menu.children) {
//       await Submodule.updateOne(
//         { sub_id: child.sub_id },
//         {
//           $setOnInsert: {
//             sub_id: child.sub_id,
//             sub_mainid: menu.id,
//             sub_name: child.sub_name,
//             sub_page: child.sub_page,
//             sub_status: 'Enabled'
//           }
//         },
//         { upsert: true }
//       );
//     }
//   }
// };





import { Module } from '../models/Auth/Module.model';
import { Submodule } from '../models/Auth/Submodule.model';

interface MenuChild {
  sub_id: number;
  sub_name: string;
  sub_page: string;
}

interface MenuItem {
  id: number;
  name: string;
  children: MenuChild[];
}

const accessMenu: MenuItem[] = [
  {
    id: 1,
    name: 'User Access Manager',
    children: [
      { sub_id: 1, sub_name: 'Create User',       sub_page: '/users/create' },
      { sub_id: 2, sub_name: 'Create Role',       sub_page: '/users/roles' },
      { sub_id: 3, sub_name: 'Role & Permission', sub_page: '/users/permissions' },
    ],
  },
  {
    id: 2,
    name: 'Manage Master',
    children: [
      { sub_id: 10, sub_name: 'Type of Booking',        sub_page: '/master/booking-types' },
      { sub_id: 11, sub_name: 'Currency Specification', sub_page: '/master/currencies' },
      { sub_id: 12, sub_name: 'Charging Bifurcation',   sub_page: '/master/sources' },
      { sub_id: 13, sub_name: 'Card Type',              sub_page: '/master/card-types' },
      { sub_id: 14, sub_name: 'Email Template',         sub_page: '/master/email-templates' },
      { sub_id: 15, sub_name: 'Manage Sale Types',      sub_page: '/master/sale-types' },
      { sub_id: 16, sub_name: 'Assign Booking Status',  sub_page: '/master/assign-booking-status' },
    ],
  },
  {
    id: 3,
    name: 'Booking Management',
    children: [
      { sub_id: 6, sub_name: 'All Bookings',   sub_page: '/bookings/all' },
      { sub_id: 7, sub_name: 'Pending Holds',  sub_page: '/bookings/holds' },
    ],
  },
   {
    id: 5,
    name: 'IP Restrictions',
    children: [
      { sub_id: 17, sub_name: 'IP Restriction', sub_page: '/users/ip-restriction' },
    ],
  },
  {
    id: 4,
    name: 'Attendance System',
    children: [
      { sub_id: 8, sub_name: 'Daily Logs', sub_page: '/attendance/logs' },
      { sub_id: 9, sub_name: 'Summary',    sub_page: '/attendance/summary' },
    ],
  },
];

// Sub-pages that used to exist under any module but should no longer show up.
// We DISABLE them (not delete) so existing RolePermission records don't break.
const obsoleteSubPages = ['/master/airports', '/master/airlines'];

export const seedAccessMenu = async (): Promise<void> => {
  // ---- 1. Upsert modules and their sub-pages ----
  for (const menu of accessMenu) {
    await Module.updateOne(
      { id: menu.id },
      { $set: { name: menu.name, status: 'Enabled' }, $setOnInsert: { id: menu.id } },
      { upsert: true }
    );

    for (const child of menu.children) {
      await Submodule.updateOne(
        { sub_id: child.sub_id },
        {
          $set: {
            sub_mainid: menu.id,
            sub_name: child.sub_name,
            sub_page: child.sub_page,
            sub_status: 'Enabled',
          },
          $setOnInsert: { sub_id: child.sub_id },
        },
        { upsert: true }
      );
    }
  }

  // ---- 2. Disable obsolete sub-pages so they disappear from the picker ----
  await Submodule.updateMany(
    { sub_page: { $in: obsoleteSubPages } },
    { $set: { sub_status: 'Disabled' } }
  );
};