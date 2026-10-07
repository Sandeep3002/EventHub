import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import Loading from '../../components/Loading';
import { MapPin, PlusCircle, Users, Building2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', city: '', state: '', address: '', capacity: 100 });
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    eventService.getVenues().then(vens => { setVenues(vens); setLoading(false); });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const v = await eventService.createVenue({ ...form, capacity: Number(form.capacity), country: 'USA' });
      setVenues(prev => [...prev, v]);
      setForm({ name: '', city: '', state: '', address: '', capacity: 100 });
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
      <div style={{ maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <MapPin style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Venues</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Add and manage physical event venues on the platform</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Venues', value: venues.length, icon: Building2, color: '#0891b2', bg: '#ecfeff' },
          { label: 'Total Capacity', value: venues.reduce((s, v) => s + (v.capacity || 0), 0).toLocaleString(), icon: Users, color: '#7c3aed', bg: '#f5f3ff' },
        ].map((s, i) => (
          <div key={i} style={{
            background: '#fff', borderRadius: 14, padding: '20px 22px',
            border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14,
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
          }}>
            <div style={{
              width: 42, height: 42, borderRadius: 10, background: s.bg,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <s.icon style={{ width: 20, height: 20, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Add Venue Form */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 24,
        border: '1px solid #e2e8f0', marginBottom: 28,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Add New Venue</h3>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            {[
              { key: 'name', label: 'Venue Name', placeholder: 'e.g. Grand Hall' },
              { key: 'address', label: 'Street Address', placeholder: 'e.g. 123 Main St' },
              { key: 'city', label: 'City', placeholder: 'e.g. San Francisco' },
              { key: 'state', label: 'State', placeholder: 'e.g. California' },
              { key: 'capacity', label: 'Capacity', placeholder: '100', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>{f.label}</label>
                <input
                  required
                  type={f.type || 'text'}
                  value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={{
                    width: '100%', padding: '10px 14px', borderRadius: 10,
                    border: '1px solid #e2e8f0', fontSize: 13, color: '#334155',
                    outline: 'none', background: '#f8fafc'
                  }}
                />
              </div>
            ))}
          </div>
          <button type="submit" disabled={adding} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0891b2, #67e8f9)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: adding ? 0.6 : 1
          }}>
            <PlusCircle style={{ width: 16, height: 16 }} />
            {adding ? 'Adding...' : 'Add Venue'}
          </button>
        </form>
      </div>

      {/* Venues Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {venues.map(v => (
          <div key={v.id} style={{
            background: '#fff', borderRadius: 14, padding: 22,
            border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            transition: 'box-shadow 0.2s, transform 0.2s'
          }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.08)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <div style={{
                width: 36, height: 36, borderRadius: 8, background: '#ecfeff',
                display: 'flex', alignItems: 'center', justifyContent: 'center'
              }}>
                <MapPin style={{ width: 18, height: 18, color: '#0891b2' }} />
              </div>
              <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a' }}>{v.name}</span>
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginBottom: 6 }}>{v.address}</div>
            <div style={{ fontSize: 12, color: '#334155', marginBottom: 8 }}>{v.city}, {v.state}, {v.country}</div>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              fontSize: 11, fontWeight: 700, color: '#0891b2',
              background: '#ecfeff', padding: '4px 12px', borderRadius: 20,
              border: '1px solid #cffafe'
            }}>
              <Users style={{ width: 12, height: 12 }} />
              Capacity: {v.capacity?.toLocaleString()}
            </div>
          </div>
        ))}
      </div>
      </div>
      </main>
    </div>
  );
}
