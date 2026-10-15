import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { Calendar, Ticket, DollarSign, Clock } from 'lucide-react';
import { Link } from 'react-router-dom';
import { cardStyle } from '../../styles/pageStyles';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const [bks, evts] = await Promise.all([
          bookingService.getMyBookings().catch(() => []),
          eventService.getEvents().catch(() => []),
        ]);
        setBookings(Array.isArray(bks) ? bks : []);
        setEvents(Array.isArray(evts) ? evts : []);
      } finally { setLoading(false); }
    }
    load();
  }, []);

  const totalSpent = bookings.reduce((sum, b) => sum + (b.total_amount || 0), 0);
  const upcomingBookings = bookings.filter(b => {
    const evt = events.find(e => (e.id || e._id) === b.event_id);
    return evt?.start_time && new Date(evt.start_time) > new Date();
  });
  const firstName = user?.full_name?.split(' ')[0] || 'User';

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '-'; }
  };

  const stats = [
    { label: 'My Bookings', value: loading ? '...' : bookings.length, icon: Ticket, iconBg: 'rgba(59, 130, 246, 0.14)', iconColor: '#3b82f6' },
    { label: 'Upcoming Events', value: loading ? '...' : upcomingBookings.length, icon: Calendar, iconBg: 'rgba(139, 92, 246, 0.14)', iconColor: '#8b5cf6' },
    { label: 'Total Spent', value: loading ? '...' : `₹${totalSpent.toLocaleString()}`, icon: DollarSign, iconBg: 'rgba(16, 185, 129, 0.14)', iconColor: '#10b981' },
    { label: 'Available Events', value: loading ? '...' : events.length, icon: Clock, iconBg: 'rgba(245, 158, 11, 0.14)', iconColor: '#f59e0b' },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" />
      <main className="dashboard-content space-y-8">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          {/* Header */}
          <div style={{
            background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
            borderRadius: '16px', padding: '28px 32px', color: 'white',
            display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            marginBottom: 24, boxShadow: '0 4px 20px rgba(16, 185, 129, 0.25)',
          }}>
            <div>
              <h1 style={{ fontSize: '24px', fontWeight: 700, marginBottom: '4px', color: '#fff' }}>Welcome back, {firstName}!</h1>
              <p style={{ fontSize: '14px', opacity: 0.9, color: 'rgba(255,255,255,0.9)' }}>Browse events, manage your bookings, and enjoy the experience.</p>
            </div>
            <Link to="/customer/events" style={{
              background: '#ffffff', color: '#059669', fontWeight: 600, fontSize: '14px',
              padding: '10px 20px', borderRadius: '10px', display: 'flex', alignItems: 'center',
              gap: '6px', textDecoration: 'none', boxShadow: '0 2px 8px rgba(0,0,0,0.12)',
            }}>
              <Calendar style={{ width: '16px', height: '16px' }} />
              Browse Events
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5" style={{ marginBottom: 24 }}>
            {stats.map((s, i) => (
              <div key={i} style={{
                ...cardStyle,
                padding: '22px 20px',
                display: 'flex', alignItems: 'center', gap: '16px',
              }}>
                <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: s.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <s.icon style={{ width: '22px', height: '22px', color: s.iconColor }} />
                </div>
                <div>
                  <p style={{ fontSize: '13px', color: 'var(--c-text-muted)', fontWeight: 500, marginBottom: '2px' }}>{s.label}</p>
                  <h3 style={{ fontSize: '22px', fontWeight: 700, color: 'var(--c-text-main)', lineHeight: 1.1 }}>{s.value}</h3>
                </div>
              </div>
            ))}
          </div>

          {/* Recent Bookings */}
          <div style={{ ...cardStyle, padding: '24px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '1px solid var(--c-border)', paddingBottom: '12px' }}>
              <h2 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-text-main)' }}>My Recent Bookings</h2>
              <Link to="/customer/bookings" style={{ fontSize: '13px', fontWeight: 600, color: '#10b981', textDecoration: 'none' }}>View All →</Link>
            </div>
            {bookings.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '32px 0', color: 'var(--c-text-muted)', fontSize: '14px' }}>No bookings yet. Browse events to get started!</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {bookings.slice(0, 5).map(b => {
                  const evt = events.find(e => (e.id || e._id) === b.event_id);
                  return (
                    <div key={b.id || b._id} style={{
                      display: 'flex', alignItems: 'center', gap: '14px', padding: '14px',
                      borderRadius: '12px', background: 'var(--c-bg)', border: '1px solid var(--c-border)',
                    }}>
                      <div style={{
                        width: '44px', height: '44px', borderRadius: '10px',
                        background: 'linear-gradient(135deg, #10b981, #059669)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 700, fontSize: '16px', flexShrink: 0,
                      }}>
                        {(evt?.title || b.event_title || 'E')[0].toUpperCase()}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontWeight: 600, color: 'var(--c-text-main)', fontSize: '14px' }}>{evt?.title || b.event_title || 'Event'}</div>
                        <div style={{ fontSize: '12px', color: 'var(--c-text-muted)' }}>{formatDate(b.created_at)} · Pass: {b.qr_code_token || '-'}</div>
                      </div>
                      <span style={{ fontWeight: 700, color: '#10b981', fontSize: '14px' }}>₹{b.total_amount || 0}</span>
                      <span style={{
                        padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                        background: b.status === 'confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                        color: b.status === 'confirmed' ? '#10b981' : '#f59e0b',
                        border: `1px solid ${b.status === 'confirmed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                      }}>{b.status || 'pending'}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
