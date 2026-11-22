/* QuickBay customer UX: location-aware public directory, empty states and India vehicle picker. */
(function(){
 const css='.sidebar{z-index:50}.nav{z-index:55}.topbar-left{display:flex;align-items:center;gap:13px;min-width:0}.qb-back-button{width:38px;height:38px;display:grid;place-items:center;border-radius:12px;background:#f1efff;color:#5e48bd;font-size:29px;line-height:1;font-weight:500;border:1px solid #e5defd;cursor:pointer;flex:none}.qb-back-button:hover{background:#e8e2ff}.qb-back-button:focus-visible{outline:3px solid #b9aaff;outline-offset:2px}.qb-location-panel{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap;padding:14px;margin:12px 0;border:1px solid #e5e7eb;border-radius:16px;background:#fff}.qb-location-copy{flex:1;min-width:180px}.qb-location-copy strong,.qb-location-copy small{display:block}.qb-location-copy small,.qb-location-status{font-size:12px;color:#667085;margin-top:4px}.qb-directory-map{width:100%;height:360px;min-height:300px;border-radius:16px;overflow:hidden;background:#eef1f4}.qb-nearby-list{display:grid;gap:12px;margin-top:14px}.qb-nearby-card{display:grid;grid-template-columns:42px minmax(0,1fr) auto;gap:12px;align-items:start;padding:15px;border:1px solid #e5e7eb;border-radius:15px;background:#fff}.qb-nearby-icon{width:42px;height:42px;border-radius:12px;display:grid;place-items:center;background:#f1edff;font-size:20px}.qb-nearby-title{font-weight:750}.qb-nearby-meta{font-size:13px;color:#667085;margin-top:4px}.qb-nearby-tags{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.qb-source-tag{font-size:11px;padding:4px 7px;border-radius:999px;background:#f3f4f6;color:#475467}.qb-vehicle-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.qb-vehicle-grid label{display:grid;gap:6px;font-size:13px;font-weight:650}.qb-vehicle-grid .full{grid-column:1/-1}#nav button{touch-action:manipulation;pointer-events:auto;cursor:pointer}#nav{position:relative;z-index:30}@media(max-width:560px){.qb-nearby-card{grid-template-columns:38px minmax(0,1fr)}.qb-nearby-card .actions{grid-column:2}.qb-directory-map{height:310px}.qb-vehicle-grid{grid-template-columns:1fr}}';
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
 'Kinetic Green':['E-Luna'],'Pravaig':['Defy'],'Strom Motors':['R3'],
 'Tesla':['Model Y'],'VinFast':['VF 6','VF 7'],
 'Aston Martin':['Vantage','DB12','DBX'],'Bentley':['Bentayga','Continental GT','Flying Spur'],
 'Ferrari':['296 GTB','Roma Spider','Purosangue','12Cilindri'],'Lamborghini':['Urus SE','Revuelto','Temerario'],
 'Rolls-Royce':['Ghost','Cullinan','Spectre','Phantom'],'Maserati':['Grecale','GranTurismo','MC20'],'McLaren':['Artura','750S','GTS'],
 'Ford (legacy)':['EcoSport','Figo','Aspire','Endeavour'],'Chevrolet (legacy)':['Beat','Spark','Cruze','Tavera'],'Fiat (legacy)':['Punto','Linea','Avventura'],'Mitsubishi (legacy)':['Pajero Sport','Outlander'],'Datsun (legacy)':['Redi-GO','GO','GO+'],
 'Acura (imported)':['Integra','MDX','RDX'],'BYD':['Atto 3','eMAX 7','Seal','Sealion 7'],
 'Haval (imported)':['H6','Jolion'],'GWM (imported)':['Haval H6','Ora 03'],
 'SsangYong (legacy)':['Rexton','Tivoli'],'Opel (legacy)':['Corsa','Astra','Vectra'],
 'Premier (legacy)':['Padmini','Rio'],'Daewoo (legacy)':['Matiz','Cielo','Nexia'],
 'Hindustan Motors (legacy)':['Ambassador','Contessa'],'Rover (legacy)':['Streetwise'],
 'Bajaj (quadricycle)':['Qute'],'Ashok Leyland (passenger)':['Stile','Dost passenger'],
 'Eicher (passenger)':['Polaris Multix'],'Aixam (imported)':['Mega'],'Smart (imported)':['Fortwo']
 };
 window.qbIndiaCarCatalogue=CARS;
 window.qbToggleCustomModel=function(value){const wrap=document.getElementById('qbCustomModelWrap'),field=document.getElementById('qbCustomModel');if(wrap)wrap.style.display=value==='__other__'?'grid':'none';if(field)field.required=value==='__other__';};
 window.qbUpdateVehicleAge=function(year){const el=document.getElementById('qbVehicleAge');if(el)el.textContent=year?'Approximate vehicle age: '+Math.max(0,new Date().getFullYear()-Number(year))+' years':'Select a manufacturing year';};
 window.qbUpdateVehicleModels=function(make){const el=document.getElementById('qbVehicleModel');if(el)el.innerHTML='<option value="">Select model</option>'+(CARS[make]||[]).map(x=>'<option value="'+qbSafe(x)+'">'+qbSafe(x)+'</option>').join('')+'<option value="__other__">My model is not listed</option>';window.qbToggleCustomModel('')};
 window.vehicleForm=function(){
  const makes=Object.keys(CARS).sort((a,b)=>a.localeCompare(b)),years=Array.from({length:new Date().getFullYear()-1989},(_,i)=>new Date().getFullYear()-i);
  modal('Add a vehicle','Choose your car brand, model and manufacturing year.',
   '<form onsubmit="saveVehicle(event)"><div class="qb-vehicle-grid">'+
   '<label class="full">Car brand<select class="field" name="make" required onchange="qbUpdateVehicleModels(this.value)"><option value="">Select car brand</option>'+makes.map(m=>'<option value="'+qbSafe(m)+'">'+qbSafe(m)+'</option>').join('')+'</select></label>'+
   '<label class="full">Car model<select class="field" id="qbVehicleModel" name="model_pick" required onchange="qbToggleCustomModel(this.value)"><option value="">Select brand first</option></select></label><label class="full" id="qbCustomModelWrap" style="display:none">Enter your model<input class="field" id="qbCustomModel" name="model_custom" placeholder="Type your vehicle model"></label>'+
   '<label>Manufacturing year<select class="field" name="year" required onchange="qbUpdateVehicleAge(this.value)"><option value="">Select year</option>'+years.map(y=>'<option value="'+y+'">'+y+'</option>').join('')+'</select><small id="qbVehicleAge" class="qb-location-status">Select a manufacturing year</small></label>'+
   '<label>Variant<input class="field" name="variant" placeholder="e.g. ZXi, SX(O), EV LR"></label>'+
   '<label class="full">Registration number<input class="field" name="reg" placeholder="TN 00 AB 1234"></label>'+
   '<label>Fuel type<select class="field" name="fuel"><option>Petrol</option><option>Diesel</option><option>CNG</option><option>Electric</option><option>Hybrid</option><option>LPG</option></select></label>'+
   '<label>Transmission<select class="field" name="trans"><option>Manual</option><option>Automatic</option><option>AMT</option><option>CVT</option><option>DCT</option></select></label>'+
   '<label class="full">Current odometer (km)<input class="field" name="odo" type="number" min="0" placeholder="e.g. 24000"></label></div>'+
   '<div class="notice" style="margin-top:14px">Manufacturing year means the year your vehicle was made. Model list covers many current India-market cars; discontinued and limited editions may be missing.</div><button class="btn" style="margin-top:14px">Save vehicle</button></form>');
 };
 let location=null,rows=[],map=null,markers=[],locationAttempted=false;
 const DEMO_TIRUVALLUR = [
{name:"Splash Automotive",locality:"PH Road, Manavalanagar",rating:4.9,count:307,highlight:"OEM Parts Authorized • Modern Detailing",category:"Automotive workshop",distance:2.1},
{name:"PK Auto Cool Car Service",locality:"Ondikuppam, Manavalanagar",rating:4.7,count:62,highlight:"AC Recovery Systems & Periodic Bay",category:"Car AC service",distance:2.8},
{name:"SVTV Auto Car Garage",locality:"Venkateswara College Rd, Tirupasur",rating:5,count:48,highlight:"Brake Lathe & Suspension Tuning",category:"Automotive workshop",distance:4.5},
{name:"Sri Krishna Multicar Service",locality:"Kakkalur Industrial Estate Bypass",rating:4.8,count:312,highlight:"Hydraulic Lifts & Laser Alignment",category:"Multi-brand car service",distance:2.4},
{name:"Bosch Car Service (Venkateshwara)",locality:"Jawahar Road, Poonga Nagar",rating:4.9,count:420,highlight:"Bosch Electronic Diagnostics & ECU",category:"Brand service centre",distance:3.1},
{name:"Sri Balaji Auto Garage",locality:"Old Collector Office Rd, Manavalanagar",rating:4.6,count:95,highlight:"Engine Diagnostics & Rapid Oil Bay",category:"Automotive workshop",distance:1.8},
{name:"AK Automobiles",locality:"Appasamy Salai, Poonga Nagar",rating:4.7,count:84,highlight:"OBD2 Diagnostics & Clutch Tuning",category:"Automotive workshop",distance:3.2},
{name:"Gears Motortune",locality:"Poonga Nagar, Tiruvallur",rating:4.8,count:71,highlight:"Shock Absorbers & Steering Overhaul",category:"Automotive workshop",distance:3.5},
{name:"5K Car Care Tiruvallur",locality:"Poonamallee High Rd, Devi Nagar",rating:4.9,count:412,highlight:"Foam Detailing & Periodic Bay",category:"Car care",distance:2.3},
{name:"Sri Guru Bagavan Atoz Motor World",locality:"Kakkalur Industrial Estate",rating:4.6,count:110,highlight:"Heavy Engine Overhaul Specialists",category:"Automotive workshop",distance:5.1},
{name:"Amma Automobiles",locality:"TNHB Kakkalur Bypass",rating:4.5,count:53,highlight:"Clutch Plate & Master Cylinder",category:"Automotive workshop",distance:4.9},
{name:"Master Automobiles",locality:"Sevvapet Road Junction",rating:4.8,count:66,highlight:"Electrical Wiring & Starters",category:"Auto electrical",distance:8.4},
{name:"VGN Auto Service",locality:"PH Road, Manavalanagar",rating:4.7,count:88,highlight:"Express 90-Minute Periodic Bay",category:"Automotive workshop",distance:1.5},
{name:"Sairam 369 Engine Care",locality:"Reddy Palayam, Tiruvallur",rating:4.6,count:42,highlight:"Decarbonization & Injector Flush",category:"Engine service",distance:3.9},
{name:"J M Brothers AC & Electrical",locality:"Veera Raghava Nagar Bypass",rating:4.9,count:128,highlight:"AC Leak Detection & Condenser Wash",category:"Auto AC & electrical",distance:2.7},
{name:"Smile Care Autos",locality:"Komathi Nagar, Polivakkam",rating:4.4,count:39,highlight:"Disc Resurfacing & Brake Calipers",category:"Automotive workshop",distance:7.2},
{name:"Sea Car Care Junction",locality:"Appaswamy Salai, Poonga Nagar",rating:4.8,count:76,highlight:"Underchassis Anti-Rust Spray",category:"Car care",distance:3},
{name:"Raj Brothers Car Care",locality:"Erayamangalam Rd, Tiruvallur",rating:4.7,count:59,highlight:"Maruti MGP Authentic Spares",category:"Car care",distance:6.8},
{name:"Swarna Auto Electrical Works",locality:"Chennai-Tiruttani Hwy, MGM Nagar",rating:4.8,count:115,highlight:"Alternator & Battery Testing",category:"Auto electrical",distance:3.8},
{name:"Arjun Automotive Care",locality:"Near Borgwarner, Kakkalur Ind.",rating:4.9,count:164,highlight:"Precision Engine & Gearbox Service",category:"Automotive workshop",distance:5.6}
].map((w,i)=>({...w,id:"qb-demo-"+(i+1),address:w.locality+", Tiruvallur, Tamil Nadu",source:"Uploaded prototype sample",brand:"Not specified",services:[w.highlight],latitude:null,longitude:null,distanceSource:"Prototype estimate from Tiruvallur hub"}));
const defaultCenter=[22.5,79],endpoints=['https://overpass-api.de/api/interpreter','https://overpass.kumi.systems/api/interpreter'];
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const km=(a,b,c,d)=>{const r=6371,p=x=>x*Math.PI/180,dl=p(c-a),dn=p(d-b),v=Math.sin(dl/2)**2+Math.cos(p(a))*Math.cos(p(c))*Math.sin(dn/2)**2;return 2*r*Math.asin(Math.sqrt(v))};
 const setStatus=s=>{const el=document.getElementById('qbLocationStatus');if(el)el.textContent=s};
 window.explore=function(){const html=head('WORKSHOP DISCOVERY','Find nearby workshops & service centres','Search any town or district across all 38 districts of Tamil Nadu, or use GPS to find nearby repair workshops and brand service centres.','')+
 '<div class="qb-location-panel"><div class="qb-location-copy"><strong>Find services around your location</strong><small id="qbLocationStatus">Use GPS or search a city / PIN code if you prefer not to share your location.</small></div><button class="btn" type="button" onclick="qbRequestLocation()">⌖ Get your live location</button></div>'+
 '<div class="searchbox"><select id="qbDistrictSelect" aria-label="Tamil Nadu district" onchange="qbSelectDistrict(this.value)"><option value="">Choose any Tamil Nadu district</option><option value="Ariyalur">Ariyalur</option><option value="Chengalpattu">Chengalpattu</option><option value="Chennai">Chennai</option><option value="Coimbatore">Coimbatore</option><option value="Cuddalore">Cuddalore</option><option value="Dharmapuri">Dharmapuri</option><option value="Dindigul">Dindigul</option><option value="Erode">Erode</option><option value="Kallakurichi">Kallakurichi</option><option value="Kancheepuram">Kancheepuram</option><option value="Kanniyakumari">Kanniyakumari</option><option value="Karur">Karur</option><option value="Krishnagiri">Krishnagiri</option><option value="Madurai">Madurai</option><option value="Mayiladuthurai">Mayiladuthurai</option><option value="Nagapattinam">Nagapattinam</option><option value="Namakkal">Namakkal</option><option value="Nilgiris">Nilgiris</option><option value="Perambalur">Perambalur</option><option value="Pudukkottai">Pudukkottai</option><option value="Ramanathapuram">Ramanathapuram</option><option value="Ranipet">Ranipet</option><option value="Salem">Salem</option><option value="Sivaganga">Sivaganga</option><option value="Tenkasi">Tenkasi</option><option value="Thanjavur">Thanjavur</option><option value="Theni">Theni</option><option value="Thoothukudi">Thoothukudi</option><option value="Tiruchirappalli">Tiruchirappalli</option><option value="Tirunelveli">Tirunelveli</option><option value="Tirupathur">Tirupathur</option><option value="Tiruppur">Tiruppur</option><option value="Tiruvallur">Tiruvallur</option><option value="Tiruvannamalai">Tiruvannamalai</option><option value="Tiruvarur">Tiruvarur</option><option value="Vellore">Vellore</option><option value="Viluppuram">Viluppuram</option><option value="Virudhunagar">Virudhunagar</option></select></div>'+'<div class="searchbox"><input id="qbAreaInput" placeholder="Enter any town, city, village or PIN code" onkeydown="if(event.key===\'Enter\')qbSearchArea()"><button class="btn" type="button" onclick="qbSearchArea()">Find workshops</button></div>'+
 '<div class="searchbox"><input id="q" placeholder="Search workshop, service or locality" onkeydown="if(event.key===\'Enter\')loadWorkshopDirectory()"><button class="btn" type="button" onclick="loadWorkshopDirectory()">Search</button></div>'+
 '<div class="filters"><select id="serviceFilter"><option value="">All services</option><option value="tyres">Tyres & wheels</option><option value="motorcycle">Two-wheeler service</option></select><select id="sortFilter"><option value="distance">Nearest first</option><option value="name">Name</option></select></div>'+
 '<div class="sectiontitle" style="margin:14px 0 8px">Nearby results</div><div id="results"><div class="card">Tap “Use my location” to find nearby services.</div></div>'+
 '<div class="sectiontitle" style="margin:18px 0 8px">Map</div><div id="workshopMap" class="qb-directory-map" role="region" aria-label="Nearby workshop map"></div>'+
 '<div class="muted" style="margin-top:8px">Coverage: all 38 Tamil Nadu districts. Search any town, city, village or PIN code; results are fetched from public OpenStreetMap listings within 25 km of the selected place. Coverage depends on community mapping and may be incomplete. Listings are not QuickBay-verified.</div>'+
 '<div class="qb-partner-cta" style="margin-top:16px"><div><b>Own or manage an automotive workshop?</b><div class="muted">Apply to join QuickBay. Applications are not automatically published.</div></div><button class="btn light" onclick="qbOpenPartnerApplication()">Register workshop</button></div>';return html};
 window.qbSelectDistrict=function(district){const field=document.getElementById('qbAreaInput');if(field){field.value=district?district+', Tamil Nadu':'';}if(district)window.qbSearchArea()};
 window.qbSearchArea=async function(){
  const field=document.getElementById('qbAreaInput'),query=(field?.value||'').trim();if(!query){setStatus('Enter a city, locality or PIN code to search.');return}
  setStatus('Finding '+query+'…');
  try{const searchQuery=/tamil nadu/i.test(query)?query+', India':query+', Tamil Nadu, India';const url='https://nominatim.openstreetmap.org/search?format=jsonv2&limit=1&q='+encodeURIComponent(searchQuery);const res=await fetch(url,{headers:{Accept:'application/json'}});if(!res.ok)throw Error('Area search returned '+res.status);const hits=await res.json();if(!hits.length)throw Error('No matching area found. Try a nearby city or PIN code.');location={lat:Number(hits[0].lat),lon:Number(hits[0].lon)};setStatus('Showing services near '+(hits[0].display_name||query).split(',').slice(0,3).join(',')+' · 25 km radius');loadWorkshopDirectory()}catch(e){setStatus(e.message||'Could not find that area. Try again.');toast(e.message||'Area search failed')}
 };
 window.qbRequestLocation=function(){
  if(!navigator.geolocation){setStatus('This browser does not support location access.');return}
  setStatus('Requesting location permission…');
  navigator.geolocation.getCurrentPosition(p=>{location={lat:p.coords.latitude,lon:p.coords.longitude};setStatus('Location enabled · accuracy about '+Math.max(1,Math.round(p.coords.accuracy))+' m');loadWorkshopDirectory()},
   e=>{const msg=e.code===1?'Location permission denied. Enable location for this website in browser settings.':e.code===2?'Location unavailable. Check device location settings.':'Location request timed out. Try again.';setStatus(msg);toast(msg)},
   {enableHighAccuracy:true,timeout:15000,maximumAge:60000});
 };
 function normalise(el){
  const t=el.tags||{},lat=el.lat??el.center?.lat,lon=el.lon??el.center?.lon,name=t.name||t.brand||t.operator;const rating=Number(t['stars']||t['rating']||t['google:rating']||t['avg_rating']||0);
  if(!name||!Number.isFinite(Number(lat))||!Number.isFinite(Number(lon))||(rating>0&&rating<=3.5))return null;
  return {id:'osm-'+el.type+'-'+el.id,name,category:t.shop==='tyres'?'Tyres & wheels':t.shop==='motorcycle'?'Two-wheeler service':'Car repair & service',
   latitude:Number(lat),longitude:Number(lon),address:[t['addr:housenumber'],t['addr:street'],t['addr:suburb'],t['addr:city']||t['addr:town']||t['addr:village'],t['addr:postcode']].filter(Boolean).join(', '),
   phone:t.phone||t['contact:phone']||'',website:t.website||t['contact:website']||'',opening_hours:t.opening_hours||'',services:[t.shop,t.craft,t.amenity].filter(Boolean),
   source:'OpenStreetMap',rating:rating>0?rating:null,brand:t.brand||t.operator||'',email:t.email||t['contact:email']||'',demoApproved:true,distance:km(location.lat,location.lon,Number(lat),Number(lon)),osmUrl:'https://www.openstreetmap.org/'+el.type+'/'+el.id};
 }
 async function osm(){
  const q='[out:json][timeout:25];(nwr(around:25000,'+location.lat+','+location.lon+')["craft"~"^(car_repair|mechanic|auto_repair)$"];nwr(around:25000,'+location.lat+','+location.lon+')["amenity"="car_repair"];nwr(around:25000,'+location.lat+','+location.lon+')["shop"~"^(car_repair|motorcycle|tyres|car)$"];nwr(around:25000,'+location.lat+','+location.lon+')["service:vehicle:repair"="yes"];nwr(around:25000,'+location.lat+','+location.lon+')["brand"~"(Maruti|Nexa|Hyundai|Tata|Mahindra|Kia|Toyota|Honda|Renault|Nissan|Volkswagen|Skoda|BMW|Mercedes|Audi|Jeep|MG|BYD|Volvo)",i];nwr(around:25000,'+location.lat+','+location.lon+')["name"~"(Maruti|Nexa|Hyundai|Tata|Mahindra|Kia|Toyota|Honda|Renault|Nissan|Volkswagen|Skoda|BMW|Mercedes|Audi|Jeep|MG|BYD|Volvo)",i];);out center tags;';
  let last;for(const url of endpoints){try{const res=await fetch(url,{method:'POST',headers:{'Content-Type':'application/x-www-form-urlencoded;charset=UTF-8','Accept':'application/json'},body:'data='+encodeURIComponent(q)});if(!res.ok)throw Error('Public directory returned '+res.status);const data=await res.json();return (data.elements||[]).map(normalise).filter(Boolean)}catch(e){last=e}}throw last||Error('Nearby public directory unavailable');
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
  const fallback=()=>{const lat=center[0],lon=center[1],d=location?0.35:15;const bbox=[lon-d,lat-d,lon+d,lat+d].join('%2C');el.innerHTML='<iframe title="OpenStreetMap nearby services" style="width:100%;height:100%;min-height:300px;border:0" loading="lazy" referrerpolicy="no-referrer-when-downgrade" src="https://www.openstreetmap.org/export/embed.html?bbox='+bbox+'&layer=mapnik'+(location?'&marker='+lat+'%2C'+lon:'')+'"></iframe>'};
  if(!window.L||typeof window.L.map!=='function'){fallback();return}
  el.innerHTML='';const mapRef=L.map(el,{scrollWheelZoom:false,preferCanvas:true}).setView(center,location?13:4);map=mapRef;
  const tiles=L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19,attribution:'© OpenStreetMap contributors'}).addTo(mapRef);let tileErrors=0;
  tiles.on('tileerror',()=>{tileErrors++;if(tileErrors>=4&&map===mapRef){try{mapRef.remove()}catch(_){}map=null;fallback()}});
  if(location)L.circleMarker(center,{radius:9,color:'#2563eb',fillColor:'#60a5fa',fillOpacity:1}).addTo(mapRef).bindPopup('Search centre');
  data.forEach(w=>{const lat=Number(w.latitude),lon=Number(w.longitude);if(!Number.isFinite(lat)||!Number.isFinite(lon))return;const m=L.marker([lat,lon]).addTo(mapRef);m.bindPopup('<b>'+esc(w.name)+'</b><br>'+esc(w.category)+'<br>'+Number(w.distance||0).toFixed(1)+' km away<br><button type="button" onclick="qbShowNearbyDetails(\''+esc(w.id)+'\')">View details</button>');markers.push({id:w.id,marker:m})});
  if(markers.length){const group=L.featureGroup(markers.map(x=>x.marker));if(location)mapRef.fitBounds(group.getBounds().extend(center).pad(.18),{maxZoom:14});else if(markers.length>1)mapRef.fitBounds(group.getBounds().pad(.18),{maxZoom:14});else mapRef.setView(markers[0].marker.getLatLng(),14)}
  setTimeout(()=>{if(map===mapRef)mapRef.invalidateSize()},250);
 }

 window.qbShowNearbyDetails=function(id){
  const w=rows.find(x=>String(x.id)===String(id));if(!w)return;const address=w.address||[w.locality,w.city,w.district,w.state,w.pincode].filter(Boolean).join(', ')||'Address not listed';
  const phone=w.phone?'<a href="tel:'+esc(w.phone)+'">'+esc(w.phone)+'</a>':'Not listed';const email=w.email?'<a href="mailto:'+esc(w.email)+'">'+esc(w.email)+'</a>':'Not listed';
  const website=w.website&&/^https?:\/\//i.test(w.website)?'<a href="'+esc(w.website)+'" target="_blank" rel="noopener">Open website ↗</a>':'Not listed';
  modal(esc(w.name),'Nearby listing · '+esc(w.source||'OpenStreetMap'),'<div class="card"><div class="row"><b>Listing status</b><span class="tag">Prototype sample · unverified · Prototype only</span></div><div class="row"><b>Rating</b><span>'+(w.rating?w.rating.toFixed(1)+' / 5':'Not published in source data')+'</span></div><div class="row"><b>Brand / operator</b><span>'+esc(w.brand||'Not listed')+'</span></div><div class="row"><b>Distance</b><span>'+w.distance.toFixed(1)+' km</span></div><div class="row"><b>Address</b><span>'+esc(address)+'</span></div><div class="row"><b>Phone</b><span>'+phone+'</span></div><div class="row"><b>Website</b><span>'+website+'</span></div><div class="row"><b>Opening hours</b><span>'+esc(w.opening_hours||'Not listed')+'</span></div><div class="muted" style="margin-top:12px">Data source: OpenStreetMap contributors. Prototype sample · unverified is a prototype-only label, not a real-world inspection or endorsement. Details may be incomplete or outdated.</div><a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="https://www.openstreetmap.org/directions?to='+encodeURIComponent(w.latitude+','+w.longitude)+'" target="_blank" rel="noopener">Get directions ↗</a> <a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="https://www.google.com/maps/search/?api=1&query='+encodeURIComponent(w.name+' '+address)+'" target="_blank" rel="noopener">Check public ratings ↗</a> <a class="btn light" style="display:inline-block;margin-top:12px;text-decoration:none" href="'+esc(w.osmUrl||'https://www.openstreetmap.org')+'" target="_blank" rel="noopener">View source ↗</a></div>');
 };
 window.qbFocusWorkshop=function(id){const x=markers.find(m=>String(m.id)===String(id));if(x&&map){map.setView(x.marker.getLatLng(),16);x.marker.openPopup()}};
 window.loadWorkshopDirectory=async function(){
  const target=document.getElementById('results');if(!target)return;
  if(!location){target.innerHTML=empty('⌖','Turn on location to find nearby services','QuickBay needs permission to use your device location. Tap “Use my location” to see workshops within 25 km.');initMap([]);return}
  target.innerHTML='<div class="card">Finding nearby workshops and service centres…</div>';setStatus('Searching within 25 km of your location…');
  try{
   const settled=await Promise.allSettled([osm(),quickbay()]);const publicRows=settled[0].status==='fulfilled'?settled[0].value:[];const quickbayRows=settled[1].status==='fulfilled'?settled[1].value:[];const nearTiruvallur=km(location.lat,location.lon,13.1432,79.9079)<=25;const prototypeRows=nearTiruvallur?DEMO_TIRUVALLUR:[];const unique=new Map();[...prototypeRows,...publicRows,...quickbayRows].forEach(w=>{const k=(w.name+'|'+(w.address||'')).toLowerCase();if(!unique.has(k)||w.source==='QuickBay directory')unique.set(k,w)});
   rows=Array.from(unique.values()).filter(w=>w.source==='Uploaded prototype sample'?nearTiruvallur:w.distance<=25);
   const term=(document.getElementById('q')?.value||'').trim().toLowerCase();if(term)rows=rows.filter(w=>(w.name+' '+(w.address||'')+' '+(w.category||'')).toLowerCase().includes(term));
   const service=document.getElementById('serviceFilter')?.value;if(service==='tyres')rows=rows.filter(w=>/tyre|tire/i.test(w.category+' '+(w.services||[]).join(' ')));if(service==='motorcycle')rows=rows.filter(w=>/motorcycle|two.wheeler/i.test(w.category+' '+(w.services||[]).join(' ')));
   rows.sort((a,b)=>document.getElementById('sortFilter')?.value==='name'?a.name.localeCompare(b.name):a.distance-b.distance);initMap(rows);setStatus('Search area ready · '+rows.length+' results within 25 km'+(settled[0].status==='rejected'?' · public map directory temporarily unavailable':''));
   if(!rows.length){target.innerHTML=empty('⌖','No nearby listings found','No public directory listings were found here. The uploaded prototype sample list is available around Tiruvallur. Try Tiruvallur or a nearby locality.');return}
   target.innerHTML='<div class="muted" style="margin-bottom:8px">'+rows.length+' nearby results · within 25 km</div><div class="qb-nearby-list">'+rows.map(w=>'<article class="qb-nearby-card"><div class="qb-nearby-icon">🔧</div><div><div class="qb-nearby-title">'+esc(w.name)+'</div><div class="qb-nearby-meta">'+esc(w.address||w.locality||w.city||'Address not listed')+'</div><div class="qb-nearby-meta">'+esc(w.category||'Automotive service')+' · '+w.distance.toFixed(1)+' km '+(w.distanceSource?'from Tiruvallur hub':'away')+'</div><div class="qb-nearby-meta">'+esc(w.highlight||'')+'</div><div class="qb-nearby-tags"><span class="qb-source-tag">'+esc(w.source)+'</span><span class="qb-source-tag">Prototype sample · unverified</span></div></div><div class="actions"><button class="btn light" type="button" data-id="'+esc(w.id)+'" onclick="qbShowNearbyDetails(this.dataset.id)">Details</button><button class="btn light" type="button" data-id="'+esc(w.id)+'" onclick="qbFocusWorkshop(this.dataset.id)">Map</button></div></article>').join('')+'</div>';
  }catch(e){console.error(e);target.innerHTML=empty('⚠','Nearby directory temporarily unavailable','The public map directory could not be reached. Check your connection and tap Search to retry.');setStatus('Could not reach the public directory. Please retry.');initMap([])}
 };
 window.bookingsPage=function(){return head('BOOKINGS','My service bookings','Your service requests and appointment updates will appear here.')+
  (bookings.length?'<div class="tablewrap"><table><thead><tr><th>BOOKING ID</th><th>VEHICLE</th><th>SERVICE</th><th>PREFERRED DATE</th><th>STATUS</th></tr></thead><tbody>'+bookings.map(b=>'<tr><td><strong>'+esc(b.id)+'</strong></td><td>'+esc((vehicles.find(v=>v.id===b.vehicle)||{}).reg||'Vehicle')+'</td><td>'+esc(b.service)+'</td><td>'+esc(b.date||'Not selected')+'</td><td><span class="status warn">'+esc(b.status)+'</span></td></tr>').join('')+'</tbody></table></div>':empty('▤','No service bookings yet','You haven’t booked a service yet. Your bookings and their status will appear here after you request a service.','<button class="btn" onclick="go(\'Explore Workshops\')">Find a nearby workshop</button>'))};
 const previousRender=window.render;
 if(typeof previousRender==='function')window.render=function(){previousRender();if(mode==='customer'&&page==='Explore Workshops'){setStatus(location?'Location enabled · ready to search':'Requesting your location permission…');if(!location&&!locationAttempted){locationAttempted=true;setTimeout(()=>window.qbRequestLocation(),350)}}};
})();