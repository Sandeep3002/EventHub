import React from 'react';
import { X, Ticket, QrCode, Calendar, MapPin, Printer, CheckCircle2 } from 'lucide-react';

export default function MyTicketsModal({ ticket, onClose }) {
  if (!ticket) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-6 relative bg-white border border-slate-200">
        
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-700 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 border-b border-slate-100 pb-4 mb-5">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <Ticket className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">Digital Event Ticket</h3>
            <p className="text-xs text-slate-500">Verified QR entry pass</p>
          </div>
        </div>

        {/* Ticket Pass Body */}
        <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-6 space-y-6 shadow-xl relative overflow-hidden">
          
          <div className="flex items-center justify-between border-b border-slate-700 pb-4">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-blue-400">EventHub Official Pass</span>
              <h4 className="text-lg font-bold text-white leading-tight mt-0.5">{ticket.title}</h4>
            </div>
            <span className="status-pill status-confirmed text-xs">
              <CheckCircle2 className="w-3 h-3 mr-1 inline" /> Confirmed
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs">
            <div>
              <p className="text-slate-400 text-[11px]">Location</p>
              <p className="font-semibold text-white flex items-center gap-1 mt-0.5">
                <MapPin className="w-3.5 h-3.5 text-blue-400" />
                {ticket.location}
              </p>
            </div>

            <div>
              <p className="text-slate-400 text-[11px]">Date & Time</p>
              <p className="font-semibold text-white flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-blue-400" />
                {ticket.date}
              </p>
            </div>
          </div>

          {/* QR Code section */}
          <div className="bg-white p-4 rounded-xl text-center text-slate-900 flex flex-col items-center justify-center gap-2">
            <QrCode className="w-24 h-24 text-slate-900" />
            <p className="font-mono text-xs font-bold tracking-widest text-slate-600">
              EH-PASS-{ticket.id || '883921'}
            </p>
          </div>

        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 mt-6">
          <button onClick={handlePrint} className="btn-secondary flex-1 py-2.5 text-xs flex items-center justify-center gap-2">
            <Printer className="w-4 h-4" />
            <span>Print Pass</span>
          </button>
          <button onClick={onClose} className="btn-primary flex-1 py-2.5 text-xs">
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
