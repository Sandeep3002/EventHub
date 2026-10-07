import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { bookingService } from '../../services/bookingService';
import { Users, Search, QrCode, Trash2, Clock } from 'lucide-react';

export default function AllRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    bookingService.getAllRegistrations().then(regs => {
      setRegistrations(Array.isArray(regs) ? regs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = registrations.filter(r =>
    !search ||
    (r.attendee_name || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.attendee_email || '').toLowerCase().includes(search.toLowerCase()) ||
    (r.event_title || '').toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    try {
      await bookingService.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
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
            <Users className="w-6 h-6 text-purple-600" />
            All Registrations
          </h1>
          <p className="text-xs text-slate-500 mt-1">All bookings and registrations across the platform</p>
        </div>

        <div className="flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
          <Search className="w-4 h-4 text-slate-400" />
          <input type="text" placeholder="Search by name, email, or event..." value={search}
            onChange={e => setSearch(e.target.value)}
            className="border-none outline-none bg-transparent text-sm text-slate-700 w-full" />
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? <div className="p-12 text-center text-slate-400">Loading...</div> : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">No registrations found.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Attendee</th>
                    <th>Phone</th>
                    <th>Event</th>
                    <th>Amount</th>
                    <th>Pass Code</th>
                    <th>Date</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div className="font-semibold text-slate-900">{r.attendee_name || '-'}</div>
                        <div className="text-[11px] text-slate-400">{r.attendee_email || '-'}</div>
                      </td>
                      <td className="text-slate-600">{r.attendee_phone || '-'}</td>
                      <td className="font-medium text-slate-800">{r.event_title || '-'}</td>
                      <td className="font-bold text-emerald-600">₹{r.total_amount || 0}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                          <QrCode className="w-3 h-3" />{r.qr_code_token || '-'}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">{formatDate(r.created_at)}</td>
                      <td>
                        <span style={{
                          padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: r.status === 'confirmed' ? '#ecfdf5' : '#fffbeb',
                          color: r.status === 'confirmed' ? '#10b981' : '#f59e0b',
                        }}>{r.status || 'pending'}</span>
                      </td>
                      <td>
                        <button onClick={() => handleDelete(r.id)} title="Delete"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #fee2e2',
                            background: '#fff5f5', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}>
                          <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {registrations.length} registrations
          </div>
        </div>
      </main>
    </div>
  );
}
