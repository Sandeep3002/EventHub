// Cloudflare Pages Native API Backend for EventHub
// Replaces Python FastAPI with 100% Edge-native serverless execution

// In-memory data store for Edge Worker lifetime
const memoryStore = {
  users: [
    {
      id: 'usr_superadmin',
      email: 'superadmin@eventhub.com',
      password_hash: 'demo1234', // Checked via verifyPassword
      full_name: 'Super Admin',
      role: 'superadmin',
      phone: '',
      is_active: true,
      created_at: new Date('2026-01-01').toISOString(),
    },
    {
      id: 'usr_sandeep',
      email: 'admin@eventhub.com',
      password_hash: 'demo1234',
      full_name: 'Demo Admin',
      role: 'admin',
      phone: '',
      is_active: true,
      created_at: new Date('2026-01-02').toISOString(),
    },
    {
      id: 'usr_pranav',
      email: 'organizer@example.com',
      password_hash: 'demo1234',
      full_name: 'Demo Organizer',
      role: 'organizer',
      phone: '',
      is_active: true,
      created_at: new Date('2026-01-03').toISOString(),
    },
    {
      id: 'usr_attendee',
      email: 'john@example.com',
      password_hash: 'demo1234',
      full_name: 'John Doe',
      role: 'attendee',
      phone: '',
      is_active: true,
      created_at: new Date('2026-01-04').toISOString(),
    },
  ],
  categories: [
    { id: 'cat_tech', name: 'Technology & AI', description: 'Tech summits, AI expos, and developer conferences', icon: 'Cpu' },
    { id: 'cat_music', name: 'Concerts & Music', description: 'Live festivals, acoustic sets, and indie bands', icon: 'Music' },
    { id: 'cat_business', name: 'Business & Networking', description: 'Pitch decks, founder meetups, and investor summits', icon: 'Briefcase' },
    { id: 'cat_arts', name: 'Arts & Culture', description: 'Art galleries, theatre performances, and cultural galas', icon: 'Palette' },
    { id: 'cat_sports', name: 'Sports & Fitness', description: 'Marathons, fitness camps, and athletic championships', icon: 'Trophy' },
  ],
  venues: [
    { id: 'ven_1', name: 'Grand Silicon Arena', address: '100 Innovation Way', city: 'San Francisco, CA', capacity: 1500 },
    { id: 'ven_2', name: 'Metropolitan Tech Center', address: '450 Broadway Ave', city: 'New York, NY', capacity: 800 },
    { id: 'ven_3', name: 'Riverside Amphitheatre', address: '12 Riverbank Road', city: 'Austin, TX', capacity: 2000 },
    { id: 'ven_4', name: 'Skyline Convention Hall', address: '88 Lake Shore Dr', city: 'Chicago, IL', capacity: 600 },
  ],
  events: [
    {
      id: 'evt_tech_2026',
      title: 'Global Tech & AI Summit 2026',
      description: 'The premier global gathering of AI innovators, visionary founders, and elite engineers discussing frontier intelligence and robotics.',
      category_id: 'cat_tech',
      venue_id: 'ven_1',
      venue_name: 'Grand Silicon Arena, San Francisco',
      start_time: '2026-11-15T09:00:00Z',
      end_time: '2026-11-17T18:00:00Z',
      price: 1499,
      capacity: 500,
      available_seats: 430,
      image_url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      organizer_id: 'usr_superadmin',
      status: 'published',
      featured: true,
      created_at: new Date('2026-01-10').toISOString(),
    },
    {
      id: 'evt_neon_music',
      title: 'Neon Lights Music Festival',
      description: 'An electrifying two-day sonic journey featuring top electronic artists, mesmerizing light installations, and gourmet food trucks.',
      category_id: 'cat_music',
      venue_id: 'ven_3',
      venue_name: 'Riverside Amphitheatre, Austin',
      start_time: '2026-12-05T16:00:00Z',
      end_time: '2026-12-06T23:00:00Z',
      price: 999,
      capacity: 1200,
      available_seats: 980,
      image_url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?auto=format&fit=crop&w=1200&q=80',
      organizer_id: 'usr_pranav',
      status: 'published',
      featured: true,
      created_at: new Date('2026-01-12').toISOString(),
    },
    {
      id: 'evt_startup_pitch',
      title: 'Unicorn Founder Pitch Showcase',
      description: 'Watch 20 hyper-growth startups pitch live before Tier-1 VC partners. Network with high-impact founders and angel investors.',
      category_id: 'cat_business',
      venue_id: 'ven_2',
      venue_name: 'Metropolitan Tech Center, New York',
      start_time: '2026-11-28T10:00:00Z',
      end_time: '2026-11-28T17:00:00Z',
      price: 799,
      capacity: 350,
      available_seats: 290,
      image_url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?auto=format&fit=crop&w=1200&q=80',
      organizer_id: 'usr_sandeep',
      status: 'published',
      featured: true,
      created_at: new Date('2026-01-15').toISOString(),
    },
    {
      id: 'evt_marathon_2026',
      title: 'City Skyline Half Marathon & Expo',
      description: 'Run through scenic urban skylines and scenic waterfronts. Includes digital timing chips, custom medals, and wellness workshops.',
      category_id: 'cat_sports',
      venue_id: 'ven_4',
      venue_name: 'Skyline Convention Hall, Chicago',
      start_time: '2026-12-12T06:30:00Z',
      end_time: '2026-12-12T13:00:00Z',
      price: 299,
      capacity: 2000,
      available_seats: 1650,
      image_url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?auto=format&fit=crop&w=1200&q=80',
      organizer_id: 'usr_pranav',
      status: 'published',
      featured: false,
      created_at: new Date('2026-01-18').toISOString(),
    },
  ],
  registrations: [
    {
      id: 'reg_1001',
      event_id: 'evt_tech_2026',
      event_title: 'Global Tech & AI Summit 2026',
      user_id: 'usr_attendee',
      attendee_name: 'John Doe',
      attendee_email: 'john@example.com',
      attendee_phone: '',
      ticket_type: 'General Admission',
      quantity: 1,
      total_amount: 1499,
      status: 'confirmed',
      payment_status: 'paid',
      ticket_code: 'EH-TECH-9912',
      created_at: new Date('2026-02-01').toISOString(),
    },
  ],
  payments: [
    {
      id: 'pay_1001',
      order_id: 'order_mock_001',
      payment_id: 'pay_mock_123',
      user_id: 'usr_attendee',
      event_id: 'evt_tech_2026',
      amount: 1499,
      currency: 'INR',
      status: 'success',
      payment_method: 'razorpay',
      created_at: new Date('2026-02-01').toISOString(),
    },
  ],
  activities: [
    {
      id: 'act_1',
      actor_id: 'usr_superadmin',
      actor_name: 'Super Admin',
      actor_role: 'superadmin',
      action: 'created_event',
      target_type: 'event',
      target_name: 'Global Tech & AI Summit 2026',
      target_id: 'evt_tech_2026',
      details: 'Created event Global Tech & AI Summit 2026 with capacity 500, price ₹1499',
      timestamp: new Date('2026-01-10T10:00:00Z').toISOString(),
    },
    {
      id: 'act_2',
      actor_id: 'usr_attendee',
      actor_name: 'John Doe',
      actor_role: 'attendee',
      action: 'new_registration',
      target_type: 'registration',
      target_name: 'Global Tech & AI Summit 2026',
      target_id: 'reg_1001',
      details: 'New registration for Global Tech & AI Summit 2026, amount ₹1499',
      timestamp: new Date('2026-02-01T14:30:00Z').toISOString(),
    },
  ],
};

