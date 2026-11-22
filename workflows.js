
/* QuickBay workflow extensions: stock ledger, estimates, parts handover and in-app inbox. */
let qbInventoryItems=[],qbInventoryMovements=[],qbEstimates=[],qbInvoices=[],qbPartsReturns=[],qbCustomerNotifications=[];
const qbWorkshopLoadBase=qbLoadWorkshopContext;
qbLoadWorkshopContext=async function(){
 await qbWorkshopLoadBase();
 qbInventoryItems=[];qbInventoryMovements=[];qbEstimates=[];qbInvoices=[];qbPartsReturns=[];
 if(!qbWorkshopId||!supabaseClient)return;
 const ids=qbWorkshopJobs.map(j=>j.id);
 const tasks=await Promise.all([
  supabaseClient.from('inventory_items').select('id,sku,name,category,unit,quantity_on_hand,reorder_level,unit_cost,active').eq('workshop_id',qbWorkshopId).order('name'),
  supabaseClient.from('inventory_movements').select('id,item_id,movement_type,quantity_delta,reference,notes,created_at').eq('workshop_id',qbWorkshopId).order('created_at',{ascending:false}).limit(40),
  ids.length?supabaseClient.from('estimates').select('id,job_id,version,status,subtotal,tax_total,discount,total,created_at,estimate_items(id,item_type,description,quantity,unit_price,tax_rate)').in('job_id',ids).order('created_at',{ascending:false}):Promise.resolve({data:[],error:null}),
  supabaseClient.from('invoices').select('id,invoice_number,job_id,customer_id,subtotal,tax_total,discount,total,payment_status,issued_at').eq('workshop_id',qbWorkshopId).order('issued_at',{ascending:false}),
  ids.length?supabaseClient.from('old_parts_returns').select('id,job_id,part_name,reason,customer_requested,disposition,tamper_seal_reference,handover_confirmed_at,created_at').in('job_id',ids).order('created_at',{ascending:false}):Promise.resolve({data:[],error:null})
 ]);
 const names=['inventory items','inventory movements','estimates','invoices','parts returns'];
 tasks.forEach((r,i)=>{if(r.error)console.warn('QuickBay '+names[i]+': '+r.error.message)});
 if(!tasks[0].error)qbInventoryItems=tasks[0].data||[];
 if(!tasks[1].error)qbInventoryMovements=tasks[1].data||[];
 if(!tasks[2].error)qbEstimates=tasks[2].data||[];
 if(!tasks[3].error)qbInvoices=tasks[3].data||[];
 if(!tasks[4].error)qbPartsReturns=tasks[4].data||[];
};
async function qbLoadCustomerNotifications(){
 qbCustomerNotifications=[];
 if(!authUser||!supabaseClient)return;
 const {data,error}=await supabaseClient.from('user_notifications').select('id,title,body,category,read_at,created_at').eq('user_id',authUser.id).order('created_at',{ascending:false}).limit(100);
 if(error){console.warn('QuickBay inbox: '+error.message);return}
 qbCustomerNotifications=data||[];
}
const qbCompleteAuthBase=completeAuth;
completeAuth=async function(user){
 await qbCompleteAuthBase(user);
 if(!authUser||!supabaseClient)return;
 await qbLoadCustomerNotifications();
 render();
};
menus.workshop.splice(6,0,['Service Catalogue','⚙']);
const qbBookingsPageBase=bookingsPage;
bookingsPage=function(){
 const rows=bookings.map(b=>'<tr><td><b>'+qbSafe(b.id)+'</b></td><td>'+qbSafe(b.service)+'</td><td>'+qbSafe(b.date||'Not set')+'</td><td><span class="status">'+qbSafe(b.status)+'</span></td><td>'+qbSafe(b.notes||'—')+'</td><td>'+(authUser&&['requested','rescheduled','confirmed'].includes(b.status)?'<button class="btn light" data-id="'+qbSafe(b.uuid)+'" onclick="rescheduleBookingForm(this.dataset.id)">Reschedule</button> <button class="btn light" data-id="'+qbSafe(b.uuid)+'" onclick="cancelBooking(this.dataset.id)">Cancel</button>':'—')+'</td></tr>').join('');
 return head('BOOKINGS','My booking requests','Review your requests. Cancellation is available before workshop work begins.','<button class="btn" onclick="bookingForm()">＋ New request</button>')+
 (bookings.length?'<div class="tablewrap"><table><thead><tr><th>BOOKING ID</th><th>SERVICE</th><th>PREFERRED DATE</th><th>STATUS</th><th>NOTES</th><th>ACTION</th></tr></thead><tbody>'+rows+'</tbody></table></div>':empty('▤','No booking requests','When you request a service, it will appear here.','<button class="btn" onclick="bookingForm()">Request an appointment</button>'));
};
async function cancelBooking(id){
 if(!authUser||!supabaseClient)return;
 const {error}=await supabaseClient.from('bookings').update({status:'cancelled',updated_at:new Date().toISOString()}).eq('id',id).eq('customer_id',authUser.id);
 if(error){toast(qbErr(error));return}
 await loadMyBookings();render();toast('Booking cancelled.');
}
const qbSimpleCustomerBase=simpleCustomer;
simpleCustomer=function(){
 if(page==='Notifications'){
  return head('YOUR INBOX','Notifications','In-app updates only. QuickBay does not send SMS, email or push messages.')+
  (qbCustomerNotifications.length?'<div class="grid">'+qbCustomerNotifications.map(n=>'<div class="card"><div class="row"><b>'+qbSafe(n.title)+'</b><span class="status">'+qbSafe(n.category)+'</span></div><p class="muted">'+qbSafe(n.body)+'</p><div class="row"><small class="muted">'+qbDate(n.created_at)+'</small>'+(n.read_at?'':'<button class="btn light" data-id="'+qbSafe(n.id)+'" onclick="markNotificationRead(this.dataset.id)">Mark read</button>')+'</div></div>').join('')+'</div>':empty('♧','No in-app notifications','There are no saved in-app updates for your account.'));
 }
 if(page==='Profile & Settings'){
  return head('YOUR ACCOUNT','Profile & settings','Manage your contact details and workshop partner application.','<button class="btn" onclick="editProfile()">Edit profile</button>')+
  '<div class="card"><div class="sectiontitle">Account details</div><p><b>'+qbSafe($('#accountDetailName')?.textContent)+'</b></p><div class="muted">'+qbSafe(authUser?.email||'')+'</div><p>Mobile number: <b>'+qbSafe($('#accountDetailPhone')?.textContent)+'</b></p><div class="notice">Your mobile number is saved as contact information. No mobile OTP or phone-based login is used.</div><button class="btn light" onclick="partnerForm()">Apply as a workshop partner</button></div>';
 }
 return qbSimpleCustomerBase();
};
async function markNotificationRead(id){
 const {error}=await supabaseClient.from('user_notifications').update({read_at:new Date().toISOString()}).eq('id',id).eq('user_id',authUser.id);
 if(error){toast(qbErr(error));return}await qbLoadCustomerNotifications();render();
}
partnerForm=function(){
 if(!authUser){toast('Sign in before submitting a workshop application.');return}
 modal('Workshop partner application','Submit your business details for platform review. This does not publish a workshop listing.','<form onsubmit="saveApplication(event)"><div class="formgrid">'+
 field('Workshop name','name','Business name')+field('Owner name','owner','Full name')+field('Mobile number','phone','+91 98765 43210','tel')+field('Email','email','owner@example.com','email')+
 field('Street address','address','Street and area','text',true)+field('City','city','Tiruvallur')+field('State','state','Tamil Nadu')+field('PIN code','pin','602001')+
 field('Number of service bays','bays','e.g. 4','number')+field('Services offered','services','General service, AC, brakes','text',true)+
 '</div><div class="notice">Your application remains private to you and QuickBay administrators until reviewed. No public listing or customer notification is created.</div><button class="btn">Submit application</button></form>');
};
saveApplication=async function(e){
 e.preventDefault();if(!authUser||!supabaseClient){toast('Sign in to submit an application.');return}
 const d=Object.fromEntries(new FormData(e.target));const code='QBA-'+Date.now().toString().slice(-8);
 const {error}=await supabaseClient.from('workshop_applications').insert({application_code:code,applicant_id:authUser.id,workshop_name:d.name.trim(),owner_name:d.owner.trim(),phone:d.phone.trim(),email:d.email.trim()||null,address:d.address.trim(),city:d.city.trim(),state:d.state.trim(),pincode:d.pin.trim(),bay_count:Number(d.bays)||null,services:d.services.split(',').map(x=>x.trim()).filter(Boolean)});
 if(error){toast(qbErr(error));return}closeModal();toast('Workshop application submitted: '+code);go('Profile & Settings');
};
function inventoryPage(){
 if(!qbWorkshopId)return empty('⚙','Workshop not linked','An active workshop membership is required.');
 const low=qbInventoryItems.filter(i=>i.active&&Number(i.quantity_on_hand)<=Number(i.reorder_level)).length;
 return head('STOCK CONTROL','Parts & inventory','Track stock levels and record every stock movement.','<button class="btn" onclick="inventoryItemForm()">＋ Add item</button>')+
 '<div class="grid stats">'+stat('STOCK ITEMS',qbInventoryItems.length,'Items in your catalogue')+stat('LOW STOCK',low,'At or below reorder level')+stat('STOCK MOVEMENTS',qbInventoryMovements.length,'Recent ledger entries')+stat('ACTIVE ITEMS',qbInventoryItems.filter(i=>i.active).length,'Available for use')+'</div>'+
 (qbInventoryItems.length?'<div class="tablewrap"><table><thead><tr><th>ITEM</th><th>SKU</th><th>ON HAND</th><th>REORDER AT</th><th>UNIT COST</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbInventoryItems.map(i=>'<tr><td><b>'+qbSafe(i.name)+'</b><div class="muted">'+qbSafe(i.category||'')+'</div></td><td>'+qbSafe(i.sku||'—')+'</td><td>'+qbSafe(i.quantity_on_hand)+' '+qbSafe(i.unit)+'</td><td>'+qbSafe(i.reorder_level)+'</td><td>'+qbMoney(i.unit_cost)+'</td><td><span class="status '+(Number(i.quantity_on_hand)<=Number(i.reorder_level)?'warn':'good')+'">'+(i.active?'Active':'Inactive')+'</span></td><td><button class="btn light" data-id="'+qbSafe(i.id)+'" onclick="stockMovementForm(this.dataset.id)">Stock</button> <button class="btn light" data-id="'+qbSafe(i.id)+'" onclick="editInventoryItem(this.dataset.id)">Edit</button></td></tr>').join('')+'</tbody></table></div>':empty('⚙','No inventory items','Add your first spare part or consumable.','<button class="btn" onclick="inventoryItemForm()">Add inventory item</button>'))+
 '<div class="card" style="margin-top:16px"><div class="sectiontitle">Recent stock movements</div>'+(qbInventoryMovements.length?'<div class="tablewrap"><table><thead><tr><th>DATE</th><th>ITEM</th><th>MOVEMENT</th><th>QUANTITY</th><th>REFERENCE</th></tr></thead><tbody>'+qbInventoryMovements.map(m=>'<tr><td>'+qbDate(m.created_at)+'</td><td>'+qbSafe(qbInventoryItems.find(i=>i.id===m.item_id)?.name||'Item')+'</td><td>'+qbSafe(m.movement_type)+'</td><td>'+qbSafe(m.quantity_delta)+'</td><td>'+qbSafe(m.reference||'—')+'</td></tr>').join('')+'</tbody></table></div>':empty('↕','No stock movements','Recorded stock changes will appear here.'))+'</div>';
}
function inventoryItemForm(){
 modal('Add inventory item','Create an item. Initial stock is recorded as a stock-in movement.','<form onsubmit="saveInventoryItem(event)"><div class="formgrid">'+field('Item name','name','Engine oil 5W-30')+field('SKU / code','sku','Optional internal code')+field('Category','category','Lubricants, filters, brakes')+field('Unit','unit','pcs, litre, set')+field('Reorder level','reorder','0','number')+field('Unit cost (₹)','cost','0','number')+field('Opening quantity','opening','0','number')+'</div><button class="btn">Save inventory item</button></form>');
}
async function saveInventoryItem(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const {data,error}=await supabaseClient.from('inventory_items').insert({workshop_id:qbWorkshopId,name:d.name.trim(),sku:d.sku.trim()||null,category:d.category.trim()||null,unit:d.unit.trim()||'pcs',reorder_level:Number(d.reorder)||0,unit_cost:Number(d.cost)||0,active:true}).select('id').single();
 if(error){toast(qbErr(error));return}
 const opening=Number(d.opening)||0;
 if(opening>0){const movement=await supabaseClient.rpc('record_inventory_movement',{p_item_id:data.id,p_movement_type:'stock_in',p_quantity:opening,p_reference:'Opening balance',p_notes:'Initial inventory entry'});if(movement.error){toast('Item saved, but opening stock was not recorded: '+qbErr(movement.error));await qbRefreshWorkshop();return}}
 closeModal();await qbRefreshWorkshop();toast('Inventory item saved.');
}
function editInventoryItem(id){
 const i=qbInventoryItems.find(x=>x.id===id);if(!i)return;
 modal('Edit inventory item','Update item details. Stock quantities change through the stock ledger.','<form data-item-id="'+qbSafe(id)+'" onsubmit="saveInventoryItemEdit(event,this.dataset.itemId)"><div class="formgrid">'+
 '<label>Item name<input class="field" name="name" required value="'+qbSafe(i.name)+'"></label><label>SKU<input class="field" name="sku" value="'+qbSafe(i.sku||'')+'"></label>'+
 '<label>Category<input class="field" name="category" value="'+qbSafe(i.category||'')+'"></label><label>Unit<input class="field" name="unit" value="'+qbSafe(i.unit)+'"></label>'+
 '<label>Reorder level<input class="field" name="reorder" type="number" min="0" value="'+qbSafe(i.reorder_level)+'"></label><label>Unit cost<input class="field" name="cost" type="number" min="0" step="0.01" value="'+qbSafe(i.unit_cost)+'"></label></div><button class="btn">Save changes</button></form>');
}
async function saveInventoryItemEdit(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const {error}=await supabaseClient.from('inventory_items').update({name:d.name.trim(),sku:d.sku.trim()||null,category:d.category.trim()||null,unit:d.unit.trim()||'pcs',reorder_level:Number(d.reorder)||0,unit_cost:Number(d.cost)||0,updated_at:new Date().toISOString()}).eq('id',id).eq('workshop_id',qbWorkshopId);
 if(error){toast(qbErr(error));return}closeModal();await qbRefreshWorkshop();toast('Inventory item updated.');
}
function stockMovementForm(id){
 const i=qbInventoryItems.find(x=>x.id===id);if(!i)return;
 modal('Record stock movement',qbSafe(i.name)+' · Current stock: '+qbSafe(i.quantity_on_hand)+' '+qbSafe(i.unit),'<form data-item-id="'+qbSafe(id)+'" onsubmit="saveStockMovement(event,this.dataset.itemId)"><div class="formgrid"><label>Movement type<select name="type"><option value="stock_in">Stock in</option><option value="stock_out">Stock out</option><option value="adjustment">Adjustment (+/-)</option></select></label>'+field('Quantity','quantity','e.g. 5','number')+field('Reference','reference','Supplier invoice / job code')+field('Notes','notes','Optional notes','text',true)+'</div><button class="btn">Record movement</button></form>');
}
async function saveStockMovement(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const quantity=Number(d.quantity);
 if(!quantity){toast('Enter a non-zero quantity.');return}
 const {error}=await supabaseClient.rpc('record_inventory_movement',{p_item_id:id,p_movement_type:d.type,p_quantity:quantity,p_reference:d.reference||null,p_notes:d.notes||null});
 if(error){toast(qbErr(error));return}closeModal();await qbRefreshWorkshop();toast('Stock movement recorded.');
}
function serviceCataloguePage(){
 return head('SERVICE MENU','Service catalogue','Manage services and indicative workshop pricing.','<button class="btn" onclick="serviceForm()">＋ Add service</button>')+
 (qbWorkshopServices.length?'<div class="tablewrap"><table><thead><tr><th>SERVICE</th><th>LABOUR</th><th>PARTS</th><th>TAX</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbWorkshopServices.map(s=>'<tr><td><b>'+qbSafe(s.name)+'</b><div class="muted">'+qbSafe(s.description||'')+'</div></td><td>'+qbMoney(s.labour_amount)+'</td><td>'+qbMoney(s.parts_amount)+'</td><td>'+qbSafe(s.tax_rate)+'%</td><td>'+qbSafe(s.active?'Active':'Inactive')+'</td><td><button class="btn light" data-id="'+qbSafe(s.id)+'" data-active="'+(!s.active)+'" onclick="toggleService(this.dataset.id,this.dataset.active)">Toggle</button></td></tr>').join('')+'</tbody></table></div>':empty('⚙','No services configured','Add your workshop service menu.','<button class="btn" onclick="serviceForm()">Add service</button>'));
}
function serviceForm(){modal('Add workshop service','Add a service and indicative price.','<form onsubmit="saveService(event)"><div class="formgrid">'+field('Service name','name','General service')+field('Description','description','What is included','text',true)+field('Labour amount (₹)','labour','0','number')+field('Parts amount (₹)','parts','0','number')+field('Tax rate (%)','tax','0','number')+'</div><button class="btn">Save service</button></form>')}
async function saveService(e){e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const {error}=await supabaseClient.from('workshop_services').insert({workshop_id:qbWorkshopId,name:d.name.trim(),description:d.description||null,labour_amount:Number(d.labour)||0,parts_amount:Number(d.parts)||0,tax_rate:Number(d.tax)||0,active:true});if(error){toast(qbErr(error));return}closeModal();await qbRefreshWorkshop();toast('Service added.')}
async function toggleService(id,active){const {error}=await supabaseClient.from('workshop_services').update({active:active==='true'}).eq('id',id).eq('workshop_id',qbWorkshopId);if(error){toast(qbErr(error));return}await qbRefreshWorkshop();}
function estimatesPage(){
 const open=qbWorkshopJobs.filter(j=>j.stage!=='delivered');
 return head('SERVICE APPROVAL','Estimates','Create a draft estimate with a labour/parts line item. Drafts are saved but not sent.')+
 '<div style="margin-bottom:16px"><button class="btn" onclick="estimateForm()">＋ Create draft estimate</button></div>'+
 (qbEstimates.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+qbEstimates.map(e=>'<div class="card"><div class="row"><b>'+qbSafe(qbWorkshopJobs.find(j=>j.id===e.job_id)?.job_code||'Job card')+'</b><span class="status">'+qbSafe(e.status)+'</span></div><div class="statnum">'+qbMoney(e.total)+'</div><div class="muted">Version '+qbSafe(e.version)+' · '+qbDate(e.created_at)+'</div><div class="muted">'+(e.estimate_items||[]).map(x=>qbSafe(x.description)+' × '+qbSafe(x.quantity)).join('<br>')+'</div></div>').join('')+'</div>':empty('₹','No estimates','Draft estimates will appear here.'))+
 (open.length?'':'<div class="notice" style="margin-top:14px">No open jobs are available for a new estimate.</div>');
}
function estimateForm(){
 const jobs=qbWorkshopJobs.filter(j=>j.stage!=='delivered');if(!jobs.length){toast('Create a job card before preparing an estimate.');return}
 modal('Create draft estimate','This saves a draft only. It does not send the estimate to a customer.','<form onsubmit="saveEstimate(event)"><div class="formgrid"><label class="full">Job card<select class="field" name="job" required>'+jobs.map(j=>'<option value="'+qbSafe(j.id)+'">'+qbSafe(j.job_code)+' · '+qbSafe(j.vehicles?.registration_number||'Vehicle')+'</option>').join('')+'</select></label>'+field('Line item type','type','labour')+field('Description','description','General service labour','text',true)+field('Quantity','quantity','1','number')+field('Unit price (₹)','price','0','number')+field('Tax rate (%)','tax','18','number')+'</div><button class="btn">Save draft estimate</button></form>');
}
async function saveEstimate(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const qty=Number(d.quantity),price=Number(d.price),tax=Number(d.tax);
 if(qty<=0||price<0||tax<0){toast('Check quantity, price and tax values.');return}
 const subtotal=qty*price,taxTotal=subtotal*tax/100,total=subtotal+taxTotal;
 const job=qbWorkshopJobs.find(j=>j.id===d.job);const version=1+qbEstimates.filter(x=>x.job_id===d.job).reduce((m,x)=>Math.max(m,Number(x.version)||0),0);
 const {data,error}=await supabaseClient.from('estimates').insert({job_id:d.job,version,status:'draft',subtotal,tax_total:taxTotal,discount:0,total,created_by:authUser.id}).select('id').single();
 if(error){toast(qbErr(error));return}
 const item=await supabaseClient.from('estimate_items').insert({estimate_id:data.id,item_type:d.type||'labour',description:d.description.trim(),quantity:qty,unit_price:price,tax_rate:tax});
 if(item.error){toast('Estimate header saved, but line item failed: '+qbErr(item.error));return}
 closeModal();await qbRefreshWorkshop();toast('Draft estimate saved for '+(job?.job_code||'job card')+'.');
}
function invoicesPage(){
 return head('BILLING','Invoices','Read-only invoice register. Payment processing and financial transactions remain disabled.')+
 (qbInvoices.length?'<div class="tablewrap"><table><thead><tr><th>INVOICE</th><th>JOB</th><th>ISSUED</th><th>TOTAL</th><th>PAYMENT STATUS</th></tr></thead><tbody>'+qbInvoices.map(i=>'<tr><td><b>'+qbSafe(i.invoice_number)+'</b></td><td>'+qbSafe(qbWorkshopJobs.find(j=>j.id===i.job_id)?.job_code||'—')+'</td><td>'+qbDate(i.issued_at)+'</td><td>'+qbMoney(i.total)+'</td><td>'+qbSafe(i.payment_status)+'</td></tr>').join('')+'</tbody></table></div>':empty('▤','No invoices','No invoice records exist for this workshop. No payments can be taken here.'));
}
function partsReturnsPage(){
 return head('PARTS HANDOVER','Old parts returns','Record customer-requested handover or disposition of removed parts.','<button class="btn" onclick="partsReturnForm()">＋ Record part</button>')+
 (qbPartsReturns.length?'<div class="tablewrap"><table><thead><tr><th>JOB</th><th>PART</th><th>REASON</th><th>DISPOSITION</th><th>HANDOVER</th></tr></thead><tbody>'+qbPartsReturns.map(p=>'<tr><td>'+qbSafe(qbWorkshopJobs.find(j=>j.id===p.job_id)?.job_code||'—')+'</td><td>'+qbSafe(p.part_name)+'</td><td>'+qbSafe(p.reason)+'</td><td>'+qbSafe(p.disposition)+'</td><td>'+qbSafe(p.handover_confirmed_at?'Confirmed':'Pending')+'</td></tr>').join('')+'</tbody></table></div>':empty('↩','No parts-return records','Record removed parts for customer handover.','<button class="btn" onclick="partsReturnForm()">Record a part</button>'));
}
function partsReturnForm(){
 const jobs=qbWorkshopJobs.filter(j=>j.stage!=='delivered');if(!jobs.length){toast('An open job card is required.');return}
 modal('Record removed part','Record the removed part and the agreed disposition.','<form onsubmit="savePartsReturn(event)"><div class="formgrid"><label class="full">Job card<select class="field" name="job">'+jobs.map(j=>'<option value="'+qbSafe(j.id)+'">'+qbSafe(j.job_code)+'</option>').join('')+'</select></label>'+field('Part name','part','Brake pads')+field('Reason','reason','Replacement / repair')+'<label>Customer requested return?<select name="requested"><option value="true">Yes</option><option value="false">No</option></select></label><label>Disposition<select name="disposition"><option value="pending">Pending</option><option value="returned">Returned to customer</option><option value="retained">Retained</option><option value="disposed">Disposed</option></select></label>'+field('Handover reference','reference','Optional seal / handover reference')+'</div><button class="btn">Save parts record</button></form>');
}
async function savePartsReturn(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const {error}=await supabaseClient.from('old_parts_returns').insert({job_id:d.job,part_name:d.part.trim(),reason:d.reason.trim(),customer_requested:d.requested==='true',disposition:d.disposition,tamper_seal_reference:d.reference||null,handover_confirmed_at:d.disposition==='returned'?new Date().toISOString():null});
 if(error){toast(qbErr(error));return}closeModal();await qbRefreshWorkshop();toast('Parts handover record saved.');
}
const qbWorkshopPagesBase=workshopPages;
workshopPages=function(){
 if(page==='Parts & Inventory')return inventoryPage();
 if(page==='Service Catalogue')return serviceCataloguePage();
 if(page==='Estimates')return estimatesPage();
 if(page==='Invoices')return invoicesPage();
 if(page==='Old Parts Returns')return partsReturnsPage();
 return qbWorkshopPagesBase();
};


const qbJobPageBase=jobPage;
jobPage=function(){
 if(!qbWorkshopId)return qbJobPageBase();
 return head('WORKSHOP OPERATIONS','Job cards','Track vehicles, assign technicians and advance repair stages.','<button class="btn" onclick="newJob()">＋ Create job card</button>')+
 (qbWorkshopJobs.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(290px,1fr))">'+qbWorkshopJobs.map(j=>'<div class="card"><div class="row"><b>'+qbSafe(j.job_code)+'</b><span class="status '+(j.stage==='delivered'?'good':'warn')+'">'+qbSafe(qbStageLabel(j.stage))+'</span></div><h3>'+qbSafe(j.vehicles?.manufacturer||'Vehicle')+' '+qbSafe(j.vehicles?.model||'')+'</h3><div class="muted">'+qbSafe(j.vehicles?.registration_number||'')+' · '+qbSafe(j.reported_issue||'No issue notes')+'</div><label class="muted" style="display:block;margin-top:12px">Assigned technician<select class="field" style="width:100%;margin-top:5px" data-job="'+qbSafe(j.id)+'" onchange="assignTechnician(this.dataset.job,this.value)"><option value="">Unassigned</option>'+qbTechnicians.map(t=>'<option value="'+qbSafe(t.id)+'" '+(j.technician_id===t.id?'selected':'')+'>'+qbSafe(t.display_name)+(t.active?'':' (inactive)')+'</option>').join('')+'</select></label><div class="timeline" style="margin-top:18px">'+qbStages.map((st,i)=>'<div class="step '+(qbStages.findIndex(x=>x[0]===j.stage)>=i?'done':'')+'"><div class="dot"></div><div><b>'+st[1]+'</b></div></div>').join('')+'</div>'+(j.stage!=='delivered'?'<button class="btn" data-id="'+qbSafe(j.id)+'" onclick="advanceJob(this.dataset.id)">Advance stage</button>':'<span class="status good">Delivered</span>')+'</div>').join('')+'</div>':empty('▣','No job cards','Create a job card from a booking request.','<button class="btn" onclick="newJob()">Create job card</button>'));
};
async function assignTechnician(jobId,technicianId){
 const {error}=await supabaseClient.from('job_cards').update({technician_id:technicianId||null,updated_at:new Date().toISOString()}).eq('id',jobId).eq('workshop_id',qbWorkshopId);
 if(error){toast(qbErr(error));return}await qbRefreshWorkshop();toast('Technician assignment updated.');
}

function rescheduleBookingForm(id){
 const b=bookings.find(x=>x.uuid===id);if(!b)return;
 modal('Reschedule request',qbSafe(b.id)+' · Choose a new preferred date and time. This is a request, not a confirmed slot.','<form data-booking-id="'+qbSafe(id)+'" onsubmit="saveReschedule(event,this.dataset.bookingId)"><div class="formgrid">'+
 '<label>Preferred date<input class="field" type="date" name="date" min="'+new Date().toISOString().slice(0,10)+'" required value="'+qbSafe(b.date||'')+'"></label>'+
 '<label>Preferred time<select class="field" name="time"><option value="09:00">Morning · 9 AM</option><option value="13:00">Afternoon · 1 PM</option><option value="17:00">Evening · 5 PM</option></select></label></div><button class="btn">Save new preference</button></form>');
}
async function saveReschedule(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const preferredAt=new Date(d.date+'T'+d.time+':00').toISOString();
 const {error}=await supabaseClient.from('bookings').update({status:'rescheduled',preferred_at:preferredAt,updated_at:new Date().toISOString()}).eq('id',id).eq('customer_id',authUser.id);
 if(error){toast(qbErr(error));return}closeModal();await loadMyBookings();render();toast('New preferred time saved. The workshop must confirm it.');
}
