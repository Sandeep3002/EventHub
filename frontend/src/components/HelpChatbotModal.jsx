import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X, Send, Bot, User, Sparkles, MessageSquare, RotateCcw,
  ArrowRight, Ticket, Calendar, ShieldCheck, CreditCard, Users, ExternalLink
} from 'lucide-react';

// Comprehensive Knowledge Base & Response Engine for EventHub
const KNOWLEDGE_BASE = [
  {
    keywords: ['qr', 'pass', 'code', 'token', 'ticket', 'download ticket', 'pass code', 'my ticket'],
    title: 'Tickets & QR Code Passes',
    answer: `**Accessing & Downloading Your Event Pass:**\n\n1. **Attendees**: Go to **My Bookings** from your sidebar or menu.\n2. Click on the **QR Code Pass** button for your registered event.\n3. A digital pass modal will open displaying your **QR Code** and unique token.\n4. Click **Download** to save the pass image to your device.\n5. Present this QR code at the venue entrance for seamless check-in verification!`,
    action: { label: 'Go to My Bookings', path: '/customer/bookings' }
  },
  {
    keywords: ['register', 'attendee', 'registrations', 'attendees', 'guest', 'registered', 'who registered'],
    title: 'Managing Registrations',
    answer: `**Managing Event Registrations (Organizers & Admins):**\n\n• Open **Registrations** in your sidebar.\n• View total attendees, confirmed passes, pending approvals, and revenue.\n• Search attendees by **name, email, event, or pass token**.\n• Select multiple attendees to send bulk broadcast **emails** directly.\n• Click on any attendee's **Pass Code** to preview and verify their QR pass.\n• Use the delete action to cancel or remove invalid registrations.`,
    action: { label: 'View Registrations', path: '/admin/registrations' }
  },
  {
    keywords: ['create event', 'new event', 'host event', 'publish event', 'add event'],
    title: 'Creating an Event',
    answer: `**How to Host & Create a New Event:**\n\n1. Go to **Create Event** in the Admin sidebar.\n2. Enter the event **Title**, description, date, start & end times.\n3. Set the venue/location, category, and maximum ticket capacity.\n4. Set your ticket **Price** (or $0 for Free community events).\n5. Upload a cover photo banner.\n6. Click **Publish Event** to make it instantly available for bookings!`,
    action: { label: 'Create an Event', path: '/admin/create-event' }
  },
  {
    keywords: ['bank', 'payout', 'payouts', 'money', 'revenue', 'withdraw', 'account', 'bank details', 'payment'],
    title: 'Organizer Bank Details & Payouts',
    answer: `**Payout Setup & Revenue Routing:**\n\n• Go to **Bank Details** under your Organizer/Superadmin dashboard.\n• Provide your **Account Number, Bank Name, IFSC Code, and Beneficiary Name**.\n• Secure payouts are processed automatically to your verified account.\n• Superadmins can review and approve organizer bank accounts on platform.`,
    action: { label: 'Configure Bank Details', path: '/admin/bank-details' }
  },
  {
    keywords: ['role', 'roles', 'permission', 'superadmin', 'admin', 'organizer', 'attendee'],
    title: 'Platform Roles & Permissions',
    answer: `**EventHub Role Hierarchy:**\n\n• **Superadmin**: Complete oversight of all events, platform registrations, user management, and platform analytics.\n• **Admin / Organizer**: Create and manage your own events, track registrations, download QR check-in lists, and manage payouts.\n• **Attendee**: Browse events, book passes, receive instant QR codes, and view registration history in customer dashboard.`,
  },
  {
    keywords: ['refund', 'cancel', 'cancellation', 'return money'],
    title: 'Refunds & Cancellations',
    answer: `**Refund & Cancellation Policy:**\n\n• If an event is cancelled or rescheduled by the organizer, registered attendees receive automatic notifications and eligible refunds.\n• Attendees can contact support or the event organizer directly through the **Contact Us** page to request booking adjustments.`,
    action: { label: 'Contact Support', path: '/contact' }
  },
  {
    keywords: ['dark', 'light', 'theme', 'moon', 'sun', 'mode'],
    title: 'Theme & Dark Mode',
    answer: `**Switching Themes:**\n\n• Click the **Moon / Sun** button in your top navigation bar to toggle between modern Sleek Dark Mode and Clean Light Mode instantly.\n• Your preference is remembered across sessions!`,
  },
  {
    keywords: ['contact', 'support', 'email', 'phone', 'helpdesk', 'customer care'],
    title: 'Contacting Support',
    answer: `**Support & Assistance:**\n\n• **Email**: contact.gvmsc@gmail.com\n• **Hotline**: +1 (800) 555-EVENT / +91 98765 43210\n• **Office**: EventHub Tech Hub, HITEC City, Hyderabad\n• **Hours**: Mon - Sat, 9:00 AM - 6:00 PM IST`,
    action: { label: 'Open Contact Form', path: '/contact' }
  },
  {
    keywords: ['analytics', 'metrics', 'stats', 'sales', 'chart'],
    title: 'Analytics & Reports',
    answer: `**Real-time Event Analytics:**\n\n• Visit **Analytics** in the Admin sidebar to track ticket sales trends, revenue breakdowns, top performing venues, and attendee turnouts over time.`,
    action: { label: 'View Analytics', path: '/admin/analytics' }
  }
];

