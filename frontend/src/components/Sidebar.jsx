import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  LayoutDashboard, 
  Compass, 
  Ticket, 
  User, 
  Settings, 
  LogOut, 
  PlusCircle, 
  Calendar, 
  Users, 
  BarChart3, 
  Grid, 
  MapPin,
  ChevronDown,
  ShieldCheck,
  Activity,
  FileText,
  Menu,
  X,
} from 'lucide-react';

export default function Sidebar({ role = 'attendee' }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setMobileOpen(false);
    setProfileMenuOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const superadminNav = [
    { label: 'Dashboard', path: '/superadmin', icon: ShieldCheck },
    { label: 'Activity Log', path: '/superadmin/activities', icon: Activity },
    { label: 'All Events', path: '/superadmin/events', icon: Calendar },
    { label: 'All Registrations', path: '/superadmin/registrations', icon: FileText },
    { label: 'Manage Users', path: '/superadmin/users', icon: Users },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const adminNav = [
    { label: 'Dashboard', path: '/admin', icon: LayoutDashboard },
    { label: 'Create Event', path: '/admin/create-event', icon: PlusCircle },
    { label: 'Manage Events', path: '/admin/manage-events', icon: Calendar },
    { label: 'Registrations', path: '/admin/registrations', icon: Users },
    { label: 'Analytics', path: '/admin/analytics', icon: BarChart3 },
    { label: 'Categories', path: '/admin/categories', icon: Grid },
    { label: 'Venues', path: '/admin/venues', icon: MapPin },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const customerNav = [
    { label: 'Dashboard', path: '/customer', icon: LayoutDashboard },
    { label: 'Browse Events', path: '/customer/events', icon: Compass },
    { label: 'My Bookings', path: '/customer/bookings', icon: Ticket },
    { label: 'Profile', path: '/customer/profile', icon: User },
    { label: 'Settings', path: '/settings', icon: Settings },
  ];

  const navMap = { superadmin: superadminNav, admin: adminNav, organizer: adminNav, customer: customerNav, attendee: customerNav };
  const navItems = navMap[role] || customerNav;

  const displayName = user?.full_name || 'User';
  const displayInitial = displayName.charAt(0).toUpperCase();

  return (
    <>
      {/* Mobile hamburger toggle */}
      <button
        className="sidebar-mobile-toggle"
        onClick={() => setMobileOpen(!mobileOpen)}
        aria-label="Toggle sidebar"
      >
        {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div className="sidebar-overlay" onClick={() => setMobileOpen(false)} />
      )}

      <aside className={`dashboard-sidebar ${mobileOpen ? 'sidebar-open' : ''}`}>
        {/* Navigation List */}
        <div className="space-y-1 flex-1">
          {navItems.map((item, idx) => {
            const IconComponent = item.icon;
            return (
              <NavLink
                key={idx}
                to={item.path}
                end
                className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
              >
                <IconComponent className="w-4 h-4" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </div>

        {/* Bottom User Profile Badge */}
        <div className="mt-auto pt-4 border-t border-slate-100 relative">
          <button
            onClick={() => setProfileMenuOpen(!profileMenuOpen)}
            className="w-full flex items-center justify-between p-1.5 pr-3 bg-blue-50/70 hover:bg-blue-100/70 rounded-full border border-blue-100 transition text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 shadow-sm">
                {displayInitial}
              </div>
              <span className="text-xs font-bold text-slate-800 truncate">
                {displayName}
              </span>
            </div>
            <ChevronDown className="w-4 h-4 text-slate-500 shrink-0 ml-1" />
          </button>

          {profileMenuOpen && (
            <div className="absolute bottom-14 left-0 right-0 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 z-50">
              <div className="px-3 py-2 border-b border-slate-100 mb-1">
                <p className="text-xs font-bold text-slate-900 truncate">{displayName}</p>
                <p className="text-[11px] text-slate-500 capitalize">{user?.role || 'Attendee'}</p>
              </div>
              <Link
                to="/customer/profile"
                onClick={() => setProfileMenuOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
              >
                <User className="w-4 h-4 text-slate-500" />
                My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-3 py-2 text-xs font-medium text-red-600 hover:bg-red-50 rounded-lg mt-1"
              >
                <LogOut className="w-4 h-4" />
                Logout
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
