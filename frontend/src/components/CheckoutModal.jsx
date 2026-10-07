import React, { useState } from 'react';
import { X, CheckCircle2, ShieldCheck, QrCode, CreditCard, Smartphone, ArrowRight, ArrowLeft, Lock, Wallet, Banknote } from 'lucide-react';
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
  const [upiId, setUpiId] = useState('');

  if (!checkoutData) return null;
  const { event, ticketType, quantity, totalPrice, attendee } = checkoutData;

  const formatCardNumber = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(\d{4})(?=\d)/g, '$1 ');
  };

  const formatExpiry = (val) => {
    const digits = val.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  const getMaskedPayment = () => {
    if (paymentMethod === 'credit_card') {
      const last4 = cardNumber.replace(/\s/g, '').slice(-4) || '****';
      return `**** **** **** ${last4}`;
    }
    if (paymentMethod === 'upi') return upiId;
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
        quantity,
        {
          name: attendee?.name || '',
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
        confetti({ particleCount: 120, spread: 80, origin: { y: 0.6 }, colors: ['#7C3AED', '#EC4899', '#F59E0B', '#10B981'] });
      } catch {}
    } catch (err) {
      setPayError('Payment failed: ' + (err.message || 'Unknown error'));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content max-w-lg p-0 relative overflow-hidden" style={{ borderRadius: '20px' }}>

        {/* ───── STEP 1: Payment Details ───── */}
        {step === 'details' && (
          <>
            {/* Header */}
            <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }} className="px-6 py-5 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <ShieldCheck className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Secure Checkout</h3>
                  <p className="text-xs text-white/70 mt-0.5">{event.title}</p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-600 text-[10px] font-bold flex items-center justify-center">1</div>
                  <span className="text-[11px] text-white font-semibold">Payment</span>
                </div>
                <div className="flex-1 h-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 text-white/60 text-[10px] font-bold flex items-center justify-center">2</div>
                  <span className="text-[11px] text-white/50">Confirm</span>
                </div>
                <div className="flex-1 h-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 text-white/60 text-[10px] font-bold flex items-center justify-center">3</div>
                  <span className="text-[11px] text-white/50">Done</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Attendee + Order Summary */}
              <div className="rounded-xl overflow-hidden border border-purple-100">
                {attendee && (
                  <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 space-y-2">
                    <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wide flex items-center gap-1.5">
                      <div className="w-4 h-4 rounded bg-purple-600 text-white flex items-center justify-center text-[8px] font-bold">{attendee.full_name?.charAt(0)}</div>
                      Attendee
                    </div>
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-4 text-xs">
                      <div className="text-slate-500">Name</div>
                      <div className="font-semibold text-slate-900 text-right">{attendee.full_name}</div>
                      <div className="text-slate-500">Phone</div>
                      <div className="font-semibold text-slate-900 text-right">{attendee.phone}</div>
                      <div className="text-slate-500">Email</div>
                      <div className="font-semibold text-slate-900 text-right truncate">{attendee.email}</div>
                    </div>
                  </div>
                )}
                <div className="bg-white p-4 space-y-2">
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Pass Type</span>
                    <span className="font-bold text-purple-600 uppercase">{ticketType}</span>
                  </div>
                  <div className="flex justify-between text-xs text-slate-500">
                    <span>Quantity</span>
                    <span className="font-bold text-slate-800">{quantity} Pass(es)</span>
                  </div>
                  <div className="border-t border-purple-100 pt-2 flex justify-between items-center">
                    <span className="text-sm font-bold text-slate-900">Total Amount</span>
                    <span className="text-xl font-extrabold" style={{ color: '#7C3AED' }}>&#8377;{totalPrice}</span>
                  </div>
                </div>
              </div>

              {/* Payment Methods */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-3">Payment Method</label>
                <div className="grid grid-cols-3 gap-2">
                  <button type="button" onClick={() => setPaymentMethod('credit_card')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'credit_card' ? 'border-purple-500 bg-purple-50 shadow-sm shadow-purple-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <CreditCard className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'credit_card' ? 'text-purple-600' : 'text-slate-400'}`} />
                    <div className={`text-[11px] font-bold ${paymentMethod === 'credit_card' ? 'text-purple-700' : 'text-slate-500'}`}>Card</div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('upi')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'upi' ? 'border-pink-500 bg-pink-50 shadow-sm shadow-pink-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <Smartphone className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'upi' ? 'text-pink-600' : 'text-slate-400'}`} />
                    <div className={`text-[11px] font-bold ${paymentMethod === 'upi' ? 'text-pink-700' : 'text-slate-500'}`}>UPI</div>
                  </button>
                  <button type="button" onClick={() => setPaymentMethod('netbanking')}
                    className={`p-3 rounded-xl border-2 text-center transition-all ${paymentMethod === 'netbanking' ? 'border-indigo-500 bg-indigo-50 shadow-sm shadow-indigo-200' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
                    <Banknote className={`w-5 h-5 mx-auto mb-1 ${paymentMethod === 'netbanking' ? 'text-indigo-600' : 'text-slate-400'}`} />
                    <div className={`text-[11px] font-bold ${paymentMethod === 'netbanking' ? 'text-indigo-700' : 'text-slate-500'}`}>Net Banking</div>
                  </button>
                </div>
              </div>

              {/* Payment Form */}
              <form onSubmit={(e) => { e.preventDefault(); setStep('confirm'); }} className="space-y-4">
                {paymentMethod === 'credit_card' && (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Cardholder Name</label>
                      <input type="text" value={cardName} onChange={e => setCardName(e.target.value)} placeholder="Name on card"
                        required className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition" />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-600 mb-1.5">Card Number</label>
                      <div className="relative">
                        <input type="text" value={cardNumber} onChange={e => setCardNumber(formatCardNumber(e.target.value))} placeholder="1234 5678 9012 3456"
                          required className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-sm font-mono tracking-wider focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition" maxLength={19} />
                        <CreditCard className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">Expiry</label>
                        <input type="text" value={cardExpiry} onChange={e => setCardExpiry(formatExpiry(e.target.value))} placeholder="MM/YY"
                          required className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition" maxLength={5} />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-600 mb-1.5">CVV</label>
                        <div className="relative">
                          <input type="password" value={cardCvv} onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))} placeholder="***"
                            required className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm font-mono focus:border-purple-500 focus:ring-2 focus:ring-purple-100 outline-none transition" maxLength={4} />
                          <Lock className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">UPI ID</label>
                    <div className="relative">
                      <input type="text" value={upiId} onChange={e => setUpiId(e.target.value)} placeholder="yourname@paytm / yourname@upi"
                        required className="w-full px-4 py-3 pr-12 border-2 border-slate-200 rounded-xl text-sm focus:border-pink-500 focus:ring-2 focus:ring-pink-100 outline-none transition" />
                      <Smartphone className="absolute right-4 top-3.5 w-4 h-4 text-slate-400" />
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1.5">Supports Google Pay, PhonePe, Paytm, BHIM UPI</p>
                  </div>
                )}

                {paymentMethod === 'netbanking' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5">Select Bank</label>
                    <select required className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl text-sm focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 outline-none transition bg-white text-slate-700">
                      <option value="">Choose your bank</option>
                      <option>State Bank of India</option>
                      <option>HDFC Bank</option>
                      <option>ICICI Bank</option>
                      <option>Axis Bank</option>
                      <option>Kotak Mahindra Bank</option>
                      <option>Punjab National Bank</option>
                      <option>Bank of Baroda</option>
                    </select>
                    <p className="text-[10px] text-slate-400 mt-1.5">You will be redirected to your bank's secure page</p>
                  </div>
                )}

                <button type="submit"
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}
                  className="w-full py-3.5 text-sm font-bold rounded-xl text-white flex items-center justify-center gap-2 hover:opacity-90 transition shadow-lg shadow-purple-300/30">
                  <span>Review & Confirm</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400">
                  <Lock className="w-3 h-3" />
                  <span>256-bit SSL encrypted &bull; Secure payment</span>
                </div>
              </form>
            </div>
          </>
        )}

        {/* ───── STEP 2: Review & Confirm ───── */}
        {step === 'confirm' && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }} className="px-6 py-5 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                  <Wallet className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Confirm Payment</h3>
                  <p className="text-xs text-white/70 mt-0.5">Review all details before paying</p>
                </div>
              </div>

              {/* Step indicators */}
              <div className="flex items-center gap-2 mt-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/30 text-white text-[10px] font-bold flex items-center justify-center">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                  </div>
                  <span className="text-[11px] text-white/60">Payment</span>
                </div>
                <div className="flex-1 h-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white text-purple-600 text-[10px] font-bold flex items-center justify-center">2</div>
                  <span className="text-[11px] text-white font-semibold">Confirm</span>
                </div>
                <div className="flex-1 h-px bg-white/30" />
                <div className="flex items-center gap-1.5">
                  <div className="w-6 h-6 rounded-full bg-white/20 text-white/60 text-[10px] font-bold flex items-center justify-center">3</div>
                  <span className="text-[11px] text-white/50">Done</span>
                </div>
              </div>
            </div>

            <div className="p-6 space-y-4">
              {attendee && (
                <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-4 space-y-2">
                  <div className="text-[11px] font-bold text-purple-600 uppercase tracking-wide">Attendee</div>
                  <div className="grid grid-cols-2 gap-y-1 gap-x-4 text-xs">
                    <div className="text-slate-500">Name</div>
                    <div className="font-semibold text-slate-900 text-right">{attendee.full_name}</div>
                    <div className="text-slate-500">Email</div>
                    <div className="font-semibold text-slate-900 text-right truncate">{attendee.email}</div>
                  </div>
                </div>
              )}

              <div className="bg-slate-50 rounded-xl p-4 space-y-2 text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">Order Summary</div>
                <div className="flex justify-between text-slate-600">
                  <span>Event</span>
                  <span className="font-semibold text-slate-900 truncate max-w-[200px]">{event.title}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Pass</span>
                  <span className="font-bold text-purple-600 uppercase">{ticketType}</span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Qty</span>
                  <span className="font-semibold text-slate-900">{quantity}</span>
                </div>
              </div>

              <div className="bg-slate-50 rounded-xl p-4 text-xs">
                <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wide mb-2">Payment</div>
                <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                  {paymentMethod === 'credit_card' ? <CreditCard className="w-4 h-4 text-purple-600" /> :
                   paymentMethod === 'upi' ? <Smartphone className="w-4 h-4 text-pink-600" /> :
                   <Banknote className="w-4 h-4 text-indigo-600" />}
                  <span>{getMaskedPayment()}</span>
                </div>
              </div>

              {/* Total */}
              <div style={{ background: 'linear-gradient(135deg, #7C3AED10 0%, #EC489910 100%)' }} className="rounded-xl p-4 flex justify-between items-center border border-purple-200">
                <span className="text-sm font-bold text-slate-900">You Pay</span>
                <span className="text-2xl font-extrabold" style={{ color: '#7C3AED' }}>&#8377;{totalPrice}</span>
              </div>

              {payError && (
                <div className="bg-red-50 border border-red-200 p-3 rounded-xl text-[11px] text-red-700 font-semibold">{payError}</div>
              )}

              <div className="flex gap-3">
                <button onClick={() => { setStep('details'); setPayError(''); }}
                  className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-slate-200 text-slate-700 bg-white hover:bg-slate-50 transition flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>Back</span>
                </button>
                <button onClick={handleFinalPay} disabled={isSubmitting}
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}
                  className="flex-1 py-3 text-sm font-bold rounded-xl text-white hover:opacity-90 transition shadow-lg shadow-purple-300/30">
                  {isSubmitting ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"/><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/></svg>
                      Processing...
                    </span>
                  ) : `Pay ₹${totalPrice}`}
                </button>
              </div>
            </div>
          </>
        )}

        {/* ───── STEP 3: Success ───── */}
        {step === 'success' && bookingConfirmed && (
          <>
            <div style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)' }} className="px-6 py-5 relative">
              <button onClick={onClose} className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 text-white hover:bg-white/30 transition">
                <X className="w-4 h-4" />
              </button>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                  <CheckCircle2 className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Booking Confirmed!</h3>
                  <p className="text-xs text-white/80">Your digital entry pass is ready</p>
                </div>
              </div>

              {/* Step indicators - all done */}
              <div className="flex items-center gap-2 mt-4">
                {['Payment', 'Confirm', 'Done'].map((label, i) => (
                  <React.Fragment key={i}>
                    {i > 0 && <div className="flex-1 h-px bg-white/40" />}
                    <div className="flex items-center gap-1.5">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${i === 2 ? 'bg-white text-green-600' : 'bg-white/30 text-white'}`}>
                        {i < 2 ? <CheckCircle2 className="w-3.5 h-3.5" /> : '3'}
                      </div>
                      <span className={`text-[11px] ${i === 2 ? 'text-white font-semibold' : 'text-white/60'}`}>{label}</span>
                    </div>
                  </React.Fragment>
                ))}
              </div>
            </div>

            <div className="p-6 space-y-5">
              {/* Ticket Card */}
              <div className="relative rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #1E1B4B 0%, #312E81 50%, #7C3AED 100%)' }}>
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
                <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/5 rounded-full translate-y-1/2 -translate-x-1/2" />

                <div className="relative p-5 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] text-purple-300 font-bold uppercase tracking-widest">Digital Entry Pass</div>
                      <div className="text-base font-extrabold text-white mt-1">{event.title}</div>
                    </div>
                    <div className="w-16 h-16 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg">
                      <QrCode className="w-11 h-11 text-purple-800" />
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-3 grid grid-cols-2 gap-y-2 gap-x-4 text-xs">
                    <div>
                      <div className="text-purple-300 text-[10px]">Pass Code</div>
                      <div className="font-mono text-white font-bold">{bookingConfirmed.qr_code_token}</div>
                    </div>
                    {attendee && (
                      <>
                        <div>
                          <div className="text-purple-300 text-[10px]">Attendee</div>
                          <div className="text-white font-bold">{attendee.full_name}</div>
                        </div>
                        <div>
                          <div className="text-purple-300 text-[10px]">Phone</div>
                          <div className="text-white font-bold">{attendee.phone}</div>
                        </div>
                        <div>
                          <div className="text-purple-300 text-[10px]">Email</div>
                          <div className="text-white font-bold truncate">{attendee.email}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-purple-300 text-[10px]">Amount Paid</div>
                      <div className="text-emerald-400 font-extrabold text-base">&#8377;{totalPrice}</div>
                    </div>
                    <div>
                      <div className="text-purple-300 text-[10px]">Status</div>
                      <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" /> CONFIRMED
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-[11px] text-slate-500 text-center">
                A confirmation has been sent to your registered email.
              </p>

              <div className="flex gap-3">
                {onBookAnother && (
                  <button onClick={onBookAnother}
                    style={{ background: 'linear-gradient(135deg, #7C3AED10 0%, #EC489910 100%)' }}
                    className="flex-1 py-3 text-sm font-bold rounded-xl border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition">
                    Book for Friend
                  </button>
                )}
                <button onClick={onClose}
                  style={{ background: 'linear-gradient(135deg, #7C3AED 0%, #EC4899 100%)' }}
                  className={`${onBookAnother ? 'flex-1' : 'w-full'} py-3 text-sm font-bold rounded-xl text-white hover:opacity-90 transition shadow-lg shadow-purple-300/30`}>
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
