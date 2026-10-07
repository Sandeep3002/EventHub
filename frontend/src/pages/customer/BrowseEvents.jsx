import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { useAuth } from '../../context/AuthContext';
import CheckoutModal from '../../components/CheckoutModal';
import RegistrationFormModal from '../../components/RegistrationFormModal';
import {
  Calendar, Search, MapPin, Clock, ArrowLeft, Users, Heart,
  DollarSign, Tag, ChevronRight, Ticket, Star, Zap, X
} from 'lucide-react';

export default function BrowseEvents() {
  const { user } = useAuth();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [showRegistration, setShowRegistration] = useState(false);
  const [registrationData, setRegistrationData] = useState(null);
  const [showCheckout, setShowCheckout] = useState(false);
  const [savedEvents, setSavedEvents] = useState([]);

  useEffect(() => {
    eventService.getEvents().then(evts => {
      setEvents(Array.isArray(evts) ? evts : []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  const filtered = events.filter(e =>
    !search || (e.title || '').toLowerCase().includes(search.toLowerCase())
  );

  const formatDate = (d) => {
    if (!d) return '-';
    try { return new Date(d).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' }); }
    catch { return '-'; }
  };

  const formatTime = (d) => {
    if (!d) return '';
    try { return new Date(d).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }); }
    catch { return ''; }
  };

  const toggleSave = (id) => {
    setSavedEvents(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleRegister = () => {
    if (!user) return;
    setShowRegistration(true);
  };

  const handleRegistrationSubmit = (data) => {
    setRegistrationData(data);
    setShowRegistration(false);
    setShowCheckout(true);
  };

  const activeEvent = selectedEvent;

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" />
      <main className="dashboard-content space-y-6">

        {/* If an event is selected, show detail view */}
        {selectedEvent ? (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => { setSelectedEvent(null); setShowRegistration(false); setShowCheckout(false); setRegistrationData(null); }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-800 transition"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </button>

            {/* Event Hero */}
            <div style={{ borderRadius: '20px', overflow: 'hidden', background: 'white', border: '1px solid #e2e8f0', boxShadow: '0 4px 20px rgba(0,0,0,0.06)' }}>
              {/* Banner */}
              <div style={{
                height: '200px',
                background: selectedEvent.image_url
                  ? `url(${selectedEvent.image_url}) center/cover`
                  : 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 40%, #EC4899 100%)',
                position: 'relative',
              }}>
                <div style={{
                  position: 'absolute', inset: 0,
                  background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 50%)',
                }} />
                <div style={{ position: 'absolute', bottom: '20px', left: '24px', right: '24px' }}>
                  <div className="flex items-center gap-2 mb-2">
                    {selectedEvent.category_id && (
                      <span style={{ background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: 'white' }}>
                        <Tag className="w-3 h-3 inline mr-1" />{selectedEvent.category_id}
                      </span>
                    )}
                    <span style={{ background: 'rgba(16,185,129,0.8)', padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600, color: 'white' }}>
                      <Zap className="w-3 h-3 inline mr-1" />Open
                    </span>
                  </div>
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
                    {selectedEvent.title}
                  </h1>
                </div>
                <button
                  onClick={() => toggleSave(selectedEvent.id || selectedEvent._id)}
                  style={{
                    position: 'absolute', top: '16px', right: '16px',
                    width: '40px', height: '40px', borderRadius: '50%',
                    background: savedEvents.includes(selectedEvent.id || selectedEvent._id) ? '#ef4444' : 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(8px)', border: 'none', cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    transition: 'all 0.2s',
                  }}
                >
                  <Heart className="w-5 h-5" style={{
                    color: 'white',
                    fill: savedEvents.includes(selectedEvent.id || selectedEvent._id) ? 'white' : 'none'
                  }} />
                </button>
              </div>

              {/* Info Grid */}
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 300px', gap: '24px' }}>
                {/* Left: Details */}
                <div className="space-y-5">
                  {/* Quick Info Pills */}
                  <div className="flex flex-wrap gap-3">
                    <div className="inline-flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-xl text-sm font-medium">
                      <Calendar className="w-4 h-4" /> {formatDate(selectedEvent.start_time)}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-blue-50 text-blue-700 px-4 py-2 rounded-xl text-sm font-medium">
                      <Clock className="w-4 h-4" /> {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                    </div>
                    <div className="inline-flex items-center gap-2 bg-pink-50 text-pink-700 px-4 py-2 rounded-xl text-sm font-medium">
                      <MapPin className="w-4 h-4" /> {selectedEvent.venue_id || 'TBD'}
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <h3 className="text-base font-bold text-slate-900 mb-2">About This Event</h3>
                    <p className="text-sm text-slate-600 leading-relaxed">
                      {selectedEvent.description || 'Join us for an amazing event experience. More details coming soon!'}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-5 rounded-2xl">
                    <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
                      <Star className="w-4 h-4 text-purple-600" /> Event Highlights
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Expert Speakers', 'Networking', 'Hands-on Sessions', 'Certificate'].map((h, i) => (
                        <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                          <div className="w-2 h-2 rounded-full bg-purple-500" /> {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Booking Card */}
                <div style={{
                  background: 'linear-gradient(135deg, #faf5ff 0%, #eff6ff 100%)',
                  borderRadius: '16px', border: '1px solid #e9d5ff', padding: '24px',
                  height: 'fit-content', position: 'sticky', top: '24px',
                }}>
                  <div className="text-center mb-5">
                    <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider mb-1">Ticket Price</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{selectedEvent.price || 0}
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Available</span>
                      <span className="font-bold text-slate-900">{selectedEvent.available_tickets ?? selectedEvent.max_attendees ?? 'Unlimited'} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Capacity</span>
                      <span className="font-bold text-slate-900">{selectedEvent.max_attendees || 200}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-slate-500">Type</span>
                      <span className="font-bold text-slate-900">General Entry</span>
                    </div>
                  </div>

                  <button
                    onClick={handleRegister}
                    style={{
                      width: '100%', padding: '14px', borderRadius: '14px',
                      background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)',
                      color: 'white', fontWeight: 700, fontSize: '15px', border: 'none',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
                      gap: '8px', boxShadow: '0 4px 16px rgba(124,58,237,0.35)',
                      transition: 'transform 0.2s, box-shadow 0.2s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(124,58,237,0.45)'; }}
                    onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = '0 4px 16px rgba(124,58,237,0.35)'; }}
                  >
                    <Ticket className="w-5 h-5" />
                    Register Now
                  </button>

                  <p className="text-[10px] text-slate-400 text-center mt-3">Secure checkout · Instant confirmation</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Events Grid View */
          <>
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-slate-900">Browse Events</h1>
                <p className="text-xs text-slate-500 mt-1">Discover and register for upcoming events</p>
              </div>
              <div className="text-sm text-slate-400 font-medium">{filtered.length} events found</div>
            </div>

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'white', border: '1px solid #e2e8f0', borderRadius: '14px',
              padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
            }}>
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text" placeholder="Search events by name..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: '#334155', width: '100%' }}
              />
              {search && (
                <button onClick={() => setSearch('')} className="text-slate-400 hover:text-slate-600">
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {loading ? (
              <div className="text-center py-16 text-slate-400">
                <div className="w-8 h-8 border-3 border-purple-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-3" />
                Loading events...
              </div>
            ) : filtered.length === 0 ? (
              <div className="text-center py-16 text-slate-400">
                <Calendar className="w-12 h-12 mx-auto mb-3 text-slate-300" />
                <p className="font-semibold text-slate-500">No events found</p>
                <p className="text-xs mt-1">Try a different search term</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                {filtered.map(e => {
                  const id = e.id || e._id;
                  const isSaved = savedEvents.includes(id);
                  return (
                    <div
                      key={id}
                      onClick={() => setSelectedEvent(e)}
                      style={{
                        background: 'white', borderRadius: '16px', border: '1px solid #e2e8f0',
                        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s',
                        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
                      }}
                      onMouseEnter={ev => { ev.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.1)'; ev.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; ev.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Card Banner */}
                      <div style={{
                        height: '140px', position: 'relative',
                        background: e.image_url
                          ? `url(${e.image_url}) center/cover`
                          : 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 40%, #EC4899 100%)',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 60%)' }} />
                        <div style={{
                          position: 'absolute', top: '12px', right: '12px',
                          width: '32px', height: '32px', borderRadius: '50%',
                          background: isSaved ? '#ef4444' : 'rgba(255,255,255,0.2)',
                          backdropFilter: 'blur(8px)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}
                          onClick={ev => { ev.stopPropagation(); toggleSave(id); }}
                        >
                          <Heart className="w-4 h-4" style={{ color: 'white', fill: isSaved ? 'white' : 'none' }} />
                        </div>
                        <div style={{ position: 'absolute', bottom: '12px', left: '14px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          {e.category_id && (
                            <span style={{
                              background: 'rgba(255,255,255,0.2)', backdropFilter: 'blur(8px)',
                              padding: '3px 10px', borderRadius: '20px', fontSize: '10px', fontWeight: 600, color: 'white',
                            }}>{e.category_id}</span>
                          )}
                        </div>
                      </div>

                      {/* Card Body */}
                      <div style={{ padding: '16px' }}>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 10px', lineHeight: 1.3 }}>
                          {e.title}
                        </h3>
                        <div className="space-y-1.5 mb-4">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <Calendar className="w-3.5 h-3.5 text-purple-500" /> {formatDate(e.start_time)}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <MapPin className="w-3.5 h-3.5 text-pink-500" /> {e.venue_id || 'TBD'}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span style={{ fontWeight: 800, fontSize: '18px', background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                            ₹{e.price || 0}
                          </span>
                          <div className="flex items-center gap-2">
                            <span style={{
                              padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                              background: '#f5f3ff', color: '#7C3AED',
                            }}>
                              <Users className="w-3 h-3 inline mr-1" />{e.available_tickets || 0} left
                            </span>
                            <ChevronRight className="w-4 h-4 text-slate-400" />
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </main>

      {/* Registration Modal */}
      {showRegistration && selectedEvent && (
        <RegistrationFormModal
          event={selectedEvent}
          onClose={() => setShowRegistration(false)}
          onSubmit={handleRegistrationSubmit}
        />
      )}

      {/* Checkout Modal */}
      {showCheckout && selectedEvent && (
        <CheckoutModal
          checkoutData={{
            event: selectedEvent,
            ticketType: 'general',
            quantity: 1,
            totalPrice: selectedEvent.price,
            attendee: registrationData,
          }}
          onClose={() => setShowCheckout(false)}
          onBookAnother={() => {
            setShowCheckout(false);
            setRegistrationData(null);
            setShowRegistration(true);
          }}
        />
      )}
    </div>
  );
}
