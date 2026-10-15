import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { Upload, Building2 } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [submitting, setSubmitting] = useState(false);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    location: '',
    price: '',
    capacity: '',
    contact_phone: '',
    contact_email: '',
    banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  });

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, vens] = await Promise.all([
          eventService.getCategories(),
          eventService.getVenues(),
        ]);
        setCategories(cats || []);
        setVenues(vens || []);
      } catch {
        /* ignore */
      }

      if (editId) {
        try {
          const ev = await eventService.getEventById(editId);
          const start = ev.start_time ? new Date(ev.start_time) : null;
          setForm({
            title: ev.title || '',
            description: ev.description || '',
            category: ev.category_id || '',
            date: start ? start.toISOString().split('T')[0] : '',
            startTime: start ? start.toTimeString().slice(0, 5) : '',
            location: ev.venue_id || '',
            price: ev.price != null ? String(ev.price) : '',
            capacity: ev.capacity != null ? String(ev.capacity) : '',
            contact_phone: ev.contact_phone || '',
            contact_email: ev.contact_email || '',
            banner_image: ev.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
          });
        } catch (err) {
          alert('Failed to load event: ' + err.message);
        }
      }
    }
    loadData();
  }, [editId]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime =
        form.date && form.startTime
          ? new Date(`${form.date}T${form.startTime}:00`).toISOString()
          : new Date().toISOString();
      const endDate = new Date(startDateTime);
      endDate.setHours(endDate.getHours() + 3);

      const payload = {
        title: form.title,
        description: form.description,
        category_id: form.category || 'general',
        venue_id: form.location || 'tbd',
        start_time: startDateTime,
        end_time: endDate.toISOString(),
        banner_image: form.banner_image,
        price: Number(form.price || 0),
        capacity: Number(form.capacity || 100),
        contact_phone: form.contact_phone || '',
        contact_email: form.contact_email || '',
        tags: [],
      };

      if (editId) {
        await eventService.updateEvent(editId, payload);
      } else {
        await eventService.createEvent(payload);
      }
      navigate('/admin/manage-events');
    } catch (err) {
      alert('Failed to save event: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    background: 'var(--c-surface)',
    border: '1px solid var(--c-border)',
    borderRadius: 16,
    padding: 32,
    boxShadow: '0 2px 12px rgba(0,0,0,.06)',
  };

  const inputStyle = {
    width: '100%',
    padding: '10px 14px',
    border: '1.5px solid var(--c-border)',
    borderRadius: 10,
    fontSize: 13,
    outline: 'none',
    background: 'var(--c-bg)',
    color: 'var(--c-text-main)',
    boxSizing: 'border-box',
  };

  const labelStyle = {
    display: 'block',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--c-text-muted)',
    marginBottom: 6,
  };

  const groupStyle = { marginBottom: 18 };

  const primaryBtn = {
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    padding: '12px 24px',
    fontWeight: 700,
    fontSize: 14,
    cursor: 'pointer',
    width: '100%',
    marginTop: 8,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <main className="dashboard-content">
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>
              {editId ? 'Edit Event' : 'Create New Event'}
            </h1>
            <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 4 }}>
              {editId ? 'Update your event details below.' : 'Fill in the event information below to publish your event.'}
            </p>
          </div>

          <form onSubmit={handleSubmit} style={cardStyle}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 12, padding: 10, display: 'flex' }}>
              <Building2 size={22} color="#fff" />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: 'var(--c-text-main)' }}>
                {editId ? 'Edit Event Details' : 'Event Details'}
              </h2>
              <p style={{ margin: 0, fontSize: 12, color: 'var(--c-text-muted)' }}>
                Fill in your event information below.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <div style={groupStyle}>
                <label style={labelStyle}>Event Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  style={inputStyle}
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div style={groupStyle}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  name="description"
                  placeholder="Enter event description"
                  rows={4}
                  style={{ ...inputStyle, resize: 'vertical' }}
                  required
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div style={groupStyle}>
                <label style={labelStyle}>Category *</label>
                <select
                  name="category"
                  style={inputStyle}
                  required
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Event Date *</label>
                  <input
                    type="date"
                    name="date"
                    style={inputStyle}
                    required
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    style={inputStyle}
                    required
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Venue *</label>
                  <select
                    name="location"
                    style={inputStyle}
                    required
                    value={form.location}
                    onChange={handleChange}
                  >
                    <option value="">Select venue</option>
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name} — {v.city}
                      </option>
                    ))}
                  </select>
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Price (₹) *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    style={inputStyle}
                    required
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div style={groupStyle}>
                <label style={labelStyle}>Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Enter capacity"
                  style={inputStyle}
                  required
                  value={form.capacity}
                  onChange={handleChange}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div style={groupStyle}>
                  <label style={labelStyle}>Contact Phone *</label>
                  <input
                    type="tel"
                    name="contact_phone"
                    placeholder="e.g. +91 98765 43210"
                    style={inputStyle}
                    required
                    value={form.contact_phone}
                    onChange={handleChange}
                  />
                </div>
                <div style={groupStyle}>
                  <label style={labelStyle}>Contact Email *</label>
                  <input
                    type="email"
                    name="contact_email"
                    placeholder="e.g. contact@eventhub.com"
                    style={inputStyle}
                    required
                    value={form.contact_email}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Submit Button */}
              <button type="submit" style={primaryBtn} disabled={submitting}>
                {submitting
                  ? editId
                    ? 'Updating…'
                    : 'Creating…'
                  : editId
                  ? 'Update Event'
                  : 'Create Event'}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <label style={labelStyle}>Event Image</label>

              <div
                style={{
                  border: '2px dashed var(--c-border)',
                  borderRadius: 12,
                  minHeight: 180,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  background: 'var(--c-bg)',
                  padding: 8,
                }}
                onClick={() => document.getElementById('event-image-file')?.click()}
              >
                {form.banner_image ? (
                  <div style={{ width: '100%', textAlign: 'center' }}>
                    <img
                      src={form.banner_image}
                      alt="Banner"
                      style={{ maxHeight: 140, width: '100%', objectFit: 'cover', borderRadius: 8 }}
                    />
                    <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Click to change</span>
                  </div>
                ) : (
                  <>
                    <Upload size={28} color="#94a3b8" />
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginTop: 8 }}>
                      Upload event image
                    </span>
                    <span style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG (Max 5MB)</span>
                  </>
                )}
                <input
                  id="event-image-file"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    if (file.size > 5 * 1024 * 1024) {
                      alert('Image exceeds 5MB.');
                      return;
                    }
                    const reader = new FileReader();
                    reader.onload = (ev) =>
                      setForm((f) => ({ ...f, banner_image: ev.target?.result }));
                    reader.readAsDataURL(file);
                  }}
                />
              </div>

              <div style={groupStyle}>
                <label style={{ ...labelStyle, color: '#94a3b8' }}>Or paste image URL</label>
                <input
                  type="url"
                  placeholder="https://example.com/banner.jpg"
                  style={inputStyle}
                  value={form.banner_image.startsWith('data:') ? '' : form.banner_image}
                  onChange={(e) => setForm((f) => ({ ...f, banner_image: e.target.value }))}
                />
              </div>

            </div>
          </div>
          </form>
        </div>
      </main>
    </div>
  );
}
