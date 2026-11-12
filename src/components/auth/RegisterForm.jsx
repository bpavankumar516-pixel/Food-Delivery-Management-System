import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import {
  User,
  Mail,
  Lock,
  Phone,
  Eye,
  EyeOff,
  Headphones,
  ArrowRight,
  UserCheck,
  Users,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useAuth } from '../../context/AuthContext';
import Logo from '../common/Logo';
import LanguageDropdown from './LanguageDropdown';
import HelpModal from './HelpModal';

export default function RegisterForm() {
  const navigate = useNavigate();
  const { register: registerUser, loginWithGoogle } = useAuth();

  const [selectedRole, setSelectedRole] = useState('Customer');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      password: '',
      confirmPassword: '',
      agreeTerms: true,
    },
  });

  const passwordValue = watch('password');

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const newUser = await registerUser({
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        role: selectedRole,
      });

      toast.success(
        `Account created successfully! Welcome to Foodix, ${newUser.name}.`
      );
      navigate(newUser.role === 'Admin' ? '/dashboard' : '/customer/home');
    } catch (error) {
      toast.error(error.message || 'Registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      setIsSubmitting(true);
      const user = await loginWithGoogle(selectedRole);
      toast.success(`Google sign up successful! Welcome, ${user.name}.`);
      navigate(user.role === 'Admin' ? '/dashboard' : '/customer/home');
    } catch {
      toast.error('Google registration failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full flex justify-center items-center py-2 sm:py-3 lg:py-4 px-3 sm:px-5 relative z-10">
      {/* Floating White Card (Optimized for 100vh) */}
      <div className="w-full max-w-[470px] bg-white rounded-[28px] sm:rounded-[32px] shadow-2xl shadow-slate-900/10 border border-slate-100 p-5 sm:p-6 lg:p-7 relative overflow-hidden backdrop-blur-xs">
        
        {/* Top Header Utilities */}
        <div className="flex items-center justify-end gap-3 mb-2 select-none">
          <button
            type="button"
            onClick={() => setIsHelpOpen(true)}
            className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors px-2 py-1 rounded-lg hover:bg-slate-50 cursor-pointer"
          >
            <Headphones className="w-3.5 h-3.5 text-slate-400" />
            <span>Need Help?</span>
          </button>

          <div className="h-3 w-[1px] bg-slate-200" />

          <LanguageDropdown />
        </div>

        {/* Brand Logo */}
        <div className="flex flex-col items-center mb-2.5">
          <Logo theme="dark" size="normal" showSubtitle={true} className="flex-col items-center text-center gap-1" />
        </div>

        {/* Headings */}
        <div className="text-center mb-3">
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight leading-tight">
            Create Account
          </h2>
          <p className="text-xs text-slate-500 font-normal">
            Join Foodix and manage meals, orders & menus
          </p>
        </div>

        {/* Role Selector Tabs (Admin | Customer) */}
        <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100/90 rounded-2xl mb-3 border border-slate-200/60 select-none">
          {[
            { id: 'Admin', label: 'Admin Portal', icon: UserCheck },
            { id: 'Customer', label: 'Customer Portal', icon: Users },
          ].map((tab) => {
            const Icon = tab.icon;
            const isSelected = selectedRole === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedRole(tab.id)}
                className={`flex items-center justify-center gap-1 py-1.5 px-1 rounded-xl text-[11px] font-bold transition-all duration-200 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0e4d3a] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="truncate">{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Registration Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-2">
          {/* Full Name */}
          <div>
            <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
              Full Name
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="w-3.5 h-3.5" />
              </div>
              <input
                type="text"
                {...register('name', {
                  required: 'Full name is required',
                  minLength: { value: 3, message: 'Min 3 chars' },
                })}
                placeholder="John Doe"
                className={`w-full pl-9 pr-3 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                  errors.name
                    ? 'border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                    : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a]'
                }`}
              />
            </div>
            {errors.name && (
              <p className="text-[10px] text-rose-500 font-medium">{errors.name.message}</p>
            )}
          </div>

          {/* Email & Phone Grid */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-3.5 h-3.5" />
                </div>
                <input
                  type="email"
                  {...register('email', {
                    required: 'Email required',
                    pattern: {
                      value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                      message: 'Invalid email',
                    },
                  })}
                  placeholder="name@foodix.com"
                  className={`w-full pl-9 pr-2 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.email
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a]'
                  }`}
                />
              </div>
              {errors.email && (
                <p className="text-[10px] text-rose-500 font-medium">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Phone Number
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Phone className="w-3.5 h-3.5" />
                </div>
                <input
                  type="tel"
                  {...register('phone', {
                    required: 'Phone required',
                    pattern: {
                      value: /^[0-9+()-\s]{7,15}$/,
                      message: 'Valid phone required',
                    },
                  })}
                  placeholder="+1 555-0192"
                  className={`w-full pl-9 pr-2 py-1.5 sm:py-2 bg-white border rounded-xl text-xs sm:text-sm text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.phone
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a]'
                  }`}
                />
              </div>
              {errors.phone && (
                <p className="text-[10px] text-rose-500 font-medium">{errors.phone.message}</p>
              )}
            </div>
          </div>

          {/* Password Fields Grid */}
          <div className="grid grid-cols-2 gap-2">
            {/* Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  {...register('password', {
                    required: 'Password required',
                    minLength: { value: 6, message: 'Min 6 chars' },
                  })}
                  placeholder="Min 6 chars"
                  className={`w-full pl-8 pr-7 py-1.5 sm:py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.password
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-[10px] text-rose-500 font-medium">{errors.password.message}</p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-[11px] font-bold text-slate-700 mb-0.5">
                Confirm
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-3.5 h-3.5" />
                </div>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  {...register('confirmPassword', {
                    required: 'Confirm password',
                    validate: (value) =>
                      value === passwordValue || 'Passwords do not match',
                  })}
                  placeholder="Repeat"
                  className={`w-full pl-8 pr-7 py-1.5 sm:py-2 bg-white border rounded-xl text-xs text-slate-900 placeholder-slate-400 focus:outline-none transition-all ${
                    errors.confirmPassword
                      ? 'border-rose-400 focus:ring-1 focus:ring-rose-400/20'
                      : 'border-slate-200 hover:border-slate-300 focus:border-[#0e4d3a]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-2 flex items-center text-slate-400 hover:text-slate-600"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                </button>
              </div>
              {errors.confirmPassword && (
                <p className="text-[10px] text-rose-500 font-medium">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
          </div>

          {/* Agree Terms Checkbox */}
          <div className="pt-0.5">
            <label className="flex items-center gap-1.5 cursor-pointer text-[11px] text-slate-600 select-none">
              <input
                type="checkbox"
                {...register('agreeTerms', {
                  required: 'You must agree to Terms & Privacy Policy',
                })}
                className="w-3.5 h-3.5 text-orange-500 border-slate-300 rounded focus:ring-orange-400 cursor-pointer accent-orange-500"
              />
              <span>
                I agree to the Foodix{' '}
                <a href="#terms" className="text-[#0e7054] font-semibold hover:underline">
                  Terms
                </a>{' '}
                &{' '}
                <a href="#privacy" className="text-[#0e7054] font-semibold hover:underline">
                  Privacy Policy
                </a>
              </span>
            </label>
            {errors.agreeTerms && (
              <p className="text-[10px] text-rose-500 font-medium">
                {errors.agreeTerms.message}
              </p>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-6 rounded-xl font-bold text-white text-xs sm:text-sm bg-gradient-to-r from-[#ff6022] to-[#ff7a3d] hover:from-[#f35212] hover:to-[#ff6826] shadow-md shadow-orange-500/25 hover:shadow-orange-500/35 active:scale-[0.99] transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer disabled:opacity-75 disabled:cursor-not-allowed mt-1"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Create Account</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="relative my-2.5 select-none">
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
          onClick={handleGoogleRegister}
          disabled={isSubmitting}
          className="w-full py-2 px-4 rounded-xl border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/80 text-xs font-semibold text-slate-700 transition-all shadow-2xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
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
          <span>Sign up with Google</span>
        </button>

        {/* Footer */}
        <div className="mt-3 text-center text-xs text-slate-500 select-none">
          <span>Already have an account? </span>
          <Link
            to="/login"
            className="font-bold text-[#0e7054] hover:text-[#094d3a] hover:underline transition-colors"
          >
            Sign in here
          </Link>
        </div>

        {/* Subtle Decorative Mint Scooter Sketch */}
        <div className="absolute -bottom-3 -right-3 w-28 h-28 text-emerald-600/10 pointer-events-none z-0">
          <svg viewBox="0 0 200 200" fill="currentColor" className="w-full h-full">
            <path d="M40,140 A20,20 0 1,0 80,140 A20,20 0 1,0 40,140 M140,140 A20,20 0 1,0 180,140 A20,20 0 1,0 140,140 M80,130 L110,130 L130,90 L95,90 Z M130,90 L145,50 L165,50 M110,60 A12,12 0 1,1 110,36 A12,12 0 1,1 110,60" />
          </svg>
        </div>
      </div>

      <HelpModal isOpen={isHelpOpen} onClose={() => setIsHelpOpen(false)} />
    </div>
  );
}
