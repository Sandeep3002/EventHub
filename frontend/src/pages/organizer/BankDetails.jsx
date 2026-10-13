import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { useAuth } from '../../context/AuthContext';
import { bookingService } from '../../services/bookingService';
import { CreditCard, Building2, Hash, User, Landmark, Save, CheckCircle2, AlertCircle } from 'lucide-react';

export default function BankDetails() {
  const { user } = useAuth();
  const sidebarRole = user?.role === 'organizer' ? 'organizer' : 'admin';

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [toast, setToast] = useState(null);
  const [form, setForm] = useState({
    payout_bank_name: '',
    payout_account_number: '',
    payout_ifsc: '',
    payout_beneficiary_name: '',
    razorpay_account_id: '',
  });

  useEffect(() => {
    bookingService.getPayoutSettings()
      .then(data => {
        const hasDetails = data.payout_status === 'active' || !!data.payout_bank_name;
        setIsEdit(hasDetails);
        setForm({
          payout_bank_name: data.payout_bank_name || '',
          payout_account_number: data.payout_account_number_masked || '',
          payout_ifsc: data.payout_ifsc || '',
          payout_beneficiary_name: data.payout_beneficiary_name || '',
          razorpay_account_id: data.razorpay_account_id || '',
        });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const showToast = (type, message) => {
    setToast({ type, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.payout_bank_name || !form.payout_account_number || !form.payout_ifsc || !form.payout_beneficiary_name) {
      showToast('error', 'Please fill in all required fields.');
      return;
    }
    setSaving(true);
    try {
      await bookingService.updatePayoutSettings({
        payout_bank_name: form.payout_bank_name,
        payout_account_number: form.payout_account_number,
        payout_ifsc: form.payout_ifsc,
        payout_beneficiary_name: form.payout_beneficiary_name,
        razorpay_account_id: form.razorpay_account_id || null,
      });
      showToast('success', 'Bank details saved successfully!');
      setIsEdit(true);
    } catch (err) {
      showToast('error', err.message || 'Failed to save bank details.');
    } finally {
      setSaving(false);
    }
  };

  const onChange = (field) => (e) => setForm(prev => ({ ...prev, [field]: e.target.value }));

  const fields = [
    { key: 'payout_bank_name', label: 'Bank Name', placeholder: 'e.g. State Bank of India', icon: Building2, required: true },
    { key: 'payout_account_number', label: 'Account Number', placeholder: 'Enter account number', icon: Hash, required: true },
    { key: 'payout_ifsc', label: 'IFSC Code', placeholder: 'e.g. SBIN0001234', icon: Landmark, required: true },
    { key: 'payout_beneficiary_name', label: 'Beneficiary Name', placeholder: 'Name as on bank account', icon: User, required: true },
    { key: 'razorpay_account_id', label: 'Razorpay Account ID', placeholder: 'acc_XXXXXXXXXXXXXX (optional)', icon: CreditCard, required: false },
  ];

  return (
    <div className="dashboard-layout">
      <Sidebar role={sidebarRole} />
      <main className="dashboard-content space-y-6">

        {/* Header */}
        <div style={{
          background: 'linear-gradient(135deg, #7c3aed 0%, #4f46e5 100%)',
          borderRadius: 16, padding: '28px 32px', color: 'white',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 }}>
            <CreditCard style={{ width: 26, height: 26 }} />
            <h1 style={{ fontSize: 22, fontWeight: 700 }}>{isEdit ? 'Edit Bank Details' : 'Add Bank Details'}</h1>
          </div>
          <p style={{ fontSize: 14, opacity: 0.85 }}>
            Configure your bank account for receiving payouts from ticket sales.
            {isEdit && <span style={{ display: 'block', marginTop: 4, fontSize: 12, opacity: 0.7 }}>Your bank details are already on file. You can update them below.</span>}
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
            borderRadius: 10, fontSize: 13, fontWeight: 600,
            background: toast.type === 'success' ? '#ecfdf5' : '#fef2f2',
            color: toast.type === 'success' ? '#059669' : '#dc2626',
            border: `1px solid ${toast.type === 'success' ? '#a7f3d0' : '#fecaca'}`,
          }}>
            {toast.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
            {toast.message}
          </div>
        )}

        {/* Form Card */}
        <div style={{
          background: 'white', borderRadius: 14, border: '1px solid #e2e8f0',
          padding: '32px', boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        }}>
          {loading ? (
            <div style={{ textAlign: 'center', padding: '48px 0' }}>
              <div style={{
                width: 32, height: 32, border: '3px solid #e2e8f0', borderTopColor: '#7c3aed',
                borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto',
              }} />
              <p style={{ color: '#94a3b8', fontSize: 13, marginTop: 12 }}>Loading bank details...</p>
            </div>
          ) : (
            <form onSubmit={handleSave}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                {fields.map(f => {
                  const Icon = f.icon;
                  return (
                    <div key={f.key}>
                      <label style={{ display: 'block', fontSize: 13, fontWeight: 600, color: '#334155', marginBottom: 6 }}>
                        {f.label} {f.required && <span style={{ color: '#ef4444' }}>*</span>}
                      </label>
                      <div style={{ position: 'relative' }}>
                        <div style={{
                          position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)',
                          color: '#94a3b8', pointerEvents: 'none',
                        }}>
                          <Icon size={16} />
                        </div>
                        <input
                          type="text"
                          value={form[f.key]}
                          onChange={onChange(f.key)}
                          placeholder={f.placeholder}
                          style={{
                            width: '100%', padding: '10px 12px 10px 38px', borderRadius: 10,
                            border: '1px solid #e2e8f0', fontSize: 14, color: '#0f172a',
                            outline: 'none', transition: 'border-color 0.15s',
                            background: '#fafbfc',
                          }}
                          onFocus={e => e.target.style.borderColor = '#7c3aed'}
                          onBlur={e => e.target.style.borderColor = '#e2e8f0'}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div style={{ marginTop: 28, display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: 8,
                    padding: '10px 24px', borderRadius: 10, border: 'none',
                    background: saving ? '#a78bfa' : '#7c3aed', color: 'white',
                    fontSize: 14, fontWeight: 600, cursor: saving ? 'not-allowed' : 'pointer',
                    boxShadow: '0 2px 8px rgba(124,58,237,0.25)', transition: 'background 0.15s',
                  }}
                >
                  <Save size={16} />
                  {saving ? 'Saving...' : isEdit ? 'Update Bank Details' : 'Save Bank Details'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Info Note */}
        <div style={{
          background: '#f5f3ff', borderRadius: 12, padding: '16px 20px',
          border: '1px solid #ede9fe', fontSize: 13, color: '#6b21a8', lineHeight: 1.6,
        }}>
          <strong>How payouts work:</strong> EventHub retains a 5% platform commission from each ticket sale.
          The remaining 95% is allocated to the organizer. Ensure your bank details are correct to receive timely payouts.
        </div>

      </main>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
