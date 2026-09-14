// import { useEffect, useState } from 'react';
// import type { FormEvent, ReactNode } from 'react';
// import { useLocation } from 'react-router-dom';
// import { apiService } from '../../services/api';
// import type { Module, Role, Submodule, User } from '../../types';

// const field = 'h-11 w-full rounded-lg border border-[#d8e0eb] bg-white px-3 text-sm text-[#172b4d] outline-none transition focus:border-[#0b72e7] focus:ring-4 focus:ring-[#0b72e7]/10';
// const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b72e7] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#075fca] disabled:cursor-wait disabled:opacity-60';
// const PAGE_SIZE = 5;
// const emptyUser: Record<string, string> = { user_name: '', user_login: '', user_password: '', confirm_password: '', user_email: '', user_role: '', gender: 'Male', dob: '', mobile: '', address: '', webmail_password: '', user_status: 'Enabled' };

// const Icon = ({ type }: { type: 'edit' | 'delete' }) => type === 'edit' ? <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z"/></svg> : <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3"/></svg>;
// const Notice = ({ message }: { message: string }) => message ? <div className="rounded-lg border border-[#0b72e7]/20 bg-[#0b72e7]/5 px-4 py-3 text-sm text-[#075fca]">{message}</div> : null;
// const Shell = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) => <main className="mx-auto max-w-[1500px] space-y-5 text-[#172b4d]"><div><p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#0b72e7]">{eyebrow}</p><h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1></div>{children}</main>;

// function Pager({ total, page, setPage }: { total: number; page: number; setPage: (page: number) => void }) { const pages = Math.max(1, Math.ceil(total / PAGE_SIZE)); return <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#6b7c93]"><span>Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, total)} of {total} records</span><div className="flex items-center gap-1"><button disabled={page === 1} onClick={() => setPage(page - 1)} className="rounded-lg border border-[#d8e0eb] px-3 py-1.5 disabled:opacity-40">Previous</button>{Array.from({ length: pages }, (_, index) => index + 1).map((number) => <button key={number} onClick={() => setPage(number)} className={`size-8 rounded-lg text-sm ${number === page ? 'bg-[#0b72e7] font-bold text-white' : 'border border-[#d8e0eb] hover:bg-[#f3f7fc]'}`}>{number}</button>)}<button disabled={page === pages} onClick={() => setPage(page + 1)} className="rounded-lg border border-[#d8e0eb] px-3 py-1.5 disabled:opacity-40">Next</button></div></div>; }

// export default function AccessManager() { const path = useLocation().pathname; if (path.endsWith('create-role')) return <RolePage />; if (path.endsWith('role-permission')) return <PermissionPage />; return <UserPage />; }

