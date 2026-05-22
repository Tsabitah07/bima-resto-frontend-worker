import React, { useEffect, useState } from 'react';
import { bookingSessionsAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Clock } from 'lucide-react';

const EMPTY_FORM = { name: '', time: '' };

export default function BookingSessions() {
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
      const res = await bookingSessionsAPI.getAll();
      setSessions(res.data.data || []);
    } catch { toast.error('Failed to load sessions'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (s) => { setSelected(s); setForm({ name: s.name, time: s.time }); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') { await bookingSessionsAPI.create(form); toast.success('Session created'); }
      else { await bookingSessionsAPI.update(selected.id, form); toast.success('Session updated'); }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await bookingSessionsAPI.delete(deleteTarget.id);
      toast.success('Session deleted');
      setDeleteTarget(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = sessions.filter(s =>
    s.name?.toLowerCase().includes(search.toLowerCase()) ||
    s.time?.toLowerCase().includes(search.toLowerCase())
  );

  const formBody = (
    <div className="form-grid">
      <div className="form-group">
        <label>Session Name</label>
        <input placeholder="Makan Siang" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Time</label>
        <input placeholder="12:00 - 14:00" value={form.time} onChange={e => setForm(f => ({ ...f, time: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Booking Sessions</h1>
          <p className="page-subtitle">{sessions.length} time slots configured</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Session
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={16} />
            <input placeholder="Search sessions..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><Clock size={32} /><p>No sessions found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Session Name</th>
                  <th>Time</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => (
                  <tr key={s.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{s.id}</td>
                    <td style={{ fontWeight: 500 }}>{s.name}</td>
                    <td>
                      <span className="badge badge-confirmed" style={{ fontSize: 12 }}>
                        <Clock size={11} /> {s.time}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(s)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(s)}><Trash2 size={14} /></button>
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
        title={modal === 'create' ? 'Add Session' : 'Edit Session'}
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
