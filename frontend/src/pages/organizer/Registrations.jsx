import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { bookingService } from '../../services/bookingService';
import Loading from '../../components/Loading';
import { Users, QrCode, CheckCircle2, Search, Mail, X, Send, Calendar, Clock, Ticket, Trash2 } from 'lucide-react';

export default function Registrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedIds, setSelectedIds] = useState([]);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [emailResult, setEmailResult] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await bookingService.getAllRegistrations();
        const list = Array.isArray(data) ? data : [];
        setRegistrations(list);
      } catch (err) {
        console.error('Failed to load registrations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = registrations.filter(r => {
    const matchesSearch = !searchTerm ||
      (r.attendee_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.attendee_email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.event_title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (r.qr_code_token || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || r.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: registrations.length,
    confirmed: registrations.filter(r => r.status === 'confirmed').length,
    pending: registrations.filter(r => r.status === 'pending').length,
    revenue: registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0),
  };

  const toggleSelect = (id) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === filtered.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(filtered.map(r => r.id));
    }
  };

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) return;
    setSending(true);
    try {
      const result = await bookingService.sendEmailToAttendees(selectedIds, emailSubject, emailMessage);
      setEmailResult(result);
    } catch (err) {
      setEmailResult({ sent_count: 0, error: err.message });
    } finally {
      setSending(false);
    }
  };

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return d; }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this registration?')) return;
    try {
      await bookingService.deleteRegistration(id);
      setRegistrations(prev => prev.filter(r => r.id !== id));
      setSelectedIds(prev => prev.filter(x => x !== id));
    } catch (err) {
      alert('Failed to delete: ' + (err.message || 'Unknown error'));
    }
  };

  if (loading) return <Loading label="Loading Registrations..." />;

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <main className="dashboard-content space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Registrations</h1>
            <p className="text-xs text-slate-500 mt-1">All attendees who registered for your events</p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => { setShowEmailModal(true); setEmailResult(null); setEmailSubject(''); setEmailMessage(''); }}
              className="btn-primary text-xs py-2.5 px-4 flex items-center gap-1.5"
            >
              <Mail className="w-4 h-4" />
              <span>Email {selectedIds.length} Attendee{selectedIds.length > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: 'text-emerald-600', bg: 'bg-emerald-50' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: Ticket, color: 'text-blue-600', bg: 'bg-blue-50' },
          ].map((s, i) => (
            <div key={i} className="bg-white border border-slate-200 rounded-xl p-4 flex items-center gap-3 shadow-sm">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <s.icon className={`w-5 h-5 ${s.color}`} />
              </div>
              <div>
                <div className="text-[11px] text-slate-400 font-semibold uppercase">{s.label}</div>
                <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by name, email, event, or pass code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-slate-700 w-full"
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="form-select text-xs py-2.5 w-auto"
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Users className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">No registrations yet</p>
              <p className="text-xs mt-1">When attendees register for events, they'll appear here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th className="w-10">
                      <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                    </th>
                    <th>Attendee</th>
                    <th>Phone</th>
                    <th>Age</th>
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
                        <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                      </td>
                      <td>
                        <div className="font-semibold text-slate-900">{r.attendee_name || '-'}</div>
                        <div className="text-[11px] text-slate-400">{r.attendee_email || '-'}</div>
                      </td>
                      <td className="text-slate-600">{r.attendee_phone || '-'}</td>
                      <td className="text-slate-600">{r.attendee_age || '-'}</td>
                      <td className="font-medium text-slate-800">{r.event_title || '-'}</td>
                      <td className="font-bold text-emerald-600">${r.total_amount || 0}</td>
                      <td>
                        <span className="inline-flex items-center gap-1 bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded text-[11px] font-mono font-semibold">
                          <QrCode className="w-3 h-3" />
                          {r.qr_code_token || '-'}
                        </span>
                      </td>
                      <td className="text-slate-500 text-xs">{formatDate(r.created_at)}</td>
                      <td>
                        <span className={`status-pill ${r.status === 'confirmed' ? 'status-published' : 'status-draft'}`}>
                          {r.status || 'pending'}
                        </span>
                      </td>
                      <td>
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete registration"
                          style={{
                            width: '32px', height: '32px', borderRadius: '8px',
                            border: '1px solid #fee2e2', background: '#fff5f5',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: '14px', height: '14px', color: '#ef4444' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400 flex justify-between">
              <span>Showing {filtered.length} of {registrations.length} registrations</span>
              <span>{selectedIds.length} selected</span>
            </div>
          )}
        </div>
      </main>

      {/* Email Modal */}
      {showEmailModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg p-0 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
              <button onClick={() => setShowEmailModal(false)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Mail className="w-5 h-5" />
                Send Email to Attendees
              </h3>
              <p className="text-xs text-blue-100 mt-1">
                Sending to <strong>{selectedIds.length}</strong> selected attendee{selectedIds.length > 1 ? 's' : ''}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {!emailResult ? (
                <>
                  <div className="form-group">
                    <label className="form-label text-xs">Subject <span className="text-red-500">*</span></label>
                    <input
                      type="text"
                      value={emailSubject}
                      onChange={e => setEmailSubject(e.target.value)}
                      placeholder="e.g. Event Reminder - Java Seminar"
                      className="form-input text-sm"
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label text-xs">Message <span className="text-red-500">*</span></label>
                    <textarea
                      value={emailMessage}
                      onChange={e => setEmailMessage(e.target.value)}
                      placeholder="Write your message to the attendees..."
                      rows={5}
                      className="form-textarea text-sm"
                    />
                  </div>
                  <button
                    onClick={handleSendEmail}
                    disabled={sending || !emailSubject.trim() || !emailMessage.trim()}
                    className="btn-primary w-full py-3 text-sm font-bold rounded-xl flex items-center justify-center gap-2"
                  >
                    {sending ? 'Sending...' : (
                      <>
                        <Send className="w-4 h-4" />
                        <span>Send Email</span>
                      </>
                    )}
                  </button>
                </>
              ) : (
                <div className="text-center py-4 space-y-3">
                  <div className="w-14 h-14 bg-emerald-50 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h4 className="text-lg font-bold text-slate-900">
                    {emailResult.sent_count > 0 ? 'Emails Sent!' : 'Email Queued'}
                  </h4>
                  <p className="text-xs text-slate-500">
                    {emailResult.sent_count} email{emailResult.sent_count !== 1 ? 's' : ''} sent to attendees.
                  </p>
                  <button onClick={() => setShowEmailModal(false)} className="btn-primary py-2.5 px-6 text-sm rounded-xl">
                    Done
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
