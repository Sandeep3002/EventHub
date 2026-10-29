import React, { useState, useRef, useEffect } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Search, User, LogOut, ShieldCheck, Ticket, ChevronDown, PlusCircle, Bell, Calendar, CheckCircle, Info, X, Moon, Sun, HelpCircle, Headphones } from 'lucide-react';

import { notificationService } from '../services/notificationService';
import { useTheme } from '../context/ThemeContext';
import HelpChatbotModal from './HelpChatbotModal';

export default function Navbar() {
  const { user, logout, isAdmin, isOrganizer } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [expandedNotif, setExpandedNotif] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const notifRef = useRef(null);
  const userMenuRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) setDropdownOpen(false);
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (user) {
      notificationService.getNotifications().then(notifs => {
        setNotifications(notifs.map(n => ({
          id: n.id, type: n.type || 'info', title: n.title, message: n.message,
          time: new Date(n.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }),
          read: n.is_read, link: n.link,
        })));
      }).catch(() => {});
    }
  }, [user]);
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
      const target = user ? '/customer/events' : '/events';
      navigate(`${target}?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <header className={isDashboardPage ? 'top-navbar' : 'top-navbar top-navbar-dark'}>
      <div className="app-container top-navbar-inner">
        
        {/* Brand Logo */}
        <Link to="/" className="brand-logo">
          <div className="brand-icon-new brand-icon-img">
            <img src="/logo.svg" alt="EventHub" />
          </div>
          <span>EventHub</span>
        </Link>

        {/* Navigation Menu - hidden on dashboard pages */}
        {!isDashboardPage && (
          <nav className="nav-links hidden md:flex">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : ''}>
              Home
            </NavLink>
            <NavLink to={user ? "/customer/events" : "/events"} className={({ isActive }) => isActive ? 'active' : ''}>
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

        {/* Right Actions */}
        <div className="flex items-center gap-2.5 shrink-0">
          {/* Help & Contact Pill Buttons - displayed on Superadmin, Admin, and Organizer dashboards */}
          {isDashboardPage && (
            <>
              <button
                onClick={() => setHelpModalOpen(true)}
                className="dashboard-help-pill"
                title="Ask EventHub Assistant"
                aria-label="Help & FAQ Assistant"
              >
                <HelpCircle className="w-4 h-4 text-purple-600" />
                <span>Help</span>
              </button>

              <button
                onClick={() => navigate('/contact')}
                className="dashboard-contact-pill"
                title="Contact Support"
                aria-label="Contact"
              >
                <Headphones className="w-4 h-4 text-slate-700" />
                <span>Contact</span>
              </button>
            </>
          )}

          {/* Notification bell on dashboard */}
          {isDashboardPage && (
            <div className="relative" ref={notifRef}>
              <button
                className="dashboard-icon-btn relative"
                onClick={() => setNotifOpen(!notifOpen)}
                aria-label="Notifications"
                title="Notifications"
              >
                <Bell className="w-5 h-5 text-slate-600" />
                {notifications.some(n => !n.read) && (
                  <span style={{
                    position: 'absolute', top: '7px', right: '7px',
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
                      onClick={() => { notificationService.markAllRead().catch(() => {}); setNotifications(prev => prev.map(n => ({ ...n, read: true }))); }}
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
                                {n.link && (
                                  <button onClick={(e) => { e.stopPropagation(); navigate(n.link); setNotifOpen(false); }} className="text-[10px] font-semibold text-purple-600 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition">
                                    {n.type === 'booking' ? 'View Ticket' : n.type === 'event' ? 'View Event' : 'View'}
                                  </button>
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

          {/* Dark / Light Mode Moon Button */}
          <button
            onClick={toggleTheme}
            className="dashboard-icon-btn"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
          >
            {isDark ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-purple-600" />}
          </button>

          {/* User Profile Dropdown Pill - only on public pages, sidebar handles dashboard */}
          {!isDashboardPage && (user ? (
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="navbar-user-btn"
                aria-label="User menu"
              >
                <div className="w-8 h-8 rounded-full font-bold text-sm flex items-center justify-center shrink-0 shadow-sm bg-white/20 text-white">
                  {user.full_name ? user.full_name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="text-sm font-semibold max-w-[100px] sm:max-w-[150px] truncate text-white">
                  {user.full_name ? user.full_name.split(' ')[0] : 'User'}
                </span>
                <ChevronDown className="w-4 h-4 shrink-0 opacity-70" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
                  <div className="px-3 py-2 border-b border-slate-100 mb-1">
                    <p className="text-xs font-bold text-slate-900 truncate">{user.full_name || 'User'}</p>
                    <p className="text-[11px] text-slate-500 capitalize">{user.role || 'Attendee'}</p>
                  </div>



                  <Link to="/customer/bookings" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <Ticket className="w-4 h-4 text-slate-500" />
                    My Bookings
                  </Link>

                  <Link to="/customer/profile" onClick={() => setDropdownOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg">
                    <User className="w-4 h-4 text-slate-500" />
                    My Profile
                  </Link>

                  {(isAdmin || isOrganizer) && (
                    <Link to={isAdmin ? "/superadmin" : "/admin"} onClick={() => setDropdownOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-purple-600 hover:bg-purple-50 rounded-lg">
                      <ShieldCheck className="w-4 h-4" />
                      {isAdmin ? 'SuperAdmin Panel' : 'Organizer Panel'}
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
              <Link to="/register" className="navbar-register-btn hidden sm:inline-block">Register</Link>
            </div>
          ))}
        </div>

      </div>

      {/* Interactive AI / Help Assistant Chatbot Modal */}
      <HelpChatbotModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />
    </header>
  );
}
