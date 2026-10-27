import React, { useState, useEffect } from 'react';
import { eventService } from '../../services/eventService';
import Loading from '../../components/Loading';
import { Tag, PlusCircle, Hash, Pencil, Trash2, X, Check } from 'lucide-react';
import Sidebar from '../../components/Sidebar';
import { cardStyle, inputStyle, labelStyle, headingStyle, subTextStyle, tableHeadRowStyle, tableHeadCellStyle, tableBodyRowStyle, tableBodyCellStyle } from '../../styles/pageStyles';

export default function ManageCategories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [newSlug, setNewSlug] = useState('');
  const [adding, setAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editName, setEditName] = useState('');
  const [editSlug, setEditSlug] = useState('');

  useEffect(() => {
    eventService.getCategories()
      .then(cats => { setCategories(Array.isArray(cats) ? cats : []); })
      .catch(err => { console.error('Failed to load categories:', err); setCategories([]); })
      .finally(() => { setLoading(false); });
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

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this category?')) return;
    try {
      await eventService.deleteCategory(id);
      setCategories(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      alert('Failed to delete: ' + err.message);
    }
  };

  const startEdit = (cat) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditSlug(cat.slug);
  };

  const handleUpdate = async () => {
    try {
      const updated = await eventService.updateCategory(editId, { name: editName, slug: editSlug, icon: 'Tag' });
      setCategories(prev => prev.map(c => c.id === editId ? updated : c));
      setEditId(null);
    } catch (err) {
      alert('Failed to update: ' + err.message);
    }
  };

  if (loading) return <Loading />;

  const categoryColors = ['#6366f1', '#059669', '#d97706', '#dc2626', '#7c3aed', '#0891b2', '#be185d', '#65a30d'];

  return (
    <div className="dashboard-layout">
      <Sidebar role="admin" />
      <main className="dashboard-content">
      <div style={{ maxWidth: 900 }}>
      <div style={{ marginBottom: 28 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 6 }}>
          <div style={{ width: 44, height: 44, borderRadius: 12, background: 'linear-gradient(135deg, #059669, #34d399)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag style={{ width: 22, height: 22, color: '#fff' }} />
          </div>
          <div>
            <h1 style={headingStyle}>Manage Categories</h1>
            <p style={subTextStyle}>Create, edit and delete event categories</p>
          </div>
        </div>
      </div>

      {/* Stat card */}
      <div style={{ ...cardStyle, padding: '16px 22px', display: 'flex', alignItems: 'center', gap: 20, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: 10, background: 'rgba(5,150,105,0.12)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Hash style={{ width: 18, height: 18, color: '#059669' }} />
        </div>
        <div>
          <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--c-text-muted)', textTransform: 'uppercase', margin: 0 }}>Total Categories</p>
          <p style={{ fontSize: 22, fontWeight: 800, color: 'var(--c-text-main)', margin: 0 }}>{categories.length}</p>
        </div>
      </div>

      {/* Add form */}
      <div style={{ ...cardStyle, padding: 24, marginBottom: 24 }}>
        <h3 style={{ fontSize: 14, fontWeight: 700, color: 'var(--c-text-main)', marginBottom: 16 }}>Add New Category</h3>
        <form onSubmit={handleAdd} style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Category Name</label>
            <input required value={newName} onChange={e => setNewName(e.target.value)} placeholder="e.g. Wellness" style={inputStyle} />
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={labelStyle}>Slug</label>
            <input required value={newSlug} onChange={e => setNewSlug(e.target.value)} placeholder="e.g. wellness" style={inputStyle} />
          </div>
          <button type="submit" disabled={adding} style={{
            display: 'flex', alignItems: 'center', gap: 6, padding: '10px 20px', borderRadius: 10, border: 'none',
            background: 'linear-gradient(135deg, #059669, #34d399)', color: '#fff', fontSize: 13, fontWeight: 700, cursor: 'pointer', opacity: adding ? 0.6 : 1
          }}>
            <PlusCircle style={{ width: 16, height: 16 }} />
            {adding ? 'Adding...' : 'Add Category'}
          </button>
        </form>
      </div>

      {/* Table */}
      <div style={{ ...cardStyle, overflow: 'hidden', borderRadius: 16 }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
          <thead>
            <tr style={tableHeadRowStyle}>
              {['#', 'Name', 'Slug', 'Actions'].map(h => (
                <th key={h} style={tableHeadCellStyle}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {categories.map((cat, i) => {
              const color = categoryColors[i % categoryColors.length];
              const isEditing = editId === cat.id;
              return (
                <tr key={cat.id} style={tableBodyRowStyle}>
                  <td style={{ ...tableBodyCellStyle, fontSize: 12, color: 'var(--c-text-muted)', fontWeight: 600 }}>{i + 1}</td>
                  <td style={tableBodyCellStyle}>
                    {isEditing ? (
                      <input value={editName} onChange={e => setEditName(e.target.value)}
                        style={{ ...inputStyle, padding: '6px 10px', fontSize: 13 }} />
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: color }} />
                        <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--c-text-main)' }}>{cat.name}</span>
                      </div>
                    )}
                  </td>
                  <td style={tableBodyCellStyle}>
                    {isEditing ? (
                      <input value={editSlug} onChange={e => setEditSlug(e.target.value)}
                        style={{ ...inputStyle, padding: '6px 10px', fontSize: 13, fontFamily: 'monospace' }} />
                    ) : (
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: 'var(--c-text-muted)', background: 'var(--c-bg)', padding: '3px 10px', borderRadius: 6 }}>{cat.slug}</span>
                    )}
                  </td>
                  <td style={tableBodyCellStyle}>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {isEditing ? (
                        <>
                          <button onClick={handleUpdate} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(5,150,105,0.3)', background: 'rgba(5,150,105,0.1)', cursor: 'pointer' }}>
                            <Check style={{ width: 14, height: 14, color: '#059669' }} />
                          </button>
                          <button onClick={() => setEditId(null)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)', cursor: 'pointer' }}>
                            <X style={{ width: 14, height: 14, color: 'var(--c-text-muted)' }} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button onClick={() => startEdit(cat)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid var(--c-border)', background: 'var(--c-bg)', cursor: 'pointer' }}>
                            <Pencil style={{ width: 14, height: 14, color: '#6366f1' }} />
                          </button>
                          <button onClick={() => handleDelete(cat.id)} style={{ padding: '6px 8px', borderRadius: 8, border: '1px solid rgba(220,38,38,0.3)', background: 'rgba(220,38,38,0.08)', cursor: 'pointer' }}>
                            <Trash2 style={{ width: 14, height: 14, color: '#dc2626' }} />
                          </button>
                        </>
                      )}
                    </div>
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
