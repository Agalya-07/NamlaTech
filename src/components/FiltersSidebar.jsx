import React, { useState, useEffect } from 'react';
import { Search, DollarSign, RotateCcw, Filter } from 'lucide-react';

export default function FiltersSidebar({
  searchTitle,
  minPrice,
  maxPrice,
  onSearchChange,
  onPriceFilterApply,
  onClearFilters
}) {
  const [localMin, setLocalMin] = useState(minPrice || '');
  const [localMax, setLocalMax] = useState(maxPrice || '');

  useEffect(() => {
    setLocalMin(minPrice || '');
    setLocalMax(maxPrice || '');
  }, [minPrice, maxPrice]);

  const handleApplyPrice = (e) => {
    e.preventDefault();
    onPriceFilterApply({
      minPrice: localMin,
      maxPrice: localMax
    });
  };

  const handlePresetPrice = (min, max) => {
    setLocalMin(min);
    setLocalMax(max);
    onPriceFilterApply({ minPrice: min, maxPrice: max });
  };

  const hasActiveFilters = Boolean(searchTitle || minPrice || maxPrice);

  return (
    <aside className="filters-sidebar">
      {/* Sidebar Header */}
      <div className="filters-header">
        <div className="filters-title-group">
          <Filter size={18} className="filter-icon" />
          <h2 className="filters-title">Filter Hotels</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="btn-clear-filters"
            title="Reset all search filters"
          >
            <RotateCcw size={14} />
            <span>Reset</span>
          </button>
        )}
      </div>

      <div className="filter-section">
        <label htmlFor="search-title" className="filter-section-title">
          Search by Hotel Name
        </label>
        <div className="search-input-box">
          <Search size={16} className="search-icon" />
          <input
            id="search-title"
            type="text"
            className="filter-input search-input"
            placeholder="Type hotel name..."
            value={searchTitle}
            onChange={(e) => onSearchChange(e.target.value)}
          />
        </div>
      </div>

      <hr className="filter-divider" />

      <div className="filter-section">
        <span className="filter-section-title">Price Range ($ per night)</span>

        <form onSubmit={handleApplyPrice} className="price-filter-form">
          <div className="price-inputs-row">
            <div className="price-field">
              <label htmlFor="price-min" className="price-field-label">Min</label>
              <div className="price-input-wrap">
                <span className="price-currency">$</span>
                <input
                  id="price-min"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="0"
                  className="filter-input price-input"
                  value={localMin}
                  onChange={(e) => setLocalMin(e.target.value)}
                />
              </div>
            </div>

            <span className="price-separator">-</span>

            <div className="price-field">
              <label htmlFor="price-max" className="price-field-label">Max</label>
              <div className="price-input-wrap">
                <span className="price-currency">$</span>
                <input
                  id="price-max"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="500"
                  className="filter-input price-input"
                  value={localMax}
                  onChange={(e) => setLocalMax(e.target.value)}
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn btn-primary btn-apply-price">
            APPLY FILTER
          </button>
        </form>

        <div className="price-presets-list">
          <span className="presets-label">Popular Price Ranges:</span>
          <div className="preset-chips">
            <button
              type="button"
              className={`chip-btn ${localMin === '' && localMax === '100' ? 'chip-active' : ''}`}
              onClick={() => handlePresetPrice('', '100')}
            >
              Under $100
            </button>
            <button
              type="button"
              className={`chip-btn ${localMin === '100' && localMax === '200' ? 'chip-active' : ''}`}
              onClick={() => handlePresetPrice('100', '200')}
            >
              $100 - $200
            </button>
            <button
              type="button"
              className={`chip-btn ${localMin === '200' && localMax === '' ? 'chip-active' : ''}`}
              onClick={() => handlePresetPrice('200', '')}
            >
              $200+
            </button>
          </div>
        </div>
      </div>

      <hr className="filter-divider" />

      <div className="filter-section filter-info-box">
        <h4 className="info-box-title">Why Book with Us?</h4>
        <ul className="info-box-list">
          <li>✓ Real-time Supabase Database</li>
          <li>✓ Instant Cloud Image Storage</li>
          <li>✓ Precision Geolocation Maps</li>
          <li>✓ 100% Verified Properties</li>
        </ul>
      </div>
    </aside>
  );
}
