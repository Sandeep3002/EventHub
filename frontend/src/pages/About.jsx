import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Globe, Award, Zap, Heart,
  Sparkles, ShieldCheck, TrendingUp, Lock
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1e1b4b] via-[#2d2975] to-[#1e1b4b] text-white flex flex-col justify-between overflow-x-hidden relative">

      {/* Ambient Decorative Background Glows */}
      <div className="absolute top-0 left-1/3 w-[500px] h-[500px] bg-purple-500/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-0 right-10 w-[500px] h-[500px] bg-indigo-500/10 rounded-full blur-[140px] pointer-events-none" />

      {/* ─── MAIN CONTENT ─── */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 relative z-10 space-y-16 flex-1">

        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-xs font-semibold text-slate-200 transition-all"
          >
            ← Back to Home
          </button>
        </div>

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-5">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-purple-500/15 border border-purple-500/30 text-purple-200 text-xs font-semibold backdrop-blur-md">
            <Sparkles className="w-4 h-4 text-purple-300 animate-pulse" />
            <span>About EventHub</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Connecting People Through <br />
            <span className="text-purple-400">Unforgettable Events</span>
          </h1>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl mx-auto">
            EventHub is the premiere platform for discovering, booking, and hosting live workshops, tech conferences, music concerts, and business summits worldwide.
          </p>
        </div>

        {/* 4 Stat Cards - Styled in unified dark indigo */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {[
            { icon: Calendar, value: '10,000+', label: 'Events Hosted', iconBg: 'bg-purple-500/20 text-purple-300' },
            { icon: Users, value: '500,000+', label: 'Happy Attendees', iconBg: 'bg-indigo-500/20 text-indigo-300' },
            { icon: Globe, value: '50+', label: 'Cities Covered', iconBg: 'bg-purple-500/20 text-purple-300' },
            { icon: Award, value: '99.9%', label: 'Verified Pass Rate', iconBg: 'bg-amber-500/20 text-amber-300' },
          ].map((stat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md text-center hover:bg-white/10 transition-all duration-300"
            >
              <div className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mx-auto mb-3`}>
                <stat.icon className="w-6 h-6" />
              </div>
              <h3 className="text-2xl sm:text-3xl font-extrabold text-white">{stat.value}</h3>
              <p className="text-xs text-slate-300 mt-1 font-medium">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Mission & Vision */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Mission</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              To empower event organizers with seamless management tools while providing attendees with effortless discovery, instant pass booking, and verified venue entry.
            </p>
          </div>

          <div className="p-8 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-4">
            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-bold">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white">Our Vision</h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              To create a global community where technology, culture, education, and entertainment come together seamlessly in verified physical and digital events.
            </p>
          </div>
        </div>

        {/* Why Choose EventHub */}
        <div className="space-y-8">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-2xl font-bold text-white">Why Organizers & Attendees Choose EventHub</h2>
            <p className="text-xs text-slate-300 mt-1">Built with high-performance FastAPI backend and modern React frontend.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: ShieldCheck, title: 'Multi-Role Security', desc: 'Custom tailored role dashboards for SuperAdmins, Organizers, and Attendees.' },
              { icon: TrendingUp, title: 'Real-Time Insights', desc: 'Track ticket sales, attendance metrics, and revenue analytics live.' },
              { icon: Lock, title: 'Instant Pass Booking', desc: 'Instant cryptographic QR ticket passes generated upon successful booking.' }
            ].map((item, idx) => (
              <div key={idx} className="p-6 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md space-y-3">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center">
                  <item.icon className="w-5 h-5" />
                </div>
                <h4 className="text-base font-bold text-white">{item.title}</h4>
                <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

      </main>

      {/* ─── FOOTER ─── */}
      <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-400 relative z-20">
        <p>© 2026 EventHub Inc. All rights reserved.</p>
      </footer>

    </div>
  );
}
