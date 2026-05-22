import React, { useEffect, useState } from 'react';
import { usersAPI, rolesAPI } from '../services/api';
import Modal from '../components/Modal';
import ConfirmDelete from '../components/ConfirmDelete';
import toast from 'react-hot-toast';
import { Plus, Search, Pencil, Trash2, Users as UsersIcon, KeyRound } from 'lucide-react';

const EMPTY_FORM = { name: '', username: '', email: '', phone_number: '', password: '', role_id: '' };

export default function Users() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modal, setModal] = useState(null); // 'create' | 'edit' | 'password'
  const [selected, setSelected] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [pwForm, setPwForm] = useState({ old_password: '', new_password: '', confirm_password: '' });
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const [u, r] = await Promise.all([usersAPI.getAll(), rolesAPI.getAll()]);
      setUsers(u.data.data || []);
      setRoles(r.data.data || []);
    } catch { toast.error('Failed to load users'); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const openCreate = () => { setForm(EMPTY_FORM); setSelected(null); setModal('create'); };
  const openEdit = (u) => { setSelected(u); setForm({ name: u.name, username: u.username, email: u.email, phone_number: u.phone_number || '', role_id: u.role_id }); setModal('edit'); };
  const openPassword = (u) => { setSelected(u); setPwForm({ old_password: '', new_password: '', confirm_password: '' }); setModal('password'); };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (modal === 'create') {
        await usersAPI.create(form);
        toast.success('User created');
      } else {
        await usersAPI.update(selected.id, form);
        toast.success('User updated');
      }
      setModal(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to save'); }
    finally { setSaving(false); }
  };

  const handleChangePassword = async () => {
    setSaving(true);
    try {
      await usersAPI.changePassword(selected.id, pwForm);
      toast.success('Password changed');
      setModal(null);
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to change password'); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await usersAPI.delete(deleteTarget.id);
      toast.success('User deleted');
      setDeleteTarget(null);
      load();
    } catch (e) { toast.error(e.response?.data?.detail || 'Failed to delete'); }
    finally { setDeleting(false); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.username?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  const roleName = (id) => roles.find(r => r.id === id)?.name || id;

  const formBody = (
    <div className="form-grid">
      <div className="form-group">
        <label>Full Name</label>
        <input placeholder="John Doe" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Username</label>
        <input placeholder="johndoe" value={form.username} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Email</label>
        <input type="email" placeholder="john@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
      </div>
      <div className="form-group">
        <label>Phone Number</label>
        <input placeholder="+62..." value={form.phone_number} onChange={e => setForm(f => ({ ...f, phone_number: e.target.value }))} />
      </div>
      {modal === 'create' && (
        <div className="form-group">
          <label>Password</label>
          <input type="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />
        </div>
      )}
      <div className="form-group">
        <label>Role</label>
        <select value={form.role_id} onChange={e => setForm(f => ({ ...f, role_id: e.target.value }))}>
          <option value="">Select role...</option>
          {roles.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
      </div>
    </div>
  );

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Users</h1>
          <p className="page-subtitle">{users.length} registered users</p>
        </div>
        <button className="btn btn-primary" onClick={openCreate}>
          <Plus size={16} /> Add User
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: 16 }}>
          <div className="search-bar" style={{ maxWidth: 320 }}>
            <Search size={16} />
            <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        {loading ? (
          <div className="page-loader"><span className="spinner" /></div>
        ) : filtered.length === 0 ? (
          <div className="empty-state"><UsersIcon size={32} /><p>No users found</p></div>
        ) : (
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Username</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Role</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u.id}>
                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{u.id}</td>
                    <td style={{ fontWeight: 500 }}>{u.name}</td>
                    <td style={{ color: 'var(--text2)' }}>{u.username}</td>
                    <td style={{ color: 'var(--text2)' }}>{u.email}</td>
                    <td style={{ color: 'var(--text3)' }}>{u.phone_number || '—'}</td>
                    <td><span className="badge badge-confirmed" style={{ fontSize: 11 }}>{roleName(u.role_id)}</span></td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => openEdit(u)} title="Edit"><Pencil size={14} /></button>
                        <button className="btn btn-ghost btn-sm" onClick={() => openPassword(u)} title="Change Password"><KeyRound size={14} /></button>
                        <button className="btn btn-danger btn-sm" onClick={() => setDeleteTarget(u)} title="Delete"><Trash2 size={14} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create/Edit Modal */}
      <Modal
        isOpen={modal === 'create' || modal === 'edit'}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Add User' : 'Edit User'}
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Save'}
            </button>
          </>
        }
      >
        {formBody}
      </Modal>

      {/* Change Password Modal */}
      <Modal
        isOpen={modal === 'password'}
        onClose={() => setModal(null)}
        title="Change Password"
        footer={
          <>
            <button className="btn btn-secondary" onClick={() => setModal(null)} disabled={saving}>Cancel</button>
            <button className="btn btn-primary" onClick={handleChangePassword} disabled={saving}>
              {saving ? <span className="spinner" style={{ width: 16, height: 16 }} /> : 'Update Password'}
            </button>
          </>
        }
      >
        <div className="form-grid">
          <div className="form-group">
            <label>Current Password</label>
            <input type="password" placeholder="••••••••" value={pwForm.old_password} onChange={e => setPwForm(f => ({ ...f, old_password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>New Password</label>
            <input type="password" placeholder="••••••••" value={pwForm.new_password} onChange={e => setPwForm(f => ({ ...f, new_password: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Confirm New Password</label>
            <input type="password" placeholder="••••••••" value={pwForm.confirm_password} onChange={e => setPwForm(f => ({ ...f, confirm_password: e.target.value }))} />
          </div>
        </div>
      </Modal>

      <ConfirmDelete
        isOpen={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        itemName={deleteTarget?.name}
        loading={deleting}
      />
    </div>
  );
}
