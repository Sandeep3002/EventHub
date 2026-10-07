import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { bookingService } from '../../services/bookingService';
import { Ticket, QrCode, Clock, X, Download, CheckCircle2 } from 'lucide-react';

export default function CustomerBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPass, setSelectedPass] = useState(null);

  useEffect(() => {
    bookingService.getMyBookings().then(bks => {
      setBookings(Array.isArray(bks) ? bks : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '-'; }
  };

  const generateQRDataURL = (text) => {
    const size = 200;
    const canvas = document.createElement('canvas');
    canvas.width = size;
    canvas.height = size;
    const ctx = canvas.getContext('2d');

    // Background
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, size, size);

    // Generate a deterministic pattern from the text
    const hash = text.split('').reduce((acc, c, i) => acc + c.charCodeAt(0) * (i + 1), 0);
    const cellSize = 8;
    const gridSize = Math.floor(size / cellSize);
    const margin = 2;

    // Draw QR-like pattern
    ctx.fillStyle = '#1E1B4B';

    // Position detection patterns (3 corners)
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

    // Data modules - deterministic from hash
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
    canvas.height = 500;
    const ctx = canvas.getContext('2d');

    // Background
    const gradient = ctx.createLinearGradient(0, 0, 400, 500);
    gradient.addColorStop(0, '#1E1B4B');
    gradient.addColorStop(0.5, '#312E81');
    gradient.addColorStop(1, '#7C3AED');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, 400, 500);

    // Header
    ctx.fillStyle = '#A78BFA';
    ctx.font = 'bold 10px monospace';
    ctx.fillText('DIGITAL ENTRY PASS', 30, 40);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 18px sans-serif';
    ctx.fillText(booking.event_title || 'Event', 30, 70);

    // QR Code area
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(120, 100, 160, 160);

    // Draw mini QR pattern
    const qrImg = new Image();
    qrImg.src = generateQRDataURL(booking.qr_code_token || 'EVTHUB');
    ctx.drawImage(qrImg, 120, 100, 160, 160);

    // Details
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    ctx.fillRect(0, 280, 400, 1);

    const details = [
      ['Pass Code', booking.qr_code_token || '-'],
      ['Event', booking.event_title || '-'],
      ['Amount', `₹${booking.total_amount || 0}`],
      ['Status', 'CONFIRMED'],
    ];

    details.forEach(([label, value], i) => {
      const y = 310 + i * 35;
      ctx.fillStyle = '#A78BFA';
      ctx.font = '10px sans-serif';
      ctx.fillText(label, 30, y);
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 14px sans-serif';
      ctx.fillText(value, 30, y + 18);
    });

    const link = document.createElement('a');
    link.download = `EventHub-Pass-${booking.qr_code_token || 'ticket'}.png`;
    link.href = canvas.toDataURL();
    link.click();
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" />
      <main className="dashboard-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">My Bookings</h1>
          <p className="text-xs text-slate-500 mt-1">All your event registrations and tickets</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? <div className="p-12 text-center text-slate-400">Loading bookings...</div> : bookings.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Ticket className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">No bookings yet</p>
              <p className="text-xs mt-1">Browse events and register to see your bookings here.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Event</th>
                    <th>Quantity</th>
                    <th>Amount</th>
                    <th>Pass Code</th>
                    <th>Date</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {bookings.map(b => (
                    <tr key={b.id || b._id}>
                      <td className="font-semibold text-slate-900">{b.event_title || 'Event'}</td>
                      <td className="text-slate-600">{b.quantity || 1}</td>
                      <td className="font-bold text-emerald-600">₹{b.total_amount || 0}</td>
                      <td>
                        <button
                          onClick={() => setSelectedPass(b)}
                          className="inline-flex items-center gap-1.5 bg-purple-50 text-purple-700 border border-purple-200 px-3 py-1 rounded-lg text-[11px] font-mono font-semibold hover:bg-purple-100 hover:border-purple-300 transition cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          {b.qr_code_token || '-'}
                        </button>
                      </td>
                      <td className="text-xs text-slate-500">{formatDate(b.created_at)}</td>
                      <td>
                        <span style={{
                          padding: '4px 14px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                          background: b.status === 'confirmed' ? '#ecfdf5' : '#fffbeb',
                          color: b.status === 'confirmed' ? '#10b981' : '#f59e0b',
                        }}>{b.status || 'pending'}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>

      {/* QR Code Modal */}
      {selectedPass && (
        <div className="modal-overlay" onClick={() => setSelectedPass(null)}>
          <div className="modal-content max-w-sm p-0 overflow-hidden" style={{ borderRadius: '20px' }} onClick={e => e.stopPropagation()}>
            {/* Ticket Header */}
            <div style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)' }} className="px-6 pt-6 pb-5 relative text-center">
              <button onClick={() => setSelectedPass(null)} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>

              <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest mb-1">Digital Entry Pass</div>
              <h3 className="text-lg font-bold text-white mb-4">{selectedPass.event_title || 'Event'}</h3>

              {/* QR Code */}
              <div className="inline-block bg-white p-4 rounded-2xl shadow-xl">
                <img
                  src={generateQRDataURL(selectedPass.qr_code_token || 'EVTHUB')}
                  alt="QR Code"
                  className="w-48 h-48"
                  style={{ imageRendering: 'pixelated' }}
                />
              </div>

              <div className="mt-4 inline-flex items-center gap-1.5 bg-white/10 border border-white/20 px-4 py-2 rounded-xl">
                <span className="font-mono text-white font-bold text-sm tracking-wider">{selectedPass.qr_code_token || '-'}</span>
              </div>
            </div>

            {/* Ticket Details */}
            <div className="px-6 py-5 space-y-3 bg-white">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Event</div>
                  <div className="font-bold text-slate-900 mt-0.5">{selectedPass.event_title || 'Event'}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Date</div>
                  <div className="font-bold text-slate-900 mt-0.5">{formatDate(selectedPass.created_at)}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Amount</div>
                  <div className="font-bold text-emerald-600 mt-0.5">₹{selectedPass.total_amount || 0}</div>
                </div>
                <div className="bg-slate-50 rounded-xl p-3">
                  <div className="text-slate-400 text-[10px] font-semibold uppercase">Status</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="font-bold text-emerald-600 uppercase">{selectedPass.status || 'pending'}</span>
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

              <p className="text-[10px] text-slate-400 text-center">Show this QR code at the venue entrance for entry</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
