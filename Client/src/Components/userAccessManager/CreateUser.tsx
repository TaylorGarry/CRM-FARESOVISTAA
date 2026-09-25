// import React, { useState, useEffect } from 'react';
// import { apiService } from '../../services/api';
// import ActionModal from './ActionModal';

// interface User {
//   user_id?: string;
//   user_name: string;
//   user_role: string;
//   user_gender: string;
//   user_dob: string;
//   user_email: string;
//   emailp: string;
//   user_mobile: string;
//   user_address: string;
//   user_login: string;
//   user_password: string;
//   cnf_password: string;
//   user_status: string;
//   add_date?: string;
//   add_by?: string;
// }

// interface Role {
//   role_id: string;
//   role_name: string;
// }

// const CreateUser: React.FC = () => {
//   const [showForm, setShowForm] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);
//   const [showWebmailPassword, setShowWebmailPassword] = useState(false);
//   const [formData, setFormData] = useState<User>({
//     user_name: '',
//     user_role: '',
//     user_gender: 'Male',
//     user_dob: '',
//     user_email: '',
//     emailp: '',
//     user_mobile: '',
//     user_address: '',
//     user_login: '',
//     user_password: '',
//     cnf_password: '',
//     user_status: 'Enabled'
//   });
//   const [roles, setRoles] = useState<Role[]>([]);
//   const [users, setUsers] = useState<User[]>([]);
//   const [isEdit, setIsEdit] = useState(false);
//   const [editId, setEditId] = useState('');
//   const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
//   const [loading, setLoading] = useState(false);
//   const [modal, setModal] = useState<{ title: string; message: string; success?: boolean } | null>(null);
//   const [deleteId, setDeleteId] = useState<string | null>(null);
//   const [searchTerm, setSearchTerm] = useState('');
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemsPerPage] = useState(10);

//   useEffect(() => {
//     fetchRoles();
//     fetchUsers();
//   }, []);

//   const fetchRoles = async () => {
//     try {
//       const roleData = await apiService.listRoles();
//       const mappedRoles = roleData.map(role => ({
//         role_id: String(role.role_id),
//         role_name: role.role_name
//       }));
//       setRoles(mappedRoles);
//     } catch (error) {
//       console.error('Error fetching roles:', error);
//     }
//   };

//   const fetchUsers = async () => {
//     try {
//       setLoading(true);
//       const userData = await apiService.listUsers();
//       setUsers(userData.map(user => ({
//         ...user,
//         user_id: String(user.user_id),
//         user_gender: user.gender || (user as unknown as { user_gender?: string }).user_gender || '',
//         user_dob: String(user.dob || (user as unknown as { user_dob?: string }).user_dob || '').slice(0, 10),
//         user_mobile: user.mobile || '',
//         user_address: user.address || '',
//         user_email: user.user_email || '',
//         user_name: user.user_name || '',
//         user_status: user.user_status || 'Enabled',
//         user_password: user.user_password || '',
//         add_date: user.created_at || '',
//         cnf_password: '',
//         emailp: ''
//       })));
//     } catch (error) {
//       console.error('Error fetching users:', error);
//       setMessage({ text: 'Error fetching users!', type: 'error' });
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
//     const { name, value } = e.target;
//     setFormData(prev => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     if (formData.user_password !== formData.cnf_password) {
//       setMessage({ text: 'Passwords do not match!', type: 'error' });
//       return;
//     }
//     if (isEdit && Boolean(formData.user_password) !== Boolean(formData.cnf_password)) {
//       setMessage({ text: 'Enter and confirm the new password, or leave both password fields empty.', type: 'error' });
//       return;
//     }

