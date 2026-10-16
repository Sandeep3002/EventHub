import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { bookingService } from '../../services/bookingService';
import { Users, Search, QrCode, Trash2, Clock, X, Download, CheckCircle2 } from 'lucide-react';
import { cardStyle } from '../../styles/pageStyles';

export default function AllRegistrations() {
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    bookingService.getAllRegistrations().then(regs => {
      setRegistrations(Array.isArray(regs) ? regs : []);
      setLoading(false);
    }).catch(() => setLoading(false));
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
      ['Booking Status', (booking.status || 'confirmed').toUpperCase()],
      ['Amount Paid', `₹${booking.total_amount || 0}`],
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
    const q = search.toLowerCase();
    return !search ||
      (r.attendee_name || '').toLowerCase().includes(q) ||
      (r.attendee_email || '').toLowerCase().includes(q) ||
      (r.event_title || '').toLowerCase().includes(q) ||
      (r.qr_code_token || '').toLowerCase().includes(q);
  });

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
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>
          <div style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-main)', margin: 0, display: 'flex', alignItems: 'center', gap: 8 }}>
              <Users className="w-6 h-6 text-purple-600" />
              All Registrations
            </h1>
            <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 4 }}>All bookings and registrations across the platform</p>
          </div>

          <div style={{
            display: 'flex', alignItems: 'center', gap: 10,
            background: 'var(--c-surface)', border: '1px solid var(--c-border)',
            borderRadius: 10, padding: '10px 14px', marginBottom: 20,
          }}>
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by name, email, or event..." value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                border: 'none', outline: 'none', background: 'transparent',
                fontSize: 13, color: 'var(--c-text-main)', width: '100%',
              }} />
          </div>

          <div style={{ ...cardStyle, overflow: 'hidden' }}>
            {loading ? (
              <div style={{ padding: 64, textAlign: 'center', color: 'var(--c-text-muted)' }}>Loading registrations...</div>
            ) : filtered.length === 0 ? (
              <div style={{
                padding: '64px 24px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
              }}>
                <div style={{
                  width: 56,
                  height: 56,
                  borderRadius: 16,
                  background: 'rgba(139, 92, 246, 0.1)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Users style={{ width: 28, height: 28, color: '#8b5cf6' }} />
                </div>
                <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-main)', margin: '0 0 6px 0' }}>
                  No registrations found
                </p>
                <p style={{ fontSize: 13, color: 'var(--c-text-muted)', margin: 0, maxWidth: 360, lineHeight: 1.5 }}>
                  {search ? 'Try adjusting your search keywords.' : 'When attendees register for events, they will appear here.'}
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--c-bg)', borderBottom: '1px solid var(--c-border)' }}>
                      {['Attendee', 'Phone', 'Event', 'Amount', 'Pass Code', 'Date', 'Status', 'Action'].map(h => (
                        <th key={h} style={{ textAlign: 'left', padding: '14px 16px', fontSize: 11, fontWeight: 700, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map(r => (
                      <tr key={r.id} style={{ borderBottom: '1px solid var(--c-border)' }}>
                        <td style={{ padding: '14px 16px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--c-text-main)', fontSize: 13 }}>{r.attendee_name || '-'}</div>
                          <div style={{ fontSize: 11, color: 'var(--c-text-muted)' }}>{r.attendee_email || '-'}</div>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 13, color: 'var(--c-text-muted)' }}>{r.attendee_phone || '-'}</td>
                        <td style={{ padding: '14px 16px', fontSize: 13, fontWeight: 600, color: 'var(--c-text-main)' }}>{r.event_title || '-'}</td>
                        <td style={{ padding: '14px 16px', fontWeight: 700, color: '#10b981' }}>₹{r.total_amount || 0}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <button
                            onClick={() => setSelectedPass(r)}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6',
                              border: '1px solid rgba(124, 58, 237, 0.25)',
                              padding: '4px 10px', borderRadius: 8, fontSize: 11, fontFamily: 'monospace', fontWeight: 600,
                              cursor: 'pointer',
                            }}
                            title="Click to view & verify QR Code"
                          >
                            <QrCode style={{ width: 14, height: 14, color: '#8b5cf6' }} />
                            <span>{r.qr_code_token || '-'}</span>
                          </button>
                        </td>
                        <td style={{ padding: '14px 16px', fontSize: 12, color: 'var(--c-text-muted)' }}>{formatDate(r.created_at)}</td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            display: 'inline-block', padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 700, textTransform: 'capitalize',
                            background: r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(245, 158, 11, 0.12)',
                            color: r.status === 'confirmed' ? '#10b981' : '#f59e0b',
                            border: `1px solid ${r.status === 'confirmed' ? 'rgba(16, 185, 129, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`,
                          }}>{r.status || 'pending'}</span>
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <button onClick={() => handleDelete(r.id)} title="Delete"
                            style={{
                              width: '32px', height: '32px', borderRadius: '8px', border: '1px solid rgba(239, 68, 68, 0.3)',
                              background: 'rgba(239, 68, 68, 0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer',
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
          </div>
        </div>
      </main>

      {/* QR Code Modal */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="modal-content max-w-sm p-0 overflow-hidden" style={{ borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)' }} className="px-6 pt-6 pb-5 relative text-center">
              <button
                onClick={() => setSelectedPass(null)}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="inline-flex items-center gap-1.5 bg-white/10 text-purple-200 px-3 py-1 rounded-full text-[11px] font-semibold mb-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Verified Entry Pass
              </div>
              <h3 className="text-base font-bold text-white leading-snug line-clamp-2">{selectedPass.event_title || 'Event Pass'}</h3>
              <p className="text-xs text-purple-200 mt-1">{selectedPass.attendee_name || 'Attendee'}</p>
            </div>

            <div className="p-6 text-center" style={{ background: 'var(--c-surface)' }}>
              <div data-qr-box="true" className="inline-block p-3 bg-white rounded-2xl shadow-md border border-slate-100 mb-4">
                <img
                  src={generateQRDataURL(selectedPass.qr_code_token || 'EVTHUB')}
                  alt="QR Pass Code"
                  className="w-44 h-44 object-contain"
                />
              </div>

              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 mb-4 border border-slate-100 dark:border-slate-700">
                <div className="text-[11px] text-slate-400 uppercase tracking-wider font-semibold">Pass Code</div>
                <div className="text-sm font-mono font-bold text-purple-600 mt-0.5">{selectedPass.qr_code_token || '-'}</div>
              </div>

              <button
                onClick={() => handleDownloadPass(selectedPass)}
                className="w-full btn-primary text-xs py-2.5 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                <span>Download Pass</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