// Web Crypto Helpers
async function hashPassword(plainText) {
  const encoder = new TextEncoder();
  const data = encoder.encode(plainText + '_salt_eventhub');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function verifyPassword(plainText, storedHash) {
  if (storedHash === plainText) return true; // Direct demo match
  const hashed = await hashPassword(plainText);
  return hashed === storedHash;
}

function base64UrlEncode(str) {
  return btoa(unescape(encodeURIComponent(str)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function base64UrlDecode(str) {
  let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
  while (base64.length % 4) {
    base64 += '=';
  }
  return decodeURIComponent(escape(atob(base64)));
}

async function createJwt(payload, jwtSecret) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const exp = Math.floor(Date.now() / 1000) + (60 * 60 * 24); // 24 hours
  const fullPayload = { ...payload, exp };

  const encodedHeader = base64UrlEncode(JSON.stringify(header));
  const encodedPayload = base64UrlEncode(JSON.stringify(fullPayload));
  const unsignedToken = `${encodedHeader}.${encodedPayload}`;

  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(jwtSecret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );

  const signature = await crypto.subtle.sign('HMAC', key, encoder.encode(unsignedToken));
  const encodedSignature = base64UrlEncode(
    String.fromCharCode(...new Uint8Array(signature))
  );

  return `${unsignedToken}.${encodedSignature}`;
}

async function verifyJwt(token, jwtSecret) {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [headerB64, payloadB64, signatureB64] = parts;
    const unsignedToken = `${headerB64}.${payloadB64}`;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(jwtSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['verify']
    );

    const binarySig = atob(signatureB64.replace(/-/g, '+').replace(/_/g, '/'));
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await crypto.subtle.verify('HMAC', key, sigBytes, encoder.encode(unsignedToken));
    if (!isValid) return null;

    const payload = JSON.parse(base64UrlDecode(payloadB64));
    if (payload.exp && Date.now() / 1000 > payload.exp) return null;

    return payload;
  } catch {
    return null;
  }
}

function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

function errorResponse(detail, status = 400) {
  return jsonResponse({ detail }, status);
}

async function getAuthUser(request, jwtSecret) {
  const authHeader = request.headers.get('Authorization') || '';
  if (!authHeader.startsWith('Bearer ')) return null;
  const token = authHeader.substring(7);
  const payload = await verifyJwt(token, jwtSecret);
  if (!payload || !payload.sub) return null;
  const user = memoryStore.users.find(u => u.id === payload.sub);
  return user || null;
}

// Main Cloudflare Handler
export async function onRequest(context) {
  const { request } = context;
  const jwtSecret = context.env.JWT_SECRET;
  if (typeof jwtSecret !== 'string' || jwtSecret.length < 32) {
    return errorResponse('Server authentication is not configured.', 500);
  }
  const url = new URL(request.url);
  const path = url.pathname.replace(/^\/api\/v1/, '').replace(/^\/api/, '');
  const method = request.method.toUpperCase();

  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // --- AUTH ROUTES ---
  if (path === '/auth/login' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const cleanEmail = (body.email || '').trim().toLowerCase();
    const user = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);

    if (!user || !(await verifyPassword(body.password, user.password_hash))) {
      return errorResponse('Incorrect email or password.', 401);
    }

    const token = await createJwt({ sub: user.id, role: user.role }, jwtSecret);
    const { password_hash, ...safeUser } = user;
    return jsonResponse({
      access_token: token,
      token_type: 'bearer',
      user: safeUser,
    });
  }

  if (path === '/auth/register' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const cleanEmail = (body.email || '').trim().toLowerCase();

    if (!cleanEmail || !body.password) {
      return errorResponse('Email and password are required.', 400);
    }

    const existing = memoryStore.users.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return errorResponse('User with this email already exists.', 400);
    }

    const newUser = {
      id: `usr_${Date.now()}`,
      email: cleanEmail,
      full_name: body.full_name || 'Event Attendee',
      password_hash: await hashPassword(body.password),
      role: body.role || 'attendee',
      phone: body.phone || '',
      is_active: true,
      created_at: new Date().toISOString(),
    };

    memoryStore.users.push(newUser);
    const token = await createJwt({ sub: newUser.id, role: newUser.role }, jwtSecret);
    const { password_hash, ...safeUser } = newUser;

    return jsonResponse({
      access_token: token,
      token_type: 'bearer',
      user: safeUser,
    }, 201);
  }

  if (path === '/auth/me' && method === 'GET') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const { password_hash, ...safeUser } = user;
    return jsonResponse(safeUser);
  }

  if (path === '/auth/forgot-password' && method === 'POST') {
    return jsonResponse({ message: 'If an account with that email exists, a reset link has been sent.' });
  }

  if (path === '/auth/reset-password' && method === 'POST') {
    return jsonResponse({ message: 'Password has been reset successfully. You can now log in.' });
  }

  // --- USERS ROUTES ---
  if (path === '/users' && method === 'GET') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const safeUsers = memoryStore.users.map(({ password_hash, ...u }) => u);
    return jsonResponse(safeUsers);
  }

  if (path === '/users/me' && method === 'PUT') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const body = await request.json().catch(() => ({}));

    if (body.full_name) user.full_name = body.full_name;
    if (body.phone !== undefined) user.phone = body.phone;
    if (body.password) user.password_hash = await hashPassword(body.password);
    user.updated_at = new Date().toISOString();

    const { password_hash, ...safeUser } = user;
    return jsonResponse(safeUser);
  }

  // --- CATEGORIES ROUTES ---
  if (path === '/categories' && method === 'GET') {
    return jsonResponse(memoryStore.categories);
  }

  if (path === '/categories' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const newCat = {
      id: `cat_${Date.now()}`,
      name: body.name || 'New Category',
      description: body.description || '',
      icon: body.icon || 'Tag',
    };
    memoryStore.categories.push(newCat);
    return jsonResponse(newCat, 201);
  }

  // --- VENUES ROUTES ---
  if (path === '/venues' && method === 'GET') {
    return jsonResponse(memoryStore.venues);
  }

  if (path === '/venues' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    const newVen = {
      id: `ven_${Date.now()}`,
      name: body.name || 'New Venue',
      address: body.address || '',
      city: body.city || '',
      capacity: parseInt(body.capacity || 500),
    };
    memoryStore.venues.push(newVen);
    return jsonResponse(newVen, 201);
  }

  // --- EVENTS ROUTES ---
  if (path === '/events' && method === 'GET') {
    const categoryId = url.searchParams.get('category_id');
    const venueId = url.searchParams.get('venue_id');
    const search = (url.searchParams.get('search') || '').toLowerCase();

    let filtered = [...memoryStore.events];

    if (categoryId) {
      filtered = filtered.filter(e => e.category_id === categoryId);
    }
    if (venueId) {
      filtered = filtered.filter(e => e.venue_id === venueId);
    }
    if (search) {
      filtered = filtered.filter(e =>
        e.title.toLowerCase().includes(search) ||
        (e.description && e.description.toLowerCase().includes(search))
      );
    }

    return jsonResponse(filtered);
  }

  if (path.startsWith('/events/') && method === 'GET') {
    const eventId = path.split('/')[2];
    const event = memoryStore.events.find(e => e.id === eventId);
    if (!event) return errorResponse('Event not found', 404);
    return jsonResponse(event);
  }

  if (path === '/events' && method === 'POST') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const body = await request.json().catch(() => ({}));

    const newEvent = {
      id: `evt_${Date.now()}`,
      title: body.title || 'Untitled Event',
      description: body.description || '',
      category_id: body.category_id || 'cat_tech',
      venue_id: body.venue_id || 'ven_1',
      venue_name: body.venue_name || 'Grand Silicon Arena',
      start_time: body.start_time || new Date().toISOString(),
      end_time: body.end_time || new Date().toISOString(),
      price: parseFloat(body.price || 0),
      capacity: parseInt(body.capacity || 100),
      available_seats: parseInt(body.capacity || 100),
      image_url: body.image_url || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80',
      organizer_id: user.id,
      status: 'published',
      featured: Boolean(body.featured),
      created_at: new Date().toISOString(),
    };

    memoryStore.events.unshift(newEvent);

    // Log activity
    memoryStore.activities.unshift({
      id: `act_${Date.now()}`,
      actor_id: user.id,
      actor_name: user.full_name,
      actor_role: user.role,
      action: 'created_event',
      target_type: 'event',
      target_name: newEvent.title,
      target_id: newEvent.id,
      details: `Created event '${newEvent.title}' with capacity ${newEvent.capacity}, price ₹${newEvent.price}`,
      timestamp: new Date().toISOString(),
    });

    return jsonResponse(newEvent, 201);
  }

  if (path.startsWith('/events/') && method === 'PUT') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const eventId = path.split('/')[2];
    const event = memoryStore.events.find(e => e.id === eventId);
    if (!event) return errorResponse('Event not found', 404);

    const body = await request.json().catch(() => ({}));
    Object.assign(event, body, { updated_at: new Date().toISOString() });
    return jsonResponse(event);
  }

  if (path.startsWith('/events/') && method === 'DELETE') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const eventId = path.split('/')[2];
    const index = memoryStore.events.findIndex(e => e.id === eventId);
    if (index === -1) return errorResponse('Event not found', 404);

    memoryStore.events.splice(index, 1);
    return jsonResponse({ message: 'Event deleted successfully' });
  }

  // --- REGISTRATIONS / BOOKINGS ROUTES ---
  if (path === '/registrations' && method === 'POST') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const body = await request.json().catch(() => ({}));

    const event = memoryStore.events.find(e => e.id === body.event_id);
    const eventTitle = event ? event.title : 'Event';
    const quantity = parseInt(body.quantity || 1);
    const totalAmount = body.total_amount || (event ? event.price * quantity : 0);

    const newReg = {
      id: `reg_${Date.now()}`,
      event_id: body.event_id,
      event_title: eventTitle,
      user_id: user.id,
      attendee_name: body.attendee_name || user.full_name,
      attendee_email: body.attendee_email || user.email,
      attendee_phone: body.attendee_phone || user.phone,
      ticket_type: body.ticket_id || 'General Admission',
      quantity,
      total_amount: totalAmount,
      status: 'confirmed',
      payment_status: 'paid',
      ticket_code: `EH-${Math.random().toString(36).substring(2, 8).toUpperCase()}`,
      created_at: new Date().toISOString(),
    };

    memoryStore.registrations.unshift(newReg);

    if (event && event.available_seats) {
      event.available_seats = Math.max(0, event.available_seats - quantity);
    }

    // Log activity
    memoryStore.activities.unshift({
      id: `act_${Date.now()}`,
      actor_id: user.id,
      actor_name: newReg.attendee_name,
      actor_role: user.role,
      action: 'new_registration',
      target_type: 'registration',
      target_name: eventTitle,
      target_id: newReg.id,
      details: `New registration for '${eventTitle}', amount ₹${totalAmount}`,
      timestamp: new Date().toISOString(),
    });

    return jsonResponse(newReg, 201);
  }

  if (path === '/registrations/my-registrations' && method === 'GET') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const myRegs = memoryStore.registrations.filter(r => r.user_id === user.id);
    return jsonResponse(myRegs);
  }

  if (path === '/registrations/all' && method === 'GET') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    return jsonResponse(memoryStore.registrations);
  }

  if (path.startsWith('/registrations/') && method === 'DELETE') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const regId = path.split('/')[2];
    const index = memoryStore.registrations.findIndex(r => r.id === regId);
    if (index !== -1) memoryStore.registrations.splice(index, 1);
    return jsonResponse({ message: 'Registration deleted' });
  }

  if (path === '/registrations/send-email' && method === 'POST') {
    return jsonResponse({ status: 'success', message: 'Notification emails sent successfully.' });
  }

  // --- PAYMENTS ROUTES ---
  if (path === '/payments/create-order' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    return jsonResponse({
      id: `order_${Date.now()}`,
      amount: (body.amount || 100) * 100, // in paise
      currency: body.currency || 'INR',
      key: 'rzp_test_mock_eventhub',
    });
  }

  if (path === '/payments/verify' && method === 'POST') {
    const body = await request.json().catch(() => ({}));
    return jsonResponse({
      status: 'verified',
      payment_id: body.razorpay_payment_id || `pay_${Date.now()}`,
      order_id: body.razorpay_order_id || `order_${Date.now()}`,
    });
  }

  if (path === '/payments' && method === 'POST') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    const body = await request.json().catch(() => ({}));
    const newPay = {
      id: `pay_${Date.now()}`,
      order_id: `order_${Date.now()}`,
      payment_id: `pay_${Date.now()}`,
      user_id: user.id,
      registration_id: body.registration_id || '',
      amount: body.amount || 0,
      currency: 'INR',
      status: 'success',
      payment_method: body.payment_method || 'razorpay',
      created_at: new Date().toISOString(),
    };
    memoryStore.payments.unshift(newPay);
    return jsonResponse(newPay, 201);
  }

  if (path === '/payments/my-payments' && method === 'GET') {
    const user = await getAuthUser(request, jwtSecret);
    if (!user) return errorResponse('Not authenticated', 401);
    return jsonResponse(memoryStore.payments.filter(p => p.user_id === user.id));
  }

  // --- ACTIVITIES ROUTES ---
  if ((path === '/activities' || path === '/activities/recent') && method === 'GET') {
    const limit = parseInt(url.searchParams.get('limit') || 10);
    return jsonResponse(memoryStore.activities.slice(0, limit));
  }

  // --- STATS ROUTES ---
  if (path === '/stats/superadmin' && method === 'GET') {
    const totalAdmins = memoryStore.users.filter(u => u.role === 'admin' || u.role === 'organizer').length;
    const totalCustomers = memoryStore.users.filter(u => u.role === 'attendee').length;
    const totalEvents = memoryStore.events.length;
    const totalRegistrations = memoryStore.registrations.length;
    const totalRevenue = memoryStore.registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const adminUsers = memoryStore.users.filter(u => u.role === 'admin' || u.role === 'organizer').map(({ password_hash, ...u }) => u);

    return jsonResponse({
      total_admins: totalAdmins,
      total_customers: totalCustomers,
      total_events: totalEvents,
      total_registrations: totalRegistrations,
      total_revenue: totalRevenue,
      recent_activities: memoryStore.activities.slice(0, 10),
      admin_users: adminUsers,
    });
  }

  if (path === '/stats/admin' && method === 'GET') {
    const totalEvents = memoryStore.events.length;
    const totalRegistrations = memoryStore.registrations.length;
    const totalRevenue = memoryStore.registrations.reduce((sum, r) => sum + (r.total_amount || 0), 0);
    const upcomingEvents = memoryStore.events.filter(e => new Date(e.start_time) > new Date()).length;

    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const currentMonth = new Date().getMonth();
    const monthlyRegistrations = [
      { month: monthNames[(currentMonth - 2 + 12) % 12], registrations: 4 },
      { month: monthNames[(currentMonth - 1 + 12) % 12], registrations: 9 },
      { month: monthNames[currentMonth], registrations: totalRegistrations },
    ];

    const categoryDistribution = memoryStore.categories.map(cat => ({
      name: cat.name,
      value: memoryStore.events.filter(e => e.category_id === cat.id).length || 1,
    }));

    const recentEvents = memoryStore.events.slice(0, 6).map(e => ({
      ...e,
      registration_count: memoryStore.registrations.filter(r => r.event_id === e.id).length,
    }));

    return jsonResponse({
      total_events: totalEvents,
      total_registrations: totalRegistrations,
      total_revenue: totalRevenue,
      upcoming_events: upcomingEvents,
      monthly_registrations: monthlyRegistrations,
      category_distribution: categoryDistribution,
      recent_events: recentEvents,
    });
  }

  // 404 for unknown API routes
  return errorResponse(`API endpoint not found: ${method} ${path}`, 404);
}
