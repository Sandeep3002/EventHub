import React, { useState } from 'react';
import { X, User, Phone, Mail, Calendar, ArrowRight, ShieldCheck } from 'lucide-react';

export default function RegistrationFormModal({ event, onClose, onSubmit }) {
  const [form, setForm] = useState({
    full_name: '',
    phone: '',
    email: '',
    age: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(er => ({ ...er, [name]: '' }));
  };

  const validate = () => {
    const errs = {};
    if (!form.full_name.trim()) errs.full_name = 'Full name is required';
    if (!form.phone.trim()) errs.phone = 'Phone number is required';
    else if (!/^\d{10}$/.test(form.phone.replace(/[\s-]/g, ''))) errs.phone = 'Enter a valid 10-digit phone number';
    if (!form.email.trim()) errs.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Enter a valid email address';
    if (!form.age.trim()) errs.age = 'Age is required';
    else if (isNaN(Number(form.age)) || Number(form.age) < 1 || Number(form.age) > 120) errs.age = 'Enter a valid age';
    return errs;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }
    onSubmit({ ...form, age: Number(form.age) });
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-0 relative overflow-hidden">

        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-5">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition"
          >
            <X className="w-4 h-4" />
          </button>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <ShieldCheck className="w-5 h-5" />
            Attendee Registration
          </h3>
          <p className="text-xs text-blue-100 mt-1">
            Fill in your details for <span className="font-semibold text-white">{event?.title}</span>. These will be verified at entry.
          </p>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">

          {/* Full Name */}
          <div className="form-group">
            <label className="form-label text-xs flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-blue-600" />
              Full Name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="full_name"
              placeholder="e.g. Sandeep Kumar"
              value={form.full_name}
              onChange={handleChange}
              className="form-input text-sm"
            />
            {errors.full_name && <p className="text-red-500 text-[11px]">{errors.full_name}</p>}
          </div>

          {/* Phone Number */}
          <div className="form-group">
            <label className="form-label text-xs flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-blue-600" />
              Phone Number <span className="text-red-500">*</span>
            </label>
            <input
              type="tel"
              name="phone"
              placeholder="e.g. 9876543210"
              value={form.phone}
              onChange={handleChange}
              className="form-input text-sm"
            />
            {errors.phone && <p className="text-red-500 text-[11px]">{errors.phone}</p>}
          </div>

          {/* Email */}
          <div className="form-group">
            <label className="form-label text-xs flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-blue-600" />
              Email Address <span className="text-red-500">*</span>
            </label>
            <input
              type="email"
              name="email"
              placeholder="e.g. sandeep@gmail.com"
              value={form.email}
              onChange={handleChange}
              className="form-input text-sm"
            />
            {errors.email && <p className="text-red-500 text-[11px]">{errors.email}</p>}
          </div>

          {/* Age */}
          <div className="form-group">
            <label className="form-label text-xs flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-blue-600" />
              Age <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              name="age"
              placeholder="e.g. 25"
              min="1"
              max="120"
              value={form.age}
              onChange={handleChange}
              className="form-input text-sm"
            />
            {errors.age && <p className="text-red-500 text-[11px]">{errors.age}</p>}
          </div>

          {/* Info Note */}
          <div className="bg-blue-50 border border-blue-100 p-3 rounded-xl text-[11px] text-slate-600 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
            <span>Your details will be used for identity verification at the event venue. Please ensure all information is accurate.</span>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="btn-primary w-full py-3 text-sm font-bold flex items-center justify-center gap-2 rounded-xl"
          >
            <span>Continue to Checkout</span>
            <ArrowRight className="w-4 h-4" />
          </button>

        </form>
      </div>
    </div>
  );
}
