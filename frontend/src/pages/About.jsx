import React from 'react';
import { Calendar, Users, ShieldCheck, Zap, Award, Globe, Heart } from 'lucide-react';

export default function About() {
  return (
    <div className="app-container py-12 space-y-12">
      
      {/* Hero */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <span className="status-pill status-published text-xs">About EventHub</span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
          Connecting People Through <br />
          <span className="text-blue-600">Unforgettable Events</span>
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          EventHub is the premiere platform for discovering, booking, and hosting live workshops, tech conferences, music concerts, and business summits worldwide.
        </p>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">10,000+</h3>
          <p className="text-xs text-slate-500 mt-1">Events Hosted</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mx-auto mb-3">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">500,000+</h3>
          <p className="text-xs text-slate-500 mt-1">Happy Attendees</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 flex items-center justify-center mx-auto mb-3">
            <Globe className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">50+</h3>
          <p className="text-xs text-slate-500 mt-1">Cities Covered</p>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-6 text-center shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center mx-auto mb-3">
            <Award className="w-6 h-6" />
          </div>
          <h3 className="text-2xl font-extrabold text-slate-900">99.9%</h3>
          <p className="text-xs text-slate-500 mt-1">Verified Pass Rate</p>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Zap className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Mission</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To empower event organizers with seamless management tools while providing attendees with effortless discovery, instant pass booking, and verified venue entry.
          </p>
        </div>

        <div className="bg-white border border-slate-200 rounded-2xl p-8 shadow-sm space-y-3">
          <div className="w-10 h-10 rounded-lg bg-purple-600 text-white flex items-center justify-center font-bold">
            <Heart className="w-5 h-5" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Our Vision</h3>
          <p className="text-slate-600 text-sm leading-relaxed">
            To create a global community where technology, culture, education, and entertainment come together seamlessly in verified physical and digital events.
          </p>
        </div>
      </div>

    </div>
  );
}
