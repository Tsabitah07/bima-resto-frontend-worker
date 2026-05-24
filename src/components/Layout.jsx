import React, { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    Users, UtensilsCrossed, Package, CalendarCheck,
    LayoutDashboard, LogOut, Menu, X, ChevronRight, Clock
} from 'lucide-react';
import toast from 'react-hot-toast';
import './Layout.css';

const NAV_BASE = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/menus', icon: UtensilsCrossed, label: 'Menus' },
    { to: '/food-packages', icon: Package, label: 'Food Packages' },
    { to: '/booking-sessions', icon: Clock, label: 'Sessions' },
    { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
];

const NAV_ADMIN = [
    { to: '/', icon: LayoutDashboard, label: 'Dashboard', end: true },
    { to: '/users', icon: Users, label: 'Users' },
    { to: '/menus', icon: UtensilsCrossed, label: 'Menus' },
    { to: '/food-packages', icon: Package, label: 'Food Packages' },
    { to: '/booking-sessions', icon: Clock, label: 'Sessions' },
    { to: '/bookings', icon: CalendarCheck, label: 'Bookings' },
];

export default function Layout() {
    const { user, logout, isAdmin } = useAuth();
    const NAV = isAdmin ? NAV_ADMIN : NAV_BASE;
    const navigate = useNavigate();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        toast.success('Signed out successfully');
        navigate('/login');
    };

    return (
        <div className="layout">
            {/* Mobile overlay */}
            {sidebarOpen && <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)} />}

            {/* Sidebar */}
            <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
                <div className="sidebar-brand">
                    <span className="sidebar-logo">✦</span>
                    <div>
                        <div className="sidebar-name">Bima Resto</div>
                        <div className="sidebar-role">Worker Panel</div>
                    </div>
                </div>

                <nav className="sidebar-nav">
                    {NAV.map(({ to, icon: Icon, label, end }) => (
                        <NavLink
                            key={to}
                            to={to}
                            end={end}
                            className={({ isActive }) => `nav-item ${isActive ? 'nav-item-active' : ''}`}
                            onClick={() => setSidebarOpen(false)}
                        >
                            <Icon size={18} />
                            <span>{label}</span>
                            <ChevronRight size={14} className="nav-arrow" />
                        </NavLink>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <div className="sidebar-user">
                        <div className="sidebar-avatar">{user?.name?.[0]?.toUpperCase() || 'W'}</div>
                        <div className="sidebar-user-info">
                            <div className="sidebar-username">{user?.name || user?.username}</div>
                            <div className="sidebar-user-role">{user?.username}</div>
                        </div>
                    </div>
                    <button className="btn btn-ghost btn-sm sidebar-logout" onClick={handleLogout}>
                        <LogOut size={16} />
                    </button>
                </div>
            </aside>

            {/* Main */}
            <div className="main-wrap">
                <header className="topbar">
                    <button className="btn btn-ghost topbar-menu" onClick={() => setSidebarOpen(true)}>
                        <Menu size={20} />
                    </button>
                    <div className="topbar-right">
                        <div className="topbar-user">
                            <div className="topbar-avatar">{user?.name?.[0]?.toUpperCase() || 'W'}</div>
                            <span className="topbar-username">{user?.name || user?.username}</span>
                        </div>
                    </div>
                </header>
                <main className="main-content">
                    <Outlet />
                </main>
            </div>
        </div>
    );
}
