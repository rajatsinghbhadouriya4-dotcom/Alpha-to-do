import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { authAPI } from '../../lib/api';
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ShieldAlert,
  ArrowRight,
  Ambulance,
  KeyRound,
  ShieldCheck
} from 'lucide-react';

export default function SignInPage() {
  const { navigate, setAuthUser } = useApp();

  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [deactivatedMsg, setDeactivatedMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errorMsg) setErrorMsg('');
    if (deactivatedMsg) setDeactivatedMsg('');
  }

  // Helper to fill demo credentials
  function fillCredentials(email, password) {
    setFormData({ email, password });
    setErrorMsg('');
    setDeactivatedMsg('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setErrorMsg('');
    setDeactivatedMsg('');
    setSuccessMsg('');

    if (!formData.email.trim()) {
      setErrorMsg('Please enter your registered email address.');
      return;
    }

    if (!formData.password) {
      setErrorMsg('Please enter your password.');
      return;
    }

    setLoading(true);

    try {
      const data = await authAPI.login(formData);

      // Successful Authentication
      if (data.user) {
        setAuthUser(data.user);
      }

      const role = data.user?.role;
      const destination = role === 'admin' ? 'Admin Dashboard' : 'User Dashboard';
      setSuccessMsg(`Welcome back, ${data.user?.full_name}! Redirecting to ${destination}...`);

      setTimeout(() => {
        if (role === 'admin') {
          navigate('admin');
        } else {
          navigate('user-dashboard');
        }
      }, 1000);
    } catch (err) {
      console.error('Sign in error:', err);
      if (err.code === 'ACCOUNT_DEACTIVATED' || err.status === 403) {
        setDeactivatedMsg(err.message || 'Your account has been deactivated. Please contact support.');
      } else {
        setErrorMsg(err.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[85vh] flex items-center justify-center py-10 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-slate-50 via-slate-100 to-slate-50">
      <div className="max-w-md w-full space-y-6 bg-white p-8 rounded-2xl shadow-xl shadow-slate-200/60 border border-slate-200">
        
        {/* Brand Icon & Heading */}
        <div className="text-center">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 shadow-md shadow-red-500/30 text-white mb-3">
            <Ambulance className="h-7 w-7" />
          </div>
          <h2 className="text-2xl font-black tracking-tight text-slate-900">
            Sign In to EmergencyCare
          </h2>
          <p className="mt-1 text-xs text-slate-500">
            Access real-time bed tracking, emergency dispatch, and administrative controls.
          </p>
        </div>

        {/* Account Deactivated Warning Alert */}
        {deactivatedMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 animate-in fade-in">
            <AlertTriangle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-amber-950">Account Deactivated</div>
              <div className="mt-0.5 leading-relaxed">{deactivatedMsg}</div>
            </div>
          </div>
        )}

        {/* General Error Alert */}
        {errorMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-red-600 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{errorMsg}</span>
          </div>
        )}

        {/* Success Alert */}
        {successMsg && (
          <div className="flex items-start gap-2.5 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 animate-in fade-in">
            <CheckCircle className="h-4 w-4 text-emerald-600 flex-shrink-0 mt-0.5" />
            <span className="leading-snug">{successMsg}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form className="space-y-4" onSubmit={handleSubmit}>
          {/* Email Address */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Email Address
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Mail className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="admin@emergencycare.app or user@emergencycare.app"
                required
                className="w-full rounded-xl border border-slate-300 pl-10 pr-3 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                <Lock className="h-4 w-4 text-slate-400" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter password"
                required
                className="w-full rounded-xl border border-slate-300 pl-10 pr-10 py-2.5 text-xs text-slate-800 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 py-3 text-xs font-bold text-white shadow-md shadow-red-600/30 hover:brightness-105 active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Verifying Credentials...</span>
              </>
            ) : (
              <>
                <span>Sign In</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Credentials Section */}
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 space-y-2">
          <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700">
            <KeyRound className="h-3.5 w-3.5 text-red-600" />
            <span>Quick Fill Test Credentials</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => fillCredentials('admin@emergencycare.app', 'Admin@123')}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-white border border-purple-200 text-purple-800 hover:bg-purple-50 transition-colors shadow-sm text-center"
            >
              👑 Admin (Admin@123)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('user@emergencycare.app', 'User@123')}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-white border border-blue-200 text-blue-800 hover:bg-blue-50 transition-colors shadow-sm text-center"
            >
              👤 User (User@123)
            </button>
            <button
              type="button"
              onClick={() => fillCredentials('inactive@emergencycare.app', 'User@123')}
              className="px-2.5 py-1.5 text-[11px] font-semibold rounded-lg bg-white border border-amber-200 text-amber-800 hover:bg-amber-50 transition-colors shadow-sm text-center"
            >
              🚫 Inactive Test
            </button>
          </div>
        </div>

        {/* Link: Don't have an account? Sign Up */}
        <div className="text-center pt-2 border-t border-slate-100">
          <p className="text-xs text-slate-600">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('signup')}
              className="font-bold text-red-600 hover:text-red-700 hover:underline transition-colors"
            >
              Sign Up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
}
