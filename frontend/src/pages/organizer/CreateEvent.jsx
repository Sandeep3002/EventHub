import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';
import { eventService } from '../../services/eventService';
import { bookingService } from '../../services/bookingService';
import { Upload, Building2, CreditCard, CheckCircle2, ChevronRight, AlertCircle } from 'lucide-react';

function StepBadge({ step, current, label, icon: Icon }) {
  const done   = current > step;
  const active = current === step;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
      <div style={{
        width: 40, height: 40, borderRadius: '50%', display: 'flex',
        alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 15,
        transition: 'all .3s',
        background: done ? '#4f46e5' : active ? '#6366f1' : '#e2e8f0',
        color: done || active ? '#fff' : '#94a3b8',
        boxShadow: active ? '0 0 0 4px rgba(99,102,241,.2)' : 'none',
      }}>
        {done ? <CheckCircle2 size={20} /> : <Icon size={18} />}
      </div>
      <span style={{ fontSize: 11, fontWeight: 600, color: active ? '#4f46e5' : done ? '#4f46e5' : '#94a3b8' }}>
        {label}
      </span>
    </div>
  );
}

export default function CreateEvent() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');

  const [step, setStep]           = useState(editId ? 2 : 1);
  const [submitting, setSubmitting] = useState(false);
  const [bankSaving, setBankSaving] = useState(false);
  const [bankError, setBankError]   = useState('');
  const [savedBank, setSavedBank]   = useState(null);
  const [isEditingBank, setIsEditingBank] = useState(false);
  const [categories, setCategories] = useState([]);
  const [venues, setVenues]         = useState([]);

  const [bank, setBank] = useState({
    payout_beneficiary_name: '',
    payout_bank_name: '',
    payout_account_number: '',
    payout_confirm_account: '',
    payout_ifsc: '',
    razorpay_account_id: '',
  });

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

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, vens] = await Promise.all([
          eventService.getCategories(),
          eventService.getVenues(),
        ]);
        setCategories(cats);
        setVenues(vens);
      } catch { /* ignore */ }

      try {
        const ps = await bookingService.getPayoutSettings();
        if (ps && (ps.payout_status === 'active' || ps.payout_bank_name)) {
          setSavedBank(ps);
          setBank(b => ({
            ...b,
            payout_beneficiary_name: ps.payout_beneficiary_name || '',
            payout_bank_name:        ps.payout_bank_name        || '',
            payout_ifsc:             ps.payout_ifsc             || '',
            razorpay_account_id:     ps.razorpay_account_id     || '',
          }));
        } else {
          setIsEditingBank(true);
        }
      } catch {
        setIsEditingBank(true);
      }

      if (editId) {
        try {
          const ev = await eventService.getEventById(editId);
          const start = ev.start_time ? new Date(ev.start_time) : null;
          setForm({
            title:        ev.title        || '',
            description:  ev.description  || '',
            category:     ev.category_id  || '',
            date:         start ? start.toISOString().split('T')[0] : '',
            startTime:    start ? start.toTimeString().slice(0, 5)  : '',
            location:     ev.venue_id     || '',
            price:        ev.price  != null ? String(ev.price)    : '',
            capacity:     ev.capacity != null ? String(ev.capacity) : '',
            banner_image: ev.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80',
          });
        } catch (err) {
          alert('Failed to load event: ' + err.message);
        }
      }
    }
    loadData();
  }, [editId]);

  const handleBankChange = e => {
    const { name, value } = e.target;
    setBank(b => ({ ...b, [name]: value }));
    setBankError('');
  };

  const handleBankSubmit = async e => {
    e.preventDefault();
    if (bank.payout_account_number !== bank.payout_confirm_account) {
      setBankError('Account numbers do not match.');
      return;
    }
    if (!bank.payout_ifsc.match(/^[A-Z]{4}0[A-Z0-9]{6}$/i)) {
      setBankError('Please enter a valid IFSC code (e.g. SBIN0001234).');
      return;
    }
    setBankSaving(true);
    try {
      const updated = await bookingService.updatePayoutSettings({
        payout_beneficiary_name: bank.payout_beneficiary_name,
        payout_bank_name:        bank.payout_bank_name,
        payout_account_number:   bank.payout_account_number,
        payout_ifsc:             bank.payout_ifsc.toUpperCase(),
        razorpay_account_id:     bank.razorpay_account_id || undefined,
      });
      setSavedBank({
        ...updated,
        payout_beneficiary_name: bank.payout_beneficiary_name,
        payout_bank_name: bank.payout_bank_name,
        payout_account_number_masked: '••••••••' + bank.payout_account_number.slice(-4),
        payout_ifsc: bank.payout_ifsc.toUpperCase(),
        payout_status: 'active'
      });
      setIsEditingBank(false);
      setStep(2);
    } catch (err) {
      setBankError('Failed to save bank details: ' + (err.message || 'Please try again.'));
    } finally {
      setBankSaving(false);
    }
  };

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const startDateTime =
        form.date && form.startTime
          ? new Date(`${form.date}T${form.startTime}:00`).toISOString()
          : new Date().toISOString();
      const endDate = new Date(startDateTime);
      endDate.setHours(endDate.getHours() + 3);

      const payload = {
        title:        form.title,
        description:  form.description,
        category_id:  form.category  || 'general',
        venue_id:     form.location  || 'tbd',
        start_time:   startDateTime,
        end_time:     endDate.toISOString(),
        banner_image: form.banner_image,
        price:        Number(form.price    || 0),
        capacity:     Number(form.capacity || 100),
        tags: [],
      };

      if (editId) {
        await eventService.updateEvent(editId, payload);
      } else {
        await eventService.createEvent(payload);
      }
      navigate('/admin/manage-events');
    } catch (err) {
      alert('Failed to save event: ' + (err.message || 'Unknown error'));
    } finally {
      setSubmitting(false);
    }
  };

  const cardStyle = {
    background: '#fff', border: '1px solid #e2e8f0',
    borderRadius: 16, padding: 32, boxShadow: '0 2px 12px rgba(0,0,0,.06)',
  };
  const inputStyle = {
    width: '100%', padding: '10px 14px', border: '1.5px solid #e2e8f0',
    borderRadius: 10, fontSize: 13, outline: 'none', background: '#f8fafc',
    boxSizing: 'border-box',
  };
  const labelStyle  = { display: 'block', fontSize: 12, fontWeight: 600, color: '#475569', marginBottom: 6 };
  const groupStyle  = { marginBottom: 18 };
  const primaryBtn  = {
    background: 'linear-gradient(135deg,#6366f1,#4f46e5)', color: '#fff',
    border: 'none', borderRadius: 10, padding: '12px 24px', fontWeight: 700,
    fontSize: 14, cursor: 'pointer', width: '100%', marginTop: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
  };
  const ghostBtn = {
    background: 'transparent', border: '1.5px solid #e2e8f0',
    borderRadius: 10, padding: '10px 20px', fontWeight: 600,
    fontSize: 13, cursor: 'pointer', color: '#64748b', width: '100%',
  };

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />

      <main className="dashboard-content" style={{ maxWidth: 860 }}>
        <div style={{ marginBottom: 24 }}>
          <h1 style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>
            {editId ? 'Edit Event' : 'Create New Event'}
          </h1>
          <p style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>
            {editId ? 'Update your event details below.' : 'Complete both steps to publish your event.'}
          </p>
        </div>

        {!editId && (
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: 32 }}>
            <StepBadge step={1} current={step} label="Bank Details" icon={CreditCard} />
            <div style={{
              flex: 1, height: 3, margin: '0 12px', marginBottom: 20,
              background: step > 1 ? '#4f46e5' : '#e2e8f0', borderRadius: 4, transition: 'background .4s',
            }} />
            <StepBadge step={2} current={step} label="Event Details" icon={Building2} />
          </div>
        )}

        {step === 1 && (
          <div style={cardStyle}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
              <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 12, padding: 10, display: 'flex' }}>
                <CreditCard size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>Payout / Bank Details</h2>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Your earnings will be transferred here after each event.</p>
              </div>
            </div>

            <div style={{ background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10, padding: '12px 16px', display: 'flex', gap: 10, marginBottom: 24 }}>
              <AlertCircle size={16} color="#3b82f6" style={{ flexShrink: 0, marginTop: 2 }} />
              <p style={{ margin: 0, fontSize: 12, color: '#1d4ed8', lineHeight: 1.6 }}>
                <strong>Why do we need this?</strong> EventHub collects ticket payments on your behalf and transfers your share — after platform commission + gateway fees — directly to your bank via Razorpay. Your details are stored securely.
              </p>
            </div>

            {savedBank && !isEditingBank ? (
              /* Cross-Check Card for Already Saved Details */
              <div style={{ background: '#f8fafc', border: '1.5px solid #e2e8f0', borderRadius: 14, padding: 24 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <CheckCircle2 size={18} color="#10b981" />
                    Cross-Check Your Saved Bank Details
                  </span>
                  <span style={{
                    fontSize: 11, fontWeight: 700, color: '#10b981', background: '#ecfdf5',
                    padding: '4px 12px', borderRadius: 20, border: '1px solid #a7f3d0'
                  }}>
                    Active &amp; Verified
                  </span>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, background: '#fff', padding: 18, borderRadius: 10, border: '1px solid #e2e8f0' }}>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 2 }}>Account Holder / Beneficiary</span>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>{savedBank.payout_beneficiary_name || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 2 }}>Bank Name</span>
                    <strong style={{ fontSize: 14, color: '#0f172a' }}>{savedBank.payout_bank_name || '—'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 2 }}>Account Number</span>
                    <strong style={{ fontSize: 14, color: '#0f172a', fontFamily: 'monospace' }}>{savedBank.payout_account_number_masked || '••••••••'}</strong>
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 2 }}>IFSC Code</span>
                    <strong style={{ fontSize: 14, color: '#0f172a', fontFamily: 'monospace' }}>{savedBank.payout_ifsc || '—'}</strong>
                  </div>
                  {savedBank.razorpay_account_id && (
                    <div style={{ gridColumn: '1 / -1' }}>
                      <span style={{ fontSize: 11, color: '#64748b', fontWeight: 600, display: 'block', marginBottom: 2 }}>Razorpay Account ID</span>
                      <strong style={{ fontSize: 13, color: '#475569', fontFamily: 'monospace' }}>{savedBank.razorpay_account_id}</strong>
                    </div>
                  )}
                </div>

                <div style={{ display: 'flex', gap: 12, marginTop: 22 }}>
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    style={{ ...primaryBtn, flex: 2, margin: 0 }}
                  >
                    <span>Confirmed, Continue to Event Details</span> <ChevronRight size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingBank(true)}
                    style={{ ...ghostBtn, flex: 1, margin: 0, color: '#4f46e5', borderColor: '#c7d2fe', background: '#eef2ff' }}
                  >
                    Edit / Update Bank
                  </button>
                </div>
              </div>
            ) : (
              /* Bank Edit / Input Form */
              <form onSubmit={handleBankSubmit} autoComplete="off">
                {savedBank && (
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: '#475569' }}>Editing Bank Details:</span>
                    <button
                      type="button"
                      onClick={() => setIsEditingBank(false)}
                      style={{ fontSize: 12, color: '#6366f1', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}
                    >
                      ← Keep current saved details
                    </button>
                  </div>
                )}

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0 16px' }}>

                  <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Account Holder / Beneficiary Name *</label>
                    <input id="payout_beneficiary_name" name="payout_beneficiary_name"
                      style={inputStyle} placeholder="As per bank records" required
                      value={bank.payout_beneficiary_name} onChange={handleBankChange} />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Bank Name *</label>
                    <input id="payout_bank_name" name="payout_bank_name"
                      style={inputStyle} placeholder="e.g. State Bank of India" required
                      value={bank.payout_bank_name} onChange={handleBankChange} />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>IFSC Code *</label>
                    <input id="payout_ifsc" name="payout_ifsc"
                      style={{ ...inputStyle, textTransform: 'uppercase', letterSpacing: 2 }}
                      placeholder="e.g. SBIN0001234" required maxLength={11}
                      value={bank.payout_ifsc} onChange={handleBankChange} />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Account Number *</label>
                    <input id="payout_account_number" name="payout_account_number"
                      type="password" style={inputStyle} placeholder="Enter account number"
                      required autoComplete="new-password"
                      value={bank.payout_account_number} onChange={handleBankChange} />
                  </div>

                  <div style={groupStyle}>
                    <label style={labelStyle}>Confirm Account Number *</label>
                    <input id="payout_confirm_account" name="payout_confirm_account"
                      type="text" autoComplete="off"
                      style={{
                        ...inputStyle,
                        borderColor: bank.payout_confirm_account && bank.payout_confirm_account !== bank.payout_account_number
                          ? '#ef4444' : '#e2e8f0',
                      }}
                      placeholder="Re-enter account number" required
                      value={bank.payout_confirm_account} onChange={handleBankChange} />
                    {bank.payout_confirm_account && bank.payout_confirm_account !== bank.payout_account_number && (
                      <span style={{ fontSize: 11, color: '#ef4444', display: 'block', marginTop: 4 }}>Account numbers do not match</span>
                    )}
                  </div>

                  <div style={{ ...groupStyle, gridColumn: '1 / -1' }}>
                    <label style={labelStyle}>Razorpay Account ID <span style={{ fontWeight: 400, color: '#94a3b8' }}>(optional)</span></label>
                    <input id="razorpay_account_id" name="razorpay_account_id"
                      style={inputStyle} placeholder="acc_XXXXXXXXXXXXXXXXXX"
                      value={bank.razorpay_account_id} onChange={handleBankChange} />
                  </div>

                </div>

                {bankError && (
                  <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '10px 14px', marginBottom: 12, display: 'flex', gap: 8, alignItems: 'center' }}>
                    <AlertCircle size={15} color="#ef4444" />
                    <span style={{ fontSize: 12, color: '#dc2626' }}>{bankError}</span>
                  </div>
                )}

                <button type="submit" style={primaryBtn} disabled={bankSaving}>
                  {bankSaving ? 'Saving…' : <><span>Save &amp; Continue</span> <ChevronRight size={16} /></>}
                </button>
              </form>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} style={cardStyle}>
            {/* Cross-Check Payout Account banner in Step 2 */}
            {(savedBank || bank.payout_bank_name) && (
              <div style={{
                background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: 12,
                padding: '12px 18px', display: 'flex', justifyContent: 'space-between',
                alignItems: 'center', marginBottom: 20
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 34, height: 34, borderRadius: 8, background: '#ede9fe', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CreditCard size={18} color="#7c3aed" />
                  </div>
                  <div>
                    <span style={{ fontSize: 11, color: '#64748b', display: 'block' }}>Linked Bank for Ticket Payouts</span>
                    <span style={{ fontSize: 13, fontWeight: 700, color: '#1e293b' }}>
                      {savedBank?.payout_bank_name || bank.payout_bank_name} • {savedBank?.payout_account_number_masked || (bank.payout_account_number ? '••••' + bank.payout_account_number.slice(-4) : 'Active')} ({savedBank?.payout_beneficiary_name || bank.payout_beneficiary_name})
                    </span>
                  </div>
                </div>
                {!editId && (
                  <button
                    type="button"
                    onClick={() => { setIsEditingBank(false); setStep(1); }}
                    style={{ fontSize: 12, fontWeight: 600, color: '#6366f1', background: '#f5f3ff', border: '1px solid #ddd6fe', padding: '6px 14px', borderRadius: 8, cursor: 'pointer' }}
                  >
                    Cross-Check / Edit
                  </button>
                )}
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
              <div style={{ background: 'linear-gradient(135deg,#6366f1,#4f46e5)', borderRadius: 12, padding: 10, display: 'flex' }}>
                <Building2 size={22} color="#fff" />
              </div>
              <div>
                <h2 style={{ margin: 0, fontSize: 17, fontWeight: 700, color: '#1e293b' }}>
                  {editId ? 'Edit Event Details' : 'Event Details'}
                </h2>
                <p style={{ margin: 0, fontSize: 12, color: '#64748b' }}>Fill in your event information below.</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

              <div className="lg:col-span-2" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>

                <div style={groupStyle}>
                  <label style={labelStyle}>Event Title *</label>
                  <input type="text" name="title" placeholder="Enter event title"
                    style={inputStyle} required value={form.title} onChange={handleChange} />
                </div>

                <div style={groupStyle}>
                  <label style={labelStyle}>Description *</label>
                  <textarea name="description" placeholder="Enter event description" rows={4}
                    style={{ ...inputStyle, resize: 'vertical' }} required
                    value={form.description} onChange={handleChange} />
                </div>

                <div style={groupStyle}>
                  <label style={labelStyle}>Category *</label>
                  <select name="category" style={inputStyle} required value={form.category} onChange={handleChange}>
                    <option value="">Select category</option>
                    {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Event Date *</label>
                    <input type="date" name="date" style={inputStyle} required value={form.date} onChange={handleChange} />
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Start Time *</label>
                    <input type="time" name="startTime" style={inputStyle} required value={form.startTime} onChange={handleChange} />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Venue *</label>
                    <select name="location" style={inputStyle} required value={form.location} onChange={handleChange}>
                      <option value="">Select venue</option>
                      {venues.map(v => <option key={v.id} value={v.id}>{v.name} — {v.city}</option>)}
                    </select>
                  </div>
                  <div style={groupStyle}>
                    <label style={labelStyle}>Price (₹) *</label>
                    <input type="number" name="price" placeholder="Enter price"
                      style={inputStyle} required value={form.price} onChange={handleChange} />
                  </div>
                </div>

                <div style={groupStyle}>
                  <label style={labelStyle}>Capacity *</label>
                  <input type="number" name="capacity" placeholder="Enter capacity"
                    style={inputStyle} required value={form.capacity} onChange={handleChange} />
                </div>

              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                <label style={labelStyle}>Event Image</label>

                <div
                  style={{
                    border: '2px dashed #c7d2fe', borderRadius: 12, minHeight: 180,
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    justifyContent: 'center', cursor: 'pointer', overflow: 'hidden',
                    background: '#f8fafc', padding: 8,
                  }}
                  onClick={() => document.getElementById('event-image-file')?.click()}
                >
                  {form.banner_image ? (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                      <img src={form.banner_image} alt="Banner"
                        style={{ maxHeight: 140, width: '100%', objectFit: 'cover', borderRadius: 8 }} />
                      <span style={{ fontSize: 11, color: '#6366f1', fontWeight: 600 }}>Click to change</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={28} color="#94a3b8" />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#475569', marginTop: 8 }}>Upload event image</span>
                      <span style={{ fontSize: 11, color: '#94a3b8' }}>JPG, PNG (Max 5MB)</span>
                    </>
                  )}
                  <input id="event-image-file" type="file" accept="image/*" style={{ display: 'none' }}
                    onChange={e => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      if (file.size > 5 * 1024 * 1024) { alert('Image exceeds 5MB.'); return; }
                      const reader = new FileReader();
                      reader.onload = ev => setForm(f => ({ ...f, banner_image: ev.target?.result }));
                      reader.readAsDataURL(file);
                    }} />
                </div>

                <div style={groupStyle}>
                  <label style={{ ...labelStyle, color: '#94a3b8' }}>Or paste image URL</label>
                  <input type="url" placeholder="https://example.com/banner.jpg" style={inputStyle}
                    value={form.banner_image.startsWith('data:') ? '' : form.banner_image}
                    onChange={e => setForm(f => ({ ...f, banner_image: e.target.value }))} />
                </div>

                {!editId && (
                  <button type="button" style={ghostBtn} onClick={() => setStep(1)}>
                    ← Back to Bank Details
                  </button>
                )}

                <button type="submit" style={primaryBtn} disabled={submitting}>
                  {submitting ? (editId ? 'Updating…' : 'Creating…') : (editId ? 'Update Event' : 'Create Event')}
                </button>
              </div>

            </div>
          </form>
        )}

      </main>
    </div>
  );
}
