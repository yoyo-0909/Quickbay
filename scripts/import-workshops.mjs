#!/usr/bin/env node
/**
 * Import a licensed workshop directory CSV into QuickBay.
 * Required env: SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY.
 * Required CLI: node scripts/import-workshops.mjs ./licensed-workshops.csv
 *
 * CSV header aliases: name, category, address, locality, city, district, state,
 * pincode, latitude, longitude, phone, email, website, source_record_id.
 * Every import requires SOURCE_NAME, SOURCE_LICENSE and SOURCE_ATTRIBUTION.
 * Do not feed scraped Google Maps data or records whose license does not permit
 * this storage/use. This script does not invent missing ratings or coordinates.
 */
import fs from 'node:fs';
import { createClient } from '@supabase/supabase-js';
import { parse } from 'csv-parse/sync';

const file = process.argv[2];
if (!file || !fs.existsSync(file)) throw new Error('Usage: node scripts/import-workshops.mjs <licensed.csv>');
for (const key of ['SUPABASE_URL','SUPABASE_SERVICE_ROLE_KEY','SOURCE_NAME','SOURCE_LICENSE','SOURCE_ATTRIBUTION','PUBLIC_DISPLAY_PERMITTED']) {
  if (!process.env[key]) throw new Error(`Missing required environment variable: ${key}`);
}
if (process.env.PUBLIC_DISPLAY_PERMITTED !== 'true') throw new Error('Set PUBLIC_DISPLAY_PERMITTED=true only when your written license allows public display.');\nconst db = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY, { auth: { persistSession:false } });
const rows = parse(fs.readFileSync(file,'utf8'), { columns:true, skip_empty_lines:true, bom:true, trim:true });
const batch = await db.from('workshop_import_batches').insert({
 source_name:process.env.SOURCE_NAME, source_license:process.env.SOURCE_LICENSE,
 source_attribution:process.env.SOURCE_ATTRIBUTION, records_received:rows.length, status:'running'
}).select('id').single();
if (batch.error) throw batch.error;
let inserted=0,rejected=0;
for (let i=0;i<rows.length;i+=250) {
 const chunk=rows.slice(i,i+250).map(r=>({
  name:r.name || r.workshop_name || r.business_name,
  category:r.category || 'Automotive workshop',
  address:r.address || '',
  locality:r.locality || null,
  city:r.city || r.town || '',
  district:r.district || null,
  state:r.state || '',
  pincode:r.pincode || r.pin_code || null,
  latitude:r.latitude ? Number(r.latitude) : null,
  longitude:r.longitude ? Number(r.longitude) : null,
  phone:r.phone || null,email:r.email || null,
  listing_source:process.env.SOURCE_NAME,
  source_record_id:r.source_record_id || r.id || (r.name+'|'+(r.address||'')+'|'+(r.city||r.town||'')+'|'+(r.state||'')).toLowerCase().replace(/\\s+/g,' ').trim(),
  source_license:process.env.SOURCE_LICENSE,
  source_attribution:process.env.SOURCE_ATTRIBUTION,
  partner_status:'pending_review',
  claim_status:'unclaimed'
 })).filter(r=>r.name && r.address && r.city && r.state);
 rejected += rows.slice(i,i+250).length-chunk.length;
 const {data,error}=await db.from('workshops').upsert(chunk,{onConflict:'listing_source,source_record_id',ignoreDuplicates:true}).select('id');
 if(error) throw error;
 inserted += data?.length || 0;
}
const {error}=await db.from('workshop_import_batches').update({records_inserted:inserted,records_rejected:rejected,status:'completed'}).eq('id',batch.data.id);
if(error) throw error;
console.log(JSON.stringify({batchId:batch.data.id,received:rows.length,inserted,rejected},null,2));
