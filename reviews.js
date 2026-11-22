
/* Private customer feedback: visible only to the customer, their workshop and platform admins. */
let qbCustomerReviews=[],qbWorkshopReviews=[],qbAdminReviews=[];
async function qbLoadCustomerReviews(){
 qbCustomerReviews=[];if(!authUser||!supabaseClient)return;
 const {data,error}=await supabaseClient.from('workshop_reviews').select('id,booking_id,workshop_id,rating,review_text,status,created_at').eq('customer_id',authUser.id).order('created_at',{ascending:false});
 if(error){console.warn('Customer reviews: '+error.message);return}qbCustomerReviews=data||[];
}
const qbWorkshopReviewLoadBase=qbLoadWorkshopContext;
qbLoadWorkshopContext=async function(){
 await qbWorkshopReviewLoadBase();qbWorkshopReviews=[];
 if(!qbWorkshopId||!supabaseClient)return;
 const {data,error}=await supabaseClient.from('workshop_reviews').select('id,booking_id,rating,review_text,status,created_at').eq('workshop_id',qbWorkshopId).order('created_at',{ascending:false});
 if(error){console.warn('Workshop feedback: '+error.message);return}qbWorkshopReviews=data||[];
};
const qbAdminReviewLoadBase=qbLoadAdminData;
qbLoadAdminData=async function(){
 await qbAdminReviewLoadBase();qbAdminReviews=[];
 if(!authUser||!['super_admin','platform_admin'].includes(authRole))return;
 const {data,error}=await supabaseClient.from('workshop_reviews').select('id,customer_id,workshop_id,booking_id,rating,review_text,status,admin_notes,created_at').order('created_at',{ascending:false}).limit(300);
 if(error)console.warn('Admin reviews: '+error.message);else qbAdminReviews=data||[];
};
const qbCompleteAuthReviewBase=completeAuth;
completeAuth=async function(user){
 await qbCompleteAuthReviewBase(user);
 if(!authUser||!supabaseClient)return;
 await qbLoadCustomerReviews();
 if(['workshop_owner','workshop_manager','service_advisor','technician'].includes(authRole))await qbLoadWorkshopContext();
 if(['super_admin','platform_admin'].includes(authRole))await qbLoadAdminData();
 render();
};
menus.workshop.push(['Customer Feedback','★']);
menus.admin.push(['Reviews','★']);
const qbSimpleCustomerReviewBase=simpleCustomer;
simpleCustomer=function(){
 if(page==='Service History')return customerReviewHistoryPage();
 return qbSimpleCustomerReviewBase();
};
function customerReviewHistoryPage(){
 const delivered=qbCustomerJobs.filter(j=>j.stage==='delivered');
 return head('VEHICLE RECORDS','Service history','Completed jobs and private workshop feedback.')+
 (delivered.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+delivered.map(j=>{
  const existing=qbCustomerReviews.find(r=>r.booking_id===j.booking_id);
  return '<div class="card"><div class="row"><b>'+qbSafe(j.job_code)+'</b><span class="status good">Delivered</span></div><h3>'+qbSafe(j.vehicles?.manufacturer||'Vehicle')+' '+qbSafe(j.vehicles?.model||'')+'</h3><div class="muted">'+qbSafe(j.vehicles?.registration_number||'')+' · '+qbSafe(j.workshops?.name||'Workshop')+'</div><div class="muted">Delivered: '+qbDate(j.delivered_at)+'</div>'+(existing?'<div class="notice" style="margin-top:12px">Your private feedback: '+qbSafe(existing.rating)+'/5 · '+qbSafe(existing.status)+'</div>':'<button class="btn" style="margin-top:12px" data-id="'+qbSafe(j.id)+'" onclick="reviewForm(this.dataset.id)">Leave private feedback</button>')+'</div>';
 }).join('')+'</div>':empty('↺','No completed services','Completed jobs will appear here.'));
}
function reviewForm(jobId){
 const j=qbCustomerJobs.find(x=>x.id===jobId&&x.stage==='delivered');if(!j||!j.booking_id||!j.workshop_id)return;
 if(qbCustomerReviews.some(r=>r.booking_id===j.booking_id)){toast('Feedback has already been submitted for this booking.');return}
 modal('Private workshop feedback',qbSafe(j.job_code)+' · '+qbSafe(j.workshops?.name||'Workshop'),' <form data-job-id="'+qbSafe(jobId)+'" onsubmit="saveReview(event,this.dataset.jobId)"><div class="formgrid"><label>Rating<select class="field" name="rating"><option value="5">5 · Excellent</option><option value="4">4 · Good</option><option value="3">3 · Average</option><option value="2">2 · Poor</option><option value="1">1 · Very poor</option></select></label><label class="full">Your feedback<textarea class="field" name="review_text" rows="4" placeholder="Share what went well or what could improve"></textarea></label></div><div class="notice">Feedback is private to you, this workshop and QuickBay administrators. It will not be published to the public workshop directory.</div><button class="btn">Submit feedback</button></form>');
}
async function saveReview(e,jobId){
 e.preventDefault();const j=qbCustomerJobs.find(x=>x.id===jobId);if(!j)return;
 const d=Object.fromEntries(new FormData(e.target));
 const {error}=await supabaseClient.from('workshop_reviews').insert({customer_id:authUser.id,workshop_id:j.workshop_id,booking_id:j.booking_id,rating:Number(d.rating),review_text:(d.review_text||'').trim(),status:'pending_review'});
 if(error){toast(qbErr(error));return}closeModal();await qbLoadCustomerReviews();render();toast('Private feedback submitted.');
}
function workshopFeedbackPage(){
 return head('CUSTOMER EXPERIENCE','Customer feedback','Private feedback for your workshop. These reviews are not published publicly.')+
 (qbWorkshopReviews.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(260px,1fr))">'+qbWorkshopReviews.map(r=>'<div class="card"><div class="row"><b>'+qbSafe(r.rating)+'/5 ★</b><span class="status">'+qbSafe(r.status)+'</span></div><p>'+qbSafe(r.review_text||'No written comment.')+'</p><small class="muted">'+qbDate(r.created_at)+'</small></div>').join('')+'</div>':empty('★','No feedback yet','Private feedback will appear here after completed services.'));
}
const qbWorkshopPagesReviewBase=workshopPages;
workshopPages=function(){
 if(page==='Customer Feedback')return workshopFeedbackPage();
 return qbWorkshopPagesReviewBase();
};
const qbAdminDataReviewBase=adminDataPage;
adminDataPage=function(){
 if(page==='Reviews')return adminReviewsPage();
 return qbAdminDataReviewBase();
};
function adminReviewsPage(){
 return head('CUSTOMER EXPERIENCE','Review moderation','Review private feedback. Marking it reviewed does not publish it.')+
 (qbAdminReviews.length?'<div class="tablewrap"><table><thead><tr><th>DATE</th><th>WORKSHOP ID</th><th>RATING</th><th>FEEDBACK</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbAdminReviews.map(r=>'<tr><td>'+qbDate(r.created_at)+'</td><td>'+qbSafe(r.workshop_id)+'</td><td>'+qbSafe(r.rating)+'/5</td><td>'+qbSafe(r.review_text)+'</td><td>'+qbSafe(r.status)+'</td><td><button class="btn light" data-id="'+qbSafe(r.id)+'" onclick="moderateReview(this.dataset.id)">Review</button></td></tr>').join('')+'</tbody></table></div>':empty('★','No feedback submitted','Customer feedback will appear here after completed jobs.'));
}
function moderateReview(id){
 const r=qbAdminReviews.find(x=>x.id===id);if(!r)return;
 modal('Moderate private feedback','Review '+r.rating+'/5 · Workshop '+r.workshop_id,'<form data-review-id="'+qbSafe(id)+'" onsubmit="saveReviewModeration(event,this.dataset.reviewId)"><div class="notice">'+qbSafe(r.review_text||'No written comment.')+'</div><div class="formgrid"><label>Status<select class="field" name="status">'+['pending_review','reviewed','rejected'].map(x=>'<option value="'+x+'" '+(r.status===x?'selected':'')+'>'+x+'</option>').join('')+'</select></label><label class="full">Admin notes<textarea class="field" name="admin_notes" rows="3">'+qbSafe(r.admin_notes||'')+'</textarea></label></div><button class="btn">Save review status</button></form>');
}
async function saveReviewModeration(e,id){
 e.preventDefault();const d=Object.fromEntries(new FormData(e.target));
 const {error}=await supabaseClient.from('workshop_reviews').update({status:d.status,admin_notes:d.admin_notes,updated_at:new Date().toISOString()}).eq('id',id);
 if(error){toast(qbErr(error));return}closeModal();await qbLoadAdminData();render();toast('Private review status updated.');
}
