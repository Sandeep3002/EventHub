import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, LogOut, LayoutDashboard, ShieldCheck, Ticket, ChevronDown, PlusCircle, Bell, CalendarCheck, Calendar, CheckCircle, Info, X } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState(null);
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'booking', title: 'Booking Confirmed', message: 'Your ticket for Tech Conference 2026 has been confirmed. Show your QR pass at the venue entrance. Check your email for the full receipt.', time: '2 min ago', read: false },
    { id: 2, type: 'event', title: 'Event Reminder', message: 'Python Workshop starts tomorrow at 10:00 AM at Hyderabad Convention Center, Hall B. Don\'t forget to bring your laptop and charger.', time: '1 hour ago', read: false },
    { id: 3, type: 'info', title: 'Welcome to EventHub', message: 'Complete your profile to get personalized event recommendations based on your interests and location. Head to Settings to update your preferences.', time: '1 day ago', read: true },
  ]);
  const notifRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  const isDashboardPage = location.pathname.startsWith('/superadmin') || location.pathname.startsWith('/admin') || location.pathname.startsWith('/customer') || location.pathname.startsWith('/organizer') || location.pathname.startsWith('/settings');
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setDropdownOpen(false);
    navigate('/');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/events?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={isDashboardPage ? 'top-navbar' : 'top-navbar top-navbar-dark'}>
      <div className="app-container top-navbar-inner">
        
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-new">
            <CalendarCheck className="w-5 h-5" />
          </div>
          <span>EventHub</span>
        </Link>

        {/* Navigation Menu - hidden on dashboard pages */}
        {!isDashboardPage && (
          <nav className="nav-links hidden md:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
            <NavLink to="/events" className={({ isActive }) => isActive ? 'active' : ''}>
              Events
            </NavLink>
            <NavLink to="/about" className={({ isActive }) => isActive ? 'active' : ''}>
              About
            </NavLink>
            <NavLink to="/contact" className={({ isActive }) => isActive ? 'active' : ''}>
              Contact
            </NavLink>
          </nav>
        )}

        {/* Search bar */}
        <form onSubmit={handleSearchSubmit} className="navbar-search hidden lg:block" style={{ flex: isDashboardPage ? 1 : undefined, maxWidth: isDashboardPage ? '500px' : undefined }}>
          <Search className="search-icon w-4 h-4" />
          <input
            type="text"
            placeholder="Search events..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        {/* Dashboard: notification bell */}
        {isDashboardPage && (
          <div className="relative" ref={notifRef}>
            <button
              className="relative p-2 rounded-full hover:bg-slate-100 transition"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              <Bell className="w-5 h-5 text-slate-600" />
              {notifications.some(n => !n.read) && (
                <span style={{
                  position: 'absolute', top: '6px', right: '6px',
                  width: '8px', height: '8px', borderRadius: '50%',
                  background: '#ef4444', border: '2px solid white',
                }} />
              )}
            </button>

            {notifOpen && (
              <div className="absolute right-0 mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
                  <h3 className="text-sm font-bold text-slate-900">Notifications</h3>
                  <button
                    onClick={() => setNotifications(prev => prev.map(n => ({ ...n, read: true })))}
                    className="text-xs font-semibold text-purple-600 hover:underline"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-72 overflow-y-auto">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-8 text-center text-xs text-slate-400">No notifications</div>
                  ) : (
                    notifications.map(n => {
                      const isExpanded = expandedNotif === n.id;
                      return (
                        <div
                          key={n.id}
                          className={`px-4 py-3 border-b border-slate-50 hover:bg-slate-50 transition cursor-pointer ${!n.read ? 'bg-purple-50/50' : ''}`}
                          onClick={() => {
                            setExpandedNotif(isExpanded ? null : n.id);
                            setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
                          }}
                        >
                          <div className="flex gap-3">
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                              n.type === 'booking' ? 'bg-green-100 text-green-600' :
                              n.type === 'event' ? 'bg-blue-100 text-blue-600' :
                              'bg-slate-100 text-slate-500'
                            }`}>
                              {n.type === 'booking' ? <CheckCircle className="w-4 h-4" /> :
                               n.type === 'event' ? <Calendar className="w-4 h-4" /> :
                               <Info className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <p className={`text-xs font-semibold ${!n.read ? 'text-slate-900' : 'text-slate-600'}`}>{n.title}</p>
                                <button
                                  onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}
                                  className="text-slate-300 hover:text-slate-500 shrink-0 ml-1"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                              <p className={`text-[11px] text-slate-500 ${isExpanded ? '' : 'truncate'}`}>{n.message}</p>
                              <p className="text-[10px] text-slate-400 mt-0.5">{n.time}</p>
                            </div>
                          </div>
                          {isExpanded && (
                            <div className="mt-2 ml-11 flex gap-2">
                              {n.type === 'booking' && (
                                <button onClick={(e) => { e.stopPropagation(); }} className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition">View Ticket</button>
                              )}
                              {n.type === 'event' && (
                                <button onClick={(e) => { e.stopPropagation(); }} className="text-[10px] font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition">View Event</button>
                              )}
                              {n.type === 'info' && (
                                <button onClick={(e) => { e.stopPropagation(); }} className="text-[10px] font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full hover:bg-slate-200 transition">Go to Settings</button>
                              )}
                              <button onClick={(e) => { e.stopPropagation(); setNotifications(prev => prev.filter(x => x.id !== n.id)); }}
                                className="text-[10px] font-semibold text-red-500 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition">Dismiss</button>
                            </div>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>

                <div className="px-4 py-2.5 border-t border-slate-100 text-center">
                  <button className="text-xs font-semibold text-purple-600 hover:underline">View All Notifications</button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Right Actions - hidden on dashboard pages */}
        {!isDashboardPage && (
        <div className="flex items-center gap-3">
          {user ? (
            <div className="relative">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="navbar-user-btn"
              >
                <div className="w-8 h-8 rounded-full bg-white/20 text-white font-bold text-sm flex items-center justify-center">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold">
                  {user.full_name ? user.full_name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown className="w-4 h-4 opacity-70" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-lg p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900">{user.full_name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user.role || 'Attendee'}</p>
                  </div>

                  <Link to="/customer" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <LayoutDashboard className="w-4 h-4 text-slate-500" />
                    Dashboard
                  </Link>

                  <Link to="/customer/bookings" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <Ticket className="w-4 h-4 text-slate-500" />
                    My Bookings
                  </Link>

                  {(isAdmin || isOrganizer) && (
                    <Link to="/admin" onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                      Admin Dashboard
                    </Link>
                  )}

                  <button onClick={handleLogout}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg mt-1">
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login" className="navbar-login-btn">Login</Link>
              <Link to="/register" className="navbar-register-btn">Register</Link>
            </div>
          )}
        </div>
        )}

      </div>
    </header>
  );
}
