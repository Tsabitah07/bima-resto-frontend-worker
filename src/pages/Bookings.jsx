import React, { useEffect, useState } from 'react';
import { bookingsAPI, usersAPI, bookingSessionsAPI, foodPackagesAPI } from '../services/api';
import Modal from '../components/Modal';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Search, CalendarCheck, Eye, ChevronUp, ChevronDown, ChevronsUpDown } from 'lucide-react';

const STATUS_OPTIONS = ['pending', 'confirmed', 'cancelled', 'completed', 'not_paid'];

export default function Bookings() {
    const { isAdmin } = useAuth();
    const [bookings, setBookings] = useState([]);
    const [users, setUsers] = useState([]);
    const [sessions, setSessions] = useState([]);
    const [packages, setPackages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [sortDir, setSortDir] = useState('asc'); // 'asc' | 'desc' | null
    const [viewTarget, setViewTarget] = useState(null);
    const [changingStatus, setChangingStatus] = useState(null);

    const load = async () => {
        setLoading(true);
        try {
            const [b, u, s, fp] = await Promise.all([
                bookingsAPI.getAll(), usersAPI.getAll(), bookingSessionsAPI.getAll(), foodPackagesAPI.getAll()
            ]);
            setBookings(b.data.data || []);
            setUsers(u.data.data || []);
            setSessions(s.data.data || []);
            setPackages(fp.data.data || []);
        } catch { toast.error('Failed to load bookings'); }
        finally { setLoading(false); }
    };
    useEffect(() => { load(); }, []);

    const handleStatusChange = async (booking, newStatus) => {
        setChangingStatus(booking.id);
        try {
            await bookingsAPI.update(booking.id, { booking_status: newStatus });
            toast.success(`Booking #${booking.id} marked as ${newStatus}`);
            load();
        } catch (e) { toast.error(e.response?.data?.detail || 'Failed to update status'); }
        finally { setChangingStatus(null); }
    };

    const cycleSort = () => {
        setSortDir(d => d === 'asc' ? 'desc' : d === 'desc' ? null : 'asc');
    };

    const SortIcon = () => {
        if (sortDir === 'asc') return <ChevronUp size={13} />;
        if (sortDir === 'desc') return <ChevronDown size={13} />;
        return <ChevronsUpDown size={13} style={{ opacity: 0.4 }} />;
    };

    const userName = (id) => { const u = users.find(u => u.id === id); return u ? `${u.name} (${u.username})` : `User #${id}`; };
    const sessionName = (id) => sessions.find(s => s.id === id)?.name || `Session #${id}`;

    const statusBadge = (s) => {
        const cls = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed', not_paid: 'badge-cancelled' };
        return <span className={`badge ${cls[s] || ''}`}>{s}</span>;
    };

    const filtered = bookings.filter(b => {
        const matchSearch = String(b.user_id).includes(search) || String(b.id).includes(search) ||
            userName(b.user_id).toLowerCase().includes(search.toLowerCase());
        const matchStatus = !statusFilter || b.booking_status === statusFilter;
        return matchSearch && matchStatus;
    });

    const sorted = [...filtered].sort((a, b) => {
        if (!sortDir) return 0;
        const da = new Date(a.booking_date), db = new Date(b.booking_date);
        return sortDir === 'asc' ? da - db : db - da;
    });

    return (
        <div>
            <div className="page-header">
                <div>
                    <h1 className="page-title">Bookings</h1>
                    <p className="page-subtitle">{bookings.length} total reservations{isAdmin && ' · View only'}</p>
                </div>
                {isAdmin && (
                    <span style={{
                        background: '#f59e0b22',
                        color: '#f59e0b',
                        border: '1px solid #f59e0b',
                        borderRadius: 6,
                        padding: '4px 12px',
                        fontSize: 12,
                        fontWeight: 600,
                        letterSpacing: '0.04em',
                        alignSelf: 'center',
                    }}>
                        👁 Read Only
                    </span>
                )}
            </div>

            <div className="card">
                <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap' }}>
                    <div className="search-bar" style={{ maxWidth: 280, flex: 1 }}>
                        <Search size={16} />
                        <input placeholder="Search by user or ID..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                    <select style={{ width: 'auto', flex: '0 0 160px' }} value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                </div>

                {loading ? (
                    <div className="page-loader"><span className="spinner" /></div>
                ) : sorted.length === 0 ? (
                    <div className="empty-state"><CalendarCheck size={32} /><p>No bookings found</p></div>
                ) : (
                    <div className="table-wrap">
                        <table>
                            <thead>
                            <tr>
                                <th>#</th>
                                <th>Customer</th>
                                <th
                                    onClick={cycleSort}
                                    style={{ cursor: 'pointer', userSelect: 'none', whiteSpace: 'nowrap' }}
                                >
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      Date <SortIcon />
                    </span>
                                </th>
                                <th>Session</th>
                                <th>People</th>
                                <th>Food Items</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                            </thead>
                            <tbody>
                            {sorted.map(b => (
                                <tr key={b.id}>
                                    <td style={{ color: 'var(--text3)', fontSize: 12 }}>{b.id}</td>
                                    <td style={{ fontWeight: 500 }}>{userName(b.user_id)}</td>
                                    <td style={{ color: 'var(--text2)' }}>{new Date(b.booking_date).toLocaleDateString('id-ID')}</td>
                                    <td style={{ color: 'var(--text2)' }}>{sessionName(b.booking_session_id)}</td>
                                    <td style={{ textAlign: 'center' }}>{b.number_of_people}</td>
                                    <td>
                                        <span style={{ color: 'var(--text3)', fontSize: 12 }}>{(b.booked_foods || []).length} item(s)</span>
                                    </td>
                                    <td>{statusBadge(b.booking_status)}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
                                            <button className="btn btn-ghost btn-sm" onClick={() => setViewTarget(b)} title="View Detail">
                                                <Eye size={14} />
                                            </button>
                                            {!isAdmin && b.booking_status === 'pending' && (
                                                <button
                                                    className="btn btn-primary btn-sm"
                                                    onClick={() => handleStatusChange(b, 'confirmed')}
                                                    disabled={changingStatus === b.id}
                                                    style={{ fontSize: 12 }}
                                                >
                                                    {changingStatus === b.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Confirm'}
                                                </button>
                                            )}
                                            {!isAdmin && b.booking_status === 'confirmed' && (
                                                <>
                                                    <button
                                                        className="btn btn-primary btn-sm"
                                                        onClick={() => handleStatusChange(b, 'completed')}
                                                        disabled={changingStatus === b.id}
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        {changingStatus === b.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Complete'}
                                                    </button>
                                                    <button
                                                        className="btn btn-danger btn-sm"
                                                        onClick={() => handleStatusChange(b, 'not_paid')}
                                                        disabled={changingStatus === b.id}
                                                        style={{ fontSize: 12 }}
                                                    >
                                                        {changingStatus === b.id ? <span className="spinner" style={{ width: 12, height: 12 }} /> : 'Not Paid'}
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* View Detail Modal */}
            <Modal isOpen={!!viewTarget} onClose={() => setViewTarget(null)} title={`Booking #${viewTarget?.id}`}>
                {viewTarget && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                            {[
                                ['Customer', userName(viewTarget.user_id)],
                                ['Date', new Date(viewTarget.booking_date).toLocaleDateString('id-ID')],
                                ['Session', sessionName(viewTarget.booking_session_id)],
                                ['People', viewTarget.number_of_people],
                                ['Status', statusBadge(viewTarget.booking_status)],
                                ['Notes', viewTarget.notes || '—'],
                            ].map(([k, v]) => (
                                <div key={k}>
                                    <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 4 }}>{k}</div>
                                    <div style={{ color: 'var(--text)' }}>{v}</div>
                                </div>
                            ))}
                        </div>
                        {(viewTarget.booked_foods || []).length > 0 && (
                            <div>
                                <div style={{ fontSize: 11, color: 'var(--text3)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Food Items</div>
                                {viewTarget.booked_foods.map((f, i) => (
                                    <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '10px 0', borderBottom: '1px solid var(--border)' }}>
                                        <div>
                                            <div style={{ fontWeight: 500 }}>{f.food_package_name}</div>
                                            <div style={{ fontSize: 12, color: 'var(--text3)' }}>{f.menu_name}</div>
                                        </div>
                                        <div style={{ color: 'var(--gold)' }}>×{f.quantity}</div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </Modal>

        </div>
    );
}
