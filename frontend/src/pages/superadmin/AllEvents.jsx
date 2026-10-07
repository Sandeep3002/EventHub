import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { request } from '../../services/api';
import { Calendar, Search, Eye, Trash2, CheckCircle2, XCircle } from 'lucide-react';

export default function AllEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    eventService.getEvents().then(evts => {
      setEvents(Array.isArray(evts) ? evts : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e =>
    !search || (e.title || '').toLowerCase().includes(search.toLowerCase())
  );

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
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Calendar className="w-6 h-6 text-purple-600" />
            All Events
          </h1>
          <p className="text-xs text-slate-500 mt-1">Manage all events across all admins</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search events..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm text-slate-700 w-full" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No events found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event Name</th>
                    <th>Category</th>
                    <th>Date</th>
                    <th>Price</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(e => {
                    const id = e.id || e._id;
                    return (
                      <tr key={id}>
                        <td className="font-semibold text-slate-900">{e.title}</td>
                        <td className="text-xs text-slate-600">{e.category_id || 'General'}</td>
                        <td className="text-xs">{formatDate(e.start_time)}</td>
                        <td className="font-bold text-emerald-600">₹{e.price || 0}</td>
                        <td className="text-xs">{e.available_tickets || 0}/{e.capacity || 0}</td>
                        <td>
                          <span style={{
                            padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: (e.status || 'draft') === 'published' ? '#ecfdf5' : '#f8fafc',
                            color: (e.status || 'draft') === 'published' ? '#10b981' : '#94a3b8',
                          }}>
                            {e.status || 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <button onClick={() => handleToggleStatus(e)} title={e.status === 'published' ? 'Unpublish' : 'Publish'}
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #e2e8f0',
                                background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                              }}>
                              {e.status === 'published'
                                ? <XCircle style={{ width: '14px', height: '14px', color: '#f59e0b' }} />
                                : <CheckCircle2 style={{ width: '14px', height: '14px', color: '#10b981' }} />}
                            </button>
                            <button onClick={() => handleDelete(id)} title="Delete"
                              style={{
                                width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2',
                                background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
    </div>
  );
}
