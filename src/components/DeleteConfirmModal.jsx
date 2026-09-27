import React from 'react';
import { AlertTriangle, Trash2, X, Loader2 } from 'lucide-react';

export default function DeleteConfirmModal({ isOpen, onClose, onConfirm, hotel, isDeleting }) {
  if (!isOpen || !hotel) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-sm" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="flex-align-center gap-2 text-danger">
            <AlertTriangle size={22} />
            <h3 className="modal-title">Delete Listing</h3>
          </div>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={18} />
          </button>
        </div>

        <div className="modal-body">
          <p className="delete-warning-text">
            Are you sure you want to permanently delete{' '}
            <strong>"{hotel.title}"</strong>?
          </p>
          <p className="text-xs text-muted mt-2">
            This will remove the hotel record from the database and delete its associated image from Supabase Storage.
          </p>
        </div>

        <div className="modal-footer">
          <button
            type="button"
            onClick={onClose}
            className="btn btn-secondary"
            disabled={isDeleting}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="btn btn-danger"
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 size={16} className="spinner-icon" />
                <span>Deleting...</span>
              </>
            ) : (
              <>
                <Trash2 size={16} />
                <span>Confirm Delete</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
