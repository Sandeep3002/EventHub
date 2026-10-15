import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { request } from '../../services/api';
import { Calendar, Search, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';
import { cardStyle } from '../../styles/pageStyles';

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([
      eventService.getEvents(),
      eventService.getCategories().catch(() => []),
      request('/users', {}, []).catch(() => []),
    ]).then(([evts, cats, usrs]) => {
      setEvents(Array.isArray(evts) ? evts : []);
      setCategories(Array.isArray(cats) ? cats : []);
      setUsers(Array.isArray(usrs) ? usrs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const getOrganizerName = (e) => {
    if (e.organizer_name) return e.organizer_name;
    const found = users.find(u => (u.id || u._id) === e.organizer_id);
    return found?.full_name || found?.email || 'Organizer';
  };

  const filtered = events.filter(e => {
    const org = getOrganizerName(e).toLowerCase();
    const q = search.toLowerCase();
    return !search || (e.title || '').toLowerCase().includes(q) || org.includes(q);
  });

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(e => (e.id || e._id) !== id));
    } catch {}
  };

  const handleToggleStatus = async (event) => {
    const newStatus = event.status === 'published' ? 'draft' : 'published';
    try {
      await request(`/events/${event.id || event._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...event, status: newStatus }),
      });
      setEvents(prev => prev.map(e => (e.id || e._id) === (event.id || event._id) ? { ...e, status: newStatus } : e));
    } catch {}
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '-'; }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="superadmin" />
      <main className="dashboard-content space-y-6">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Calendar className="w-6 h-6 text-purple-600" />
              All Events
            </h1>
            <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 4 }}>Manage all events across all admins</p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--c-surface)', border: '1px solid var(--c-border)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          }}>
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search events by name or organizer..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--c-text-main)', width: '100%',
              }} />
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            {loading ? <div style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-muted)' }}>Loading...</div> : filtered.length === 0 ? (
              <div style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-muted)' }}>No events found.</div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                      {['Event Name', 'Organizer', 'Category', 'Date', 'Price', 'Capacity', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(e => {
                      const id = e.id || e._id;
                      const orgName = getOrganizerName(e);
                      const isPublished = (e.status || 'draft') === 'published';
                      return (
                        <tr key={id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                          <td style={{ padding: '14px 16px', fontWeight: 600, color: 'var(--c-text-main)' }}>{e.title}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              display: 'inline-flex', alignItems: 'center', gap: '8px',
                              fontWeight: 600, color: 'var(--c-text-main)'
                            }}>
                              <span style={{
                                width: '26px', height: '26px', borderRadius: '50%',
                                background: 'rgba(124, 58, 237, 0.14)', color: '#8b5cf6', display: 'inline-flex',
                                alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 700
                              }}>
                                {(orgName || 'O')[0].toUpperCase()}
                              </span>
                              <span>{orgName}</span>
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px', color: 'var(--c-text-muted)' }}>{categories.find(c => c.id === e.category_id)?.name || e.category_id || 'General'}</td>
                          <td style={{ padding: '14px 16px', color: 'var(--c-text-muted)', fontSize: 12 }}>{formatDate(e.start_time)}</td>
                          <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>₹{e.price || 0}</td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6',
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block',
                            }}>
                              {e.available_tickets || 0}/{e.capacity || 0}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                              background: isPublished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: isPublished ? '#10b981' : '#f59e0b',
                              border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            }}>
                              {e.status || 'Draft'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 16px' }}>
                            <div style={{ display: 'flex', gap: '6px' }}>
                              <button onClick={() => handleToggleStatus(e)} title={isPublished ? 'Unpublish' : 'Publish'}
                                style={{
                                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid var(--c-border)',
                                  background: 'var(--c-bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                                }}>
                                {isPublished
                                  ? <XCircle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                                  : <CheckCircle2 style={{ width: '14px', height: '14px', color: '#10b981' }} />}
                              </button>
                              <button onClick={() => handleDelete(id)} title="Delete"
                                style={{
                                  width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)',
                                  background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
        </div>
      </main>
    </div>
  );
}
