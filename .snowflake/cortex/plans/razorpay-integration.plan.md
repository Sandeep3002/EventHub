# Plan: Razorpay Payment Gateway Integration

## How Razorpay Works

```
Attendee clicks "Pay Now"
        │
        ▼
Backend creates a Razorpay Order (amount, currency)
        │
        ▼
Frontend opens Razorpay Checkout popup (card/UPI/netbanking)
        │
        ▼
Attendee pays via Razorpay's secure UI
        │
        ▼
Razorpay returns payment_id + signature to frontend
        │
        ▼
Frontend sends these to backend for verification
        │
        ▼
Backend verifies signature → marks booking as CONFIRMED
        │
        ▼
Money settles to your Razorpay account (→ organizer's bank)
```

## Prerequisites

You need a **Razorpay account** (free to create at https://razorpay.com). For testing, Razorpay provides **test mode keys** (`rzp_test_...`) that simulate payments without real money.

## Files to Change

### Backend Changes

1. **`backend/app/config/settings.py`** — Add Razorpay key config
   ```python
   RAZORPAY_KEY_ID: str = os.getenv("RAZORPAY_KEY_ID", "rzp_test_XXXXXXXXX")
   RAZORPAY_KEY_SECRET: str = os.getenv("RAZORPAY_KEY_SECRET", "XXXXXXXXX")
   ```

2. **`backend/.env`** — Store actual keys
   ```
   RAZORPAY_KEY_ID=rzp_test_your_key
   RAZORPAY_KEY_SECRET=your_secret
   ```

3. **`backend/requirements.txt`** — Add `razorpay>=1.4.0`

4. **`backend/app/services/payment_service.py`** — Add two new methods:
   - `create_razorpay_order(amount, currency)` — calls Razorpay API to create an order
   - `verify_razorpay_payment(order_id, payment_id, signature)` — verifies the payment signature

5. **`backend/app/routes/payments.py`** — Add two new endpoints:
   - `POST /create-order` — returns `{order_id, amount, currency, razorpay_key_id}`
   - `POST /verify` — verifies signature, saves payment, confirms registration

### Frontend Changes

6. **`frontend/index.html`** — Add Razorpay checkout script:
   ```html
   <script src="https://checkout.razorpay.com/v1/checkout.js"></script>
   ```

7. **`frontend/src/services/bookingService.js`** — Add:
   - `createOrder(eventId, quantity)` — calls backend create-order
   - `verifyPayment(data)` — calls backend verify

8. **`frontend/src/components/CheckoutModal.jsx`** — On "Pay Now":
   - Call backend to create Razorpay order
   - Open `new Razorpay({...})` popup with the order details
   - On success: call verify endpoint → show booking confirmed
   - On failure: show error message

9. **`frontend/src/pages/EventDetails.jsx`** — Wire `onBookingSuccess` to the real registration + payment flow

## Payment Flow (Step by Step)

1. User fills registration form → clicks "Continue to Checkout"
2. Reviews details → clicks "Pay Now $300"
3. **Backend** creates a Razorpay order for ₹300
4. **Frontend** opens Razorpay popup (branded checkout with card/UPI/netbanking)
5. User completes payment in Razorpay's secure popup
6. Razorpay returns `payment_id` + `signature` to frontend
7. **Frontend** sends these to `POST /payments/verify`
8. **Backend** verifies the signature using Razorpay secret
9. **Backend** creates registration + payment records, marks as CONFIRMED
10. **Frontend** shows "Booking Confirmed!" with QR pass

## Test Mode

With Razorpay test keys, you can use:
- **Card**: 4111 1111 1111 1111, any future expiry, any CVV
- **UPI**: success@razorpay (simulates success)
- No real money is charged in test mode
