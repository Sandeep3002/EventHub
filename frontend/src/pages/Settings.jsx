import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import { Settings as SettingsIcon, User, Bell, Shield, Eye, EyeOff, Save, CheckCircle2 } from 'lucide-react';

export default function Settings() {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [fullName, setFullName] = useState(user?.full_name || '');
  const [email] = useState(user?.email || '');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [emailNotifs, setEmailNotifs] = useState(true);
  const [bookingNotifs, setBookingNotifs] = useState(true);
  const [marketingNotifs, setMarketingNotifs] = useState(false);

  const role = user?.role || 'attendee';
  const sidebarRole = role === 'superadmin' ? 'superadmin' : (role === 'admin' || role === 'organizer') ? 'admin' : 'customer';

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const toggleStyle = (on) => ({
    width: '44px', height: '24px', borderRadius: '12px', cursor: 'pointer',
    background: on ? '#3b82f6' : '#cbd5e1', position: 'relative', transition: 'background 0.2s',
    border: 'none', padding: 0,
  });

  const toggleDot = (on) => ({
    width: '18px', height: '18px', borderRadius: '50%', background: 'white',
    position: 'absolute', top: '3px', left: on ? '23px' : '3px', transition: 'left 0.2s',
    boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
  });

  return (
    <div className="dashboard-layout">
      <Sidebar role={sidebarRole} />
      <main className="dashboard-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <SettingsIcon className="w-6 h-6 text-blue-600" />
            Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account preferences</p>
        </div>

        {saved && (
          <div style={{
            background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '10px',
            padding: '12px 16px', display: 'flex', alignItems: 'center', gap: '8px',
          }}>
            <CheckCircle2 style={{ width: '18px', height: '18px', color: '#10b981' }} />
            <span style={{ fontSize: '14px', fontWeight: 600, color: '#065f46' }}>Settings saved successfully!</span>
          </div>
        )}

        {/* Profile Section */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <User style={{ width: '18px', height: '18px', color: '#3b82f6' }} />
            Profile Information
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Full Name</label>
              <input type="text" value={fullName} onChange={e => setFullName(e.target.value)}
                className="form-input" style={{ fontSize: '14px' }} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Email</label>
              <input type="email" value={email} disabled
                className="form-input" style={{ fontSize: '14px', background: '#f8fafc', color: '#94a3b8' }} />
            </div>
          </div>
        </div>

        {/* Password Section */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield style={{ width: '18px', height: '18px', color: '#8b5cf6' }} />
            Change Password
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxWidth: '600px' }}>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>Current Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showCurrent ? 'text' : 'password'} value={currentPassword}
                  onChange={e => setCurrentPassword(e.target.value)} className="form-input" style={{ fontSize: '14px', paddingRight: '40px' }} />
                <button onClick={() => setShowCurrent(!showCurrent)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showCurrent ? <EyeOff style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> : <Eye style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
                </button>
              </div>
            </div>
            <div className="form-group">
              <label style={{ fontSize: '13px', fontWeight: 600, color: '#475569', marginBottom: '6px', display: 'block' }}>New Password</label>
              <div style={{ position: 'relative' }}>
                <input type={showNew ? 'text' : 'password'} value={newPassword}
                  onChange={e => setNewPassword(e.target.value)} className="form-input" style={{ fontSize: '14px', paddingRight: '40px' }} />
                <button onClick={() => setShowNew(!showNew)}
                  style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer' }}>
                  {showNew ? <EyeOff style={{ width: '16px', height: '16px', color: '#94a3b8' }} /> : <Eye style={{ width: '16px', height: '16px', color: '#94a3b8' }} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Notifications Section */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Bell style={{ width: '18px', height: '18px', color: '#f59e0b' }} />
            Notification Preferences
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '500px' }}>
            {[
              { label: 'Email Notifications', desc: 'Receive booking confirmations via email', value: emailNotifs, setter: setEmailNotifs },
              { label: 'Booking Updates', desc: 'Get notified about registration changes', value: bookingNotifs, setter: setBookingNotifs },
              { label: 'Marketing Emails', desc: 'Receive promotional offers and event recommendations', value: marketingNotifs, setter: setMarketingNotifs },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 16px', background: '#fafbfc', borderRadius: '10px' }}>
                <div>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: '#0f172a', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{item.desc}</p>
                </div>
                <button onClick={() => item.setter(!item.value)} style={toggleStyle(item.value)}>
                  <div style={toggleDot(item.value)} />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Save Button */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <button onClick={handleSave} className="btn-primary" style={{
            padding: '12px 28px', fontSize: '14px', fontWeight: 600,
            display: 'flex', alignItems: 'center', gap: '8px', borderRadius: '10px',
          }}>
            <Save style={{ width: '16px', height: '16px' }} />
            Save Changes
          </button>
        </div>
      </main>
    </div>
  );
}