// function UserPage() {
//   const [form, setForm] = useState<Record<string, string>>(emptyUser); const [roles, setRoles] = useState<Role[]>([]); const [users, setUsers] = useState<User[]>([]); const [editing, setEditing] = useState<number | null>(null); const [page, setPage] = useState(1); const [message, setMessage] = useState(''); const [busy, setBusy] = useState(false);
//   const load = async () => { const [roleData, userData] = await Promise.all([apiService.listRoles(), apiService.listUsers()]); setRoles(roleData); setUsers(userData); };
//   useEffect(() => { load().catch((error) => setMessage(error.response?.data?.message || 'Unable to load users')); }, []);
//   const change = (key: string, value: string) => setForm((old) => ({ ...old, [key]: value }));
//   const submit = async (event: FormEvent) => { event.preventDefault(); setMessage(''); if ((!editing && !form.user_password) || (form.user_password && form.user_password !== form.confirm_password)) { setMessage('Passwords do not match'); return; } setBusy(true); try { const { confirm_password, ...data } = form; if (editing) { if (!data.user_password) delete data.user_password; await apiService.updateUser(editing, data); setMessage('User updated successfully'); } else { await apiService.createUser(data); setMessage('User created successfully'); } setForm({ ...emptyUser }); setEditing(null); await load(); } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to save user'); } finally { setBusy(false); } };
//   const edit = async (user: User) => { const data = await apiService.getUserById(user.user_id); setEditing(user.user_id); setForm({ ...emptyUser, ...Object.fromEntries(Object.entries(data).map(([key, value]) => [key, value == null ? '' : String(value)])), dob: data.dob ? data.dob.slice(0, 10) : '' }); window.scrollTo({ top: 0, behavior: 'smooth' }); };
//   const status = async (user: User) => { try { await apiService.setUserStatus(user.user_id, user.user_status === 'Enabled' ? 'Disabled' : 'Enabled'); await load(); } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to update status'); } };
//   const remove = async (user: User) => { if (!window.confirm(`Delete ${user.user_name || user.user_login}?`)) return; try { await apiService.deleteUser(user.user_id); setMessage('User soft-deleted successfully'); await load(); } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to delete user'); } };
//   const visible = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);
//   return <Shell eyebrow="User Access Manager / Users" title={editing ? 'Edit User' : 'Create User'}><Notice message={message} /><form onSubmit={submit} className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_20px_rgba(23,43,77,0.05)] md:grid-cols-2 lg:grid-cols-3">{[['user_name','Name'],['user_email','User Email'],['user_login','User Name'],['mobile','Mobile'],['address','Address'],['webmail_password','Webmail login Password'],['user_password','Password'],['confirm_password','Confirm Password'],['dob','DOB']].map(([key, label]) => <label key={key} className="flex flex-col gap-2 text-sm font-semibold">{label}<input required={!['address','webmail_password','dob','user_password','confirm_password'].includes(key) && !(editing && ['user_password','confirm_password'].includes(key))} type={key.includes('password') ? 'password' : key === 'dob' ? 'date' : 'text'} className={field} value={form[key]} onChange={(event) => change(key, event.target.value)} /></label>)}<label className="flex flex-col gap-2 text-sm font-semibold">Role Name<select required className={field} value={form.user_role} onChange={(event) => change('user_role', event.target.value)}><option value="">Select active role</option>{roles.filter((role) => role.status === 'Enabled').map((role) => <option key={role.role_id} value={role.role_name}>{role.role_name}</option>)}</select></label><label className="flex flex-col gap-2 text-sm font-semibold">Gender<select className={field} value={form.gender} onChange={(event) => change('gender', event.target.value)}><option>Male</option><option>Female</option></select></label><label className="flex flex-col gap-2 text-sm font-semibold">Status<select className={field} value={form.user_status} onChange={(event) => change('user_status', event.target.value)}><option>Enabled</option><option>Disabled</option></select></label><div className="flex gap-3 md:col-span-2 lg:col-span-3"><button className={primary} disabled={busy}>{busy ? 'Saving...' : editing ? 'Update User' : 'Create User'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ ...emptyUser }); }} className="rounded-lg border border-[#d8e0eb] px-4 py-2.5 text-sm font-semibold text-[#506580]">Cancel</button>}</div></form><UserTable users={visible} total={users.length} page={page} setPage={setPage} onEdit={edit} onDelete={remove} onStatus={status} /></Shell>;
// }

// function UserTable({ users, total, page, setPage, onEdit, onDelete, onStatus }: { users: User[]; total: number; page: number; setPage: (page: number) => void; onEdit: (user: User) => void; onDelete: (user: User) => void; onStatus: (user: User) => void }) { return <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_20px_rgba(23,43,77,0.05)]"><div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4"><h2 className="font-bold">User List <span className="ml-2 text-sm font-normal text-[#6b7c93]">{total}</span></h2></div><div className="overflow-x-auto"><table className="w-full min-w-[1100px] text-left text-sm"><thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wider text-[#6b7c93]"><tr>{['Checkbox','Name','Role','Gender','Mobile No','Email','User Login','Add Date','Add By','Status','Action'].map((title) => <th className="px-4 py-3" key={title}>{title}</th>)}</tr></thead><tbody>{users.map((user) => <tr className="border-t border-[#eef2f7]" key={user.user_id}><td className="px-4 py-4"><input type="checkbox" className="size-4 accent-[#0b72e7]" /></td><td className="px-4 py-4 font-semibold">{user.user_name || '-'}</td><td className="px-4 py-4">{user.user_role}</td><td className="px-4 py-4">{user.gender || '-'}</td><td className="px-4 py-4">{user.mobile || '-'}</td><td className="px-4 py-4">{user.user_email}</td><td className="px-4 py-4">{user.user_login}</td><td className="px-4 py-4">{user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}</td><td className="px-4 py-4">{user.add_by || '-'}</td><td className="px-4 py-4"><button onClick={() => onStatus(user)} className={`rounded-full px-2.5 py-1 text-xs font-semibold ${user.user_status === 'Enabled' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{user.user_status || 'Unknown'}</button></td><td className="px-4 py-4"><button aria-label="Edit user" onClick={() => onEdit(user)} className="mr-2 rounded-lg border border-[#d8e0eb] p-2 text-[#0b72e7] hover:bg-[#eff6ff]"><Icon type="edit" /></button><button aria-label="Delete user" onClick={() => onDelete(user)} className="rounded-lg border border-[#fecaca] p-2 text-red-500 hover:bg-red-50"><Icon type="delete" /></button></td></tr>)}</tbody></table></div><Pager total={total} page={page} setPage={setPage} /></section>; }

