import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';
import {
  Mail, Lock, Eye, EyeOff, User, Users, Info, CheckCircle2, ArrowRight, X, Sparkles,
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

  // Success Modal State
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [registeredUser, setRegisteredUser] = useState({ name: '', email: '' });

  // If already logged in, redirect to dashboard
  useEffect(() => {
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
      const data = await login(email, password, rememberMe);
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

      // Trigger Confetti Celebration
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#6366F1', '#8B5CF6', '#10B981', '#F59E0B']
        });
      } catch {
        /* fallback gracefully if confetti is blocked */
      }

      // Populate success popup state
      const registeredName = regName;
      const registeredEmail = regEmail;
      setRegisteredUser({ name: registeredName, email: registeredEmail });
      setEmail(registeredEmail);
      setShowSuccessModal(true);

      // Clear register inputs
      setRegName('');
      setRegEmail('');
      setRegPassword('');
      setRegConfirm('');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleProceedToSignIn = () => {
    setShowSuccessModal(false);
    setActiveTab('signin');
    setForgotMsg('🎉 Registration successful! Please sign in with your credentials.');
  };



  return (
    <div className="landing-page">

      {/* ─── LEFT PANEL: Branding ─── */}
      <div className="landing-left">
        <img
          src="/images/eventhub-hero.jpg"
          alt="EventHub - Plan • Organize • Experience"
          className="landing-left-bg"
        />
      </div>

      {/* ─── RIGHT PANEL: Auth Form ─── */}
      <div className="landing-right relative">
        {/* Top-Right Action: About Only */}
        <div className="landing-top-actions">
          <button
            onClick={() => navigate('/about')}
            className="landing-help-btn"
            title="About EventHub"
            aria-label="About"
          >
            <Info className="w-4 h-4" />
            <span>About</span>
          </button>
        </div>

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
                      setError(err.message || 'Failed to send reset email. Please try again.');
                    }
                  }} className="text-purple-600 font-semibold hover:underline">Forgot Password?</button>
                </div>

                <button type="submit" disabled={loading} className="landing-submit-btn">
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
              </form>


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

      {/* ─── REGISTRATION SUCCESS POPUP MODAL ─── */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 text-center border border-slate-100 relative animate-in zoom-in-95 duration-200">
            {/* Close Button */}
            <button
              onClick={handleProceedToSignIn}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Celebratory Icon */}
            <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-white flex items-center justify-center shadow-lg shadow-emerald-500/25 mb-4">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Registration Successful!</span>
            </div>

            <h3 className="text-xl font-bold text-slate-900">
              Welcome, {registeredUser.name || 'there'}!
            </h3>

            <p className="text-xs text-slate-500 mt-1 mb-5">
              Your EventHub account has been created successfully.
            </p>

            {/* Email notification card */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-left space-y-2 mb-6">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-600 flex items-center justify-center shrink-0 mt-0.5">
                  <Mail className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-800">
                    Thank-you Email Dispatched!
                  </h4>
                  <p className="text-[11px] text-slate-600 leading-relaxed mt-0.5">
                    We sent a thank you and welcome email to{' '}
                    <strong className="text-indigo-600 break-all">{registeredUser.email}</strong>.
                    Check your inbox (or spam) for helpful tips to get started.
                  </p>
                </div>
              </div>
            </div>

            {/* Proceed to Sign In button */}
            <button
              onClick={handleProceedToSignIn}
              className="w-full py-3 px-4 rounded-xl text-white font-semibold text-xs bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 shadow-md shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Proceed to Sign In</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
