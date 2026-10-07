import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import Loading from '../../components/Loading';
import { Tag, PlusCircle, Hash } from 'lucide-react';
import Sidebar from '../../components/Sidebar';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    eventService.getCategories().then(cats => { setCategories(cats); setLoading(false); });
  }, []);

  const handleAdd = async (e) => {
    e.preventDefault();
    setAdding(true);
    try {
      const cat = await eventService.createCategory({ name: newName, slug: newSlug, icon: 'Tag' });
      setCategories(prev => [...prev, cat]);
      setNewName(''); setNewSlug('');
    } finally {
      setAdding(false);
    }
  };

  if (loading) return <Loading />;

  const categoryColors = ['#6366f1', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
      <div style={{ maxWidth: 900 }}>
      {/* Header */}
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{
            width: 44, height: 44, borderRadius: 12,
            background: 'linear-gradient(135deg, #059669, #34d399)',
            display: 'flex', alignItems: 'center', justifyContent: 'center'
          }}>
            <Tag style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#0f172a', margin: 0 }}>Manage Categories</h1>
            <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Create and organize event categories for the platform</p>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: '16px 22px',
        border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: 20,
        marginBottom: 24, boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <div style={{
          width: 40, height: 40, borderRadius: 10, background: '#ecfdf5',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          <Hash style={{ width: 18, height: 18, color: '#059669' }} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#94a3b8', textTransform: 'uppercase', margin: 0 }}>Total Categories</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: '#0f172a', margin: 0 }}>{categories.length}</p>
        </div>
      </div>

      {/* Add Category Form */}
      <div style={{
        background: '#fff', borderRadius: 14, padding: 24,
        border: '1px solid #e2e8f0', marginBottom: 24,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: '#0f172a', marginBottom: 16 }}>Add New Category</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Category Name</label>
            <input
              required value={newName} onChange={e => setNewName(e.target.value)}
              placeholder="e.g. Wellness"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 13, color: '#334155',
                outline: 'none', background: '#f8fafc'
              }}
            />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 11, fontWeight: 600, color: '#64748b', display: 'block', marginBottom: 6 }}>Slug</label>
            <input
              required value={newSlug} onChange={e => setNewSlug(e.target.value)}
              placeholder="e.g. wellness"
              style={{
                width: '100%', padding: '10px 14px', borderRadius: 10,
                border: '1px solid #e2e8f0', fontSize: 13, color: '#334155',
                outline: 'none', background: '#f8fafc'
              }}
            />
          </div>
          <button type="submit" disabled={adding} style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #059669, #34d399)',
            color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer',
            opacity: adding ? 0.6 : 1
          }}>
            <PlusCircle style={{ width: 16, height: 16 }} />
            {adding ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Categories Table */}
      <div style={{
        background: '#fff', borderRadius: 16, border: '1px solid #e2e8f0',
        overflow: 'hidden', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
      }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              {['#', 'Name', 'Slug'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '14px 20px', fontSize: 11, fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const color = categoryColors[i % categoryColors.length];
              return (
                <tr key={cat.id} style={{ borderBottom: '1px solid #f1f5f9', transition: 'background 0.15s' }}
                  onMouseEnter={e => e.currentTarget.style.background = '#f8fafc'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                  <td style={{ padding: '14px 20px', fontSize: 12, color: '#94a3b8', fontWeight: 600 }}>{i + 1}</td>
                  <td style={{ padding: '14px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 8, height: 8, borderRadius: '50%', background: color
                      }} />
                      <span style={{ fontSize: 13, fontWeight: 700, color: '#0f172a' }}>{cat.name}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 20px' }}>
                    <span style={{
                      fontFamily: 'monospace', fontSize: 12, color: '#64748b',
                      background: '#f1f5f9', padding: '3px 10px', borderRadius: 6
                    }}>{cat.slug}</span>
                  </td>
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
