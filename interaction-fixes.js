
/* Reliable mobile navigation + visible runtime diagnostics. */
(function(){
 const originalShell=window.shell;
 if(typeof originalShell==='function'){
  window.shell=function(){
   originalShell();
   document.querySelectorAll('#nav button[onclick]').forEach(button=>{
    const raw=button.getAttribute('onclick')||'';
    const match=raw.match(/^go\(([\s\S]*)\);?$/);
    if(!match)return;
    try{
     button.dataset.qbPage=JSON.parse(match[1]);
     button.removeAttribute('onclick');
    }catch(_){}
   });
  };
 }
 document.addEventListener('click',function(event){
  const button=event.target.closest('#nav button[data-qb-page]');
  if(!button)return;
  event.preventDefault();event.stopPropagation();
  if(typeof window.go==='function')window.go(button.dataset.qbPage);
 },true);
 window.addEventListener('error',function(event){
  console.error('QuickBay interface error:',event.message,event.filename,event.lineno);
  if(typeof window.toast==='function')window.toast('A screen control encountered an error. Please retry or refresh.');
 });
 window.addEventListener('unhandledrejection',function(event){
  console.error('QuickBay async error:',event.reason);
  if(typeof window.toast==='function')window.toast('A request did not finish. Please retry.');
 });
 ['go','previewAsGuest','setAuthTab','submitAuth','loadWorkshopDirectory','qbOpenWorkshopDetails','qbFocusWorkshop','qbOpenPartnerApplication'].forEach(name=>{
  if(typeof window[name]==='function')return;
  try{window[name]=eval(name)}catch(_){}
 });
 setTimeout(function(){
  const splash=document.getElementById('splash');
  if(splash&&!splash.classList.contains('hide'))splash.classList.add('hide');
 },5000);
})();
