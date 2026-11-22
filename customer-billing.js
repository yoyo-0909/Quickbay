
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
