import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import HotelListPage from './pages/HotelListPage';
import HotelDetailPage from './pages/HotelDetailPage';

export default function App() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="app-layout">
      
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

   
      <div className="app-content">
        <Routes>
          <Route path="/" element={<Navigate to="/user" replace />} />

        
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

        
          <Route path="*" element={<Navigate to="/user" replace />} />
        </Routes>
      </div>

    
      <footer className="app-footer">
        <div className="footer-inner">
          <p>© {new Date().getFullYear()} NamlaTech Hotel Portal. Built with React, Redux, Supabase & Vercel.</p>
        </div>
      </footer>
    </div>
  );
}
