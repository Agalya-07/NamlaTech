import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Global Navigation Header (automatically adapts to /admin vs /user based on URL) */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Routed Content */}
      <div className="app-content">
        <Routes>
          {/* Default Route: Redirects to the User Portal */}
          <Route path="/" element={<Navigate to="/user" replace />} />

          {/* User Portal (Guest / Public Browsing) */}
          <Route
            path="/user"
            element={
              <HotelListPage
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                viewMode="user"
              />
            }
          />
          <Route path="/user/hotels/:id" element={<HotelDetailPage viewMode="user" />} />
          <Route path="/hotels/:id" element={<HotelDetailPage viewMode="user" />} />

          {/* Admin Panel (Management, Add, Edit, Delete) */}
          <Route
            path="/admin"
            element={
              <HotelListPage
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
                viewMode="admin"
              />
            }
          />
          <Route path="/admin/hotels/:id" element={<HotelDetailPage viewMode="admin" />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </div>

      {/* Footer */}
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} NamlaTech Hotel Portal. Built with React, Redux, Supabase & Vercel.</p>
        </div>
      </footer>
    </div>
  );
}
