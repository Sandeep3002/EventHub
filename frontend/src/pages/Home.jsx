import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  CalendarCheck, Mail, Lock, Eye, EyeOff, UserPlus, User,
  Users, ClipboardCheck, TrendingUp, ChevronDown
} from 'lucide-react';

export default function Home() {
  const { user, login, register } = useAuth();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [forgotMsg, setForgotMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Register form state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [regRole, setRegRole] = useState('attendee');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // If already logged in, redirect to dashboard
  React.useEffect(() => {
    if (user) {
      const role = user.role;
      if (role === 'superadmin') navigate('/superadmin', { replace: true });
      else if (role === 'admin' || role === 'organizer') navigate('/admin', { replace: true });
      else navigate('/customer', { replace: true });
    }
  }, [user, navigate]);

  const handleSignIn = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const data = await login(email, password);
      const userRole = data?.user?.role || 'attendee';
      if (userRole === 'superadmin') navigate('/superadmin', { replace: true });
      else if (userRole === 'admin' || userRole === 'organizer') navigate('/admin', { replace: true });
      else navigate('/customer', { replace: true });
    } catch (err) {
      setError(err.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    if (regPassword !== regConfirm) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await register(regName, regEmail, regPassword, regRole);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
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
    <div className="landing-page">

      {/* ─── LEFT PANEL: Branding ─── */}
      <div className="landing-left">
        <div className="landing-left-overlay" />
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
          alt="" className="landing-left-bg"
        />

        <div className="landing-left-content">
          {/* Logo */}
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h1 className="landing-logo-text">EventHub</h1>
            <p className="landing-logo-tagline">Plan &bull; Organize &bull; Experience</p>
            <div className="landing-divider" />
          </div>

          {/* Description */}
          <p className="landing-desc">
            A complete event management platform<br />
            for organizers and attendees.
          </p>

          {/* Feature Icons */}
          <div className="landing-features">
            <div className="landing-feature-item">
              <div className="landing-feature-icon">
                <Users className="w-6 h-6" />
              </div>
              <span>Create<br/>Events</span>
            </div>
            <div className="landing-feature-item">
              <div className="landing-feature-icon">
                <ClipboardCheck className="w-6 h-6" />
              </div>
              <span>Manage<br/>Registrations</span>
            </div>
            <div className="landing-feature-item">
              <div className="landing-feature-icon">
                <TrendingUp className="w-6 h-6" />
              </div>
              <span>Grow<br/>Your Community</span>
            </div>
          </div>
        </div>
      </div>

      {/* ─── RIGHT PANEL: Auth Form ─── */}
      <div className="landing-right">
        <div className="landing-form-card">
          <h2 className="text-2xl font-bold text-slate-900 text-center">Welcome to EventHub</h2>
          <p className="text-sm text-slate-500 text-center mb-6">
            Sign in to your account or create a new one<br />to get started.
          </p>

          {/* Tabs */}
          <div className="landing-tabs">
            <button
              className={`landing-tab ${activeTab === 'signin' ? 'landing-tab-active' : ''}`}
              onClick={() => { setActiveTab('signin'); setError(''); }}
            >
              Sign In
            </button>
            <button
              className={`landing-tab ${activeTab === 'register' ? 'landing-tab-active' : ''}`}
              onClick={() => { setActiveTab('register'); setError(''); }}
            >
              Register
            </button>
          </div>

          {activeTab === 'signin' && (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center mb-3">
                  {error}
                </div>
              )}

              {forgotMsg && (
                <div className="p-3 rounded-lg bg-green-50 border border-green-200 text-green-700 text-xs font-semibold text-center mb-1">
                  {forgotMsg}
                </div>
              )}

              <form onSubmit={handleSignIn} className="space-y-4">
                <div className="landing-input-field">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="Email address" required
                    value={email} onChange={e => setEmail(e.target.value)} />
                </div>

                <div className="landing-input-field">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" required
                    value={password} onChange={e => setPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <label className="flex items-center gap-2 text-slate-600 cursor-pointer">
                    <input type="checkbox" checked={rememberMe} onChange={e => setRememberMe(e.target.checked)}
                      className="accent-purple-600 rounded" />
                    Remember me
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
                  }} className="text-purple-600 font-semibold hover:underline">Forgot Password?</button>
                </div>

                <button type="submit" disabled={loading} className="landing-submit-btn">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>

              <div className="landing-or">
                <span>OR</span>
              </div>

              <button onClick={() => setActiveTab('register')} className="landing-create-btn">
                <UserPlus className="w-4 h-4" />
                Create a New Account
              </button>
            </>
          )}

          {activeTab === 'register' && (
            <>
              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleRegister} className="space-y-3">
                <div className="landing-input-field">
                  <User className="w-4 h-4 text-slate-400" />
                  <input type="text" placeholder="Full Name" required
                    value={regName} onChange={e => setRegName(e.target.value)} />
                </div>

                <div className="landing-input-field">
                  <Mail className="w-4 h-4 text-slate-400" />
                  <input type="email" placeholder="Email address" required
                    value={regEmail} onChange={e => setRegEmail(e.target.value)} />
                </div>

                <div className="landing-input-field">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input type={showRegPassword ? 'text' : 'password'} placeholder="Password" required
                    value={regPassword} onChange={e => setRegPassword(e.target.value)} />
                  <button type="button" onClick={() => setShowRegPassword(!showRegPassword)} className="ml-auto text-slate-400 hover:text-slate-600">
                    {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="landing-input-field">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input type="password" placeholder="Confirm Password" required
                    value={regConfirm} onChange={e => setRegConfirm(e.target.value)} />
                </div>

                <div className="landing-input-field">
                  <Users className="w-4 h-4 text-slate-400" />
                  <select value={regRole} onChange={e => setRegRole(e.target.value)}
                    className="flex-1 border-none outline-none text-sm bg-transparent text-slate-700">
                    <option value="attendee">Attendee (Discover & Book)</option>
                    <option value="organizer">Organizer (Host & Manage)</option>
                  </select>
                </div>

                <button type="submit" disabled={loading} className="landing-submit-btn">
                  {loading ? 'Creating Account...' : 'Create Account'}
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-4">
                Already have an account?{' '}
                <button onClick={() => { setActiveTab('signin'); setError(''); }} className="text-purple-600 font-semibold hover:underline">
                  Sign In
                </button>
              </p>
            </>
          )}
        </div>
      </div>

    </div>
  );
}