// function RolePage() { const [roles, setRoles] = useState<Role[]>([]); const [form, setForm] = useState({ role_name: '', department_role: '', status: 'Enabled' }); const [editing, setEditing] = useState<number | null>(null); const [page, setPage] = useState(1); const [message, setMessage] = useState(''); const load = async () => setRoles(await apiService.listRoles()); useEffect(() => { load().catch(() => setMessage('Unable to load roles')); }, []); const submit = async (event: FormEvent) => { event.preventDefault(); try { if (editing) await apiService.updateRole(editing, form); else await apiService.createRole(form); setMessage(editing ? 'Role updated successfully' : 'Role created successfully'); setEditing(null); setForm({ role_name: '', department_role: '', status: 'Enabled' }); await load(); } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to save role'); } }; const remove = async (role: Role) => { if (!window.confirm(`Delete ${role.role_name}?`)) return; await apiService.deleteRole(role.role_id); setMessage('Role soft-deleted successfully'); await load(); }; const visible = roles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE); return <Shell eyebrow="User Access Manager / Roles" title={editing ? 'Edit Role' : 'Create Role'}><Notice message={message} /><form onSubmit={submit} className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_20px_rgba(23,43,77,0.05)] md:grid-cols-3"><label className="flex flex-col gap-2 text-sm font-semibold">Role Name<input required className={field} value={form.role_name} onChange={(event) => setForm({ ...form, role_name: event.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-semibold">Department Role<input required className={field} value={form.department_role} onChange={(event) => setForm({ ...form, department_role: event.target.value })} /></label><label className="flex flex-col gap-2 text-sm font-semibold">Status<select className={field} value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}><option>Enabled</option><option>Disabled</option></select></label><div className="flex gap-3"><button className={primary}>{editing ? 'Update Role' : 'Create Role'}</button>{editing && <button type="button" onClick={() => { setEditing(null); setForm({ role_name: '', department_role: '', status: 'Enabled' }); }} className="rounded-lg border border-[#d8e0eb] px-4 py-2 text-sm">Cancel</button>}</div></form><section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_20px_rgba(23,43,77,0.05)]"><h2 className="border-b border-[#e2e8f0] px-5 py-4 font-bold">Role List <span className="ml-2 text-sm font-normal text-[#6b7c93]">{roles.length}</span></h2><div className="overflow-x-auto"><table className="w-full min-w-[800px] text-left text-sm"><thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wider text-[#6b7c93]"><tr>{['Role Name','Department Role','Add Date','Add By','Status','Action'].map((title) => <th className="px-5 py-3" key={title}>{title}</th>)}</tr></thead><tbody>{visible.map((role) => <tr className="border-t border-[#eef2f7]" key={role.role_id}><td className="px-5 py-4 font-semibold">{role.role_name}</td><td className="px-5 py-4">{role.department_role}</td><td className="px-5 py-4">{role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}</td><td className="px-5 py-4">{role.add_by || '-'}</td><td className="px-5 py-4"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${role.status === 'Enabled' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-600'}`}>{role.status}</span></td><td className="px-5 py-4"><button aria-label="Edit role" onClick={() => { setEditing(role.role_id); setForm({ role_name: role.role_name, department_role: role.department_role, status: role.status }); }} className="mr-2 rounded-lg border border-[#d8e0eb] p-2 text-[#0b72e7]"><Icon type="edit" /></button><button aria-label="Delete role" onClick={() => remove(role)} className="rounded-lg border border-[#fecaca] p-2 text-red-500"><Icon type="delete" /></button></td></tr>)}</tbody></table></div><Pager total={roles.length} page={page} setPage={setPage} /></section></Shell>; }

