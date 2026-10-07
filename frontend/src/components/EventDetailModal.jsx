import React, { useState } from 'react';
import { X, Calendar, MapPin, Ticket, ShieldCheck, Clock, Check, Plus, Minus, ArrowRight } from 'lucide-react';

export default function EventDetailModal({ event, venue, category, onClose, onProceedToCheckout }) {
  const [ticketType, setTicketType] = useState('general');
  const [quantity, setQuantity] = useState(1);

  if (!event) return null;

  const basePrice = event.price > 0 ? event.price : 0;
  const multiplier = ticketType === 'vip' ? 2.2 : ticketType === 'early_bird' ? 0.8 : 1.0;
  const unitPrice = Math.round(basePrice * multiplier);
  const totalPrice = unitPrice * quantity;

  const handleIncrement = () => setQuantity(prev => Math.min(10, prev + 1));
  const handleDecrement = () => setQuantity(prev => Math.max(1, prev - 1));

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-2xl p-0 overflow-hidden relative border-slate-700">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2 rounded-full bg-slate-900/80 text-slate-300 hover:text-white border border-slate-700 backdrop-blur-md"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Hero Image */}
        <div className="relative h-64 w-full bg-slate-900">
          <img
            src={event.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87'}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] via-[#0f172a]/50 to-transparent" />

          <div className="absolute bottom-4 left-6 right-6">
            <span className="badge badge-purple mb-2">{category?.name || 'Event'}</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">{event.title}</h2>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 max-h-[60vh] overflow-y-auto">
          
          {/* Key Details Grid */}
          <div className="grid grid-cols-2 gap-4 bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-400">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Date & Time</div>
                <div className="text-xs sm:text-sm font-bold text-white">
                  {new Date(event.start_time).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-medium">Venue</div>
                <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[180px]">
                  {venue?.name || 'Metropolis Center'}
                </div>
              </div>
            </div>
          </div>

          {/* Event Description */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-2">About Event</h4>
            <p className="text-slate-300 text-sm leading-relaxed">
              {event.description}
            </p>
          </div>

          {/* Ticket Tier Options */}
          <div>
            <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Select Ticket Pass</h4>
            <div className="grid grid-cols-3 gap-3">
              
              <button
                onClick={() => setTicketType('general')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  ticketType === 'general'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold">General Pass</div>
                <div className="text-sm font-extrabold text-indigo-400 mt-1">
                  ${basePrice}
                </div>
              </button>

              <button
                onClick={() => setTicketType('vip')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  ticketType === 'vip'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-purple-300">VIP Access</div>
                <div className="text-sm font-extrabold text-purple-400 mt-1">
                  ${Math.round(basePrice * 2.2)}
                </div>
              </button>

              <button
                onClick={() => setTicketType('early_bird')}
                className={`p-3 rounded-xl border text-left transition-all ${
                  ticketType === 'early_bird'
                    ? 'border-indigo-500 bg-indigo-500/10 text-white'
                    : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-xs font-bold text-emerald-300">Early Bird</div>
                <div className="text-sm font-extrabold text-emerald-400 mt-1">
                  ${Math.round(basePrice * 0.8)}
                </div>
              </button>

            </div>
          </div>

          {/* Quantity Controls */}
          <div className="flex items-center justify-between bg-slate-900/60 p-4 rounded-xl border border-slate-800">
            <div>
              <div className="text-sm font-bold text-white">Ticket Quantity</div>
              <div className="text-xs text-slate-400">Max 10 passes per user</div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleDecrement}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
              >
                <Minus className="w-4 h-4" />
              </button>
              <span className="text-base font-extrabold text-white w-6 text-center">{quantity}</span>
              <button
                onClick={handleIncrement}
                className="w-8 h-8 rounded-lg bg-slate-800 text-white flex items-center justify-center hover:bg-slate-700"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>

        {/* Footer Bar */}
        <div className="p-6 bg-slate-900 border-t border-slate-800 flex items-center justify-between">
          <div>
            <div className="text-xs text-slate-400 font-medium">Total Amount</div>
            <div className="text-2xl font-extrabold text-white">
              ${totalPrice}
            </div>
          </div>
          <button
            onClick={() => onProceedToCheckout({ event, ticketType, quantity, totalPrice })}
            className="btn btn-primary py-3 px-8 text-sm font-bold flex items-center gap-2"
          >
            <span>Proceed to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </div>
  );
}
