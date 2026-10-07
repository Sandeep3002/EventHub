import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import { Ticket, Calendar, Sparkles, Bell, Eye, EyeOff } from 'lucide-react';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [loading, setLoading] = useState(false);

  const redirectTarget = location.state?.from;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // 1. Submit Email + Password to FastAPI Backend (checks MongoDB user record)
      const data = await login(email, password);
      const userRole = data?.user?.role || 'attendee';

      // 2. Flow Redirection: If user was redirected from a protected route, go back there
      if (redirectTarget) {
        navigate(redirectTarget, { replace: true });
        return;
      }

      // 3. Role-Based Branching Redirection
      if (userRole === 'superadmin') {
        navigate('/superadmin', { replace: true });
      } else if (userRole === 'admin' || userRole === 'organizer') {
        navigate('/admin', { replace: true });
      } else {
        navigate('/customer', { replace: true });
      }

    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (role) => {
    if (role === 'superadmin') {
      setEmail('superadmin@eventhub.com');
      setPassword('demo1234');
    } else if (role === 'admin') {
      setEmail('admin@eventhub.com');
      setPassword('demo1234');
    } else {
      setEmail('john@example.com');
      setPassword('demo1234');
    }
  };

  return (
    <div className="app-container py-12 flex items-center justify-center min-h-[80vh]">
      
      {/* 2-Column Split Card */}
      <div className="w-full max-w-4xl bg-white border border-slate-200 rounded-2xl shadow-xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        
        {/* Left Hero Panel */}
        <div className="relative bg-slate-900 text-white p-8 sm:p-10 flex flex-col justify-between overflow-hidden">
          {/* Background concert photo with dark overlay */}
          <div className="absolute inset-0 z-0">
            <img
              src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=800&q=80"
              alt="Background"
              className="w-full h-full object-cover opacity-25"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/80 to-purple-950/60" />
          </div>

          {/* Logo Top Left */}
          <div className="relative z-10 flex items-center gap-2 font-extrabold text-xl text-white">
            <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center text-white font-bold text-sm">
              E
            </div>
            <span>EventHub</span>
          </div>

          {/* Center Content */}
          <div className="relative z-10 my-8 space-y-6">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Welcome Back</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Login to your account and continue your event journey.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3.5 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <span>Access your bookings</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Manage your events</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <span>Get personalized recommendations</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span>Stay updated</span>
              </div>
            </div>
          </div>

          {/* Footer space */}
          <div className="relative z-10 text-[11px] text-slate-400">
            © 2026 EventHub Inc. All rights reserved.
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="p-8 sm:p-10 flex flex-col justify-center space-y-6 bg-white">
          <div className="text-center space-y-1">
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Login to Your Account</h2>
            {redirectTarget && (
              <p className="text-xs text-blue-600 font-semibold bg-blue-50 py-1.5 px-3 rounded-lg border border-blue-100">
                Please log in to access this page
              </p>
            )}
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          {/* Quick Demo Autofill Bar */}
          <div className="flex items-center justify-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 text-[11px]">
            <span className="text-slate-500 font-medium">Quick Demo Fill:</span>
            <button
              type="button"
              onClick={() => handleQuickFill('organizer')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-purple-700 font-semibold hover:border-purple-500"
            >
              Organizer
            </button>
            <button
              type="button"
              onClick={() => handleQuickFill('admin')}
              className="px-2 py-1 bg-white border border-slate-200 rounded text-emerald-700 font-semibold hover:border-emerald-500"
            >
              Admin
            </button>
          </div>

          {forgotMsg && (
            <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold text-center">
              {forgotMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="form-group mb-0">
              <label className="form-label text-xs">Email Address</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label text-xs">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="form-input text-xs pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password Row */}
            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 cursor-pointer text-slate-600">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="accent-indigo-600 rounded"
                />
                <span>Remember me</span>
              </label>

              <button type="button" onClick={async () => {
                if (!email) { setError('Please enter your email address first.'); return; }
                setError(''); setForgotMsg('');
                try {
                  await authService.forgotPassword(email);
                  setForgotMsg('A password reset link has been sent to your email.');
                  setTimeout(() => setForgotMsg(''), 6000);
                } catch (err) {
                  setForgotMsg('A password reset link has been sent to your email.');
                  setTimeout(() => setForgotMsg(''), 6000);
                }
              }} className="font-semibold text-indigo-600 hover:underline">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-semibold mt-4"
              style={{ backgroundColor: '#6366F1' }}
            >
              {loading ? 'Authenticating with FastAPI & MongoDB...' : 'Login'}
            </button>

          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:underline">
              Sign up
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
