import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { request } from '../../services/api';
import { eventService } from '../../services/eventService';
import {
  Calendar, Users, Wallet, TrendingUp, Plus, Edit3, Eye, Trash2,
} from 'lucide-react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell,
} from 'recharts';

const DONUT_COLORS = ['#3b82f6', '#8b5cf6', '#f59e0b', '#10b981', '#ef4444', '#ec4899'];

export default function OrganizerDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const stats = await request('/stats/admin');
        setData(stats);
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const totalEvents = data?.total_events ?? 0;
  const totalRegs = data?.total_registrations ?? 0;
  const totalRevenue = data?.total_revenue ?? 0;
  const upcomingEvents = data?.upcoming_events ?? 0;
  const monthlyRegs = data?.monthly_registrations ?? [];
  const categoryData = data?.category_distribution ?? [];
  const recentEvents = data?.recent_events ?? [];

  const firstName = user?.full_name?.split(' ')[0] || user?.email?.split('@')[0] || 'Organizer';

  const formatDate = (d) => {
    if (!d) return '-';
    try {
      return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    } catch { return '-'; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setData(prev => ({
        ...prev,
        recent_events: (prev?.recent_events || []).filter(e => (e.id || e._id) !== id),
        total_events: (prev?.total_events || 1) - 1,
      }));
    } catch { /* ignore */ }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <main className="dashboard-content space-y-8">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          borderRadius: '16px', padding: '28px 32px', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px' }}>
              Welcome back, {firstName}!
            </h1>
            <p style={{ fontSize: '14px', opacity: 0.85 }}>
              Manage your events, track registrations, and grow your audience.
            </p>
          </div>
          <Link to="/admin/create-event" style={{
            background: 'white', color: '#2563eb', fontWeight: 600, fontSize: '14px',
            padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center',
            gap: '6px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
          }}>
            <Plus className="w-4 h-4" />
            Create New Event
          </Link>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { label: 'Total Events', value: loading ? '...' : totalEvents, sub: 'All events', icon: Calendar, iconBg: '#eff6ff', iconColor: '#3b82f6' },
            { label: 'Total Registrations', value: loading ? '...' : totalRegs, sub: 'All bookings', icon: Users, iconBg: '#f3e8ff', iconColor: '#8b5cf6' },
            { label: 'Total Revenue', value: loading ? '...' : `₹${totalRevenue.toLocaleString()}`, sub: 'All earnings', icon: Wallet, iconBg: '#ecfdf5', iconColor: '#10b981' },
            { label: 'Upcoming Events', value: loading ? '...' : upcomingEvents, sub: 'Scheduled', icon: TrendingUp, iconBg: '#fff7ed', iconColor: '#f59e0b' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'white', borderRadius: '14px', padding: '22px 20px',
              border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
              display: 'flex', alignItems: 'center', gap: '16px',
            }}>
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <s.icon style={{ width: '22px', height: '22px', color: s.iconColor }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: '#64748b', fontWeight: 500, marginBottom: '2px' }}>{s.label}</p>
                <h3 style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a', lineHeight: 1.1 }}>{s.value}</h3>
                <p style={{ fontSize: '12px', color: '#10b981', fontWeight: 500, marginTop: '2px' }}>{s.sub}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Line Chart */}
          <div style={{
            background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
              Registrations Overview
            </h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart data={monthlyRegs}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#94a3b8' }} axisLine={false} tickLine={false} allowDecimals={false} />
                  <Tooltip contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }} />
                  <Line type="monotone" dataKey="registrations" stroke="#3b82f6" strokeWidth={2.5}
                    dot={{ r: 4, fill: '#3b82f6', stroke: '#fff', strokeWidth: 2 }} activeDot={{ r: 6 }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>

          {/* Donut Chart */}
          <div style={{
            background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
            padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', marginBottom: '20px' }}>
              Event Categories
            </h2>
            {loading ? (
              <div style={{ textAlign: 'center', padding: '60px 0' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#8b5cf6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                <div style={{ position: 'relative', width: '180px', height: '180px' }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData.length > 0 ? categoryData : [{ name: 'No Events', value: 1 }]}
                        cx="50%" cy="50%" innerRadius={55} outerRadius={80}
                        dataKey="value" paddingAngle={2}
                      >
                        {(categoryData.length > 0 ? categoryData : [{ name: 'No Events', value: 1 }]).map((_, idx) => (
                          <Cell key={idx} fill={categoryData.length > 0 ? DONUT_COLORS[idx % DONUT_COLORS.length] : '#e2e8f0'} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div style={{
                    position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)',
                    textAlign: 'center', pointerEvents: 'none',
                  }}>
                    <div style={{ fontSize: '22px', fontWeight: 700, color: '#0f172a' }}>{totalRegs}</div>
                    <div style={{ fontSize: '11px', color: '#94a3b8' }}>Registrations</div>
                  </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                  {categoryData.length > 0 ? categoryData.map((c, idx) => {
                    const pct = totalEvents > 0 ? Math.round((c.value / totalEvents) * 100) : 0;
                    return (
                      <div key={c.name} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <div style={{ width: '10px', height: '10px', borderRadius: '3px', background: DONUT_COLORS[idx % DONUT_COLORS.length] }} />
                        <span style={{ fontSize: '13px', color: '#475569', flex: 1 }}>{c.name}</span>
                        <span style={{ fontSize: '13px', fontWeight: 600, color: '#0f172a' }}>{pct}%</span>
                      </div>
                    );
                  }) : (
                    <p style={{ fontSize: '13px', color: '#94a3b8' }}>No events yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Recent Events Table */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          <div style={{
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid #f1f5f9',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a' }}>Recent Events</h2>
            <Link to="/admin/manage-events" style={{ fontSize: '13px', fontWeight: 600, color: '#3b82f6', textDecoration: 'none' }}>
              View All →
            </Link>
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px 0' }}>
              <div style={{ width: '32px', height: '32px', border: '3px solid #e2e8f0', borderTopColor: '#3b82f6', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>Loading events...</p>
            </div>
          ) : recentEvents.length === 0 ? (
            <p style={{ textAlign: 'center', padding: '32px 0', color: '#94a3b8', fontSize: '14px' }}>
              No events yet. Create your first event!
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid #f1f5f9' }}>
                    {['Event Name', 'Date', 'Location', 'Registrations', 'Status', 'Actions'].map(h => (
                      <th key={h} style={{
                        textAlign: 'left', padding: '10px 12px', fontSize: '12px',
                        fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {recentEvents.map(e => {
                    const id = e.id || e._id;
                    const regCount = e.registration_count ?? 0;
                    return (
                      <tr key={id} style={{ borderBottom: '1px solid #f8fafc' }}>
                        <td style={{ padding: '14px 12px', display: 'flex', alignItems: 'center', gap: '12px' }}>
                          <div style={{
                            width: '40px', height: '40px', borderRadius: '8px',
                            background: 'linear-gradient(135deg, #3b82f6, #8b5cf6)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: 'white', fontWeight: 700, fontSize: '14px', flexShrink: 0,
                          }}>
                            {(e.title || 'E')[0].toUpperCase()}
                          </div>
                          <div>
                            <div style={{ fontWeight: 600, color: '#0f172a', fontSize: '14px' }}>{e.title}</div>
                            <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                              {(e.category_id || e.category || 'general').charAt(0).toUpperCase() + (e.category_id || e.category || 'general').slice(1)}
                            </div>
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#475569' }}>
                          {formatDate(e.start_time)}
                        </td>
                        <td style={{ padding: '14px 12px', fontSize: '13px', color: '#475569' }}>
                          {e.venue_id || e.location || 'TBD'}
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{
                            background: '#eff6ff', borderRadius: '20px', padding: '4px 12px',
                            fontSize: '13px', fontWeight: 600, color: '#3b82f6', display: 'inline-block',
                          }}>
                            {regCount}/{e.capacity || 100}
                          </div>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <span style={{
                            padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: (e.status || 'draft').toLowerCase() === 'published' ? '#ecfdf5' : '#f8fafc',
                            color: (e.status || 'draft').toLowerCase() === 'published' ? '#10b981' : '#94a3b8',
                          }}>
                            {e.status || 'Draft'}
                          </span>
                        </td>
                        <td style={{ padding: '14px 12px' }}>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button title="View" style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              border: '1px solid #e2e8f0', background: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                              <Eye style={{ width: '14px', height: '14px', color: '#64748b' }} />
                            </button>
                            <button title="Edit" style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              border: '1px solid #e2e8f0', background: 'white',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                              <Edit3 style={{ width: '14px', height: '14px', color: '#64748b' }} />
                            </button>
                            <button title="Delete" onClick={() => handleDelete(id)} style={{
                              width: '32px', height: '32px', borderRadius: '8px',
                              border: '1px solid #fee2e2', background: '#fff5f5',
                              display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                            }}>
                              <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
