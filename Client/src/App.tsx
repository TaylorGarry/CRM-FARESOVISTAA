import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from "./contexts/AuthContext.tsx";
import ProtectedRoute from "./Components/common/ProtectedRoute.tsx";
import Header from "./Components/Header.tsx";
import Sidebar from "./Components/Sidebar.tsx";
import Login from "./Components/Login.tsx";
import ForgotPassword from "./Components/ForgotPassword.tsx";
import ForgotPasswordSuccess from "./Components/ForgotPasswordSuccess.tsx";
import ForgotPasswordError from "./Components/ForgotPasswordError.tsx";
import ResetPassword from "./Components/ResetPassword.tsx";
import ChangePassword from "./Components/ChangePassword.tsx";
import Dashboard from "./Components/dashboard/Dashboard.tsx";
import CreateUser from "./Components/userAccessManager/CreateUser.tsx";
import CreateRole from "./Components/userAccessManager/CreateRole.tsx";
import RolePermission from "./Components/userAccessManager/RolePermission.tsx";
import PermissionRoute from "./Components/common/PermissionRoute.tsx";
import AdminRoute from "./Components/common/AdminRoute.tsx";
import { BookingTypes } from './Components/MangeMasters/BookingTypes.tsx';
import { Currencies } from './Components/MangeMasters/Currencies.tsx';
import { Sources } from './Components/MangeMasters/Sources.tsx';
import { CardTypes } from './Components/MangeMasters/CardTypes.tsx';
import { EmailTemplates } from './Components/MangeMasters/EmailTemplates.tsx';
import { SaleTypes } from './Components/MangeMasters/SaleTypes.tsx';
import { AssignBookingStatusPage } from './Components/MangeMasters/AssignBookingStatus.tsx';


const App: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/forgot-password-success" element={<ForgotPasswordSuccess />} />
          <Route path="/forgot-password-error" element={<ForgotPasswordError />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Protected routes */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="min-h-screen bg-slate-50">
                  <Header
                    isSidebarOpen={isSidebarOpen}
                    setIsSidebarOpen={setIsSidebarOpen}
                  />
                  <Sidebar isOpen={isSidebarOpen} />
                  <main
                    className={`transition-all duration-300 ${isSidebarOpen ? 'ml-64' : 'ml-20'
                      } min-h-screen px-4 py-6 pt-16 lg:px-8 bg-slate-50`}
                  >
                    <Routes>
                      <Route path="/dashboard" element={<PermissionRoute><Dashboard /></PermissionRoute>} />
                      <Route path="/change-password" element={<AdminRoute><ChangePassword /></AdminRoute>} />
                      {/* Use exact paths for each route */}
                      <Route path="/user-access/create-user" element={<PermissionRoute><CreateUser /></PermissionRoute>} />
                      <Route path="/user-access/create-role" element={<PermissionRoute><CreateRole /></PermissionRoute>} />
                      <Route path="/user-access/role-permission" element={<PermissionRoute><RolePermission /></PermissionRoute>} />
                      <Route path="/users/create" element={<PermissionRoute><CreateUser /></PermissionRoute>} />
                      <Route path="/users/roles" element={<PermissionRoute><CreateRole /></PermissionRoute>} />
                      <Route path="/users/permissions" element={<PermissionRoute><RolePermission /></PermissionRoute>} />
                      <Route path="/master/booking-types" element={<BookingTypes />} />
                      <Route path="/master/currencies" element={<Currencies />} />
                      <Route path="/master/sources" element={<Sources />} />
                      <Route path="/master/card-types" element={<CardTypes />} />
                      <Route path="/master/email-templates" element={<EmailTemplates />} />
                      <Route path="/master/sale-types" element={<SaleTypes />} />
                      <Route path="/master/assign-booking-status" element={<AssignBookingStatusPage />} />
                      <Route path="/" element={<Navigate to="/dashboard" replace />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
};

export default App;
