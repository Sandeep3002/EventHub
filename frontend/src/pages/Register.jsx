import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Ticket, Calendar, Bell, Eye, EyeOff } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('attendee');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      await register(fullName, email, password, role);
      navigate('/');
    } catch (err) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
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
              <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join EventHub</h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Stay updated with the latest events and opportunities.
              </p>
            </div>

            {/* Feature Bullets */}
            <div className="space-y-3.5 text-xs text-slate-200 font-medium">
              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Compass className="w-4 h-4" />
                </div>
                <span>Discover events</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4" />
                </div>
                <span>Easy registration</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Calendar className="w-4 h-4" />
                </div>
                <span>Manage your bookings</span>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-indigo-600/80 text-white flex items-center justify-center shrink-0">
                  <Bell className="w-4 h-4" />
                </div>
                <span>Get event updates</span>
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
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900">Create Your Account</h2>
            <p className="text-xs text-slate-500">Sign up to get started</p>
          </div>

          {error && (
            <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-600 text-xs font-semibold text-center">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            <div className="form-group mb-0">
              <label className="form-label text-xs">Full Name</label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your full name"
                className="form-input text-xs"
              />
            </div>

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

            <div className="form-group mb-0">
              <label className="form-label text-xs">Confirm Password</label>
              <input
                type="password"
                required
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="form-input text-xs"
              />
            </div>

            <div className="form-group mb-0">
              <label className="form-label text-xs">Account Type</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="form-select text-xs"
              >
                <option value="attendee">Attendee (Discover & Book Events)</option>
                <option value="organizer">Organizer (Host & Manage Events)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full py-3 text-xs font-semibold mt-2"
              style={{ backgroundColor: '#6366F1' }}
            >
              {loading ? 'Signing Up...' : 'Sign Up'}
            </button>

          </form>

          <div className="text-center text-xs text-slate-500 pt-2 border-t border-slate-100">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:underline">
              Login
            </Link>
          </div>

        </div>

      </div>

    </div>
  );
}
