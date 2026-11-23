
/* Customer invoice viewer: read-only; no payments or financial transactions. */
const qbSimpleCustomerBillingBase=simpleCustomer;
simpleCustomer=function(){
 if(page==='Invoices')return customerInvoicesPage();
 return qbSimpleCustomerBillingBase();
};
function customerInvoicesPage(){
 return head('BILLING RECORDS','My invoices','View invoice summaries issued by your workshops. Payments are not processed by QuickBay.')+
 (qbCustomerInvoices.length?'<div class="tablewrap"><table><thead><tr><th>INVOICE</th><th>ISSUED</th><th>TOTAL</th><th>STATUS</th><th>ACTION</th></tr></thead><tbody>'+qbCustomerInvoices.map(i=>'<tr><td><b>'+qbSafe(i.invoice_number)+'</b></td><td>'+qbDate(i.issued_at)+'</td><td>'+qbMoney(i.total)+'</td><td>'+qbSafe(i.payment_status)+'</td><td><button class="btn light" data-id="'+qbSafe(i.id)+'" onclick="viewCustomerInvoice(this.dataset.id)">View</button></td></tr>').join('')+'</tbody></table></div>':empty('₹','No invoices yet','Invoices issued by a QuickBay workshop will appear here.'));
}
function viewCustomerInvoice(id){
 const i=qbCustomerInvoices.find(x=>x.id===id);if(!i)return;
 modal('Invoice summary',qbSafe(i.invoice_number),' <div class="card"><div class="row"><b>Invoice number</b><span>'+qbSafe(i.invoice_number)+'</span></div><div class="row"><b>Issued</b><span>'+qbDate(i.issued_at)+'</span></div><div class="row"><b>Subtotal</b><span>'+qbMoney(i.subtotal)+'</span></div><div class="row"><b>Tax</b><span>'+qbMoney(i.tax_total)+'</span></div><div class="row"><b>Discount</b><span>'+qbMoney(i.discount)+'</span></div><div class="row"><b>Total</b><strong>'+qbMoney(i.total)+'</strong></div><div class="row"><b>Payment status</b><span>'+qbSafe(i.payment_status)+'</span></div><div class="muted">GSTIN: '+qbSafe(i.gstin||'Not recorded')+'</div></div><div class="notice">This is a read-only invoice summary. QuickBay does not accept payments or initiate financial transactions.</div><button class="btn light" data-id="'+qbSafe(i.id)+'" onclick="printCustomerInvoice(this.dataset.id)">Print / Save as PDF</button>');
}
function printCustomerInvoice(id){
 const i=qbCustomerInvoices.find(x=>x.id===id);if(!i)return;
 const w=window.open('','_blank');if(!w){toast('Allow pop-ups to print this invoice summary.');return}
 const money=v=>'₹'+Number(v||0).toLocaleString('en-IN',{maximumFractionDigits:2});
 w.document.write('<!doctype html><html><head><title>'+qbSafe(i.invoice_number)+'</title><meta name="viewport" content="width=device-width,initial-scale=1"><style>body{font:15px Arial,sans-serif;color:#111;max-width:760px;margin:40px auto;padding:24px}h1{font-size:26px}.muted{color:#666}.row{display:flex;justify-content:space-between;padding:12px 0;border-bottom:1px solid #ddd}.total{font-size:20px;font-weight:700}.notice{margin-top:24px;color:#555;font-size:12px}@media print{button{display:none}}</style></head><body><h1>QuickBay · Invoice summary</h1><p class="muted">Read-only customer copy — not a payment receipt</p><div class="row"><b>Invoice</b><span>'+qbSafe(i.invoice_number)+'</span></div><div class="row"><b>Issued</b><span>'+qbDate(i.issued_at)+'</span></div><div class="row"><b>Subtotal</b><span>'+money(i.subtotal)+'</span></div><div class="row"><b>Tax</b><span>'+money(i.tax_total)+'</span></div><div class="row"><b>Discount</b><span>'+money(i.discount)+'</span></div><div class="row total"><b>Total</b><span>'+money(i.total)+'</span></div><div class="row"><b>Payment status</b><span>'+qbSafe(i.payment_status)+'</span></div><p class="notice">This invoice summary is displayed from QuickBay records. No payment was collected or processed.</p><button onclick="window.print()">Print / Save as PDF</button></body></html>');
 w.document.close();w.focus();
}

const qbCustomerBillingEstimatesBase=simpleCustomer;
simpleCustomer=function(){
 if(page==='Estimates')return customerEstimatesPage();
 return qbCustomerBillingEstimatesBase();
};
function customerEstimatesPage(){
 const visible=qbCustomerEstimates.filter(e=>e.status!=='draft');
 return head('SERVICE APPROVAL','My estimates','Review estimates shared by your workshop. Responses stay inside QuickBay; no message is sent.')+
 (visible.length?'<div class="grid" style="grid-template-columns:repeat(auto-fit,minmax(280px,1fr))">'+visible.map(e=>'<div class="card"><div class="row"><b>Estimate v'+qbSafe(e.version)+'</b><span class="status">'+qbSafe(e.status)+'</span></div><div class="statnum">'+qbMoney(e.total)+'</div><div class="muted">Created '+qbDate(e.created_at)+'</div><div style="margin-top:12px">'+(e.estimate_items||[]).map(x=>'<div class="row"><span>'+qbSafe(x.description)+' × '+qbSafe(x.quantity)+'</span><b>'+qbMoney(Number(x.quantity)*Number(x.unit_price)*(1+Number(x.tax_rate)/100))+'</b></div>').join('')+'</div><div class="row"><span>Subtotal</span><b>'+qbMoney(e.subtotal)+'</b></div><div class="row"><span>Tax</span><b>'+qbMoney(e.tax_total)+'</b></div><div class="row"><span>Discount</span><b>'+qbMoney(e.discount)+'</b></div><div class="row"><strong>Total</strong><strong>'+qbMoney(e.total)+'</strong></div>'+(e.status==='sent'?'<div style="display:flex;gap:8px;margin-top:12px"><button class="btn" data-id="'+qbSafe(e.id)+'" onclick="respondToEstimate(this.dataset.id,\'approved\')">Approve</button><button class="btn light" data-id="'+qbSafe(e.id)+'" onclick="respondToEstimate(this.dataset.id,\'changes_requested\')">Request changes</button></div>':'<div class="notice" style="margin-top:12px">Response: '+qbSafe(e.status)+' · '+qbDate(e.customer_response_at)+'</div>')+'</div>').join('')+'</div>':empty('₹','No estimates to review','When a workshop makes an estimate available, it will appear here.'));
}
async function respondToEstimate(id,response){
 const {error}=await supabaseClient.rpc('respond_to_estimate',{p_estimate_id:id,p_response:response});
 if(error){
  if(response==='changes_requested'&&(error.code==='23514'||/estimates_status_check/i.test(error.message||''))){toast('Request changes is blocked by the current database status constraint. A database migration is required.');return}
  toast(qbErr(error));return
 }
 await qbLoadCustomerEstimates();render();toast(response==='approved'?'Estimate approved.':'Changes requested.');
}
