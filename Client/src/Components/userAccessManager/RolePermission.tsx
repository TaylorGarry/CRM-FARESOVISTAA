import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ActionModal from './ActionModal';
import { apiService } from '../../services/api';

interface RolePermission {
  roleper_id?: string;
  roleper_roleid: string;
  roleper_mainmenu: string[] | string;
  roleper_submenu: string[] | string;
  cardVerPer: number;
  PayVerPer: number;
  ticketVerPer: number;
  dashboardPer: number;
  mcoReport: number;
  roleper_status: string;
  additional_permissions?: string[];
}

interface Role {
  role_id: string;
  role_name: string;
}

interface Module {
  id: string;
  name: string;
  status: string;
}

interface SubModule {
  sub_id: string;
  sub_name: string;
  sub_mainid: string;
  sub_page: string;
  sub_status: string;
}

const API_URL = 'http://localhost:5000/api/role-permissions';

const RolePermission: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<RolePermission>({
    roleper_roleid: '',
    roleper_mainmenu: [],
    roleper_submenu: [],
    cardVerPer: 0,
    PayVerPer: 0,
    ticketVerPer: 0,
    dashboardPer: 0,
    mcoReport: 0,
    roleper_status: 'Enabled',
    additional_permissions: []
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [modules, setModules] = useState<Module[]>([]);
  const [subModules, setSubModules] = useState<SubModule[]>([]);
  const [rolePermissions, setRolePermissions] = useState<RolePermission[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [expandedModules, setExpandedModules] = useState<Record<string, boolean>>({});
  const [modal, setModal] = useState<{ title: string; message: string; success?: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRoles();
    fetchModules();
    fetchRolePermissions();
  }, []);

  const fetchRoles = async () => {
    try {
      const roleData = await apiService.listRoles();
      setRoles(roleData.map(role => ({
        role_id: String(role.role_id),
        role_name: role.role_name
      })));
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchModules = async () => {
    try {
      const moduleData = await apiService.listModules();
      setModules(moduleData.map(module => ({
        id: String(module.id),
        name: module.name,
        status: module.status
      })));
      const submoduleData = await apiService.listSubmodules();
      setSubModules(submoduleData.map(submodule => ({
        sub_id: String(submodule.sub_id),
        sub_name: submodule.sub_name,
        sub_mainid: String(submodule.sub_mainid),
        sub_page: submodule.sub_page,
        sub_status: submodule.sub_status
      })));
    } catch (error) {
      console.error('Error fetching modules:', error);
    }
  };

  const fetchRolePermissions = async () => {
    try {
      setLoading(true);
      const permissionData = await apiService.listPermissions();
      setRolePermissions(permissionData.map((permission: any) => ({
        ...permission,
        roleper_id: String(permission.roleper_id),
        roleper_roleid: String(permission.roleper_roleid),
        roleper_mainmenu: permission.roleper_mainmenu || [],
        roleper_submenu: permission.roleper_submenu || [],
        roleper_status: permission.roleper_status || 'Enabled',
        cardVerPer: permission.cardVerPer || 0,
        PayVerPer: permission.PayVerPer || 0,
        ticketVerPer: permission.ticketVerPer || 0,
        dashboardPer: permission.dashboardPer || 0,
        mcoReport: permission.mcoReport || 0
      })));
    } catch (error) {
      console.error('Error fetching role permissions:', error);
      setMessage({ text: 'Error fetching role permissions!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));

    if (name === 'roleper_roleid') {
      const savedPermission = rolePermissions.find(permission => permission.roleper_roleid === value);
      if (savedPermission) {
        setFormData({
          ...savedPermission,
          roleper_mainmenu: Array.isArray(savedPermission.roleper_mainmenu)
            ? savedPermission.roleper_mainmenu
            : savedPermission.roleper_mainmenu.split(',').filter(Boolean),
          roleper_submenu: Array.isArray(savedPermission.roleper_submenu)
            ? savedPermission.roleper_submenu
            : savedPermission.roleper_submenu.split(',').filter(Boolean)
        });
      } else {
        setFormData(prev => ({
          ...prev,
          roleper_mainmenu: [],
          roleper_submenu: [],
          dashboardPer: 0,
          mcoReport: 0,
          roleper_status: 'Enabled'
        }));
      }
    }
  };

  const getSubModules = (moduleId: string) => {
    return subModules.filter(sub => sub.sub_mainid === moduleId);
  };

  const selectedMainMenus = Array.isArray(formData.roleper_mainmenu)
    ? formData.roleper_mainmenu
    : formData.roleper_mainmenu.split(',').filter(Boolean);
  const selectedSubMenus = Array.isArray(formData.roleper_submenu)
    ? formData.roleper_submenu
    : formData.roleper_submenu.split(',').filter(Boolean);

  const toggleModule = (moduleId: string) => {
    setExpandedModules(prev => ({ ...prev, [moduleId]: !prev[moduleId] }));
  };

  const toggleModulePermission = (moduleId: string, checked: boolean) => {
    const childIds = getSubModules(moduleId).map(sub => sub.sub_id);
    setFormData(prev => ({
      ...prev,
      roleper_mainmenu: checked
        ? Array.from(new Set([...selectedMainMenus, moduleId]))
        : selectedMainMenus.filter(id => id !== moduleId),
      roleper_submenu: checked
        ? Array.from(new Set([...selectedSubMenus, ...childIds]))
        : selectedSubMenus.filter(id => !childIds.includes(id))
    }));
  };

  const toggleSubmodulePermission = (submodule: SubModule, checked: boolean) => {
    const nextSubMenus = checked
      ? Array.from(new Set([...selectedSubMenus, submodule.sub_id]))
      : selectedSubMenus.filter(id => id !== submodule.sub_id);
    const moduleChildren = getSubModules(submodule.sub_mainid).map(sub => sub.sub_id);
    const hasModulePermission = moduleChildren.length > 0 && moduleChildren.every(id => nextSubMenus.includes(id));

    setFormData(prev => ({
      ...prev,
      roleper_mainmenu: hasModulePermission
        ? Array.from(new Set([...selectedMainMenus, submodule.sub_mainid]))
        : selectedMainMenus.filter(id => id !== submodule.sub_mainid),
      roleper_submenu: nextSubMenus
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      if (isEdit) {
        await apiService.savePermission(formData as unknown as Record<string, unknown>);
        setMessage({ text: 'Role permission updated successfully!', type: 'success' });
        setModal({ title: 'Permission Updated', message: 'The role permission was updated successfully.', success: true });
      } else {
        await apiService.savePermission(formData as unknown as Record<string, unknown>);
        setMessage({ text: 'Role permission created successfully!', type: 'success' });
      }
      fetchRolePermissions();
      resetForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error saving role permission!', 
        type: 'error' 
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (rolePerm: RolePermission) => {
    setFormData({
      ...rolePerm,
      roleper_mainmenu: typeof rolePerm.roleper_mainmenu === 'string' 
        ? rolePerm.roleper_mainmenu.split(',') 
        : rolePerm.roleper_mainmenu,
      roleper_submenu: typeof rolePerm.roleper_submenu === 'string' 
        ? rolePerm.roleper_submenu.split(',') 
        : rolePerm.roleper_submenu,
      additional_permissions: rolePerm.additional_permissions || []
    });
    setIsEdit(true);
    setShowForm(true);
  };

  const handleDelete = async (rolePermId: string) => {
    setDeleteId(rolePermId);
    setModal({ title: 'Delete Permission', message: 'Are you sure you want to delete this role permission?' });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setModal(null);
    try {
      setLoading(true);
      await axios.delete(`${API_URL}/${deleteId}`);
      setMessage({ text: 'Role permission deleted successfully!', type: 'success' });
      fetchRolePermissions();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Error deleting role permission!', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleStatusToggle = async (rolePermId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
    try {
      setLoading(true);
      await axios.patch(`${API_URL}/${rolePermId}/status`, { status: newStatus });
      setMessage({ text: 'Status updated successfully!', type: 'success' });
      fetchRolePermissions();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Error updating status!', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      roleper_roleid: '',
      roleper_mainmenu: [],
      roleper_submenu: [],
      cardVerPer: 0,
      PayVerPer: 0,
      ticketVerPer: 0,
      dashboardPer: 0,
      mcoReport: 0,
      roleper_status: 'Enabled',
      additional_permissions: []
    });
    setIsEdit(false);
    setShowForm(false);
  };

  // Reset function for form reset button (keeps form open)
  const resetFormFields = () => {
    setFormData({
      roleper_roleid: '',
      roleper_mainmenu: [],
      roleper_submenu: [],
      cardVerPer: 0,
      PayVerPer: 0,
      ticketVerPer: 0,
      dashboardPer: 0,
      mcoReport: 0,
      roleper_status: 'Enabled',
      additional_permissions: []
    });
    setIsEdit(false);
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.role_id === roleId);
    return role ? role.role_name : roleId;
  };

  const getModuleName = (moduleId: string) => {
    const module = modules.find(m => m.id === moduleId);
    return module ? module.name : moduleId;
  };

  const getSubModuleName = (subId: string) => {
    const sub = subModules.find(s => s.sub_id === subId);
    return sub ? sub.sub_name : subId;
  };

  // Filter permissions based on search
  const filteredPermissions = rolePermissions.filter(perm =>
    getRoleName(perm.roleper_roleid).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPermissions = filteredPermissions.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredPermissions.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">USER ACCESS MANAGER</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#0084D1]">ROLE & PERMISSION</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Role & Permission</h1>
            <p className="text-sm text-gray-500 mt-1">Manage role permissions and access controls</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setIsEdit(false);
              setFormData({
                roleper_roleid: '',
                roleper_mainmenu: [],
                roleper_submenu: [],
                cardVerPer: 0,
                PayVerPer: 0,
                ticketVerPer: 0,
                dashboardPer: 0,
                mcoReport: 0,
                roleper_status: 'Enabled',
                additional_permissions: []
              });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#0084D1] text-white hover:bg-[#0073b8] shadow-sm hover:shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Permission
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed left-1/2 top-20 z-60 w-[min(92vw,48rem)] -translate-x-1/2 rounded-lg p-3 shadow-lg flex items-center justify-between ${
            message.type === 'success' 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            <div className="flex items-center gap-2">
              {message.type === 'success' ? (
                <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              ) : (
                <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )}
              <span className="text-sm font-medium">{message.text}</span>
            </div>
            <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}

        {/* Permissions Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Permissions List</h3>
              <p className="text-xs text-gray-500">Manage role permissions and access controls</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search permissions..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition w-full sm:w-48 cursor-pointer"
              />
              <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role Name</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Main Menu</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Sub Menu</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && currentPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-[#0084D1]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-gray-500">Loading permissions...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentPermissions.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">No permissions found</span>
                        <span className="text-xs text-gray-400">Click "Add New Permission" to create one</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentPermissions.map((rolePerm, index) => (
                    <tr key={rolePerm.roleper_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 font-semibold text-xs">
                            {getRoleName(rolePerm.roleper_roleid).charAt(0)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">
                            {getRoleName(rolePerm.roleper_roleid)}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(rolePerm.roleper_mainmenu) 
                            ? rolePerm.roleper_mainmenu 
                            : rolePerm.roleper_mainmenu.split(',').filter(Boolean)
                          ).slice(0, 3).map((id, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                              {getModuleName(id)}
                            </span>
                          ))}
                          {(Array.isArray(rolePerm.roleper_mainmenu) 
                            ? rolePerm.roleper_mainmenu 
                            : rolePerm.roleper_mainmenu.split(',').filter(Boolean)
                          ).length > 3 && (
                            <span className="text-xs text-gray-400">+{(
                              Array.isArray(rolePerm.roleper_mainmenu) 
                                ? rolePerm.roleper_mainmenu 
                                : rolePerm.roleper_mainmenu.split(',').filter(Boolean)
                            ).length - 3} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden lg:table-cell">
                        <div className="flex flex-wrap gap-1.5">
                          {(Array.isArray(rolePerm.roleper_submenu) 
                            ? rolePerm.roleper_submenu 
                            : rolePerm.roleper_submenu.split(',').filter(Boolean)
                          ).slice(0, 2).map((id, idx) => (
                            <span key={idx} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                              {getSubModuleName(id)}
                            </span>
                          ))}
                          {(Array.isArray(rolePerm.roleper_submenu) 
                            ? rolePerm.roleper_submenu 
                            : rolePerm.roleper_submenu.split(',').filter(Boolean)
                          ).length > 2 && (
                            <span className="text-xs text-gray-400">+{(
                              Array.isArray(rolePerm.roleper_submenu) 
                                ? rolePerm.roleper_submenu 
                                : rolePerm.roleper_submenu.split(',').filter(Boolean)
                            ).length - 2} more</span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleStatusToggle(rolePerm.roleper_id!, rolePerm.roleper_status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                            rolePerm.roleper_status === 'Enabled'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            rolePerm.roleper_status === 'Enabled' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {rolePerm.roleper_status}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(rolePerm)}
                            className="p-1.5 text-gray-400 hover:text-[#0084D1] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(rolePerm.roleper_id!)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                            title="Delete"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {filteredPermissions.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="text-xs text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredPermissions.length)} of {filteredPermissions.length} permissions
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Previous
                </button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    let pageNum;
                    if (totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (currentPage >= totalPages - 2) {
                      pageNum = totalPages - 4 + i;
                    } else {
                      pageNum = currentPage - 2 + i;
                    }
                    
                    if (pageNum > 0 && pageNum <= totalPages) {
                      return (
                        <button
                          key={pageNum}
                          onClick={() => paginate(pageNum)}
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition cursor-pointer ${
                            currentPage === pageNum
                              ? 'bg-[#0084D1] text-white shadow-sm'
                              : 'text-gray-600 hover:bg-gray-200'
                          }`}
                        >
                          {pageNum}
                        </button>
                      );
                    }
                    return null;
                  })}
                </div>
                <button
                  onClick={() => paginate(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                >
                  Next
                </button>
                <div className="ml-2 flex items-center gap-1.5 text-xs text-gray-600">
                  <span>Rows:</span>
                  <select
                    value={itemsPerPage}
                    onChange={() => {}}
                    className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 cursor-pointer"
                  >
                    <option value="10">10</option>
                    <option value="25">25</option>
                    <option value="50">50</option>
                    <option value="100">100</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Modal */}
        <ActionModal
          open={Boolean(modal)}
          title={modal?.title || ''}
          message={modal?.message || ''}
          success={modal?.success}
          onConfirm={modal?.success ? () => setModal(null) : confirmDelete}
          onCancel={() => { setModal(null); setDeleteId(null); }}
        />

        {/* Create/Edit Permission Popup Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEdit ? 'Edit Permission' : 'Add New Permission'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Update role permission details' : 'Configure role access and permissions'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors cursor-pointer"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  {/* Role Name */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Role Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <select
                        name="roleper_roleid"
                        value={formData.roleper_roleid}
                        onChange={handleSelectChange}
                        required
                        className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none cursor-pointer"
                      >
                        <option value="">Select active role</option>
                        {roles.map(role => (
                          <option key={role.role_id} value={role.role_id}>
                            {role.role_name}
                          </option>
                        ))}
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6">
                    {/* Dashboard Permission */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-700">Dashboard Permission</label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, dashboardPer: prev.dashboardPer ? 0 : 1 }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                            formData.dashboardPer ? 'bg-[#0084D1]' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.dashboardPer ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-sm text-gray-600">
                          {formData.dashboardPer ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                    </div>

                    {/* MCO Report */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <label className="text-xs font-medium text-gray-700">Use this Role for MCO Report</label>
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, mcoReport: prev.mcoReport === 1 ? 0 : 1 }))}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 cursor-pointer ${
                            formData.mcoReport === 1 ? 'bg-[#0084D1]' : 'bg-gray-300'
                          }`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            formData.mcoReport === 1 ? 'translate-x-6' : 'translate-x-1'
                          }`} />
                        </button>
                        <span className="text-sm text-gray-600">
                          {formData.mcoReport === 1 ? 'Yes' : 'No'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Menu Permissions */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-2">Menu Permissions</label>
                    <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                      {modules.map(module => (
                        <div key={module.id} className="mb-3 last:mb-0">
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => toggleModule(module.id)}
                              className="flex h-6 w-6 items-center justify-center rounded-lg text-gray-500 hover:bg-white hover:text-gray-700 transition cursor-pointer"
                              aria-label={`${expandedModules[module.id] ? 'Collapse' : 'Expand'} ${module.name}`}
                            >
                              {expandedModules[module.id] ? (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                                </svg>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                </svg>
                              )}
                            </button>
                            <input
                              type="checkbox"
                              name="main_menu"
                              value={module.id}
                              checked={selectedMainMenus.includes(module.id)}
                              onChange={event => toggleModulePermission(module.id, event.target.checked)}
                              className="w-4 h-4 text-[#0084D1] border-gray-300 rounded focus:ring-[#0084D1]/20 cursor-pointer"
                            />
                            <span className="font-medium text-sm text-gray-900">{module.name}</span>
                            <span className="text-xs text-gray-400 bg-gray-200 px-2 py-0.5 rounded-full">
                              {getSubModules(module.id).length} sub-menus
                            </span>
                          </div>
                          {expandedModules[module.id] && (
                            <div className="ml-11 mt-2 space-y-2 border-l border-gray-200 pl-4">
                              {getSubModules(module.id).map(sub => (
                                <div key={sub.sub_id} className="flex items-center gap-2">
                                  <input
                                    type="checkbox"
                                    name="sub_menu"
                                    value={sub.sub_id}
                                    checked={selectedSubMenus.includes(sub.sub_id)}
                                    onChange={event => toggleSubmodulePermission(sub, event.target.checked)}
                                    className="w-4 h-4 text-[#0084D1] border-gray-300 rounded focus:ring-[#0084D1]/20 cursor-pointer"
                                  />
                                  <span className="text-sm text-gray-700">{sub.sub_name}</span>
                                  <span className="text-xs text-gray-400">{sub.sub_page}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <select
                        name="roleper_status"
                        value={formData.roleper_status}
                        onChange={handleSelectChange}
                        className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none cursor-pointer"
                      >
                        <option value="Enabled">Enabled</option>
                        <option value="Disabled">Disabled</option>
                      </select>
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0084D1] text-white rounded-lg text-sm font-medium hover:bg-[#0073b8] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm cursor-pointer"
                    >
                      {loading ? (
                        <>
                          <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                          </svg>
                          Processing...
                        </>
                      ) : (
                        <>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          {isEdit ? 'Update Permission' : 'Create Permission'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetFormFields}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition cursor-pointer"
                    >
                      Reset
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
      `}</style>
    </div>
  );
};

export default RolePermission;
