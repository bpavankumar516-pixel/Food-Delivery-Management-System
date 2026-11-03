import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Headphones,
  ArrowRight,
  UserCheck,
  Store,
  Bike,
  Users,
  Sparkles,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import LanguageDropdown from './LanguageDropdown';
import HelpModal from './HelpModal';
import ForgotPasswordModal from './ForgotPasswordModal';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login, loginWithGoogle, getDemoAccount } = useAuth();

  // 4 Roles: Admin | Restaurant | Delivery Partner | Customer
  const [selectedRole, setSelectedRole] = useState('Admin');
  const [showPassword, setShowPassword] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isForgotOpen, setIsForgotOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: '',
      password: '',
      rememberMe: true,
    },
  });

  const watchedEmail = watch('email');

  useEffect(() => {
    const rememberedEmail = localStorage.getItem('foodix_remember_email');
    const rememberedRole = localStorage.getItem('foodix_remember_role');

    if (rememberedEmail) {
      setValue('email', rememberedEmail);
      setValue('rememberMe', true);
    }
    if (rememberedRole) {
      setSelectedRole(rememberedRole);
    } else {
      // Default to Admin demo credentials for immediate testing
      const demo = getDemoAccount('Admin');
      if (demo) {
        setValue('email', demo.email);
        setValue('password', demo.password);
      }
    }
  }, [setValue]);

  const handleSelectRole = (role) => {
    setSelectedRole(role);
    const demo = getDemoAccount(role);
    if (demo) {
      setValue('email', demo.email);
      setValue('password', demo.password);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const user = await login({
        email: data.email,
        password: data.password,
        role: selectedRole,
        rememberMe: data.rememberMe,
      });

      toast.success(`Welcome back, ${user.name}! Logged in as ${user.role}.`);
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.message || 'Invalid email or password. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setIsSubmitting(true);
      const user = await loginWithGoogle(selectedRole);
      toast.success(`Google authentication successful! Welcome, ${user.name}.`);
      navigate('/dashboard');
    } catch {
      toast.error('Google login failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-1 sm:py-2 px-1 sm:px-2 relative z-10">
      {/* Floating White Card (Optimized for 30% width column & 100vh fit without scrollbar) */}
      <div className="w-full max-w-[415px] bg-white rounded-[24px] sm:rounded-[28px] shadow-2xl shadow-slate-900/10 border border-slate-100 p-4 sm:p-5 lg:p-4.5 xl:p-5 relative overflow-hidden backdrop-blur-xs">
        
        {/* Top Header Utilities inside Card */}
        <div className="flex items-center justify-end gap-2.5 mb-2 select-none">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-1.5 py-0.5 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Need Help?</span>
          </button>

          <div className="h-3 w-[1px] bg-slate-200" />

          <LanguageDropdown />
        </div>

        {/* Brand Logo (Centered) */}
        <div className="flex flex-col items-center mb-2">
          <Logo theme="dark" size="normal" showSubtitle={true} className="flex-col items-center text-center gap-1" />
        </div>

        {/* Headings */}
        <div className="text-center mb-2.5">
          <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Welcome Back!
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-normal">
            Sign in to your account to continue
          </p>
        </div>

        {/* 4 Role Selector Tabs: Admin | Restaurant | Delivery | Customer */}
        <div className="grid grid-cols-4 gap-1 p-1 bg-slate-100/90 rounded-2xl mb-2.5 border border-slate-200/60 select-none">
          {[
            { id: 'Admin', label: 'Admin', icon: UserCheck },
            { id: 'Restaurant', label: 'Restaurant', icon: Store },
            { id: 'Delivery Partner', label: 'Delivery', icon: Bike },
            { id: 'Customer', label: 'Customer', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedRole === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => handleSelectRole(tab.id)}
                className={`flex items-center justify-center gap-1 py-1.5 px-0.5 rounded-xl text-[10px] sm:text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e4d3a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3 h-3 shrink-0" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* 1-Click Demo Credentials Auto-Fill Pill */}
        <div className="mb-2.5 flex items-center justify-between px-2.5 py-1.5 bg-emerald-50/70 border border-emerald-200/70 rounded-xl text-xs">
          <div className="flex items-center gap-1.5 text-emerald-800">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="text-[10.5px] sm:text-[11px] font-medium truncate">
              Mode: <span className="font-bold">{selectedRole}</span> demo ready
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleSelectRole(selectedRole)}
            className="text-[10.5px] sm:text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline cursor-pointer shrink-0 ml-1"
          >
            Auto-fill
          </button>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-0.5">
              Email Address
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-3.5 h-3.5" />
              </div>
              <input
                type="email"
                {...register('email', {
                  required: 'Email address is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Please enter a valid email address',
                  },
                })}
                placeholder="Enter your email"
                className={`w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  errors.email
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a] focus:ring-2 focus:ring-[#0e4d3a]/15'
                }`}
              />
            </div>
            {errors.email && (
              <p className="mt-0.5 text-[10px] text-rose-500 font-medium">{errors.email.message}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-0.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-3.5 h-3.5" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                {...register('password', {
                  required: 'Password is required',
                  minLength: {
                    value: 6,
                    message: 'Password must be at least 6 characters',
                  },
                })}
                placeholder="Enter your password"
                className={`w-full pl-9 pr-10 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  errors.password
                    ? 'border-rose-400 focus:ring-2 focus:ring-rose-400/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a] focus:ring-2 focus:ring-[#0e4d3a]/15'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <EyeOff className="w-3.5 h-3.5 text-slate-500" />
                ) : (
                  <Eye className="w-3.5 h-3.5 text-slate-500" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="mt-0.5 text-[10px] text-rose-500 font-medium">{errors.password.message}</p>
            )}
          </div>

          {/* Remember me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5 select-none">
            <label className="flex items-center gap-1.5 cursor-pointer text-slate-600 hover:text-slate-800">
              <input
                type="checkbox"
                {...register('rememberMe')}
                className="w-3.5 h-3.5 text-orange-500 border-slate-300 rounded focus:ring-orange-400 cursor-pointer accent-orange-500"
              />
              <span className="font-medium text-[11px]">Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => setIsForgotOpen(true)}
              className="text-[11px] font-semibold text-[#0e7054] hover:text-[#094d3a] transition-colors cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Primary Submit Button (Login ->) */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2 sm:py-2.5 px-4 rounded-xl font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-[#ff6022] to-[#ff7a3d] hover:from-[#f35212] hover:to-[#ff6826] shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Login</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider "OR" */}
        <div className="relative my-2 sm:my-2.5 select-none">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200" />
          </div>
          <div className="relative flex justify-center text-[10px] uppercase tracking-wider">
            <span className="bg-white px-2.5 text-slate-400 font-semibold">OR</span>
          </div>
        </div>

        {/* Google SSO Button */}
        <button
          type="button"
          onClick={handleGoogleLogin}
          disabled={isSubmitting}
          className="w-full py-1.5 sm:py-2 px-3 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-xs font-semibold text-slate-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
            />
          </svg>
          <span>Continue with Google</span>
        </button>

        {/* Footer Link: Register */}
        <div className="mt-2.5 text-center text-xs text-slate-500 select-none">
          <span>Don't have an account? </span>
          <Link
            to="/register"
            className="font-bold text-[#0e7054] hover:text-[#094d3a] hover:underline transition-colors"
          >
            Register here
          </Link>
        </div>

        {/* Subtle Decorative Mint Scooter Sketch in Bottom-Right Corner of Card */}
        <div className="absolute -bottom-3 -right-3 w-28 h-28 text-emerald-600/10 pointer-events-none z-0">
          <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
            <path d="M40,140 A20,20 0 1,0 80,140 A20,20 0 1,0 40,140 M140,140 A20,20 0 1,0 180,140 A20,20 0 1,0 140,140 M80,130 L110,130 L130,90 L95,90 Z M130,90 L145,50 L165,50 M110,60 A12,12 0 1,1 110,36 A12,12 0 1,1 110,60" />
          </svg>
        </div>
      </div>

      {/* Modals */}
      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
      <ForgotPasswordModal
        isOpen={isForgotOpen}
        onClose={() => setIsForgotOpen(false)}
        initialEmail={watchedEmail}
      />
    </div>
  );
}
