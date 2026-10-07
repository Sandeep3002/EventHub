import React from 'react';
import { Search, MapPin, Tag } from 'lucide-react';

export default function SearchBar({
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  categories = []
}) {
  return (
    <div className="glass-panel p-3 rounded-2xl max-w-4xl mx-auto border border-indigo-500/20 shadow-xl flex flex-col md:flex-row items-center gap-3">
      
      {/* Search Input */}
      <div className="flex-1 flex items-center gap-3 px-4 w-full border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0">
        <Search className="w-5 h-5 text-indigo-400 shrink-0" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search by event title, keyword, tech summit..."
          className="w-full bg-transparent border-none outline-none text-white placeholder-slate-400 text-sm"
        />
      </div>

      {/* Category Dropdown */}
      <div className="flex items-center gap-3 px-4 w-full md:w-auto border-b md:border-b-0 md:border-r border-slate-800 pb-3 md:pb-0">
        <Tag className="w-5 h-5 text-purple-400 shrink-0" />
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="bg-transparent border-none outline-none text-slate-300 text-sm font-medium cursor-pointer w-full"
        >
          <option value="all" className="bg-slate-900 text-white">All Categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id} className="bg-slate-900 text-white">
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {/* Location */}
      <div className="flex items-center gap-3 px-4 w-full md:w-auto">
        <MapPin className="w-5 h-5 text-cyan-400 shrink-0" />
        <select className="bg-transparent border-none outline-none text-slate-300 text-sm font-medium cursor-pointer w-full">
          <option className="bg-slate-900 text-white">All Locations</option>
          <option className="bg-slate-900 text-white">San Francisco, CA</option>
          <option className="bg-slate-900 text-white">New York, NY</option>
          <option className="bg-slate-900 text-white">Austin, TX</option>
        </select>
      </div>

    </div>
  );
}
