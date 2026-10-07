import React from 'react';
import { Sparkles, Calendar, MapPin, Search, ArrowRight, ShieldCheck, Zap } from 'lucide-react';

export default function Hero({ searchQuery, setSearchQuery, selectedCategory, setSelectedCategory, categories }) {
  return (
    <section className="relative pt-12 pb-20 overflow-hidden">
      
      {/* Subtle Glow backdrop */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-gradient-to-r from-indigo-600/20 via-purple-600/20 to-pink-600/20 blur-3xl pointer-events-none rounded-full" />

      <div className="container relative z-10 text-center max-w-4xl mx-auto">
        
        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 mb-6 backdrop-blur-md">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-xs font-semibold text-indigo-300 uppercase tracking-wider">
            Next-Gen Event Experience & Instant Ticketing
          </span>
        </div>

        {/* Main Headline */}
        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-[1.15]">
          Unforgettable Moments,{' '}
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
            One Click Away.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="text-lg sm:text-xl text-slate-300 mb-10 max-w-2xl mx-auto leading-relaxed">
          Discover world-class tech summits, live concerts, startup pitch sessions, and cultural galas. Reserve your spot with real-time digital pass verification.
        </p>

        {/* Interactive Search Bar Box */}
        <div className="glass-panel p-3 rounded-2xl max-w-3xl mx-auto mb-12 shadow-2xl border border-indigo-500/20 flex flex-col sm:flex-row items-center gap-3">
          
          <div className="flex-1 flex items-center gap-3 px-4 w-full border-b sm:border-b-0 sm:border-r border-slate-800 pb-3 sm:pb-0">
            <Search className="w-5 h-5 text-indigo-400 shrink-0" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search event title or keywords..."
              className="w-full bg-transparent border-none outline-none text-white placeholder-slate-400 text-base"
            />
          </div>

          <div className="flex items-center gap-3 px-4 w-full sm:w-auto">
            <MapPin className="w-5 h-5 text-purple-400 shrink-0" />
            <select
              className="bg-transparent border-none outline-none text-slate-300 text-sm font-medium cursor-pointer"
            >
              <option className="bg-slate-900 text-white">All Locations</option>
              <option className="bg-slate-900 text-white">San Francisco, CA</option>
              <option className="bg-slate-900 text-white">New York, NY</option>
              <option className="bg-slate-900 text-white">Austin, TX</option>
              <option className="bg-slate-900 text-white">Chicago, IL</option>
            </select>
          </div>

          <button className="btn btn-primary w-full sm:w-auto py-3.5 px-6 whitespace-nowrap text-sm font-bold">
            <span>Explore Events</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
              selectedCategory === 'all'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
            }`}
          >
            All Events
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/40'
                  : 'bg-slate-900/60 text-slate-400 border border-slate-800 hover:border-slate-700 hover:text-white'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto mt-14 pt-8 border-t border-slate-800/80">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-white">500+</div>
            <div className="text-xs text-slate-400 font-medium">Verified Events</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-400">120K+</div>
            <div className="text-xs text-slate-400 font-medium">Tickets Issued</div>
          </div>
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-purple-400">99.8%</div>
            <div className="text-xs text-slate-400 font-medium">Satisfaction Rate</div>
          </div>
        </div>

      </div>
    </section>
  );
}
