
/* Interactive workshop directory + map. Only records permitted by the database are displayed. */
window.qbDirectoryRows = window.qbDirectoryRows || [];
window.qbDirectoryMap = null;
window.qbDirectoryMarkers = [];

explore = function () {
 return head('WORKSHOP DISCOVERY','Find a workshop near you','Search permitted workshop listings, inspect available details and view geocoded locations. No unverified business data is invented.','')+
 '<div class="notice" id="directoryNotice"><strong>Workshop directory.</strong> Loading permitted listings from QuickBay.</div>'+
 '<div class="searchbox"><input id="q" placeholder="Workshop, locality, service or PIN code" onkeydown="if(event.key===\\'Enter\\')loadWorkshopDirectory()"><button class="btn" type="button" onclick="loadWorkshopDirectory()">Search</button></div>'+
 '<div class="filters"><select id="serviceFilter"><option value="">All services</option><option value="car_repair">Car repair</option><option value="tyres">Tyres</option><option value="car_wash">Car wash</option></select><select id="ratingFilter"><option value="">Any rating</option><option value="3.5">3.5+ only</option><option value="4">4.0+ only</option></select><select id="sortFilter"><option value="name">Name</option><option value="rating">Highest rated</option></select></div>'+
 '<div class="qb-directory-layout"><section><div id="results"><div class="card">Loading permitted workshops…</div></div></section><aside class="qb-map-panel"><div class="row" style="margin-bottom:10px"><div><div class="sectiontitle">Workshop map</div><div class="muted">Tiruvallur pilot area · India</div></div><span class="tag" id="mapCount">0 locations</span></div><div id="workshopMap" class="qb-map" role="region" aria-label="Interactive workshop map"><div class="qb-map-fallback"><span class="qb-map-road qb-road-one"></span><span class="qb-map-road qb-road-two"></span><span class="qb-map-pin">⌖</span><b>Loading map</b><small>Map tiles will appear when the map service is reachable.</small></div></div><div class="muted" style="margin-top:9px">Map data © OpenStreetMap contributors. Pins appear only for listings with saved coordinates.</div></aside></div>'+
 '<div class="qb-partner-cta"><div><b>Own or manage an automotive workshop?</b><div class="muted">Apply to join QuickBay. Your application stays private until reviewed.</div></div><button class="btn light" type="button" onclick="qbOpenPartnerApplication()">Register workshop</button></div>';
};

