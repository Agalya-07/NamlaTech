# Hotel Listing CRUD Application (React + Redux + Supabase + Vercel)

A responsive single-page hotel listing and management application built for **NamlaTech India Private Limited**. Migrated from local PostgreSQL & file storage to **Supabase** for database, Row Level Security (RLS), and Cloud Storage, optimized for immediate deployment on **Vercel**.

---

## 🚀 Key Features

- **Frontend Technology Stack**: React 18 + Redux Toolkit + Vite (SPA)
- **Responsive Layout**: Designed after the MDB layout specification with a left filters sidebar, main card-based listing, and numbered pagination.
- **Hotel Cards**: Displays verified badges, high-res images with fallback placeholders, formatted price per night, coordinates, snippets, and quick action buttons.
- **Single Reusable Add/Edit Form**:
  - Direct file upload to Supabase Storage (`hotel-images` bucket).
  - Instant image preview before upload (`URL.createObjectURL`).
  - Browser Geolocation autofill helper for coordinates.
  - Comprehensive field validation (Title length, coordinate boundaries, positive pricing).
- **Search & Price Filter**:
  - Real-time case-insensitive title search (`ilike`).
  - Price range filter with Min/Max inputs and quick-filter presets.
- **Pagination**: Offset and limit-based pagination with numbered controls and range summaries.
- **Hotel Detail Page**:
  - Detailed view of hotel amenities and descriptions.
  - **Interactive Geolocation Map** powered by Leaflet & OpenStreetMap, centered on the hotel's latitude & longitude.
- **SEO & Accessibility**:
  - Dynamic page titles and Open Graph metadata using `react-helmet-async`.
  - Accessible `alt` tags on all images.
- **Separate URL Routes (No In-Page Toggle)**:
  - **User Portal (`/user`)**: `http://localhost:3000/user` — Dedicated public guest view. Allows searching, price range filtering, viewing cards, and inspecting the Leaflet map detail page. Management controls (Add/Edit/Delete) are completely hidden.
  - **Admin Panel (`/admin`)**: `http://localhost:3000/admin` — Dedicated administration view. Displays the "Add Hotel" button, "Edit" and "Delete" actions on cards, and full CRUD modal controls.
  - **Root URL (`/`)**: Automatically redirects to `/user`.

---

## 🗄️ Supabase Setup & Migration

### 1. Database Schema & RLS Policies
1. Go to your [Supabase Dashboard](https://app.supabase.com) and select your project.
2. Navigate to **SQL Editor** in the left sidebar.
3. Open the file [`supabase/schema.sql`](supabase/schema.sql) in this repository, copy its contents, and click **Run**.
4. This script creates:
   - The `hotels` table (`id`, `title`, `description`, `latitude`, `longitude`, `price`, `image_url`, `created_at`).
   - Indexes on `title`, `price`, and `created_at`.
   - **Row Level Security (RLS)** enabled on `hotels`.
   - Policies allowing public `SELECT`, plus temporary open policies for `INSERT`, `UPDATE`, and `DELETE`.
   - The public storage bucket **`hotel-images`** and storage upload/read policies.

### 2. Optional: Seed Initial Data
If you would like sample hotel listings loaded into your database:
- Run [`supabase/seed.sql`](supabase/seed.sql) in your Supabase **SQL Editor**.

---

## 🔑 Environment Variables Configuration

Create a `.env` file in the root directory (or copy from [`.env.example`](.env.example)):

```bash
cp .env.example .env
```

Fill in your project credentials from **Supabase Dashboard → Project Settings → API**:

```env
# Frontend (Vite format) - Safe to expose to client bundle
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Backend / Server-side only (Optional, never expose to client bundle)
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

> **Security Note**: Only `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are bundled into the frontend. The `SUPABASE_SERVICE_ROLE_KEY` is strictly for server scripts and is never exposed in the client build.

---

## 💻 Local Development & Testing

```bash
# 1. Install dependencies
npm install

# 2. Start Vite development server
npm run dev
```

Visit `http://localhost:3000` to interact with the application.

### Optional: Express Backend & Migration Script
If you want to run the optional Express server or migrate from a pre-existing PostgreSQL database:

```bash
# Start optional Express backend
npm run server

# Run one-time PostgreSQL to Supabase migration script
npm run migrate
```

---

## 🌐 Vercel Deployment Guide

The application is completely configured for one-click deployment on **Vercel**.

### Step 1: Push Code to Git
Initialize git and push to GitHub, GitLab, or Bitbucket:
```bash
git init
git add .
git commit -m "feat: Hotel listing CRUD app with Supabase and Vercel support"
git remote add origin <your-repo-url>
git push -u origin main
```

### Step 2: Deploy to Vercel
1. Log in to [Vercel](https://vercel.com) and click **"Add New Project"**.
2. Select your repository.
3. In **Project Settings → Environment Variables**, add the following variables for all environments (**Production**, **Preview**, **Development**):
   - `VITE_SUPABASE_URL`: Your Supabase Project URL (`https://xyz.supabase.co`)
   - `VITE_SUPABASE_ANON_KEY`: Your Supabase anon/public API key
4. Framework Preset will auto-detect as **Vite**.
5. Click **Deploy**.

### SPA Client-Side Routing
The provided [`vercel.json`](vercel.json) handles client-side route fallback to `index.html`:
```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```
This ensures routes like `/hotels/:id` work seamlessly on direct page reload.

---

## 📁 Project Structure

```text
NamlaTech project/
├── .env.example              # Documented environment variable template
├── .gitignore                # Protects .env, node_modules, and dist
├── index.html                # HTML entry point with Leaflet & typography
├── package.json              # Project scripts and dependencies
├── vercel.json               # Vercel SPA routing rewrite rules
├── vite.config.js            # Vite configuration
├── scripts/
│   └── migrate_to_supabase.js# Optional migration script from Postgres to Supabase
├── server/
│   └── index.js              # Optional Express REST backend
├── supabase/
│   ├── schema.sql            # Table DDL, Indexes, RLS & Storage policies
│   └── seed.sql              # Sample hotel listings
└── src/
    ├── lib/
    │   └── supabaseClient.js # Shared Supabase client instance
    ├── services/
    │   └── hotelService.js   # Supabase queries (CRUD, search, filters, storage)
    ├── redux/
    │   ├── store.js          # Redux Store
    │   └── hotelSlice.js     # Redux state & async thunks
    ├── components/
    │   ├── Navbar.jsx        # Navigation header with Supabase status indicator
    │   ├── FiltersSidebar.jsx# Search by title & price range filter
    │   ├── HotelCard.jsx     # Responsive listing card with fallback image
    │   ├── HotelForm.jsx     # Single reusable Add/Edit form with live preview
    │   ├── Pagination.jsx    # Paginated navigation controls
    │   └── DeleteConfirmModal.jsx # Delete prompt and success alert
    ├── pages/
    │   ├── HotelListPage.jsx # Main catalog view
    │   └── HotelDetailPage.jsx # Full details & Leaflet map view
    ├── App.jsx               # SPA Routes
    ├── main.jsx              # Application bootstrap
    └── index.css             # MDB-inspired CSS styling
```