// function PermissionPage() { const [roles, setRoles] = useState<Role[]>([]); const [modules, setModules] = useState<Module[]>([]); const [subs, setSubs] = useState<Submodule[]>([]); const [role, setRole] = useState(''); const [selected, setSelected] = useState<string[]>([]); const [dashboardPer, setDashboard] = useState(false); const [mcoReport, setMco] = useState(false); const [message, setMessage] = useState(''); useEffect(() => { Promise.all([apiService.listRoles(), apiService.listModules()]).then(([roleData, moduleData]) => { setRoles(roleData); setModules(moduleData); }).catch(() => setMessage('Unable to load permission data')); }, []); const save = async (event: FormEvent) => { event.preventDefault(); try { await apiService.savePermission({ roleper_roleid: role, roleper_mainmenu: selected, roleper_submenu: selected, dashboardPer, mcoReport }); setMessage('Permissions saved successfully'); } catch (error: any) { setMessage(error.response?.data?.message || 'Unable to save permissions'); } }; return <Shell eyebrow="User Access Manager / Authorization" title="Role & Permission"><Notice message={message} /><form onSubmit={save} className="space-y-5 rounded-xl border border-[#e2e8f0] bg-white p-6"><label className="flex max-w-md flex-col gap-2 text-sm font-semibold">Role<select required className={field} value={role} onChange={(event) => setRole(event.target.value)}><option value="">Select role</option>{roles.filter((item) => item.status === 'Enabled').map((item) => <option key={item.role_id} value={String(item.role_id)}>{item.role_name}</option>)}</select></label><label className="flex max-w-md flex-col gap-2 text-sm font-semibold">Main module<select className={field} onChange={async (event) => { setSelected([]); setSubs(await apiService.listSubmodules(Number(event.target.value))); }}><option value="">Select active module</option>{modules.map((module) => <option key={module.id} value={module.id}>{module.name}</option>)}</select></label><div className="grid gap-2 md:grid-cols-2">{subs.map((sub) => <label className="flex items-center gap-2 text-sm" key={sub.sub_id}><input type="checkbox" checked={selected.includes(String(sub.sub_id))} onChange={(event) => setSelected(event.target.checked ? [...selected, String(sub.sub_id)] : selected.filter((item) => item !== String(sub.sub_id)))} className="accent-[#0b72e7]" />{sub.sub_name}</label>)}</div><div className="flex flex-wrap gap-5 text-sm"><label><input type="checkbox" checked={dashboardPer} onChange={(event) => setDashboard(event.target.checked)} className="mr-2 accent-[#0b72e7]" />Dashboard Permission</label><label><input type="checkbox" checked={mcoReport} onChange={(event) => setMco(event.target.checked)} className="mr-2 accent-[#0b72e7]" />MCO Report</label></div><button className={primary}>Save Permissions</button></form></Shell>; }



