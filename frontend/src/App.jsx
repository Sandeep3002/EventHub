import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import Loading from './components/Loading';

// Public Pages
import Home from './pages/Home';
import Events from './pages/Events';

import About from './pages/About';
import Contact from './pages/Contact';
import Login from './pages/Login';
import Register from './pages/Register';
import ResetPassword from './pages/ResetPassword';

// Super Admin Pages
import SuperAdminDashboard from './pages/superadmin/SuperAdminDashboard';
import ActivityLog from './pages/superadmin/ActivityLog';
import AllEvents from './pages/superadmin/AllEvents';
import AllRegistrations from './pages/superadmin/AllRegistrations';

// Admin Pages (Event Management)
import AdminDashboard from './pages/organizer/OrganizerDashboard';
import CreateEvent from './pages/organizer/CreateEvent';
import ManageEvents from './pages/organizer/ManageEvents';
import Registrations from './pages/organizer/Registrations';
import Analytics from './pages/organizer/Analytics';
import ManageCategories from './pages/admin/ManageCategories';
import ManageVenues from './pages/admin/ManageVenues';
import ManageUsers from './pages/admin/ManageUsers';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import BrowseEvents from './pages/customer/BrowseEvents';
import CustomerBookings from './pages/customer/CustomerBookings';
import CustomerProfile from './pages/customer/CustomerProfile';
import Settings from './pages/Settings';

// Protected Route Wrapper
function ProtectedRoute({ children, requiredRole }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return <Loading />;
  if (!user) return <Navigate to="/" replace />;

  if (requiredRole === 'superadmin' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  if (requiredRole === 'admin' && user.role !== 'admin' && user.role !== 'organizer' && user.role !== 'superadmin') {
    return <Navigate to="/" replace />;
  }
  if (requiredRole === 'attendee' && !['attendee', 'superadmin'].includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return children;
}

function AppLayout() {
  const location = useLocation();
  const isLandingPage = location.pathname === '/';
  const isStandalonePage = isLandingPage || location.pathname === '/reset-password';

  return (
    <div className="min-h-screen relative flex flex-col bg-[#F8FAFC]">
      {!isStandalonePage && <Navbar />}

      <main className={isStandalonePage ? '' : 'flex-1 pb-12'}>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Home />} />
          <Route path="/events" element={<Events />} />
          <Route path="/events/:id" element={<Navigate to="/customer/events" replace />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/reset-password" element={<ResetPassword />} />

          {/* Super Admin Suite */}
          <Route path="/superadmin" element={<ProtectedRoute requiredRole="superadmin"><SuperAdminDashboard /></ProtectedRoute>} />
          <Route path="/superadmin/activities" element={<ProtectedRoute requiredRole="superadmin"><ActivityLog /></ProtectedRoute>} />
          <Route path="/superadmin/events" element={<ProtectedRoute requiredRole="superadmin"><AllEvents /></ProtectedRoute>} />
          <Route path="/superadmin/registrations" element={<ProtectedRoute requiredRole="superadmin"><AllRegistrations /></ProtectedRoute>} />
          <Route path="/superadmin/users" element={<ProtectedRoute requiredRole="superadmin"><ManageUsers /></ProtectedRoute>} />

          {/* Admin Suite (Event Management) */}
          <Route path="/admin" element={<ProtectedRoute requiredRole="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/create-event" element={<ProtectedRoute requiredRole="admin"><CreateEvent /></ProtectedRoute>} />
          <Route path="/admin/manage-events" element={<ProtectedRoute requiredRole="admin"><ManageEvents /></ProtectedRoute>} />
          <Route path="/admin/registrations" element={<ProtectedRoute requiredRole="admin"><Registrations /></ProtectedRoute>} />
          <Route path="/admin/analytics" element={<ProtectedRoute requiredRole="admin"><Analytics /></ProtectedRoute>} />
          <Route path="/admin/categories" element={<ProtectedRoute requiredRole="admin"><ManageCategories /></ProtectedRoute>} />
          <Route path="/admin/venues" element={<ProtectedRoute requiredRole="admin"><ManageVenues /></ProtectedRoute>} />
          <Route path="/admin/users" element={<ProtectedRoute requiredRole="admin"><ManageUsers /></ProtectedRoute>} />

          {/* Backwards compat — old /organizer/* routes redirect to /admin/* */}
          <Route path="/organizer" element={<Navigate to="/admin" replace />} />
          <Route path="/organizer/*" element={<Navigate to="/admin" replace />} />

          {/* Customer Suite */}
          <Route path="/customer" element={<ProtectedRoute requiredRole="attendee"><CustomerDashboard /></ProtectedRoute>} />
          <Route path="/customer/events" element={<ProtectedRoute requiredRole="attendee"><BrowseEvents /></ProtectedRoute>} />
          <Route path="/customer/bookings" element={<ProtectedRoute requiredRole="attendee"><CustomerBookings /></ProtectedRoute>} />
          <Route path="/customer/profile" element={<ProtectedRoute requiredRole="attendee"><CustomerProfile /></ProtectedRoute>} />

          {/* Settings (all roles) */}
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />

          {/* Legacy attendee routes */}
          <Route path="/my-bookings" element={<Navigate to="/customer/bookings" replace />} />
          <Route path="/profile" element={<Navigate to="/customer/profile" replace />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>

      {!isStandalonePage && <Footer />}
    </div>
  );
}

export default function App() {
  return <AppLayout />;
}
