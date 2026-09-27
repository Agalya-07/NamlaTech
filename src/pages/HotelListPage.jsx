import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Helmet } from 'react-helmet-async';
import {
  fetchHotels,
  createHotel,
  updateHotel,
  deleteHotel,
  setCurrentPage,
  setSearchTitle,
  setPriceFilters,
  clearFilters,
  clearMessages
} from '../redux/hotelSlice';
import HotelCard from '../components/HotelCard';
import HotelForm from '../components/HotelForm';
import FiltersSidebar from '../components/FiltersSidebar';
import Pagination from '../components/Pagination';
import DeleteConfirmModal from '../components/DeleteConfirmModal';
import { PlusCircle, Search, Building2, AlertCircle, CheckCircle, Info } from 'lucide-react';
import { isSupabaseConfigured } from '../lib/supabaseClient';

export default function HotelListPage({ isAddModalOpen, setIsAddModalOpen, viewMode = 'user' }) {
  const dispatch = useDispatch();
  const {
    items,
    totalCount,
    totalPages,
    currentPage,
    limit,
    searchTitle,
    minPrice,
    maxPrice,
    loading,
    actionLoading,
    error,
    successMessage,
    isDemoMode
  } = useSelector((state) => state.hotels);


  const [editingHotel, setEditingHotel] = useState(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [deletingHotel, setDeletingHotel] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  useEffect(() => {
    if (isAddModalOpen) {
      setEditingHotel(null);
      setIsFormOpen(true);
      setIsAddModalOpen(false);
    }
  }, [isAddModalOpen, setIsAddModalOpen]);

  useEffect(() => {
    dispatch(fetchHotels());
  }, [dispatch, currentPage, searchTitle, minPrice, maxPrice]);

  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => {
        dispatch(clearMessages());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [successMessage, dispatch]);

  const handleOpenAdd = () => {
    setEditingHotel(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (hotel) => {
    setEditingHotel(hotel);
    setIsFormOpen(true);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingHotel(null);
  };

  const handleFormSubmit = async ({ id, payload, imageFile }) => {
    if (id) {
      await dispatch(updateHotel({ id, payload, imageFile }));
    } else {
      await dispatch(createHotel({ payload, imageFile }));
    }
    handleCloseForm();
  };

  const handleOpenDelete = (hotel) => {
    setDeletingHotel(hotel);
    setIsDeleteModalOpen(true);
  };

  const handleCloseDelete = () => {
    setIsDeleteModalOpen(false);
    setDeletingHotel(null);
  };

  const handleConfirmDelete = async () => {
    if (deletingHotel) {
      await dispatch(deleteHotel({ id: deletingHotel.id, imageUrl: deletingHotel.image_url }));
      handleCloseDelete();
    }
  };

  return (
    <>
      <Helmet>
        <title>
          {viewMode === 'admin'
            ? 'Admin Hotel Management | NamlaTech Portal'
            : 'Explore Luxury Hotels & Resorts | NamlaTech Portal'}
        </title>
        <meta
          name="description"
          content={
            viewMode === 'admin'
              ? 'Admin portal to add, update, and manage hotel listings and pricing.'
              : 'Browse premier hotel listings with real-time price filtering, location maps, and instant bookings.'
          }
        />
        <meta
          property="og:title"
          content={
            viewMode === 'admin'
              ? 'Admin Hotel Management'
              : 'Explore Luxury Hotels & Resorts'
          }
        />
        <meta
          property="og:description"
          content="Find top rated hotels with geolocation maps and transparent pricing."
        />
      </Helmet>

      <div className="page-container">
        {!isSupabaseConfigured && (
          <div className="demo-banner">
            <Info size={18} className="demo-banner-icon" />
            <div className="demo-banner-text">
              <strong>Running in Local Demo Mode:</strong> To connect your live Supabase project,
              add your <code>VITE_SUPABASE_URL</code> and <code>VITE_SUPABASE_ANON_KEY</code> to <code>.env</code>.
              All CRUD operations, filtering, and image previews work seamlessly in this preview!
            </div>
          </div>
        )}

        {successMessage && (
          <div className="alert alert-success animate-fade-in" role="alert">
            <CheckCircle size={18} />
            <span>{successMessage}</span>
            <button
              onClick={() => dispatch(clearMessages())}
              className="alert-close-btn"
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        )}

        {error && (
          <div className="alert alert-danger animate-fade-in" role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
            <button
              onClick={() => dispatch(clearMessages())}
              className="alert-close-btn"
              aria-label="Dismiss alert"
            >
              ×
            </button>
          </div>
        )}

        <div className="listings-layout">
          <FiltersSidebar
            searchTitle={searchTitle}
            minPrice={minPrice}
            maxPrice={maxPrice}
            onSearchChange={(val) => dispatch(setSearchTitle(val))}
            onPriceFilterApply={(filters) => dispatch(setPriceFilters(filters))}
            onClearFilters={() => dispatch(clearFilters())}
          />

          <main className="listings-main">
            <div className="listings-top-bar">
              <div className="top-bar-left">
                <span className="results-count font-semibold">
                  {totalCount} {totalCount === 1 ? 'Hotel' : 'Hotels'} found
                </span>
                {(searchTitle || minPrice || maxPrice) && (
                  <span className="filtered-indicator">
                    (Filtered)
                  </span>
                )}
              </div>

              <div className="top-bar-right">
                {viewMode === 'admin' && (
                  <button
                    onClick={handleOpenAdd}
                    className="btn btn-primary btn-sm flex-align-center gap-1"
                  >
                    <PlusCircle size={16} />
                    <span>Add Hotel</span>
                  </button>
                )}
              </div>
            </div>

            {loading ? (
              <div className="loading-state">
                <div className="loading-spinner"></div>
                <p>Loading hotel listings...</p>
              </div>
            ) : items.length === 0 ? (
              <div className="empty-state">
                <Building2 size={48} className="empty-icon" />
                <h3 className="empty-title">No Hotels Found</h3>
                <p className="empty-description">
                  {searchTitle || minPrice || maxPrice
                    ? 'No hotels match your current search and filter criteria. Try broadening your parameters.'
                    : 'There are currently no hotels in the database.'}
                </p>
                {(searchTitle || minPrice || maxPrice) && (
                  <button
                    onClick={() => dispatch(clearFilters())}
                    className="btn btn-secondary mt-3"
                  >
                    Clear All Filters
                  </button>
                )}
              </div>
            ) : (
              <div className="hotel-cards-list">
                {items.map((hotel) => (
                  <HotelCard
                    key={hotel.id}
                    hotel={hotel}
                    onEdit={handleOpenEdit}
                    onDelete={handleOpenDelete}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}

            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              totalCount={totalCount}
              limit={limit}
              onPageChange={(page) => dispatch(setCurrentPage(page))}
            />
          </main>
        </div>
      </div>

      <HotelForm
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={handleFormSubmit}
        initialData={editingHotel}
        isSubmitting={actionLoading}
      />

      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={handleCloseDelete}
        onConfirm={handleConfirmDelete}
        hotel={deletingHotel}
        isDeleting={actionLoading}
      />
    </>
  );
}
