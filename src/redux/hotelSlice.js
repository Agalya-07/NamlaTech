import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { hotelService } from '../services/hotelService';

export const fetchHotels = createAsyncThunk(
  'hotels/fetchHotels',
  async (_, { getState, rejectWithValue }) => {
    try {
      const { currentPage, limit, searchTitle, minPrice, maxPrice } = getState().hotels;
      const response = await hotelService.getHotels({
        page: currentPage,
        limit,
        searchTitle,
        minPrice,
        maxPrice
      });
      return response;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hotels');
    }
  }
);

export const fetchHotelById = createAsyncThunk(
  'hotels/fetchHotelById',
  async (id, { rejectWithValue }) => {
    try {
      const hotel = await hotelService.getHotelById(id);
      return hotel;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to fetch hotel details');
    }
  }
);

export const createHotel = createAsyncThunk(
  'hotels/createHotel',
  async ({ payload, imageFile }, { dispatch, rejectWithValue }) => {
    try {
      const newHotel = await hotelService.createHotel(payload, imageFile);
      dispatch(fetchHotels());
      return newHotel;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to create hotel');
    }
  }
);

export const updateHotel = createAsyncThunk(
  'hotels/updateHotel',
  async ({ id, payload, imageFile }, { dispatch, rejectWithValue }) => {
    try {
      const updated = await hotelService.updateHotel(id, payload, imageFile);
      dispatch(fetchHotels());
      return updated;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to update hotel');
    }
  }
);

export const deleteHotel = createAsyncThunk(
  'hotels/deleteHotel',
  async ({ id, imageUrl }, { dispatch, rejectWithValue }) => {
    try {
      await hotelService.deleteHotel(id, imageUrl);
      dispatch(fetchHotels());
      return id;
    } catch (error) {
      return rejectWithValue(error.message || 'Failed to delete hotel');
    }
  }
);

const hotelSlice = createSlice({
  name: 'hotels',
  initialState: {
    items: [],
    currentHotel: null,
    totalCount: 0,
    totalPages: 1,
    currentPage: 1,
    limit: 5,
    searchTitle: '',
    minPrice: '',
    maxPrice: '',
    loading: false,
    detailLoading: false,
    actionLoading: false,
    error: null,
    successMessage: null,
    isDemoMode: false
  },
  reducers: {
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    setSearchTitle: (state, action) => {
      state.searchTitle = action.payload;
      state.currentPage = 1; // Reset to page 1 on search
    },
    setPriceFilters: (state, action) => {
      state.minPrice = action.payload.minPrice;
      state.maxPrice = action.payload.maxPrice;
      state.currentPage = 1; // Reset to page 1 on filter
    },
    clearFilters: (state) => {
      state.searchTitle = '';
      state.minPrice = '';
      state.maxPrice = '';
      state.currentPage = 1;
    },
    clearMessages: (state) => {
      state.error = null;
      state.successMessage = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchHotels.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHotels.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.data;
        state.totalCount = action.payload.count;
        state.totalPages = action.payload.totalPages;
        state.isDemoMode = action.payload.isDemoMode;
      })
      .addCase(fetchHotels.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(fetchHotelById.pending, (state) => {
        state.detailLoading = true;
        state.error = null;
      })
      .addCase(fetchHotelById.fulfilled, (state, action) => {
        state.detailLoading = false;
        state.currentHotel = action.payload;
      })
      .addCase(fetchHotelById.rejected, (state, action) => {
        state.detailLoading = false;
        state.error = action.payload;
      })

      // Create hotel
      .addCase(createHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(createHotel.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Hotel listing created successfully!';
      })
      .addCase(createHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Update hotel
      .addCase(updateHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(updateHotel.fulfilled, (state, action) => {
        state.actionLoading = false;
        state.currentHotel = action.payload;
        state.successMessage = 'Hotel listing updated successfully!';
      })
      .addCase(updateHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      })

      // Delete hotel
      .addCase(deleteHotel.pending, (state) => {
        state.actionLoading = true;
        state.error = null;
      })
      .addCase(deleteHotel.fulfilled, (state) => {
        state.actionLoading = false;
        state.successMessage = 'Hotel listing deleted successfully!';
      })
      .addCase(deleteHotel.rejected, (state, action) => {
        state.actionLoading = false;
        state.error = action.payload;
      });
  }
});

export const {
  setCurrentPage,
  setSearchTitle,
  setPriceFilters,
  clearFilters,
  clearMessages
} = hotelSlice.actions;

export default hotelSlice.reducer;
