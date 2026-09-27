import React, { useState, useEffect, useRef } from 'react';
import { X, Upload, Image as ImageIcon, MapPin, DollarSign, AlertCircle, Loader2 } from 'lucide-react';

export default function HotelForm({ isOpen, onClose, onSubmit, initialData = null, isSubmitting = false }) {
  const isEditMode = Boolean(initialData && initialData.id);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [latitude, setLatitude] = useState('');
  const [longitude, setLongitude] = useState('');
  const [price, setPrice] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  
  const [selectedFile, setSelectedFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const fileInputRef = useRef(null);

  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title || '');
      setDescription(initialData.description || '');
      setLatitude(initialData.latitude !== undefined ? String(initialData.latitude) : '');
      setLongitude(initialData.longitude !== undefined ? String(initialData.longitude) : '');
      setPrice(initialData.price !== undefined ? String(initialData.price) : '');
      setImageUrl(initialData.image_url || '');
      setPreviewUrl(initialData.image_url || '');
      setSelectedFile(null);
    } else {
      setTitle('');
      setDescription('');
      setLatitude('');
      setLongitude('');
      setPrice('');
      setImageUrl('');
      setPreviewUrl('');
      setSelectedFile(null);
    }
    setErrors({});
  }, [initialData, isOpen]);

  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith('blob:')) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  if (!isOpen) return null;

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors((prev) => ({ ...prev, image: 'Please select a valid image file (PNG, JPG, WEBP).' }));
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setErrors((prev) => ({ ...prev, image: 'Image size should not exceed 5MB.' }));
        return;
      }
      setSelectedFile(file);
      const objectUrl = URL.createObjectURL(file);
      setPreviewUrl(objectUrl);
      setErrors((prev) => ({ ...prev, image: null }));
    }
  };

  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      setErrors((prev) => ({ ...prev, coordinates: 'Geolocation is not supported by your browser' }));
      return;
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLatitude(pos.coords.latitude.toFixed(6));
        setLongitude(pos.coords.longitude.toFixed(6));
        setErrors((prev) => ({ ...prev, latitude: null, longitude: null }));
      },
      (err) => {
        setErrors((prev) => ({ ...prev, coordinates: 'Unable to retrieve location: ' + err.message }));
      }
    );
  };

  const validate = () => {
    const errs = {};
    if (!title.trim()) {
      errs.title = 'Hotel title is required';
    } else if (title.trim().length < 3) {
      errs.title = 'Hotel title must be at least 3 characters';
    }

    if (!description.trim()) {
      errs.description = 'Hotel description is required';
    }

    const latNum = parseFloat(latitude);
    if (latitude === '' || isNaN(latNum)) {
      errs.latitude = 'Valid latitude coordinate is required';
    } else if (latNum < -90 || latNum > 90) {
      errs.latitude = 'Latitude must be between -90 and 90';
    }

    const lngNum = parseFloat(longitude);
    if (longitude === '' || isNaN(lngNum)) {
      errs.longitude = 'Valid longitude coordinate is required';
    } else if (lngNum < -180 || lngNum > 180) {
      errs.longitude = 'Longitude must be between -180 and 180';
    }

    const priceNum = parseFloat(price);
    if (price === '' || isNaN(priceNum)) {
      errs.price = 'Valid price per night is required';
    } else if (priceNum < 0) {
      errs.price = 'Price cannot be negative';
    }

    if (!selectedFile && !imageUrl && !previewUrl) {
      errs.image = 'Hotel image is required. Please upload an image or provide a URL.';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = {
      title: title.trim(),
      description: description.trim(),
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      price: parseFloat(price),
      image_url: imageUrl
    };

    onSubmit({
      id: initialData?.id,
      payload,
      imageFile: selectedFile
    });
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog modal-lg" onClick={(e) => e.stopPropagation()}>
        {/* Modal Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {isEditMode ? 'Edit Hotel Listing' : 'Add New Hotel Listing'}
          </h2>
          <button onClick={onClose} className="modal-close-btn" aria-label="Close dialog">
            <X size={20} />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="modal-form">
          <div className="form-grid">
            {/* Title */}
            <div className="form-group col-full">
              <label htmlFor="hotel-title" className="form-label">
                Hotel Name / Title <span className="text-danger">*</span>
              </label>
              <input
                id="hotel-title"
                type="text"
                className={`form-input ${errors.title ? 'input-error' : ''}`}
                placeholder="e.g. Grand Palace Heritage Resort"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
              {errors.title && <span className="field-error">{errors.title}</span>}
            </div>

            <div className="form-group col-half">
              <label htmlFor="hotel-price" className="form-label">
                Price Per Night ($) <span className="text-danger">*</span>
              </label>
              <div className="input-with-icon">
                <DollarSign size={16} className="input-icon" />
                <input
                  id="hotel-price"
                  type="number"
                  step="0.01"
                  min="0"
                  className={`form-input pl-icon ${errors.price ? 'input-error' : ''}`}
                  placeholder="150.00"
                  value={price}
                  onChange={(e) => setPrice(e.target.value)}
                />
              </div>
              {errors.price && <span className="field-error">{errors.price}</span>}
            </div>

            <div className="form-group col-half flex-align-end">
              <button
                type="button"
                onClick={handleUseCurrentLocation}
                className="btn btn-secondary btn-w-full"
                title="Use browser Geolocation to autofill current coordinates"
              >
                <MapPin size={16} />
                <span>Autofill My Location</span>
              </button>
            </div>

            <div className="form-group col-half">
              <label htmlFor="hotel-latitude" className="form-label">
                Latitude (-90 to 90) <span className="text-danger">*</span>
              </label>
              <input
                id="hotel-latitude"
                type="number"
                step="any"
                className={`form-input ${errors.latitude ? 'input-error' : ''}`}
                placeholder="13.0827"
                value={latitude}
                onChange={(e) => setLatitude(e.target.value)}
              />
              {errors.latitude && <span className="field-error">{errors.latitude}</span>}
            </div>

            <div className="form-group col-half">
              <label htmlFor="hotel-longitude" className="form-label">
                Longitude (-180 to 180) <span className="text-danger">*</span>
              </label>
              <input
                id="hotel-longitude"
                type="number"
                step="any"
                className={`form-input ${errors.longitude ? 'input-error' : ''}`}
                placeholder="80.2707"
                value={longitude}
                onChange={(e) => setLongitude(e.target.value)}
              />
              {errors.longitude && <span className="field-error">{errors.longitude}</span>}
            </div>

            <div className="form-group col-full">
              <label className="form-label">
                Hotel Image (Upload to Supabase Storage) <span className="text-danger">*</span>
              </label>
              
              <div className="image-upload-wrapper">
                <div
                  className="upload-dropzone"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload size={28} className="upload-icon" />
                  <p className="upload-prompt">
                    <strong>Click to upload</strong> an image from your computer
                  </p>
                  <span className="upload-hint">PNG, JPG, or WEBP up to 5MB</span>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="file-hidden"
                    onChange={handleFileChange}
                  />
                </div>

                {previewUrl && (
                  <div className="image-preview-card">
                    <img
                      src={previewUrl}
                      alt="Hotel preview"
                      className="preview-img"
                    />
                    <div className="preview-label">
                      <span>{selectedFile ? 'New Image Selected' : 'Current Image'}</span>
                    </div>
                  </div>
                )}
              </div>
              {errors.image && <span className="field-error">{errors.image}</span>}

              <div className="mt-2">
                <span className="text-xs text-muted">Or enter an image URL directly:</span>
                <input
                  type="url"
                  className="form-input form-input-sm mt-1"
                  placeholder="https://images.unsplash.com/..."
                  value={imageUrl}
                  onChange={(e) => {
                    setImageUrl(e.target.value);
                    if (!selectedFile) setPreviewUrl(e.target.value);
                  }}
                />
              </div>
            </div>

            <div className="form-group col-full">
              <label htmlFor="hotel-description" className="form-label">
                Description <span className="text-danger">*</span>
              </label>
              <textarea
                id="hotel-description"
                rows="4"
                className={`form-textarea ${errors.description ? 'input-error' : ''}`}
                placeholder="Describe amenities, location highlights, guest services..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              ></textarea>
              {errors.description && <span className="field-error">{errors.description}</span>}
            </div>
          </div>

          <div className="modal-footer">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="spinner-icon" />
                  <span>{isEditMode ? 'Saving Changes...' : 'Uploading & Creating...'}</span>
                </>
              ) : (
                <span>{isEditMode ? 'Update Hotel' : 'Create Hotel'}</span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
