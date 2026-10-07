import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { Upload } from 'lucide-react';

export default function CreateEvent() {
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);

  const [form, setForm] = useState({
    title: '',
    description: '',
    category: '',
    date: '',
    startTime: '',
    location: '',
    price: '',
    capacity: '',
    banner_image: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime = form.date && form.startTime
        ? new Date(`${form.date}T${form.startTime}:00`).toISOString()
        : new Date().toISOString();
      const endDate = new Date(startDateTime);
      endDate.setHours(endDate.getHours() + 3);
      const endDateTime = endDate.toISOString();

      await eventService.createEvent({
        title: form.title,
        description: form.description,
        category_id: form.category || 'general',
        venue_id: form.location || 'tbd',
        start_time: startDateTime,
        end_time: endDateTime,
        banner_image: form.banner_image,
        price: Number(form.price || 0),
        capacity: Number(form.capacity || 100),
        tags: [],
      });
      navigate('/admin/manage-events');
    } catch (err) {
      console.error('Failed to create event:', err);
      alert('Failed to create event: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="dashboard-layout">
      {/* Sidebar */}
      <Sidebar role="admin" />

      {/* Main Content */}
      <main className="dashboard-content space-y-6">
        
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Create New Event</h1>
        </div>

        {/* Form Container */}
        <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-xl p-6 shadow-sm">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Form Fields */}
            <div className="lg:col-span-2 space-y-4">
              
              <div className="form-group">
                <label className="form-label text-xs">Event Title *</label>
                <input
                  type="text"
                  name="title"
                  placeholder="Enter event title"
                  className="form-input text-xs"
                  required
                  value={form.title}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Description *</label>
                <textarea
                  name="description"
                  placeholder="Enter event description"
                  rows={4}
                  className="form-textarea text-xs"
                  required
                  value={form.description}
                  onChange={handleChange}
                />
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Category *</label>
                <select
                  name="category"
                  className="form-select text-xs"
                  required
                  value={form.category}
                  onChange={handleChange}
                >
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Business">Business</option>
                  <option value="Music">Music</option>
                  <option value="Education">Education</option>
                  <option value="Health">Health</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Event Date *</label>
                  <input
                    type="date"
                    name="date"
                    className="form-input text-xs"
                    required
                    value={form.date}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Start Time *</label>
                  <input
                    type="time"
                    name="startTime"
                    className="form-input text-xs"
                    required
                    value={form.startTime}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label text-xs">Location *</label>
                  <input
                    type="text"
                    name="location"
                    placeholder="Enter venue"
                    className="form-input text-xs"
                    required
                    value={form.location}
                    onChange={handleChange}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label text-xs">Price *</label>
                  <input
                    type="number"
                    name="price"
                    placeholder="Enter price"
                    className="form-input text-xs"
                    required
                    value={form.price}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label text-xs">Capacity *</label>
                <input
                  type="number"
                  name="capacity"
                  placeholder="Enter capacity"
                  className="form-input text-xs"
                  required
                  value={form.capacity}
                  onChange={handleChange}
                />
              </div>

            </div>

            {/* Right Column: Upload Box */}
            <div className="space-y-4">
              <label className="form-label text-xs">Event Image</label>
              
              <div className="upload-dropzone min-h-[220px]">
                <Upload className="w-8 h-8 text-slate-400" />
                <span className="text-xs font-bold text-slate-700">Upload event image</span>
                <span className="text-[11px] text-slate-400">JPG, PNG (Max 5MB)</span>
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="btn-primary w-full py-3 text-xs mt-6"
              >
                {submitting ? 'Creating Event...' : 'Create Event'}
              </button>
            </div>

          </div>
        </form>

      </main>
    </div>
  );
}
