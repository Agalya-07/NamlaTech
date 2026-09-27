import { supabase, isSupabaseConfigured } from '../lib/supabaseClient';

const BUCKET_NAME = 'hotel-images';


const LOCAL_STORAGE_KEY = 'namla_hotels_demo_db';

const INITIAL_FALLBACK_HOTELS = [
  {
    id: 1,
    title: 'Grand Palace Heritage Resort',
    description: 'Experience royal luxury in the heart of the city with regal suites, fine dining restaurants, and lush manicured gardens.',
    latitude: 13.0827,
    longitude: 80.2707,
    price: 240.00,
    image_url: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 2,
    title: 'Ocean Breeze Beachfront Villa',
    description: 'Stunning private seaside resort with direct white sand beach access, private infinity pool, and sunset cocktail lounge.',
    latitude: 12.9716,
    longitude: 77.5946,
    price: 185.50,
    image_url: 'https://images.unsplash.com/photo-1582719508461-905c673771fd?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 18).toISOString()
  },
  {
    id: 3,
    title: 'Mountain Peak Alpine Retreat',
    description: 'Cozy wooden chalets surrounded by snow-capped peaks, offering guided hiking, fireplace lounges, and outdoor hot tubs.',
    latitude: 32.2432,
    longitude: 77.1892,
    price: 145.00,
    image_url: 'https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 4,
    title: 'Urban Oasis Boutique Hotel',
    description: 'Contemporary design hotel situated downtown close to shopping districts, art galleries, and premier nightlife spots.',
    latitude: 19.0760,
    longitude: 72.8777,
    price: 120.00,
    image_url: 'https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 5,
    title: 'Serene Lakeside Eco Lodge',
    description: 'Peaceful and sustainable waterfront sanctuary featuring organic farm-to-table dining, kayak rentals, and morning yoga.',
    latitude: 9.9312,
    longitude: 76.2673,
    price: 95.00,
    image_url: 'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 6,
    title: 'The Royal Palms Luxury Suites',
    description: 'Ultra-modern 5-star suites offering panoramic skyline views, 24-hour dedicated butler service, and rooftop pool.',
    latitude: 28.6139,
    longitude: 77.2090,
    price: 310.00,
    image_url: 'https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?auto=format&fit=crop&w=800&q=80',
    created_at: new Date(Date.now() - 3600000 * 2).toISOString()
  }
];

const getLocalHotels = () => {
  const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
  if (!stored) {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(INITIAL_FALLBACK_HOTELS));
    return INITIAL_FALLBACK_HOTELS;
  }
  try {
    return JSON.parse(stored);
  } catch (e) {
    return INITIAL_FALLBACK_HOTELS;
  }
};

const saveLocalHotels = (hotels) => {
  localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(hotels));
};

