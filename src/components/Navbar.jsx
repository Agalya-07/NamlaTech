import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Building2, PlusCircle, ShieldCheck, CheckCircle, AlertTriangle } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function Navbar({ onOpenAddModal }) {
  const location = useLocation();
  const isAdmin = location.pathname.startsWith('/admin');

  return (
    <header className={`navbar-container ${isAdmin ? 'navbar-admin' : ''}`}>
      <div className="navbar-wrapper">
        {/* Brand / Logo */}
        <Link to={isAdmin ? '/admin' : '/user'} className="navbar-brand">
          <div className="brand-logo-box">
            {isAdmin ? <ShieldCheck className="brand-icon" size={24} /> : <Building2 className="brand-icon" size={24} />}
          </div>
          <div className="brand-text-group">
            <span className="brand-title">NamlaTech</span>
            <span className="brand-subtitle">
              {isAdmin ? 'Admin Portal' : 'Hotel Listings'}
            </span>
          </div>
        </Link>

        {/* Status & Navigation Actions */}
        <div className="navbar-actions">
          {/* Supabase status badge */}
          <div
            className={`status-badge ${isSupabaseConfigured ? 'status-connected' : 'status-demo'}`}
            title={isSupabaseConfigured ? 'Connected to live Supabase project' : 'Running in local demo mode'}
          >
            {isSupabaseConfigured ? (
              <>
                <CheckCircle size={14} />
                <span>Live</span>
              </>
            ) : (
              <>
                <AlertTriangle size={14} />
                <span>Demo</span>
              </>
            )}
          </div>

          <Link
            to={isAdmin ? '/admin' : '/user'}
            className="nav-link active"
          >
            {isAdmin ? 'Manage Hotels' : 'Browse Hotels'}
          </Link>

          {/* Add Hotel button is strictly rendered for the Admin page */}
          {isAdmin && onOpenAddModal && (
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
