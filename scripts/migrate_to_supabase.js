// ==============================================================================
// HOTEL DATA MIGRATION SCRIPT (Local PostgreSQL -> Supabase)
// ==============================================================================
// This standalone script copies existing hotel records from an existing
// PostgreSQL database into your target Supabase project.
//
// Review this file carefully before running.
// Run with: node scripts/migrate_to_supabase.js
// ==============================================================================

import { createClient } from '@supabase/supabase-js';

// Configuration (Read from environment or set here for one-time run)
const SOURCE_PG_CONFIG = {
  host: process.env.SOURCE_PG_HOST || 'localhost',
  port: parseInt(process.env.SOURCE_PG_PORT || '5432'),
  database: process.env.SOURCE_PG_DATABASE || 'hotels_db',
  user: process.env.SOURCE_PG_USER || 'postgres',
  password: process.env.SOURCE_PG_PASSWORD || 'postgres'
};

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;

async function runMigration() {
  console.log('--- STARTING HOTEL DATA MIGRATION ---');

  if (!SUPABASE_URL || !SUPABASE_KEY || SUPABASE_URL.includes('your-project-id')) {
    console.error('ERROR: Supabase URL and Key are required in environment variables to run migration.');
    console.log('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) before running.');
    process.exit(1);
  }

  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  let pgClient;
  try {
    // Dynamic import so pg is only required if running this script
    const pg = await import('pg');
    const { Client } = pg.default || pg;
    pgClient = new Client(SOURCE_PG_CONFIG);
    await pgClient.connect();
    console.log('✓ Connected to source PostgreSQL database.');
  } catch (err) {
    console.warn('Notice: Could not connect to local PostgreSQL instance:', err.message);
    console.log('If you only have sample data, you can run supabase/seed.sql directly in the Supabase SQL editor instead.');
    return;
  }

  try {
    // 1. Fetch existing hotels from local PostgreSQL
    const res = await pgClient.query('SELECT title, description, latitude, longitude, price, image_url, created_at FROM hotels');
    const sourceRows = res.rows;
    console.log(`Found ${sourceRows.length} existing hotel records to migrate.`);

    if (sourceRows.length === 0) {
      console.log('No rows to migrate.');
      return;
    }

    // 2. Batch insert into Supabase
    console.log('Inserting records into Supabase hotels table...');
    const { data, error } = await supabase
      .from('hotels')
      .insert(sourceRows)
      .select();

    if (error) {
      console.error('Migration failed during Supabase insert:', error);
    } else {
      console.log(`✓ Successfully migrated ${data.length} hotel records to Supabase!`);
    }
  } catch (queryErr) {
    console.error('Error querying source database:', queryErr);
  } finally {
    if (pgClient) {
      await pgClient.end();
    }
  }
}

runMigration();
