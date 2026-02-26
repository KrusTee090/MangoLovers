/* ═══════════════════════════════════════════════════════════════════
   ml-features.js  –  MangoLovers Feature Layer
   Adds: Invoice viewer, Print, Edit product, Delete product,
         Edit stock (inline), View product detail, View sale detail,
         View/edit customer, View/edit supplier, Confirm PO,
         Add customer modal, Add supplier modal,
         Export CSV, Toast notifications
   ═══════════════════════════════════════════════════════════════════ */

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
      <thead><tr><th>#</th><th>Description</th><th>Qty</th><th>Unit Price</th><th>Subtotal</th></tr></thead>
      <tbody>
        <tr>
          <td>1</td>
          <td>Sale Items (${sale.items} item${sale.items!==1?'s':''})</td>
          <td>${sale.items}</td>
          <td>৳${(sale.total / sale.items).toFixed(2)}</td>
          <td>৳${sale.total.toFixed(2)}</td>
        </tr>
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
  openPanel(`
    <div class="feat-hdr">
      <div>
        <h3>Invoice ${sale.id}</h3>
        <p>${sale.date} · ${sale.customer}</p>
      </div>
      <button class="feat-close" onclick="closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
      </button>
    </div>
    <div class="feat-body">
      <div class="feat-info-grid">
        <div class="feat-info-box">
          <div class="feat-info-lbl">Invoice #</div>
          <div class="feat-info-val" style="font-family:monospace;font-size:12px;color:var(--mint)">${sale.id}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Status</div>
          <div class="feat-info-val" style="color:${sc}">${sale.status}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Customer</div>
          <div class="feat-info-val">${sale.customer}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Payment</div>
          <div class="feat-info-val">${sale.payment}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Items</div>
          <div class="feat-info-val">${sale.items}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Date</div>
          <div class="feat-info-val" style="font-size:12px">${sale.date}</div>
        </div>
      </div>
      <div class="feat-divider"></div>
      <div style="display:flex;justify-content:space-between;align-items:center;padding:14px 0">
        <span style="font-size:13px;color:var(--text-soft)">Total Amount</span>
        <span style="font-size:22px;font-weight:800;color:var(--mint)">৳${sale.total.toLocaleString('en-IN',{minimumFractionDigits:2})}</span>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="printSale(window._viewSale);closePanel()">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print Invoice
      </button>
    </div>
  `, '500px');
  window._viewSale = sale;
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
      <div><h3>${s.name}</h3><p>${s.id} · ${s.category}</p></div>
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
          <div class="feat-info-lbl">Category</div>
          <div class="feat-info-val">${s.category}</div>
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
        <div class="feat-field"><label>Category</label><input id="es2-cat" value="${s.category}"></div>
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
  if (idx > -1) Object.assign(suppliersData[idx], { name, category: cat, contact, status, outstanding });

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
        <div class="feat-field"><label>Category</label><input id="as-cat" placeholder="e.g. Electronics"></div>
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
    name, category: cat||'General', contact: phone||email||'—',
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

  if (typeof db !== 'undefined' && !poid.startsWith('PO-')) {
    try {
      const dbStatus = newStatus === 'Received' ? 'paid' : 'pending';
      const { error } = await db.from('supplier_purchases').update({ payment_status: dbStatus }).eq('id', poid);
      if (error) throw error;
    } catch (err) {
      toast('Saved locally · DB error: ' + err.message, 'warning');
    }
  }

  closePanel();
  renderPurchases();
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
   WIRE UP: PATCH renderProducts to attach button handlers
══════════════════════════════════ */
const _origRenderProducts = window.renderProducts;
window.renderProducts = function() {
  _origRenderProducts();
  document.querySelectorAll('#productsTbody tr').forEach((tr, i) => {
    const p = (() => {
      const q   = document.getElementById('productSearch').value.toLowerCase();
      const filt = products.filter(x =>
        (x.name.toLowerCase().includes(q) || x.sku.toLowerCase().includes(q)) &&
        (pCatFilter === 'All' || x.category === pCatFilter) &&
        (pStatFilter === 'All' || x.status === pStatFilter)
      );
      return filt[i];
    })();
    if (!p) return;
    const [viewBtn, editBtn, delBtn] = tr.querySelectorAll('.act-btn');
    if (viewBtn) viewBtn.onclick = () => viewProduct(p);
    if (editBtn) editBtn.onclick = () => editProduct(p);
    if (delBtn)  delBtn.onclick  = () => deleteProduct(p);
  });
};

