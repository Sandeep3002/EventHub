import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, Mail, MapPin, ExternalLink } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-800 bg-[#060911] text-slate-400 py-16 relative z-10">
      <div className="container grid grid-cols-1 md:grid-cols-4 gap-10">
        
        {/* Col 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-white">
              <Calendar className="w-5 h-5" />
            </div>
            <span className="text-xl font-extrabold text-white">EventHub</span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed">
            The premier platform for discovering world-class summits, music festivals, startup bootcamps, and verified digital event passes.
          </p>
        </div>

        {/* Col 2 */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Quick Links</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/" className="hover:text-indigo-400 transition">Home</Link></li>
            <li><Link to="/events" className="hover:text-indigo-400 transition">All Events</Link></li>
            <li><Link to="/login" className="hover:text-indigo-400 transition">Sign In</Link></li>
            <li><Link to="/register" className="hover:text-indigo-400 transition">Register</Link></li>
          </ul>
        </div>

        {/* Col 3 */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Organizers & Admins</h4>
          <ul className="space-y-2.5 text-xs">
            <li><Link to="/admin" className="hover:text-indigo-400 transition">Organizer Dashboard</Link></li>
            <li><Link to="/admin/create-event" className="hover:text-indigo-400 transition">Host an Event</Link></li>
            <li><Link to="/admin" className="hover:text-indigo-400 transition">Admin Portal</Link></li>
            <li><Link to="/admin/categories" className="hover:text-indigo-400 transition">Manage Categories</Link></li>
          </ul>
        </div>

        {/* Col 4 */}
        <div>
          <h4 className="text-sm font-bold text-white uppercase tracking-wider mb-4">Contact & Support</h4>
          <div className="space-y-3 text-xs">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-indigo-400" />
              <span>support@eventhub.com</span>
            </div>
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-purple-400" />
              <span>San Francisco, CA & Austin, TX</span>
            </div>
          </div>
        </div>

      </div>

      <div className="container mt-12 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
        <div>
          © 2026 EventHub Inc. All rights reserved. FastAPI & React Architecture.
        </div>
        <div className="flex items-center gap-4">
          <a href="#" className="text-xs hover:text-white flex items-center gap-1"><ExternalLink className="w-4 h-4" />Twitter</a>
          <a href="#" className="text-xs hover:text-white flex items-center gap-1"><ExternalLink className="w-4 h-4" />LinkedIn</a>
          <a href="#" className="text-xs hover:text-white flex items-center gap-1"><ExternalLink className="w-4 h-4" />GitHub</a>
        </div>
      </div>
    </footer>
  );
}
