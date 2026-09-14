import React, { useState, useEffect } from 'react';
import ActionModal from './ActionModal';
import { apiService } from '../../services/api';

interface Role {
  role_id?: string;
  role_name: string;
  department_role: string;
  role_status: string;
  add_date?: string;
  add_by?: string;
}

const CreateRole: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Role>({
    role_name: '',
    department_role: '',
    role_status: 'Enabled'
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; success?: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  useEffect(() => {
    fetchRoles();
  }, []);

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const roleData = await apiService.listRoles();
      setRoles(roleData.map(role => ({
        ...role,
        role_id: String(role.role_id),
        role_status: role.status,
        add_date: role.created_at
      })));
    } catch (error) {
      console.error('Error fetching roles:', error);
      setMessage({ text: 'Error fetching roles!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      const roleData = {
        role_name: formData.role_name,
        department_role: formData.department_role,
        status: formData.role_status
      };
      if (isEdit) {
        await apiService.updateRole(Number(editId), roleData);
        setMessage({ text: 'Role updated successfully!', type: 'success' });
        setModal({ title: 'Role Updated', message: 'The role was updated successfully.', success: true });
      } else {
        await apiService.createRole(roleData);
        setMessage({ text: 'Role created successfully!', type: 'success' });
      }
      fetchRoles();
      resetForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({ 
        text: error.response?.data?.message || 'Error saving role!', 
        type: 'error' 
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (role: Role) => {
    setFormData(role);
    setIsEdit(true);
    setEditId(role.role_id || '');
    setShowForm(true);
  };

  const handleDelete = async (roleId: string) => {
    setDeleteId(roleId);
    setModal({ title: 'Delete Role', message: 'Are you sure you want to delete this role?' });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setModal(null);
    try {
      setLoading(true);
      await apiService.deleteRole(Number(deleteId));
      setMessage({ text: 'Role deleted successfully!', type: 'success' });
      fetchRoles();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Error deleting role!', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleStatusToggle = async (roleId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
    try {
      setLoading(true);
      await apiService.setRoleStatus(Number(roleId), newStatus);
      setMessage({ text: 'Status updated successfully!', type: 'success' });
      fetchRoles();
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
      role_name: '',
      department_role: '',
      role_status: 'Enabled'
    });
    setIsEdit(false);
    setEditId('');
    setShowForm(false);
  };

  // Reset function for form reset button (keeps form open)
  const resetFormFields = () => {
    setFormData({
      role_name: '',
      department_role: '',
      role_status: 'Enabled'
    });
    setIsEdit(false);
    setEditId('');
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const getRandomColor = (name: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
      'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
      'bg-rose-500', 'bg-amber-500'
    ];
    const index = name.length % colors.length;
    return colors[index];
  };

  // Filter roles based on search
  const filteredRoles = roles.filter(role =>
    role.role_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    role.department_role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentRoles = filteredRoles.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredRoles.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">USER ACCESS MANAGER</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#0084D1]">CREATE ROLE</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create Role</h1>
            <p className="text-sm text-gray-500 mt-1">Manage roles and department assignments</p>
          </div>
          <button
            onClick={() => {
              setShowForm(true);
              setIsEdit(false);
              setEditId('');
              setFormData({
                role_name: '',
                department_role: '',
                role_status: 'Enabled'
              });
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#0084D1] text-white hover:bg-[#0073b8] shadow-sm hover:shadow-md cursor-pointer"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Add New Role
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`fixed left-1/2 top-20 z-[60] w-[min(92vw,48rem)] -translate-x-1/2 rounded-lg p-3 shadow-lg flex items-center justify-between ${
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

        {/* Roles Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">Roles List</h3>
              <p className="text-xs text-gray-500">Manage roles and department assignments</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search roles..."
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
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Department Role</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Add Date</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Add By</th>
                  <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && currentRoles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-[#0084D1]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-gray-500">Loading roles...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentRoles.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">No roles found</span>
                        <span className="text-xs text-gray-400">Click "Add New Role" to create one</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentRoles.map((role, index) => (
                    <tr key={role.role_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-xs text-gray-400 font-medium">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 rounded-lg ${getRandomColor(role.role_name)} flex items-center justify-center text-white font-semibold text-xs shadow-sm`}>
                            {getInitials(role.role_name)}
                          </div>
                          <span className="font-medium text-gray-800 text-sm">{role.role_name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 hidden md:table-cell">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-50 text-indigo-700 border border-indigo-100">
                          {role.department_role}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">
                        {role.add_date ? new Date(role.add_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-4 py-2.5 text-xs text-gray-600 hidden lg:table-cell">
                        {role.add_by === '0' ? 'Admin' : role.add_by || '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleStatusToggle(role.role_id!, role.role_status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition cursor-pointer ${
                            role.role_status === 'Enabled'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            role.role_status === 'Enabled' ? 'bg-green-500' : 'bg-red-500'
                          }`}></span>
                          {role.role_status}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(role)}
                            className="p-1.5 text-gray-400 hover:text-[#0084D1] hover:bg-blue-50 rounded-lg transition cursor-pointer"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(role.role_id!)}
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
          {filteredRoles.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="text-xs text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredRoles.length)} of {filteredRoles.length} roles
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

        {/* Create/Edit Role Popup Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEdit ? 'Edit Role' : 'Add New Role'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Update role details' : 'Fill in the details below to create a new role'}
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
                      <input
                        type="text"
                        name="role_name"
                        value={formData.role_name}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter role name"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                      />
                    </div>
                  </div>

                  {/* Department Role */}
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Department Role <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                      </div>
                      <input
                        type="text"
                        name="department_role"
                        value={formData.department_role}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter department role"
                        className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                      />
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
                        name="role_status"
                        value={formData.role_status}
                        onChange={handleInputChange}
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
                          {isEdit ? 'Update Role' : 'Create Role'}
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

export default CreateRole;
