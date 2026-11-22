/* QuickBay customer UX: location-aware public directory, empty states and India vehicle picker. */
(function(){
 const css='.sidebar{z-index:50}.nav{z-index:55}.qb-location-panel{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px;margin:12px 0;border:1px solid #e5e7eb;border-radius:16px;background:#fff}.qb-location-copy{flex:1;min-width:180px}.qb-location-copy strong,.qb-location-copy small{display:block}.qb-location-copy small,.qb-location-status{font-size:12px;color:#667085;margin-top:4px}.qb-directory-map{width:100%;height:360px;min-height:300px;border-radius:16px;overflow:hidden;background:#eef1f4}.qb-nearby-list{display:grid;gap:12px;margin-top:14px}.qb-nearby-card{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:start;padding:15px;border:1px solid #e5e7eb;border-radius:15px;background:#fff}.qb-nearby-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#f1edff;font-size:20px}.qb-nearby-title{font-weight:750}.qb-nearby-meta{font-size:13px;color:#667085;margin-top:4px}.qb-nearby-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.qb-source-tag{font-size:11px;padding:4px 7px;border-radius:999px;background:#f3f4f6;color:#475467}.qb-vehicle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.qb-vehicle-grid label{display:grid;gap:6px;font-size:13px;font-weight:650}.qb-vehicle-grid .full{grid-column:1/-1}#nav button{touch-action:manipulation;pointer-events:auto;cursor:pointer}#nav{position:relative;z-index:30}@media(max-width:560px){.qb-nearby-card{grid-template-columns:38px minmax(0,1fr)}.qb-nearby-card .actions{grid-column:2}.qb-directory-map{height:310px}.qb-vehicle-grid{grid-template-columns:1fr}}';
 const st=document.createElement('style');st.textContent=css;document.head.appendChild(st);
 const CARS={
 'Maruti Suzuki':['Alto K10','S-Presso','Celerio','Wagon R','Swift','Dzire','Baleno','Fronx','Brezza','Grand Vitara','Jimny','Ertiga','XL6','Invicto','Eeco','Ignis','Ciaz'],
 'Hyundai':['Grand i10 Nios','i20','Aura','Exter','Venue','Creta','Alcazar','Verna','Tucson','Ioniq 5'],
 'Tata':['Tiago','Tigor','Altroz','Punch','Nexon','Curvv','Harrier','Safari','Tiago EV','Tigor EV','Nexon EV','Punch EV','Curvv EV'],
 'Mahindra':['Bolero','Bolero Neo','Thar','Thar Roxx','Scorpio Classic','Scorpio-N','XUV 3XO','XUV 700','XUV400 EV','BE 6','XEV 9e','Marazzo'],
 'Kia':['Sonet','Seltos','Carens','Carnival','EV6','EV9','Syros'],
 'Toyota':['Glanza','Taisor','Urban Cruiser Hyryder','Rumion','Innova Crysta','Innova Hycross','Fortuner','Hilux','Camry','Vellfire','Land Cruiser 300'],
 'Honda':['Amaze','City','Elevate'],
 'MG':['Comet EV','Windsor EV','Astor','Hector','Hector Plus','Gloster','ZS EV'],
 'Renault':['Kwid','Triber','Kiger'],'Nissan':['Magnite','X-Trail'],
 'Skoda':['Kylaq','Slavia','Kushaq','Kodiaq','Superb'],'Volkswagen':['Virtus','Taigun','Tiguan','Golf GTI'],
 'Jeep':['Compass','Meridian','Wrangler','Grand Cherokee'],'Citroën':['C3','ë-C3','C3 Aircross','Basalt'],
 'BYD':['Atto 3','eMAX 7','Seal','Sealion 7'],
 'BMW':['2 Series Gran Coupe','3 Series','5 Series','7 Series','X1','X3','X5','X7','iX1','iX','i7','M2','M4'],
 'Mercedes-Benz':['A-Class Limousine','C-Class','E-Class','S-Class','GLA','GLB','GLC','GLE','GLS','EQA','EQB','EQE SUV','EQS SUV'],
 'Audi':['A4','A6','Q3','Q5','Q7','Q8','Q8 e-tron','e-tron GT'],'Volvo':['EX30','XC40','EC40','XC60','XC90'],
 'Lexus':['ES','NX','RX','LM','LS','LX'],'Porsche':['Macan','Cayenne','Panamera','Taycan','911'],
 'MINI':['Cooper S','Countryman'],'Land Rover':['Defender','Discovery Sport','Discovery','Range Rover Evoque','Range Rover Velar','Range Rover Sport','Range Rover'],
 'Jaguar':['F-Pace','I-Pace'],'Force Motors':['Gurkha','Trax Cruiser'],'Isuzu':['D-Max V-Cross','MU-X'],
 'Kinetic Green':['E-Luna'],'Pravaig':['Defy'],'Strom Motors':['R3']
 };
 window.qbIndiaCarCatalogue=CARS;
 window.qbUpdateVehicleModels=function(make){const el=document.getElementById('qbVehicleModel');if(el)el.innerHTML='<option value="">Select model</option>'+(CARS[make]||[]).map(x=>'<option value="'+qbSafe(x)+'">'+qbSafe(x)+'</option>').join('')};
 window.vehicleForm=function(){
  const makes=Object.keys(CARS).sort((a,b)=>a.localeCompare(b)),years=Array.from({length:new Date().getFullYear()-1989},(_,i)=>new Date().getFullYear()-i);
  modal('Add a vehicle','Choose your car brand, model and manufacturing year.',
   '<form onsubmit="saveVehicle(event)"><div class="qb-vehicle-grid">'+
   '<label class="full">Car brand<select class="field" name="make" required onchange="qbUpdateVehicleModels(this.value)"><option value="">Select car brand</option>'+makes.map(m=>'<option value="'+qbSafe(m)+'">'+qbSafe(m)+'</option>').join('')+'</select></label>'+
   '<label class="full">Car model<select class="field" id="qbVehicleModel" name="model" required><option value="">Select brand first</option></select></label>'+
   '<label>Manufacturing year<select class="field" name="year" required><option value="">Select year</option>'+years.map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select></label>'+
   '<label>Variant<input class="field" name="variant" placeholder="e.g. ZXi, SX(O), EV LR"></label>'+
   '<label class="full">Registration number<input class="field" name="reg" placeholder="TN 00 AB 1234"></label>'+
   '<label>Fuel type<select class="field" name="fuel"><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option><option>LPG</option></select></label>'+
   '<label>Transmission<select class="field" name="trans"><option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option></select></label>'+
   '<label class="full">Current odometer (km)<input class="field" name="odo" type="number" min="0" placeholder="e.g. 24000"></label></div>'+
   '<div class="notice" style="margin-top:14px">Manufacturing year means the year your vehicle was made. Model list covers many current India-market cars; discontinued and limited editions may be missing.</div><button class="btn" style="margin-top:14px">Save vehicle</button></form>');
 };
 let location=null,rows=[],map=null,markers=[];const defaultCenter=[13.1231,79.9120],endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const km=(a,b,c,d)=>{const r=6371,p=x=>x*Math.PI/180,dl=p(c-a),dn=p(d-b),v=Math.sin(dl/2)**2+Math.cos(p(a))*Math.cos(p(c))*Math.sin(dn/2)**2;return 2*r*Math.asin(Math.sqrt(v))};
 const setStatus=s=>{const el=document.getElementById('qbLocationStatus');if(el)el.textContent=s};
 window.explore=function(){return head('WORKSHOP DISCOVERY','Find nearby workshops & service centres','Allow location access to discover nearby car repair shops, authorised service centres and tyre services.','')+
 '<div class="qb-location-panel"><div class="qb-location-copy"><strong>Find services around your exact location</strong><small id="qbLocationStatus">Location is not enabled. QuickBay asks permission only when you tap the button.</small></div><button class="btn" type="button" onclick="qbRequestLocation()">⌖ Use my location</button></div>'+
 '<div class="searchbox"><input id="q" placeholder="Search workshop, service or locality" onkeydown="if(event.key===\'Enter\')loadWorkshopDirectory()"><button class="btn" type="button" onclick="loadWorkshopDirectory()">Search</button></div>'+
 '<div class="filters"><select id="serviceFilter"><option value="">All services</option><option value="tyres">Tyres & wheels</option><option value="motorcycle">Two-wheeler service</option></select><select id="sortFilter"><option value="distance">Nearest first</option><option value="name">Name</option></select></div>'+
 '<div class="sectiontitle" style="margin:14px 0 8px">Nearby results</div><div id="results"><div class="card">Tap “Use my location” to find nearby services.</div></div>'+
 '<div class="sectiontitle" style="margin:18px 0 8px">Map</div><div id="workshopMap" class="qb-directory-map" role="region" aria-label="Nearby workshop map"></div>'+
 '<div class="muted" style="margin-top:8px">Map © OpenStreetMap contributors. Listings are sourced from OpenStreetMap and are not QuickBay-verified. Confirm details before visiting.</div>'+
 '<div class="qb-partner-cta" style="margin-top:16px"><div><b>Own or manage an automotive workshop?</b><div class="muted">Apply to join QuickBay. Applications are not automatically published.</div></div><button class="btn light" onclick="qbOpenPartnerApplication()">Register workshop</button></div>'};
 window.qbRequestLocation=function(){
  if(!navigator.geolocation){setStatus('This browser does not support location access.');return}
  setStatus('Requesting location permission…');
  navigator.geolocation.getCurrentPosition(p=>{location={lat:p.coords.latitude,lon:p.coords.longitude};setStatus('Location enabled · accuracy about '+Math.max(1,Math.round(p.coords.accuracy))+' m');loadWorkshopDirectory()},
   e=>{const msg=e.code===1?'Location permission denied. Enable location for this website in browser settings.':e.code===2?'Location unavailable. Check device location settings.':'Location request timed out. Try again.';setStatus(msg);toast(msg)},
   {enableHighAccuracy:true,timeout:15000,maximumAge:60000});
 };
 function normalise(el){
  const t=el.tags||{},lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon,name=t.name||t.brand||t.operator;
  if(!name||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lon)))return null;
  return {id:'osm-'+el.type+'-'+el.id,name,category:t.shop==='tyres'?'Tyres & wheels':t.shop==='motorcycle'?'Two-wheeler service':'Car repair & service',
   latitude:Number(lat),longitude:Number(lon),address:[t['addr:housenumber'],t['addr:street'],t['addr:suburb'],t['addr:city']||t['addr:town']||t['addr:village'],t['addr:postcode']].filter(Boolean).join(', '),
   phone:t.phone||t['contact:phone']||'',website:t.website||t['contact:website']||'',opening_hours:t.opening_hours||'',services:[t.shop,t.craft,t.amenity].filter(Boolean),
   source:'OpenStreetMap',distance:km(location.lat,location.lon,Number(lat),Number(lon)),osmUrl:'https://www.openstreetmap.org/'+el.type+'/'+el.id};
 }
 async function osm(){
  const q='[out:json][timeout:20];(nwr(around:15000,'+location.lat+','+location.lon+')["craft"="car_repair"];nwr(around:15000,'+location.lat+','+location.lon+')["amenity"="car_repair"];nwr(around:15000,'+location.lat+','+location.lon+')["shop"~"^(car_repair|motorcycle|tyres)$"];);out center tags;';
  let last;for(const url of endpoints){try{const res=await fetch(url+'?data='+encodeURIComponent(q),{headers:{Accept:'application/json'}});if(!res.ok)throw Error('Map directory returned '+res.status);const data=await res.json();return (data.elements||[]).map(normalise).filter(Boolean)}catch(e){last=e}}throw last||Error('Nearby directory unavailable');
 }
 async function quickbay(){
  if(!window.supabaseClient)return [];
  try{const {data,error}=await supabaseClient.from('workshops').select('id,name,category,address,locality,city,district,state,pincode,latitude,longitude,phone,website,public_display_permitted,partner_status').eq('public_display_permitted',true).neq('partner_status','suspended').limit(200);
   if(error){console.warn(error.message);return []}return (data||[]).filter(w=>w.latitude!=null&&w.longitude!=null).map(w=>({...w,id:'qb-'+w.id,source:'QuickBay directory',distance:km(location.lat,location.lon,+w.latitude,+w.longitude)}))
  }catch(e){console.warn(e);return []}
 }
 function initMap(data){
  const el=document.getElementById('workshopMap');if(!el)return;if(map){try{map.remove()}catch(_){}map=null}markers=[];
  const center=location?[location.lat,location.lon]:defaultCenter;
  if(!window.L){el.innerHTML='<iframe title="Nearby workshop map" style="width:100%;height:100%;border:0" loading="lazy" src="https://www.openstreetmap.org/export/embed.html?bbox='+(center[1]-.12)+'%2C'+(center[0]-.1)+'%2C'+(center[1]+.12)+'%2C'+(center[0]+.1)+'&layer=mapnik&marker='+center[0]+'%2C'+center[1]+'"></iframe>';return}
  el.innerHTML='';map=L.map(el,{scrollWheelZoom:false}).setView(center,location?13:11);L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap'}).addTo(map);
  if(location)L.circleMarker(center,{radius:9,color:'#2563eb',fillColor:'#60a5fa',fillOpacity:1}).addTo(map).bindPopup('Your current location');
  data.forEach(w=>{const m=L.marker([+w.latitude,+w.longitude]).addTo(map);m.bindPopup('<b>'+esc(w.name)+'</b><br>'+esc(w.category)+'<br>'+w.distance.toFixed(1)+' km away<br><button type="button" onclick="qbShowNearbyDetails(\''+esc(w.id)+'\')">View details</button>');markers.push({id:w.id,marker:m})});
  if(data.length){const group=L.featureGroup(markers.map(x=>x.marker));if(location)map.fitBounds(group.getBounds().extend(center).pad(.18),{maxZoom:14});else if(data.length>1)map.fitBounds(group.getBounds().pad(.18),{maxZoom:14});else map.setView([data[0].latitude,data[0].longitude],14)}
  setTimeout(()=>map&&map.invalidateSize(),100);
 }
 window.qbShowNearbyDetails=function(id){
  const w=rows.find(x=>String(x.id)===String(id));if(!w)return;const address=w.address||[w.locality,w.city,w.district,w.state,w.pincode].filter(Boolean).join(', ')||'Address not listed';
  const phone=w.phone?'<a href="tel:'+esc(w.phone)+'">'+esc(w.phone)+'</a>':'Not listed';
  const website=w.website&&/^https?:\/\//i.test(w.website)?'<a href="'+esc(w.website)+'" target="_blank" rel="noopener">Open website ↗</a>':'Not listed';
  modal(esc(w.name),'Nearby listing · '+esc(w.source||'OpenStreetMap'),'<div class="card"><div class="row"><b>Listing status</b><span class="tag">Not QuickBay verified</span></div><div class="row"><b>Distance</b><span>'+w.distance.toFixed(1)+' km</span></div><div class="row"><b>Address</b><span>'+esc(address)+'</span></div><div class="row"><b>Phone</b><span>'+phone+'</span></div><div class="row"><b>Website</b><span>'+website+'</span></div><div class="row"><b>Opening hours</b><span>'+esc(w.opening_hours||'Not listed')+'</span></div><div class="muted" style="margin-top:12px">Data source: OpenStreetMap contributors. Details may be incomplete or outdated.</div><a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="https://www.openstreetmap.org/directions?to='+encodeURIComponent(w.latitude+','+w.longitude)+'" target="_blank" rel="noopener">Get directions ↗</a> <a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="'+esc(w.osmUrl||'https://www.openstreetmap.org')+'" target="_blank" rel="noopener">View source ↗</a></div>');
 };
 window.qbFocusWorkshop=function(id){const x=markers.find(m=>String(m.id)===String(id));if(x&&map){map.setView(x.marker.getLatLng(),16);x.marker.openPopup()}};
 window.loadWorkshopDirectory=async function(){
  const target=document.getElementById('results');if(!target)return;
  if(!location){target.innerHTML=empty('⌖','Turn on location to find nearby services','QuickBay needs permission to use your device location. Tap “Use my location” to see workshops within 15 km.');initMap([]);return}
  target.innerHTML='<div class="card">Finding nearby workshops and service centres…</div>';setStatus('Searching within 15 km of your location…');
  try{
   const pair=await Promise.all([osm(),quickbay()]),unique=new Map();[...pair[1],...pair[0]].forEach(w=>{const k=(w.name+'|'+(w.address||'')).toLowerCase();if(!unique.has(k)||w.source==='QuickBay directory')unique.set(k,w)});
   rows=Array.from(unique.values()).filter(w=>w.distance<=15);
   const term=(document.getElementById('q')?.value||'').trim().toLowerCase();if(term)rows=rows.filter(w=>(w.name+' '+(w.address||'')+' '+(w.category||'')).toLowerCase().includes(term));
   const service=document.getElementById('serviceFilter')?.value;if(service==='tyres')rows=rows.filter(w=>/tyre|tire/i.test(w.category+' '+(w.services||[]).join(' ')));if(service==='motorcycle')rows=rows.filter(w=>/motorcycle|two.wheeler/i.test(w.category+' '+(w.services||[]).join(' ')));
   rows.sort((a,b)=>document.getElementById('sortFilter')?.value==='name'?a.name.localeCompare(b.name):a.distance-b.distance);initMap(rows);setStatus('Location enabled · '+rows.length+' results within 15 km');
   if(!rows.length){target.innerHTML=empty('⌖','No nearby listings found','No OpenStreetMap or QuickBay listings were found within 15 km. Try a wider area or check again later.');return}
   target.innerHTML='<div class="muted" style="margin-bottom:8px">'+rows.length+' nearby results · within 15 km</div><div class="qb-nearby-list">'+rows.map(w=>'<article class="qb-nearby-card"><div class="qb-nearby-icon">🔧</div><div><div class="qb-nearby-title">'+esc(w.name)+'</div><div class="qb-nearby-meta">'+esc(w.address||w.locality||w.city||'Address not listed')+'</div><div class="qb-nearby-meta">'+esc(w.category||'Automotive service')+' · '+w.distance.toFixed(1)+' km away</div><div class="qb-nearby-tags"><span class="qb-source-tag">'+esc(w.source)+'</span><span class="qb-source-tag">Not QuickBay verified</span></div></div><div class="actions"><button class="btn light" type="button" data-id="'+esc(w.id)+'" onclick="qbShowNearbyDetails(this.dataset.id)">Details</button><button class="btn light" type="button" data-id="'+esc(w.id)+'" onclick="qbFocusWorkshop(this.dataset.id)">Map</button></div></article>').join('')+'</div>';
  }catch(e){console.error(e);target.innerHTML=empty('⚠','Nearby directory temporarily unavailable','The public map directory could not be reached. Check your connection and tap Search to retry.');setStatus('Could not reach the public directory. Please retry.');initMap([])}
 };
 window.bookingsPage=function(){return head('BOOKINGS','My service bookings','Your service requests and appointment updates will appear here.')+
  (bookings.length?'<div class="tablewrap"><table><thead><tr><th>BOOKING ID</th><th>VEHICLE</th><th>SERVICE</th><th>PREFERRED DATE</th><th>STATUS</th></tr></thead><tbody>'+bookings.map(b=>'<tr><td><strong>'+esc(b.id)+'</strong></td><td>'+esc((vehicles.find(v=>v.id===b.vehicle)||{}).reg||'Vehicle')+'</td><td>'+esc(b.service)+'</td><td>'+esc(b.date||'Not selected')+'</td><td><span class="status warn">'+esc(b.status)+'</span></td></tr>').join('')+'</tbody></table></div>':empty('▤','No service bookings yet','You haven’t booked a service yet. Your bookings and their status will appear here after you request a service.','<button class="btn" onclick="go(\'Explore Workshops\')">Find a nearby workshop</button>'))};
 const previousRender=window.render;
 if(typeof previousRender==='function')window.render=function(){previousRender();if(mode==='customer'&&page==='Explore Workshops')setStatus(location?'Location enabled · ready to search':'Location is not enabled. Tap “Use my location” to find nearby services.')};
})();