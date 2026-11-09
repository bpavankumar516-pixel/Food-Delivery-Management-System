import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { RestaurantProvider } from './context/RestaurantContext';
import { DashboardProvider } from './context/DashboardContext';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import RestaurantsPage from './pages/RestaurantsPage';
import RestaurantDetailsPage from './pages/RestaurantDetailsPage';
import MenuManagementPage from './pages/MenuManagementPage';
import MenuItemDetailsPage from './pages/MenuItemDetailsPage';
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
          <BrowserRouter>
            <Routes>
              {/* Default Route */}
              <Route path="/" element={<RootRedirect />} />

              {/* Authentication Routes (Module 1) */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />

              {/* Protected Application Routes */}
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
        </DashboardProvider>
      </RestaurantProvider>
    </AuthProvider>
  );
}
