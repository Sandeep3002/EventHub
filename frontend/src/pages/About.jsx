import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Calendar, Users, Globe, Award, Zap, Heart,
  Sparkles, ShieldCheck, TrendingUp, Lock, ArrowLeft,
  CheckCircle2, Bell, Star, BarChart3
} from 'lucide-react';

export default function About() {
  const navigate = useNavigate();

  return (
    <div style={{ minHeight: '100vh', background: '#f8fafc', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>

      {/* Hero */}
      <div style={{ width: '100%', background: 'linear-gradient(160deg,#f5f3ff 0%,#fff 60%,#f8fafc 100%)', borderBottom: '1px solid #e9e9f0' }}>

        {/* Back button — pure left edge */}
        <div style={{ padding: '24px 24px 0' }}>
          <button onClick={() => navigate(-1)} style={{
            display: 'inline-flex', alignItems: 'center', gap: 8,
            padding: '8px 16px', borderRadius: 10, background: '#fff',
            border: '1px solid #e2e8f0', fontSize: 13, fontWeight: 600,
            color: '#475569', cursor: 'pointer', boxShadow: '0 1px 4px rgba(0,0,0,.06)',
          }}>
            <ArrowLeft size={15} /> Back
          </button>
        </div>

        <div style={{ maxWidth: 860, margin: '0 auto', padding: '32px 24px 56px' }}>

          {/* Centered hero */}
          <div style={{ textAlign: 'center', maxWidth: 680, margin: '0 auto' }}>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 8,
              padding: '6px 16px', borderRadius: 999, background: '#f3e8ff',
              border: '1px solid #e9d5ff', color: '#7c3aed', fontSize: 12,
              fontWeight: 700, marginBottom: 24,
            }}>
              <Sparkles size={14} /> About EventHub
            </div>

            <h1 style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)', fontWeight: 900, lineHeight: 1.15,
              color: '#0f172a', margin: '0 0 20px', letterSpacing: '-0.5px',
            }}>
              Connecting People Through{' '}
              <span style={{ background: 'linear-gradient(135deg,#7c3aed,#2563eb)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                Unforgettable Events
              </span>
            </h1>

            <p style={{ fontSize: 16, color: '#64748b', lineHeight: 1.75, margin: 0 }}>
              EventHub is the premiere platform for discovering, booking, and hosting live workshops,
              tech conferences, music concerts, and business summits worldwide. We bring organizers
              and attendees together in one seamless experience.
            </p>
          </div>
        </div>
      </div>

      {/* Main */}
      <main style={{ width: '100%', maxWidth: 860, margin: '0 auto', padding: '48px 24px 80px', display: 'flex', flexDirection: 'column', gap: 48 }}>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16 }}>
          {[
            { icon: Calendar, value: '10,000+',  label: 'Events Hosted',      color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe' },
            { icon: Users,    value: '500,000+', label: 'Happy Attendees',    color: '#2563eb', bg: '#eff6ff', border: '#dbeafe' },
            { icon: Globe,    value: '50+',       label: 'Cities Covered',     color: '#059669', bg: '#ecfdf5', border: '#d1fae5' },
            { icon: Award,    value: '99.9%',     label: 'Verified Pass Rate', color: '#d97706', bg: '#fffbeb', border: '#fde68a' },
          ].map((s, i) => (
            <div key={i} style={{
              padding: '24px 16px', borderRadius: 16, background: '#fff',
              border: `1px solid ${s.border}`, textAlign: 'center',
              boxShadow: '0 1px 6px rgba(0,0,0,.05)',
            }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
                <s.icon size={20} color={s.color} />
              </div>
              <div style={{ fontSize: 28, fontWeight: 900, color: '#0f172a', lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 6, fontWeight: 500 }}>{s.label}</div>
            </div>
          ))}
        </div>

        {/* Our Story */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '40px 48px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 24px' }}>Our Story</h2>
          <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
            {[
              'EventHub was born from a simple observation: organizing and attending events should not be complicated. Too many platforms were fragmented — one for ticketing, another for venue management, yet another for attendee communication. We set out to build a unified platform that handles everything from event creation to post-event analytics.',
              'Today, EventHub serves thousands of organizers across 50+ cities, powering everything from intimate workshops to large-scale tech conferences. Our platform processes hundreds of thousands of bookings with a 99.9% verified pass rate, ensuring every attendee gets a seamless entry experience.',
              'Built on a modern tech stack with FastAPI and React, EventHub delivers the speed and reliability that organizers and attendees expect. Our multi-role architecture ensures that every user — from SuperAdmins to Attendees — gets a tailored experience designed for their specific needs.',
            ].map((p, i) => (
              <p key={i} style={{ fontSize: 14, color: '#475569', lineHeight: 1.8, margin: 0 }}>{p}</p>
            ))}
          </div>
        </div>

        {/* Mission & Vision */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[
            { icon: Zap,   color: '#7c3aed', bg: '#f5f3ff', border: '#ede9fe', title: 'Our Mission',
              text: 'To empower event organizers with seamless management tools while providing attendees with effortless discovery, instant pass booking, and verified venue entry. We believe that the best events happen when technology gets out of the way and lets people focus on what matters — the experience.' },
            { icon: Heart, color: '#2563eb', bg: '#eff6ff', border: '#dbeafe', title: 'Our Vision',
              text: 'To create a global community where technology, culture, education, and entertainment come together seamlessly in verified physical and digital events. We envision a world where anyone can discover, attend, or host an event with just a few clicks — no matter where they are.' },
          ].map((item, i) => (
            <div key={i} style={{ padding: 32, borderRadius: 20, background: '#fff', border: `1px solid ${item.border}`, textAlign: 'center', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
              <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
                <item.icon size={20} color={item.color} />
              </div>
              <h3 style={{ fontSize: 18, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>{item.title}</h3>
              <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.8, margin: 0 }}>{item.text}</p>
            </div>
          ))}
        </div>

        {/* Features */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
          <div style={{ textAlign: 'center' }}>
            <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', margin: '0 0 12px' }}>Why Organizers &amp; Attendees Choose EventHub</h2>
            <p style={{ fontSize: 14, color: '#64748b', lineHeight: 1.7, margin: 0 }}>
              A powerful, all-in-one platform built with high-performance FastAPI backend and modern React frontend.
            </p>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 18 }}>
            {[
              { icon: ShieldCheck, title: 'Multi-Role Security',   desc: 'Custom dashboards for SuperAdmins, Admins, Organizers, and Attendees with role-based access control across every feature.', color: '#7c3aed', bg: '#f5f3ff' },
              { icon: TrendingUp,  title: 'Real-Time Analytics',   desc: 'Track ticket sales, attendance metrics, revenue breakdowns, and booking trends with interactive charts and live data.', color: '#2563eb', bg: '#eff6ff' },
              { icon: Lock,        title: 'Instant Pass Booking',  desc: 'Secure, instant cryptographic QR passes generated upon successful booking with Razorpay payment integration.', color: '#059669', bg: '#ecfdf5' },
              { icon: Bell,        title: 'Smart Notifications',   desc: 'Stay informed with real-time notifications for bookings, cancellations, event updates, and announcements from organizers.', color: '#ea580c', bg: '#fff7ed' },
              { icon: Star,        title: 'Favorites & Discovery', desc: 'Save events you love, browse by category or venue, and discover new experiences through powerful search and filters.', color: '#d97706', bg: '#fffbeb' },
              { icon: BarChart3,   title: 'Organizer Dashboard',   desc: 'Comprehensive dashboard with event management, registration tracking, revenue insights, and attendee communication.', color: '#4f46e5', bg: '#eef2ff' },
            ].map((item, i) => (
              <div key={i} style={{ padding: 24, borderRadius: 16, background: '#fff', border: '1px solid #e2e8f0', textAlign: 'center', boxShadow: '0 1px 6px rgba(0,0,0,.04)' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: item.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px' }}>
                  <item.icon size={20} color={item.color} />
                </div>
                <h4 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', margin: '0 0 8px' }}>{item.title}</h4>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.7, margin: 0 }}>{item.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* What You Can Do */}
        <div style={{ background: '#fff', borderRadius: 20, border: '1px solid #e2e8f0', padding: '40px 48px', boxShadow: '0 2px 8px rgba(0,0,0,.04)' }}>
          <h2 style={{ fontSize: 26, fontWeight: 800, color: '#0f172a', textAlign: 'center', margin: '0 0 32px' }}>What You Can Do on EventHub</h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 48px', maxWidth: 680, margin: '0 auto' }}>
            {[
              'Browse and discover events by category, venue, date, and price',
              'Book tickets instantly with secure Razorpay payment processing',
              'Create and manage events with full control over details and capacity',
              'Track registrations, revenue, and attendance in real time',
              'Save favorite events and get notified about updates',
              'Cancel bookings with automatic seat restoration',
              'Manage users, roles, categories, and venues as an admin',
              'Receive notifications for all booking and event activities',
              'Filter and sort events by date, price range, and popularity',
              'Access role-specific dashboards tailored to your needs',
            ].map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: '10px 0', borderBottom: '1px solid #f1f5f9' }}>
                <CheckCircle2 size={16} color="#7c3aed" style={{ flexShrink: 0, marginTop: 2 }} />
                <span style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{item}</span>
              </div>
            ))}
          </div>
        </div>



      </main>

      {/* Footer */}
      <footer style={{ width: '100%', borderTop: '1px solid #e2e8f0', background: '#fff', padding: '20px 24px', textAlign: 'center', fontSize: 13, color: '#94a3b8' }}>
        &copy; 2026 EventHub Inc. All rights reserved. FastAPI &amp; React Architecture.
      </footer>

    </div>
  );
}
