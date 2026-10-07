import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import {
  ShieldCheck, Users, Calendar, Activity, DollarSign,
  UserPlus, Trash2, Edit3, PlusCircle, CheckCircle2, XCircle, FileText,
} from 'lucide-react';

const ACTION_ICONS = {
  created_event: { icon: PlusCircle, color: '#3b82f6', bg: '#eff6ff' },
  updated_event: { icon: Edit3, color: '#f59e0b', bg: '#fffbeb' },
  deleted_event: { icon: Trash2, color: '#ef4444', bg: '#fef2f2' },
  published_event: { icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5' },
  unpublished_event: { icon: XCircle, color: '#64748b', bg: '#f8fafc' },
  new_registration: { icon: UserPlus, color: '#8b5cf6', bg: '#f5f3ff' },
  deleted_registration: { icon: Trash2, color: '#ef4444', bg: '#fef2f2' },
  created_category: { icon: PlusCircle, color: '#06b6d4', bg: '#ecfeff' },
  deleted_category: { icon: Trash2, color: '#ef4444', bg: '#fef2f2' },
  created_venue: { icon: PlusCircle, color: '#14b8a6', bg: '#f0fdfa' },
  user_login: { icon: Users, color: '#6366f1', bg: '#eef2ff' },
  user_registered: { icon: UserPlus, color: '#10b981', bg: '#ecfdf5' },
};

const formatAction = (action) => action.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

const timeAgo = (ts) => {
  const diff = Date.now() - new Date(ts).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
};

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
  const activities = data?.recent_activities || [];
  const adminUsers = data?.admin_users || [];

  const stats = [
    { label: 'Total Admins', value: loading ? '...' : data?.total_admins ?? 0, sub: `${data?.total_customers ?? 0} customers`, icon: Users, iconBg: '#eff6ff', iconColor: '#3b82f6' },
    { label: 'Total Events', value: loading ? '...' : data?.total_events ?? 0, sub: 'Across all admins', icon: Calendar, iconBg: '#f5f3ff', iconColor: '#8b5cf6' },
    { label: 'Registrations', value: loading ? '...' : data?.total_registrations ?? 0, sub: 'All bookings', icon: FileText, iconBg: '#ecfdf5', iconColor: '#10b981' },
    { label: 'Total Revenue', value: loading ? '...' : `₹${(data?.total_revenue ?? 0).toLocaleString()}`, sub: 'Platform-wide', icon: DollarSign, iconBg: '#fff7ed', iconColor: '#f59e0b' },
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
          <Link to="/superadmin/activities" style={{
            background: 'white', color: '#4f46e5', fontWeight: 600, fontSize: '14px',
            padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center',
            gap: '6px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <Activity style={{ width: '16px', height: '16px' }} />
            Activity Log
          </Link>
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

        {/* Live Activity Feed + Admin List */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Activity Feed */}
          <div className="lg:col-span-2" style={{
            background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Activity style={{ width: '18px', height: '18px', color: '#7c3aed' }} />
                Live Activity Feed
              </h2>
              <Link to="/superadmin/activities" style={{ fontSize: '13px', fontWeight: 600, color: '#7c3aed', textDecoration: 'none' }}>View All →</Link>
            </div>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
                <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>Loading activities...</p>
              </div>
            ) : activities.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '14px' }}>No activities recorded yet.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', maxHeight: '420px', overflowY: 'auto' }}>
                {activities.map(a => {
                  const cfg = ACTION_ICONS[a.action] || { icon: Activity, color: '#64748b', bg: '#f8fafc' };
                  const Icon = cfg.icon;
                  return (
                    <div key={a.id} style={{
                      display: 'flex', alignItems: 'flex-start', gap: '12px', padding: '12px',
                      borderRadius: '10px', background: '#fafbfc', transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = '#f1f5f9'}
                      onMouseLeave={e => e.currentTarget.style.background = '#fafbfc'}
                    >
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '10px', background: cfg.bg,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                      }}>
                        <Icon style={{ width: '16px', height: '16px', color: cfg.color }} />
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '13px', color: '#0f172a', margin: 0 }}>
                          <strong>{a.actor_name}</strong>{' '}
                          <span style={{ color: '#64748b' }}>{formatAction(a.action).toLowerCase()}</span>{' '}
                          <strong style={{ color: cfg.color }}>{a.target_name}</strong>
                        </p>
                        {a.details && <p style={{ fontSize: '12px', color: '#94a3b8', margin: '2px 0 0' }}>{a.details}</p>}
                      </div>
                      <span style={{ fontSize: '11px', color: '#94a3b8', flexShrink: 0, marginTop: '2px' }}>
                        {timeAgo(a.timestamp)}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Admin Users */}
          <div style={{
            background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '16px', borderBottom: '1px solid #f1f5f9', paddingBottom: '12px' }}>
              Admin Users
            </h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#4f46e5', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {adminUsers.map(u => (
                  <div key={u.id} style={{
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '10px',
                    borderRadius: '10px', background: '#fafbfc',
                  }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', background: '#4f46e5',
                      display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white',
                      fontWeight: 700, fontSize: '14px', flexShrink: 0,
                    }}>
                      {(u.full_name || 'A')[0].toUpperCase()}
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{u.full_name}</p>
                      <p style={{ fontSize: '11px', color: '#94a3b8', margin: 0 }}>{u.email}</p>
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
                  <p style={{ fontSize: '13px', color: '#94a3b8', textAlign: 'center', padding: '16px 0' }}>No admin users yet.</p>
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
