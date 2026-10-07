import React, { useState } from 'react';
import { Mail, Phone, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

export default function Contact() {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setForm({ name: '', email: '', subject: '', message: '' });
    setTimeout(() => setSubmitted(false), 5000);
  };

  return (
    <div className="app-container py-12 space-y-12">
      
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <span className="status-pill status-published text-xs">Get In Touch</span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
          Contact Us
        </h1>
        <p className="text-slate-600 text-sm">
          Have questions, feedback, or need help with your tickets? Send us a message and our support team will respond promptly.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
        
        {/* Contact Info Cards */}
        <div className="space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Email Support</h4>
              <p className="text-xs text-slate-500 mt-0.5">support@eventhub.com</p>
              <p className="text-xs text-slate-500">info@eventhub.com</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
              <Phone className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Phone Hotline</h4>
              <p className="text-xs text-slate-500 mt-0.5">+1 (800) 555-EVENT</p>
              <p className="text-xs text-slate-500">+91 98765 43210</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Head Office</h4>
              <p className="text-xs text-slate-500 mt-0.5">EventHub Tech Hub, HITEC City</p>
              <p className="text-xs text-slate-500">Hyderabad, Telangana 500081</p>
            </div>
          </div>

          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm flex items-start gap-4">
            <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-slate-900">Working Hours</h4>
              <p className="text-xs text-slate-500 mt-0.5">Monday - Saturday</p>
              <p className="text-xs text-slate-500">9:00 AM - 6:00 PM IST</p>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-8 shadow-sm">
          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 rounded-full bg-green-100 text-green-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Message Sent Successfully!</h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Thank you for contacting EventHub. Our support team will get back to you within 24 hours.
              </p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="form-group mb-0">
                  <label className="form-label text-xs">Your Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="Enter your name"
                    className="form-input text-xs"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                  />
                </div>

                <div className="form-group mb-0">
                  <label className="form-label text-xs">Email Address *</label>
                  <input
                    type="email"
                    required
                    placeholder="Enter your email"
                    className="form-input text-xs"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                  />
                </div>
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs">Subject *</label>
                <input
                  type="text"
                  required
                  placeholder="Enter subject"
                  className="form-input text-xs"
                  value={form.subject}
                  onChange={(e) => setForm({ ...form, subject: e.target.value })}
                />
              </div>

              <div className="form-group mb-0">
                <label className="form-label text-xs">Message *</label>
                <textarea
                  rows={5}
                  required
                  placeholder="Write your message here..."
                  className="form-textarea text-xs"
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                />
              </div>

              <button type="submit" className="btn-primary w-full py-3 text-xs flex items-center justify-center gap-2">
                <Send className="w-4 h-4" />
                <span>Send Message</span>
              </button>
            </form>
          )}
        </div>

      </div>

    </div>
  );
}
