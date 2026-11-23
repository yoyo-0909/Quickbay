/* Reliable navigation click delegation and runtime diagnostics. */
(function(){
 const originalShell=window.shell;
 if(typeof originalShell==='function'){
  window.shell=function(){
   originalShell();
   const nav=document.getElementById('nav');
   if(!nav)return;
   nav.querySelectorAll('button[data-qb-page]').forEach(button=>{
    button.type='button';
    button.setAttribute('role','link');
    button.setAttribute('tabindex','0');
   });
  };
 }
 function activateNav(event){
  const target=event.target instanceof Element?event.target:event.target?.parentElement;
  const button=target?.closest('#nav button[data-qb-page]');
  if(!button||button.disabled)return;
  const page=button.dataset.qbPage;
  if(!page||typeof window.go!=='function')return;
  event.preventDefault();
  event.stopPropagation();
  window.go(page);
 }
 document.addEventListener('click',activateNav,true);
 document.addEventListener('keydown',event=>{
  if(event.key!=='Enter'&&event.key!==' ')return;
  const target=event.target instanceof Element?event.target:null;
  const button=target?.closest('#nav button[data-qb-page]');
  if(!button)return;
  event.preventDefault();
  activateNav({target:button,preventDefault(){},stopPropagation(){}});
 },true);
 window.addEventListener('error',event=>{
  console.error('QuickBay interface error:',event.message,event.filename,event.lineno);
  if(typeof window.toast==='function')window.toast('A screen control encountered an error. Please retry or refresh.');
 });
 window.addEventListener('unhandledrejection',event=>{
  console.error('QuickBay async error:',event.reason);
  if(typeof window.toast==='function')window.toast('A request did not finish. Please retry.');
 });
 window.qbClearPrivateState=function(){
  vehicles=[];bookings=[];
  qbWorkshopId=null;qbWorkshopInfo=null;qbWorkshopBookings=[];qbWorkshopJobs=[];qbWorkshopBays=[];qbTechnicians=[];qbWorkshopServices=[];
  qbCustomerJobs=[];qbAdmin={profiles:[],bookings:[],applications:[],workshops:[],categories:[],audit:[]};
  qbInventoryItems=[];qbInventoryMovements=[];qbEstimates=[];qbInvoices=[];qbPartsReturns=[];
  qbCustomerNotifications=[];qbCustomerInvoices=[];qbCustomerEstimates=[];
  qbCustomerReviews=[];qbWorkshopReviews=[];qbAdminReviews=[];
  qbSavedWorkshops=[];qbSupportTickets=[];qbAdminSupportTickets=[];
  store.set('saved_workshops',[]);
 };
 window.go=go;window.previewAsGuest=previewAsGuest;window.setAuthTab=setAuthTab;window.submitAuth=submitAuth;
 window.loadWorkshopDirectory=loadWorkshopDirectory;window.qbOpenWorkshopDetails=qbOpenWorkshopDetails;
 window.qbFocusWorkshop=qbFocusWorkshop;window.qbOpenPartnerApplication=qbOpenPartnerApplication;
 setTimeout(()=>{
  const splash=document.getElementById('splash');
  if(splash&&!splash.classList.contains('hide'))splash.classList.add('hide');
 },5000);
})();