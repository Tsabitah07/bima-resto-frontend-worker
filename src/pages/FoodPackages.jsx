import React, { useEffect, useState } from 'react';
import { foodPackagesAPI, menusAPI, bookingSessionsAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Package } from 'lucide-react';

const EMPTY_FORM = { name: '', description: '', menu_id: '', session_id: '', available_quantity: '' };

export default function FoodPackages() {
  const [packages, setPackages] = useState([]);
  const [menus, setMenus] = useState([]);
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [p, m, s] = await Promise.all([foodPackagesAPI.getAll(), menusAPI.getAll(), bookingSessionsAPI.getAll()]);
      setPackages(p.data.data || []);
      setMenus(m.data.data || []);
      setSessions(s.data.data || []);
    } catch { toast.error('Failed to load food packages'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (p) => {
    setSelected(p);
    setForm({ name: p.name, description: p.description, menu_id: p.menu_id, session_id: p.session_id, available_quantity: p.available_quantity });
    setModal('edit');
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { ...form, menu_id: Number(form.menu_id), session_id: Number(form.session_id), available_quantity: Number(form.available_quantity) };
      if (modal === 'create') { await foodPackagesAPI.create(payload); toast.success('Food package created'); }
      else { await foodPackagesAPI.update(selected.id, payload); toast.success('Food package updated'); }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await foodPackagesAPI.delete(deleteTarget.id);
      toast.success('Food package deleted');
      setDeleteTarget(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const menuName = (id) => menus.find(m => m.id === id)?.name || `Menu #${id}`;
  const sessionName = (id) => sessions.find(s => s.id === id)?.name || `Session #${id}`;

  const filtered = packages.filter(p =>
    p.name?.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  const formBody = (
    <div className="form-grid">
      <div className="form-group">
        <label>Package Name</label>
        <input placeholder="Paket Nusantara" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Description</label>
        <textarea rows={3} placeholder="Describe the food package..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} style={{ resize: 'vertical' }} />
      </div>
      <div className="form-group">
        <label>Menu</label>
        <select value={form.menu_id} onChange={e => setForm(f => ({ ...f, menu_id: e.target.value }))}>
          <option value="">Select menu...</option>
          {menus.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Booking Session</label>
        <select value={form.session_id} onChange={e => setForm(f => ({ ...f, session_id: e.target.value }))}>
          <option value="">Select session...</option>
          {sessions.map(s => <option key={s.id} value={s.id}>{s.name} — {s.time}</option>)}
        </select>
      </div>
      <div className="form-group">
        <label>Available Quantity</label>
        <input type="number" min="0" placeholder="50" value={form.available_quantity} onChange={e => setForm(f => ({ ...f, available_quantity: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Food Packages</h1>
          <p className="page-subtitle">{packages.length} packages configured</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Package
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={16} />
            <input placeholder="Search packages..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Package size={32} /><p>No food packages found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Description</th>
                  <th>Menu</th>
                  <th>Session</th>
                  <th>Qty</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => (
                  <tr key={p.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{p.id}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td style={{ color: 'var(--text2)', maxWidth: 200 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.description}</div>
                    </td>
                    <td><span className="badge badge-pending" style={{ fontSize: 11 }}>{menuName(p.menu_id)}</span></td>
                    <td style={{ color: 'var(--text2)' }}>{sessionName(p.session_id)}</td>
                    <td style={{ color: 'var(--text2)' }}>{p.available_quantity}</td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(p)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(p)}><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <Modal isOpen={modal === 'create' || modal === 'edit'} onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add Food Package' : 'Edit Food Package'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save'}
            </button>
          </>
        }
      >{formBody}</Modal>

      <ConfirmDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name} loading={deleting} />
    </div>
  );
}
