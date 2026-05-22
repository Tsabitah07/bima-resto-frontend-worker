import React, { useEffect, useState } from 'react';
import { usersAPI, menusAPI, foodPackagesAPI, bookingsAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Users, UtensilsCrossed, Package, CalendarCheck, TrendingUp, Clock } from 'lucide-react';
import './Dashboard.css';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon" style={{ color, background: `${color}18` }}>
        <Icon size={22} />
      </div>
      <div className="stat-info">
        <div className="stat-value">{value ?? <span className="spinner" style={{ width: 16, height: 16 }} />}</div>
        <div className="stat-label">{label}</div>
        {sub && <div className="stat-sub">{sub}</div>}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({});
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      usersAPI.getAll(),
      menusAPI.getAll(),
      foodPackagesAPI.getAll(),
      bookingsAPI.getAll(),
    ]).then(([u, m, fp, b]) => {
      const bookings = b.data.data || [];
      const pending = bookings.filter(x => x.booking_status === 'pending').length;
      const confirmed = bookings.filter(x => x.booking_status === 'confirmed').length;
      setStats({
        users: (u.data.data || []).length,
        menus: (m.data.data || []).length,
        foodPackages: (fp.data.data || []).length,
        bookings: bookings.length,
        pending,
        confirmed,
      });
      setRecentBookings(bookings.slice(0, 8));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const statusBadge = (s) => {
    const cls = { pending: 'badge-pending', confirmed: 'badge-confirmed', cancelled: 'badge-cancelled', completed: 'badge-completed' };
    return <span className={`badge ${cls[s] || ''}`}>{s}</span>;
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Welcome back, {user?.name || user?.username} ✦</p>
        </div>
      </div>

      <div className="stat-grid">
        <StatCard icon={Users} label="Total Users" value={stats.users} color="var(--blue)" />
        <StatCard icon={UtensilsCrossed} label="Menus" value={stats.menus} color="var(--gold)" />
        <StatCard icon={Package} label="Food Packages" value={stats.foodPackages} color="var(--green)" />
        <StatCard icon={CalendarCheck} label="Total Bookings" value={stats.bookings} color="var(--red)"
          sub={stats.pending != null ? `${stats.pending} pending` : null}
        />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <CalendarCheck size={18} style={{ color: 'var(--gold)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: 18 }}>Recent Bookings</h3>
          </div>
          {loading ? (
            <div className="page-loader"><span className="spinner" /></div>
          ) : recentBookings.length === 0 ? (
            <div className="empty-state"><CalendarCheck size={32} /><p>No bookings yet</p></div>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>User</th>
                    <th>Date</th>
                    <th>People</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentBookings.map(b => (
                    <tr key={b.id}>
                      <td style={{ color: 'var(--text3)', fontSize: 12 }}>#{b.id}</td>
                      <td>User #{b.user_id}</td>
                      <td style={{ color: 'var(--text2)' }}>{new Date(b.booking_date).toLocaleDateString()}</td>
                      <td>{b.number_of_people}</td>
                      <td>{statusBadge(b.booking_status)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <div className="card dashboard-mini">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
            <TrendingUp size={18} style={{ color: 'var(--gold)' }} />
            <h3 style={{ fontFamily: 'var(--font-display)', color: 'var(--gold)', fontSize: 18 }}>Booking Status</h3>
          </div>
          <div className="status-list">
            {[
              { label: 'Pending', count: stats.pending, color: 'var(--gold)' },
              { label: 'Confirmed', count: stats.confirmed, color: 'var(--green)' },
              { label: 'Total', count: stats.bookings, color: 'var(--blue)' },
            ].map(({ label, count, color }) => (
              <div key={label} className="status-row">
                <div className="status-label">{label}</div>
                <div className="status-count" style={{ color }}>{count ?? '—'}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
