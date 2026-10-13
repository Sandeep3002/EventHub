import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, UserCheck, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { request } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

export default function ManageUsers() {
  const { user: currentUser } = useAuth();
  const [allUsers, setAllUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    request('/users', {}, []).then(u => {
      setAllUsers(Array.isArray(u) ? u : []);
      setLoading(false);
    });
  }, []);

  const filteredUsers = allUsers.filter(u =>
    u.full_name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const stats = {
    total: allUsers.length,
    active: allUsers.filter(u => u.is_active).length,
    admins: allUsers.filter(u => u.role === 'admin' || u.role === 'superadmin').length,
    organizers: allUsers.filter(u => u.role === 'organizer').length,
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      const updated = await request(`/users/${userId}/role`, {
        method: 'PUT',
        body: JSON.stringify({ role: newRole }),
      });
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
    } catch (err) {
      alert('Failed to change role: ' + err.message);
    }
  };

  const handleToggleActive = async (userId) => {
    try {
      const updated = await request(`/users/${userId}/toggle-active`, { method: 'PUT' });
      setAllUsers(prev => prev.map(u => u.id === userId ? { ...u, ...updated } : u));
    } catch (err) {
      alert('Failed to toggle status: ' + err.message);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Delete this user permanently?')) return;
    try {
      await request(`/users/${userId}`, { method: 'DELETE' });
      setAllUsers(prev => prev.filter(u => u.id !== userId));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const roleColors = {
    superadmin: { bg: '#fef2f2', text: '#dc2626', border: '#fecaca' },
    admin: { bg: '#fef3c7', text: '#b45309', border: '#fde68a' },
    organizer: { bg: '#f3e8ff', text: '#7c3aed', border: '#e9d5ff' },
    attendee: { bg: '#eff6ff', text: '#2563eb', border: '#bfdbfe' },
  };

  const isSuperAdmin = currentUser?.role === 'superadmin';

  return (
    <div className="dashboard-layout">
      <Sidebar role={isSuperAdmin ? 'superadmin' : 'admin'} />
      <main className="dashboard-content">
      <div style={{ maxWidth: 1200 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Users style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Users</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>View and manage all registered platform users</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#6366f1', bg: '#eef2ff' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: '#059669', bg: '#ecfdf5' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: '#b45309', bg: '#fef3c7' },
          { label: 'Organizers', value: stats.organizers, icon: Mail, color: '#7c3aed', bg: '#f3e8ff' },
        ].map((s, i) => (
          <div key={i} style={{ background: '#fff', borderRadius: 14, padding: '20px 22px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 14, boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: 20, height: 20, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..."
          style={{ width: '100%', maxWidth: 400, padding: '10px 16px', borderRadius: 10, border: '1px solid #e2e8f0', fontSize: 13, outline: 'none', background: '#f8fafc' }} />
      </div>

      <div style={{ background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['User', 'Email', 'Role', 'Status', 'Joined', ...(isSuperAdmin ? ['Actions'] : [])].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const rc = roleColors[user.role] || roleColors.attendee;
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                        {user.full_name?.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{user.full_name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 12, color: '#64748b' }}>{user.email}</td>
                  <td style={{ padding: '16px 20px' }}>
                    {isSuperAdmin && !isSelf ? (
                      <select value={user.role} onChange={e => handleRoleChange(user.id, e.target.value)}
                        style={{ fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '4px 8px', borderRadius: 8, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}`, cursor: 'pointer' }}>
                        {['attendee', 'organizer', 'admin', 'superadmin'].map(r => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    ) : (
                      <span style={{ display: 'inline-block', fontSize: 11, fontWeight: 700, textTransform: 'capitalize', padding: '4px 12px', borderRadius: 20, background: rc.bg, color: rc.text, border: `1px solid ${rc.border}` }}>{user.role}</span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px' }}>
                    {isSuperAdmin && !isSelf ? (
                      <button onClick={() => handleToggleActive(user.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: 'none',
                        background: user.is_active ? '#ecfdf5' : '#fef2f2', color: user.is_active ? '#059669' : '#dc2626',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.is_active ? '#059669' : '#dc2626' }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: user.is_active ? '#ecfdf5' : '#fef2f2', color: user.is_active ? '#059669' : '#dc2626', border: `1px solid ${user.is_active ? '#a7f3d0' : '#fecaca'}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.is_active ? '#059669' : '#dc2626' }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '16px 20px', fontSize: 12, color: '#94a3b8' }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isSuperAdmin && (
                    <td style={{ padding: '16px 20px' }}>
                      {!isSelf && (
                        <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid #fecaca', background: '#fef2f2', cursor: 'pointer' }}>
                          <Trash2 style={{ width: 14, height: 14, color: '#dc2626' }} />
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      </div>
      </main>
    </div>
  );
}
