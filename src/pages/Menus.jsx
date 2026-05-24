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
    const [pendingImages, setPendingImages] = useState([]);
    const [imagePreviews, setImagePreviews] = useState([]);
    // For edit modal: existing posters from server
    const [existingPosters, setExistingPosters] = useState([]);
    const [uploadingEdit, setUploadingEdit] = useState(false);

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
    const today = new Date().toISOString().slice(0, 10);

    const openCreate = () => {
        setForm(EMPTY_FORM);
        setSelected(null);
        setPendingImages([]);
        setImagePreviews([]);
        setExistingPosters([]);
        setModal('create');
    };

    const openEdit = (m) => {
        setSelected(m);
        setForm({ name: m.name, start_date: toDate(m.start_date), end_date: toDate(m.end_date) });
        setPendingImages([]);
        setImagePreviews([]);
        setExistingPosters(m.posters || []);
        setModal('edit');
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            const payload = { name: form.name, start_date: toISO(form.start_date), end_date: toISO(form.end_date) };
            let menuId;
            if (modal === 'create') {
                const res = await menusAPI.create(payload);
                menuId = res.data.data?.id || res.data.id;
                toast.success('Menu created');
            } else {
                await menusAPI.update(selected.id, payload);
                menuId = selected.id;
                toast.success('Menu updated');
            }
            if (pendingImages.length > 0) {
                await Promise.all(pendingImages.map(file => menusAPI.uploadPoster(menuId, file)));
                toast.success(`${pendingImages.length} image${pendingImages.length > 1 ? 's' : ''} uploaded`);
            }
            setModal(null);
            setPendingImages([]);
            setImagePreviews([]);
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

    const handleFormImagePick = (e) => {
        const files = Array.from(e.target.files);
        if (!files.length) return;
        setPendingImages(prev => [...prev, ...files]);
        const newPreviews = files.map(f => URL.createObjectURL(f));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        e.target.value = '';
    };

    const removeFormImage = (idx) => {
        URL.revokeObjectURL(imagePreviews[idx]);
        setPendingImages(prev => prev.filter((_, i) => i !== idx));
        setImagePreviews(prev => prev.filter((_, i) => i !== idx));
    };

    // Delete an existing poster from edit modal
    const handleDeleteExistingPoster = async (posterId) => {
        try {
            await menusAPI.deletePoster(posterId);
            setExistingPosters(prev => prev.filter(p => p.id !== posterId));
            toast.success('Poster removed');
            load();
        } catch (e) { toast.error('Failed to delete poster'); }
    };

    // Upload new poster directly from edit modal (instant)
    const handleEditUploadPoster = async (e) => {
        const files = Array.from(e.target.files);
        if (!files.length || !selected) return;
        setUploadingEdit(true);
        try {
            await Promise.all(files.map(file => menusAPI.uploadPoster(selected.id, file)));
            toast.success(`${files.length} poster${files.length > 1 ? 's' : ''} uploaded`);
            // Refresh existing posters in modal
            const updated = await menusAPI.getById(selected.id);
            setExistingPosters(updated.data.data?.posters || []);
            load();
        } catch (e) { toast.error(e.response?.data?.detail || 'Upload failed'); }
        finally { setUploadingEdit(false); e.target.value = ''; }
    };

    // Standalone poster modal handlers
    const handleUploadPoster = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            await menusAPI.uploadPoster(posterModal.id, file);
            toast.success('Poster uploaded');
            load();
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

    const posterSection = (
        <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ marginBottom: 8, display: 'block' }}>
                Posters / Images{' '}
                <span style={{ color: 'var(--text3)', fontWeight: 400, textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>

            {/* Existing posters — only shown in edit mode */}
            {modal === 'edit' && existingPosters.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                    <p style={{ fontSize: 12, color: 'var(--text3)', marginBottom: 8 }}>Existing posters</p>
                    <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                        {existingPosters.map(p => (
                            <div key={p.id} style={{ position: 'relative', width: 90, height: 68, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg3)' }}>
                                <img
                                    src={`${BASE_URL}/${p.poster_path}`}
                                    alt="poster"
                                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    onError={e => { e.target.style.display = 'none'; }}
                                />
                                <button
                                    type="button"
                                    onClick={() => handleDeleteExistingPoster(p.id)}
                                    style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(220,53,69,0.85)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                                >
                                    <XIcon size={11} color="#fff" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Upload area */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                {modal === 'edit' ? (
                    // In edit mode: upload instantly
                    <>
                        <label
                            htmlFor="edit-poster-upload"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, border: '1px dashed var(--border)', color: 'var(--text2)', fontSize: 13, transition: 'border-color .2s', background: 'transparent' }}
                        >
                            {uploadingEdit ? <span className="spinner" style={{ width: 14, height: 14 }} /> : <Upload size={14} />}
                            Upload poster(s)
                        </label>
                        <input id="edit-poster-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleEditUploadPoster} disabled={uploadingEdit} />
                    </>
                ) : (
                    // In create mode: queue images, upload on save
                    <>
                        <label
                            htmlFor="form-image-upload"
                            style={{ display: 'inline-flex', alignItems: 'center', gap: 8, cursor: 'pointer', padding: '8px 14px', borderRadius: 8, border: '1px dashed var(--border)', color: 'var(--text2)', fontSize: 13, transition: 'border-color .2s', background: 'transparent' }}
                        >
                            <Upload size={14} /> Choose images
                        </label>
                        <input id="form-image-upload" type="file" accept="image/*" multiple style={{ display: 'none' }} onChange={handleFormImagePick} />
                    </>
                )}
            </div>

            {/* Pending new images (create mode) */}
            {imagePreviews.length > 0 && (
                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
                    {imagePreviews.map((src, idx) => (
                        <div key={idx} style={{ position: 'relative', width: 90, height: 68, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--border)', background: 'var(--bg3)' }}>
                            <img src={src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            <button
                                type="button"
                                onClick={() => removeFormImage(idx)}
                                style={{ position: 'absolute', top: 3, right: 3, background: 'rgba(0,0,0,.55)', border: 'none', borderRadius: 4, padding: '2px 4px', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
                            >
                                <XIcon size={11} color="#fff" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );

    const formBody = (
        <div className="form-grid">
            <div className="form-group">
                <label>Menu Name</label>
                <input placeholder="Weekly Special Menu" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
                <label>Start Date</label>
                <input type="date" min={modal === 'create' ? today : undefined} value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} />
            </div>
            <div className="form-group">
                <label>End Date</label>
                <input type="date" min={modal === 'create' ? today : (form.start_date || today)} value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
            </div>
            {posterSection}
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

            {/* Standalone Poster Modal */}
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
