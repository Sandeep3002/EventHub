# EventHub Backend API

FastAPI asynchronous backend for EventHub, an end-to-end Event Management and Ticket Reservation System powered by MongoDB.

## Features
- **User Authentication**: JWT Token Auth (Register, Login, Me, Role-based Access: Admin, Organizer, Attendee)
- **Event Management**: Create, Read, Update, Delete, Filter by Category/Date/Location, Ticket Inventory
- **Categories & Venues**: Manage categories and detailed venue listings
- **Ticket System**: Dynamic ticket types (General, VIP, Early Bird), pricing, seat capacity
- **Registration & Bookings**: Real-time event registrations, ticket issuance, booking history
- **Payment Processing**: Payment transaction simulation, order statuses, receipt generation
- **Email Notifications**: Confirmation email utilities

## Setup & Running

```bash
cd backend
python -m venv venv
# On Windows:
venv\Scripts\activate
# On Linux/Mac:
source venv/bin/activate

pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Docs available at: `http://localhost:8000/docs`
