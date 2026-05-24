import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Users from './pages/Users';
import Menus from './pages/Menus';
import FoodPackages from './pages/FoodPackages';
import BookingSessions from './pages/BookingSessions';
import Bookings from './pages/Bookings';

function PrivateRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
            <span className="spinner" style={{ width: 32, height: 32, borderWidth: 3 }} />
        </div>
    );
    return user ? children : <Navigate to="/login" replace />;
}

function PublicRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/" replace /> : children;
}

function AdminRoute({ children }) {
    const { user, loading, isAdmin } = useAuth();
    if (loading) return null;
    if (!user) return <Navigate to="/login" replace />;
    if (!isAdmin) return <Navigate to="/" replace />;
    return children;
}

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
            <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                <Route index element={<Dashboard />} />
                <Route path="users" element={<AdminRoute><Users /></AdminRoute>} />
                <Route path="menus" element={<Menus />} />
                <Route path="food-packages" element={<FoodPackages />} />
                <Route path="booking-sessions" element={<BookingSessions />} />
                <Route path="bookings" element={<Bookings />} />
            </Route>
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default function App() {
    return (
        <BrowserRouter>
            <AuthProvider>
                <AppRoutes />
                <Toaster
                    position="top-right"
                    toastOptions={{
                        style: {
                            background: '#002266',
                            color: '#ffffff',
                            border: '1px solid #0044b3',
                            fontFamily: 'DM Sans, sans-serif',
                            fontSize: '14px',
                        },
                        success: { iconTheme: { primary: '#5eb87a', secondary: '#002266' } },
                        error: { iconTheme: { primary: '#e05252', secondary: '#002266' } },
                    }}
                />
            </AuthProvider>
        </BrowserRouter>
    );
}