//     try {
//       setLoading(true);
//       const userData = {
//         user_name: formData.user_name,
//         user_role: formData.user_role,
//         gender: formData.user_gender,
//         user_gender: formData.user_gender,
//         dob: formData.user_dob,
//         user_dob: formData.user_dob,
//         user_email: formData.user_email,
//         webmail_password: formData.emailp,
//         mobile: formData.user_mobile,
//         address: formData.user_address,
//         user_login: formData.user_login,
//         user_password: formData.user_password,
//         user_status: formData.user_status
//       };
//       if (isEdit) {
//         await apiService.updateUser(Number(editId), userData);
//         setMessage({ text: 'User updated successfully!', type: 'success' });
//         setModal({ title: 'User Updated', message: 'The user was updated successfully.', success: true });
//       } else {
//         await apiService.createUser(userData);
//         setMessage({ text: 'User created successfully!', type: 'success' });
//       }
//       fetchUsers();
//       resetForm();
//       setTimeout(() => setMessage(null), 3000);
//     } catch (error: any) {
//       setMessage({ 
//         text: error.response?.data?.message || 'Error saving user!', 
//         type: 'error' 
//       });
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleEdit = (user: User) => {
//     setFormData({
//       ...user,
//       user_password: '',
//       cnf_password: ''
//     });
//     setIsEdit(true);
//     setEditId(user.user_id || '');
//     setShowForm(true);
//   };

//   const handleDelete = async (userId: string) => {
//     setDeleteId(userId);
//     setModal({ title: 'Delete User', message: 'Are you sure you want to delete this user?' });
//   };

//   const confirmDelete = async () => {
//     if (!deleteId) return;
//     setModal(null);
//     try {
//       setLoading(true);
//       await apiService.deleteUser(Number(deleteId));
//       setMessage({ text: 'User deleted successfully!', type: 'success' });
//       fetchUsers();
//       setTimeout(() => setMessage(null), 3000);
//     } catch (error) {
//       setMessage({ text: 'Error deleting user!', type: 'error' });
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//       setDeleteId(null);
//     }
//   };

//   const handleStatusToggle = async (userId: string, currentStatus: string) => {
//     const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
//     try {
//       setLoading(true);
//       await apiService.setUserStatus(Number(userId), newStatus);
//       setMessage({ text: 'Status updated successfully!', type: 'success' });
//       fetchUsers();
//       setTimeout(() => setMessage(null), 3000);
//     } catch (error) {
//       setMessage({ text: 'Error updating status!', type: 'error' });
//       console.error('Error:', error);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resetForm = () => {
//     setFormData({
//       user_name: '',
//       user_role: '',
//       user_gender: 'Male',
//       user_dob: '',
//       user_email: '',
//       emailp: '',
//       user_mobile: '',
//       user_address: '',
//       user_login: '',
//       user_password: '',
//       cnf_password: '',
//       user_status: 'Enabled'
//     });
//     setIsEdit(false);
//     setEditId('');
//     setShowForm(false);
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//     setShowWebmailPassword(false);
//   };

//   // Reset function for form reset button (keeps form open)
//   const resetFormFields = () => {
//     setFormData({
//       user_name: '',
//       user_role: '',
//       user_gender: 'Male',
//       user_dob: '',
//       user_email: '',
//       emailp: '',
//       user_mobile: '',
//       user_address: '',
//       user_login: '',
//       user_password: '',
//       cnf_password: '',
//       user_status: 'Enabled'
//     });
//     setIsEdit(false);
//     setEditId('');
//     setShowPassword(false);
//     setShowConfirmPassword(false);
//     setShowWebmailPassword(false);
//   };

//   const getRoleName = (roleId: string) => {
//     const role = roles.find(r => r.role_id === roleId);
//     return role ? role.role_name : roleId;
//   };

//   const getInitials = (name: string) => {
//     return name
//       .split(' ')
//       .map(word => word.charAt(0))
//       .join('')
//       .toUpperCase()
//       .slice(0, 2);
//   };

//   const getRandomColor = (name: string) => {
//     const colors = [
//       'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500', 
//       'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
//       'bg-rose-500', 'bg-amber-500'
//     ];
//     const index = name.length % colors.length;
//     return colors[index];
//   };

//   // Filter users based on search
//   const filteredUsers = users.filter(user =>
//     user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
//     user.user_mobile.includes(searchTerm) ||
//     getRoleName(user.user_role).toLowerCase().includes(searchTerm.toLowerCase())
//   );

//   // Pagination
//   const indexOfLastItem = currentPage * itemsPerPage;
//   const indexOfFirstItem = indexOfLastItem - itemsPerPage;
//   const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
//   const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

//   const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

//   return (
//     <div className="min-h-screen bg-gray-50 p-4 md:p-6">
//       <div className="max-w-7xl mx-auto">
//         {/* Breadcrumb */}
//         <div className="text-sm text-gray-600 mb-4">
//           <span className="font-semibold">USER ACCESS MANAGER</span>
//           <span className="mx-2">&gt;</span>
//           <span className="text-[#0084D1]">CREATE USER</span>
//         </div>

//         {/* Header */}
//         <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
//           <h1 className="text-2xl font-bold text-gray-800">Create User</h1>
//           <button
//             onClick={() => {
//               setShowForm(true);
//               setIsEdit(false);
//               setEditId('');
//               setFormData({
//                 user_name: '',
//                 user_role: '',
//                 user_gender: 'Male',
//                 user_dob: '',
//                 user_email: '',
//                 emailp: '',
//                 user_mobile: '',
//                 user_address: '',
//                 user_login: '',
//                 user_password: '',
//                 cnf_password: '',
//                 user_status: 'Enabled'
//               });
//               setShowPassword(false);
//               setShowConfirmPassword(false);
//               setShowWebmailPassword(false);
//             }}
//             className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#0084D1] text-white hover:bg-[#0073b8] shadow-sm hover:shadow-md"
//           >
//             <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
//             </svg>
//             Create User
//           </button>
//         </div>

//         {/* Message Toast */}
//         {message && (
//           <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${
//             message.type === 'success' 
//               ? 'bg-green-50 border border-green-200 text-green-700' 
//               : 'bg-red-50 border border-red-200 text-red-700'
//           }`}>
//             <div className="flex items-center gap-2">
//               {message.type === 'success' ? (
//                 <svg className="w-4 h-4 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               ) : (
//                 <svg className="w-4 h-4 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                 </svg>
//               )}
//               <span className="text-sm font-medium">{message.text}</span>
//             </div>
//             <button onClick={() => setMessage(null)} className="text-gray-400 hover:text-gray-600">
//               <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//               </svg>
//             </button>
//           </div>
//         )}

//         {/* Users Table */}
//         <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
//           {/* Table Header with Search */}
//           <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200">
//             <div>
//               <h3 className="text-sm font-semibold text-gray-700">User List</h3>
//               <p className="text-xs text-gray-500">Manage and view all registered users</p>
//             </div>
//             <div className="relative">
//               <input
//                 type="text"
//                 placeholder="Search users..."
//                 value={searchTerm}
//                 onChange={(e) => {
//                   setSearchTerm(e.target.value);
//                   setCurrentPage(1);
//                 }}
//                 className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition w-full sm:w-48"
//               />
//               <svg className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
//               </svg>
//             </div>
//           </div>

//           <div className="overflow-x-auto">
//             <table className="w-full text-sm">
//               <thead className="bg-gray-50 border-b border-gray-200">
//                 <tr>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">#</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Name</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Role</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden md:table-cell">Gender</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Mobile</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Email</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden xl:table-cell">Username</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider hidden lg:table-cell">Add Date</th>
//                   <th className="px-4 py-2 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
//                   <th className="px-4 py-2 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
//                 </tr>
//               </thead>
//               <tbody className="divide-y divide-gray-100">
//                 {loading && currentUsers.length === 0 ? (
//                   <tr>
//                     <td colSpan={10} className="px-4 py-8 text-center">
//                       <div className="flex flex-col items-center gap-2">
//                         <svg className="animate-spin h-6 w-6 text-[#0084D1]" viewBox="0 0 24 24">
//                           <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                           <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                         </svg>
//                         <span className="text-sm text-gray-500">Loading users...</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : currentUsers.length === 0 ? (
//                   <tr>
//                     <td colSpan={10} className="px-4 py-8 text-center">
//                       <div className="flex flex-col items-center gap-1">
//                         <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
//                         </svg>
//                         <span className="text-sm text-gray-500 font-medium">No users found</span>
//                         <span className="text-xs text-gray-400">Click "Create User" to add one</span>
//                       </div>
//                     </td>
//                   </tr>
//                 ) : (
//                   currentUsers.map((user, index) => (
//                     <tr key={user.user_id} className="hover:bg-gray-50/60 transition-colors">
//                       <td className="px-4 py-2.5 text-xs text-gray-400 font-medium">
//                         {indexOfFirstItem + index + 1}
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <div className="flex items-center gap-2.5">
//                           <div className={`w-8 h-8 rounded-lg ${getRandomColor(user.user_name)} flex items-center justify-center text-white font-semibold text-xs shadow-sm`}>
//                             {getInitials(user.user_name)}
//                           </div>
//                           <span className="font-medium text-gray-800 text-sm">{user.user_name}</span>
//                         </div>
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
//                           {getRoleName(user.user_role)}
//                         </span>
//                       </td>
//                       <td className="px-4 py-2.5 text-sm text-gray-600 hidden md:table-cell">
//                         {user.user_gender}
//                       </td>
//                       <td className="px-4 py-2.5 text-sm text-gray-600 hidden lg:table-cell">
//                         {user.user_mobile}
//                       </td>
//                       <td className="px-4 py-2.5 text-sm text-gray-600 hidden xl:table-cell">
//                         {user.user_email}
//                       </td>
//                       <td className="px-4 py-2.5 text-sm text-gray-600 hidden xl:table-cell">
//                         {user.user_login}
//                       </td>
//                       <td className="px-4 py-2.5 text-xs text-gray-500 hidden lg:table-cell">
//                         {user.add_date ? new Date(user.add_date).toLocaleDateString('en-US', {
//                           year: 'numeric',
//                           month: 'short',
//                           day: 'numeric'
//                         }) : '-'}
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <button
//                           onClick={() => handleStatusToggle(user.user_id!, user.user_status)}
//                           className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition ${
//                             user.user_status === 'Enabled'
//                               ? 'bg-green-100 text-green-700 hover:bg-green-200'
//                               : 'bg-red-100 text-red-700 hover:bg-red-200'
//                           }`}
//                         >
//                           <span className={`w-1.5 h-1.5 rounded-full ${
//                             user.user_status === 'Enabled' ? 'bg-green-500' : 'bg-red-500'
//                           }`}></span>
//                           {user.user_status}
//                         </button>
//                       </td>
//                       <td className="px-4 py-2.5">
//                         <div className="flex items-center justify-end gap-1.5">
//                           <button
//                             onClick={() => handleEdit(user)}
//                             className="p-1.5 text-gray-400 hover:text-[#0084D1] hover:bg-blue-50 rounded-lg transition"
//                             title="Edit"
//                           >
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
//                             </svg>
//                           </button>
//                           <button
//                             onClick={() => handleDelete(user.user_id!)}
//                             className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
//                             title="Delete"
//                           >
//                             <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
//                             </svg>
//                           </button>
//                         </div>
//                       </td>
//                     </tr>
//                   ))
//                 )}
//               </tbody>
//             </table>
//           </div>

//           {/* Pagination */}
//           {filteredUsers.length > 0 && (
//             <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
//               <div className="text-xs text-gray-600">
//                 Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
//               </div>
//               <div className="flex items-center gap-2">
//                 <button
//                   onClick={() => paginate(currentPage - 1)}
//                   disabled={currentPage === 1}
//                   className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                 >
//                   Previous
//                 </button>
//                 <div className="flex items-center gap-1">
//                   {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
//                     let pageNum;
//                     if (totalPages <= 5) {
//                       pageNum = i + 1;
//                     } else if (currentPage <= 3) {
//                       pageNum = i + 1;
//                     } else if (currentPage >= totalPages - 2) {
//                       pageNum = totalPages - 4 + i;
//                     } else {
//                       pageNum = currentPage - 2 + i;
//                     }

//                     if (pageNum > 0 && pageNum <= totalPages) {
//                       return (
//                         <button
//                           key={pageNum}
//                           onClick={() => paginate(pageNum)}
//                           className={`w-7 h-7 rounded-lg text-xs font-medium transition ${
//                             currentPage === pageNum
//                               ? 'bg-[#0084D1] text-white shadow-sm'
//                               : 'text-gray-600 hover:bg-gray-200'
//                           }`}
//                         >
//                           {pageNum}
//                         </button>
//                       );
//                     }
//                     return null;
//                   })}
//                 </div>
//                 <button
//                   onClick={() => paginate(currentPage + 1)}
//                   disabled={currentPage === totalPages}
//                   className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
//                 >
//                   Next
//                 </button>
//                 <div className="ml-2 flex items-center gap-1.5 text-xs text-gray-600">
//                   <span>Rows:</span>
//                   <select
//                     value={itemsPerPage}
//                     onChange={() => {}}
//                     className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20"
//                   >
//                     <option value="10">10</option>
//                     <option value="25">25</option>
//                     <option value="50">50</option>
//                     <option value="100">100</option>
//                   </select>
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>

//         {/* Action Modal */}
//         <ActionModal
//           open={Boolean(modal)}
//           title={modal?.title || ''}
//           message={modal?.message || ''}
//           success={modal?.success}
//           onConfirm={modal?.success ? () => setModal(null) : confirmDelete}
//           onCancel={() => { setModal(null); setDeleteId(null); }}
//         />

//         {/* Create/Edit User Popup Modal */}
//         {showForm && (
//           <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
//             <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
//               {/* Modal Header */}
//               <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
//                 <div>
//                   <h2 className="text-xl font-bold text-gray-800">
//                     {isEdit ? 'Edit User' : 'Create User'}
//                   </h2>
//                   <p className="text-sm text-gray-500">
//                     {isEdit ? 'Update user details' : 'Fill in the details below to create a new user'}
//                   </p>
//                 </div>
//                 <button
//                   onClick={resetForm}
//                   className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
//                 >
//                   <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
//                   </svg>
//                 </button>
//               </div>

//               {/* Modal Body - No Scroll */}
//               <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 140px)' }}>
//                 <form onSubmit={handleSubmit} className="space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     {/* Name */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Name <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
//                           </svg>
//                         </div>
//                         <input
//                           type="text"
//                           name="user_name"
//                           value={formData.user_name}
//                           onChange={handleInputChange}
//                           required
//                           placeholder="Enter full name"
//                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Mobile */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Mobile <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
//                           </svg>
//                         </div>
//                         <input
//                           type="tel"
//                           name="user_mobile"
//                           value={formData.user_mobile}
//                           onChange={handleInputChange}
//                           required
//                           placeholder="Enter mobile number"
//                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Password with Eye Icon */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Password <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                           </svg>
//                         </div>
//                         <input
//                           type={showPassword ? "text" : "password"}
//                           name="user_password"
//                           value={formData.user_password}
//                           onChange={handleInputChange}
//                           required={!isEdit}
//                           placeholder="Enter password"
//                           className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowPassword(!showPassword)}
//                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
//                         >
//                           {showPassword ? (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           ) : (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Role Name */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Role Name <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
//                           </svg>
//                         </div>
//                         <select
//                           name="user_role"
//                           value={formData.user_role}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
//                         >
//                           <option value="">Select active role</option>
//                           {roles.map(role => (
//                             <option key={role.role_id} value={role.role_id}>
//                               {role.role_name}
//                             </option>
//                           ))}
//                         </select>
//                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>

//                     {/* Email */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         User Email <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
//                           </svg>
//                         </div>
//                         <input
//                           type="email"
//                           name="user_email"
//                           value={formData.user_email}
//                           onChange={handleInputChange}
//                           required
//                           placeholder="Enter email address"
//                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Webmail Password with Eye Icon */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Webmail Login Password</label>
//                       <div className="relative">
//                         <input
//                           type={showWebmailPassword ? "text" : "password"}
//                           name="emailp"
//                           value={formData.emailp}
//                           onChange={handleInputChange}
//                           placeholder="Enter webmail password"
//                           className="w-full px-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowWebmailPassword(!showWebmailPassword)}
//                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
//                         >
//                           {showWebmailPassword ? (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           ) : (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Address */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
//                           </svg>
//                         </div>
//                         <input
//                           type="text"
//                           name="user_address"
//                           value={formData.user_address}
//                           onChange={handleInputChange}
//                           placeholder="Enter address"
//                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Confirm Password with Eye Icon */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Confirm Password <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
//                           </svg>
//                         </div>
//                         <input
//                           type={showConfirmPassword ? "text" : "password"}
//                           name="cnf_password"
//                           value={formData.cnf_password}
//                           onChange={handleInputChange}
//                           required={!isEdit}
//                           placeholder="Confirm password"
//                           className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                         <button
//                           type="button"
//                           onClick={() => setShowConfirmPassword(!showConfirmPassword)}
//                           className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
//                         >
//                           {showConfirmPassword ? (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
//                             </svg>
//                           ) : (
//                             <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
//                             </svg>
//                           )}
//                         </button>
//                       </div>
//                     </div>

//                     {/* Gender */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Gender <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3a1 1 0 011 1v14a1 1 0 01-1 1M4 7a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
//                           </svg>
//                         </div>
//                         <select
//                           name="user_gender"
//                           value={formData.user_gender}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
//                         >
//                           <option value="Male">Male</option>
//                           <option value="Female">Female</option>
//                         </select>
//                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>

//                     {/* DOB */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         DOB <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
//                           </svg>
//                         </div>
//                         <input
//                           type="date"
//                           name="user_dob"
//                           value={formData.user_dob}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                         />
//                       </div>
//                     </div>

//                     {/* Status */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         Status <span className="text-red-500">*</span>
//                       </label>
//                       <div className="relative">
//                         <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
//                           </svg>
//                         </div>
//                         <select
//                           name="user_status"
//                           value={formData.user_status}
//                           onChange={handleInputChange}
//                           required
//                           className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
//                         >
//                           <option value="Enabled">Enabled</option>
//                           <option value="Disabled">Disabled</option>
//                         </select>
//                         <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
//                           <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
//                           </svg>
//                         </div>
//                       </div>
//                     </div>

//                     {/* User Login */}
//                     <div>
//                       <label className="block text-xs font-medium text-gray-700 mb-1">
//                         User Name <span className="text-red-500">*</span>
//                       </label>
//                       <input
//                         type="text"
//                         name="user_login"
//                         value={formData.user_login}
//                         onChange={handleInputChange}
//                         required
//                         placeholder="Enter login username"
//                         className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
//                       />
//                     </div>
//                   </div>

//                   {/* Form Actions */}
//                   <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
//                     <button
//                       type="submit"
//                       disabled={loading}
//                       className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0084D1] text-white rounded-lg text-sm font-medium hover:bg-[#0073b8] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
//                     >
//                       {loading ? (
//                         <>
//                           <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
//                             <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
//                             <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
//                           </svg>
//                           Processing...
//                         </>
//                       ) : (
//                         <>
//                           <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                             <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                           </svg>
//                           {isEdit ? 'Update User' : 'Create User'}
//                         </>
//                       )}
//                     </button>
//                     <button
//                       type="button"
//                       onClick={resetFormFields}
//                       className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
//                     >
//                       Reset
//                     </button>
//                   </div>
//                 </form>
//               </div>
//             </div>
//           </div>
//         )}
//       </div>

//       {/* Add animation styles */}
//       <style>{`
//         @keyframes fadeIn {
//           from { opacity: 0; transform: scale(0.95); }
//           to { opacity: 1; transform: scale(1); }
//         }
//         .animate-fadeIn {
//           animation: fadeIn 0.2s ease-out;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default CreateUser;



import React, { useState, useEffect } from 'react';
import { apiService } from '../../services/api';
import ActionModal from './ActionModal';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import dayjs, { Dayjs } from 'dayjs';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { Box } from '@mui/material';

interface User {
  user_id?: string;
  user_name: string;
  user_role: string;
  user_gender: string;
  user_dob: string;
  user_email: string;
  emailp: string;
  user_mobile: string;
  user_address: string;
  user_login: string;
  user_password: string;
  cnf_password: string;
  user_status: string;
  add_date?: string;
  add_by?: string;
}

interface Role {
  role_id: string;
  role_name: string;
}

// White theme for calendar
const whiteTheme = createTheme({
  palette: {
    background: {
      default: '#ffffff',
      paper: '#ffffff',
    },
    primary: {
      main: '#0084D1',
    },
  },
  components: {
    MuiPickersDay: {
      styleOverrides: {
        root: {
          '&:hover': {
            backgroundColor: '#e8f4fd',
          },
          '&.Mui-selected': {
            backgroundColor: '#0084D1',
            color: '#ffffff',
            '&:hover': {
              backgroundColor: '#0073b8',
            },
          },
          '&.Mui-disabled': {
            color: '#bdbdbd',
          },
        },
      },
    },
    MuiDayCalendar: {
      styleOverrides: {
        weekContainer: {
          justifyContent: 'center',
        },
      },
    },
    MuiPickersCalendarHeader: {
      styleOverrides: {
        root: {
          padding: '8px 12px',
        },
        switchViewButton: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
    MuiPickersArrowSwitcher: {
      styleOverrides: {
        button: {
          '&:hover': {
            backgroundColor: '#f5f5f5',
          },
        },
      },
    },
  },
  typography: {
    fontFamily: 'inherit',
  },
});

const CreateUser: React.FC = () => {
  const [showForm, setShowForm] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showWebmailPassword, setShowWebmailPassword] = useState(false);
  const [formData, setFormData] = useState<User>({
    user_name: '',
    user_role: '',
    user_gender: 'Male',
    user_dob: '',
    user_email: '',
    emailp: '',
    user_mobile: '',
    user_address: '',
    user_login: '',
    user_password: '',
    cnf_password: '',
    user_status: 'Enabled'
  });
  const [roles, setRoles] = useState<Role[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [isEdit, setIsEdit] = useState(false);
  const [editId, setEditId] = useState('');
  const [message, setMessage] = useState<{ text: string; type: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState<{ title: string; message: string; success?: boolean } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);

  // Calendar state
  const [showCalendar, setShowCalendar] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Dayjs | null>(null);

  useEffect(() => {
    fetchRoles();
    fetchUsers();
  }, []);

  const fetchRoles = async () => {
    try {
      const roleData = await apiService.listRoles();
      const mappedRoles = roleData.map(role => ({
        role_id: String(role.role_id),
        role_name: role.role_name
      }));
      setRoles(mappedRoles);
    } catch (error) {
      console.error('Error fetching roles:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const userData = await apiService.listUsers();
      setUsers(userData.map(user => ({
        ...user,
        user_id: String(user.user_id),
        user_gender: user.gender || (user as unknown as { user_gender?: string }).user_gender || '',
        user_dob: String(user.dob || (user as unknown as { user_dob?: string }).user_dob || '').slice(0, 10),
        user_mobile: user.mobile || '',
        user_address: user.address || '',
        user_email: user.user_email || '',
        user_name: user.user_name || '',
        user_status: user.user_status || 'Enabled',
        user_password: user.user_password || '',
        add_date: user.created_at || '',
        cnf_password: '',
        emailp: ''
      })));
    } catch (error) {
      console.error('Error fetching users:', error);
      setMessage({ text: 'Error fetching users!', type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Handle date selection from calendar
  const handleDateChange = (date: Dayjs | null) => {
    if (date) {
      setSelectedDate(date);
      setFormData(prev => ({
        ...prev,
        user_dob: date.format('YYYY-MM-DD')
      }));
    }
    setShowCalendar(false);
  };

  // Open calendar
  const handleCalendarOpen = () => {
    // If there's a date, set it, otherwise use today
    if (formData.user_dob) {
      setSelectedDate(dayjs(formData.user_dob));
    } else {
      setSelectedDate(dayjs());
    }
    setShowCalendar(true);
  };

  const handleCalendarClose = () => {
    setShowCalendar(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.user_password !== formData.cnf_password) {
      setMessage({ text: 'Passwords do not match!', type: 'error' });
      return;
    }
    if (isEdit && Boolean(formData.user_password) !== Boolean(formData.cnf_password)) {
      setMessage({ text: 'Enter and confirm the new password, or leave both password fields empty.', type: 'error' });
      return;
    }

    try {
      setLoading(true);
      const userData = {
        user_name: formData.user_name,
        user_role: formData.user_role,
        gender: formData.user_gender,
        user_gender: formData.user_gender,
        dob: formData.user_dob,
        user_dob: formData.user_dob,
        user_email: formData.user_email,
        webmail_password: formData.emailp,
        mobile: formData.user_mobile,
        address: formData.user_address,
        user_login: formData.user_login,
        user_password: formData.user_password,
        user_status: formData.user_status
      };
      if (isEdit) {
        await apiService.updateUser(Number(editId), userData);
        setMessage({ text: 'User updated successfully!', type: 'success' });
        setModal({ title: 'User Updated', message: 'The user was updated successfully.', success: true });
      } else {
        await apiService.createUser(userData);
        setMessage({ text: 'User created successfully!', type: 'success' });
      }
      fetchUsers();
      resetForm();
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      setMessage({
        text: error.response?.data?.message || 'Error saving user!',
        type: 'error'
      });
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: User) => {
    setFormData({
      ...user,
      user_password: '',
      cnf_password: ''
    });
    // Set selected date for calendar
    if (user.user_dob) {
      setSelectedDate(dayjs(user.user_dob));
    }
    setIsEdit(true);
    setEditId(user.user_id || '');
    setShowForm(true);
  };

  const handleDelete = async (userId: string) => {
    setDeleteId(userId);
    setModal({ title: 'Delete User', message: 'Are you sure you want to delete this user?' });
  };

  const confirmDelete = async () => {
    if (!deleteId) return;
    setModal(null);
    try {
      setLoading(true);
      await apiService.deleteUser(Number(deleteId));
      setMessage({ text: 'User deleted successfully!', type: 'success' });
      fetchUsers();
      setTimeout(() => setMessage(null), 3000);
    } catch (error) {
      setMessage({ text: 'Error deleting user!', type: 'error' });
      console.error('Error:', error);
    } finally {
      setLoading(false);
      setDeleteId(null);
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'Enabled' ? 'Disabled' : 'Enabled';
    try {
      setLoading(true);
      await apiService.setUserStatus(Number(userId), newStatus);
      setMessage({ text: 'Status updated successfully!', type: 'success' });
      fetchUsers();
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
      user_name: '',
      user_role: '',
      user_gender: 'Male',
      user_dob: '',
      user_email: '',
      emailp: '',
      user_mobile: '',
      user_address: '',
      user_login: '',
      user_password: '',
      cnf_password: '',
      user_status: 'Enabled'
    });
    setSelectedDate(null);
    setIsEdit(false);
    setEditId('');
    setShowForm(false);
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowWebmailPassword(false);
    setShowCalendar(false);
  };

  // Reset function for form reset button (keeps form open)
  const resetFormFields = () => {
    setFormData({
      user_name: '',
      user_role: '',
      user_gender: 'Male',
      user_dob: '',
      user_email: '',
      emailp: '',
      user_mobile: '',
      user_address: '',
      user_login: '',
      user_password: '',
      cnf_password: '',
      user_status: 'Enabled'
    });
    setSelectedDate(null);
    setIsEdit(false);
    setEditId('');
    setShowPassword(false);
    setShowConfirmPassword(false);
    setShowWebmailPassword(false);
    setShowCalendar(false);
  };

  const getRoleName = (roleId: string) => {
    const role = roles.find(r => r.role_id === roleId);
    return role ? role.role_name : roleId;
  };

  // const getInitials = (name: string) => {
  //   return name
  //     .split(' ')
  //     .map(word => word.charAt(0))
  //     .join('')
  //     .toUpperCase()
  //     .slice(0, 2);
  // };

  // const getRandomColor = (name: string) => {
  //   const colors = [
  //     'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-pink-500',
  //     'bg-indigo-500', 'bg-teal-500', 'bg-orange-500', 'bg-cyan-500',
  //     'bg-rose-500', 'bg-amber-500'
  //   ];
  //   const index = name.length % colors.length;
  //   return colors[index];
  // };

  // Filter users based on search
  const filteredUsers = users.filter(user =>
    user.user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.user_mobile.includes(searchTerm) ||
    getRoleName(user.user_role).toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentUsers = filteredUsers.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Breadcrumb */}
        <div className="text-sm text-gray-600 mb-4">
          <span className="font-semibold">USER ACCESS MANAGER</span>
          <span className="mx-2">&gt;</span>
          <span className="text-[#0084D1]">CREATE USER</span>
        </div>

        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
          <h1 className="text-2xl font-bold text-gray-800">Create User</h1>
          <button
            onClick={() => {
              setShowForm(true);
              setIsEdit(false);
              setEditId('');
              setFormData({
                user_name: '',
                user_role: '',
                user_gender: 'Male',
                user_dob: '',
                user_email: '',
                emailp: '',
                user_mobile: '',
                user_address: '',
                user_login: '',
                user_password: '',
                cnf_password: '',
                user_status: 'Enabled'
              });
              setSelectedDate(null);
              setShowPassword(false);
              setShowConfirmPassword(false);
              setShowWebmailPassword(false);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg font-medium transition-all duration-200 bg-[#0084D1] text-white hover:bg-[#0073b8] shadow-sm hover:shadow-md"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Create User
          </button>
        </div>

        {/* Message Toast */}
        {message && (
          <div className={`mb-4 p-3 rounded-lg flex items-center justify-between ${message.type === 'success'
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

        {/* Users Table */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
          {/* Table Header with Search */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-4 py-3 border-b border-gray-200">
            <div>
              <h3 className="text-sm font-semibold text-gray-700">User List</h3>
              <p className="text-xs text-gray-500">Manage and view all registered users</p>
            </div>
            <div className="relative">
              <input
                type="text"
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition w-full sm:w-48"
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
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">#</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden md:table-cell">Gender</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Mobile</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Email</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden xl:table-cell">Username</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider hidden lg:table-cell">Add Date</th>
                  <th className="px-4 py-2 text-left text-xs font-bold text-gray-700 uppercase tracking-wider">Status</th>
                  <th className="px-4 py-2 text-right text-xs font-bold text-gray-700 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {loading && currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg className="animate-spin h-6 w-6 text-[#0084D1]" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span className="text-sm text-gray-500">Loading users...</span>
                      </div>
                    </td>
                  </tr>
                ) : currentUsers.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="px-4 py-8 text-center">
                      <div className="flex flex-col items-center gap-1">
                        <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-sm text-gray-500 font-medium">No users found</span>
                        <span className="text-xs text-gray-400">Click "Create User" to add one</span>
                      </div>
                    </td>
                  </tr>
                ) : (
                  currentUsers.map((user, index) => (
                    <tr key={user.user_id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="px-4 py-2.5 text-xs font-medium text-black ">
                        {indexOfFirstItem + index + 1}
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2.5">
                          <span className="font-medium text-gray-800 text-sm">
                            {user.user_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {getRoleName(user.user_role)}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-black hidden md:table-cell">
                        {user.user_gender}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-black hidden lg:table-cell">
                        {user.user_mobile}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-black hidden xl:table-cell">
                        {user.user_email}
                      </td>
                      <td className="px-4 py-2.5 text-sm font-medium text-black hidden xl:table-cell">
                        {user.user_login}
                      </td>
                      <td className="px-4 py-2.5 text-xs font-medium text-black hidden lg:table-cell">
                        {user.add_date ? new Date(user.add_date).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric'
                        }) : '-'}
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          onClick={() => handleStatusToggle(user.user_id!, user.user_status)}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium transition ${user.user_status === 'Enabled'
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                        >
                          <span className={`w-1.5 h-1.5 rounded-full ${user.user_status === 'Enabled' ? 'bg-green-500' : 'bg-red-500'
                            }`}></span>
                          {user.user_status}
                        </button>
                      </td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleEdit(user)}
                            className="p-1.5 text-gray-400 hover:text-[#0084D1] hover:bg-blue-50 rounded-lg transition"
                            title="Edit"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => handleDelete(user.user_id!)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
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
          {filteredUsers.length > 0 && (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50/50">
              <div className="text-xs text-gray-600">
                Showing {indexOfFirstItem + 1} to {Math.min(indexOfLastItem, filteredUsers.length)} of {filteredUsers.length} users
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => paginate(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
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
                          className={`w-7 h-7 rounded-lg text-xs font-medium transition ${currentPage === pageNum
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
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-gray-600 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition"
                >
                  Next
                </button>
                <div className="ml-2 flex items-center gap-1.5 text-xs text-gray-600">
                  <span>Rows:</span>
                  <select
                    value={itemsPerPage}
                    onChange={() => { }}
                    className="bg-white border border-gray-300 rounded px-1.5 py-0.5 text-xs focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20"
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

        {/* Create/Edit User Popup Modal */}
        {showForm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[95vh] overflow-hidden">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50/80">
                <div>
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEdit ? 'Edit User' : 'Create User'}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {isEdit ? 'Update user details' : 'Fill in the details below to create a new user'}
                  </p>
                </div>
                <button
                  onClick={resetForm}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Modal Body - No Scroll */}
              <div className="overflow-y-auto p-6" style={{ maxHeight: 'calc(95vh - 140px)' }}>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Name */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Name <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="user_name"
                          value={formData.user_name}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter full name"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                      </div>
                    </div>

                    {/* Mobile */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Mobile <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                          </svg>
                        </div>
                        <input
                          type="tel"
                          name="user_mobile"
                          value={formData.user_mobile}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter mobile number"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                      </div>
                    </div>

                    {/* Password with Eye Icon */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showPassword ? "text" : "password"}
                          name="user_password"
                          value={formData.user_password}
                          onChange={handleInputChange}
                          required={!isEdit}
                          placeholder="Enter password"
                          className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showPassword ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

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
                          name="user_role"
                          value={formData.user_role}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
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

                    {/* Email */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        User Email <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="email"
                          name="user_email"
                          value={formData.user_email}
                          onChange={handleInputChange}
                          required
                          placeholder="Enter email address"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                      </div>
                    </div>

                    {/* Webmail Password with Eye Icon */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Webmail Login Password</label>
                      <div className="relative">
                        <input
                          type={showWebmailPassword ? "text" : "password"}
                          name="emailp"
                          value={formData.emailp}
                          onChange={handleInputChange}
                          placeholder="Enter webmail password"
                          className="w-full px-3 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowWebmailPassword(!showWebmailPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showWebmailPassword ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">Address</label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="user_address"
                          value={formData.user_address}
                          onChange={handleInputChange}
                          placeholder="Enter address"
                          className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                      </div>
                    </div>

                    {/* Confirm Password with Eye Icon */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Confirm Password <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          name="cnf_password"
                          value={formData.cnf_password}
                          onChange={handleInputChange}
                          required={!isEdit}
                          placeholder="Confirm password"
                          className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
                        >
                          {showConfirmPassword ? (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          ) : (
                            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                            </svg>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Gender <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 3a1 1 0 011 1v14a1 1 0 01-1 1M4 7a1 1 0 011-1h10a1 1 0 011 1v10a1 1 0 01-1 1H5a1 1 0 01-1-1V7z" />
                          </svg>
                        </div>
                        <select
                          name="user_gender"
                          value={formData.user_gender}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
                        >
                          <option value="Male">Male</option>
                          <option value="Female">Female</option>
                        </select>
                        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </div>
                      </div>
                    </div>

                    {/* DOB with Calendar Modal */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        DOB <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <input
                          type="text"
                          name="user_dob"
                          value={formData.user_dob ? dayjs(formData.user_dob).format('MM/DD/YYYY') : ''}
                          placeholder="MM/DD/YYYY"
                          className="w-full pl-9 pr-10 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition cursor-pointer"
                          onClick={handleCalendarOpen}
                          readOnly
                          required
                        />
                        <button
                          type="button"
                          onClick={handleCalendarOpen}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors z-10"
                        >
                          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </button>
                      </div>
                    </div>

                    {/* Status */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        Status <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <svg className="h-4 w-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        </div>
                        <select
                          name="user_status"
                          value={formData.user_status}
                          onChange={handleInputChange}
                          required
                          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition appearance-none"
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

                    {/* User Login */}
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1">
                        User Name <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        name="user_login"
                        value={formData.user_login}
                        onChange={handleInputChange}
                        required
                        placeholder="Enter login username"
                        className="w-full px-3 py-2 bg-gray-50 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0084D1]/20 focus:border-[#0084D1] transition"
                      />
                    </div>
                  </div>

                  {/* Form Actions */}
                  <div className="flex flex-wrap items-center gap-3 pt-4 border-t border-gray-200">
                    <button
                      type="submit"
                      disabled={loading}
                      className="inline-flex items-center gap-2 px-6 py-2.5 bg-[#0084D1] text-white rounded-lg text-sm font-medium hover:bg-[#0073b8] transition disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
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
                          {isEdit ? 'Update User' : 'Create User'}
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={resetFormFields}
                      className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-50 transition"
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

      {/* Calendar Modal - Centered on Screen */}
      {showCalendar && (
        <div
          className="fixed inset-0 z-9999 flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn"
          onClick={handleCalendarClose}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl p-4 max-w-sm w-full mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-3 px-2">
              <h3 className="text-sm font-semibold text-gray-700">Select Date</h3>
              <button
                onClick={handleCalendarClose}
                className="p-1 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <ThemeProvider theme={whiteTheme}>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <Box sx={{
                  backgroundColor: '#ffffff',
                  borderRadius: '12px',
                  padding: '0',
                  display: 'flex',
                  justifyContent: 'center',
                }}>
                  <DateCalendar
                    value={selectedDate}
                    onChange={handleDateChange}
                    views={['year', 'month', 'day']}
                    openTo="day"
                    disableFuture={false}
                    sx={{
                      width: '320px',
                      height: 'auto',
                      '.MuiPickersCalendarHeader-root': {
                        paddingTop: '12px',
                        paddingBottom: '8px',
                        paddingLeft: '16px',
                        paddingRight: '16px',
                      },
                      '.MuiDayCalendar-weekDayLabel': {
                        fontWeight: 500,
                        color: '#666666',
                        fontSize: '0.75rem',
                      },
                      '.MuiPickersDay-root': {
                        fontSize: '0.875rem',
                        '&:hover': {
                          backgroundColor: '#e8f4fd',
                        },
                        '&.Mui-selected': {
                          backgroundColor: '#0084D1 !important',
                          color: '#ffffff',
                          '&:hover': {
                            backgroundColor: '#0073b8 !important',
                          },
                        },
                      },
                      '.MuiPickersDay-root.Mui-selected:focus': {
                        backgroundColor: '#0084D1 !important',
                      },
                      '.MuiPickersDay-today': {
                        border: '1px solid #0084D1',
                        fontWeight: 600,
                      },
                      '.MuiPickersArrowSwitcher-button': {
                        color: '#555555',
                        '&:hover': {
                          backgroundColor: '#f0f0f0',
                        },
                      },
                      '.MuiPickersCalendarHeader-label': {
                        fontSize: '0.9rem',
                        fontWeight: 600,
                        color: '#222222',
                      },
                      '.MuiTypography-caption': {
                        color: '#888888',
                      },
                    }}
                  />
                </Box>
              </LocalizationProvider>
            </ThemeProvider>

            <div className="flex justify-end gap-2 mt-3 px-2">
              <button
                onClick={handleCalendarClose}
                className="px-4 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCalendarClose}
                className="px-4 py-1.5 text-sm font-medium bg-[#0084D1] text-white rounded-lg hover:bg-[#0073b8] transition shadow-sm"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add animation styles */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        
        /* Calendar white theme overrides */
        .MuiPickersDay-root {
          color: #222222 !important;
        }
      `}</style>
    </div>
  );
};

export default CreateUser;