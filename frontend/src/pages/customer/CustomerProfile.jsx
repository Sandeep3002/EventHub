import React from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { User, Mail, Calendar, ShieldCheck } from 'lucide-react';

export default function CustomerProfile() {
  const { user } = useAuth();

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" />
      <main className="dashboard-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Profile</h1>
          <p className="text-xs text-slate-500 mt-1">Manage your account details</p>
        </div>

        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', maxWidth: '600px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '28px' }}>
            <div style={{
              width: '72px', height: '72px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #10b981, #059669)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontWeight: 700, fontSize: '28px',
            }}>
              {(user?.full_name || 'U')[0].toUpperCase()}
            </div>
            <div>
              <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#0f172a', margin: 0 }}>{user?.full_name || 'User'}</h2>
              <p style={{ fontSize: '13px', color: '#64748b', margin: '4px 0 0' }}>{user?.role || 'attendee'}</p>
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { icon: Mail, label: 'Email', value: user?.email || '-' },
              { icon: ShieldCheck, label: 'Role', value: user?.role || 'attendee' },
              { icon: Calendar, label: 'Member Since', value: user?.created_at ? new Date(user.created_at).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : '-' },
              { icon: User, label: 'Status', value: user?.is_active ? 'Active' : 'Inactive' },
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '12px 16px', background: '#fafbfc', borderRadius: '10px' }}>
                <item.icon style={{ width: '18px', height: '18px', color: '#64748b' }} />
                <div>
                  <p style={{ fontSize: '11px', color: '#94a3b8', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{item.label}</p>
                  <p style={{ fontSize: '14px', color: '#0f172a', fontWeight: 500, margin: '2px 0 0' }}>{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