const QUICK_PROMPTS = [
  '🎫 How do I download my ticket QR pass?',
  '👥 How to view attendee registrations?',
  '📅 How can I create a new event?',
  '💰 How do organizer payouts work?',
  '🔐 What are the user roles on EventHub?',
  '🎧 How to reach customer support?'
];

export default function HelpChatbotModal({ isOpen, onClose }) {
  const navigate = useNavigate();
  const [messages, setMessages] = useState([
    {
      id: 'welcome',
      sender: 'bot',
      text: "Hello! 👋 I'm your **EventHub Assistant**. Ask me anything about tickets, registrations, hosting events, payouts, or how to navigate the platform!",
      time: 'Just now'
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen) {
      scrollToBottom();
    }
  }, [isOpen, messages, isTyping]);

  if (!isOpen) return null;

  const findBestAnswer = (query) => {
    const cleanQuery = query.toLowerCase().trim();
    let bestMatch = null;
    let maxScore = 0;

    for (const item of KNOWLEDGE_BASE) {
      let score = 0;
      for (const kw of item.keywords) {
        if (cleanQuery.includes(kw)) {
          score += kw.length > 4 ? 3 : 2;
        }
      }
      if (cleanQuery.includes(item.title.toLowerCase())) {
        score += 5;
      }
      if (score > maxScore) {
        maxScore = score;
        bestMatch = item;
      }
    }

    if (bestMatch && maxScore >= 2) {
      return {
        text: `### ${bestMatch.title}\n\n${bestMatch.answer}`,
        action: bestMatch.action
      };
    }

    // Generic helpful response
    return {
      text: `I'd love to help with that! Here are common things I can assist you with:\n\n• **Tickets & QR passes**: Viewing, verifying, and downloading passes\n• **Registrations**: Viewing attendee lists and bulk emailing guests\n• **Creating Events**: Adding venues, pricing, tickets, and banners\n• **Bank Details & Payouts**: Connecting account numbers for event revenue\n\nTry clicking one of the suggested topics below, or ask your question with key words!`,
      action: { label: 'Contact Support Directly', path: '/contact' }
    };
  };

  const handleSend = (textToSend = null) => {
    const text = (textToSend || input).trim();
    if (!text) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);

    // Simulate natural AI thinking delay
    setTimeout(() => {
      const match = findBestAnswer(text);
      const botMsg = {
        id: (Date.now() + 1).toString(),
        sender: 'bot',
        text: match.text,
        action: match.action,
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, botMsg]);
      setIsTyping(false);
    }, 450);
  };

  const handleReset = () => {
    setMessages([
      {
        id: 'welcome-' + Date.now(),
        sender: 'bot',
        text: "Conversation reset. What would you like help with today? 😊",
        time: 'Just now'
      }
    ]);
  };

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        backgroundColor: 'rgba(15, 23, 42, 0.55)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: '100%',
          maxWidth: 580,
          height: '620px',
          maxHeight: '90vh',
          backgroundColor: 'var(--c-surface)',
          border: '1px solid var(--c-border)',
          borderRadius: 22,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out',
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div style={{
          padding: '16px 20px',
          background: 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
          color: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <div style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'rgba(255, 255, 255, 0.2)',
              backdropFilter: 'blur(8px)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
            }}>
              <Bot style={{ width: 22, height: 22, color: '#FFFFFF' }} />
              <span style={{
                position: 'absolute',
                bottom: -1,
                right: -1,
                width: 10,
                height: 10,
                borderRadius: '50%',
                background: '#10B981',
                border: '2px solid #7C3AED',
              }} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <h3 style={{ fontSize: 16, fontWeight: 800, margin: 0, color: '#FFFFFF' }}>EventHub Help Bot</h3>
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background: 'rgba(255, 255, 255, 0.25)',
                  padding: '2px 8px',
                  borderRadius: 12,
                  letterSpacing: '0.04em'
                }}>Online</span>
              </div>
              <p style={{ fontSize: 12, margin: '2px 0 0 0', opacity: 0.85 }}>Instant answers to your EventHub questions</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            <button
              onClick={handleReset}
              title="Reset Chat"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <RotateCcw style={{ width: 16, height: 16 }} />
            </button>
            <button
              onClick={onClose}
              title="Close"
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
              }}
            >
              <X style={{ width: 18, height: 18 }} />
            </button>
          </div>
        </div>

        {/* Message Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          padding: '20px 20px 10px',
          display: 'flex',
          flexDirection: 'column',
          gap: 16,
          backgroundColor: 'var(--c-bg)',
        }}>
          {messages.map((m) => {
            const isBot = m.sender === 'bot';
            return (
              <div
                key={m.id}
                style={{
                  display: 'flex',
                  gap: 10,
                  alignItems: 'flex-start',
                  justifyContent: isBot ? 'flex-start' : 'flex-end',
                }}
              >
                {isBot && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(124, 58, 237, 0.12)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#7C3AED',
                    marginTop: 2,
                  }}>
                    <Bot style={{ width: 18, height: 18 }} />
                  </div>
                )}

                <div style={{ maxWidth: '82%' }}>
                  <div style={{
                    padding: '12px 16px',
                    borderRadius: isBot ? '4px 18px 18px 18px' : '18px 4px 18px 18px',
                    background: isBot ? 'var(--c-surface)' : 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)',
                    color: isBot ? 'var(--c-text-main)' : '#FFFFFF',
                    border: isBot ? '1px solid var(--c-border)' : 'none',
                    boxShadow: '0 2px 5px rgba(0,0,0,0.04)',
                    fontSize: 14,
                    lineHeight: 1.55,
                    whiteSpace: 'pre-line',
                  }}>
                    {m.text}

                    {m.action && (
                      <div style={{ marginTop: 12, paddingTop: 10, borderTop: isBot ? '1px solid var(--c-border)' : '1px solid rgba(255,255,255,0.2)' }}>
                        <button
                          onClick={() => {
                            onClose();
                            navigate(m.action.path);
                          }}
                          style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 6,
                            padding: '6px 14px',
                            borderRadius: 8,
                            background: isBot ? '#7C3AED' : '#FFFFFF',
                            color: isBot ? '#FFFFFF' : '#4F46E5',
                            border: 'none',
                            fontSize: 12,
                            fontWeight: 700,
                            cursor: 'pointer',
                            boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                          }}
                        >
                          <span>{m.action.label}</span>
                          <ArrowRight style={{ width: 14, height: 14 }} />
                        </button>
                      </div>
                    )}
                  </div>
                  <span style={{
                    fontSize: 10,
                    color: 'var(--c-text-muted)',
                    display: 'block',
                    marginTop: 4,
                    textAlign: isBot ? 'left' : 'right',
                    padding: '0 4px',
                  }}>
                    {m.time}
                  </span>
                </div>

                {!isBot && (
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: 10,
                    background: 'rgba(79, 70, 229, 0.15)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    color: '#4F46E5',
                    marginTop: 2,
                  }}>
                    <User style={{ width: 16, height: 16 }} />
                  </div>
                )}
              </div>
            );
          })}

          {isTyping && (
            <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
              <div style={{
                width: 32,
                height: 32,
                borderRadius: 10,
                background: 'rgba(124, 58, 237, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                color: '#7C3AED',
              }}>
                <Bot style={{ width: 18, height: 18 }} />
              </div>
              <div style={{
                padding: '10px 16px',
                borderRadius: '4px 18px 18px 18px',
                background: 'var(--c-surface)',
                border: '1px solid var(--c-border)',
                display: 'flex',
                alignItems: 'center',
                gap: 5,
              }}>
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block', animation: 'bounce 1.2s infinite ease-in-out' }} />
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block', animation: 'bounce 1.2s infinite ease-in-out 0.2s' }} />
                <span className="typing-dot" style={{ width: 6, height: 6, borderRadius: '50%', background: '#7C3AED', display: 'inline-block', animation: 'bounce 1.2s infinite ease-in-out 0.4s' }} />
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Quick Question Prompts */}
        <div style={{
          padding: '8px 16px',
          background: 'var(--c-surface)',
          borderTop: '1px solid var(--c-border)',
          overflowX: 'auto',
          display: 'flex',
          gap: 8,
          whiteSpace: 'nowrap',
          scrollbarWidth: 'none',
        }}>
          {QUICK_PROMPTS.map((q, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(q)}
              style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '5px 12px',
                borderRadius: 16,
                background: 'var(--c-bg)',
                border: '1px solid var(--c-border)',
                color: 'var(--c-text-main)',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.15s ease',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.borderColor = '#8B5CF6'; e.currentTarget.style.color = '#7C3AED'; }}
              onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--c-border)'; e.currentTarget.style.color = 'var(--c-text-main)'; }}
            >
              {q}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          style={{
            padding: '12px 16px',
            background: 'var(--c-surface)',
            borderTop: '1px solid var(--c-border)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
          }}
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask a question about tickets, bookings, events..."
            style={{
              flex: 1,
              padding: '12px 16px',
              borderRadius: 12,
              border: '1.5px solid var(--c-border)',
              background: 'var(--c-bg)',
              color: 'var(--c-text-main)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => { e.target.style.borderColor = '#8B5CF6'; }}
            onBlur={(e) => { e.target.style.borderColor = 'var(--c-border)'; }}
          />

          <button
            type="submit"
            disabled={!input.trim()}
            style={{
              width: 44,
              height: 44,
              borderRadius: 12,
              background: input.trim() ? 'linear-gradient(135deg, #7C3AED 0%, #4F46E5 100%)' : 'var(--c-border)',
              color: '#FFFFFF',
              border: 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: input.trim() ? 'pointer' : 'default',
              transition: 'all 0.2s ease',
              boxShadow: input.trim() ? '0 4px 12px rgba(124, 58, 237, 0.3)' : 'none',
            }}
          >
            <Send style={{ width: 18, height: 18 }} />
          </button>
        </form>
      </div>
    </div>
  );
}
