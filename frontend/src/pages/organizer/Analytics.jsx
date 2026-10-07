import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import Loading from '../../components/Loading';
import { BarChart2, TrendingUp, DollarSign, Users, Calendar, Ticket } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function Analytics() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    eventService.getEvents().then(evts => {
      setEvents(evts);
      setLoading(false);
    });
  }, []);

  const totalRevenue = events.reduce((s, e) => s + (e.price * ((e.capacity || 0) - (e.available_tickets || 0))), 0);
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
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Analytics & Revenue</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Real-time performance insights for your hosted events</p>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 32 }}>
        {[
          { label: 'Total Revenue', value: `$${totalRevenue.toLocaleString()}`, icon: DollarSign, color: '#059669', bg: '#ecfdf5' },
          { label: 'Tickets Sold', value: totalSold.toLocaleString(), icon: Ticket, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Total Capacity', value: totalCapacity.toLocaleString(), icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
          { label: 'Avg Ticket Price', value: `$${avgPrice}`, icon: TrendingUp, color: '#d97706', bg: '#fffbeb' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '22px 24px',
            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 16,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
            }}>
              <s.icon style={{ width: 22, height: 22, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Revenue per Event */}
      <div>
        <h2 style={{ fontSize: 16, fontWeight: 700, color: '#0f172a', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 8 }}>
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
                background: '#fff', borderRadius: 14, padding: '18px 22px',
                border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20,
                boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                transition: 'box-shadow 0.2s'
              }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'}
              >
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#0f172a', marginBottom: 8, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {event.title}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                      height: 8, flex: 1, background: '#f1f5f9', borderRadius: 99, overflow: 'hidden'
                    }}>
                      <div style={{
                        height: '100%',
                        background: 'linear-gradient(90deg, #6366f1, #059669)',
                        borderRadius: 99,
                        width: `${pct}%`,
                        transition: 'width 0.6s ease'
                      }} />
                    </div>
                    <span style={{ fontSize: 12, fontWeight: 700, color: '#64748b', width: 40, textAlign: 'right' }}>{pct}%</span>
                  </div>
                </div>
                <div style={{ textAlign: 'right', flexShrink: 0 }}>
                  <div style={{ fontSize: 16, fontWeight: 800, color: '#059669' }}>${revenue.toLocaleString()}</div>
                  <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sold} sold</div>
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
