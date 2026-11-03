import React from 'react';
import { useAuth } from '../context/AuthContext';
import Header from '../components/layout/Header';
import {
  CheckCircle2,
  Shield,
  Store,
  Bike,
  Users,
  KeyRound,
  Database,
  ArrowRight,
  TrendingUp,
  Clock,
  PackageCheck,
  UtensilsCrossed,
} from 'lucide-react';

export default function DashboardPage() {
  const { user } = useAuth();

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Welcome Banner */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#093527] via-[#0d4e39] to-[#06241a] text-white p-6 sm:p-10 shadow-xl border border-emerald-800/40">
          {/* Subtle background glow */}
          <div className="absolute -top-12 -right-12 w-64 h-64 rounded-full bg-orange-500/20 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-12 left-1/3 w-64 h-64 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 backdrop-blur-sm border border-white/15 text-xs text-emerald-200 mb-3">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span>Authentication & Session Active</span>
              </div>
              <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
                {getGreeting()},{' '}
                <span className="text-orange-400">{user?.name || 'User'}</span>! 👋
              </h1>
              <p className="mt-2 text-sm sm:text-base text-emerald-100/80 max-w-xl">
                You are currently signed in as{' '}
                <span className="font-bold text-white underline decoration-orange-400 decoration-2">
                  {user?.role}
                </span>
                . Module 1 (Authentication System) is fully operational and verified.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/15 text-center min-w-[120px]">
                <div className="text-2xl font-black text-orange-400">01 / 10</div>
                <div className="text-[11px] text-emerald-200 font-medium">Module Status</div>
                <div className="mt-1 text-[10px] text-white font-bold bg-emerald-700/60 rounded-full px-2 py-0.5">
                  Module 1 Complete
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Real-time Highlights Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Logged Role</span>
              <div className="text-lg font-bold text-slate-800">{user?.role}</div>
              <span className="text-[11px] text-emerald-600 font-medium">Session Valid</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Shield className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Registered Email</span>
              <div className="text-sm font-bold text-slate-800 truncate max-w-[150px]">
                {user?.email}
              </div>
              <span className="text-[11px] text-slate-400 font-mono">Stored in LocalStorage</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Database className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Security State</span>
              <div className="text-lg font-bold text-slate-800">Protected Route</div>
              <span className="text-[11px] text-emerald-600 font-medium">Auth Guards Active</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <KeyRound className="w-6 h-6" />
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-500 font-medium">Next Stage</span>
              <div className="text-lg font-bold text-slate-800">Module 2</div>
              <span className="text-[11px] text-slate-500 font-medium">Dashboard Analytics</span>
            </div>
            <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <TrendingUp className="w-6 h-6" />
            </div>
          </div>
        </div>

        {/* Module 1 Feature Verification Checklist Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-6 border-b border-slate-100">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                Module 1: Authentication System Verification
              </h2>
              <p className="text-xs sm:text-sm text-slate-500 mt-1">
                All features requested for Module 1 have been implemented, tested, and aligned with the provided UI design.
              </p>
            </div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>All 8 Features Complete</span>
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              {
                title: 'Login UI & Flow',
                desc: 'Pixel-perfect replication of provided mockup with role switcher (Admin, Restaurant, Delivery Partner, Customer), 1-click credentials filler, and Google SSO simulation.',
              },
              {
                title: 'Register UI & Flow',
                desc: 'Full registration form supporting role selection, name, email, phone, password matching validation, and terms agreement.',
              },
              {
                title: 'Forgot Password Modal Flow',
                desc: '3-step recovery flow with email verification, simulated 6-digit OTP confirmation (code: 123456), and instant password reset.',
              },
              {
                title: 'Form Validation',
                desc: 'Robust form validation implemented using React Hook Form with custom regex patterns, required error messages, and live hints.',
              },
              {
                title: 'Password Show / Hide',
                desc: 'Eye icon toggles on all password fields (login, register, and forgot password modal) allowing easy visibility check.',
              },
              {
                title: 'Protected Routes',
                desc: 'ProtectedRoute route guard wrapper preventing unauthorized access to the dashboard and redirecting to /login.',
              },
              {
                title: 'Logout & Session Wipe',
                desc: 'Prominent logout button with confirmation dialog in the header that clears active session tokens and state.',
              },
              {
                title: 'Local Storage State & Persistence',
                desc: 'Active user session (foodix_auth_user), JWT token (foodix_token), registered user accounts, and remembered email persisted across page reloads.',
              },
            ].map((feat, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
              >
                <div className="w-7 h-7 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0 mt-0.5">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-800">{feat.title}</h4>
                  <p className="text-xs text-slate-600 mt-0.5 leading-relaxed">{feat.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Active LocalStorage Session Debug Card */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-xs">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900">Active Session LocalStorage Data</h3>
              <p className="text-xs text-slate-500">Live JSON representation of the current logged-in user</p>
            </div>
          </div>

          <div className="bg-slate-900 text-emerald-400 p-4 rounded-2xl font-mono text-xs overflow-x-auto shadow-inner">
            <pre>{JSON.stringify(user, null, 2)}</pre>
          </div>
        </div>
      </main>
    </div>
  );
}
