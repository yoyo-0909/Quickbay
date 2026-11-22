
/* Private support desk and persistent saved-workshop shortlist. No outbound delivery. */
let qbSavedWorkshops=[],qbSupportTickets=[],qbAdminSupportTickets=[];
async function qbLoadSavedWorkshops(){
 qbSavedWorkshops=[];if(!authUser||!supabaseClient)return;
 const {data,error}=await supabaseClient.from('saved_workshops').select('id,workshop_id,is_saved,workshops(name,city,district,address)').eq('user_id',authUser.id).eq('is_saved',true).order('created_at',{ascending:false});
 if(error){console.warn('Saved workshops: '+error.message);return}
 qbSavedWorkshops=data||[];store.set('saved_workshops',qbSavedWorkshops.map(x=>x.workshop_id));
}
async function qbLoadSupportTickets(){
 qbSupportTickets=[];if(!authUser||!supabaseClient)return;
 const {data,error}=await supabaseClient.from('support_tickets').select('id,ticket_code,subject,category,description,status,priority,created_at,updated_at').eq('user_id',authUser.id).order('created_at',{ascending:false});
 if(error){console.warn('Support tickets: '+error.message);return}qbSupportTickets=data||[];
}
const qbAdminLoadBase=qbLoadAdminData;
qbLoadAdminData=async function(){
 await qbAdminLoadBase();
 qbAdminSupportTickets=[];
 if(!authUser||!['super_admin','platform_admin'].includes(authRole))return;
 const {data,error}=await supabaseClient.from('support_tickets').select('id,ticket_code,user_id,subject,category,description,status,priority,admin_notes,created_at,updated_at').order('created_at',{ascending:false}).limit(300);
 if(error)console.warn('Admin support tickets: '+error.message);else qbAdminSupportTickets=data||[];
};
const qbCompleteAuthSupportBase=completeAuth;
completeAuth=async function(user){
 await qbCompleteAuthSupportBase(user);
 if(!authUser||!supabaseClient)return;
 await Promise.all([qbLoadSavedWorkshops(),qbLoadSupportTickets()]);
 render();
};
const qbToggleSavedBase=toggleSavedWorkshop;
toggleSavedWorkshop=async function(id){
 if(!authUser||!supabaseClient){toast('Sign in to save workshops to your account.');return}
 const existing=qbSavedWorkshops.find(x=>x.workshop_id===id);
 const {error}=await supabaseClient.from('saved_workshops').upsert({user_id:authUser.id,workshop_id:id,is_saved:!existing,updated_at:new Date().toISOString()},{onConflict:'user_id,workshop_id'});
 if(error){toast(qbErr(error));return}
 await qbLoadSavedWorkshops();toast(existing?'Workshop removed from your saved list.':'Workshop saved to your account.');loadWorkshopDirectory();
};
const qbSimpleCustomerSupportBase=simpleCustomer;
simpleCustomer=function(){
 if(page==='Saved Workshops'){
  return head('YOUR SHORTLIST','Saved workshops','Your saved workshops are linked to your QuickBay account.')+
  (qbSavedWorkshops.length?'<div class="workshoplist">'+qbSavedWorkshops.map(x=>'<article class="workshop"><div class="shopicon">🔧</div><div><div class="shopname">'+qbSafe(x.workshops?.name||'Workshop')+'</div><div class="muted">'+qbSafe([x.workshops?.address,x.workshops?.city,x.workshops?.district].filter(Boolean).join(', '))+'</div></div><button class="btn light" data-id="'+qbSafe(x.workshop_id)+'" onclick="toggleSavedWorkshop(this.dataset.id)">Unsave</button></article>').join('')+'</div>':empty('♡','No saved workshops','Save a workshop from Explore Workshops to find it here.'));
 }
 if(page==='Help & Support')return supportCustomerPage();
 return qbSimpleCustomerSupportBase();
};
function supportCustomerPage(){
 return head('QUICKBAY SUPPORT','Help & support','Create a private support ticket and follow replies inside QuickBay. No SMS, email or push notification is sent.')+
 '<div style="margin-bottom:16px"><button class="btn" onclick="supportTicketForm()">＋ Create support ticket</button></div>'+
 (qbSupportTickets.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">'+qbSupportTickets.map(t=>'<div class="card"><div class="row"><b>'+qbSafe(t.ticket_code)+'</b><span class="status">'+qbSafe(t.status)+'</span></div><h3>'+qbSafe(t.subject)+'</h3><div class="muted">'+qbSafe(t.category)+' · '+qbDate(t.created_at)+'</div><button class="btn light" style="margin-top:14px" data-id="'+qbSafe(t.id)+'" onclick="openCustomerTicket(this.dataset.id)">View ticket</button></div>').join('')+'</div>':empty('?','No support tickets','If you need help, create a ticket and our support team can review it.','<button class="btn" onclick="supportTicketForm()">Create ticket</button>'));
}
function supportTicketForm(){
 modal('Create support ticket','Your message is stored privately in QuickBay for support review.','<form onsubmit="saveSupportTicket(event)"><div class="formgrid">'+
 field('Subject','subject','Briefly describe the issue','text',true)+
 '<label>Category<select class="field" name="category"><option value="booking">Booking</option><option value="vehicle">Vehicle / garage</option><option value="workshop">Workshop</option><option value="billing">Invoice / billing query</option><option value="account">Account access</option><option value="general">General</option></select></label>'+
 '<label class="full">Description<textarea class="field" name="description" rows="4" required placeholder="Explain what happened and what help you need"></textarea></label></div><button class="btn">Submit ticket</button></form>');
}
async function saveSupportTicket(e){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));const code='QBS-'+Date.now().toString().slice(-8);
 const {data,error}=await supabaseClient.from('support_tickets').insert({ticket_code:code,user_id:authUser.id,subject:d.subject.trim(),category:d.category,description:d.description.trim()}).select('id').single();
 if(error){toast(qbErr(error));return}closeModal();await qbLoadSupportTickets();render();toast('Support ticket created: '+code);
}
async function openCustomerTicket(id){
 const t=qbSupportTickets.find(x=>x.id===id);if(!t)return;
 const {data,error}=await supabaseClient.from('support_messages').select('id,sender_id,body,created_at').eq('ticket_id',id).order('created_at');
 if(error){toast(qbErr(error));return}
 const messages=data||[];
 modal(t.ticket_code,t.subject+' · '+t.status,'<div class="notice">'+qbSafe(t.description)+'</div><div class="card" style="margin:12px 0">'+(messages.length?messages.map(m=>'<div style="padding:9px 0;border-bottom:1px solid #eee"><b>'+(m.sender_id===authUser.id?'You':'QuickBay support')+'</b><div>'+qbSafe(m.body)+'</div><small class="muted">'+qbDate(m.created_at)+'</small></div>').join(''):'<div class="muted">No replies yet.</div>')+'</div>'+(t.status==='closed'||t.status==='resolved'?'<div class="notice">This ticket is closed for replies.</div>':'<form onsubmit="sendSupportMessage(event,'+JSON.stringify(id)+')"><label>Reply<textarea class="field" name="body" rows="3" required></textarea></label><button class="btn">Add reply</button></form>'));
}
async function sendSupportMessage(e,id){
 e.preventDefault();const body=new FormData(e.target).get('body').trim();if(!body)return;
 const {error}=await supabaseClient.from('support_messages').insert({ticket_id:id,sender_id:authUser.id,body});
 if(error){toast(qbErr(error));return}await openCustomerTicket(id);toast('Reply added to the private ticket.');
}
function supportAdminPage(){
 return head('CUSTOMER CARE','Support tickets','Review private customer requests. Replies remain inside QuickBay; no external notification is sent.')+
 (qbAdminSupportTickets.length?'<div class="tablewrap"><table><thead><tr><th>TICKET</th><th>SUBJECT</th><th>CATEGORY</th><th>STATUS</th><th>CREATED</th><th>ACTION</th></tr></thead><tbody>'+qbAdminSupportTickets.map(t=>'<tr><td><b>'+qbSafe(t.ticket_code)+'</b></td><td>'+qbSafe(t.subject)+'</td><td>'+qbSafe(t.category)+'</td><td>'+qbSafe(t.status)+'</td><td>'+qbDate(t.created_at)+'</td><td><button class="btn light" data-id="'+qbSafe(t.id)+'" onclick="openAdminTicket(this.dataset.id)">Review</button></td></tr>').join('')+'</tbody></table></div>':empty('?','No support tickets','Customer support requests will appear here.'));
}
async function openAdminTicket(id){
 const t=qbAdminSupportTickets.find(x=>x.id===id);if(!t)return;
 const {data,error}=await supabaseClient.from('support_messages').select('id,sender_id,body,created_at').eq('ticket_id',id).order('created_at');
 if(error){toast(qbErr(error));return}
 const messages=data||[];
 modal(t.ticket_code,t.subject,'<div class="notice">'+qbSafe(t.description)+'</div><div class="card" style="margin:12px 0">'+(messages.length?messages.map(m=>'<div style="padding:9px 0;border-bottom:1px solid #eee"><b>'+(m.sender_id===authUser.id?'You (admin)':'Customer / support')+'</b><div>'+qbSafe(m.body)+'</div><small class="muted">'+qbDate(m.created_at)+'</small></div>').join(''):'<div class="muted">No replies yet.</div>')+'</div><form onsubmit="saveAdminTicket(event,'+JSON.stringify(id)+')"><div class="formgrid"><label>Status<select class="field" name="status">'+['open','in_progress','waiting_on_customer','resolved','closed'].map(x=>'<option value="'+x+'" '+(t.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label>Priority<select class="field" name="priority">'+['low','normal','high'].map(x=>'<option value="'+x+'" '+(t.priority===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label class="full">Admin notes<textarea class="field" name="admin_notes" rows="2">'+qbSafe(t.admin_notes||'')+'</textarea></label><label class="full">Reply to customer<textarea class="field" name="reply" rows="3" placeholder="Optional in-app reply"></textarea></label></div><button class="btn">Save ticket</button></form>');
}
async function saveAdminTicket(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const {error}=await supabaseClient.from('support_tickets').update({status:d.status,priority:d.priority,admin_notes:d.admin_notes,updated_at:new Date().toISOString()}).eq('id',id);
 if(error){toast(qbErr(error));return}
 if(d.reply.trim()){const msg=await supabaseClient.from('support_messages').insert({ticket_id:id,sender_id:authUser.id,body:d.reply.trim()});if(msg.error){toast('Ticket updated, but reply failed: '+qbErr(msg.error));return}}
 closeModal();await qbLoadAdminData();render();toast('Support ticket updated.');
}
const qbAdminDataSupportBase=adminDataPage;
adminDataPage=function(){
 if(page==='Support')return supportAdminPage();
 return qbAdminDataSupportBase();
};
