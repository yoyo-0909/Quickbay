#!/usr/bin/env node
/**
 * Import a rights-cleared workshop directory CSV into Supabase.
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, SOURCE_NAME,
 * SOURCE_LICENSE, SOURCE_ATTRIBUTION, PUBLIC_DISPLAY_PERMITTED=true.
 * Service-role key is server-only. Never put it in frontend code.
 */
import fs from 'node:fs';
import crypto from 'node:crypto';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) throw new Error('Usage: node scripts/import-workshops.mjs <licensed.csv>');
for (const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SOURCE_NAME','SOURCE_LICENSE','SOURCE_ATTRIBUTION','PUBLIC_DISPLAY_PERMITTED']) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.PUBLIC_DISPLAY_PERMITTED !== 'true') {
  throw new Error('Set PUBLIC_DISPLAY_PERMITTED=true only after confirming the source license permits public display.');
}
const db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession: false } });
const rows = parse(fs.readFileSync(file, 'utf8'), { columns: true, skip_empty_lines: true, bom: true, trim: true });
const batch = await db.from('workshop_import_batches').insert({
  source_name: process.env.SOURCE_NAME, source_license: process.env.SOURCE_LICENSE,
  source_attribution: process.env.SOURCE_ATTRIBUTION, records_received: rows.length, status: 'running'
}).select('id').single();
if (batch.error) throw batch.error;
let inserted = 0, rejected = 0;
for (let i = 0; i < rows.length; i += 250) {
  const chunk = rows.slice(i, i + 250).map(r => {
    const name = (r.name || r.workshop_name || r.business_name || '').trim();
    const address = r.address || null;
    const city = r.city || r.town || null;
    const state = r.state || null;
    const stable = [name, address || '', city || '', state || '', r.latitude || '', r.longitude || ''].join('|').toLowerCase().replace(/\s+/g, ' ').trim();
    const sourceId = r.source_record_id || r.id || crypto.createHash('sha256').update(stable).digest('hex');
    const lat = r.latitude === '' || r.latitude == null ? null : Number(r.latitude);
    const lon = r.longitude === '' || r.longitude == null ? null : Number(r.longitude);
    return {
      name, category: r.category || 'Automotive workshop', address,
      locality: r.locality || null, city, district: r.district || null, state,
      pincode: r.pincode || r.pin_code || null,
      latitude: Number.isFinite(lat) ? lat : null, longitude: Number.isFinite(lon) ? lon : null,
      phone: r.phone || null, email: r.email || null, website: r.website || null,
      listing_source: process.env.SOURCE_NAME, source_record_id: sourceId,
      source_license: process.env.SOURCE_LICENSE, source_attribution: process.env.SOURCE_ATTRIBUTION,
      public_display_permitted: true, phone_source: r.phone ? process.env.SOURCE_NAME : null,
      rating: r.rating && Number.isFinite(Number(r.rating)) ? Number(r.rating) : null,
      review_count: r.review_count && Number.isFinite(Number(r.review_count)) ? Number(r.review_count) : null,
      rating_source: r.rating ? process.env.SOURCE_NAME : null,
      partner_status: 'pending_review', claim_status: 'unclaimed'
    };
  }).filter(r => r.name && ((r.latitude !== null && r.longitude !== null) || r.address));
  rejected += rows.slice(i, i + 250).length - chunk.length;
  if (!chunk.length) continue;
  const { data, error } = await db.from('workshops')
    .upsert(chunk, { onConflict: 'listing_source,source_record_id', ignoreDuplicates: true })
    .select('id');
  if (error) throw error;
  inserted += data?.length || 0;
}
const { error } = await db.from('workshop_import_batches').update({
  records_inserted: inserted, records_rejected: rejected, status: 'completed'
}).eq('id', batch.data.id);
if (error) throw error;
console.log(JSON.stringify({ batchId: batch.data.id, received: rows.length, inserted, rejected }, null, 2));
