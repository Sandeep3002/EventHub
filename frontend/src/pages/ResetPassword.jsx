import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { authService } from '../services/authService';
import {
  CalendarCheck, Lock, Eye, EyeOff, CheckCircle,
  Users, ClipboardCheck, TrendingUp,
} from 'lucide-react';

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (!token) {
      setError('Invalid or missing reset token.');
      return;
    }

    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
    } catch (err) {
      setError(err.message || 'Failed to reset password. The link may have expired.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="landing-page">

      {/* ─── LEFT PANEL: Branding (same as Home) ─── */}
      <div className="landing-left">
        <div className="landing-left-overlay" />
        <img
          src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80"
          alt="" className="landing-left-bg"
        />

        <div className="landing-left-content">
          <div className="landing-logo">
            <div className="landing-logo-icon">
              <CalendarCheck className="w-8 h-8" />
            </div>
            <h1 className="landing-logo-text">EventHub</h1>
            <p className="landing-logo-tagline">Plan &bull; Organize &bull; Experience</p>
            <div className="landing-divider" />
          </div>

          <p className="landing-desc">
            A complete event management platform<br />
            for organizers and attendees.
          </p>

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

      {/* ─── RIGHT PANEL: Reset Password Form ─── */}
      <div className="landing-right">
        <div className="landing-form-card">

          {success ? (
            <div className="text-center space-y-5">
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto">
                <CheckCircle className="w-8 h-8 text-green-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900">Password Reset Successful!</h2>
              <p className="text-sm text-slate-500">
                Your password has been updated. You can now sign in with your new password.
              </p>
              <button
                onClick={() => navigate('/')}
                className="landing-submit-btn"
              >
                Go to Sign In
              </button>
            </div>
          ) : (
            <>
              <div className="text-center space-y-1 mb-6">
                <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3" style={{ background: 'linear-gradient(135deg, #7c3aed, #ec4899)' }}>
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900">Set New Password</h2>
                <p className="text-sm text-slate-500">
                  Enter your new password below to<br />reset your account.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center mb-3">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="landing-input-field">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="New password"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="ml-auto text-slate-400 hover:text-slate-600">
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="landing-input-field">
                  <Lock className="w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="landing-submit-btn"
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
              </form>

              <p className="text-xs text-slate-500 text-center mt-4">
                Remember your password?{' '}
                <button onClick={() => navigate('/')} className="text-purple-600 font-semibold hover:underline">
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
