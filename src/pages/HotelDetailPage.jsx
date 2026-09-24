import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import {
  fetchHotelById,
  updateHotel,
  deleteHotel,
  clearMessages
} from '../redux/hotelSlice';
import HotelForm from '../components/HotelForm';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import {
  ArrowLeft,
  MapPin,
  DollarSign,
  Calendar,
  Edit3,
  Trash2,
  Navigation,
  CheckCircle,
  AlertCircle,
  Building2
} from 'lucide-react';

const FALLBACK_IMAGE = 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1200&q=80';

// Custom clean map pin icon for Leaflet to avoid broken image asset paths in bundlers
const customMarkerIcon = new L.DivIcon({
  className: 'custom-map-marker',
  html: `<div style="
    background: #0d6efd;
    width: 32px;
    height: 32px;
    border-radius: 50% 50% 50% 0;
    transform: rotate(-45deg);
    display: flex;
    align-items: center;
    justify-content: center;
    border: 3px solid #ffffff;
    box-shadow: 0 4px 10px rgba(0,0,0,0.3);
  ">
    <div style="
      width: 10px;
      height: 10px;
      background: #ffffff;
      border-radius: 50%;
      transform: rotate(45deg);
    "></div>
  </div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32]
});

export default function HotelDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    currentHotel,
    detailLoading,
    actionLoading,
    error,
    successMessage
  } = useSelector((state) => state.hotels);

  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    if (id) {
      dispatch(fetchHotelById(id));
    }
  }, [id, dispatch]);

  const handleEditSubmit = async ({ id: hotelId, payload, imageFile }) => {
    await dispatch(updateHotel({ id: hotelId, payload, imageFile }));
    setIsEditOpen(false);
    dispatch(fetchHotelById(hotelId));
  };

  const handleConfirmDelete = async () => {
    if (currentHotel) {
      await dispatch(deleteHotel({ id: currentHotel.id, imageUrl: currentHotel.image_url }));
      setIsDeleteOpen(false);
      navigate('/');
    }
  };

  if (detailLoading) {
    return (
      <div className="detail-loading-state">
        <div className="loading-spinner"></div>
        <p>Loading hotel details and map...</p>
      </div>
    );
  }

  if (error || !currentHotel) {
    return (
      <div className="detail-not-found">
        <Building2 size={48} className="empty-icon" />
        <h2>Hotel Not Found</h2>
        <p className="text-muted mt-2">
          {error || "The hotel listing you're looking for doesn't exist or was removed."}
        </p>
        <Link to="/" className="btn btn-primary mt-4">
          <ArrowLeft size={16} />
          <span>Back to Hotel Listings</span>
        </Link>
      </div>
    );
  }

  const lat = Number(currentHotel.latitude);
  const lng = Number(currentHotel.longitude);
  const isValidCoord = !isNaN(lat) && !isNaN(lng) && lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180;
  const displayImage = imageError || !currentHotel.image_url ? FALLBACK_IMAGE : currentHotel.image_url;

  return (
    <>
      {/* Dynamic SEO Meta Tags via React Helmet */}
      <Helmet>
        <title>{`${currentHotel.title} | Luxury Hotel Details & Map`}</title>
        <meta
          name="description"
          content={`${currentHotel.title} - ${currentHotel.description?.slice(0, 150) || 'Book luxury accommodations'} - $${Number(currentHotel.price).toFixed(2)}/night.`}
        />
        <meta property="og:title" content={`${currentHotel.title} - Hotel Details`} />
        <meta
          property="og:description"
          content={currentHotel.description || 'Explore amenities, location and map view.'}
        />
        <meta property="og:image" content={displayImage} />
        <meta property="og:type" content="article" />
      </Helmet>

      <div className="detail-page-container">
        {/* Navigation Breadcrumb & Back button */}
        <div className="detail-top-nav">
          <Link to="/" className="btn btn-secondary btn-sm flex-align-center gap-1">
            <ArrowLeft size={16} />
            <span>Back to All Hotels</span>
          </Link>

          <div className="detail-actions-group">
            <button
              onClick={() => setIsEditOpen(true)}
              className="btn btn-secondary btn-sm"
            >
              <Edit3 size={15} />
              <span>Edit Details</span>
            </button>
            <button
              onClick={() => setIsDeleteOpen(true)}
              className="btn btn-danger btn-sm"
            >
              <Trash2 size={15} />
              <span>Delete</span>
            </button>
          </div>
        </div>

        {/* Success / Error alerts */}
        {successMessage && (
          <div className="alert alert-success animate-fade-in mb-3">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Detail Hero Section */}
        <div className="detail-hero-card">
          <div className="detail-hero-image-wrap">
            <img
              src={displayImage}
              alt={`High resolution photo of ${currentHotel.title}`}
              className="detail-hero-img"
              onError={() => setImageError(true)}
            />
            <div className="detail-hero-price-overlay">
              <span className="price-currency">$</span>
              <span className="price-number">{Number(currentHotel.price).toFixed(2)}</span>
              <span className="price-unit">/ night</span>
            </div>
          </div>

          <div className="detail-hero-content">
            <h1 className="detail-hotel-title">{currentHotel.title}</h1>

            <div className="detail-meta-row">
              <div className="detail-coord-badge">
                <MapPin size={16} className="text-primary" />
                <span>
                  Latitude: <strong>{lat.toFixed(5)}</strong>, Longitude: <strong>{lng.toFixed(5)}</strong>
                </span>
              </div>

              {currentHotel.created_at && (
                <div className="detail-date-badge">
                  <Calendar size={15} className="text-muted" />
                  <span>Listed on {new Date(currentHotel.created_at).toLocaleDateString()}</span>
                </div>
              )}
            </div>

            <hr className="detail-divider" />

            <div className="detail-section">
              <h3 className="detail-section-title">About this Property</h3>
              <p className="detail-description-text">
                {currentHotel.description || 'No detailed description provided.'}
              </p>
            </div>
          </div>
        </div>

        {/* Interactive Map Section (Geolocation / Coordinates) */}
        <div className="detail-map-card">
          <div className="map-card-header">
            <div className="flex-align-center gap-2">
              <Navigation size={20} className="text-primary" />
              <h2 className="map-title">Location & Geolocation Map</h2>
            </div>
            <a
              href={`https://www.google.com/maps?q=${lat},${lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-outline btn-sm"
              title="Open directions in Google Maps"
            >
              Open in Google Maps
            </a>
          </div>

          <div className="map-container-wrapper">
            {isValidCoord ? (
              <MapContainer
                center={[lat, lng]}
                zoom={14}
                scrollWheelZoom={false}
                className="leaflet-map"
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[lat, lng]} icon={customMarkerIcon}>
                  <Popup>
                    <div className="map-popup-card">
                      <strong>{currentHotel.title}</strong>
                      <p className="map-popup-price">${Number(currentHotel.price).toFixed(2)} / night</p>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            ) : (
              <div className="map-error-placeholder">
                <AlertCircle size={28} className="text-danger" />
                <p>Invalid coordinates provided for map rendering ({currentHotel.latitude}, {currentHotel.longitude})</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Form Modal */}
      <HotelForm
        isOpen={isEditOpen}
        onClose={() => setIsEditOpen(false)}
        onSubmit={handleEditSubmit}
        initialData={currentHotel}
        isSubmitting={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        onConfirm={handleConfirmDelete}
        hotel={currentHotel}
        isDeleting={actionLoading}
      />
    </>
  );
}
