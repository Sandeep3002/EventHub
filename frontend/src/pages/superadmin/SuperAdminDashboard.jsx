import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import {
  ShieldCheck, Users, Calendar, DollarSign, CreditCard,
} from 'lucide-react';
import { cardStyle } from '../../styles/pageStyles';

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
    { label: 'Total Admins', value: loading ? '...' : data?.total_admins ?? 0, sub: `${data?.total_customers ?? 0} customers`, icon: Users, iconBg: 'rgba(59, 130, 246, 0.14)', iconColor: '#3b82f6' },
    { label: 'Total Events', value: loading ? '...' : data?.total_events ?? 0, sub: 'Across all organizers', icon: Calendar, iconBg: 'rgba(139, 92, 246, 0.14)', iconColor: '#8b5cf6' },
    { 
      label: 'EventHub Commission (5%)', 
      value: loading ? '...' : `₹${(data?.total_platform_commission ?? Math.round((data?.total_revenue ?? 0) * 0.05)).toLocaleString()}`, 
      sub: 'Platform net earnings', 
      icon: DollarSign, 
      iconBg: 'rgba(16, 185, 129, 0.14)', 
      iconColor: '#10b981' 
    },
    { 
      label: 'Gross Ticket Volume', 
      value: loading ? '...' : `₹${(data?.total_revenue ?? 0).toLocaleString()}`, 
      sub: `Organizers (95%): ₹${(data?.total_organizer_payouts ?? Math.round((data?.total_revenue ?? 0) * 0.95)).toLocaleString()}`, 
      icon: DollarSign, 
      iconBg: 'rgba(245, 158, 11, 0.14)', 
      iconColor: '#f59e0b' 
    },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="superadmin" />
      <main className="dashboard-content space-y-8">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
            borderRadius: '16px', padding: '28px 32px', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 24, boxShadow: '0 4px 20px rgba(124, 58, 237, 0.25)',
          }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
                <ShieldCheck style={{ width: '28px', height: '28px', color: '#fff' }} />
                <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#fff', margin: 0 }}>Super Admin Dashboard</h1>
              </div>
              <p style={{ fontSize: '14px', opacity: 0.9, color: 'rgba(255,255,255,0.9)', margin: 0 }}>
                Welcome back, {firstName}! Monitor all admin activities and manage the platform.
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: 24 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                ...cardStyle,
                padding: '22px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{
                  width: '48px', height: '48px', borderRadius: '12px', background: s.iconBg,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <s.icon style={{ width: '22px', height: '22px', color: s.iconColor }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--c-text-muted)', fontWeight: 500, marginBottom: '2px' }}>{s.label}</p>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--c-text-main)', lineHeight: 1.1 }}>{s.value}</h3>
                  <p style={{ fontSize: '12px', color: 'var(--c-text-muted)', marginTop: '2px' }}>{s.sub}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Organizer Bank Details */}
          <div id="bank-details" style={{ ...cardStyle, padding: '24px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--c-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-text-main)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CreditCard style={{ width: '20px', height: '20px', color: '#7c3aed' }} />
                Organizer Bank Details (Payout Accounts)
              </h2>
              <span style={{ fontSize: '12px', color: 'var(--c-text-muted)' }}>
                {adminUsers.filter(u => u.payout_status === 'active').length} configured
              </span>
            </div>

            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--c-border)', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : adminUsers.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '24px 0', color: 'var(--c-text-muted)', fontSize: '14px' }}>No organizers registered yet.</p>
            ) : (
              <div style={{ overflowX: 'auto' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                  <thead>
                    <tr style={{ borderBottom: '1px solid var(--c-border)', background: 'var(--c-bg)' }}>
                      {['Organizer Name', 'Email', 'Bank Name', 'Account Number', 'IFSC Code', 'Beneficiary Name', 'Payout Status'].map(h => (
                        <th key={h} style={{ padding: '12px 14px', textAlign: 'left', fontWeight: 600, color: 'var(--c-text-muted)', whiteSpace: 'nowrap' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {adminUsers.map(u => {
                      const configured = u.payout_status === 'active';
                      return (
                        <tr key={u.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                          <td style={{ padding: '12px 14px', fontWeight: 600, color: 'var(--c-text-main)', whiteSpace: 'nowrap' }}>{u.full_name}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c-text-muted)' }}>{u.email}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c-text-main)', fontWeight: 500 }}>{u.payout_bank_name || '—'}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c-text-main)', fontFamily: 'monospace', fontWeight: 600 }}>{u.payout_account_number_masked || '—'}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c-text-main)', fontFamily: 'monospace' }}>{u.payout_ifsc || '—'}</td>
                          <td style={{ padding: '12px 14px', color: 'var(--c-text-main)' }}>{u.payout_beneficiary_name || '—'}</td>
                          <td style={{ padding: '12px 14px' }}>
                            <span style={{
                              padding: '4px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                              background: configured ? 'rgba(16, 185, 129, 0.12)' : 'var(--c-bg)',
                              color: configured ? '#10b981' : 'var(--c-text-muted)',
                              border: configured ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--c-border)'
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
          <div style={{ ...cardStyle, padding: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--c-text-main)', marginBottom: '16px', borderBottom: '1px solid var(--c-border)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Users style={{ width: '20px', height: '20px', color: '#4f46e5' }} />
              Admin / Organizer Users ({adminUsers.length})
            </h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid var(--c-border)', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {adminUsers.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '12px',
                    borderRadius: '10px', background: 'var(--c-bg)', border: '1px solid var(--c-border)'
                  }}>
                    <div style={{
                      width: '38px', height: '38px', borderRadius: '50%', background: '#4f46e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    }}>
                      {(u.full_name || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: 'var(--c-text-main)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</p>
                      <p style={{ fontSize: '11px', color: 'var(--c-text-muted)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.email}</p>
                      {u.phone && <p style={{ fontSize: '11px', color: 'var(--c-text-muted)', margin: '2px 0 0' }}>{u.phone}</p>}
                    </div>
                    <span style={{
                      padding: '3px 10px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                      background: u.is_active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: u.is_active ? '#10b981' : '#ef4444',
                    }}>
                      {u.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
                {adminUsers.length === 0 && (
                  <p style={{ fontSize: '13px', color: 'var(--c-text-muted)', textAlign: 'center', padding: '16px 0', gridColumn: '1 / -1' }}>No admin users yet.</p>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