export const hotelService = {
  async uploadImage(file) {
    if (!file) return null;

    if (!isSupabaseConfigured) {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    }

    try {
      const fileExt = file.name.split('.').pop();
      const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, '_');
      const fileName = `${Date.now()}_${sanitizedName}.${fileExt}`;
      const filePath = `uploads/${fileName}`;

      const { data, error } = await supabase.storage
        .from(BUCKET_NAME)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        });

      if (error) {
        console.error('Supabase storage upload error:', error);
        throw error;
      }

      const { data: publicData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(filePath);

      return publicData.publicUrl;
    } catch (err) {
      console.error('Failed to upload image to Supabase Storage:', err);
      throw err;
    }
  },
  async getHotels({ page = 1, limit = 5, searchTitle = '', minPrice = null, maxPrice = null } = {}) {
    if (!isSupabaseConfigured) {
      let list = getLocalHotels();
      if (searchTitle && searchTitle.trim()) {
        const q = searchTitle.trim().toLowerCase();
        list = list.filter((h) => h.title.toLowerCase().includes(q));
      }
      if (minPrice !== null && minPrice !== '') {
        list = list.filter((h) => Number(h.price) >= Number(minPrice));
      }
      if (maxPrice !== null && maxPrice !== '') {
        list = list.filter((h) => Number(h.price) <= Number(maxPrice));
      }
      const count = list.length;
      const offset = (page - 1) * limit;
      const data = list.slice(offset, offset + limit);
      return {
        data,
        count,
        page,
        limit,
        totalPages: Math.ceil(count / limit) || 1,
        isDemoMode: true
      };
    }

    try {
      const offset = (page - 1) * limit;
      let query = supabase
        .from('hotels')
        .select('*', { count: 'exact' });

      if (searchTitle && searchTitle.trim() !== '') {
        query = query.ilike('title', `%${searchTitle.trim()}%`);
      }

      if (minPrice !== null && minPrice !== '' && !isNaN(minPrice)) {
        query = query.gte('price', parseFloat(minPrice));
      }

      if (maxPrice !== null && maxPrice !== '' && !isNaN(maxPrice)) {
        query = query.lte('price', parseFloat(maxPrice));
      }

      query = query
        .order('created_at', { ascending: false })
        .range(offset, offset + limit - 1);

      const { data, count, error } = await query;

      if (error) {
        throw error;
      }

      return {
        data: data || [],
        count: count || 0,
        page,
        limit,
        totalPages: Math.ceil((count || 0) / limit) || 1,
        isDemoMode: false
      };
    } catch (err) {
      console.error('Error fetching hotels from Supabase:', err);
      throw err;
    }
  },

  async getHotelById(id) {
    if (!isSupabaseConfigured) {
      const list = getLocalHotels();
      const hotel = list.find((h) => String(h.id) === String(id));
      if (!hotel) throw new Error('Hotel not found');
      return hotel;
    }

    try {
      const { data, error } = await supabase
        .from('hotels')
        .select('*')
        .eq('id', id)
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error fetching hotel ${id} from Supabase:`, err);
      throw err;
    }
  },

  async createHotel(payload, imageFile = null) {
    let imageUrl = payload.image_url || '';

    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile);
    }

    const hotelRecord = {
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : '',
      latitude: parseFloat(payload.latitude),
      longitude: parseFloat(payload.longitude),
      price: parseFloat(payload.price),
      image_url: imageUrl
    };

    if (!isSupabaseConfigured) {
      const list = getLocalHotels();
      const newHotel = {
        ...hotelRecord,
        id: Date.now(),
        created_at: new Date().toISOString()
      };
      list.unshift(newHotel);
      saveLocalHotels(list);
      return newHotel;
    }

    try {
      const { data, error } = await supabase
        .from('hotels')
        .insert([hotelRecord])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error('Error creating hotel in Supabase:', err);
      throw err;
    }
  },

 
  async updateHotel(id, payload, imageFile = null) {
    let imageUrl = payload.image_url;

    if (imageFile) {
      imageUrl = await this.uploadImage(imageFile);
    }

    const updates = {
      title: payload.title.trim(),
      description: payload.description ? payload.description.trim() : '',
      latitude: parseFloat(payload.latitude),
      longitude: parseFloat(payload.longitude),
      price: parseFloat(payload.price),
      image_url: imageUrl
    };

    if (!isSupabaseConfigured) {
      let list = getLocalHotels();
      const index = list.findIndex((h) => String(h.id) === String(id));
      if (index === -1) throw new Error('Hotel not found');
      list[index] = { ...list[index], ...updates };
      saveLocalHotels(list);
      return list[index];
    }

    try {
      const { data, error } = await supabase
        .from('hotels')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (err) {
      console.error(`Error updating hotel ${id} in Supabase:`, err);
      throw err;
    }
  },

 
  async deleteHotel(id, imageUrl = null) {
    if (!isSupabaseConfigured) {
      let list = getLocalHotels();
      list = list.filter((h) => String(h.id) !== String(id));
      saveLocalHotels(list);
      return { success: true };
    }

    try {
      const { error } = await supabase
        .from('hotels')
        .delete()
        .eq('id', id);

      if (error) throw error;

      if (imageUrl && imageUrl.includes(BUCKET_NAME)) {
        try {
          const parts = imageUrl.split(`${BUCKET_NAME}/`);
          if (parts[1]) {
            await supabase.storage.from(BUCKET_NAME).remove([decodeURIComponent(parts[1])]);
          }
        } catch (cleanupErr) {
          console.warn('Storage image cleanup error (non-fatal):', cleanupErr);
        }
      }

      return { success: true };
    } catch (err) {
      console.error(`Error deleting hotel ${id} from Supabase:`, err);
      throw err;
    }
  }
};