import { useEffect, useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
// import { apiService } from '../../services/api';
// import type { Module, Role, Submodule, User } from '../../types';

// Mock data for testing if API is not available
const mockRoles = [
  { role_id: 1, role_name: 'Admin', department_role: 'Management', status: 'Enabled', created_at: '2024-01-01', add_by: 'Admin' },
  { role_id: 2, role_name: 'Manager', department_role: 'Operations', status: 'Enabled', created_at: '2024-01-02', add_by: 'Admin' },
  { role_id: 3, role_name: 'User', department_role: 'Staff', status: 'Enabled', created_at: '2024-01-03', add_by: 'Admin' },
];

const mockUsers = [
  { user_id: 1, user_name: 'John Doe', user_role: 'Admin', gender: 'Male', mobile: '9876543210', user_email: 'john@example.com', user_login: 'john', user_password: '***', user_status: 'Enabled', created_at: '2024-01-01', add_by: 'Admin' },
  { user_id: 2, user_name: 'Jane Smith', user_role: 'Manager', gender: 'Female', mobile: '9876543211', user_email: 'jane@example.com', user_login: 'jane', user_password: '***', user_status: 'Enabled', created_at: '2024-01-02', add_by: 'Admin' },
];

const mockModules = [
  { id: 1, name: 'Dashboard', status: 'Enabled' },
  { id: 2, name: 'User Access Manager', status: 'Enabled' },
  { id: 3, name: 'Manage Master', status: 'Enabled' },
];

const mockSubmodules = [
  { sub_id: 1, sub_name: 'Create User', sub_mainid: 2, sub_status: 'Enabled' },
  { sub_id: 2, sub_name: 'Create Role', sub_mainid: 2, sub_status: 'Enabled' },
  { sub_id: 3, sub_name: 'Role & Permission', sub_mainid: 2, sub_status: 'Enabled' },
];

const field = 'h-11 w-full rounded-lg border border-[#d8e0eb] bg-white px-3 text-sm text-[#172b4d] outline-none transition focus:border-[#0b72e7] focus:ring-4 focus:ring-[#0b72e7]/10';
const primary = 'inline-flex items-center justify-center gap-2 rounded-lg bg-[#0b72e7] px-4 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-[#075fca] disabled:cursor-wait disabled:opacity-60';
const PAGE_SIZE = 5;

const emptyUser: Record<string, string> = {
  user_name: '',
  user_login: '',
  user_password: '',
  confirm_password: '',
  user_email: '',
  user_role: '',
  gender: 'Male',
  dob: '',
  mobile: '',
  address: '',
  webmail_password: '',
  user_status: 'Enabled'
};

const Icon = ({ type }: { type: 'edit' | 'delete' }) =>
  type === 'edit' ? (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L8 18l-4 1 1-4Z" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 7h16M10 11v6m4-6v6M6 7l1 13h10l1-13M9 7V4h6v3" />
    </svg>
  );

const Notice = ({ message }: { message: string }) =>
  message ? (
    <div className="rounded-lg border border-[#0b72e7]/20 bg-[#0b72e7]/5 px-4 py-3 text-sm text-[#075fca]">
      {message}
    </div>
  ) : null;

const Shell = ({ title, eyebrow, children }: { title: string; eyebrow: string; children: ReactNode }) => (
  <main className="mx-auto max-w-[1500px] space-y-5 text-[#172b4d]">
    <div>
      <p className="text-[11px] font-bold uppercase tracking-[.2em] text-[#0b72e7]">{eyebrow}</p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight">{title}</h1>
    </div>
    {children}
  </main>
);

const Pager = ({ total, page, setPage }: { total: number; page: number; setPage: (page: number) => void }) => {
  const pages = Math.max(1, Math.ceil(total / PAGE_SIZE));
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#e2e8f0] px-5 py-4 text-sm text-[#6b7c93]">
      <span>
        Showing {total ? (page - 1) * PAGE_SIZE + 1 : 0} to {Math.min(page * PAGE_SIZE, total)} of {total} records
      </span>
      <div className="flex items-center gap-1">
        <button
          disabled={page === 1}
          onClick={() => setPage(page - 1)}
          className="rounded-lg border border-[#d8e0eb] px-3 py-1.5 disabled:opacity-40"
        >
          Previous
        </button>
        {Array.from({ length: pages }, (_, index) => index + 1).map((number) => (
          <button
            key={number}
            onClick={() => setPage(number)}
            className={`size-8 rounded-lg text-sm ${
              number === page
                ? 'bg-[#0b72e7] font-bold text-white'
                : 'border border-[#d8e0eb] hover:bg-[#f3f7fc]'
            }`}
          >
            {number}
          </button>
        ))}
        <button
          disabled={page === pages}
          onClick={() => setPage(page + 1)}
          className="rounded-lg border border-[#d8e0eb] px-3 py-1.5 disabled:opacity-40"
        >
          Next
        </button>
      </div>
    </div>
  );
};

// Main component that routes based on URL path
export default function AccessManager() {
  const location = useLocation();
  const path = location.pathname;
  
  console.log('AccessManager - Current path:', path);

  // Check which page to render
  if (path.includes('create-role')) {
    console.log('Rendering RolePage');
    return <RolePage />;
  }
  if (path.includes('role-permission')) {
    console.log('Rendering PermissionPage');
    return <PermissionPage />;
  }
  // Default to UserPage for 'create-user' or any other path
  console.log('Rendering UserPage');
  return <UserPage />;
}

