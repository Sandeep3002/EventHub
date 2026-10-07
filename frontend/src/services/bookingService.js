import { request } from './api';

export const bookingService = {
  async createRazorpayOrder(amount, eventId, currency = 'INR') {
    return await request('/payments/create-order', {
      method: 'POST',
      body: JSON.stringify({ amount, event_id: eventId, currency }),
    });
  },

  async verifyRazorpayPayment(data) {
    return await request('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async bookTicket(eventId, ticketId, quantity = 1, attendeeData = {}) {
    return await request('/registrations', {
      method: 'POST',
      body: JSON.stringify({
        event_id: eventId,
        ticket_id: ticketId || '',
        quantity,
        attendee_name: attendeeData.name || '',
        attendee_phone: attendeeData.phone || '',
        attendee_email: attendeeData.email || '',
        attendee_age: attendeeData.age ? parseInt(attendeeData.age) : null,
        total_amount: attendeeData.totalPrice || null,
        payment_method: attendeeData.paymentMethod || 'credit_card',
      }),
    });
  },

  async getMyBookings() {
    return await request('/registrations/my-registrations');
  },

  async getAllRegistrations() {
    return await request('/registrations/all');
  },

  async sendEmailToAttendees(registrationIds, subject, message) {
    return await request('/registrations/send-email', {
      method: 'POST',
      body: JSON.stringify({ registration_ids: registrationIds, subject, message }),
    });
  },

  async deleteRegistration(registrationId) {
    return await request(`/registrations/${registrationId}`, { method: 'DELETE' });
  },

  async processPayment(registrationId, paymentMethod = 'credit_card') {
    return await request('/payments', {
      method: 'POST',
      body: JSON.stringify({ registration_id: registrationId, payment_method: paymentMethod }),
    });
  },
};
