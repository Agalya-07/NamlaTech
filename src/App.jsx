import React, { useState } from 'react';
import { Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="app-layout">
      {/* Global Navigation Header */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Routed Content */}
      <div className="app-content">
        <Routes>
          <Route
            path="/"
            element={
              <HotelListPage
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
              />
            }
          />
          <Route path="/hotels/:id" element={<HotelDetailPage />} />
          <Route
            path="*"
            element={
              <HotelListPage
                isAddModalOpen={isAddModalOpen}
                setIsAddModalOpen={setIsAddModalOpen}
              />
            }
          />
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