// ============= USER PAGE =============
function UserPage() {
  const [form, setForm] = useState<Record<string, string>>(emptyUser);
  const [roles, setRoles] = useState<any[]>([]);
  const [users, setUsers] = useState<any[]>([]);
  const [editing, setEditing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    // Load mock data for testing
    setRoles(mockRoles);
    setUsers(mockUsers);
  }, []);

  const change = (key: string, value: string) =>
    setForm((old) => ({ ...old, [key]: value }));

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('');

    if ((!editing && !form.user_password) || (form.user_password && form.user_password !== form.confirm_password)) {
      setMessage('Passwords do not match');
      return;
    }

    setBusy(true);
    try {
      // Simulate API call
      const newUser = {
        user_id: users.length + 1,
        ...form,
        created_at: new Date().toISOString(),
        add_by: 'Current User'
      };
      setUsers([...users, newUser]);
      setMessage(editing ? 'User updated successfully' : 'User created successfully');
      setForm({ ...emptyUser });
      setEditing(null);
    } catch (error: any) {
      setMessage('Unable to save user');
    } finally {
      setBusy(false);
    }
  };

  const edit = (user: any) => {
    setEditing(user.user_id);
    setForm({
      ...emptyUser,
      user_name: user.user_name,
      user_email: user.user_email,
      user_login: user.user_login,
      mobile: user.mobile,
      user_role: user.user_role,
      gender: user.gender,
      user_status: user.user_status,
      dob: user.dob || '',
      address: user.address || '',
      webmail_password: '',
      user_password: '',
      confirm_password: '',
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const status = async (user: any) => {
    const updatedUsers = users.map(u => 
      u.user_id === user.user_id 
        ? { ...u, user_status: u.user_status === 'Enabled' ? 'Disabled' : 'Enabled' }
        : u
    );
    setUsers(updatedUsers);
  };

  const remove = (user: any) => {
    if (!window.confirm(`Delete ${user.user_name || user.user_login}?`)) return;
    setUsers(users.filter(u => u.user_id !== user.user_id));
    setMessage('User deleted successfully');
  };

  const visible = users.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Shell eyebrow="User Access Manager / Users" title={editing ? 'Edit User' : 'Create User'}>
      <Notice message={message} />

      <form onSubmit={submit} className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_20px_rgba(23,43,77,0.05)] md:grid-cols-2 lg:grid-cols-3">
        {[
          ['user_name', 'Name'],
          ['user_email', 'User Email'],
          ['user_login', 'User Name'],
          ['mobile', 'Mobile'],
          ['address', 'Address'],
          ['webmail_password', 'Webmail login Password'],
          ['user_password', 'Password'],
          ['confirm_password', 'Confirm Password'],
          ['dob', 'DOB']
        ].map(([key, label]) => (
          <label key={key} className="flex flex-col gap-2 text-sm font-semibold">
            {label}
            <input
              required={
                !['address', 'webmail_password', 'dob', 'user_password', 'confirm_password'].includes(key) &&
                !(editing && ['user_password', 'confirm_password'].includes(key))
              }
              type={key.includes('password') ? 'password' : key === 'dob' ? 'date' : 'text'}
              className={field}
              value={form[key] || ''}
              onChange={(event) => change(key, event.target.value)}
            />
          </label>
        ))}

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Role Name
          <select
            required
            className={field}
            value={form.user_role}
            onChange={(event) => change('user_role', event.target.value)}
          >
            <option value="">Select active role</option>
            {roles
              .filter((role) => role.status === 'Enabled')
              .map((role) => (
                <option key={role.role_id} value={role.role_name}>
                  {role.role_name}
                </option>
              ))}
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Gender
          <select
            className={field}
            value={form.gender}
            onChange={(event) => change('gender', event.target.value)}
          >
            <option>Male</option>
            <option>Female</option>
          </select>
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Status
          <select
            className={field}
            value={form.user_status}
            onChange={(event) => change('user_status', event.target.value)}
          >
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </label>

        <div className="flex gap-3 md:col-span-2 lg:col-span-3">
          <button className={primary} disabled={busy}>
            {busy ? 'Saving...' : editing ? 'Update User' : 'Create User'}
          </button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ ...emptyUser });
              }}
              className="rounded-lg border border-[#d8e0eb] px-4 py-2.5 text-sm font-semibold text-[#506580]"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <UserTable
        users={visible}
        total={users.length}
        page={page}
        setPage={setPage}
        onEdit={edit}
        onDelete={remove}
        onStatus={status}
      />
    </Shell>
  );
}

