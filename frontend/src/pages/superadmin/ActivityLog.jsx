import React, { useState, useEffect } from 'react';
import Sidebar from '../../components/Sidebar';
import { activityService } from '../../services/activityService';
import { Activity, Search, Clock, Filter, PlusCircle, Edit3, Trash2, CheckCircle2, XCircle, UserPlus, Users } from 'lucide-react';

const ACTION_ICONS = {
  created_event: { icon: PlusCircle, color: '#3b82f6', bg: '#eff6ff', label: 'Created Event' },
  updated_event: { icon: Edit3, color: '#f59e0b', bg: '#fffbeb', label: 'Updated Event' },
  deleted_event: { icon: Trash2, color: '#ef4444', bg: '#fef2f2', label: 'Deleted Event' },
  published_event: { icon: CheckCircle2, color: '#10b981', bg: '#ecfdf5', label: 'Published Event' },
  unpublished_event: { icon: XCircle, color: '#64748b', bg: '#f8fafc', label: 'Unpublished Event' },
  new_registration: { icon: UserPlus, color: '#8b5cf6', bg: '#f5f3ff', label: 'New Registration' },
  deleted_registration: { icon: Trash2, color: '#ef4444', bg: '#fef2f2', label: 'Deleted Registration' },
  created_category: { icon: PlusCircle, color: '#06b6d4', bg: '#ecfeff', label: 'Created Category' },
  deleted_category: { icon: Trash2, color: '#ef4444', bg: '#fef2f2', label: 'Deleted Category' },
  created_venue: { icon: PlusCircle, color: '#14b8a6', bg: '#f0fdfa', label: 'Created Venue' },
  user_login: { icon: Users, color: '#6366f1', bg: '#eef2ff', label: 'User Login' },
  user_registered: { icon: UserPlus, color: '#10b981', bg: '#ecfdf5', label: 'User Registered' },
};

export default function ActivityLog() {
  const [activities, setActivities] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionFilter, setActionFilter] = useState('all');

  useEffect(() => {
    async function load() {
      try {
        const data = await activityService.getActivities(200);
        setActivities(data.activities || []);
        setTotal(data.total || 0);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filtered = activities.filter(a => {
    const matchSearch = !search ||
      (a.actor_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.target_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (a.details || '').toLowerCase().includes(search.toLowerCase());
    const matchAction = actionFilter === 'all' || a.action === actionFilter;
    return matchSearch && matchAction;
  });

  const formatDate = (ts) => {
    try { return new Date(ts).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return '-'; }
  };

  const uniqueActions = [...new Set(activities.map(a => a.action))];

  return (
    <div className="dashboard-layout">
      <Sidebar role="superadmin" />
      <main className="dashboard-content space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-6 h-6 text-purple-600" />
            Activity Log
          </h1>
          <p className="text-xs text-slate-500 mt-1">Complete history of all admin actions on the platform</p>
        </div>

        {/* Filters */}
        <div className="flex gap-3 items-center">
          <div className="flex-1 flex items-center gap-2 bg-white border border-slate-200 rounded-lg px-3 py-2.5">
            <Search className="w-4 h-4 text-slate-400" />
            <input type="text" placeholder="Search by admin name, target, or details..." value={search}
              onChange={e => setSearch(e.target.value)}
              className="border-none outline-none bg-transparent text-sm text-slate-700 w-full" />
          </div>
          <select value={actionFilter} onChange={e => setActionFilter(e.target.value)}
            className="form-select text-xs py-2.5 w-auto">
            <option value="all">All Actions</option>
            {uniqueActions.map(a => (
              <option key={a} value={a}>{(ACTION_ICONS[a]?.label) || a}</option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-slate-400">Loading activities...</div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-slate-400">
              <Activity className="w-10 h-10 mx-auto mb-3 text-slate-300" />
              <p className="font-semibold">No activities found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="custom-table">
                <thead>
                  <tr>
                    <th>Admin</th>
                    <th>Action</th>
                    <th>Target</th>
                    <th>Details</th>
                    <th>Time</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(a => {
                    const cfg = ACTION_ICONS[a.action] || { icon: Activity, color: '#64748b', bg: '#f8fafc', label: a.action };
                    const Icon = cfg.icon;
                    return (
                      <tr key={a.id}>
                        <td>
                          <div className="font-semibold text-slate-900">{a.actor_name}</div>
                          <div className="text-[11px] text-slate-400">{a.actor_role}</div>
                        </td>
                        <td>
                          <span style={{
                            display: 'inline-flex', alignItems: 'center', gap: '6px',
                            padding: '4px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: 600,
                            background: cfg.bg, color: cfg.color,
                          }}>
                            <Icon style={{ width: '13px', height: '13px' }} />
                            {cfg.label}
                          </span>
                        </td>
                        <td>
                          <div className="font-medium text-slate-800">{a.target_name}</div>
                          <div className="text-[11px] text-slate-400">{a.target_type}</div>
                        </td>
                        <td className="text-xs text-slate-500 max-w-[200px] truncate">{a.details || '-'}</td>
                        <td>
                          <div className="text-xs text-slate-500 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatDate(a.timestamp)}
                          </div>
                        </td>
                        <td>
                          <span style={{
                            padding: '3px 12px', borderRadius: '20px', fontSize: '11px', fontWeight: 600,
                            background: a.status === 'success' ? '#ecfdf5' : '#fef2f2',
                            color: a.status === 'success' ? '#10b981' : '#ef4444',
                          }}>
                            {a.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
          <div className="px-5 py-3 border-t border-slate-100 bg-slate-50 text-xs text-slate-400">
            Showing {filtered.length} of {total} activities
          </div>
        </div>
      </main>
    </div>
  );
}
