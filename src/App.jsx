import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { OrderProvider } from './context/OrderContext';
import { CustomerProvider } from './context/CustomerContext';
import { CouponProvider } from './context/CouponContext';
import { NotificationSupportProvider } from './context/NotificationSupportContext';
import { SettingsProvider } from './context/SettingsContext';
import { DashboardProvider } from './context/DashboardContext';

import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import MenuItemDetailsPage from './pages/MenuItemDetailsPage';
import OrdersPage from './pages/OrdersPage';
import CustomersPage from './pages/CustomersPage';
import CouponsPage from './pages/CouponsPage';
import ReportsPage from './pages/ReportsPage';
import SettingsPage from './pages/SettingsPage';
import ProfilePage from './pages/ProfilePage';
import ProtectedRoute from './components/common/ProtectedRoute';

function RootRedirect() {
  const { isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  return isAuthenticated ? <Navigate to="/dashboard" replace /> : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <DashboardProvider>
          <OrderProvider>
            <CustomerProvider>
              <CouponProvider>
                <NotificationSupportProvider>
                  <SettingsProvider>
                    <BrowserRouter>
                      <Routes>
                        {/* Default Route */}
                        <Route path="/" element={<RootRedirect />} />

                        {/* Authentication Routes (Module 1) */}
                        <Route path="/login" element={<LoginPage />} />
                        <Route path="/register" element={<RegisterPage />} />

                        {/* Preserved Core Modules */}
                        <Route
                          path="/dashboard"
                          element={
                            <ProtectedRoute>
                              <DashboardPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/restaurants"
                          element={
                            <ProtectedRoute>
                              <RestaurantsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/restaurants/:id"
                          element={
                            <ProtectedRoute>
                              <RestaurantDetailsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/menu"
                          element={
                            <ProtectedRoute>
                              <MenuManagementPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/menu/:id"
                          element={
                            <ProtectedRoute>
                              <MenuItemDetailsPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Module 4: Order Management */}
                        <Route
                          path="/orders"
                          element={
                            <ProtectedRoute>
                              <OrdersPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Module 5: Customer Management */}
                        <Route
                          path="/customers"
                          element={
                            <ProtectedRoute>
                              <CustomersPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Module 6: Coupons & Offers */}
                        <Route
                          path="/coupons"
                          element={
                            <ProtectedRoute>
                              <CouponsPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Module 7: Reports & Analytics */}
                        <Route
                          path="/reports"
                          element={
                            <ProtectedRoute>
                              <ReportsPage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Module 9: Admin Settings */}
                        <Route
                          path="/settings"
                          element={
                            <ProtectedRoute>
                              <SettingsPage />
                            </ProtectedRoute>
                          }
                        />
                        <Route
                          path="/profile"
                          element={
                            <ProtectedRoute>
                              <ProfilePage />
                            </ProtectedRoute>
                          }
                        />

                        {/* Fallback */}
                        <Route path="*" element={<RootRedirect />} />
                      </Routes>

                      {/* Global Toast Notifications */}
                      <ToastContainer
                        position="top-right"
                        autoClose={3500}
                        hideProgressBar={false}
                        newestOnTop
                        closeOnClick
                        rtl={false}
                        pauseOnFocusLoss
                        draggable
                        pauseOnHover
                        theme="colored"
                      />
                    </BrowserRouter>
                  </SettingsProvider>
                </NotificationSupportProvider>
              </CouponProvider>
            </CustomerProvider>
          </OrderProvider>
        </DashboardProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}