// ============= USER TABLE =============
function UserTable({
  users,
  total,
  page,
  setPage,
  onEdit,
  onDelete,
  onStatus
}: {
  users: any[];
  total: number;
  page: number;
  setPage: (page: number) => void;
  onEdit: (user: any) => void;
  onDelete: (user: any) => void;
  onStatus: (user: any) => void;
}) {
  return (
    <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_20px_rgba(23,43,77,0.05)]">
      <div className="flex items-center justify-between border-b border-[#e2e8f0] px-5 py-4">
        <h2 className="font-bold">
          User List <span className="ml-2 text-sm font-normal text-[#6b7c93]">{total}</span>
        </h2>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[1100px] text-left text-sm">
          <thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wider text-[#6b7c93]">
            <tr>
              {[
                'Checkbox',
                'Name',
                'Role',
                'Gender',
                'Mobile No',
                'Email',
                'User Login',
                'Add Date',
                'Add By',
                'Status',
                'Action'
              ].map((title) => (
                <th className="px-4 py-3" key={title}>
                  {title}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {users.length === 0 ? (
              <tr>
                <td colSpan={11} className="px-4 py-8 text-center text-[#6b7c93]">
                  No users found. Click "Create User" to add one.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr className="border-t border-[#eef2f7]" key={user.user_id}>
                  <td className="px-4 py-4">
                    <input type="checkbox" className="size-4 accent-[#0b72e7]" />
                  </td>
                  <td className="px-4 py-4 font-semibold">{user.user_name || '-'}</td>
                  <td className="px-4 py-4">{user.user_role}</td>
                  <td className="px-4 py-4">{user.gender || '-'}</td>
                  <td className="px-4 py-4">{user.mobile || '-'}</td>
                  <td className="px-4 py-4">{user.user_email}</td>
                  <td className="px-4 py-4">{user.user_login}</td>
                  <td className="px-4 py-4">
                    {user.created_at ? new Date(user.created_at).toLocaleDateString() : '-'}
                  </td>
                  <td className="px-4 py-4">{user.add_by || '-'}</td>
                  <td className="px-4 py-4">
                    <button
                      onClick={() => onStatus(user)}
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.user_status === 'Enabled'
                          ? 'bg-emerald-50 text-emerald-700'
                          : 'bg-red-50 text-red-600'
                      }`}
                    >
                      {user.user_status || 'Unknown'}
                    </button>
                  </td>
                  <td className="px-4 py-4">
                    <button
                      aria-label="Edit user"
                      onClick={() => onEdit(user)}
                      className="mr-2 rounded-lg border border-[#d8e0eb] p-2 text-[#0b72e7] hover:bg-[#eff6ff]"
                    >
                      <Icon type="edit" />
                    </button>
                    <button
                      aria-label="Delete user"
                      onClick={() => onDelete(user)}
                      className="rounded-lg border border-[#fecaca] p-2 text-red-500 hover:bg-red-50"
                    >
                      <Icon type="delete" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <Pager total={total} page={page} setPage={setPage} />
    </section>
  );
}

// ============= ROLE PAGE =============
function RolePage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [form, setForm] = useState({ role_name: '', department_role: '', status: 'Enabled' });
  const [editing, setEditing] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRoles(mockRoles);
  }, []);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    try {
      if (editing) {
        setRoles(roles.map(r => r.role_id === editing ? { ...r, ...form } : r));
        setMessage('Role updated successfully');
      } else {
        const newRole = {
          role_id: roles.length + 1,
          ...form,
          created_at: new Date().toISOString(),
          add_by: 'Current User'
        };
        setRoles([...roles, newRole]);
        setMessage('Role created successfully');
      }
      setEditing(null);
      setForm({ role_name: '', department_role: '', status: 'Enabled' });
    } catch (error: any) {
      setMessage('Unable to save role');
    }
  };

  const remove = (role: any) => {
    if (!window.confirm(`Delete ${role.role_name}?`)) return;
    setRoles(roles.filter(r => r.role_id !== role.role_id));
    setMessage('Role deleted successfully');
  };

  const visible = roles.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <Shell eyebrow="User Access Manager / Roles" title={editing ? 'Edit Role' : 'Create Role'}>
      <Notice message={message} />

      <form
        onSubmit={submit}
        className="grid gap-4 rounded-xl border border-[#e2e8f0] bg-white p-6 shadow-[0_4px_20px_rgba(23,43,77,0.05)] md:grid-cols-3"
      >
        <label className="flex flex-col gap-2 text-sm font-semibold">
          Role Name
          <input
            required
            className={field}
            value={form.role_name}
            onChange={(event) => setForm({ ...form, role_name: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Department Role
          <input
            required
            className={field}
            value={form.department_role}
            onChange={(event) => setForm({ ...form, department_role: event.target.value })}
          />
        </label>

        <label className="flex flex-col gap-2 text-sm font-semibold">
          Status
          <select
            className={field}
            value={form.status}
            onChange={(event) => setForm({ ...form, status: event.target.value })}
          >
            <option>Enabled</option>
            <option>Disabled</option>
          </select>
        </label>

        <div className="flex gap-3">
          <button className={primary}>{editing ? 'Update Role' : 'Create Role'}</button>
          {editing && (
            <button
              type="button"
              onClick={() => {
                setEditing(null);
                setForm({ role_name: '', department_role: '', status: 'Enabled' });
              }}
              className="rounded-lg border border-[#d8e0eb] px-4 py-2 text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <section className="overflow-hidden rounded-xl border border-[#e2e8f0] bg-white shadow-[0_4px_20px_rgba(23,43,77,0.05)]">
        <h2 className="border-b border-[#e2e8f0] px-5 py-4 font-bold">
          Role List <span className="ml-2 text-sm font-normal text-[#6b7c93]">{roles.length}</span>
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px] text-left text-sm">
            <thead className="bg-[#f8fafc] text-[10px] uppercase tracking-wider text-[#6b7c93]">
              <tr>
                {['Role Name', 'Department Role', 'Add Date', 'Add By', 'Status', 'Action'].map((title) => (
                  <th className="px-5 py-3" key={title}>
                    {title}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {visible.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[#6b7c93]">
                    No roles found. Click "Create Role" to add one.
                  </td>
                </tr>
              ) : (
                visible.map((role) => (
                  <tr className="border-t border-[#eef2f7]" key={role.role_id}>
                    <td className="px-5 py-4 font-semibold">{role.role_name}</td>
                    <td className="px-5 py-4">{role.department_role}</td>
                    <td className="px-5 py-4">
                      {role.created_at ? new Date(role.created_at).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-5 py-4">{role.add_by || '-'}</td>
                    <td className="px-5 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          role.status === 'Enabled'
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-red-50 text-red-600'
                        }`}
                      >
                        {role.status}
                      </span>
                    </td>
                    <td className="px-5 py-4">
                      <button
                        aria-label="Edit role"
                        onClick={() => {
                          setEditing(role.role_id);
                          setForm({
                            role_name: role.role_name,
                            department_role: role.department_role,
                            status: role.status
                          });
                        }}
                        className="mr-2 rounded-lg border border-[#d8e0eb] p-2 text-[#0b72e7]"
                      >
                        <Icon type="edit" />
                      </button>
                      <button
                        aria-label="Delete role"
                        onClick={() => remove(role)}
                        className="rounded-lg border border-[#fecaca] p-2 text-red-500"
                      >
                        <Icon type="delete" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        <Pager total={roles.length} page={page} setPage={setPage} />
      </section>
    </Shell>
  );
}

// ============= PERMISSION PAGE =============
function PermissionPage() {
  const [roles, setRoles] = useState<any[]>([]);
  const [modules] = useState<any[]>(mockModules);
  const [subs, setSubs] = useState<any[]>([]);
  const [role, setRole] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [dashboardPer, setDashboard] = useState(false);
  const [mcoReport, setMco] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setRoles(mockRoles);
  }, []);

  const loadSubmodules = (moduleId: number) => {
    setSubs(mockSubmodules.filter(s => s.sub_mainid === moduleId));
  };

  const save = async (event: FormEvent) => {
    event.preventDefault();
    setMessage('Permissions saved successfully');
  };

  return (
    <Shell eyebrow="User Access Manager / Authorization" title="Role & Permission">
      <Notice message={message} />

      <form onSubmit={save} className="space-y-5 rounded-xl border border-[#e2e8f0] bg-white p-6">
        <label className="flex max-w-md flex-col gap-2 text-sm font-semibold">
          Role
          <select
            required
            className={field}
            value={role}
            onChange={(event) => setRole(event.target.value)}
          >
            <option value="">Select role</option>
            {roles
              .filter((item) => item.status === 'Enabled')
              .map((item) => (
                <option key={item.role_id} value={String(item.role_id)}>
                  {item.role_name}
                </option>
              ))}
          </select>
        </label>

        <label className="flex max-w-md flex-col gap-2 text-sm font-semibold">
          Main module
          <select
            className={field}
            onChange={async (event) => {
              setSelected([]);
              loadSubmodules(Number(event.target.value));
            }}
          >
            <option value="">Select active module</option>
            {modules.map((module) => (
              <option key={module.id} value={module.id}>
                {module.name}
              </option>
            ))}
          </select>
        </label>

        <div className="grid gap-2 md:grid-cols-2">
          {subs.length === 0 ? (
            <p className="text-sm text-[#6b7c93]">Select a module to see sub-modules</p>
          ) : (
            subs.map((sub) => (
              <label className="flex items-center gap-2 text-sm" key={sub.sub_id}>
                <input
                  type="checkbox"
                  checked={selected.includes(String(sub.sub_id))}
                  onChange={(event) =>
                    setSelected(
                      event.target.checked
                        ? [...selected, String(sub.sub_id)]
                        : selected.filter((item) => item !== String(sub.sub_id))
                    )
                  }
                  className="accent-[#0b72e7]"
                />
                {sub.sub_name}
              </label>
            ))
          )}
        </div>

        <div className="flex flex-wrap gap-5 text-sm">
          <label>
            <input
              type="checkbox"
              checked={dashboardPer}
              onChange={(event) => setDashboard(event.target.checked)}
              className="mr-2 accent-[#0b72e7]"
            />
            Dashboard Permission
          </label>
          <label>
            <input
              type="checkbox"
              checked={mcoReport}
              onChange={(event) => setMco(event.target.checked)}
              className="mr-2 accent-[#0b72e7]"
            />
            MCO Report
          </label>
        </div>

        <button className={primary}>Save Permissions</button>
      </form>
    </Shell>
  );
}