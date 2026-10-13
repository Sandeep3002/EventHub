import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { eventService } from '../services/eventService';
import EventCard from '../components/EventCard';
import Loading from '../components/Loading';
import { Search } from 'lucide-react';

export default function Events() {
  const [searchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialCategory = searchParams.get('category') || 'All Categories';

  const [events, setEvents] = useState([]);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [selectedCategory, setSelectedCategory] = useState(initialCategory);
  const [selectedLocation, setSelectedLocation] = useState('All Locations');
  const [selectedDate, setSelectedDate] = useState('Any Date');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [sortBy, setSortBy] = useState('Latest');

  useEffect(() => {
    async function load() {
      try {
        const [evts, cats, vens] = await Promise.all([
          eventService.getEvents(),
          eventService.getCategories(),
          eventService.getVenues()
        ]);
        setEvents(evts);
        setCategories(cats);
        setVenues(vens);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleClear = () => {
    setSearchQuery('');
    setSelectedCategory('All Categories');
    setSelectedLocation('All Locations');
    setSelectedDate('Any Date');
    setMinPrice('');
    setMaxPrice('');
    setSortBy('Latest');
  };

  const filteredEvents = events.filter(e => {
    const matchQuery = !searchQuery || e.title?.toLowerCase().includes(searchQuery.toLowerCase()) || e.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const catName = categories.find(c => c.id === e.category_id)?.name;
    const matchCat = selectedCategory === 'All Categories' || catName === selectedCategory || e.category_id === selectedCategory;

    const venueName = venues.find(v => v.id === e.venue_id)?.city;
    const matchLoc = selectedLocation === 'All Locations' || venueName === selectedLocation;

    // Date filter
    let matchDate = true;
    if (selectedDate !== 'Any Date' && e.start_time) {
      const eventDate = new Date(e.start_time);
      const now = new Date();
      if (selectedDate === 'Today') {
        matchDate = eventDate.toDateString() === now.toDateString();
      } else if (selectedDate === 'This Week') {
        const weekEnd = new Date(now);
        weekEnd.setDate(weekEnd.getDate() + 7);
        matchDate = eventDate >= now && eventDate <= weekEnd;
      } else if (selectedDate === 'This Month') {
        matchDate = eventDate.getMonth() === now.getMonth() && eventDate.getFullYear() === now.getFullYear();
      }
    }

    // Price filter
    const price = e.price ?? 0;
    const matchMin = !minPrice || price >= Number(minPrice);
    const matchMax = !maxPrice || price <= Number(maxPrice);

    return matchQuery && matchCat && matchLoc && matchDate && matchMin && matchMax;
  });

  // Sort
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (sortBy === 'PriceLow') return (a.price || 0) - (b.price || 0);
    if (sortBy === 'PriceHigh') return (b.price || 0) - (a.price || 0);
    return new Date(b.start_time || b.created_at || 0) - new Date(a.start_time || a.created_at || 0);
  });

  if (loading) return <Loading label="Loading Events Catalogue..." />;

  const categoryOptions = ['All Categories', ...categories.map(c => c.name)];
  const locationOptions = ['All Locations', ...new Set(venues.map(v => v.city).filter(Boolean))];

  return (
    <div className="app-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Filters</h2>

          <div className="form-group">
            <label className="form-label text-xs">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input type="text" placeholder="Search events..." className="form-input pl-9 text-xs"
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Category</label>
            <div className="space-y-1.5 mt-1">
              {categoryOptions.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-blue-600">
                  <input type="radio" name="category" checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)} className="accent-blue-600" />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Location</label>
            <select className="form-select text-xs" value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)}>
              {locationOptions.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Date</label>
            <select className="form-select text-xs" value={selectedDate} onChange={(e) => setSelectedDate(e.target.value)}>
              <option value="Any Date">Any Date</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label text-xs">Price Range</label>
            <div className="flex gap-2">
              <input type="number" placeholder="Min" className="form-input text-xs" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} />
              <input type="number" placeholder="Max" className="form-input text-xs" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} />
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <button onClick={handleClear} className="btn-outline w-full text-xs py-2">
              Clear Filters
            </button>
          </div>
        </div>

        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900">All Events</h1>
              <p className="text-xs text-slate-500">{sortedEvents.length} events found</p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <select className="form-select text-xs py-1.5 px-3" value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
                <option value="Latest">Latest</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {sortedEvents.map((evt) => (
              <EventCard key={evt.id} event={evt}
                venue={venues.find(v => v.id === evt.venue_id)}
                category={categories.find(c => c.id === evt.category_id)} />
            ))}
            {sortedEvents.length === 0 && (
              <div className="col-span-full text-center py-16 text-slate-400 text-sm">No events match your filters.</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