function qbOpenPartnerApplication(){
 if(typeof partnerForm==='function'&&authUser){partnerForm();return}
 toast('Sign in to submit a workshop partner application.');
}
function qbDirectoryMapFallback(message){
 const el=document.getElementById('workshopMap');if(!el)return;
 if(window.qbDirectoryMap){try{window.qbDirectoryMap.remove()}catch(_){}window.qbDirectoryMap=null}
 el.innerHTML='<div class="qb-map-fallback"><span class="qb-map-road qb-road-one"></span><span class="qb-map-road qb-road-two"></span><span class="qb-map-pin">⌖</span><b>Tiruvallur, Tamil Nadu</b><small>'+qbSafe(message||'Interactive map is unavailable. Workshop records will still appear in the list.')+'</small><a href="https://www.openstreetmap.org/#map=13/13.1231/79.9120" target="_blank" rel="noopener">Open map in OpenStreetMap ↗</a></div>';
}
function qbInitDirectoryMap(rows){
 const el=document.getElementById('workshopMap');if(!el)return;
 const geocoded=(rows||[]).filter(w=>Number.isFinite(Number(w.latitude))&&Number.isFinite(Number(w.longitude)));
 const counter=document.getElementById('mapCount');if(counter)counter.textContent=geocoded.length+' locations';
 if(!window.L||typeof window.L.map!=='function'){qbDirectoryMapFallback('Map library did not load. Open the map separately or use the workshop list.');return}
 if(window.qbDirectoryMap){try{window.qbDirectoryMap.remove()}catch(_){}window.qbDirectoryMap=null}
 el.innerHTML='';
 const map=window.L.map(el,{scrollWheelZoom:false,preferCanvas:true}).setView([13.1231,79.9120],12);
 window.qbDirectoryMap=map;window.qbDirectoryMarkers=[];
 window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{
  maxZoom:19,attribution:'&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>'
 }).addTo(map);
 geocoded.forEach(w=>{
  const marker=window.L.marker([Number(w.latitude),Number(w.longitude)]).addTo(map);
  marker.bindPopup('<b>'+qbSafe(w.name)+'</b><br>'+qbSafe([w.locality,w.city,w.district].filter(Boolean).join(', '))+'<br><button type="button" class="qb-map-detail" onclick="qbOpenWorkshopDetails(\\''+qbSafe(w.id)+'\\')">View details</button>');
  window.qbDirectoryMarkers.push(marker);
 });
 if(geocoded.length===1)map.setView([Number(geocoded[0].latitude),Number(geocoded[0].longitude)],14);
 else if(geocoded.length>1){const group=window.L.featureGroup(window.qbDirectoryMarkers);map.fitBounds(group.getBounds().pad(.18),{maxZoom:14})}
 setTimeout(()=>map.invalidateSize(),120);
}
function qbOpenWorkshopDetails(id){
 const w=(window.qbDirectoryRows||[]).find(x=>String(x.id)===String(id));if(!w)return;
 const address=[w.address,w.locality,w.city,w.district,w.state,w.pincode].filter(Boolean).join(', ');
 const services=Array.isArray(w.services)?w.services:Array.isArray(w.supported_brands)?w.supported_brands:[];
 const hours=w.operating_hours&&typeof w.operating_hours==='object'?Object.entries(w.operating_hours).map(([day,value])=>'<div class="row"><span>'+qbSafe(day)+'</span><span>'+qbSafe(typeof value==='string'?value:JSON.stringify(value))+'</span></div>').join(''):'Not provided';
 const rating=w.rating==null?'Not provided':'★ '+qbSafe(w.rating)+(w.review_count!=null?' · '+qbSafe(w.review_count)+' reviews':'');
 const phone=w.phone?'<a href="tel:'+qbSafe(w.phone)+'">'+qbSafe(w.phone)+'</a>':'Not provided';
 const website=w.website?'<a href="'+qbSafe(w.website)+'" target="_blank" rel="noopener">Visit website ↗</a>':'Not provided';
 const verified=w.is_quickbay_verified&&w.partner_status==='approved';
 modal(qbSafe(w.name),'Workshop information · '+(verified?'QuickBay verified':w.partner_status==='approved'?'Registered partner':'Not QuickBay verified'),
 '<div class="card"><div class="row"><b>Directory status</b><span class="status '+(verified?'good':'warn')+'">'+(verified?'QuickBay verified':w.partner_status==='approved'?'Registered partner':'Third-party listing · not verified')+'</span></div>'+
 '<p>'+qbSafe(w.description||'No workshop description has been provided.')+'</p>'+
 '<div class="row"><b>Address</b><span style="text-align:right">'+qbSafe(address||'Not provided')+'</span></div>'+
 '<div class="row"><b>Category</b><span>'+qbSafe(w.category||'Not provided')+'</span></div>'+
 '<div class="row"><b>Rating</b><span>'+rating+'</span></div>'+
 '<div class="row"><b>Phone</b><span>'+phone+'</span></div>'+
 '<div class="row"><b>Email</b><span>'+(w.email?qbSafe(w.email):'Not provided')+'</span></div>'+
 '<div class="row"><b>Website</b><span>'+website+'</span></div>'+
 '<div style="margin-top:14px"><b>Services</b><div class="muted">'+qbSafe((w.services||[]).join(', ')||'Not provided')+'</div></div>'+
 '<div style="margin-top:14px"><b>Supported brands</b><div class="muted">'+qbSafe((w.supported_brands||[]).join(', ')||'Not provided')+'</div></div>'+
 '<div style="margin-top:14px"><b>Operating hours</b>'+hours+'</div>'+
 '<div class="muted" style="margin-top:14px">Listing source: '+qbSafe(w.listing_source||'Not recorded')+'<br>'+qbSafe(w.source_attribution||'')+'</div></div>'+
 (w.latitude!=null&&w.longitude!=null?'<a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="https://www.openstreetmap.org/directions?to='+encodeURIComponent(w.latitude+','+w.longitude)+'" target="_blank" rel="noopener">Directions ↗</a>':''));
}
loadWorkshopDirectory = async function(){
 const target=document.getElementById('results');if(!target)return;
 if(!supabaseClient){target.innerHTML=empty('⌖','Backend connection required','QuickBay could not connect to its workshop directory. Please refresh and try again.');qbDirectoryMapFallback('Connect to QuickBay to load workshop listings.');return}
 target.innerHTML='<div class="card">Loading permitted workshop listings…</div>';
 const search=(document.getElementById('q')?.value||'').trim().replace(/[^a-zA-Z0-9\\s-]/g,' ').slice(0,80);
 let query=supabaseClient.from('workshops').select('id,name,category,description,address,locality,city,district,state,pincode,latitude,longitude,rating,review_count,services,supported_brands,phone,email,website,operating_hours,listing_source,source_attribution,source_license,partner_status,is_quickbay_verified,public_display_permitted').eq('public_display_permitted',true).neq('partner_status','suspended');
 if(search)query=query.or('name.ilike.%'+search+'%,locality.ilike.%'+search+'%,city.ilike.%'+search+'%,district.ilike.%'+search+'%,state.ilike.%'+search+'%,pincode.ilike.%'+search+'%,address.ilike.%'+search+'%');
 if(document.getElementById('serviceFilter')?.value)query=query.eq('category',document.getElementById('serviceFilter').value);
 if(document.getElementById('ratingFilter')?.value)query=query.gte('rating',Number(document.getElementById('ratingFilter').value));
 const {data,error}=await query.order('name').limit(200);
 if(error){
  target.innerHTML=empty('⚠','Could not load workshop listings',qbSafe(error.message)+' Check directory permissions and database connectivity.');
  const notice=document.getElementById('directoryNotice');if(notice)notice.innerHTML='<strong>Directory connection issue.</strong> '+qbSafe(error.message);
  qbInitDirectoryMap([]);return;
 }
 let rows=data||[];
 if(document.getElementById('sortFilter')?.value==='rating')rows=rows.slice().sort((a,b)=>(Number(b.rating)||-1)-(Number(a.rating)||-1));
 window.qbDirectoryRows=rows;
 const notice=document.getElementById('directoryNotice');
 if(notice)notice.innerHTML='<strong>'+rows.length+' permitted listings found.</strong> QuickBay verification is shown separately from third-party listing status.';
 qbInitDirectoryMap(rows);
 if(!rows.length){
  target.innerHTML=empty('⌖','No workshops listed yet','There are currently no permitted workshop records in QuickBay. The map shows the Tiruvallur pilot area; no workshop pins are displayed until genuine listings are approved.');
  return;
 }
 const saved=store.get('saved_workshops',[]);
 target.innerHTML='<div class="workshoplist">'+rows.map(w=>{
  const address=[w.address,w.locality,w.city,w.district,w.state,w.pincode].filter(Boolean).join(', ');
  const rating=w.rating==null?'':'<div class="muted">★ '+qbSafe(w.rating)+(w.review_count!=null?' · '+qbSafe(w.review_count)+' reviews':'')+'</div>';
  const verified=w.is_quickbay_verified&&w.partner_status==='approved';
  const services=(w.services||[]).slice(0,4).map(s=>'<span class="tag">'+qbSafe(s)+'</span>').join('');
  return '<article class="workshop"><div class="shopicon">🔧</div><div><div class="shopname">'+qbSafe(w.name)+'</div><div class="muted">'+qbSafe(address||'Address not supplied')+'</div>'+rating+'<div><span class="tag">'+qbSafe(w.category||'Automotive service')+'</span><span class="tag">'+(verified?'QuickBay verified':w.partner_status==='approved'?'Registered partner':'Not QuickBay verified')+'</span>'+services+'</div><div class="muted">'+qbSafe(w.source_attribution||'')+'</div></div><div class="actions"><button type="button" class="btn light" data-id="'+qbSafe(w.id)+'" onclick="qbOpenWorkshopDetails(this.dataset.id)">Details</button><button type="button" class="btn light" data-id="'+qbSafe(w.id)+'" onclick="toggleSavedWorkshop(this.dataset.id)">'+(saved.includes(w.id)?'Saved':'♡ Save')+'</button>'+(w.latitude!=null&&w.longitude!=null?'<button type="button" class="btn light" data-id="'+qbSafe(w.id)+'" onclick="qbFocusWorkshop(this.dataset.id)">Map</button>':'')+'</div></article>';
 }).join('')+'</div>';
};
function qbFocusWorkshop(id){
 const w=(window.qbDirectoryRows||[]).find(x=>String(x.id)===String(id));if(!w||!window.qbDirectoryMap)return;
 window.qbDirectoryMap.setView([Number(w.latitude),Number(w.longitude)],16);
 const index=(window.qbDirectoryRows||[]).filter(x=>x.latitude!=null&&x.longitude!=null).findIndex(x=>String(x.id)===String(id));
 if(window.qbDirectoryMarkers[index])window.qbDirectoryMarkers[index].openPopup();
}
