import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Heart } from 'lucide-react';

export default function EventCard({ event, venue, category }) {
  const [isSaved, setIsSaved] = useState(false);

  const formatDate = (dateStr) => {
    if (!dateStr) return 'Oct 15, 2026';
    const date = new Date(dateStr);
    return isNaN(date.getTime())
      ? dateStr
      : date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formattedPrice = event?.price > 0 ? `₹${event.price}` : 'Free';
  const categoryName = category?.name || event?.category || 'Technology';
  const locationName = venue?.city || event?.location || 'Hyderabad';
  const eventDate = formatDate(event?.start_time || event?.date);

  return (
    <div className="event-card">
      {/* Event Image */}
      <div className="event-card-img-wrapper">
        <img
          src={event?.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
          alt={event?.title || 'Event Image'}
          className="event-card-img"
        />
        {/* Category Pill */}
        <span className="event-card-badge">
          {categoryName}
        </span>
        {/* Heart Bookmark */}
        <button
          onClick={(e) => {
            e.preventDefault();
            setIsSaved(!isSaved);
          }}
          className="event-card-bookmark"
          title="Save Event"
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-red-500 text-red-500' : 'text-slate-600'}`} />
        </button>
      </div>

      {/* Body */}
      <div className="event-card-body">
        <h3 className="event-card-title">{event?.title || 'Tech Innovators Conference'}</h3>

        <div className="event-card-meta">
          <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{locationName}</span>
        </div>

        <div className="event-card-meta mb-3">
          <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
          <span>{eventDate}</span>
        </div>

        <div className="flex items-center justify-between mt-auto pt-3 border-t border-slate-100">
          <div className="event-card-price">{formattedPrice}</div>
          <Link to="/customer/events" className="btn-primary text-xs py-2 px-4">
            View Details
          </Link>
        </div>
      </div>
    </div>
  );
}
