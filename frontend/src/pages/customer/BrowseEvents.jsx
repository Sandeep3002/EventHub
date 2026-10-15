import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { favoriteService } from '../../services/favoriteService';
import { useAuth } from '../../context/AuthContext';
import CheckoutModal from '../../components/CheckoutModal';
import RegistrationFormModal from '../../components/RegistrationFormModal';
import {
  Calendar, Search, MapPin, Clock, ArrowLeft, Users, Heart,
  Tag, ChevronRight, Ticket, Star, Zap, X
} from 'lucide-react';
import { cardStyle } from '../../styles/pageStyles';

export default function BrowseEvents() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('search') || '');
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
    if (user) {
      favoriteService.getFavorites().then(favs => {
        setSavedEvents(favs.map(f => f.event_id));
      }).catch(() => {});
    }
  }, [user]);

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

  const toggleSave = async (id) => {
    if (!user) return;
    try {
      if (savedEvents.includes(id)) {
        await favoriteService.removeFavorite(id);
        setSavedEvents(prev => prev.filter(x => x !== id));
      } else {
        await favoriteService.addFavorite(id);
        setSavedEvents(prev => [...prev, id]);
      }
    } catch { /* ignore */ }
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

  return (
    <div className="dashboard-layout">
      <Sidebar role="customer" />
      <main className="dashboard-content space-y-6">
        <div style={{ maxWidth: 1200, margin: '0 auto' }}>

        {/* If an event is selected, show detail view */}
        {selectedEvent ? (
          <div className="space-y-6">
            {/* Back button */}
            <button
              onClick={() => { setSelectedEvent(null); setShowRegistration(false); setShowCheckout(false); setRegistrationData(null); }}
              className="inline-flex items-center gap-2 text-sm font-semibold text-purple-600 hover:text-purple-400 transition"
              style={{ cursor: 'pointer', background: 'none', border: 'none', padding: 0 }}
            >
              <ArrowLeft className="w-4 h-4" /> Back to Events
            </button>

            {/* Event Hero */}
            <div style={{ ...cardStyle, borderRadius: '20px', overflow: 'hidden' }}>
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
                  background: 'linear-gradient(to top, rgba(0,0,0,0.7) 0%, transparent 60%)',
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
                  <h1 style={{ fontSize: '28px', fontWeight: 800, color: 'white', textShadow: '0 2px 8px rgba(0,0,0,0.3)', margin: 0 }}>
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
              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px' }}>
                {/* Left: Details */}
                <div className="space-y-5">
                  {/* Quick Info Pills */}
                  <div className="flex flex-wrap gap-3">
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                      <Calendar className="w-4 h-4" /> {formatDate(selectedEvent.start_time)}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(59, 130, 246, 0.12)', color: '#3b82f6', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                      <Clock className="w-4 h-4" /> {formatTime(selectedEvent.start_time)} - {formatTime(selectedEvent.end_time)}
                    </div>
                    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(236, 72, 153, 0.12)', color: '#ec4899', padding: '8px 14px', borderRadius: 12, fontSize: 13, fontWeight: 500 }}>
                      <MapPin className="w-4 h-4" /> {selectedEvent.venue_id || 'TBD'}
                    </div>
                  </div>

                  {/* About */}
                  <div>
                    <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 8 }}>About This Event</h3>
                    <p style={{ fontSize: 14, color: 'var(--c-text-muted)', lineHeight: 1.6, margin: 0 }}>
                      {selectedEvent.description || 'Join us for an amazing event experience. More details coming soon!'}
                    </p>
                  </div>

                  {/* Highlights */}
                  <div style={{ background: 'var(--c-bg)', border: '1px solid var(--c-border)', padding: 20, borderRadius: 16 }}>
                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <Star className="w-4 h-4 text-purple-500" /> Event Highlights
                    </h3>
                    <div className="grid grid-cols-2 gap-3">
                      {['Expert Speakers', 'Networking', 'Hands-on Sessions', 'Certificate'].map((h, i) => (
                        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--c-text-muted)' }}>
                          <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b5cf6' }} /> {h}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Right: Booking Card */}
                <div style={{
                  background: 'var(--c-bg)',
                  borderRadius: '16px', border: '1px solid var(--c-border)', padding: '24px',
                  height: 'fit-content', position: 'sticky', top: '24px',
                }}>
                  <div className="text-center mb-5">
                    <div style={{ fontSize: 11, color: 'var(--c-text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>Ticket Price</div>
                    <div style={{ fontSize: '36px', fontWeight: 800, background: 'linear-gradient(135deg, #7C3AED, #EC4899)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                      ₹{selectedEvent.price || 0}
                    </div>
                  </div>

                  <div className="space-y-3 mb-5">
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--c-text-muted)' }}>Available</span>
                      <span style={{ fontWeight: 700, color: 'var(--c-text-main)' }}>{selectedEvent.available_tickets ?? selectedEvent.max_attendees ?? 'Unlimited'} seats</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--c-text-muted)' }}>Capacity</span>
                      <span style={{ fontWeight: 700, color: 'var(--c-text-main)' }}>{selectedEvent.max_attendees || 200}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span style={{ color: 'var(--c-text-muted)' }}>Type</span>
                      <span style={{ fontWeight: 700, color: 'var(--c-text-main)' }}>General Entry</span>
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

                  <p style={{ fontSize: 10, color: 'var(--c-text-muted)', textAlign: 'center', marginTop: 12 }}>Secure checkout · Instant confirmation</p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          /* Events Grid View */
          <>
            <div className="flex items-center justify-between" style={{ marginBottom: 20 }}>
              <div>
                <h1 style={{ fontSize: 24, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>Browse Events</h1>
                <p style={{ fontSize: 13, color: 'var(--c-text-muted)', marginTop: 4 }}>Discover and register for upcoming events</p>
              </div>
              <div style={{ fontSize: 13, color: 'var(--c-text-muted)', fontWeight: 500 }}>{filtered.length} events found</div>
            </div>

            {/* Search */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: '10px',
              background: 'var(--c-surface)', border: '1px solid var(--c-border)', borderRadius: '14px',
              padding: '12px 16px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)', marginBottom: 24,
            }}>
              <Search className="w-5 h-5 text-slate-400" />
              <input
                type="text" placeholder="Search events by name..."
                value={search} onChange={e => setSearch(e.target.value)}
                style={{ border: 'none', outline: 'none', background: 'transparent', fontSize: '14px', color: 'var(--c-text-main)', width: '100%' }}
              />
              {search && (
                <button onClick={() => setSearch('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--c-text-muted)' }}>
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
                        ...cardStyle,
                        borderRadius: '16px',
                        overflow: 'hidden', cursor: 'pointer', transition: 'all 0.3s',
                      }}
                      onMouseEnter={ev => { ev.currentTarget.style.boxShadow = '0 12px 32px rgba(0,0,0,0.15)'; ev.currentTarget.style.transform = 'translateY(-4px)'; }}
                      onMouseLeave={ev => { ev.currentTarget.style.boxShadow = '0 1px 3px rgba(0,0,0,0.04)'; ev.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Card Banner */}
                      <div style={{
                        height: '140px', position: 'relative',
                        background: e.image_url
                          ? `url(${e.image_url}) center/cover`
                          : 'linear-gradient(135deg, #7C3AED 0%, #3B82F6 40%, #EC4899 100%)',
                      }}>
                        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.5) 0%, transparent 60%)' }} />
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
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: 'var(--c-text-main)', margin: '0 0 10px', lineHeight: 1.3 }}>
                          {e.title}
                        </h3>
                        <div className="space-y-1.5 mb-4">
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--c-text-muted)' }}>
                            <Calendar className="w-3.5 h-3.5 text-purple-500" /> {formatDate(e.start_time)}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--c-text-muted)' }}>
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
                              background: 'rgba(124, 58, 237, 0.12)', color: '#8b5cf6',
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
        </div>
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
            unitPrice: selectedEvent.price || 0,
            registration: registrationData,
          }}
          onClose={() => { setShowCheckout(false); setSelectedEvent(null); }}
        />
      )}
    </div>
  );
}
