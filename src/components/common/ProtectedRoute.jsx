import React from 'react';
import { Navigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Logo from './Logo';

export default function ProtectedRoute({ children, allowedRoles }) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white">
        <Logo theme="light" size="large" />
        <div className="mt-8 flex items-center gap-3">
          <div className="w-6 h-6 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-sm text-slate-300 font-medium">Verifying session...</span>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    const portalHome = user?.role === 'Admin' ? '/dashboard' : '/customer/home';
    const portalLabel = user?.role === 'Admin' ? 'Back to Admin Dashboard' : 'Go to Customer Portal';
    return (
      <div className="min-h-screen bg-[#FFF8F0] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl text-center border border-slate-100">
          <div className="w-16 h-16 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-4 text-2xl font-bold">
            !
          </div>
          <h2 className="text-xl font-bold text-[#202A24] mb-2">Access Restricted</h2>
          <p className="text-sm text-slate-500 mb-6">
            Your current role (<span className="font-semibold text-slate-700">{user?.role}</span>) does not have permission to access this portal.
          </p>
          <Link
            to={portalHome}
            className="inline-block px-6 py-2.5 bg-[#FF6B35] hover:bg-[#e85a25] text-white font-semibold rounded-xl text-sm transition-colors"
          >
            {portalLabel}
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
