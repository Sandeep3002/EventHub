import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { request } from '../../services/api';
import { CreditCard, Landmark, Search, ShieldCheck, CheckCircle2, AlertCircle, Building2 } from 'lucide-react';

export default function SuperAdminBankDetails() {
  const [organizers, setOrganizers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, pending

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await request('/stats/superadmin');
        setOrganizers(stats?.admin_users || []);
      } catch (err) {
        console.error('Failed to load bank details:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  const filtered = organizers.filter(org => {
    const matchesSearch =
      (org.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.email || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.payout_bank_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (org.payout_ifsc || '').toLowerCase().includes(search.toLowerCase());

    const isConfigured = org.payout_status === 'active';
    if (filter === 'active') return matchesSearch && isConfigured;
    if (filter === 'pending') return matchesSearch && !isConfigured;
    return matchesSearch;
  });

  const configuredCount = organizers.filter(o => o.payout_status === 'active').length;

  return (
    <div className="dashboard-layout">
      <Sidebar role="superadmin" />
      <main className="dashboard-content space-y-6">
        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: '16px', padding: '28px 32px', color: 'white',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
              <CreditCard style={{ width: '28px', height: '28px' }} />
              <h1 style={{ fontSize: '24px', fontWeight: 700 }}>Organizer Bank Details</h1>
            </div>
            <p style={{ fontSize: '14px', opacity: 0.85 }}>
              Review payout accounts and bank credentials configured by event organizers.
            </p>
          </div>
          <div style={{
            background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(8px)',
            borderRadius: '12px', padding: '12px 20px', textAlign: 'center',
          }}>
            <p style={{ fontSize: '12px', opacity: 0.9 }}>Active Accounts</p>
            <p style={{ fontSize: '22px', fontWeight: 700 }}>{configuredCount} / {organizers.length}</p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex-1 w-full flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5 shadow-sm">
            <Search className="w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by organizer name, email, bank name, or IFSC..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-slate-700 w-full"
            />
          </div>

          <div className="flex gap-2 shrink-0">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${filter === 'all' ? 'bg-purple-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              All ({organizers.length})
            </button>
            <button
              onClick={() => setFilter('active')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${filter === 'active' ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Configured ({configuredCount})
            </button>
            <button
              onClick={() => setFilter('pending')}
              className={`px-3 py-2 rounded-lg text-xs font-semibold transition ${filter === 'pending' ? 'bg-amber-600 text-white' : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'}`}
            >
              Not Configured ({organizers.length - configuredCount})
            </button>
          </div>
        </div>

        {/* Bank Details Table */}
        <div style={{
          background: 'white', borderRadius: '14px', border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px rgba(0,0,0,0.04)', overflow: 'hidden'
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '60px 0' }}>
              <div style={{ width: '36px', height: '36px', border: '3px solid #e2e8f0', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              <p style={{ color: '#94a3b8', fontSize: '13px', marginTop: '12px' }}>Loading organizer bank accounts...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 0', color: '#94a3b8' }}>
              <Landmark style={{ width: '40px', height: '40px', margin: '0 auto 12px', opacity: 0.4 }} />
              <p style={{ fontSize: '15px', fontWeight: 600 }}>No organizer bank details found</p>
              <p style={{ fontSize: '13px' }}>Try adjusting your search or filter</p>
            </div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
                <thead>
                  <tr style={{ borderBottom: '2px solid #f1f5f9', background: '#f8fafc' }}>
                    {['Organizer', 'Email', 'Bank Name', 'Account Number', 'IFSC Code', 'Beneficiary Name', 'Payout Status'].map(h => (
                      <th key={h} style={{ padding: '14px 16px', textAlign: 'left', fontWeight: 600, color: '#475569', whiteSpace: 'nowrap' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(u => {
                    const configured = u.payout_status === 'active';
                    return (
                      <tr key={u.id} style={{ borderBottom: '1px solid #f1f5f9' }}
                        onMouseEnter={e => e.currentTarget.style.background = '#fafbfc'}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                      >
                        <td style={{ padding: '14px 16px', fontWeight: 600, color: '#0f172a', whiteSpace: 'nowrap' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                            <div style={{
                              width: '32px', height: '32px', borderRadius: '50%', background: '#7c3aed',
                              color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontWeight: 700, fontSize: '13px'
                            }}>
                              {(u.full_name || 'O')[0].toUpperCase()}
                            </div>
                            <span>{u.full_name}</span>
                          </div>
                        </td>
                        <td style={{ padding: '14px 16px', color: '#64748b' }}>{u.email}</td>
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontWeight: 500 }}>
                          {u.payout_bank_name ? (
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <Building2 style={{ width: '15px', height: '15px', color: '#7c3aed' }} />
                              {u.payout_bank_name}
                            </span>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontFamily: 'monospace', fontWeight: 600 }}>
                          {u.payout_account_number_masked || '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0f172a', fontFamily: 'monospace' }}>
                          {u.payout_ifsc || '—'}
                        </td>
                        <td style={{ padding: '14px 16px', color: '#0f172a' }}>
                          {u.payout_beneficiary_name || '—'}
                        </td>
                        <td style={{ padding: '14px 16px' }}>
                          <span style={{
                            padding: '4px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: configured ? '#ecfdf5' : '#f8fafc',
                            color: configured ? '#10b981' : '#94a3b8',
                            border: configured ? '1px solid #a7f3d0' : '1px solid #e2e8f0',
                            display: 'inline-flex', alignItems: 'center', gap: '4px'
                          }}>
                            {configured ? (
                              <><CheckCircle2 style={{ width: '12px', height: '12px' }} /> Active</>
                            ) : (
                              <><AlertCircle style={{ width: '12px', height: '12px' }} /> Not Configured</>
                            )}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
