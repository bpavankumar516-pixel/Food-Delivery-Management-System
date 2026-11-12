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
import { CustomerPortalProvider } from './context/CustomerPortalContext';

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

// Customer Portal Pages
import CustomerHomePage from './pages/customer/CustomerHomePage';
import CustomerRestaurantsPage from './pages/customer/CustomerRestaurantsPage';
import CustomerRestaurantDetailsPage from './pages/customer/CustomerRestaurantDetailsPage';
import CustomerSearchPage from './pages/customer/CustomerSearchPage';
import CustomerCartPage from './pages/customer/CustomerCartPage';
import CustomerCheckoutPage from './pages/customer/CustomerCheckoutPage';
import CustomerOrdersPage from './pages/customer/CustomerOrdersPage';
import CustomerTrackingPage from './pages/customer/CustomerTrackingPage';
import CustomerFavoritesPage from './pages/customer/CustomerFavoritesPage';
import CustomerOffersPage from './pages/customer/CustomerOffersPage';
import CustomerAddressesPage from './pages/customer/CustomerAddressesPage';
import CustomerProfilePage from './pages/customer/CustomerProfilePage';
import CustomerNotificationsPage from './pages/customer/CustomerNotificationsPage';
import CustomerSupportPage from './pages/customer/CustomerSupportPage';
import CustomerSettingsPage from './pages/customer/CustomerSettingsPage';

import ProtectedRoute from './components/common/ProtectedRoute';

function RootRedirect() {
  const { user, isAuthenticated, isLoading } = useAuth();
  if (isLoading) return null;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return user?.role === 'Admin' ? (
    <Navigate to="/dashboard" replace />
  ) : (
    <Navigate to="/customer/home" replace />
  );
}

export default function App() {
  return (
    <AuthProvider>
      <RestaurantProvider>
        <CouponProvider>
          <CustomerProvider>
            <OrderProvider>
              <DashboardProvider>
                <NotificationSupportProvider>
                  <SettingsProvider>
                    <CustomerPortalProvider>
                      <BrowserRouter>
                        <Routes>
                          {/* Default Route */}
                          <Route path="/" element={<RootRedirect />} />

                          {/* Authentication Routes */}
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />

                          {/* ================= ADMIN PORTAL ROUTES ================= */}
                          <Route
                            path="/dashboard"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <DashboardPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/restaurants"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <RestaurantsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/restaurants/:id"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <RestaurantDetailsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/menu"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <MenuManagementPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/menu/:id"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <MenuItemDetailsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/orders"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <OrdersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customers"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <CustomersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/coupons"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <CouponsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/reports"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <ReportsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/settings"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <SettingsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/profile"
                            element={
                              <ProtectedRoute allowedRoles={['Admin']}>
                                <ProfilePage />
                              </ProtectedRoute>
                            }
                          />

                          {/* ================= CUSTOMER PORTAL ROUTES ================= */}
                          <Route
                            path="/customer"
                            element={<Navigate to="/customer/home" replace />}
                          />
                          <Route
                            path="/customer/home"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerHomePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/restaurants"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerRestaurantsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/restaurants/:id"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerRestaurantDetailsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/search"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerSearchPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/cart"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerCartPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/checkout"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerCheckoutPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/orders"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerOrdersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/tracking"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerTrackingPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/tracking/:orderId"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerTrackingPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/favorites"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerFavoritesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/offers"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerOffersPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/addresses"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerAddressesPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/profile"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerProfilePage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/notifications"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerNotificationsPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/support"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerSupportPage />
                              </ProtectedRoute>
                            }
                          />
                          <Route
                            path="/customer/settings"
                            element={
                              <ProtectedRoute allowedRoles={['Customer']}>
                                <CustomerSettingsPage />
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
                    </CustomerPortalProvider>
                  </SettingsProvider>
                </NotificationSupportProvider>
              </DashboardProvider>
            </OrderProvider>
          </CustomerProvider>
        </CouponProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}
