import React, { useState } from 'react';
import { X, PlusCircle, Calendar, MapPin, DollarSign, Image, Tag, Users } from 'lucide-react';

export default function CreateEventModal({ categories, venues, onClose, onCreate }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat-1');
  const [venueId, setVenueId] = useState(venues[0]?.id || 'ven-1');
  const [startTime, setStartTime] = useState('2026-11-20T10:00');
  const [endTime, setEndTime] = useState('2026-11-20T18:00');
  const [bannerImage, setBannerImage] = useState('https://images.unsplash.com/photo-1540575467063-178a50c2df87');
  const [price, setPrice] = useState(49);
  const [capacity, setCapacity] = useState(250);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await onCreate({
        title,
        description,
        category_id: categoryId,
        venue_id: venueId,
        start_time: startTime,
        end_time: endTime,
        banner_image: bannerImage,
        price: Number(price),
        capacity: Number(capacity),
        tags: ['New', 'Featured']
      });
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-xl border-slate-700 p-6 relative">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full bg-slate-900 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="mb-6">
          <h3 className="text-2xl font-extrabold text-white flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-indigo-400" />
            <span>Host New Event</span>
          </h3>
          <p className="text-xs text-slate-400 mt-1">
            Fill in the details to publish your event on EventHub platform
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Event Title</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. AI & Future Tech Conference 2026"
              className="input-field"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Description</label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide event overview, keynote speakers, and agenda details..."
              className="input-field"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Category</label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="input-field"
              >
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Venue Location</label>
              <select
                value={venueId}
                onChange={(e) => setVenueId(e.target.value)}
                className="input-field"
              >
                {venues.map((v) => (
                  <option key={v.id} value={v.id}>{v.name} ({v.city})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Start Date & Time</label>
              <input
                type="datetime-local"
                required
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">End Date & Time</label>
              <input
                type="datetime-local"
                required
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price ($)</label>
              <input
                type="number"
                min="0"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Capacity</label>
              <input
                type="number"
                min="10"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="input-field"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Banner Image URL</label>
            <input
              type="url"
              value={bannerImage}
              onChange={(e) => setBannerImage(e.target.value)}
              placeholder="https://images.unsplash.com/..."
              className="input-field"
            />
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn btn-primary w-full py-3 text-sm font-bold mt-4"
          >
            {submitting ? 'Publishing...' : 'Publish Event Live'}
          </button>
        </form>

      </div>
    </div>
  );
}
