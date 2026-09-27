import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Edit3, Trash2, ExternalLink, Image as ImageIcon } from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80';

export default function HotelCard({ hotel, onEdit, onDelete, viewMode = 'user' }) {
  const [imageError, setImageError] = useState(false);

  const descriptionSnippet = hotel.description
    ? hotel.description.length > 130
      ? `${hotel.description.slice(0, 130)}...`
      : hotel.description
    : 'No description available for this hotel listing.';

  const displayImage = imageError || !hotel.image_url ? FALLBACK_IMAGE : hotel.image_url;

  const detailUrl = viewMode === 'admin' ? `/admin/hotels/${hotel.id}` : `/user/hotels/${hotel.id}`;

  return (
    <div className="hotel-card">
      <div className="hotel-card-image-wrap">
        <Link to={detailUrl} className="hotel-card-image-link" tabIndex={-1}>
          <img
            src={displayImage}
            alt={`Photo of ${hotel.title}`}
            className="hotel-card-img"
            loading="lazy"
            onError={() => setImageError(true)}
          />
        </Link>
        <span className="hotel-card-badge">Verified</span>
      </div>

      <div className="hotel-card-body">
        <div className="hotel-card-header">
          <Link to={detailUrl} className="hotel-card-title-link">
            <h3 className="hotel-card-title">{hotel.title}</h3>
          </Link>
          <div className="hotel-card-price-badge">
            <span className="currency-symbol">$</span>
            <span className="price-value">{Number(hotel.price).toFixed(2)}</span>
            <span className="price-period">/ night</span>
          </div>
        </div>

        <div className="hotel-card-coordinates">
          <MapPin size={14} className="coord-icon" />
          <span>
            Lat: {Number(hotel.latitude).toFixed(4)}, Long: {Number(hotel.longitude).toFixed(4)}
          </span>
        </div>

        <p className="hotel-card-description">{descriptionSnippet}</p>

        <div className="hotel-card-actions">
          <Link to={detailUrl} className="btn btn-outline btn-sm">
            <ExternalLink size={15} />
            <span>View Details & Map</span>
          </Link>

          {viewMode === 'admin' && (
            <div className="action-buttons-group">
              <button
                onClick={() => onEdit(hotel)}
                className="btn btn-secondary btn-sm"
                title="Edit Hotel"
                aria-label={`Edit ${hotel.title}`}
              >
                <Edit3 size={15} />
                <span>Edit</span>
              </button>

              <button
                onClick={() => onDelete(hotel)}
                className="btn btn-danger btn-sm"
                title="Delete Hotel"
                aria-label={`Delete ${hotel.title}`}
              >
                <Trash2 size={15} />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
