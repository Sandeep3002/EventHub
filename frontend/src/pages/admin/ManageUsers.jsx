import React, { useState, useEffect } from 'react';
import { Users, Shield, Mail, UserCheck, Trash2 } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { request } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import {
  cardStyle, inputStyle, headingStyle, subTextStyle,
  tableHeadRowStyle, tableHeadCellStyle, tableBodyRowStyle, tableBodyCellStyle
} from '../../styles/pageStyles';

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
    superadmin: { bg: 'rgba(239, 68, 68, 0.12)', text: '#ef4444', border: 'rgba(239, 68, 68, 0.3)' },
    admin: { bg: 'rgba(245, 158, 11, 0.12)', text: '#f59e0b', border: 'rgba(245, 158, 11, 0.3)' },
    organizer: { bg: 'rgba(139, 92, 246, 0.12)', text: '#8b5cf6', border: 'rgba(139, 92, 246, 0.3)' },
    attendee: { bg: 'rgba(59, 130, 246, 0.12)', text: '#3b82f6', border: 'rgba(59, 130, 246, 0.3)' },
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
            <h1 style={headingStyle}>Manage Users</h1>
            <p style={subTextStyle}>View and manage all registered platform users</p>
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        {[
          { label: 'Total Users', value: stats.total, icon: Users, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
          { label: 'Active', value: stats.active, icon: UserCheck, color: '#059669', bg: 'rgba(5, 150, 105, 0.12)' },
          { label: 'Admins', value: stats.admins, icon: Shield, color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.12)' },
          { label: 'Organizers', value: stats.organizers, icon: Mail, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
        ].map((s, i) => (
          <div key={i} style={{ ...cardStyle, padding: '20px 22px', display: 'flex', alignItems: 'center', gap: 14 }}>
            <div style={{ width: 42, height: 42, borderRadius: 10, background: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <s.icon style={{ width: 20, height: 20, color: s.color }} />
            </div>
            <div>
              <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', margin: 0 }}>{s.label}</p>
              <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>{s.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div style={{ marginBottom: 16 }}>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search users by name or email..."
          style={{ ...inputStyle, maxWidth: 400 }} />
      </div>

      <div style={{ ...cardStyle, borderRadius: 16, overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={tableHeadRowStyle}>
              {['User', 'Email', 'Role', 'Status', 'Joined', ...(isSuperAdmin ? ['Actions'] : [])].map(h => (
                <th key={h} style={tableHeadCellStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => {
              const rc = roleColors[user.role] || roleColors.attendee;
              const isSelf = user.id === currentUser?.id;
              return (
                <tr key={user.id} style={tableBodyRowStyle}>
                  <td style={tableBodyCellStyle}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, #6366f1, #a78bfa)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14 }}>
                        {user.full_name?.charAt(0)}
                      </div>
                      <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-main)' }}>{user.full_name}</span>
                    </div>
                  </td>
                  <td style={{ ...tableBodyCellStyle, fontSize: 12, color: 'var(--c-text-muted)' }}>{user.email}</td>
                  <td style={tableBodyCellStyle}>
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
                  <td style={tableBodyCellStyle}>
                    {isSuperAdmin && !isSelf ? (
                      <button onClick={() => handleToggleActive(user.id)} style={{
                        display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, cursor: 'pointer', border: 'none',
                        background: user.is_active ? 'rgba(5, 150, 105, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: user.is_active ? '#059669' : '#ef4444',
                      }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.is_active ? '#059669' : '#ef4444' }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </button>
                    ) : (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20, background: user.is_active ? 'rgba(5, 150, 105, 0.12)' : 'rgba(239, 68, 68, 0.12)', color: user.is_active ? '#059669' : '#ef4444', border: `1px solid ${user.is_active ? 'rgba(5, 150, 105, 0.3)' : 'rgba(239, 68, 68, 0.3)'}` }}>
                        <span style={{ width: 6, height: 6, borderRadius: '50%', background: user.is_active ? '#059669' : '#ef4444' }} />
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    )}
                  </td>
                  <td style={{ ...tableBodyCellStyle, fontSize: 12, color: 'var(--c-text-muted)' }}>
                    {new Date(user.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  </td>
                  {isSuperAdmin && (
                    <td style={tableBodyCellStyle}>
                      {!isSelf && (
                        <button onClick={() => handleDelete(user.id)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(239, 68, 68, 0.3)', background: 'rgba(239, 68, 68, 0.08)', cursor: 'pointer' }}>
                          <Trash2 style={{ width: 14, height: 14, color: '#ef4444' }} />
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
