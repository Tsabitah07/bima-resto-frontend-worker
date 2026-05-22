import React, { useEffect, useState } from 'react';
import { menusAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, UtensilsCrossed, Image, Upload, X as XIcon } from 'lucide-react';

const BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000';
const EMPTY_FORM = { name: '', start_date: '', end_date: '' };

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null);
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [posterModal, setPosterModal] = useState(null);
  const [uploading, setUploading] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await menusAPI.getAll();
      setMenus(res.data.data || []);
    } catch { toast.error('Failed to load menus'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const toISO = (d) => d ? new Date(d).toISOString() : '';
  const toDate = (d) => d ? new Date(d).toISOString().slice(0, 10) : '';

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (m) => { setSelected(m); setForm({ name: m.name, start_date: toDate(m.start_date), end_date: toDate(m.end_date) }); setModal('edit'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      const payload = { name: form.name, start_date: toISO(form.start_date), end_date: toISO(form.end_date) };
      if (modal === 'create') {
        await menusAPI.create(payload);
        toast.success('Menu created');
      } else {
        await menusAPI.update(selected.id, payload);
        toast.success('Menu updated');
      }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await menusAPI.delete(deleteTarget.id);
      toast.success('Menu deleted');
      setDeleteTarget(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const handleUploadPoster = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      await menusAPI.uploadPoster(posterModal.id, file);
      toast.success('Poster uploaded');
      load();
      // refresh the modal menu
      const updated = await menusAPI.getById(posterModal.id);
      setPosterModal(updated.data.data);
    } catch (e) { toast.error(e.response?.data?.detail || 'Upload failed'); }
    finally { setUploading(false); }
  };

  const handleDeletePoster = async (posterId) => {
    try {
      await menusAPI.deletePoster(posterId);
      toast.success('Poster deleted');
      const updated = await menusAPI.getById(posterModal.id);
      setPosterModal(updated.data.data);
      load();
    } catch (e) { toast.error('Failed to delete poster'); }
  };

  const filtered = menus.filter(m => m.name?.toLowerCase().includes(search.toLowerCase()));

  const formBody = (
    <div className="form-grid">
      <div className="form-group">
        <label>Menu Name</label>
        <input placeholder="Weekly Special Menu" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Start Date</label>
        <input type="date" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>End Date</label>
        <input type="date" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Menus</h1>
          <p className="page-subtitle">{menus.length} menus available</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add Menu
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={16} />
            <input placeholder="Search menus..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><UtensilsCrossed size={32} /><p>No menus found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Start Date</th>
                  <th>End Date</th>
                  <th>Posters</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(m => (
                  <tr key={m.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{m.id}</td>
                    <td style={{ fontWeight: 500 }}>{m.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(m.start_date).toLocaleDateString()}</td>
                    <td style={{ color: 'var(--text2)' }}>{new Date(m.end_date).toLocaleDateString()}</td>
                    <td>
                      <button className="btn btn-ghost btn-sm" onClick={() => setPosterModal(m)}>
                        <Image size={14} />
                        <span style={{ fontSize: 12, color: 'var(--text3)' }}>{(m.posters || []).length}</span>
                      </button>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(m)}><Pencil size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(m)}><Trash2 size={14} /></button>
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
        title={modal === 'create' ? 'Add Menu' : 'Edit Menu'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save'}
            </button>
          </>
        }
      >{formBody}</Modal>

      {/* Poster Modal */}
      <Modal isOpen={!!posterModal} onClose={() => setPosterModal(null)} title={`Posters — ${posterModal?.name}`}>
        <div style={{ marginBottom: 16 }}>
          <label htmlFor="poster-upload" className="btn btn-secondary" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            {uploading ? <span className="spinner" style={{ width: 16, height: 16 }} /> : <Upload size={15} />}
            Upload Poster
          </label>
          <input id="poster-upload" type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadPoster} />
        </div>
        {(posterModal?.posters || []).length === 0 ? (
          <div className="empty-state" style={{ padding: '30px 0' }}><Image size={28} /><p>No posters yet</p></div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12 }}>
            {(posterModal?.posters || []).map(p => (
              <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', aspectRatio: '4/3', background: 'var(--bg3)' }}>
                <img src={`${BASE_URL}/${p.poster_path}`} alt="poster" style={{ width: '100%', height: '100%', objectFit: 'cover' }} onError={e => { e.target.style.display = 'none'; }} />
                <button
                  className="btn btn-danger btn-sm"
                  style={{ position: 'absolute', top: 8, right: 8, padding: '4px' }}
                  onClick={() => handleDeletePoster(p.id)}
                >
                  <XIcon size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </Modal>

      <ConfirmDelete isOpen={!!deleteTarget} onClose={() => setDeleteTarget(null)} onConfirm={handleDelete} itemName={deleteTarget?.name} loading={deleting} />
    </div>
  );
}
