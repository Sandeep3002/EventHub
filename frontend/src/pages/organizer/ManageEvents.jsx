import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import { Eye, Edit3, Trash2, Plus } from 'lucide-react';
import { cardStyle, headingStyle } from '../../styles/pageStyles';

export default function ManageEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const [data, vens] = await Promise.all([
          eventService.getEvents(),
          eventService.getVenues(),
        ]);
        let list = Array.isArray(data) ? data : (data?.value || data?.items || []);
        if (user?.role === 'organizer') {
          list = list.filter(e => e.organizer_id === user.id);
        }
        setEvents(list);
        setVenues(vens);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, [user]);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this event?')) return;
    try {
      await eventService.deleteEvent(id);
      setEvents(prev => prev.filter(e => (e.id || e._id) !== id));
    } catch (err) {
      console.error('Failed to delete event:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '-';
    try {
      return new Date(dateStr).toLocaleDateString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric'
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <main className="dashboard-content space-y-6">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div className="flex items-center justify-between" style={{ marginBottom: 24 }}>
            <h1 style={headingStyle}>Manage Events</h1>
            <Link to="/admin/create-event" style={{
              background: 'linear-gradient(135deg, #6366f1, #4f46e5)',
              color: '#ffffff',
              padding: '10px 18px',
              borderRadius: 10,
              fontSize: 13,
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 6,
              textDecoration: 'none',
              boxShadow: '0 2px 8px rgba(99, 102, 241, 0.25)',
            }}>
              <Plus className="w-4 h-4" />
              <span>Create Event</span>
            </Link>
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            <div className="overflow-x-auto">
              {loading ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-muted)' }}>Loading events...</div>
              ) : events.length === 0 ? (
                <div style={{ padding: 48, textAlign: 'center', color: 'var(--c-text-muted)' }}>No events found. Create your first event!</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                      {['Title', 'Date', 'Location', 'Capacity', 'Status', 'Actions'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 18px', fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {events.map((evt) => {
                      const id = evt.id || evt._id;
                      const isPublished = (evt.status || 'draft').toLowerCase() === 'published';
                      return (
                        <tr key={id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                          <td style={{ padding: '14px 18px', fontWeight: 600, color: 'var(--c-text-main)' }}>{evt.title}</td>
                          <td style={{ padding: '14px 18px', color: 'var(--c-text-muted)' }}>{formatDate(evt.start_time)}</td>
                          <td style={{ padding: '14px 18px', color: 'var(--c-text-muted)' }}>{venues.find(v => v.id === evt.venue_id)?.name || evt.venue_id || '-'}</td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6',
                              padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, display: 'inline-block',
                            }}>
                              {evt.available_tickets || 0} / {evt.capacity || 0}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <span style={{
                              display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                              background: isPublished ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                              color: isPublished ? '#10b981' : '#f59e0b',
                              border: `1px solid ${isPublished ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                            }}>
                              {evt.status || 'Draft'}
                            </span>
                          </td>
                          <td style={{ padding: '14px 18px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <Link to="/customer/events" title="View in Events Catalogue" style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-muted)', textDecoration: 'none',
                              }}>
                                <Eye className="w-4 h-4" />
                              </Link>
                              <Link to={`/admin/create-event?edit=${id}`} style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--c-text-muted)', textDecoration: 'none',
                              }}>
                                <Edit3 className="w-4 h-4" />
                              </Link>
                              <button onClick={() => handleDelete(id)} style={{
                                width: 32, height: 32, borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)',
                                display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              }}>
                                <Trash2 className="w-4 h-4" style={{ color: '#ef4444' }} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
