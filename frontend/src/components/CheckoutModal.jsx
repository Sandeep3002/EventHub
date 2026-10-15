import React, { useState } from 'react';
import {
  X, CheckCircle2, Shield, QrCode, CreditCard, Smartphone, ArrowRight, ArrowLeft,
  Lock, Wallet, User, Calendar, MapPin, Ticket, Info, Building2, Eye, EyeOff
} from 'lucide-react';
import { bookingService } from '../services/bookingService';

export default function CheckoutModal({ checkoutData, onClose, onBookAnother }) {
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [step, setStep] = useState('details');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingConfirmed, setBookingConfirmed] = useState(null);
  const [payError, setPayError] = useState('');

  const [cardName, setCardName] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [showCvv, setShowCvv] = useState(false);
  const [upiId, setUpiId] = useState('');

  if (!checkoutData) return null;
  const { event, ticketType, quantity, totalPrice, attendee } = checkoutData;

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + ' / ' + digits.slice(2);
    return digits;
  };

  const formatEventDate = (dateStr) => {
    if (!dateStr) return 'Sat, 16 Aug 2025';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'Sat, 16 Aug 2025';
      return d.toLocaleDateString('en-US', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
        year: 'numeric'
      });
    } catch {
      return 'Sat, 16 Aug 2025';
    }
  };

  const getMaskedPayment = () => {
    if (paymentMethod === 'credit_card') {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '3456';
      return `**** **** **** ${last4}`;
    }
    if (paymentMethod === 'upi') return upiId || 'UPI App';
    if (paymentMethod === 'netbanking') return 'Net Banking';
    return '';
  };

  const handleFinalPay = async () => {
    setIsSubmitting(true);
    setPayError('');
    try {
      const booking = await bookingService.bookTicket(
        event.id || event._id,
        '',
        quantity || 1,
        {
          name: attendee?.full_name || attendee?.name || 'Attendee',
          phone: attendee?.phone || '',
          email: attendee?.email || '',
          age: attendee?.age || null,
          totalPrice: totalPrice,
          paymentMethod: paymentMethod,
        }
      );

      setBookingConfirmed({
        qr_code_token: booking.qr_code_token || ('EVTHUB-' + Date.now().toString(36).toUpperCase()),
        registration_id: booking.id || booking._id,
      });
      setStep('success');
      try {
        const confetti = (await import('canvas-confetti')).default;
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#8B5CF6', '#D946EF', '#EC4899', '#38BDF8', '#10B981']
        });
      } catch {}
    } catch (err) {
      setPayError('Payment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const venueDisplay = event?.venue_name || event?.venue || event?.location || 'AMS College Auditorium';
  const passDisplay = ticketType
    ? `${ticketType.charAt(0).toUpperCase() + ticketType.slice(1)} Pass`
    : 'General Pass';

  return (
    <div className="modal-overlay">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-[620px] max-h-[94vh] flex flex-col relative overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">

        {/* ───── STEP 1: Payment Details ───── */}
        {step === 'details' && (
          <>
            {/* Header: Exact Violet-Pink-Magenta Gradient as Reference */}
            <div
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)' }}
              className="px-6 sm:px-8 py-5 relative text-white shrink-0"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
                title="Close"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-1.5 tracking-tight">
                    <span>Secure Checkout</span>
                    <Lock className="w-4 h-4 text-white/90" />
                  </h3>
                  <p className="text-xs text-white/85 mt-0.5 font-normal">
                    Complete your registration for {event?.title || 'Event'}
                  </p>
                </div>
              </div>

              {/* Step indicator: 1 Payment -- 2 Confirm -- 3 Done */}
              <div className="flex items-center gap-2 mt-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-700 text-xs font-bold flex items-center justify-center shadow-xs">
                    1
                  </div>
                  <span className="text-xs text-white font-bold">Payment</span>
                </div>
                <div className="flex-1 h-px bg-white/30 max-w-[120px]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white text-xs font-semibold flex items-center justify-center">
                    2
                  </div>
                  <span className="text-xs text-white/80 font-medium">Confirm</span>
                </div>
                <div className="flex-1 h-px bg-white/30 max-w-[120px]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white text-xs font-semibold flex items-center justify-center">
                    3
                  </div>
                  <span className="text-xs text-white/80 font-medium">Done</span>
                </div>
              </div>
            </div>

            {/* Scrollable Body matching reference image */}
            <div className="p-6 space-y-4 overflow-y-auto flex-1">

              {/* 1. Event Hero Thumbnail Card */}
              <div className="flex items-center gap-4 bg-white">
                <div className="w-28 sm:w-32 h-20 rounded-xl overflow-hidden shrink-0 border border-slate-100 shadow-2xs">
                  <img
                    src={event?.banner_image || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=600&q=80'}
                    alt={event?.title}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="space-y-1 min-w-0">
                  <h4 className="text-base sm:text-lg font-bold text-slate-900 leading-tight truncate">
                    {event?.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{formatEventDate(event?.start_time)}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium truncate">
                    <MapPin className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span className="truncate">{venueDisplay}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600 font-medium">
                    <Ticket className="w-3.5 h-3.5 text-blue-600 shrink-0" />
                    <span>{passDisplay}</span>
                  </div>
                </div>
              </div>

              {/* 2. Attendee Details Card with Edit button */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <User className="w-4 h-4 text-blue-600" />
                    <span>Attendee Details</span>
                  </div>
                  {onBookAnother && (
                    <button
                      type="button"
                      onClick={onBookAnother}
                      className="px-3 py-0.5 rounded-lg border border-slate-200 text-xs font-semibold text-blue-600 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Edit
                    </button>
                  )}
                </div>

                <div className="bg-slate-50/90 border border-slate-200/80 rounded-xl p-3 flex items-center justify-between text-xs divide-x divide-slate-200 shadow-2xs">
                  <div className="pr-3 min-w-0 flex-1">
                    <div className="text-[10px] text-slate-400 font-medium">Name</div>
                    <div className="font-bold text-slate-900 truncate mt-0.5">
                      {attendee?.full_name || attendee?.name || 'Attendee'}
                    </div>
                  </div>
                  <div className="px-3 min-w-0 flex-1">
                    <div className="text-[10px] text-slate-400 font-medium">Phone</div>
                    <div className="font-bold text-slate-900 truncate mt-0.5">
                      {attendee?.phone || '—'}
                    </div>
                  </div>
                  <div className="px-3 min-w-0 flex-1.5">
                    <div className="text-[10px] text-slate-400 font-medium">Email</div>
                    <div className="font-bold text-slate-900 truncate mt-0.5">
                      {attendee?.email || '—'}
                    </div>
                  </div>
                  <div className="px-3 text-center min-w-[70px]">
                    <div className="text-[10px] text-slate-400 font-medium">Pass Type</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {ticketType ? (ticketType.charAt(0).toUpperCase() + ticketType.slice(1)) : 'General'}
                    </div>
                  </div>
                  <div className="pl-3 text-center min-w-[50px]">
                    <div className="text-[10px] text-slate-400 font-medium">Quantity</div>
                    <div className="font-bold text-slate-900 mt-0.5">{quantity || 1}</div>
                  </div>
                </div>
              </div>

              {/* 3. Total Amount Card */}
              <div className="bg-slate-50/90 border border-slate-200/80 rounded-2xl p-4 flex items-center justify-between shadow-2xs">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-600 flex items-center justify-center shrink-0">
                    <CreditCard className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-slate-500">Total Amount</div>
                    <div className="text-2xl font-black text-purple-600 tracking-tight">
                      &#8377;{Number(totalPrice || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-1.5 text-right max-w-[200px]">
                  <Info className="w-4 h-4 text-blue-500 shrink-0 mt-0.5" />
                  <div className="text-[11px] text-slate-500 leading-tight">
                    <div>Includes all applicable charges</div>
                    <div className="text-slate-400 mt-0.5">Secure and encrypted payment</div>
                  </div>
                </div>
              </div>

              {/* 4. Payment Method Header & Selector */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
                    <CreditCard className="w-4 h-4 text-blue-600" />
                    <span>Payment Method</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] text-slate-500 font-medium">
                    <Lock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Your payment information is secure</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  {/* Card Option */}
                  <div
                    onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer relative ${
                      paymentMethod === 'credit_card'
                        ? 'border-2 border-purple-600 bg-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'credit_card' && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 fill-purple-600 text-white" />
                      </div>
                    )}
                    <CreditCard className={`w-5 h-5 mb-1.5 ${paymentMethod === 'credit_card' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div className="text-xs font-bold text-slate-900">Card</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Debit or Credit Card</div>
                  </div>

                  {/* UPI Option */}
                  <div
                    onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer relative ${
                      paymentMethod === 'upi'
                        ? 'border-2 border-purple-600 bg-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'upi' && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 fill-purple-600 text-white" />
                      </div>
                    )}
                    <div className="w-5 h-5 mb-1.5 flex items-center justify-center">
                      <Smartphone className={`w-5 h-5 ${paymentMethod === 'upi' ? 'text-purple-600' : 'text-emerald-500'}`} />
                    </div>
                    <div className="text-xs font-bold text-slate-900">UPI</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Pay using any UPI app</div>
                  </div>

                  {/* Net Banking Option */}
                  <div
                    onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-2xl text-left transition-all cursor-pointer relative ${
                      paymentMethod === 'netbanking'
                        ? 'border-2 border-purple-600 bg-white shadow-xs'
                        : 'border border-slate-200 bg-white hover:border-slate-300'
                    }`}
                  >
                    {paymentMethod === 'netbanking' && (
                      <div className="absolute top-2.5 right-2.5">
                        <CheckCircle2 className="w-4 h-4 text-purple-600 fill-purple-600 text-white" />
                      </div>
                    )}
                    <Building2 className={`w-5 h-5 mb-1.5 ${paymentMethod === 'netbanking' ? 'text-purple-600' : 'text-blue-600'}`} />
                    <div className="text-xs font-bold text-slate-900">Net Banking</div>
                    <div className="text-[10px] text-slate-400 mt-0.5">All major banks</div>
                  </div>
                </div>
              </div>

              {/* 5. Payment Details Form */}
              <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-3.5 pt-1">
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-3">
                    {/* Cardholder Name */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Cardholder Name
                      </label>
                      <div className="relative">
                        <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={cardName}
                          onChange={e => setCardName(e.target.value)}
                          placeholder="Name on card"
                          required
                          className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition bg-white"
                        />
                      </div>
                    </div>

                    {/* Card Number with Card Logos */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={e => setCardNumber(formatCardNumber(e.target.value))}
                          placeholder="1234 5678 9012 3456"
                          required
                          maxLength={19}
                          className="w-full pl-10 pr-28 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono tracking-wider outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition bg-white"
                        />
                        {/* Card brand icons: VISA, Mastercard, RuPay */}
                        <div className="absolute right-3 top-2.5 flex items-center gap-1.5 pointer-events-none">
                          <span className="text-[10px] font-black text-blue-700 tracking-tighter italic">VISA</span>
                          <div className="flex -space-x-1">
                            <div className="w-3.5 h-3.5 rounded-full bg-red-500 opacity-90" />
                            <div className="w-3.5 h-3.5 rounded-full bg-amber-400 opacity-90" />
                          </div>
                          <span className="text-[10px] font-bold text-orange-600">RuPay</span>
                        </div>
                      </div>
                    </div>

                    {/* Expiry Date & CVV */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          Expiry Date
                        </label>
                        <div className="relative">
                          <Calendar className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type="text"
                            value={cardExpiry}
                            onChange={e => setCardExpiry(formatExpiry(e.target.value))}
                            placeholder="MM / YY"
                            required
                            maxLength={7}
                            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition bg-white"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-700 mb-1">
                          CVV
                        </label>
                        <div className="relative">
                          <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                          <input
                            type={showCvv ? 'text' : 'password'}
                            value={cardCvv}
                            onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                            placeholder="123"
                            required
                            maxLength={4}
                            className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 text-xs sm:text-sm font-mono outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-100 transition bg-white"
                          />
                          <button
                            type="button"
                            onClick={() => setShowCvv(!showCvv)}
                            className="absolute right-3.5 top-3 text-slate-400 hover:text-slate-600"
                          >
                            {showCvv ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700">UPI ID / VPA</label>
                    <div className="relative">
                      <Smartphone className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                      <input
                        type="text"
                        value={upiId}
                        onChange={e => setUpiId(e.target.value)}
                        placeholder="yourname@okhdfcbank or 9876543210@paytm"
                        required
                        className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-200 text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition bg-white"
                      />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Supports Google Pay, PhonePe, Paytm, BHIM and all major UPI handles
                    </p>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div className="space-y-2 bg-slate-50/80 p-4 rounded-2xl border border-slate-200">
                    <label className="block text-xs font-semibold text-slate-700">Select Bank</label>
                    <select
                      required
                      className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl text-sm focus:border-purple-600 focus:ring-2 focus:ring-purple-100 outline-none transition bg-white text-slate-800"
                    >
                      <option value="">Choose your bank</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                      <option>Bank of Baroda</option>
                    </select>
                    <p className="text-[11px] text-slate-500">
                      You will be securely redirected to your bank portal for authentication
                    </p>
                  </div>
                )}

                {/* Submit Button with matching pink-purple gradient */}
                <button
                  type="submit"
                  style={{ background: 'linear-gradient(90deg, #9333EA 0%, #D946EF 50%, #EC4899 100%)' }}
                  className="w-full py-3.5 px-4 text-sm font-bold rounded-2xl text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer mt-1"
                >
                  <Lock className="w-4 h-4 text-white/90" />
                  <span>Review &amp; Confirm Payment</span>
                  <ArrowRight className="w-4 h-4 text-white" />
                </button>

                {/* Footer Security Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1 pb-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>256-bit SSL encrypted &bull; Secure payment powered by Razorpay</span>
                </div>
              </form>

            </div>
          </>
        )}

        {/* ───── STEP 2: Review & Confirm ───── */}
        {step === 'confirm' && (
          <>
            <div
              style={{ background: 'linear-gradient(135deg, #6366F1 0%, #A855F7 50%, #EC4899 100%)' }}
              className="px-6 sm:px-8 py-5 relative text-white shrink-0"
            >
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-white/20 border border-white/30 flex items-center justify-center backdrop-blur-md">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white tracking-tight">Confirm Payment</h3>
                  <p className="text-xs text-white/85 mt-0.5">Please review before completing payment</p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4 pt-1">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-emerald-400 text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-xs text-white/80 font-medium">Payment</span>
                </div>
                <div className="flex-1 h-px bg-white/30 max-w-[120px]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-700 text-xs font-bold flex items-center justify-center shadow-xs">
                    2
                  </div>
                  <span className="text-xs text-white font-bold">Confirm</span>
                </div>
                <div className="flex-1 h-px bg-white/30 max-w-[120px]" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/25 text-white text-xs font-semibold flex items-center justify-center">
                    3
                  </div>
                  <span className="text-xs text-white/80 font-medium">Done</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Attendee Review Card */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="text-[11px] font-bold text-purple-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-600" />
                  <span>Attendee Details</span>
                </div>
                <div className="grid grid-cols-2 gap-y-1.5 gap-x-4">
                  <div className="text-slate-500">Full Name</div>
                  <div className="font-bold text-slate-900 text-right">{attendee?.full_name || attendee?.name || 'Attendee'}</div>
                  <div className="text-slate-500">Email</div>
                  <div className="font-bold text-slate-900 text-right truncate">{attendee?.email || '—'}</div>
                  <div className="text-slate-500">Phone</div>
                  <div className="font-bold text-slate-900 text-right">{attendee?.phone || '—'}</div>
                </div>
              </div>

              {/* Order Summary Card */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Order Summary</div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Event</span>
                  <span className="font-bold text-slate-900 truncate max-w-[220px]">{event?.title}</span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Pass Type</span>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-800 font-bold text-[10px] uppercase">
                    {passDisplay}
                  </span>
                </div>
                <div className="flex justify-between items-center text-slate-600">
                  <span>Quantity</span>
                  <span className="font-semibold text-slate-900">{quantity || 1} Pass(es)</span>
                </div>
              </div>

              {/* Payment Method Card */}
              <div className="bg-slate-50/90 rounded-2xl p-4 border border-slate-200 text-xs flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Payment Method</div>
                  <div className="flex items-center gap-2 text-slate-900 font-bold text-sm mt-0.5">
                    <CreditCard className="w-4 h-4 text-purple-600" />
                    <span>{getMaskedPayment()}</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setStep('details')}
                  className="text-xs font-semibold text-purple-600 hover:text-purple-800 hover:underline cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Total Payable Card */}
              <div className="rounded-2xl p-4 flex justify-between items-center border border-purple-200 bg-purple-50/60">
                <span className="text-sm font-bold text-slate-900">Total Payable Amount</span>
                <span className="text-2xl font-black text-purple-700">&#8377;{Number(totalPrice || 0).toFixed(2)}</span>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-xs text-red-700 font-medium">
                  {payError}
                </div>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setStep('details'); setPayError(''); }}
                  className="py-3 px-4 text-sm font-bold rounded-2xl border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button
                  type="button"
                  onClick={handleFinalPay}
                  disabled={isSubmitting}
                  style={{ background: 'linear-gradient(90deg, #9333EA 0%, #D946EF 50%, #EC4899 100%)' }}
                  className="flex-1 py-3 px-4 text-sm font-bold rounded-2xl text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Authorizing...
                    </span>
                  ) : `Pay ₹${Number(totalPrice || 0).toFixed(2)}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ───── STEP 3: Success ───── */}
        {step === 'success' && bookingConfirmed && (
          <>
            <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-7 py-6 relative text-white shrink-0">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 w-7 h-7 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white tracking-tight">Booking Confirmed!</h3>
                  <p className="text-xs text-emerald-100 mt-0.5">Your digital entry pass has been issued</p>
                </div>
              </div>

              {/* Step indicator */}
              <div className="flex items-center gap-2 mt-4 pt-1">
                {['Payment', 'Confirm', 'Done'].map((label, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="flex-1 h-px bg-white/30 max-w-[120px]" />}
                    <div className="flex items-center gap-1.5">
                      <div className="w-6 h-6 rounded-full bg-white text-emerald-700 text-xs font-bold flex items-center justify-center">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-xs text-white font-semibold">{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-4 overflow-y-auto flex-1">
              {/* Ticket Pass Card */}
              <div
                style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)' }}
                className="relative rounded-2xl overflow-hidden p-5 text-white shadow-xl space-y-4"
              >
                <div className="flex justify-between items-start gap-3">
                  <div>
                    <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Digital Entry Pass</div>
                    <div className="text-lg font-extrabold text-white mt-1 line-clamp-1">{event?.title}</div>
                  </div>
                  <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-md">
                    <QrCode className="w-11 h-11 text-slate-900" />
                  </div>
                </div>

                <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-y-2.5 gap-x-4 text-xs">
                  <div>
                    <div className="text-purple-300 text-[10px] font-semibold uppercase">Pass Code</div>
                    <div className="font-mono text-white font-bold tracking-wider">{bookingConfirmed.qr_code_token}</div>
                  </div>
                  <div>
                    <div className="text-purple-300 text-[10px] font-semibold uppercase">Pass Type</div>
                    <div className="font-bold text-white uppercase">{passDisplay} ({quantity || 1})</div>
                  </div>
                  {attendee && (
                    <>
                      <div>
                        <div className="text-purple-300 text-[10px] font-semibold uppercase">Attendee</div>
                        <div className="font-bold text-white truncate">{attendee?.full_name || attendee?.name}</div>
                      </div>
                      <div>
                        <div className="text-purple-300 text-[10px] font-semibold uppercase">Email</div>
                        <div className="font-bold text-white truncate">{attendee?.email}</div>
                      </div>
                    </>
                  )}
                  <div>
                    <div className="text-purple-300 text-[10px] font-semibold uppercase">Amount Paid</div>
                    <div className="text-emerald-400 font-black text-base">&#8377;{Number(totalPrice || 0).toFixed(2)}</div>
                  </div>
                  <div>
                    <div className="text-purple-300 text-[10px] font-semibold uppercase">Status</div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[11px] font-bold">
                      <CheckCircle2 className="w-3.5 h-3.5" /> CONFIRMED
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 text-center">
                A booking receipt and digital pass have been sent to your email.
              </p>

              <div className="flex gap-3">
                {onBookAnother && (
                  <button
                    onClick={onBookAnother}
                    className="flex-1 py-3 px-4 text-sm font-bold rounded-2xl border border-purple-200 text-purple-700 bg-purple-50/60 hover:bg-purple-100 transition cursor-pointer"
                  >
                    Book for Friend
                  </button>
                )}
                <button
                  onClick={onClose}
                  style={{ background: 'linear-gradient(90deg, #9333EA 0%, #D946EF 50%, #EC4899 100%)' }}
                  className={`${onBookAnother ? 'flex-1' : 'w-full'} py-3 px-4 text-sm font-bold rounded-2xl text-white shadow-md shadow-pink-500/20 hover:opacity-95 transition cursor-pointer`}
                >
                  Done
                </button>
              </div>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
