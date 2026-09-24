// ==============================================================================
// HOTEL LISTING APP - OPTIONAL NODE/EXPRESS BACKEND SERVER
// ==============================================================================
// NOTE: Since the frontend now talks directly to Supabase via @supabase/supabase-js
// with Row Level Security (RLS) and Supabase Storage, this Express server is NOT
// required for basic Vercel hosting of the SPA.
//
// However, if you choose to deploy a dedicated Express backend (e.g. on Render,
// Railway, or Fly.io) or use it for server-side admin tasks and image cleanup,
// this server provides all endpoints from the NamlaTech spec:
//   - POST   /api/hotels       (Create with validation)
//   - GET    /api/hotels       (List with title search, price filter & pagination)
//   - GET    /api/hotels/:id   (Detail by ID)
//   - PUT    /api/hotels/:id   (Update by ID)
//   - DELETE /api/hotels/:id   (Delete by ID)
// ==============================================================================

import express from 'express';
import cors from 'cors';
import { createClient } from '@supabase/supabase-js';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Initialize Supabase Server Client (Uses Service Role Key if available)
const supabaseUrl = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

let supabase = null;
if (supabaseUrl && supabaseKey) {
  supabase = createClient(supabaseUrl, supabaseKey);
}

// ------------------------------------------------------------------------------
// 1. GET /api/hotels (List with search, price filters, and pagination)
// ------------------------------------------------------------------------------
app.get('/api/hotels', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 5;
    const search = req.query.search || '';
    const minPrice = req.query.minPrice;
    const maxPrice = req.query.maxPrice;
    const offset = (page - 1) * limit;

    if (!supabase) {
      return res.status(500).json({ error: 'Supabase credentials not configured on server' });
    }

    let query = supabase
      .from('hotels')
      .select('*', { count: 'exact' });

    // Case-insensitive title search
    if (search.trim()) {
      query = query.ilike('title', `%${search.trim()}%`);
    }

    // Min price filter
    if (minPrice !== undefined && minPrice !== '') {
      query = query.gte('price', parseFloat(minPrice));
    }

    // Max price filter
    if (maxPrice !== undefined && maxPrice !== '') {
      query = query.lte('price', parseFloat(maxPrice));
    }

    query = query
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    const { data, count, error } = await query;

    if (error) throw error;

    res.json({
      data,
      count,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit)
    });
  } catch (err) {
    console.error('GET /api/hotels error:', err);
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 2. GET /api/hotels/:id (Single hotel details)
// ------------------------------------------------------------------------------
app.get('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('hotels')
      .select('*')
      .eq('id', id)
      .single();

    if (error) return res.status(404).json({ error: 'Hotel not found' });
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 3. POST /api/hotels (Create hotel with validation)
// ------------------------------------------------------------------------------
app.post('/api/hotels', async (req, res) => {
  try {
    const { title, description, latitude, longitude, price, image_url } = req.body;

    // Validation
    if (!title || !title.trim()) {
      return res.status(400).json({ error: 'Title is required' });
    }
    if (latitude === undefined || isNaN(parseFloat(latitude))) {
      return res.status(400).json({ error: 'Valid latitude is required' });
    }
    if (longitude === undefined || isNaN(parseFloat(longitude))) {
      return res.status(400).json({ error: 'Valid longitude is required' });
    }
    if (price === undefined || isNaN(parseFloat(price)) || parseFloat(price) < 0) {
      return res.status(400).json({ error: 'Valid positive price is required' });
    }

    const { data, error } = await supabase
      .from('hotels')
      .insert([{
        title: title.trim(),
        description: description ? description.trim() : '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        price: parseFloat(price),
        image_url: image_url || ''
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 4. PUT /api/hotels/:id (Update hotel by ID)
// ------------------------------------------------------------------------------
app.put('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { title, description, latitude, longitude, price, image_url } = req.body;

    const updates = {};
    if (title !== undefined) updates.title = title.trim();
    if (description !== undefined) updates.description = description.trim();
    if (latitude !== undefined) updates.latitude = parseFloat(latitude);
    if (longitude !== undefined) updates.longitude = parseFloat(longitude);
    if (price !== undefined) updates.price = parseFloat(price);
    if (image_url !== undefined) updates.image_url = image_url;

    const { data, error } = await supabase
      .from('hotels')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ------------------------------------------------------------------------------
// 5. DELETE /api/hotels/:id (Delete hotel by ID)
// ------------------------------------------------------------------------------
app.delete('/api/hotels/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { error } = await supabase
      .from('hotels')
      .delete()
      .eq('id', id);

    if (error) throw error;
    res.json({ success: true, message: 'Hotel listing deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Start Express server
app.listen(PORT, () => {
  console.log(`Hotel Express Server running on http://localhost:${PORT}`);
});
