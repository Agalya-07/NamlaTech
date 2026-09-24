import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, PlusCircle, Database, CheckCircle, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function Navbar({ onOpenAddModal }) {
  const location = useLocation();

  return (
    <header className="navbar-container">
      <div className="navbar-wrapper">
        {/* Brand / Logo */}
        <Link to="/" className="navbar-brand">
          <div className="brand-logo-box">
            <Building2 className="brand-icon" size={24} />
          </div>
          <div className="brand-text-group">
            <span className="brand-title">NamlaTech</span>
            <span className="brand-subtitle">Hotel Listings</span>
          </div>
        </Link>

        {/* Status & Navigation Actions */}
        <div className="navbar-actions">
          {/* Supabase status badge */}
          <div className={`status-badge ${isSupabaseConfigured ? 'status-connected' : 'status-demo'}`} title={isSupabaseConfigured ? 'Connected to live Supabase project' : 'Running in local demo mode (add .env keys to connect)'}>
            {isSupabaseConfigured ? (
              <>
                <CheckCircle size={15} />
                <span>Supabase Live</span>
              </>
            ) : (
              <>
                <AlertTriangle size={15} />
                <span>Demo Storage</span>
              </>
            )}
          </div>

          <Link to="/" className={`nav-link ${location.pathname === '/' ? 'active' : ''}`}>
            Browse Hotels
          </Link>

          {onOpenAddModal && (
            <button
              onClick={onOpenAddModal}
              className="btn btn-primary btn-add-hotel"
            >
              <PlusCircle size={18} />
              <span>Add Hotel</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