/* WIRE UP: Sales table buttons */
const _origRenderSalesTable = window.renderSalesTable;
window.renderSalesTable = function() {
  _origRenderSalesTable();
  document.querySelectorAll('#salesTbody tr').forEach((tr, i) => {
    const q    = document.getElementById('salesSearch').value.toLowerCase();
    const filt = recentSales.filter(s =>
      (s.customer.toLowerCase().includes(q) || s.id.toLowerCase().includes(q)) &&
      (salesFilter === 'All' || s.status === salesFilter)
    );
    const s = filt[i];
    if (!s) return;
    const [viewBtn, printBtn, retBtn] = tr.querySelectorAll('.act-btn');
    if (viewBtn)  viewBtn.onclick  = () => viewInvoice(s);
    if (printBtn) printBtn.onclick = () => printSale(s);
    if (retBtn)   retBtn.onclick   = () => toast(`Return initiated for ${s.id}`, 'info');
  });
};

/* WIRE UP: Purchases table buttons */
const _origRenderPurchases = window.renderPurchases;
window.renderPurchases = function() {
  _origRenderPurchases();
  document.querySelectorAll('#purchasesTbody tr').forEach((tr, i) => {
    const po = purchases[i];
    if (!po) return;
    const [viewBtn, editBtn, confirmBtn] = tr.querySelectorAll('.act-btn');
    if (viewBtn)    viewBtn.onclick    = () => viewPurchaseOrder(po);
    if (editBtn)    editBtn.onclick    = () => confirmPO(po);
    if (confirmBtn) confirmBtn.onclick = () => confirmPO(po);
  });
};

/* WIRE UP: Suppliers table buttons */
const _origRenderSuppliers = window.renderSuppliers;
window.renderSuppliers = function() {
  _origRenderSuppliers();
  document.querySelectorAll('#suppliersTbody tr').forEach((tr, i) => {
    const s = suppliersData[i];
    if (!s) return;
    const [viewBtn, editBtn] = tr.querySelectorAll('.act-btn');
    if (viewBtn) viewBtn.onclick = () => viewSupplier(s);
    if (editBtn) editBtn.onclick = () => editSupplier(s);
  });
};

/* WIRE UP: Customer cards */
const _origRenderCustomers = window.renderCustomers;
window.renderCustomers = function(filter = '') {
  _origRenderCustomers(filter);
  document.querySelectorAll('.customer-card').forEach((card, i) => {
    const filt = customers.filter(c =>
      c.name.toLowerCase().includes(filter.toLowerCase()) || c.phone.includes(filter)
    );
    const c = filt[i];
    if (!c) return;
    card.style.cursor = 'pointer';
    card.onclick = () => viewCustomer(c);
  });
};

/* WIRE UP: Invoices table print/view buttons */
const _origRenderInvoices = window.renderInvoices;
window.renderInvoices = function() {
  _origRenderInvoices();
  document.querySelectorAll('#invoicesTbody tr').forEach((tr, i) => {
    const s = recentSales[i];
    if (!s) return;
    const [viewBtn, printBtn] = tr.querySelectorAll('.act-btn');
    if (viewBtn)  viewBtn.onclick  = () => viewInvoice(s);
    if (printBtn) printBtn.onclick = () => printSale(s);
  });
};

/* ══════════════════════════════════
   VIEW PURCHASE ORDER DETAIL
══════════════════════════════════ */
function viewPurchaseOrder(po) {
  const statusColor = { Received:'var(--green)', Pending:'var(--mango-dk)', Overdue:'var(--red)', 'In Transit':'var(--blue)' };
  openPanel(`
    <div class="feat-hdr">
      <div><h3>${po.id}</h3><p>${po.supplier}</p></div>
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
          <div class="feat-info-lbl">Items</div>
          <div class="feat-info-val">${po.items}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Order Date</div>
          <div class="feat-info-val" style="font-size:13px">${po.date}</div>
        </div>
        <div class="feat-info-box">
          <div class="feat-info-lbl">Due Date</div>
          <div class="feat-info-val" style="font-size:13px;color:${po.status==='Overdue'?'var(--red)':'inherit'}">${po.dueDate}</div>
        </div>
        <div class="feat-info-box" style="grid-column:span 2">
          <div class="feat-info-lbl">Status</div>
          <div class="feat-info-val" style="color:${statusColor[po.status]||'var(--text)'}">${po.status}</div>
        </div>
      </div>
    </div>
    <div class="feat-footer">
      <button class="btn btn-outline" onclick="closePanel()">Close</button>
      <button class="btn btn-primary" onclick="closePanel();confirmPO(window._viewPO)">Update Status</button>
    </div>
  `, '480px');
  window._viewPO = po;
}

/* ══════════════════════════════════
   WIRE UP: ADD BUTTONS in sections
══════════════════════════════════ */
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
const _origRenderRecentSales = window.renderRecentSales;
window.renderRecentSales = function() {
  _origRenderRecentSales();
  document.querySelectorAll('#recentSalesTbody tr').forEach((tr, i) => {
    const s = recentSales[i];
    if (!s) return;
    tr.style.cursor = 'pointer';
    tr.title = 'Click to view invoice';
    tr.onclick = () => viewInvoice(s);
  });
};

console.log('✅ MangoLovers Features loaded: Invoice print, Stock edit, Product edit/delete, Customer/Supplier CRUD, Export CSV, Toast system');
