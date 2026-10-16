import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { bookingService } from '../../services/bookingService';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import Loading from '../../components/Loading';
import { Users, QrCode, CheckCircle2, Search, Mail, X, Send, Clock, Ticket, Trash2, Download } from 'lucide-react';

export default function Registrations() {
  const { user } = useAuth();
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
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await bookingService.getAllRegistrations();
        let list = Array.isArray(data) ? data : [];
        // Organizers see only registrations for their own events
        if (user?.role === 'organizer') {
          const events = await eventService.getEvents();
          const myEventIds = events.filter(e => e.organizer_id === user.id).map(e => e.id || e._id);
          list = list.filter(r => myEventIds.includes(r.event_id));
        }
        setRegistrations(list);
      } catch (err) {
        console.error('Failed to load registrations:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const generateQRDataURL = (text) => {
    const size = 200;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    const hash = (text || 'EVTHUB').split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
    const cellSize = 8;
    const gridSize = Math.floor(size / cellSize);
    const margin = 2;

    ctx.fillStyle = '#1E1B4B';

    const drawFinder = (x, y) => {
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i === 0 || i === 6 || j === 0 || j === 6 || (i >= 2 && i <= 4 && j >= 2 && j <= 4)) {
            ctx.fillRect((x + i) * cellSize, (y + j) * cellSize, cellSize, cellSize);
          }
        }
      }
    };
    drawFinder(margin, margin);
    drawFinder(gridSize - 7 - margin, margin);
    drawFinder(margin, gridSize - 7 - margin);

    let seed = hash;
    const pseudoRandom = () => { seed = (seed * 16807 + 12345) % 2147483647; return seed / 2147483647; };

    for (let i = margin; i < gridSize - margin; i++) {
      for (let j = margin; j < gridSize - margin; j++) {
        const inFinder = (i < margin + 8 && j < margin + 8) ||
                         (i > gridSize - 9 - margin && j < margin + 8) ||
                         (i < margin + 8 && j > gridSize - 9 - margin);
        if (!inFinder && pseudoRandom() > 0.5) {
          ctx.fillRect(i * cellSize, j * cellSize, cellSize, cellSize);
        }
      }
    }

    return canvas.toDataURL();
  };

  const handleDownloadPass = (booking) => {
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 520;
    const ctx = canvas.getContext('2d');

    const gradient = ctx.createLinearGradient(0, 0, 400, 520);
    gradient.addColorStop(0, '#1E1B4B');
    gradient.addColorStop(0.5, '#312E81');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 520);

    ctx.fillStyle = '#A78BFA';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DIGITAL ENTRY PASS', 30, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(booking.event_title || 'Event', 30, 70);

    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(120, 100, 160, 160);

    const qrImg = new Image();
    qrImg.src = generateQRDataURL(booking.qr_code_token || 'EVTHUB');
    ctx.drawImage(qrImg, 120, 100, 160, 160);

    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 280, 400, 1);

    const details = [
      ['Pass Code', booking.qr_code_token || '-'],
      ['Attendee', booking.attendee_name || '-'],
      ['Email', booking.attendee_email || '-'],
      ['Event', booking.event_title || '-'],
      ['Status', (booking.status || 'CONFIRMED').toUpperCase()],
    ];

    details.forEach(([label, value], i) => {
      const y = 305 + i * 38;
      ctx.fillStyle = '#A78BFA';
      ctx.font = '10px sans-serif';
      ctx.fillText(label, 30, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(value, 30, y + 18);
    });

    const link = document.createElement('a');
    link.download = `Pass-${booking.qr_code_token || 'ticket'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

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

      <main className="dashboard-content" style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 style={{ fontSize: 28, fontWeight: 800, color: 'var(--c-text-main)', margin: 0, letterSpacing: '-0.02em' }}>Registrations</h1>
            <p style={{ fontSize: 15, color: 'var(--c-text-muted)', marginTop: 6 }}>All attendees who registered for your events</p>
          </div>
          {selectedIds.length > 0 && (
            <button
              onClick={() => { setShowEmailModal(true); setEmailResult(null); setEmailSubject(''); setEmailMessage(''); }}
              className="btn-primary text-sm py-2.5 px-5 flex items-center gap-2 shadow-md shadow-blue-500/10 font-semibold"
            >
              <Mail className="w-4 h-4" />
              <span>Email {selectedIds.length} Attendee{selectedIds.length > 1 ? 's' : ''}</span>
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {[
            { label: 'Total', value: stats.total, icon: Users, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
            { label: 'Confirmed', value: stats.confirmed, icon: CheckCircle2, color: '#10b981', bg: 'rgba(16, 185, 129, 0.12)' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
            { label: 'Revenue', value: `$${stats.revenue.toLocaleString()}`, icon: Ticket, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.12)' },
          ].map((s, i) => (
            <div key={i} style={{
              background: 'var(--c-surface)',
              border: '1px solid var(--c-border)',
              borderRadius: 16,
              padding: '20px 24px',
              display: 'flex',
              alignItems: 'center',
              gap: 16,
              boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
            }}>
              <div style={{
                width: 50, height: 50, borderRadius: 14,
                background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0
              }}>
                <s.icon style={{ width: 24, height: 24, color: s.color }} />
              </div>
              <div>
                <div style={{ fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{s.label}</div>
                <div style={{ fontSize: 26, fontWeight: 800, color: 'var(--c-text-main)', lineHeight: 1.1 }}>{s.value}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div style={{
            flex: 1, display: 'flex', alignItems: 'center', gap: 12,
            background: 'var(--c-surface)', border: '1px solid var(--c-border)',
            borderRadius: 12, padding: '12px 18px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
          }}>
            <Search className="w-5 h-5 text-slate-400" style={{ flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search by name, email, event, or pass code..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 15, color: 'var(--c-text-main)', width: '100%',
              }}
            />
          </div>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            style={{
              background: 'var(--c-surface)',
              color: 'var(--c-text-main)',
              border: '1px solid var(--c-border)',
              borderRadius: 12,
              padding: '12px 20px',
              fontSize: 15,
              fontWeight: 600,
              cursor: 'pointer',
              outline: 'none',
              boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
            }}
          >
            <option value="all">All Status</option>
            <option value="confirmed">Confirmed</option>
            <option value="pending">Pending</option>
          </select>
        </div>

        {/* Table */}
        <div style={{
          background: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
        }}>
          {filtered.length === 0 ? (
            <div style={{
              padding: '68px 24px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              textAlign: 'center',
            }}>
              <div style={{
                width: 64,
                height: 64,
                borderRadius: 18,
                background: 'rgba(139, 92, 246, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: 16,
              }}>
                <Users style={{ width: 32, height: 32, color: '#8b5cf6' }} />
              </div>
              <p style={{ fontSize: 18, fontWeight: 700, color: 'var(--c-text-main)', margin: '0 0 8px 0' }}>
                No registrations yet
              </p>
              <p style={{ fontSize: 15, color: 'var(--c-text-muted)', margin: 0, maxWidth: 420, lineHeight: 1.5 }}>
                When attendees register for events, they'll appear here.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                    <th className="w-10" style={{ padding: '16px 20px' }}>
                      <input type="checkbox" checked={selectedIds.length === filtered.length && filtered.length > 0} onChange={toggleSelectAll} className="rounded" />
                    </th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Attendee</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Age</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Event</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Amount</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pass Code</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Date</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                    <th style={{ textAlign: 'left', padding: '16px 20px', fontSize: 12, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                      <td style={{ padding: '16px 20px' }}>
                        <input type="checkbox" checked={selectedIds.includes(r.id)} onChange={() => toggleSelect(r.id)} className="rounded" />
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <div style={{ fontWeight: 600, color: 'var(--c-text-main)', fontSize: 15 }}>{r.attendee_name || '-'}</div>
                        <div style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 2 }}>{r.attendee_email || '-'}</div>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--c-text-muted)' }}>{r.attendee_phone || '-'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 14, color: 'var(--c-text-muted)' }}>{r.attendee_age || '-'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 600, color: 'var(--c-text-main)' }}>{r.event_title || '-'}</td>
                      <td style={{ padding: '16px 20px', fontSize: 15, fontWeight: 700, color: '#10b981' }}>${r.total_amount || 0}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => setSelectedPass(r)}
                          style={{
                            display: 'inline-flex', alignItems: 'center', gap: 6,
                            background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6',
                            border: '1px solid rgba(124, 58, 237, 0.25)',
                            padding: '6px 14px', borderRadius: 8, fontSize: 13, fontFamily: 'monospace', fontWeight: 600,
                            cursor: 'pointer',
                          }}
                          title="Click to view & verify QR Code"
                        >
                          <QrCode style={{ width: 15, height: 15, color: '#8b5cf6' }} />
                          <span>{r.qr_code_token || '-'}</span>
                        </button>
                      </td>
                      <td style={{ padding: '16px 20px', fontSize: 13, color: 'var(--c-text-muted)' }}>{formatDate(r.created_at)}</td>
                      <td style={{ padding: '16px 20px' }}>
                        <span style={{
                          display: 'inline-block', padding: '5px 14px', borderRadius: 20, fontSize: 12, fontWeight: 700, textTransform: 'capitalize',
                          background: r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                          color: r.status === 'confirmed' ? '#10b981' : '#f59e0b',
                          border: `1px solid ${r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                        }}>
                          {r.status || 'pending'}
                        </span>
                      </td>
                      <td style={{ padding: '16px 20px' }}>
                        <button
                          onClick={() => handleDelete(r.id)}
                          title="Delete registration"
                          style={{
                            width: '36px', height: '36px', borderRadius: '8px',
                            border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
                          }}
                        >
                          <Trash2 style={{ width: '15px', height: '15px', color: '#ef4444' }} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {filtered.length > 0 && (
            <div style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--c-border)',
              background: 'var(--c-bg)',
              fontSize: 13,
              color: 'var(--c-text-muted)',
              display: 'flex',
              justifyContent: 'space-between',
            }}>
              <span>Showing {filtered.length} of {registrations.length} registrations</span>
              <span>{selectedIds.length} selected</span>
            </div>
          )}
        </div>
      </main>

      {/* QR Code Pass Modal */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="modal-content max-w-sm p-0 overflow-hidden" style={{ borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)' }} className="px-6 pt-6 pb-5 relative text-center">
              <button onClick={() => setSelectedPass(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>

              <div className="text-xs text-purple-200 font-bold uppercase tracking-wider mb-1">Attendee Pass & QR Code</div>
              <h3 className="text-xl font-extrabold text-white mb-4">{selectedPass.event_title || 'Event Pass'}</h3>

              <div data-qr-box="true" className="inline-block bg-white p-4 rounded-2xl shadow-xl">
                <img
                  src={generateQRDataURL(selectedPass.qr_code_token || 'EVTHUB')}
                  alt="QR Code"
                  className="w-48 h-48"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                <span className="font-mono text-white font-bold text-base tracking-wider">{selectedPass.qr_code_token || '-'}</span>
              </div>
            </div>

            <div className="px-6 py-5 space-y-3 bg-white">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Attendee</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5">{selectedPass.attendee_name || '-'}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Email</div>
                  <div className="font-bold text-slate-900 text-sm mt-0.5 truncate">{selectedPass.attendee_email || '-'}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Amount</div>
                  <div className="font-bold text-emerald-600 text-sm mt-0.5">${selectedPass.total_amount || 0}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3.5">
                  <div className="text-slate-400 text-xs font-semibold uppercase tracking-wide">Status</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                    <span className="font-bold text-emerald-600 uppercase text-xs">{selectedPass.status || 'confirmed'}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={() => handleDownloadPass(selectedPass)}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-purple-200 text-purple-700 bg-purple-50 hover:bg-purple-100 transition flex items-center justify-center gap-2"
                >
                  <Download className="w-4 h-4" />
                  Download
                </button>
                <button
                  onClick={() => setSelectedPass(null)}
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}
                  className="flex-1 py-3 text-sm font-bold rounded-xl text-white hover:opacity-90 transition shadow-lg shadow-purple-300/30"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
