import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import {
  ShieldCheck, Users, Calendar, DollarSign, CreditCard,
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stats = await request('/stats/superadmin');
        setData(stats);
      } catch (err) {
        console.error('Failed to load superadmin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const firstName = user?.full_name?.split(' ')[0] || 'Super Admin';
  const adminUsers = data?.admin_users || [];

  const stats = [
    { label: 'Total Admins', value: loading ? '...' : data?.total_admins ?? 0, sub: `${data?.total_customers ?? 0} customers`, icon: Users, iconBg: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Total Events', value: loading ? '...' : data?.total_events ?? 0, sub: 'Across all organizers', icon: Calendar, iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
    { 
      label: 'EventHub Commission (5%)', 
      value: loading ? '...' : `₹${(data?.total_platform_commission ?? Math.round((data?.total_revenue ?? 0) * 0.05)).toLocaleString()}`, 
      sub: 'Platform net earnings', 
      icon: DollarSign, 
      iconBg: '#ecfdf5', 
      iconColor: '#10b981' 
    },
    { 
      label: 'Gross Ticket Volume', 
      value: loading ? '...' : `₹${(data?.total_revenue ?? 0).toLocaleString()}`, 
      sub: `Organizers (95%): ₹${(data?.total_organizer_payouts ?? Math.round((data?.total_revenue ?? 0) * 0.95)).toLocaleString()}`, 
      icon: DollarSign, 
      iconBg: '#fff7ed', 
      iconColor: '#f59e0b' 
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="superadmin" />
      <main className="dashboard-content space-y-8">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: '16px', padding: '28px 32px', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <ShieldCheck style={{ width: '28px', height: '28px' }} />
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Super Admin Dashboard</h1>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.85 }}>
              Welcome back, {firstName}! Monitor all admin activities and manage the platform.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {stats.map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '14px', padding: '22px 20px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px', background: s.iconBg,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon style={{ width: '22px', height: '22px', color: s.iconColor }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>{s.label}</p>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{s.value}</h3>
                <p style={{ fontSize: '12px', color: '#94a3b8', marginTop: '2px' }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Organizer Bank Details */}
        <div id="bank-details" style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
              Organizer Bank Details (Payout Accounts)
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b' }}>
              {adminUsers.filter(u => u.payout_status === 'active').length} configured
            </span>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : adminUsers.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8', fontSize: '14px' }}>No organizers registered yet.</p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    {['Organizer Name', 'Email', 'Bank Name', 'Account Number', 'IFSC Code', 'Beneficiary Name', 'Payout Status'].map(h => (
                      <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {adminUsers.map(u => {
                    const configured = u.payout_status === 'active';
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '12px 14px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>{u.full_name}</td>
                        <td style={{ padding: '12px 14px', color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '12px 14px', color: '#0f172a', fontWeight: 500 }}>{u.payout_bank_name || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#0f172a', fontFamily: 'monospace', fontWeight: 600 }}>{u.payout_account_number_masked || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#0f172a', fontFamily: 'monospace' }}>{u.payout_ifsc || '—'}</td>
                        <td style={{ padding: '12px 14px', color: '#0f172a' }}>{u.payout_beneficiary_name || '—'}</td>
                        <td style={{ padding: '12px 14px' }}>
                          <span style={{
                            padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: configured ? '#ecfdf5' : '#f8fafc',
                            color: configured ? '#10b981' : '#94a3b8',
                            border: configured ? '1px solid #a7f3d0' : '1px solid #e2e8f0'
                          }}>
                            {configured ? 'Active' : 'Not Configured'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Admin Users */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Users style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
            Admin / Organizer Users ({adminUsers.length})
          </h2>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {adminUsers.map(u => (
                <div key={u.id} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                  borderRadius: '10px', background: '#fafbfc', border: '1px solid #f1f5f9'
                }}>
                  <div style={{
                    width: '38px', height: '38px', borderRadius: '50%', background: '#4f46e5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                    fontWeight: 700, fontSize: '14px', flexShrink: 0,
                  }}>
                    {(u.full_name || 'A')[0].toUpperCase()}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</p>
                    <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                    {u.phone && <p style={{ fontSize: '11px', color: '#64748b', margin: '2px 0 0' }}>{u.phone}</p>}
                  </div>
                  <span style={{
                    padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                    background: u.is_active ? '#ecfdf5' : '#fef2f2', color: u.is_active ? '#10b981' : '#ef4444',
                  }}>
                    {u.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
              ))}
              {adminUsers.length === 0 && (
                <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0', gridColumn: '1 / -1' }}>No admin users yet.</p>
              )}
            </div>
          )}
        </div>

      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
