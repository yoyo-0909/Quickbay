
/* Admin catalogue maintenance. All catalogue entries are manually managed; no bulk import. */
qbAdmin.vehicleCatalogue=[];
const qbAdminCatalogueLoadBase=qbLoadAdminData;
qbLoadAdminData=async function(){
 await qbAdminCatalogueLoadBase();
 qbAdmin.vehicleCatalogue=[];
 if(!authUser||!['super_admin','platform_admin'].includes(authRole))return;
 const {data,error}=await supabaseClient.from('vehicle_catalogue').select('id,make,model,variant,fuel_types,body_type,year_from,year_to,active,sort_order').order('make').order('model').limit(1000);
 if(error)console.warn('Vehicle catalogue:',error.message);else qbAdmin.vehicleCatalogue=data||[];
};
const qbAdminDataCatalogueBase=adminDataPage;
adminDataPage=function(){
 if(page==='Service Categories')return serviceCategoriesAdminPage();
 if(page==='Vehicle Catalogue')return vehicleCatalogueAdminPage();
 return qbAdminDataCatalogueBase();
};
function serviceCategoriesAdminPage(){
 return head('SERVICE CONFIGURATION','Service categories','Manage the service categories shown across QuickBay.','<button class="btn" onclick="serviceCategoryForm()">＋ Add category</button>')+
 (qbAdmin.categories.length?'<div class="tablewrap"><table><thead><tr><th>CATEGORY</th><th>DESCRIPTION</th><th>ORDER</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbAdmin.categories.map(c=>'<tr><td><b>'+qbSafe(c.name)+'</b></td><td>'+qbSafe(c.description||'')+'</td><td>'+qbSafe(c.sort_order)+'</td><td>'+qbSafe(c.active?'Active':'Inactive')+'</td><td><button class="btn light" data-id="'+qbSafe(c.id)+'" data-active="'+(!c.active)+'" onclick="toggleServiceCategory(this.dataset.id,this.dataset.active)">Toggle</button></td></tr>').join('')+'</tbody></table></div>':empty('⚙','No categories configured','Add the first service category.','<button class="btn" onclick="serviceCategoryForm()">Add category</button>'));
}
function serviceCategoryForm(){
 modal('Add service category','Create a category for workshop service menus.','<form onsubmit="saveServiceCategory(event)"><div class="formgrid">'+field('Category name','name','General service')+field('Description','description','Short description','text',true)+field('Display order','sort_order',String(qbAdmin.categories.length*10),'number')+'</div><button class="btn">Save category</button></form>');
}
async function saveServiceCategory(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const {error}=await supabaseClient.from('service_categories').insert({name:d.name.trim(),description:d.description||null,sort_order:Number(d.sort_order)||0,active:true});
 if(error){toast(qbErr(error));return}closeModal();await qbLoadAdminData();render();toast('Service category created.');
}
async function toggleServiceCategory(id,active){
 const {error}=await supabaseClient.from('service_categories').update({active:active==='true'}).eq('id',id);
 if(error){toast(qbErr(error));return}await qbLoadAdminData();render();toast('Service category status updated.');
}
function vehicleCatalogueAdminPage(){
 return head('VEHICLE DATA','Vehicle catalogue','Manually maintain makes and models used by customer vehicle records. No external catalogue has been imported.','<button class="btn" onclick="vehicleCatalogueForm()">＋ Add vehicle model</button>')+
 (qbAdmin.vehicleCatalogue.length?'<div class="tablewrap"><table><thead><tr><th>MAKE / MODEL</th><th>VARIANT</th><th>FUEL TYPES</th><th>YEARS</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbAdmin.vehicleCatalogue.map(v=>'<tr><td><b>'+qbSafe(v.make)+' '+qbSafe(v.model)+'</b></td><td>'+qbSafe(v.variant||'—')+'</td><td>'+qbSafe((v.fuel_types||[]).join(', '))+'</td><td>'+qbSafe(v.year_from||'—')+' – '+qbSafe(v.year_to||'—')+'</td><td>'+qbSafe(v.active?'Active':'Inactive')+'</td><td><button class="btn light" data-id="'+qbSafe(v.id)+'" data-active="'+(!v.active)+'" onclick="toggleVehicleCatalogue(this.dataset.id,this.dataset.active)">Toggle</button></td></tr>').join('')+'</tbody></table></div>':empty('🚘','Vehicle catalogue is empty','Add vehicle makes and models manually. No records are imported automatically.','<button class="btn" onclick="vehicleCatalogueForm()">Add vehicle model</button>'));
}
function vehicleCatalogueForm(){
 modal('Add vehicle model','Add a make/model record to the catalogue.','<form onsubmit="saveVehicleCatalogue(event)"><div class="formgrid">'+field('Manufacturer / make','make','Tata')+field('Model','model','Nexon')+field('Variant','variant','Optional variant')+field('Fuel types','fuel_types','Petrol, Diesel, Electric')+field('Body type','body_type','SUV, Sedan, Hatchback')+field('Year from','year_from','2020','number')+field('Year to','year_to','2026','number')+field('Display order','sort_order','0','number')+'</div><button class="btn">Save vehicle model</button></form>');
}
async function saveVehicleCatalogue(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const {error}=await supabaseClient.from('vehicle_catalogue').insert({make:d.make.trim(),model:d.model.trim(),variant:d.variant.trim()||null,fuel_types:d.fuel_types.split(',').map(x=>x.trim()).filter(Boolean),body_type:d.body_type.trim()||null,year_from:Number(d.year_from)||null,year_to:Number(d.year_to)||null,sort_order:Number(d.sort_order)||0,active:true});
 if(error){toast(qbErr(error));return}closeModal();await qbLoadAdminData();render();toast('Vehicle catalogue entry added.');
}
async function toggleVehicleCatalogue(id,active){
 const {error}=await supabaseClient.from('vehicle_catalogue').update({active:active==='true',updated_at:new Date().toISOString()}).eq('id',id);
 if(error){toast(qbErr(error));return}await qbLoadAdminData();render();toast('Vehicle catalogue status updated.');
}


const qbVehicleFormBase=vehicleForm;
vehicleForm=async function(){
 let catalog=[];
 if(supabaseClient){const {data,error}=await supabaseClient.from('vehicle_catalogue').select('make,model,variant,fuel_types').eq('active',true).order('make').order('model');if(!error)catalog=data||[]}
 const makes=[...new Set(catalog.map(x=>x.make))],models=[...new Set(catalog.map(x=>x.model))],fuels=[...new Set(catalog.flatMap(x=>x.fuel_types||[]))];
 const fuelOptions=[...new Set(['Petrol','Diesel','CNG','Electric','Hybrid',...fuels])];
 modal('Add a vehicle','Save a vehicle to your QuickBay garage. Catalogue suggestions appear when available.','<form onsubmit="saveVehicle(event)"><div class="formgrid">'+
 field('Registration number','reg','TN 00 AB 1234')+
 '<label>Manufacturer<input class="field" name="make" list="qbVehicleMakes" placeholder="e.g. Tata" required><datalist id="qbVehicleMakes">'+makes.map(x=>'<option value="'+qbSafe(x)+'"></option>').join('')+'</datalist></label>'+
 '<label>Model<input class="field" name="model" list="qbVehicleModels" placeholder="e.g. Nexon" required><datalist id="qbVehicleModels">'+models.map(x=>'<option value="'+qbSafe(x)+'"></option>').join('')+'</datalist></label>'+
 field('Variant','variant','e.g. Creative+')+field('Manufacturing year','year','2022','number')+
 '<label>Fuel type<select name="fuel">'+fuelOptions.map(x=>'<option>'+qbSafe(x)+'</option>').join('')+'</select></label>'+
 '<label>Transmission<select name="trans"><option>Manual</option><option>Automatic</option></select></label>'+
 field('Current odometer (km)','odo','e.g. 24000','number')+'</div><button class="btn">Save vehicle</button></form>');
};
