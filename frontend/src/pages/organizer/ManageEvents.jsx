import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { Eye, Edit3, Trash2, Plus } from 'lucide-react';

export default function ManageEvents() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadEvents() {
      try {
        const data = await eventService.getEvents();
        const list = Array.isArray(data) ? data : (data?.value || data?.items || []);
        setEvents(list);
      } catch (err) {
        console.error('Failed to load events:', err);
        setEvents([]);
      } finally {
        setLoading(false);
      }
    }
    loadEvents();
  }, []);

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
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900">Manage Events</h1>
          <Link to="/admin/create-event" className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>Create Event</span>
          </Link>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            {loading ? (
              <div className="p-8 text-center text-slate-400">Loading events...</div>
            ) : events.length === 0 ? (
              <div className="p-8 text-center text-slate-400">No events found. Create your first event!</div>
            ) : (
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Date</th>
                    <th>Location</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {events.map((evt) => {
                    const id = evt.id || evt._id;
                    return (
                      <tr key={id}>
                        <td className="font-semibold text-slate-900">{evt.title}</td>
                        <td>{formatDate(evt.start_time)}</td>
                        <td>{evt.venue_id || '-'}</td>
                        <td>{evt.available_tickets || 0} / {evt.capacity || 0}</td>
                        <td>
                          <span className={`status-pill status-${(evt.status || 'draft').toLowerCase()}`}>
                            {evt.status || 'Draft'}
                          </span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3 text-slate-400">
                            <Link to={`/admin/manage-events`} className="hover:text-blue-600">
                              <Eye className="w-4 h-4" />
                            </Link>
                            <Link to={`/admin/create-event?edit=${id}`} className="hover:text-blue-600">
                              <Edit3 className="w-4 h-4" />
                            </Link>
                            <button onClick={() => handleDelete(id)} className="hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
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
      </main>
    </div>
  );
}
