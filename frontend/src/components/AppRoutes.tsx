import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Navbar } from './Navbar';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { VehicleDetail } from '../pages/VehicleDetail';
import { AdminLogin } from '../pages/AdminLogin';
import { Dashboard } from '../pages/Dashboard';
import { AdminDashboard } from '../pages/AdminDashboard';
import { MonitorSmartphone } from 'lucide-react';

const ProtectedRoute = ({ children, requireAdmin = false }: { children: React.ReactNode, requireAdmin?: boolean }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (requireAdmin && user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  
  return children;
};

export const AppRoutes = () => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-[#FAFAFA] dark:bg-[#080808] text-gray-900 dark:text-zinc-50 transition-colors duration-700 relative font-sans">
      {/* Mobile Blocker Overlay */}
      <div className="md:hidden fixed inset-0 z-[9999] bg-zinc-950 flex flex-col items-center justify-center p-6 text-center">
        <MonitorSmartphone className="w-16 h-16 text-zinc-400 mb-4" />
        <h2 className="text-2xl font-bold text-white mb-2">Desktop Only</h2>
        <p className="text-zinc-400">
          This application is currently optimized for desktop and laptop screens only. Please access it from a larger screen.
        </p>
      </div>
      
      <div className="linear-grid"></div>
      <div className="linear-glow"></div>
      <div className="fixed inset-0 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/stardust.png')] opacity-[0.03] dark:opacity-10 z-0"></div>
      <div className="absolute top-0 left-0 w-full h-[600px] bg-gradient-to-b from-white/80 dark:from-white/5 to-transparent pointer-events-none z-0"></div>
      <Navbar />
      <main className="flex-grow w-full z-10 flex flex-col">
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/admin-login" element={<AdminLogin />} />
          <Route path="/register" element={<Register />} />
          <Route path="/vehicle/:id" element={<VehicleDetail />} />
          <Route path="/" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        </Routes>
      </main>
    </div>
  );
};
