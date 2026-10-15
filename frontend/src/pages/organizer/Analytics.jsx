import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { BarChart2, TrendingUp, DollarSign, Users, Calendar, Ticket } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { cardStyle, headingStyle, subTextStyle } from '../../styles/pageStyles';

export default function Analytics() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getEvents().then(evts => {
      let list = Array.isArray(evts) ? evts : [];
      if (user?.role === 'organizer') {
        list = list.filter(e => e.organizer_id === user.id);
      }
      setEvents(list);
      setLoading(false);
    });
  }, [user]);

  const totalRevenue = events.reduce((s, e) => s + (e.price * ((e.capacity || 0) - (e.available_tickets || 0))), 0);
  const platformFee = Math.round(totalRevenue * 0.05);
  const netPayout = totalRevenue - platformFee;
  const totalSold = events.reduce((s, e) => s + ((e.capacity || 0) - (e.available_tickets || 0)), 0);
  const totalCapacity = events.reduce((s, e) => s + (e.capacity || 0), 0);
  const avgPrice = events.length > 0 ? (events.reduce((s, e) => s + e.price, 0) / events.length).toFixed(0) : 0;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
      {loading ? <Loading label="Loading Analytics..." /> : (
      <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <BarChart2 style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={headingStyle}>Analytics & Revenue</h1>
            <p style={subTextStyle}>Real-time earnings, 5% platform split, and net settlements</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Gross Sales (100%)', value: `₹${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
          { label: 'Net Payout (95%)', value: `₹${netPayout.toLocaleString()}`, icon: TrendingUp, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
          { label: 'Platform Fee (5%)', value: `₹${platformFee.toLocaleString()}`, icon: DollarSign, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Tickets Sold', value: totalSold.toLocaleString(), icon: Ticket, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
        ].map((s, i) => (
          <div key={i} style={{
            ...cardStyle,
            padding: '22px 24px', display: 'flex', alignItems: 'center', gap: 16,
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <s.icon style={{ width: 22, height: 22, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue per Event */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
          <Calendar style={{ width: 18, height: 18, color: '#6366f1' }} />
          Revenue per Event
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {events.map(event => {
            const sold = (event.capacity || 0) - (event.available_tickets || 0);
            const revenue = event.price * sold;
            const pct = totalRevenue > 0 ? Math.round((revenue / totalRevenue) * 100) : 0;
            return (
              <div key={event.id} style={{
                ...cardStyle,
                padding: '18px 22px', display: 'flex', alignItems: 'center', gap: 20,
                transition: 'transform 0.15s, box-shadow 0.15s',
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      height: 8, flex: 1, background: 'var(--c-bg)', borderRadius: 99, overflow: 'hidden', border: '1px solid var(--c-border)'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #059669)',
                        borderRadius: 99,
                        width: `${pct}%`,
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', width: 40, textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>₹{revenue.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: 'var(--c-text-muted)', marginTop: 2 }}>{sold} sold</div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
      )}
      </main>
    </div>
  );
}
