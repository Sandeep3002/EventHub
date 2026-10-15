import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import Loading from '../../components/Loading';
import { MapPin, PlusCircle, Users, Building2, Pencil, Trash2, X, Check } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { cardStyle, inputStyle, labelStyle, headingStyle, subTextStyle, statCardStyle } from '../../styles/pageStyles';

export default function ManageVenues() {
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ name: '', city: '', state: '', address: '', capacity: 100 });
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({});

  useEffect(() => {
    eventService.getVenues().then(vens => { setVenues(vens); setLoading(false); });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const v = await eventService.createVenue({ ...form, capacity: Number(form.capacity), country: 'India' });
      setVenues(prev => [...prev, v]);
      setForm({ name: '', city: '', state: '', address: '', capacity: 100 });
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this venue?')) return;
    try {
      await eventService.deleteVenue(id);
      setVenues(prev => prev.filter(v => v.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const startEdit = (v) => {
    setEditId(v.id);
    setEditForm({ name: v.name, city: v.city, state: v.state, address: v.address, capacity: v.capacity });
  };

  const handleUpdate = async () => {
    try {
      const updated = await eventService.updateVenue(editId, { ...editForm, capacity: Number(editForm.capacity), country: 'India' });
      setVenues(prev => prev.map(v => v.id === editId ? updated : v));
      setEditId(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) return <Loading />;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
      <div style={{ maxWidth: 1100 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #0891b2, #67e8f9)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <MapPin style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={headingStyle}>Manage Venues</h1>
            <p style={subTextStyle}>Add, edit and delete event venues</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Venues', value: venues.length, icon: Building2, color: '#0891b2', bg: 'rgba(8,145,178,0.12)' },
          { label: 'Total Capacity', value: venues.reduce((s, v) => s + (v.capacity || 0), 0).toLocaleString(), icon: Users, color: '#7c3aed', bg: 'rgba(124,58,237,0.12)' },
        ].map((s, i) => (
          <div key={i} style={statCardStyle}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: 20, height: 20, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ ...cardStyle, padding: 24, marginBottom: 28 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 16 }}>Add New Venue</h3>
        <form onSubmit={handleAdd}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 16 }}>
            {[
              { key: 'name', label: 'Venue Name', placeholder: 'e.g. Grand Hall' },
              { key: 'address', label: 'Street Address', placeholder: 'e.g. 123 Main St' },
              { key: 'city', label: 'City', placeholder: 'e.g. Hyderabad' },
              { key: 'state', label: 'State', placeholder: 'e.g. Telangana' },
              { key: 'capacity', label: 'Capacity', placeholder: '100', type: 'number' },
            ].map(f => (
              <div key={f.key}>
                <label style={labelStyle}>{f.label}</label>
                <input required type={f.type || 'text'} value={form[f.key]}
                  onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  style={inputStyle} />
              </div>
            ))}
          </div>
          <button type="submit" disabled={adding} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #0891b2, #67e8f9)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: adding ? 0.6 : 1
          }}>
            <PlusCircle style={{ width: 16, height: 16 }} />
            {adding ? 'Adding...' : 'Add Venue'}
          </button>
        </form>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 16 }}>
        {venues.map(v => {
          const isEditing = editId === v.id;
          return (
            <div key={v.id} style={{ ...cardStyle, padding: 22 }}>
              {isEditing ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['name', 'address', 'city', 'state', 'capacity'].map(k => (
                    <input key={k} placeholder={k} value={editForm[k] || ''} onChange={e => setEditForm(p => ({ ...p, [k]: e.target.value }))}
                      type={k === 'capacity' ? 'number' : 'text'}
                      style={{ ...inputStyle, padding: '8px 12px', fontSize: 12 }} />
                  ))}
                  <div style={{ display: 'flex', gap: 6, marginTop: 4 }}>
                    <button onClick={handleUpdate} style={{ padding: '6px 14px', borderRadius: 8, border: 'none', background: '#059669', color: '#fff', fontSize: 12, fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                      <Check style={{ width: 14, height: 14 }} /> Save
                    </button>
                    <button onClick={() => setEditId(null)} style={{ padding: '6px 14px', borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)', color: 'var(--c-text-muted)', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
                    <div style={{ width: 36, height: 36, borderRadius: 8, background: 'rgba(8,145,178,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <MapPin style={{ width: 18, height: 18, color: '#0891b2' }} />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-main)', flex: 1 }}>{v.name}</span>
                    <button onClick={() => startEdit(v)} style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid var(--c-border)', background: 'var(--c-bg)', cursor: 'pointer' }}>
                      <Pencil style={{ width: 13, height: 13, color: '#6366f1' }} />
                    </button>
                    <button onClick={() => handleDelete(v.id)} style={{ padding: '4px 6px', borderRadius: 6, border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)', cursor: 'pointer' }}>
                      <Trash2 style={{ width: 13, height: 13, color: '#dc2626' }} />
                    </button>
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 6 }}>{v.address}</div>
                  <div style={{ fontSize: 12, color: 'var(--c-text-muted)', marginBottom: 8 }}>{v.city}, {v.state}, {v.country}</div>
                  <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 700, color: '#0891b2', background: 'rgba(8,145,178,0.1)', padding: '4px 12px', borderRadius: 20, border: '1px solid rgba(8,145,178,0.2)' }}>
                    <Users style={{ width: 12, height: 12 }} />
                    Capacity: {v.capacity?.toLocaleString()}
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
      </div>
      </main>
    </div>
  );
}
