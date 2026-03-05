/* ═══════════════════════════════════════════════════════════════════
   ml-features.js  –  MangoLovers Feature Layer
   Adds: Invoice viewer, Print, Edit product, Delete product,
         Edit stock (inline), View product detail, View sale detail,
         View/edit customer, View/edit supplier, Confirm PO,
         Add customer modal, Add supplier modal,
         Export CSV, Toast notifications
   ═══════════════════════════════════════════════════════════════════ */


/* ══════════════════════════════════
   PURCHASE ORDER ACTION DISPATCHER
   Called directly from onclick in renderPurchases
══════════════════════════════════ */
function _poAction(action, idx) {
  const po = purchases[idx];
  if (!po) return;
  if (action === 'view')    viewPurchaseOrder(po);
  if (action === 'print')   printPurchaseOrder(po);
  if (action === 'edit')    editPurchaseOrder(po);
  if (action === 'confirm') confirmPO(po);
}

function printPurchaseOrder(po) {
  const lines = (po.lineItems && po.lineItems.length)
    ? po.lineItems
    : [{name: 'Ordered items (' + po.items + ')', qty: po.items, unitPrice: po.total / po.items, subtotal: po.total}];

  const rows = lines.map((li, i) =>
    '<tr><td>' + (i+1) + '</td><td>' + li.name + (li.uom ? ' (' + li.uom + ')' : '') +
    '</td><td>' + li.qty + '</td><td>৳' + Number(li.unitPrice).toFixed(2) +
    '</td><td>৳' + Number(li.subtotal).toFixed(2) + '</td></tr>'
  ).join('');

  const statusBgMap = { Received: '#eaf7f1', Pending: '#fff8ec', Overdue: '#fef2f2' };
  const statusClrMap = { Received: '#3caf82', Pending: '#b27900', Overdue: '#e55353' };
  const bg  = statusBgMap[po.status]  || '#f7faf8';
  const clr = statusClrMap[po.status] || '#1a2e22';

  const win = window.open('', '_blank', 'width=820,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
  <title>Purchase Order ${po.id}</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',Arial,sans-serif;color:#1a2e22;background:#fff;padding:40px}
    .brand{font-size:22px;font-weight:800;letter-spacing:-.02em}
    .brand span{color:#f5a623}
    .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:28px;padding-bottom:18px;border-bottom:2px solid #e8f0eb}
    .inv-meta{text-align:right}
    .inv-meta .inv-num{font-size:18px;font-weight:700;color:#4a85e8;font-family:monospace}
    .inv-meta p{font-size:12px;color:#6b8a74;margin-top:4px}
    .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600;background:${bg};color:${clr}}
    .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:24px}
    .party-box{background:#f7faf8;border-radius:10px;padding:14px}
    .party-box h4{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#a8c5b8;margin-bottom:6px}
    .party-box p{font-size:13px;font-weight:600}
    .party-box span{font-size:12px;color:#6b8a74}
    table{width:100%;border-collapse:collapse;margin-bottom:20px}
    th{background:#f7faf8;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:#6b8a74;padding:9px 12px;text-align:left;border-bottom:1px solid #e8f0eb}
    td{padding:10px 12px;font-size:12.5px;border-bottom:1px solid #f0f6f2}
    .totals{margin-left:auto;width:260px}
    .totals-row{display:flex;justify-content:space-between;padding:6px 0;font-size:13px}
    .totals-row.grand{border-top:2px solid #1a2e22;margin-top:6px;padding-top:10px;font-size:15px;font-weight:800}
    .footer{margin-top:28px;text-align:center;font-size:11px;color:#a8c5b8;border-top:1px solid #e8f0eb;padding-top:14px}
  </style></head><body>
  <div class="inv-header">
    <div>
      <div class="brand">Mango<span>Lovers</span></div>
      <p style="font-size:12px;color:#6b8a74;margin-top:4px">Purchase Order</p>
    </div>
    <div class="inv-meta">
      <div class="inv-num">${po.id}</div>
      <p>Order Date: ${po.date}</p>
      <p style="margin-top:4px">Due: ${po.dueDate}</p>
      <p style="margin-top:6px"><span class="badge">${po.status}</span></p>
    </div>
  </div>
  <div class="parties">
    <div class="party-box">
      <h4>From</h4>
      <p>Mango Lovers Ltd.</p>
      <span>Dhaka, Bangladesh</span>
    </div>
    <div class="party-box">
      <h4>Supplier</h4>
      <p>${po.supplier}</p>
    </div>
  </div>
  <table>
    <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Cost</th><th>Subtotal</th></tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="totals">
    <div class="totals-row"><span>Subtotal</span><span>৳${po.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
    <div class="totals-row"><span>Paid</span><span style="color:#3caf82">৳${(po.paidAmount||0).toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
    <div class="totals-row grand"><span>Total</span><span>৳${po.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></div>
  </div>
  <div class="footer">MangoLovers Inventory System · Generated ${new Date().toLocaleString()}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ══════════════════════════════════
   TOAST SYSTEM
══════════════════════════════════ */
(function buildToastContainer() {
  const el = document.createElement('div');
  el.id = 'toast-container';
  el.style.cssText = `
    position:fixed; bottom:24px; right:24px; z-index:9999;
    display:flex; flex-direction:column; gap:8px; pointer-events:none;
  `;
  document.body.appendChild(el);
})();

function toast(msg, type = 'success', duration = 3200) {
  const colors = {
    success: { bg: 'var(--green)',  border: 'rgba(60,175,130,.3)' },
    error:   { bg: 'var(--red)',    border: 'rgba(229,83,83,.3)'  },
    info:    { bg: 'var(--blue)',   border: 'rgba(74,133,232,.3)' },
    warning: { bg: 'var(--mango-dk)', border: 'rgba(245,166,35,.3)' },
  };
  const icons = {
    success: '<polyline points="20 6 9 17 4 12"/>',
    error:   '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>',
    info:    '<circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>',
    warning: '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/>',
  };
  const c = colors[type] || colors.info;
  const t = document.createElement('div');
  t.style.cssText = `
    display:flex; align-items:center; gap:10px;
    padding:11px 16px; border-radius:10px;
    background:var(--card); border:1px solid ${c.border};
    box-shadow:0 4px 24px rgba(0,0,0,.18);
    font-size:12.5px; color:var(--text);
    pointer-events:all; cursor:default;
    animation:toastIn .25s cubic-bezier(.34,1.2,.64,1) both;
    max-width:320px;
  `;
  t.innerHTML = `
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
         stroke="${c.bg}" stroke-width="2.2"
         stroke-linecap="round" stroke-linejoin="round">${icons[type]}</svg>
    <span>${msg}</span>`;
  if (!document.getElementById('toastAnim')) {
    const s = document.createElement('style');
    s.id = 'toastAnim';
    s.textContent = `
      @keyframes toastIn  { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:none} }
      @keyframes toastOut { from{opacity:1;transform:none} to{opacity:0;transform:translateY(8px)} }
    `;
    document.head.appendChild(s);
  }
  document.getElementById('toast-container').appendChild(t);
  setTimeout(() => {
    t.style.animation = 'toastOut .22s ease forwards';
    setTimeout(() => t.remove(), 230);
  }, duration);
}

/* ══════════════════════════════════
   GENERIC MODAL ENGINE
══════════════════════════════════ */
let _activePanel = null;

function openPanel(html, width = '520px') {
  closePanel();
  const overlay = document.createElement('div');
  overlay.id = 'feat-overlay';
  overlay.style.cssText = `
    position:fixed;inset:0;z-index:3000;
    background:rgba(10,18,14,.55);backdrop-filter:blur(3px);
    display:flex;align-items:center;justify-content:center;
    animation:fadeOverlay .2s ease both;
  `;
  overlay.innerHTML = `
    <div id="feat-panel" style="
      background:var(--card);border:1px solid var(--border);
      border-radius:16px;padding:0;width:${width};max-width:96vw;
      max-height:90vh;overflow:hidden;display:flex;flex-direction:column;
      box-shadow:0 24px 80px rgba(0,0,0,.4);
      animation:panelIn .28s cubic-bezier(.34,1.1,.64,1) both;
    ">${html}</div>`;
  if (!document.getElementById('panelAnim')) {
    const s = document.createElement('style');
    s.id = 'panelAnim';
    s.textContent = `
      @keyframes fadeOverlay { from{opacity:0} to{opacity:1} }
      @keyframes panelIn { from{opacity:0;transform:scale(.95) translateY(10px)} to{opacity:1;transform:none} }
      .feat-hdr{display:flex;align-items:center;justify-content:space-between;padding:18px 22px 14px;border-bottom:1px solid var(--border);flex-shrink:0}
      .feat-hdr h3{font-size:15px;font-weight:700;margin:0}
      .feat-hdr p{font-size:11.5px;color:var(--text-soft);margin:2px 0 0}
      .feat-close{width:28px;height:28px;border-radius:7px;border:1px solid var(--border);background:transparent;cursor:pointer;display:flex;align-items:center;justify-content:center;color:var(--text-soft);transition:background .15s}
      .feat-close:hover{background:var(--border)}
      .feat-body{padding:20px 22px;overflow-y:auto;flex:1}
      .feat-footer{padding:14px 22px;border-top:1px solid var(--border);display:flex;justify-content:flex-end;gap:8px;flex-shrink:0}
      .feat-field{margin-bottom:14px}
      .feat-field label{display:block;font-size:11.5px;font-weight:600;color:var(--text-soft);margin-bottom:5px;text-transform:uppercase;letter-spacing:.04em}
      .feat-field input,.feat-field select,.feat-field textarea{width:100%;padding:9px 12px;border-radius:8px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12.5px;font-family:inherit;outline:none;box-sizing:border-box;transition:border .15s}
      .feat-field input:focus,.feat-field select:focus,.feat-field textarea:focus{border-color:var(--mango)}
      .feat-row{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .feat-divider{height:1px;background:var(--border);margin:16px 0}
      .feat-info-grid{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-bottom:14px}
      .feat-info-box{background:var(--bg);border-radius:9px;padding:11px 14px;border:1px solid var(--border)}
      .feat-info-lbl{font-size:10px;color:var(--text-faint);text-transform:uppercase;letter-spacing:.04em;margin-bottom:3px}
      .feat-info-val{font-size:13.5px;font-weight:700}
    `;
    document.head.appendChild(s);
  }
  overlay.addEventListener('click', e => { if (e.target === overlay) closePanel(); });
  document.body.appendChild(overlay);
  _activePanel = overlay;
}

function closePanel() {
  if (_activePanel) { _activePanel.remove(); _activePanel = null; }
}

/* Close on Escape */
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePanel(); });

/* ══════════════════════════════════
   INVOICE / SALE PRINT ENGINE
══════════════════════════════════ */
function printInvoiceHTML(sale) {
  const date = sale.date || new Date().toLocaleString();
  return `
    <!DOCTYPE html><html><head>
    <title>Invoice ${sale.id}</title>
    <style>
      *{margin:0;padding:0;box-sizing:border-box}
      body{font-family:'DM Sans',Arial,sans-serif;color:#1a2e22;background:#fff;padding:40px}
      .inv-header{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:32px;padding-bottom:20px;border-bottom:2px solid #e8f0eb}
      .brand{font-size:22px;font-weight:800;color:#1a2e22;letter-spacing:-.02em}
      .brand span{color:#f5a623}
      .inv-meta{text-align:right}
      .inv-meta .inv-num{font-size:18px;font-weight:700;color:#3caf82;font-family:monospace}
      .inv-meta p{font-size:12px;color:#6b8a74;margin-top:4px}
      .parties{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
      .party-box{background:#f7faf8;border-radius:10px;padding:16px}
      .party-box h4{font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#a8c5b8;margin-bottom:8px}
      .party-box p{font-size:13px;font-weight:600}
      .party-box span{font-size:12px;color:#6b8a74}
      table{width:100%;border-collapse:collapse;margin-bottom:24px}
      th{background:#f7faf8;font-size:10.5px;text-transform:uppercase;letter-spacing:.05em;color:#6b8a74;padding:10px 14px;text-align:left;border-bottom:1px solid #e8f0eb}
      td{padding:11px 14px;font-size:12.5px;border-bottom:1px solid #f0f6f2}
      .totals{margin-left:auto;width:260px}
      .totals-row{display:flex;justify-content:space-between;padding:7px 0;font-size:13px}
      .totals-row.grand{border-top:2px solid #1a2e22;margin-top:6px;padding-top:10px;font-size:15px;font-weight:800}
      .totals-row span:last-child{font-family:monospace}
      .badge{display:inline-block;padding:3px 10px;border-radius:20px;font-size:11px;font-weight:600}
      .badge-green{background:#eaf7f1;color:#3caf82}
      .badge-mango{background:#fff8ec;color:#b27900}
      .badge-red{background:#fef2f2;color:#e55353}
      .footer{margin-top:32px;text-align:center;font-size:11px;color:#a8c5b8;border-top:1px solid #e8f0eb;padding-top:16px}
      @media print{body{padding:0} .no-print{display:none}}
    </style></head><body>
    <div class="inv-header">
      <div>
        <div class="brand">Mango<span>Lovers</span></div>
        <p style="font-size:12px;color:#6b8a74;margin-top:4px">Inventory Management System</p>
      </div>
      <div class="inv-meta">
        <div class="inv-num">${sale.id}</div>
        <p>Date: ${date}</p>
        <p style="margin-top:4px">
          <span class="badge ${sale.status==='Completed'?'badge-green':sale.status==='Pending'?'badge-mango':'badge-red'}">${sale.status}</span>
        </p>
      </div>
    </div>
    <div class="parties">
      <div class="party-box">
        <h4>Bill From</h4>
        <p>Mango Lovers Ltd.</p>
        <span>Dhaka, Bangladesh</span><br>
        <span>admin@mangolover.com</span>
      </div>
      <div class="party-box">
        <h4>Bill To</h4>
        <p>${sale.customer}</p>
        <span>Payment: ${sale.payment}</span>
      </div>
    </div>
    <table>
      <thead><tr><th>#</th><th>Product</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        ${(sale.lineItems && sale.lineItems.length
          ? sale.lineItems
          : [{name:'Sale Items ('+sale.items+' items)',qty:sale.items,unitPrice:sale.total/sale.items,subtotal:sale.total}]
        ).map((li,idx)=>'<tr><td>'+(idx+1)+'</td><td>'+li.name+(li.uom?' ('+li.uom+')':'')+'</td><td>'+li.qty+'</td><td>৳'+Number(li.unitPrice).toFixed(2)+'</td><td>৳'+Number(li.subtotal).toFixed(2)+'</td></tr>').join('')}
      </tbody>
    </table>
    <div class="totals">
      <div class="totals-row"><span>Subtotal</span><span>৳${sale.total.toFixed(2)}</span></div>
      <div class="totals-row"><span>Tax (0%)</span><span>৳0.00</span></div>
      <div class="totals-row grand"><span>Total</span><span>৳${sale.total.toFixed(2)}</span></div>
    </div>
    <div class="footer">
      Thank you for your business! · MangoLovers · Generated ${new Date().toLocaleString()}
    </div>
    </body></html>`;
}

function printSale(sale) {
  const win = window.open('', '_blank', 'width=800,height=700');
  win.document.write(printInvoiceHTML(sale));
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ══════════════════════════════════
   VIEW INVOICE (modal)
══════════════════════════════════ */
function viewInvoice(sale) {
  const statusColor = { Completed:'var(--green)', Pending:'var(--mango-dk)', Refunded:'var(--red)' };
  const sc = statusColor[sale.status] || 'var(--text-soft)';
  const payColor = {'cash':'var(--green)','bkash':'var(--purple)','nagad':'var(--mango-dk)','card':'var(--blue)','Cash':'var(--green)','Card':'var(--blue)','Mobile Banking':'var(--purple)'}[sale.payment] || 'var(--text-soft)';

  openPanel(`
    <div class="feat-hdr">
      <div>
        <h3>Invoice</h3>
        <p style="font-family:monospace;font-size:11px;color:var(--mint)">${sale.id}</p>
      </div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box">
          <div class="feat-info-lbl">Customer</div>
          <div class="feat-info-val">${sale.customer}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Date</div>
          <div class="feat-info-val" style="font-size:12px">${sale.date}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Payment</div>
          <div class="feat-info-val" style="color:${payColor};text-transform:capitalize">${sale.payment}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Status</div>
          <div class="feat-info-val" style="color:${sc}">${sale.status}</div>
        </div>
      </div>
      <div class="feat-divider"></div>
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:8px">Items Purchased</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:0">
        <thead>
          <tr style="background:var(--bg)">
            <th style="text-align:left;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Product</th>
            <th style="text-align:center;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Qty</th>
            <th style="text-align:right;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Unit</th>
            <th style="text-align:right;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Subtotal</th>
          </tr>
        </thead>
        <tbody id="inv-line-items">
          <tr><td colspan="4" style="padding:14px;text-align:center;color:var(--text-faint);font-size:12px">Loading items…</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 10px;border-top:2px solid var(--border);margin-top:0">
        <span style="font-size:12px;font-weight:700;color:var(--text-soft)">TOTAL</span>
        <span id="inv-total-display" style="font-size:22px;font-weight:800;color:var(--mint);font-family:monospace">৳${sale.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="printSale(window._viewSale);closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print Invoice
      </button>
    </div>
  `, '560px');

  window._viewSale = sale;

  // Populate line items — fetch from DB if not loaded yet
  requestAnimationFrame(async () => {
    const tbody = document.getElementById('inv-line-items');
    if (!tbody) return;

    // If we already have lineItems loaded, render directly
    if (sale.lineItems && sale.lineItems.length) {
      _renderLineItemsTbody(tbody, sale.lineItems);
      _updateSaleTotal(sale.lineItems);
      return;
    }

    // Otherwise fetch from sale_items table using the raw DB id
    if (typeof db !== 'undefined' && sale._dbId) {
      try {
        const { data, error } = await db
          .from('sale_items')
          .select('quantity, unit_price, subtotal, items(name, uom)')
          .eq('sale_id', sale._dbId);
        if (!error && data && data.length) {
          sale.lineItems = data.map(r => ({
            name:      r.items?.name || '—',
            uom:       r.items?.uom  || '',
            qty:       r.quantity,
            unitPrice: parseFloat(r.unit_price),
            subtotal:  parseFloat(r.subtotal),
          }));
          _renderLineItemsTbody(tbody, sale.lineItems);
          _updateSaleTotal(sale.lineItems);
          return;
        }
      } catch(e) { console.warn('Could not load line items:', e); }
    }

    // Fallback — just show total
    _renderLineItemsTbody(tbody, [{
      name: 'Sale items (' + sale.items + ' item' + (sale.items !== 1 ? 's' : '') + ')',
      qty: sale.items, unitPrice: sale.total / sale.items, subtotal: sale.total
    }]);
  });
}

function _updateSaleTotal(lineItems) {
  const display = document.getElementById('inv-total-display');
  if (!display || !lineItems || !lineItems.length) return;
  const sum = lineItems.reduce((acc, li) => acc + (parseFloat(li.subtotal) || 0), 0);
  display.textContent = '৳' + sum.toLocaleString('en-IN', { minimumFractionDigits: 2 });
}

function _renderLineItemsTbody(tbody, lines) {
  tbody.innerHTML = lines.map(li => `
    <tr>
      <td style="padding:8px 10px;font-size:12px;border-bottom:1px solid var(--border)">${li.name}${li.uom ? " (" + li.uom + ")" : ""}</td>
      <td style="padding:8px 8px;font-size:12px;text-align:center;border-bottom:1px solid var(--border);font-family:monospace">${li.qty}</td>
      <td style="padding:8px 8px;font-size:12px;text-align:right;border-bottom:1px solid var(--border);font-family:monospace">৳${li.unitPrice.toFixed(2)}</td>
      <td style="padding:8px 10px;font-size:12px;text-align:right;font-weight:700;border-bottom:1px solid var(--border);font-family:monospace">৳${li.subtotal.toFixed(2)}</td>
    </tr>`).join('');
}

/* ══════════════════════════════════
   VIEW PRODUCT DETAIL
══════════════════════════════════ */
function viewProduct(p) {
  const pct = p.stock === 0 ? 0 : Math.min(100, (p.stock / p.minStock) * 100);
  const sc  = p.stock === 0 ? 'var(--red)' : p.stock <= p.minStock ? 'var(--mango-dk)' : 'var(--green)';
  openPanel(`
    <div class="feat-hdr">
      <div><h3>${p.name}</h3><p>${p.category} · ${p.sku}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box" style="grid-column:span 2">
          <div class="feat-info-lbl">Stock Level</div>
          <div style="display:flex;align-items:center;gap:12px;margin-top:4px">
            <span class="feat-info-val" style="color:${sc};font-size:28px">${p.stock}</span>
            <div style="flex:1">
              <div style="display:flex;justify-content:space-between;font-size:10.5px;color:var(--text-faint);margin-bottom:5px">
                <span>Current</span><span>Min: ${p.minStock}</span>
              </div>
              <div class="sbar" style="width:100%;height:8px"><div class="sfill ${p.stock===0?'sr':p.stock<=p.minStock?'sm':'sg'}" style="width:${pct}%;height:8px;border-radius:4px"></div></div>
            </div>
          </div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Selling Price</div>
          <div class="feat-info-val" style="color:var(--mint)">৳${p.price.toFixed(2)}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Cost Price</div>
          <div class="feat-info-val">৳${p.cost.toFixed(2)}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Profit Margin</div>
          <div class="feat-info-val" style="color:var(--green)">${(((p.price-p.cost)/p.price)*100).toFixed(1)}%</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Stock Value</div>
          <div class="feat-info-val">৳${(p.stock*p.price).toFixed(0)}</div>
        </div>
        <div class="feat-info-box" style="grid-column:span 2">
          <div class="feat-info-lbl">Supplier</div>
          <div class="feat-info-val">${p.supplier || '—'}</div>
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-outline" onclick="closePanel();editProduct(window._viewProd)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit Product
      </button>
      <button class="btn btn-primary" onclick="closePanel();editStock(window._viewProd)">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
        Adjust Stock
      </button>
    </div>
  `, '520px');
  window._viewProd = p;
}

/* ══════════════════════════════════
   EDIT PRODUCT MODAL
══════════════════════════════════ */
function editProduct(p) {
  const cats = [...new Set(products.map(x => x.category))];
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Edit Product</h3><p>${p.name}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-row">
        <div class="feat-field"><label>Product Name</label>
          <input id="ep-name" value="${p.name}"></div>
        <div class="feat-field"><label>SKU / Barcode</label>
          <input id="ep-sku" value="${p.sku}"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Category</label>
          <select id="ep-cat">${cats.map(c=>`<option value="${c}" ${c===p.category?'selected':''}>${c}</option>`).join('')}</select>
        </div>
        <div class="feat-field"><label>Supplier</label>
          <input id="ep-supplier" value="${p.supplier||''}"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Selling Price (৳)</label>
          <input id="ep-price" type="number" step="0.01" value="${p.price}"></div>
        <div class="feat-field"><label>Cost Price (৳)</label>
          <input id="ep-cost" type="number" step="0.01" value="${p.cost}"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Current Stock</label>
          <input id="ep-stock" type="number" value="${p.stock}"></div>
        <div class="feat-field"><label>Min Stock Threshold</label>
          <input id="ep-minstock" type="number" value="${p.minStock}"></div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_saveEditProduct('${p.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Save Changes
      </button>
    </div>
  `, '540px');
}

async function _saveEditProduct(pid) {
  const name     = document.getElementById('ep-name').value.trim();
  const sku      = document.getElementById('ep-sku').value.trim();
  const category = document.getElementById('ep-cat').value;
  const supplier = document.getElementById('ep-supplier').value.trim();
  const price    = parseFloat(document.getElementById('ep-price').value) || 0;
  const cost     = parseFloat(document.getElementById('ep-cost').value) || 0;
  const stock    = parseInt(document.getElementById('ep-stock').value) || 0;
  const minStock = parseInt(document.getElementById('ep-minstock').value) || 10;

  if (!name) { toast('Product name is required', 'error'); return; }

  // Update local array immediately
  const idx = products.findIndex(x => x.id === pid);
  if (idx > -1) {
    Object.assign(products[idx], {
      name, sku, category, supplier, price, cost, stock, minStock,
      status: stock === 0 ? 'Out of Stock' : stock <= minStock ? 'Low Stock' : 'In Stock',
    });
  }

  // Supabase update (if connected)
  if (typeof db !== 'undefined') {
    try {
      const { error } = await db.from('items').update({
        name, barcode: sku, category,
        selling_price: price, cost_price: cost,
        stock_quantity: stock,
      }).eq('id', pid);
      if (error) throw error;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderProducts(); renderCatPills(); renderCategories(); renderStockAlerts(); renderReports();
  toast(`"${name}" updated successfully`);
}

/* ══════════════════════════════════
   QUICK STOCK EDIT
══════════════════════════════════ */
function editStock(p) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Adjust Stock</h3><p>${p.name}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div style="text-align:center;padding:12px 0 20px">
        <div style="font-size:13px;color:var(--text-soft);margin-bottom:6px">Current Stock</div>
        <div id="es-display" style="font-size:48px;font-weight:800;font-family:monospace;color:var(--mint)">${p.stock}</div>
        <div style="font-size:12px;color:var(--text-faint);margin-top:4px">Min threshold: ${p.minStock}</div>
      </div>
      <div class="feat-field"><label>Adjustment Type</label>
        <select id="es-type" onchange="_updateStockPreview('${p.id}')">
          <option value="set">Set exact value</option>
          <option value="add">Add to stock</option>
          <option value="sub">Remove from stock</option>
        </select>
      </div>
      <div class="feat-field"><label>Quantity</label>
        <input id="es-qty" type="number" min="0" value="${p.stock}" oninput="_updateStockPreview('${p.id}')">
      </div>
      <div class="feat-field"><label>Reason (optional)</label>
        <input id="es-reason" placeholder="e.g. Supplier delivery, Damage, Count correction…">
      </div>
      <div id="es-preview" style="background:var(--bg);border-radius:9px;padding:12px 16px;border:1px solid var(--border);text-align:center;font-size:12.5px;color:var(--text-soft)">
        New stock will be: <strong style="color:var(--mint)">${p.stock}</strong>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_applyStockEdit('${p.id}')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Apply Adjustment
      </button>
    </div>
  `, '420px');
  window._editStockPid = p.id;
  window._editStockOrig = p.stock;
}

function _updateStockPreview(pid) {
  const type = document.getElementById('es-type')?.value;
  const qty  = parseInt(document.getElementById('es-qty')?.value) || 0;
  const orig = window._editStockOrig || 0;
  let newVal = type === 'add' ? orig + qty : type === 'sub' ? Math.max(0, orig - qty) : qty;
  const preview = document.getElementById('es-preview');
  if (preview) preview.innerHTML = `New stock will be: <strong style="color:var(--mint)">${newVal}</strong>`;
}

async function _applyStockEdit(pid) {
  const type   = document.getElementById('es-type').value;
  const qty    = parseInt(document.getElementById('es-qty').value) || 0;
  const reason = document.getElementById('es-reason').value;
  const orig   = window._editStockOrig || 0;
  let newQty   = type === 'add' ? orig + qty : type === 'sub' ? Math.max(0, orig - qty) : qty;

  const idx = products.findIndex(x => x.id === pid);
  if (idx > -1) {
    products[idx].stock  = newQty;
    products[idx].status = newQty === 0 ? 'Out of Stock' : newQty <= products[idx].minStock ? 'Low Stock' : 'In Stock';
  }

  if (typeof db !== 'undefined') {
    try {
      const { error } = await db.from('items').update({ stock_quantity: newQty }).eq('id', pid);
      if (error) throw error;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderProducts(); renderStockAlerts(); renderReports();
  toast(`Stock updated to ${newQty}${reason ? ' · ' + reason : ''}`);
}

/* ══════════════════════════════════
   DELETE PRODUCT (with confirm)
══════════════════════════════════ */
function deleteProduct(p) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Delete Product</h3><p>This action cannot be undone</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body" style="text-align:center;padding:32px 22px">
      <div style="width:56px;height:56px;border-radius:50%;background:rgba(229,83,83,.12);margin:0 auto 16px;display:flex;align-items:center;justify-content:center">
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--red)" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
      </div>
      <div style="font-size:15px;font-weight:700;margin-bottom:8px">Delete "${p.name}"?</div>
      <div style="font-size:13px;color:var(--text-soft)">This will permanently remove the product and all associated data from your inventory.</div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn" style="background:var(--red);color:#fff;border:none" onclick="_confirmDelete('${p.id}','${p.name.replace(/'/g,"\\'")}')">
        Yes, Delete Product
      </button>
    </div>
  `, '420px');
}

async function _confirmDelete(pid, pname) {
  const idx = products.findIndex(x => x.id === pid);
  if (idx > -1) products.splice(idx, 1);

  if (typeof db !== 'undefined') {
    try {
      const { error } = await db.from('items').delete().eq('id', pid);
      if (error) throw error;
    } catch (err) {
      toast('Removed locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderProducts(); renderCatPills(); renderCategories(); renderStockAlerts(); renderReports();
  toast(`"${pname}" deleted`, 'info');
}

/* ══════════════════════════════════
   VIEW CUSTOMER DETAIL
══════════════════════════════════ */
function viewCustomer(c) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>${c.name}</h3><p>${c.id} · ${c.status}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div style="display:flex;align-items:center;gap:14px;margin-bottom:20px">
        <div style="width:52px;height:52px;border-radius:50%;background:var(--mango-bg);border:2px solid rgba(245,166,35,.25);display:flex;align-items:center;justify-content:center;font-size:20px;font-weight:800;color:var(--mango-dk)">${c.name[0]}</div>
        <div>
          <div style="font-size:16px;font-weight:700">${c.name}</div>
          <div style="font-size:12px;color:var(--text-soft);margin-top:3px">${c.email}</div>
          <div style="font-size:12px;color:var(--text-soft)">${c.phone}</div>
        </div>
      </div>
      <div class="feat-info-grid">
        <div class="feat-info-box">
          <div class="feat-info-lbl">Total Purchases</div>
          <div class="feat-info-val">${c.totalPurchases}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Total Spent</div>
          <div class="feat-info-val" style="color:var(--mint)">৳${c.totalSpent.toLocaleString()}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Outstanding Due</div>
          <div class="feat-info-val" style="color:${c.outstanding?'var(--red)':'var(--green)'}">৳${c.outstanding}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Account Status</div>
          <div class="feat-info-val" style="color:${c.status==='Active'?'var(--green)':'var(--text-soft)'}">${c.status}</div>
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="closePanel();editCustomer(window._viewCust)">Edit Customer</button>
    </div>
  `, '480px');
  window._viewCust = c;
}

/* ══════════════════════════════════
   EDIT CUSTOMER MODAL
══════════════════════════════════ */
function editCustomer(c) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Edit Customer</h3><p>${c.name}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-field"><label>Full Name</label><input id="ec-name" value="${c.name}"></div>
      <div class="feat-row">
        <div class="feat-field"><label>Phone</label><input id="ec-phone" value="${c.phone}"></div>
        <div class="feat-field"><label>Email</label><input id="ec-email" value="${c.email}"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Status</label>
          <select id="ec-status">
            <option ${c.status==='Active'?'selected':''}>Active</option>
            <option ${c.status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="feat-field"><label>Outstanding (৳)</label>
          <input id="ec-due" type="number" value="${c.outstanding}">
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_saveCustomer('${c.id}')">Save Changes</button>
    </div>
  `, '480px');
}

async function _saveCustomer(cid) {
  const name    = document.getElementById('ec-name').value.trim();
  const phone   = document.getElementById('ec-phone').value.trim();
  const email   = document.getElementById('ec-email').value.trim();
  const status  = document.getElementById('ec-status').value;
  const outstanding = parseFloat(document.getElementById('ec-due').value) || 0;

  if (!name) { toast('Name is required', 'error'); return; }

  const idx = customers.findIndex(x => x.id === cid);
  if (idx > -1) Object.assign(customers[idx], { name, phone, email, status, outstanding });

  if (typeof db !== 'undefined') {
    try {
      const { error } = await db.from('customers').update({ name, phone, email }).eq('id', cid);
      if (error) throw error;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderCustomers();
  toast(`${name} updated`);
}

/* ══════════════════════════════════
   ADD CUSTOMER MODAL
══════════════════════════════════ */
function openAddCustomer() {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Add Customer</h3><p>Register a new customer</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-field"><label>Full Name *</label><input id="ac-name" placeholder="e.g. Rafiq Ahmed"></div>
      <div class="feat-row">
        <div class="feat-field"><label>Phone</label><input id="ac-phone" placeholder="+880-1711-000000"></div>
        <div class="feat-field"><label>Email</label><input id="ac-email" placeholder="example@email.com"></div>
      </div>
      <div class="feat-field"><label>Address</label><input id="ac-address" placeholder="Dhaka, Bangladesh"></div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_addCustomer()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Customer
      </button>
    </div>
  `, '480px');
}

async function _addCustomer() {
  const name    = document.getElementById('ac-name').value.trim();
  const phone   = document.getElementById('ac-phone').value.trim();
  const email   = document.getElementById('ac-email').value.trim();
  const address = document.getElementById('ac-address').value.trim();
  if (!name) { toast('Name is required', 'error'); return; }

  const newC = {
    id: 'CUS-' + Date.now(),
    name, phone: phone||'—', email: email||'—',
    totalPurchases: 0, totalSpent: 0, outstanding: 0, status: 'Active',
  };

  if (typeof db !== 'undefined') {
    try {
      const { data, error } = await db.from('customers').insert([{ name, phone, email, address }]).select();
      if (error) throw error;
      if (data?.[0]) newC.id = data[0].id;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  customers.unshift(newC);
  closePanel();
  renderCustomers();
  toast(`${name} added`);
}

/* ══════════════════════════════════
   VIEW / EDIT SUPPLIER
══════════════════════════════════ */
function viewSupplier(s) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>${s.name}</h3><p>${s.id} · ${s.address}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box" style="grid-column:span 2">
          <div class="feat-info-lbl">Contact</div>
          <div class="feat-info-val">${s.contact}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Total Purchases</div>
          <div class="feat-info-val" style="color:var(--mint)">৳${s.totalPurchases.toLocaleString()}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Outstanding</div>
          <div class="feat-info-val" style="color:${s.outstanding?'var(--red)':'var(--green)'}">৳${s.outstanding.toLocaleString()}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Address</div>
          <div class="feat-info-val">${s.address}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Status</div>
          <div class="feat-info-val" style="color:${s.status==='Active'?'var(--green)':'var(--text-soft)'}">${s.status}</div>
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="closePanel();editSupplier(window._viewSupp)">Edit Supplier</button>
    </div>
  `, '480px');
  window._viewSupp = s;
}

function editSupplier(s) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Edit Supplier</h3><p>${s.name}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-field"><label>Name *</label><input id="es2-name" value="${s.name}"></div>
      <div class="feat-row">
        <div class="feat-field"><label>Address</label><input id="es2-cat" value="${s.address}"></div>
        <div class="feat-field"><label>Contact</label><input id="es2-contact" value="${s.contact}"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Status</label>
          <select id="es2-status">
            <option ${s.status==='Active'?'selected':''}>Active</option>
            <option ${s.status==='Inactive'?'selected':''}>Inactive</option>
          </select>
        </div>
        <div class="feat-field"><label>Outstanding (৳)</label>
          <input id="es2-due" type="number" value="${s.outstanding}">
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_saveSupplier('${s.id}')">Save Changes</button>
    </div>
  `, '480px');
}

async function _saveSupplier(sid) {
  const name    = document.getElementById('es2-name').value.trim();
  const cat     = document.getElementById('es2-cat').value.trim();
  const contact = document.getElementById('es2-contact').value.trim();
  const status  = document.getElementById('es2-status').value;
  const outstanding = parseFloat(document.getElementById('es2-due').value) || 0;
  if (!name) { toast('Name is required', 'error'); return; }

  const idx = suppliersData.findIndex(x => x.id === sid);
  if (idx > -1) Object.assign(suppliersData[idx], { name, address: cat, contact, status, outstanding });

  if (typeof db !== 'undefined') {
    try {
      const { error } = await db.from('suppliers').update({ name, phone: contact }).eq('id', sid);
      if (error) throw error;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderSuppliers();
  toast(`${name} updated`);
}

/* ══════════════════════════════════
   ADD SUPPLIER MODAL
══════════════════════════════════ */
function openAddSupplier() {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Add Supplier</h3><p>Register a new supplier</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-field"><label>Supplier Name *</label><input id="as-name" placeholder="e.g. TechWorld Distributors"></div>
      <div class="feat-row">
        <div class="feat-field"><label>Address</label><input id="as-cat" placeholder="e.g. Electronics"></div>
        <div class="feat-field"><label>Phone</label><input id="as-phone" placeholder="+880-1711-000000"></div>
      </div>
      <div class="feat-field"><label>Email</label><input id="as-email" placeholder="supplier@example.com"></div>
      <div class="feat-field"><label>Address</label><input id="as-address" placeholder="Dhaka, Bangladesh"></div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_addSupplier()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Supplier
      </button>
    </div>
  `, '480px');
}

async function _addSupplier() {
  const name    = document.getElementById('as-name').value.trim();
  const cat     = document.getElementById('as-cat').value.trim();
  const phone   = document.getElementById('as-phone').value.trim();
  const email   = document.getElementById('as-email').value.trim();
  const address = document.getElementById('as-address').value.trim();
  if (!name) { toast('Name is required', 'error'); return; }

  const newS = {
    id: 'SUP-' + Date.now(),
    name, address: cat||'General', contact: phone||email||'—',
    totalPurchases: 0, outstanding: 0, status: 'Active',
  };

  if (typeof db !== 'undefined') {
    try {
      const { data, error } = await db.from('suppliers').insert([{ name, phone, email, address }]).select();
      if (error) throw error;
      if (data?.[0]) newS.id = data[0].id;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  suppliersData.unshift(newS);
  closePanel();
  renderSuppliers();
  toast(`${name} added`);
}

/* ══════════════════════════════════
   CONFIRM PURCHASE ORDER
══════════════════════════════════ */
/* ══════════════════════════════════
   EDIT PURCHASE ORDER
══════════════════════════════════ */
function editPurchaseOrder(po) {
  const supplierOptions = suppliersData.map(s =>
    `<option value="${s.name}" ${s.name === po.supplier ? 'selected' : ''}>${s.name}</option>`
  ).join('');
  const firstItem = po.lineItems && po.lineItems[0] ? po.lineItems[0] : {};

  openPanel(`
    <div class="feat-hdr">
      <div><h3>Edit Purchase Order</h3><p>${po.id}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-field">
        <label>Supplier</label>
        <select id="edit-po-supplier">${supplierOptions || '<option>' + po.supplier + '</option>'}</select>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="feat-field">
          <label>Item / Product</label>
          <select id="edit-po-item" onchange="_editPOItemChanged()">
            <option value="">— Select Item —</option>
            ${products.map(p => `<option value="${p.id}" data-cost="${p.cost||0}" data-name="${p.name}" ${(firstItem.name===p.name)?'selected':''}>${p.name}</option>`).join('')}
          </select>
        </div>
        <div class="feat-field">
          <label>Quantity</label>
          <input id="edit-po-qty" type="number" min="0" value="${firstItem.qty || po.items || 0}" oninput="_editPORecalc()">
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="feat-field">
          <label>Unit Cost (৳)</label>
          <input id="edit-po-unitcost" type="number" min="0" step="0.01" value="${firstItem.unitPrice || 0}" oninput="_editPORecalc()">
        </div>
        <div class="feat-field">
          <label>Total Amount (৳)</label>
          <input id="edit-po-total" type="number" min="0" step="0.01" value="${po.total || 0}" style="font-weight:700;color:var(--mint)">
        </div>
      </div>
      <div class="feat-field">
        <label>Paid Amount (৳)</label>
        <input id="edit-po-paid" type="number" min="0" step="0.01" value="${po.paidAmount || 0}">
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px">
        <div class="feat-field">
          <label>Order Date</label>
          <input id="edit-po-date" type="date" value="${po.date || ''}">
        </div>
        <div class="feat-field">
          <label>Payment Status</label>
          <select id="edit-po-status">
            <option value="pending"      ${po.status==='Pending'    ?'selected':''}>Pending</option>
            <option value="paid"         ${po.status==='Received'   ?'selected':''}>Received (Paid)</option>
            <option value="partial_paid" ${po.status==='In Transit' ?'selected':''}>In Transit / Partial</option>
          </select>
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_savePOEdit('${po._dbId}', '${po.id}')">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
        Save Changes
      </button>
    </div>
  `, '480px');
}

function _editPOItemChanged() {
  const sel = document.getElementById('edit-po-item');
  const opt = sel?.options[sel.selectedIndex];
  const cost = parseFloat(opt?.dataset.cost) || 0;
  const costInput = document.getElementById('edit-po-unitcost');
  if (costInput && cost > 0) {
    costInput.value = cost.toFixed(2);
    _editPORecalc();
  }
}

function _editPORecalc() {
  const qty  = parseFloat(document.getElementById('edit-po-qty')?.value)      || 0;
  const cost = parseFloat(document.getElementById('edit-po-unitcost')?.value) || 0;
  const totalEl = document.getElementById('edit-po-total');
  if (totalEl) totalEl.value = (qty * cost).toFixed(2);
}

async function _savePOEdit(dbId, poDisplayId) {
  const supplier  = document.getElementById('edit-po-supplier')?.value?.trim();
  const itemSel   = document.getElementById('edit-po-item');
  const itemOpt   = itemSel?.options[itemSel?.selectedIndex];
  const itemId    = itemSel?.value || null;
  const itemName  = itemOpt?.dataset.name || itemOpt?.text || '';
  const qty       = parseFloat(document.getElementById('edit-po-qty')?.value) || 0;
  const unitCost  = parseFloat(document.getElementById('edit-po-unitcost')?.value) || 0;
  const total     = parseFloat(document.getElementById('edit-po-total')?.value) || (qty * unitCost);
  const paid      = parseFloat(document.getElementById('edit-po-paid')?.value) || 0;
  const dateVal   = document.getElementById('edit-po-date')?.value;
  const statusRaw = document.getElementById('edit-po-status')?.value;

  if (!supplier) { toast('Please select a supplier', 'warning'); return; }

  const statusDisplayMap = { paid:'Received', pending:'Pending', partial_paid:'In Transit' };
  const idx = purchases.findIndex(p => p._dbId === dbId);
  if (idx > -1) {
    purchases[idx].supplier    = supplier;
    purchases[idx].total       = total;
    purchases[idx].paidAmount  = paid;
    purchases[idx].status      = statusDisplayMap[statusRaw] || 'Pending';
    purchases[idx].date        = dateVal || purchases[idx].date;
    purchases[idx].items       = qty || purchases[idx].items;
    purchases[idx].itemSummary = itemName || purchases[idx].itemSummary;
    if (purchases[idx].lineItems && purchases[idx].lineItems[0]) {
      purchases[idx].lineItems[0].name      = itemName || purchases[idx].lineItems[0].name;
      purchases[idx].lineItems[0].qty       = qty;
      purchases[idx].lineItems[0].subtotal  = total;
      purchases[idx].lineItems[0].unitPrice = qty > 0 ? total / qty : 0;
    }
  }

  if (typeof db !== 'undefined' && dbId) {
    try {
      let supplierId = null;
      const { data: supRows } = await db.from('suppliers').select('supplier_id').ilike('name', supplier).limit(1);
      if (supRows && supRows.length) supplierId = supRows[0].supplier_id;

      const payload = { total_amount: total, paid_amount: paid, payment_status: statusRaw, quantity: qty };
      if (itemId) payload.item_id = itemId;
      if (dateVal) payload.purchase_date = new Date(dateVal).toISOString();
      if (supplierId) payload.supplier_id = supplierId;

      const { error } = await db.from('supplier_purchases').update(payload).eq('id', dbId);
      if (error) throw error;
      await loadPurchases();
      toast(`${poDisplayId} updated successfully`);
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
      renderPurchases();
    }
  } else {
    renderPurchases();
    toast(`${poDisplayId} updated locally`);
  }
  closePanel();
}

function confirmPO(po) {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Confirm Purchase Order</h3><p>${po.id}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box" style="grid-column:span 2">
          <div class="feat-info-lbl">Supplier</div>
          <div class="feat-info-val">${po.supplier}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Total Value</div>
          <div class="feat-info-val" style="color:var(--mint)">৳${po.total.toLocaleString()}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Current Status</div>
          <div class="feat-info-val">${po.status}</div>
        </div>
      </div>
      <div class="feat-field" style="margin-top:8px"><label>Update Status To</label>
        <select id="po-status">
          <option value="Received">Received</option>
          <option value="In Transit">In Transit</option>
          <option value="Pending">Pending</option>
        </select>
      </div>
      <div class="feat-field"><label>Note (optional)</label>
        <input id="po-note" placeholder="e.g. All items verified, 2 units damaged">
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_confirmPOStatus('${po.id}')">Update Order</button>
    </div>
  `, '440px');
}

async function _confirmPOStatus(poid) {
  const newStatus = document.getElementById('po-status').value;
  const note      = document.getElementById('po-note').value;

  const idx = purchases.findIndex(x => x.id === poid);
  if (idx > -1) purchases[idx].status = newStatus;

  /* Use _dbId (raw UUID) for the Supabase update */
  const po = purchases[idx];
  const dbId = (po && po._dbId) ? po._dbId : null;

  if (typeof db !== 'undefined' && dbId) {
    try {
      const dbStatus = newStatus === 'Received' ? 'paid' : newStatus === 'Pending' ? 'pending' : 'pending';
      const { error } = await db.from('supplier_purchases').update({ payment_status: dbStatus }).eq('id', dbId);
      if (error) throw error;
      await loadPurchases();
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
      renderPurchases();
    }
  } else {
    renderPurchases();
  }

  closePanel();
  toast(`Order ${poid} → ${newStatus}${note ? ' · ' + note : ''}`);
}

/* ══════════════════════════════════
   EXPORT CSV
══════════════════════════════════ */
function exportCSV(data, filename, columns) {
  const header = columns.map(c => c.label).join(',');
  const rows = data.map(row =>
    columns.map(c => {
      const v = String(row[c.key] ?? '').replace(/"/g, '""');
      return v.includes(',') || v.includes('"') ? `"${v}"` : v;
    }).join(',')
  );
  const csv  = [header, ...rows].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url; a.download = filename; a.click();
  URL.revokeObjectURL(url);
  toast(`Exported ${filename}`);
}


/* ══════════════════════════════════
   SALES RETURN VIEW / PRINT
══════════════════════════════════ */
function viewSalesReturn(r) {
  const statusColor = { Processed:'var(--green)', Pending:'var(--mango-dk)' };
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Sales Return ${r.id}</h3><p>${r.date} · ${r.customer}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box"><div class="feat-info-lbl">Return ID</div><div class="feat-info-val" style="font-family:monospace;color:var(--mint)">${r.id}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">Original Invoice</div><div class="feat-info-val" style="font-family:monospace;font-size:12px">${r.invoiceId}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">Customer</div><div class="feat-info-val">${r.customer}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">Status</div><div class="feat-info-val" style="color:${statusColor[r.status]||'var(--text)'}">${r.status}</div></div>
      </div>
      <div class="feat-divider"></div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:8px">Returned Item</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr style="background:var(--bg)">
          <th style="text-align:left;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Product</th>
          <th style="text-align:center;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Qty</th>
          <th style="text-align:right;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Refund</th>
        </tr></thead>
        <tbody><tr>
          <td style="padding:9px 10px;font-size:12.5px;border-bottom:1px solid var(--border)">${r.product}</td>
          <td style="padding:9px 8px;text-align:center;font-family:monospace;border-bottom:1px solid var(--border)">${r.qty}</td>
          <td style="padding:9px 10px;text-align:right;font-weight:700;color:var(--red);font-family:monospace;border-bottom:1px solid var(--border)">৳${r.refundAmt.toFixed(2)}</td>
        </tr></tbody>
      </table>
      <div style="font-size:12.5px;color:var(--text-soft);padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
        <strong>Reason:</strong> ${r.reason}
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="printSalesReturn(window._viewSR);closePanel()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
    </div>
  `, '500px');
  window._viewSR = r;
}

function printSalesReturn(r) {
  const win = window.open('', '_blank', 'width=700,height=600');
  win.document.write(`<!DOCTYPE html><html><head><title>Sales Return ${r.id}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#1a2e22}
  .brand{font-size:22px;font-weight:800}.brand span{color:#f5a623}
  h2{font-size:18px;color:#e55353;margin:20px 0 4px}
  .meta{color:#6b8a74;font-size:12px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f7faf8;padding:9px 12px;font-size:11px;text-transform:uppercase;text-align:left;border-bottom:1px solid #e8f0eb}
  td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f0f6f2}
  .total{text-align:right;font-size:15px;font-weight:700;color:#e55353;margin-top:12px}
  .reason{background:#fef9f9;border:1px solid #fde;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#a8c5b8;border-top:1px solid #e8f0eb;padding-top:14px}
  </style></head><body>
  <div class="brand">Mango<span>Lovers</span></div>
  <h2>Sales Return ${r.id}</h2>
  <div class="meta">Date: ${r.date} &nbsp;|&nbsp; Original Invoice: ${r.invoiceId} &nbsp;|&nbsp; Customer: ${r.customer} &nbsp;|&nbsp; Status: ${r.status}</div>
  <table><thead><tr><th>Product</th><th>Qty Returned</th><th>Refund Amount</th></tr></thead>
  <tbody><tr><td>${r.product}</td><td>${r.qty}</td><td>৳${r.refundAmt.toFixed(2)}</td></tr></tbody></table>
  <div class="total">Total Refund: ৳${r.refundAmt.toFixed(2)}</div>
  <div class="reason"><strong>Reason:</strong> ${r.reason}</div>
  <div class="footer">MangoLovers Inventory System · Generated ${new Date().toLocaleString()}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ══════════════════════════════════
   PURCHASE RETURN VIEW / PRINT
══════════════════════════════════ */
function viewPurchaseReturn(r) {
  const statusColor = { Approved:'var(--green)', Pending:'var(--mango-dk)' };
  openPanel(`
    <div class="feat-hdr">
      <div><h3>Purchase Return ${r.id}</h3><p>${r.date} · ${r.supplier}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box"><div class="feat-info-lbl">Return ID</div><div class="feat-info-val" style="font-family:monospace;color:var(--mint)">${r.id}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">PO Number</div><div class="feat-info-val" style="font-family:monospace;font-size:12px">${r.poId}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">Supplier</div><div class="feat-info-val">${r.supplier}</div></div>
        <div class="feat-info-box"><div class="feat-info-lbl">Status</div><div class="feat-info-val" style="color:${statusColor[r.status]||'var(--text)'}">${r.status}</div></div>
      </div>
      <div class="feat-divider"></div>
      <div style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:8px">Returned Item</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:16px">
        <thead><tr style="background:var(--bg)">
          <th style="text-align:left;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Product</th>
          <th style="text-align:center;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Qty</th>
          <th style="text-align:right;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Credit</th>
        </tr></thead>
        <tbody><tr>
          <td style="padding:9px 10px;font-size:12.5px;border-bottom:1px solid var(--border)">${r.product}</td>
          <td style="padding:9px 8px;text-align:center;font-family:monospace;border-bottom:1px solid var(--border)">${r.qty}</td>
          <td style="padding:9px 10px;text-align:right;font-weight:700;color:var(--red);font-family:monospace;border-bottom:1px solid var(--border)">৳${r.creditAmt.toFixed(2)}</td>
        </tr></tbody>
      </table>
      <div style="font-size:12.5px;color:var(--text-soft);padding:8px 12px;background:var(--bg);border-radius:8px;border:1px solid var(--border)">
        <strong>Reason:</strong> ${r.reason}
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="printPurchaseReturn(window._viewPR);closePanel()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
    </div>
  `, '500px');
  window._viewPR = r;
}

function printPurchaseReturn(r) {
  const win = window.open('', '_blank', 'width=700,height=600');
  win.document.write(`<!DOCTYPE html><html><head><title>Purchase Return ${r.id}</title>
  <style>*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;padding:40px;color:#1a2e22}
  .brand{font-size:22px;font-weight:800}.brand span{color:#f5a623}
  h2{font-size:18px;color:#e55353;margin:20px 0 4px}
  .meta{color:#6b8a74;font-size:12px;margin-bottom:24px}
  table{width:100%;border-collapse:collapse;margin:16px 0}
  th{background:#f7faf8;padding:9px 12px;font-size:11px;text-transform:uppercase;text-align:left;border-bottom:1px solid #e8f0eb}
  td{padding:10px 12px;font-size:13px;border-bottom:1px solid #f0f6f2}
  .total{text-align:right;font-size:15px;font-weight:700;color:#e55353;margin-top:12px}
  .reason{background:#fef9f9;border:1px solid #fde;border-radius:8px;padding:12px 16px;margin-top:16px;font-size:13px}
  .footer{margin-top:32px;text-align:center;font-size:11px;color:#a8c5b8;border-top:1px solid #e8f0eb;padding-top:14px}
  </style></head><body>
  <div class="brand">Mango<span>Lovers</span></div>
  <h2>Purchase Return ${r.id}</h2>
  <div class="meta">Date: ${r.date} &nbsp;|&nbsp; PO: ${r.poId} &nbsp;|&nbsp; Supplier: ${r.supplier} &nbsp;|&nbsp; Status: ${r.status}</div>
  <table><thead><tr><th>Product</th><th>Qty Returned</th><th>Credit Amount</th></tr></thead>
  <tbody><tr><td>${r.product}</td><td>${r.qty}</td><td>৳${r.creditAmt.toFixed(2)}</td></tr></tbody></table>
  <div class="total">Total Credit: ৳${r.creditAmt.toFixed(2)}</div>
  <div class="reason"><strong>Reason:</strong> ${r.reason}</div>
  <div class="footer">MangoLovers Inventory System · Generated ${new Date().toLocaleString()}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ══════════════════════════════════
   NEW RETURN MODALS
══════════════════════════════════ */
function openNewSalesReturn() {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>New Sales Return</h3><p>Record a customer return</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-row">
        <div class="feat-field"><label>Original Invoice ID</label><input id="nsr-inv" placeholder="INV-2024-XXXX"></div>
        <div class="feat-field"><label>Customer Name</label><input id="nsr-cust" placeholder="e.g. Rafiq Ahmed"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Product Name</label><input id="nsr-prod" placeholder="e.g. Nike Air Max 270"></div>
        <div class="feat-field"><label>Qty Returned</label><input id="nsr-qty" type="number" min="1" value="1"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Refund Amount (৳)</label><input id="nsr-amt" type="number" step="0.01" placeholder="0.00"></div>
        <div class="feat-field"><label>Status</label>
          <select id="nsr-status"><option>Pending</option><option>Processed</option></select>
        </div>
      </div>
      <div class="feat-field"><label>Reason</label><input id="nsr-reason" placeholder="e.g. Wrong size, Damaged, etc."></div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_addSalesReturn()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Return
      </button>
    </div>
  `, '520px');
}

function _addSalesReturn() {
  const inv    = document.getElementById('nsr-inv').value.trim();
  const cust   = document.getElementById('nsr-cust').value.trim();
  const prod   = document.getElementById('nsr-prod').value.trim();
  const qty    = parseInt(document.getElementById('nsr-qty').value) || 1;
  const amt    = parseFloat(document.getElementById('nsr-amt').value) || 0;
  const status = document.getElementById('nsr-status').value;
  const reason = document.getElementById('nsr-reason').value.trim();
  if (!inv || !cust || !prod) { toast('Invoice, customer and product are required', 'error'); return; }
  const newR = {
    id: 'SR-' + String(salesReturns.length + 1).padStart(3, '0'),
    invoiceId: inv, customer: cust, product: prod,
    qty, refundAmt: amt, reason, status,
    date: new Date().toISOString().split('T')[0],
  };
  salesReturns.unshift(newR);
  closePanel();
  renderSalesReturns();
  toast('Sales return ' + newR.id + ' recorded');
}

function openNewPurchaseReturn() {
  openPanel(`
    <div class="feat-hdr">
      <div><h3>New Purchase Return</h3><p>Return items to supplier</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-row">
        <div class="feat-field"><label>PO Number</label><input id="npr-po" placeholder="PO-2024-XXXX"></div>
        <div class="feat-field"><label>Supplier Name</label><input id="npr-supp" placeholder="e.g. TechWorld Distributors"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Product Name</label><input id="npr-prod" placeholder="e.g. Sony WH-1000XM5"></div>
        <div class="feat-field"><label>Qty Returned</label><input id="npr-qty" type="number" min="1" value="1"></div>
      </div>
      <div class="feat-row">
        <div class="feat-field"><label>Credit Amount (৳)</label><input id="npr-amt" type="number" step="0.01" placeholder="0.00"></div>
        <div class="feat-field"><label>Status</label>
          <select id="npr-status"><option>Pending</option><option>Approved</option></select>
        </div>
      </div>
      <div class="feat-field"><label>Reason</label><input id="npr-reason" placeholder="e.g. Wrong model, Damaged on delivery, etc."></div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_addPurchaseReturn()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Add Return
      </button>
    </div>
  `, '520px');
}

function _addPurchaseReturn() {
  const po     = document.getElementById('npr-po').value.trim();
  const supp   = document.getElementById('npr-supp').value.trim();
  const prod   = document.getElementById('npr-prod').value.trim();
  const qty    = parseInt(document.getElementById('npr-qty').value) || 1;
  const amt    = parseFloat(document.getElementById('npr-amt').value) || 0;
  const status = document.getElementById('npr-status').value;
  const reason = document.getElementById('npr-reason').value.trim();
  if (!po || !supp || !prod) { toast('PO number, supplier and product are required', 'error'); return; }
  const newR = {
    id: 'PR-' + String(purchaseReturns.length + 1).padStart(3, '0'),
    poId: po, supplier: supp, product: prod,
    qty, creditAmt: amt, reason, status,
    date: new Date().toISOString().split('T')[0],
  };
  purchaseReturns.unshift(newR);
  closePanel();
  renderPurchaseReturns();
  toast('Purchase return ' + newR.id + ' recorded');
}

/* ══════════════════════════════════
   NEW PURCHASE ORDER MODAL
══════════════════════════════════ */
function _npoLineHtml(itemOptions) {
  return `
    <div class="npo-line" style="display:grid;grid-template-columns:90px 1fr 60px 95px 90px 26px;gap:6px;margin-bottom:8px;align-items:center">
      <div style="position:relative">
        <input class="npo-id-input" placeholder="Product ID" autocomplete="off"
          style="width:100%;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:11px;font-family:monospace;box-sizing:border-box"
          oninput="_npoIdInput(event)" onblur="_npoIdBlur(event)">
        <div class="npo-id-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:999;background:var(--card);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.2);max-height:160px;overflow-y:auto;margin-top:2px"></div>
      </div>
      <select class="npo-item-select" onchange="_npoSelectChange(event)"
        style="padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:11.5px;box-sizing:border-box;width:100%">
        <option value="">— Select Item —</option>
        ${itemOptions}
      </select>
      <input type="number" class="npo-qty" min="1" value="1" oninput="_npoRecalcLine(event)"
        style="text-align:center;padding:7px 6px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;width:100%;box-sizing:border-box">
      <input type="number" class="npo-cost" min="0" step="0.01" placeholder="0.00" oninput="_npoRecalcLine(event)"
        style="text-align:right;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;width:100%;box-sizing:border-box">
      <input type="number" class="npo-subtotal" readonly
        style="text-align:right;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--mint);font-size:12px;font-weight:700;width:100%;box-sizing:border-box;cursor:default">
      <button onclick="this.closest('.npo-line').remove();_recalcPOTotal()"
        style="background:var(--red-bg);border:none;border-radius:6px;color:var(--red);cursor:pointer;font-size:15px;width:26px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0">×</button>
    </div>`;
}

function openNewPO() {
  const supplierOptions = suppliersData.map(s => `<option value="${s.name}">${s.name}</option>`).join('');
  const itemOptions = products.map(p => `<option value="${p.id}" data-cost="${p.cost||0}" data-name="${p.name}">${p.name}</option>`).join('');

  openPanel(`
    <div class="feat-hdr">
      <div><h3>New Purchase Order</h3><p>Record a supplier purchase</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-row">
        <div class="feat-field"><label>Supplier</label>
          <select id="npo-supplier">
            <option value="">— Select Supplier —</option>
            ${supplierOptions}
          </select>
        </div>
        <div class="feat-field"><label>Payment Status</label>
          <select id="npo-status">
            <option value="pending">Pending</option>
            <option value="paid">Paid (Received)</option>
          </select>
        </div>
      </div>

      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin:12px 0 6px">Line Items</div>
      <div style="display:grid;grid-template-columns:90px 1fr 60px 95px 90px 26px;gap:6px;margin-bottom:4px;padding:0 1px">
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase">Product ID</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase">Item Name</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:center">Qty</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:right">Unit Cost</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:right">Subtotal</span>
        <span></span>
      </div>
      <div id="npo-lines">${_npoLineHtml(itemOptions)}</div>
      <button onclick="_addPOLine()" style="font-size:11.5px;padding:5px 12px;border:1px dashed var(--border);border-radius:8px;background:transparent;color:var(--text-soft);cursor:pointer;width:100%;margin-bottom:12px">+ Add Item</button>

      <div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:10px 2px;border-top:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text-soft);font-weight:600">TOTAL</span>
        <span id="npo-total-display" style="font-size:20px;font-weight:800;color:var(--mint);font-family:monospace">৳0.00</span>
        <input id="npo-total" type="hidden" value="0">
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_submitNewPO()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Save Purchase Order
      </button>
    </div>
  `, '640px');
}

function _addPOLine() {
  const itemOptions = products.map(p => `<option value="${p.id}" data-cost="${p.cost||0}" data-name="${p.name}">${p.name}</option>`).join('');
  const div = document.createElement('div');
  div.innerHTML = _npoLineHtml(itemOptions);
  document.getElementById('npo-lines').appendChild(div.firstElementChild);
}

/* Fill a line from a product object */
function _npoFillLine(line, product) {
  const idInput  = line.querySelector('.npo-id-input');
  const sel      = line.querySelector('.npo-item-select');
  const costIn   = line.querySelector('.npo-cost');
  if (idInput) idInput.value = product.id || '';
  if (sel) {
    // select matching option
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === product.id) { sel.selectedIndex = i; break; }
    }
  }
  if (costIn) costIn.value = product.cost > 0 ? Number(product.cost).toFixed(2) : '';
  _npoRecalcLine({ target: costIn || line.querySelector('.npo-qty') });
}

/* Product ID input — show live dropdown */
function _npoIdInput(e) {
  const input = e.target;
  const line  = input.closest('.npo-line');
  const val   = input.value.trim().toLowerCase();
  const dropdown = line.querySelector('.npo-id-dropdown');

  if (!val || val.length < 1) { dropdown.style.display = 'none'; return; }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(val) || p.name.toLowerCase().includes(val)
  ).slice(0, 8);

  if (!matches.length) { dropdown.style.display = 'none'; return; }

  dropdown.innerHTML = matches.map(p => `
    <div class="npo-id-opt" data-id="${p.id}" style="padding:7px 10px;cursor:pointer;font-size:11.5px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <span style="font-family:monospace;color:var(--mint);font-size:10.5px">${p.id}</span>
        <span style="color:var(--text);margin-left:8px">${p.name}</span>
      </div>
      <span style="color:var(--text-soft);font-size:11px;font-family:monospace">৳${Number(p.cost||0).toFixed(2)}</span>
    </div>`).join('');

  dropdown.querySelectorAll('.npo-id-opt').forEach(opt => {
    opt.addEventListener('mousedown', ev => {
      ev.preventDefault();
      const pid = opt.dataset.id;
      const product = products.find(p => p.id === pid);
      if (product) {
        input.value = product.id;
        dropdown.style.display = 'none';
        _npoFillLine(line, product);
      }
    });
    opt.addEventListener('mouseover', () => opt.style.background = 'var(--border)');
    opt.addEventListener('mouseout',  () => opt.style.background = '');
  });

  dropdown.style.display = 'block';
}

function _npoIdBlur(e) {
  const line = e.target.closest('.npo-line');
  const dropdown = line?.querySelector('.npo-id-dropdown');
  setTimeout(() => { if (dropdown) dropdown.style.display = 'none'; }, 150);

  // Exact match on blur
  const val = e.target.value.trim();
  const product = products.find(p => p.id === val);
  if (product) _npoFillLine(line, product);
}

/* Name dropdown changed — fill ID + cost */
function _npoSelectChange(e) {
  const line = e.target.closest('.npo-line');
  const opt  = e.target.options[e.target.selectedIndex];
  const pid  = opt.value;
  const product = products.find(p => p.id === pid);
  if (product) {
    const idInput = line.querySelector('.npo-id-input');
    const costIn  = line.querySelector('.npo-cost');
    if (idInput) idInput.value = product.id;
    if (costIn)  costIn.value  = product.cost > 0 ? Number(product.cost).toFixed(2) : '';
    _npoRecalcLine({ target: costIn });
  }
}

/* Recalc one line's subtotal then update grand total */
function _npoRecalcLine(e) {
  const line = e?.target?.closest('.npo-line');
  if (!line) return;
  const qty  = parseFloat(line.querySelector('.npo-qty')?.value)  || 0;
  const cost = parseFloat(line.querySelector('.npo-cost')?.value) || 0;
  const sub  = line.querySelector('.npo-subtotal');
  if (sub) sub.value = qty > 0 && cost > 0 ? (qty * cost).toFixed(2) : '';
  _recalcPOTotal();
}

function _recalcPOTotal() {
  let total = 0;
  document.querySelectorAll('.npo-line').forEach(line => {
    total += parseFloat(line.querySelector('.npo-subtotal')?.value) || 0;
  });
  const hidden  = document.getElementById('npo-total');
  const display = document.getElementById('npo-total-display');
  if (hidden)  hidden.value = total.toFixed(2);
  if (display) display.textContent = '৳' + total.toLocaleString('en-IN', {minimumFractionDigits:2});
}

/* Keep old _onPOLineChange for backward compat */
function _onPOLineChange(e) { _npoRecalcLine(e); }

async function _submitNewPO() {
  const supplierName  = document.getElementById('npo-supplier').value;
  const paymentStatus = document.getElementById('npo-status').value;
  const total         = parseFloat(document.getElementById('npo-total').value) || 0;

  if (!supplierName) { toast('Please select a supplier', 'error'); return; }

  const lineItems = [];
  document.querySelectorAll('.npo-line').forEach(line => {
    const sel      = line.querySelector('.npo-item-select');
    const opt      = sel?.options[sel?.selectedIndex];
    const itemId   = sel?.value || null;
    const name     = opt?.dataset.name || opt?.text || '';
    const qty      = parseFloat(line.querySelector('.npo-qty')?.value)  || 0;
    const unitCost = parseFloat(line.querySelector('.npo-cost')?.value) || 0;
    if (itemId && qty > 0) lineItems.push({ name, itemId, qty, unitCost });
  });

  if (lineItems.length === 0) { toast('Please select at least one item', 'error'); return; }
  if (total <= 0) { toast('Total must be greater than zero', 'error'); return; }

  const btn = document.querySelector('.feat-footer .btn-mango');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  let result;
  if (typeof savePurchaseToDB === 'function') {
    result = await savePurchaseToDB({ supplierName, paymentStatus, total, lineItems });
  } else {
    const d   = new Date().toISOString().split('T')[0];
    const due = new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0];
    purchases.unshift({
      _dbId: null, id: 'PO-LOCAL-' + Date.now(),
      supplier: supplierName, items: lineItems.length,
      itemSummary: lineItems.map(l => l.name).join(', '),
      total, paidAmount: paymentStatus === 'paid' ? total : 0,
      status: paymentStatus === 'paid' ? 'Received' : 'Pending',
      date: d, dueDate: due, lineItems,
    });
    renderPurchases();
    result = { success: true };
  }

  if (result.success) {
    closePanel();
    toast('Purchase order saved successfully');
  } else {
    toast('Error: ' + result.error, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Save Purchase Order'; }
  }
}


/* ══════════════════════════════════
   WIRE UP: PATCH renderProducts to attach button handlers
══════════════════════════════════ */
const _origRenderProducts = window.renderProducts;
window.renderProducts = function() {
  _origRenderProducts();
  // Buttons wired via data-pid attributes set during render
};
// Called from inline onclick in renderProducts template
function _prodAction(action, pid) {
  const p = products.find(x => String(x.id) === String(pid));
  if (!p) return;
  if (action === 'view')   viewProduct(p);
  if (action === 'edit')   editProduct(p);
  if (action === 'delete') deleteProduct(p);
  if (action === 'stock')  editStock(p);
}

/* WIRE UP: Sales table — inline onclick used, no wrapper needed */
const _origRenderSalesTable = window.renderSalesTable;
window.renderSalesTable = function() { _origRenderSalesTable(); };

/* WIRE UP: Purchases — inline onclick via _poAction, no wrapper needed */
const _origRenderPurchases = window.renderPurchases;
window.renderPurchases = function() { _origRenderPurchases(); };

/* WIRE UP: Suppliers table buttons */
const _origRenderSuppliers = window.renderSuppliers;
window.renderSuppliers = function() { _origRenderSuppliers(); };
function _suppAction(action, idx) {
  const s = suppliersData[idx];
  if (!s) return;
  if (action === 'view') viewSupplier(s);
  if (action === 'edit') editSupplier(s);
}

/* WIRE UP: Customer cards */
const _origRenderCustomers = window.renderCustomers;
window.renderCustomers = function(filter = '') { _origRenderCustomers(filter); };
function _custAction(idx) {
  const c = customers[idx];
  if (c) viewCustomer(c);
}

/* WIRE UP: Invoices — inline onclick, no wrapper needed */
const _origRenderInvoices = window.renderInvoices;
window.renderInvoices = function() { _origRenderInvoices(); };

/* ══════════════════════════════════
   VIEW PURCHASE ORDER DETAIL
══════════════════════════════════ */
function viewPurchaseOrder(po) {
  const statusColor = { Received:'var(--green)', Pending:'var(--mango-dk)', Overdue:'var(--red)', 'In Transit':'var(--blue)' };
  const sc = statusColor[po.status] || 'var(--text)';
  openPanel(`
    <div class="feat-hdr">
      <div><h3>${po.id}</h3><p>${po.supplier}</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box">
          <div class="feat-info-lbl">Supplier</div>
          <div class="feat-info-val">${po.supplier}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Status</div>
          <div class="feat-info-val" style="color:${sc}">${po.status}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Order Date</div>
          <div class="feat-info-val" style="font-size:12px">${po.date}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Due Date</div>
          <div class="feat-info-val" style="font-size:12px;color:${po.status==='Overdue'?'var(--red)':'inherit'}">${po.dueDate}</div>
        </div>
      </div>
      <div class="feat-divider"></div>
      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin-bottom:8px">Items Ordered</div>
      <table style="width:100%;border-collapse:collapse;margin-bottom:0">
        <thead>
          <tr style="background:var(--bg)">
            <th style="text-align:left;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Product</th>
            <th style="text-align:center;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Qty</th>
            <th style="text-align:right;padding:7px 8px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Unit Cost</th>
            <th style="text-align:right;padding:7px 10px;font-size:10.5px;color:var(--text-soft);font-weight:600;border-bottom:1px solid var(--border)">Subtotal</th>
          </tr>
        </thead>
        <tbody id="po-line-items">
          <tr><td colspan="4" style="padding:14px;text-align:center;color:var(--text-faint);font-size:12px">Loading items…</td></tr>
        </tbody>
      </table>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:12px 10px;border-top:2px solid var(--border)">
        <span style="font-size:12px;font-weight:700;color:var(--text-soft)">TOTAL</span>
        <span style="font-size:22px;font-weight:800;color:var(--mint);font-family:monospace">৳${po.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel();editPurchaseOrder(window._viewPO)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
        Edit
      </button>
      <button class="btn btn-outline" onclick="printPurchaseOrder(window._viewPO)">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print
      </button>
      <button class="btn btn-primary" onclick="closePanel();confirmPO(window._viewPO)">Update Status</button>
    </div>
  `, '560px');
  window._viewPO = po;

  // Render items immediately from already-loaded data
  requestAnimationFrame(() => {
    const tbody = document.getElementById('po-line-items');
    if (!tbody) return;
    if (po.lineItems && po.lineItems.length) {
      _renderLineItemsTbody(tbody, po.lineItems);
    } else {
      _renderLineItemsTbody(tbody, [{
        name: po.itemSummary || 'Ordered items',
        qty: po.items, unitPrice: po.total / Math.max(po.items,1), subtotal: po.total
      }]);
    }
  });
}

/* ══════════════════════════════════
   WIRE UP: ADD BUTTONS in sections
══════════════════════════════════ */
/* ══════════════════════════════════
   NEW SALE MODAL
══════════════════════════════════ */
function _nsiLineHtml(itemOptions) {
  return `
    <div class="nsi-line" style="display:grid;grid-template-columns:90px 1fr 60px 95px 90px 26px;gap:6px;margin-bottom:8px;align-items:center">
      <div style="position:relative">
        <input class="nsi-id-input" placeholder="Product ID" autocomplete="off"
          style="width:100%;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:11px;font-family:monospace;box-sizing:border-box"
          oninput="_nsiIdInput(event)" onblur="_nsiIdBlur(event)">
        <div class="nsi-id-dropdown" style="display:none;position:absolute;top:100%;left:0;right:0;z-index:999;background:var(--card);border:1px solid var(--border);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.2);max-height:160px;overflow-y:auto;margin-top:2px"></div>
      </div>
      <select class="nsi-item-select" onchange="_nsiSelectChange(event)"
        style="padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:11.5px;box-sizing:border-box;width:100%">
        <option value="">— Select Item —</option>
        ${itemOptions}
      </select>
      <input type="number" class="nsi-qty" min="1" value="1" oninput="_nsiRecalcLine(event)"
        style="text-align:center;padding:7px 6px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;width:100%;box-sizing:border-box">
      <input type="number" class="nsi-price" min="0" step="0.01" placeholder="0.00" oninput="_nsiRecalcLine(event)"
        style="text-align:right;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--text);font-size:12px;width:100%;box-sizing:border-box">
      <input type="number" class="nsi-subtotal" readonly
        style="text-align:right;padding:7px 8px;border-radius:7px;border:1px solid var(--border);background:var(--bg);color:var(--mint);font-size:12px;font-weight:700;width:100%;box-sizing:border-box;cursor:default">
      <button onclick="this.closest('.nsi-line').remove();_nsiRecalcTotal()"
        style="background:var(--red-bg);border:none;border-radius:6px;color:var(--red);cursor:pointer;font-size:15px;width:26px;height:32px;display:flex;align-items:center;justify-content:center;flex-shrink:0">×</button>
    </div>`;
}

function openNewSale() {
  const customerOptions = customers
    .map(c => `<option value="${c.id||''}" data-name="${c.name}">${c.name}</option>`).join('');
  const itemOptions = products.map(p => `<option value="${p.id}" data-price="${p.price||0}" data-name="${p.name}">${p.name}</option>`).join('');

  openPanel(`
    <div class="feat-hdr">
      <div><h3>New Sale</h3><p>Record a customer sale</p></div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-row">
        <div class="feat-field"><label>Customer</label>
          <select id="nsi-customer">
            <option value="">— Walk-in / Select Customer —</option>
            ${customerOptions}
          </select>
        </div>
        <div class="feat-field"><label>Payment Method</label>
          <select id="nsi-payment">
            <option value="cash">Cash</option>
            <option value="card">Card</option>
            <option value="bkash">bKash</option>
            <option value="nagad">Nagad</option>
          </select>
        </div>
      </div>
      <div class="feat-field">
        <label>Payment Status</label>
        <select id="nsi-status">
          <option value="paid">Paid</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      <div style="font-size:10.5px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:var(--text-faint);margin:12px 0 6px">Line Items</div>
      <div style="display:grid;grid-template-columns:90px 1fr 60px 95px 90px 26px;gap:6px;margin-bottom:4px;padding:0 1px">
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase">Product ID</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase">Item Name</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:center">Qty</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:right">Unit Price</span>
        <span style="font-size:9.5px;color:var(--text-faint);font-weight:700;text-transform:uppercase;text-align:right">Subtotal</span>
        <span></span>
      </div>
      <div id="nsi-lines">${_nsiLineHtml(itemOptions)}</div>
      <button onclick="_addSaleLine()" style="font-size:11.5px;padding:5px 12px;border:1px dashed var(--border);border-radius:8px;background:transparent;color:var(--text-soft);cursor:pointer;width:100%;margin-bottom:12px">+ Add Item</button>

      <div style="display:flex;justify-content:flex-end;align-items:center;gap:12px;padding:10px 2px;border-top:1px solid var(--border)">
        <span style="font-size:12px;color:var(--text-soft);font-weight:600">TOTAL</span>
        <span id="nsi-total-display" style="font-size:20px;font-weight:800;color:var(--mint);font-family:monospace">৳0.00</span>
        <input id="nsi-total" type="hidden" value="0">
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Cancel</button>
      <button class="btn btn-mango" onclick="_submitNewSale()">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
        Save Sale
      </button>
    </div>
  `, '640px');
}

function _addSaleLine() {
  const itemOptions = products.map(p => `<option value="${p.id}" data-price="${p.price||0}" data-name="${p.name}">${p.name}</option>`).join('');
  const div = document.createElement('div');
  div.innerHTML = _nsiLineHtml(itemOptions);
  document.getElementById('nsi-lines').appendChild(div.firstElementChild);
}

function _nsiFillLine(line, product) {
  const idInput = line.querySelector('.nsi-id-input');
  const sel     = line.querySelector('.nsi-item-select');
  const priceIn = line.querySelector('.nsi-price');
  if (idInput) idInput.value = product.id || '';
  if (sel) {
    for (let i = 0; i < sel.options.length; i++) {
      if (sel.options[i].value === product.id) { sel.selectedIndex = i; break; }
    }
  }
  if (priceIn) priceIn.value = product.price > 0 ? Number(product.price).toFixed(2) : '';
  _nsiRecalcLine({ target: priceIn || line.querySelector('.nsi-qty') });
}

function _nsiIdInput(e) {
  const input    = e.target;
  const line     = input.closest('.nsi-line');
  const val      = input.value.trim().toLowerCase();
  const dropdown = line.querySelector('.nsi-id-dropdown');

  if (!val) { dropdown.style.display = 'none'; return; }

  const matches = products.filter(p =>
    p.id.toLowerCase().includes(val) || p.name.toLowerCase().includes(val)
  ).slice(0, 8);

  if (!matches.length) { dropdown.style.display = 'none'; return; }

  dropdown.innerHTML = matches.map(p => `
    <div class="nsi-id-opt" data-id="${p.id}" style="padding:7px 10px;cursor:pointer;font-size:11.5px;border-bottom:1px solid var(--border);display:flex;justify-content:space-between;align-items:center">
      <div>
        <span style="font-family:monospace;color:var(--mint);font-size:10.5px">${p.id}</span>
        <span style="color:var(--text);margin-left:8px">${p.name}</span>
      </div>
      <span style="color:var(--text-soft);font-size:11px;font-family:monospace">৳${Number(p.price||0).toFixed(2)}</span>
    </div>`).join('');

  dropdown.querySelectorAll('.nsi-id-opt').forEach(opt => {
    opt.addEventListener('mousedown', ev => {
      ev.preventDefault();
      const product = products.find(p => p.id === opt.dataset.id);
      if (product) { input.value = product.id; dropdown.style.display = 'none'; _nsiFillLine(line, product); }
    });
    opt.addEventListener('mouseover', () => opt.style.background = 'var(--border)');
    opt.addEventListener('mouseout',  () => opt.style.background = '');
  });

  dropdown.style.display = 'block';
}

function _nsiIdBlur(e) {
  const line = e.target.closest('.nsi-line');
  const dropdown = line?.querySelector('.nsi-id-dropdown');
  setTimeout(() => { if (dropdown) dropdown.style.display = 'none'; }, 150);
  const product = products.find(p => p.id === e.target.value.trim());
  if (product) _nsiFillLine(line, product);
}

function _nsiSelectChange(e) {
  const line    = e.target.closest('.nsi-line');
  const product = products.find(p => p.id === e.target.value);
  if (product) {
    const idInput = line.querySelector('.nsi-id-input');
    const priceIn = line.querySelector('.nsi-price');
    if (idInput) idInput.value = product.id;
    if (priceIn) priceIn.value = product.price > 0 ? Number(product.price).toFixed(2) : '';
    _nsiRecalcLine({ target: priceIn });
  }
}

function _nsiRecalcLine(e) {
  const line = e?.target?.closest('.nsi-line');
  if (!line) return;
  const qty   = parseFloat(line.querySelector('.nsi-qty')?.value)   || 0;
  const price = parseFloat(line.querySelector('.nsi-price')?.value) || 0;
  const sub   = line.querySelector('.nsi-subtotal');
  if (sub) sub.value = qty > 0 && price > 0 ? (qty * price).toFixed(2) : '';
  _nsiRecalcTotal();
}

function _nsiRecalcTotal() {
  let total = 0;
  document.querySelectorAll('.nsi-line').forEach(line => {
    total += parseFloat(line.querySelector('.nsi-subtotal')?.value) || 0;
  });
  const hidden  = document.getElementById('nsi-total');
  const display = document.getElementById('nsi-total-display');
  if (hidden)  hidden.value = total.toFixed(2);
  if (display) display.textContent = '৳' + total.toLocaleString('en-IN', {minimumFractionDigits:2});
}

async function _submitNewSale() {
  const customerId = document.getElementById('nsi-customer').value || null;
  const paymentMethod = document.getElementById('nsi-payment').value;
  const paymentStatus = document.getElementById('nsi-status').value;

  const lineItems = [];
  document.querySelectorAll('.nsi-line').forEach(line => {
    const sel      = line.querySelector('.nsi-item-select');
    const itemId   = sel?.value || null;
    const name     = products.find(p => p.id === itemId)?.name || '';
    const qty      = parseFloat(line.querySelector('.nsi-qty')?.value)   || 0;
    const price    = parseFloat(line.querySelector('.nsi-price')?.value) || 0;
    const subtotal = parseFloat(line.querySelector('.nsi-subtotal')?.value) || (qty * price);
    if (itemId && qty > 0) lineItems.push({ itemId, name, qty, unitPrice: price, subtotal });
  });

  if (lineItems.length === 0) { toast('Please add at least one item', 'error'); return; }

  const btn = document.querySelector('.feat-footer .btn-mango');
  if (btn) { btn.disabled = true; btn.textContent = 'Saving…'; }

  try {
    if (typeof db === 'undefined') throw new Error('DB not connected');

    // 1. Insert sale header
    const { data: saleRows, error: saleErr } = await db
      .from('sales')
      .insert([{
        customer_id:    customerId || null,
        payment_type:   paymentMethod,
        payment_status: paymentStatus,
        sale_date:      new Date().toISOString(),
      }])
      .select();
    if (saleErr) throw saleErr;
    if (!saleRows || saleRows.length === 0) throw new Error('Sale insert returned no data — check Supabase RLS policies allow SELECT after INSERT on sales table.');
    const saleId = saleRows[0].id;

    // 2. Insert sale_items rows
    const itemRows = lineItems.map(li => ({
      sale_id:    saleId,
      item_id:    li.itemId,
      quantity:   li.qty,
      unit_price: li.unitPrice,
      subtotal:   li.subtotal,
    }));
    const { error: itemsErr } = await db.from('sale_items').insert(itemRows);
    if (itemsErr) throw itemsErr;

    // 3. Decrement stock for each sold item
    for (const li of lineItems) {
      const product = products.find(p => p.id === li.itemId);
      const currentStock = product?.stock ?? 0;
      const newStock = Math.max(0, currentStock - li.qty);
      await db.from('items').update({ stock_quantity: newStock }).eq('id', li.itemId);
    }

    await loadSales();
    await loadProducts();
    closePanel();
    toast('Sale recorded successfully');
  } catch (err) {
    toast('Error saving sale: ' + err.message, 'error');
    if (btn) { btn.disabled = false; btn.textContent = 'Save Sale'; }
  }
}

document.addEventListener('DOMContentLoaded', () => {
  // Add Customer button
  const custSection = document.getElementById('page-customers');
  const addCustBtn  = custSection?.querySelector('.btn-primary');
  if (addCustBtn) addCustBtn.onclick = () => openAddCustomer();

  // Customer cards → add edit icon hint
  const custGridObs = new MutationObserver(() => {
    document.querySelectorAll('.customer-card').forEach(card => {
      if (!card.querySelector('.cust-edit-hint')) {
        const hint = document.createElement('div');
        hint.className = 'cust-edit-hint';
        hint.style.cssText = 'text-align:center;margin-top:12px;font-size:11px;color:var(--text-faint);border-top:1px solid var(--border);padding-top:10px';
        hint.textContent = 'Click to view / edit';
        card.appendChild(hint);
      }
    });
  });
  const custGrid = document.getElementById('customerGrid');
  if (custGrid) custGridObs.observe(custGrid, { childList: true });

  // Wire up New Return buttons
  const srBtn = document.querySelector('#page-sales-returns .btn-primary');
  if (srBtn) srBtn.onclick = () => openNewSalesReturn();
  const prBtn = document.querySelector('#page-purchase-returns .btn-primary');
  if (prBtn) prBtn.onclick = () => openNewPurchaseReturn();

  // Add Supplier button
  const suppSection = document.getElementById('page-suppliers');
  const addSuppBtn  = suppSection?.querySelector('.btn-primary');
  if (addSuppBtn) addSuppBtn.onclick = () => openAddSupplier();

  // Export button (Products)
  const prodSection    = document.getElementById('page-products');
  const exportProdBtn  = prodSection?.querySelector('.btn-outline');
  if (exportProdBtn) exportProdBtn.onclick = () => exportCSV(products, 'products.csv', [
    { label: 'Name',     key: 'name'     },
    { label: 'SKU',      key: 'sku'      },
    { label: 'Category', key: 'category' },
    { label: 'Stock',    key: 'stock'    },
    { label: 'Price',    key: 'price'    },
    { label: 'Cost',     key: 'cost'     },
    { label: 'Status',   key: 'status'   },
  ]);

  // Export button (Reports)
  const repSection   = document.getElementById('page-reports');
  const exportRepBtn = repSection?.querySelector('.btn-outline');
  if (exportRepBtn) exportRepBtn.onclick = () => exportCSV(products, 'inventory_report.csv', [
    { label: 'Name',        key: 'name'     },
    { label: 'Category',    key: 'category' },
    { label: 'Stock',       key: 'stock'    },
    { label: 'Price',       key: 'price'    },
    { label: 'Stock Value', key: '_sv'      },
    { label: 'Status',      key: 'status'   },
  ].map(c => ({ ...c, key: c.key === '_sv' ? 'name' : c.key })));

});

/* ══════════════════════════════════
   DASHBOARD RECENT SALES: add click-to-view
══════════════════════════════════ */
/* Dashboard recent sales — inline onclick, no wrapper needed */
const _origRenderRecentSales = window.renderRecentSales;
window.renderRecentSales = function() { _origRenderRecentSales(); };

console.log('✅ MangoLovers Features loaded: Invoice print, Stock edit, Product edit/delete, Customer/Supplier CRUD, Export CSV, Toast system');