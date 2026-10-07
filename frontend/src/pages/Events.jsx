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

  // Filters state
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
  };

  const sampleEvents = [
    { id: 1, title: 'Tech Innovators Conference', location: 'Hyderabad', date: 'Oct 15, 2026', price: 500, category: 'Technology', banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80' },
    { id: 2, title: 'Python Workshop', location: 'Bangalore', date: 'Nov 5, 2026', price: 300, category: 'Technology', banner_image: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=600&q=80' },
    { id: 3, title: 'AI Meetup', location: 'Chennai', date: 'Nov 18, 2026', price: 200, category: 'Technology', banner_image: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=600&q=80' },
    { id: 4, title: 'Startup Summit', location: 'Delhi', date: 'Dec 10, 2026', price: 1000, category: 'Business', banner_image: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=600&q=80' },
    { id: 5, title: 'Data Science Seminar', location: 'Pune', date: 'Dec 18, 2026', price: 500, category: 'Technology', banner_image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=600&q=80' },
    { id: 6, title: 'Music Concert', location: 'Mumbai', date: 'Jan 5, 2027', price: 1500, category: 'Music', banner_image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=600&q=80' },
  ];

  const allEventsList = events.length > 0 ? events : sampleEvents;

  const filteredEvents = allEventsList.filter(e => {
    const matchQuery = !searchQuery || e.title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchCat = selectedCategory === 'All Categories' || (e.category && e.category.toLowerCase().includes(selectedCategory.toLowerCase()));
    const matchLoc = selectedLocation === 'All Locations' || (e.location && e.location.toLowerCase().includes(selectedLocation.toLowerCase()));
    return matchQuery && matchCat && matchLoc;
  });

  if (loading) return <Loading label="Loading Events Catalogue..." />;

  const categoryOptions = ['All Categories', 'Technology', 'Business', 'Music', 'Education', 'Health', 'Other'];
  const locationOptions = ['All Locations', 'Hyderabad', 'Bangalore', 'Chennai', 'Delhi', 'Mumbai', 'Pune'];

  return (
    <div className="app-container py-8">
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left Sidebar Filters */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm space-y-6 h-fit">
          <h2 className="text-base font-bold text-slate-900 border-b border-slate-100 pb-3">Filters</h2>

          {/* Search Input */}
          <div className="form-group">
            <label className="form-label text-xs">Search</label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search events..."
                className="form-input pl-9 text-xs"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Category List */}
          <div className="form-group">
            <label className="form-label text-xs">Category</label>
            <div className="space-y-1.5 mt-1">
              {categoryOptions.map((cat, idx) => (
                <label key={idx} className="flex items-center gap-2 text-xs text-slate-700 cursor-pointer hover:text-blue-600">
                  <input
                    type="radio"
                    name="category"
                    checked={selectedCategory === cat}
                    onChange={() => setSelectedCategory(cat)}
                    className="accent-blue-600"
                  />
                  <span>{cat}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Location Dropdown */}
          <div className="form-group">
            <label className="form-label text-xs">Location</label>
            <select
              className="form-select text-xs"
              value={selectedLocation}
              onChange={(e) => setSelectedLocation(e.target.value)}
            >
              {locationOptions.map((loc, idx) => (
                <option key={idx} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          {/* Date Dropdown */}
          <div className="form-group">
            <label className="form-label text-xs">Date</label>
            <select
              className="form-select text-xs"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
            >
              <option value="Any Date">Any Date</option>
              <option value="Today">Today</option>
              <option value="This Week">This Week</option>
              <option value="This Month">This Month</option>
            </select>
          </div>

          {/* Price Range */}
          <div className="form-group">
            <label className="form-label text-xs">Price Range</label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="form-input text-xs"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="form-input text-xs"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
              />
            </div>
          </div>

          {/* Buttons */}
          <div className="space-y-2 pt-2">
            <button className="btn-primary w-full text-xs py-2.5">
              Apply Filters
            </button>
            <button onClick={handleClear} className="btn-outline w-full text-xs py-2">
              Clear
            </button>
          </div>

        </div>

        {/* Right Main Grid */}
        <div className="lg:col-span-3 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
            <div>
              <h1 className="text-xl font-bold text-slate-900">All Events</h1>
              <p className="text-xs text-slate-500">Discover and join amazing events</p>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-slate-500 whitespace-nowrap">Sort by:</span>
              <select
                className="form-select text-xs py-1.5 px-3"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="Latest">Latest</option>
                <option value="PriceLow">Price: Low to High</option>
                <option value="PriceHigh">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredEvents.map((evt) => (
              <EventCard
                key={evt.id}
                event={evt}
                venue={venues.find(v => v.id === evt.venue_id)}
                category={categories.find(c => c.id === evt.category_id)}
              />
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
