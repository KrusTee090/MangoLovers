/* ═══════════════════════════════════════════════════════════
   ml-supabase.js  –  MangoLovers × Supabase Integration
   ═══════════════════════════════════════════════════════════
   HOW TO CONFIGURE:
   1. Go to your Supabase project → Settings → API
   2. Copy "Project URL" and paste it into SUPABASE_URL below
   3. Copy "anon / public" key and paste it into SUPABASE_ANON_KEY below
   ═══════════════════════════════════════════════════════════ */

const SUPABASE_URL      = 'https://emamwpcugeiwettkngyc.supabase.co';       // e.g. https://abcdefgh.supabase.co
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVtYW13cGN1Z2Vpd2V0dGtuZ3ljIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzE5NTQxODcsImV4cCI6MjA4NzUzMDE4N30.gq_oh21FmXpE_yPPLwe1QcJ_rheUiBSN4gRr8dcl6Cc';  // your anon/public key

/* ── Init client ── */
const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/* ═══════════════════════════════════════════════════════════
   CONNECTION CHECK  –  called on page load
   ═══════════════════════════════════════════════════════════ */
async function checkSupabaseConnection() {
  const banner = document.getElementById('db-status-banner');
  if (SUPABASE_URL === 'YOUR_SUPABASE_URL') {
    showBanner('warning', '⚙️ Supabase not configured yet. Open <b>ml-supabase.js</b> and fill in your URL & API key.');
    return false;
  }
  try {
    const { error } = await db.from('items').select('id').limit(1);
    if (error) throw error;
    showBanner('success', '✅ Connected to Supabase successfully!', 3000);
    return true;
  } catch (err) {
    showBanner('error', `❌ Supabase connection failed: ${err.message}. Check your URL & API key in ml-supabase.js.`);
    return false;
  }
}

function showBanner(type, html, autoDismiss = 0) {
  const banner = document.getElementById('db-status-banner');
  if (!banner) return;
  const colors = {
    success: 'var(--green)',
    warning: 'var(--mango-dk)',
    error:   'var(--red)',
  };
  banner.style.cssText = `
    display:flex; align-items:center; gap:10px; padding:10px 16px;
    background:var(--card); border:1px solid ${colors[type]};
    border-radius:10px; margin-bottom:16px; font-size:12.5px;
    color:${colors[type]}; animation:fadeUp .3s ease both;
  `;
  banner.innerHTML = html;
  if (autoDismiss) setTimeout(() => { banner.style.display = 'none'; }, autoDismiss);
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD STATS
   ═══════════════════════════════════════════════════════════ */
async function loadDashboardStats() {
  try {
    // Total products
    const { count: totalProducts } = await db
      .from('items').select('*', { count: 'exact', head: true });

    // Low stock items (stock_quantity <= 10)
    const { count: lowStockCount } = await db
      .from('items').select('*', { count: 'exact', head: true })
      .lte('stock_quantity', 10);

    // Today's sales total
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySales } = await db
      .from('sales')
      .select('id, sale_items!sale_items_sale_id_fkey(subtotal)')
      .gte('sale_date', `${today}T00:00:00`)
      .lte('sale_date', `${today}T23:59:59`);
    const todayRevenue = (todaySales || []).reduce((sum, s) => {
      const items = Array.isArray(s.sale_items) ? s.sale_items : [];
      return sum + items.reduce((a, si) => a + parseFloat(si.subtotal || 0), 0);
    }, 0);

    // Pending orders
    const { count: pendingOrders } = await db
      .from('sales').select('*', { count: 'exact', head: true })
      .eq('payment_status', 'pending');

    // Update stat cards
    const statVals = document.querySelectorAll('.stat-val');
    if (statVals[0]) statVals[0].textContent = `৳${todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    if (statVals[1]) statVals[1].textContent = (totalProducts || 0).toLocaleString();
    if (statVals[2]) statVals[2].textContent = (pendingOrders || 0);
    if (statVals[3]) statVals[3].textContent = (lowStockCount || 0);

    // Update page config subtitle
    pageCfg.products.sub = `${totalProducts || 0} total products`;

  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════
   PRODUCTS (items table)
   ═══════════════════════════════════════════════════════════ */
async function loadProducts() {
  try {
    const { data, error } = await db
      .from('items')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    // Map DB rows to the app's product shape
    const mapped = (data || []).map(row => ({
      id:       row.id,
      name:     row.name,
      category: row.category || 'Uncategorized',
      sku:      row.barcode || row.id.slice(0, 10).toUpperCase(),
      stock:    row.stock_quantity,
      minStock: 10,
      price:    parseFloat(row.selling_price),
      cost:     parseFloat(row.cost_price),
      supplier: '—',
      status:   row.stock_quantity === 0 ? 'Out of Stock'
                : row.stock_quantity <= 10 ? 'Low Stock'
                : 'In Stock',
      iconSvg:  '<path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>',
    }));

    // Replace global products array
    products.length = 0;
    mapped.forEach(p => products.push(p));

    renderProducts();
    renderCatPills();
    renderCategories();
    renderStockAlerts();
    renderReports();
    document.getElementById('productsSubtitle').textContent = `${products.length} total products`;

  } catch (err) {
    console.error('Load products error:', err);
  }
}

async function saveProduct(formData) {
  try {
    const payload = {
      name:           formData.name,
      category:       formData.category,
      cost_price:     parseFloat(formData.cost)     || 0,
      selling_price:  parseFloat(formData.price)    || 0,
      stock_quantity: parseInt(formData.stock)      || 0,
      barcode:        formData.sku || null,
      description:    formData.description || null,
    };
    const { data, error } = await db.from('items').insert([payload]).select();
    if (error) throw error;
    await loadProducts();
    return { success: true, data };
  } catch (err) {
    console.error('Save product error:', err);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════
   CUSTOMERS
   ═══════════════════════════════════════════════════════════ */
async function loadCustomers() {
  try {
    const { data, error } = await db
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const mapped = (data || []).map(row => ({
      id:             row.id,
      name:           row.name,
      phone:          row.phone || '—',
      email:          row.email || '—',
      totalPurchases: 0,
      totalSpent:     0,
      outstanding:    0,
      status:         'Active',
    }));

    customers.length = 0;
    mapped.forEach(c => customers.push(c));
    renderCustomers();
    document.getElementById('customersSubtitle').textContent = `${customers.length} registered customers`;
    pageCfg.customers.sub = `${customers.length} registered customers`;

  } catch (err) {
    console.error('Load customers error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════
   SUPPLIERS
   ═══════════════════════════════════════════════════════════ */
async function loadSuppliers() {
  try {
    const { data, error } = await db
      .from('suppliers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const mapped = (data || []).map(row => ({
      id:              row.id,
      name:            row.name,
      address:         row.address || '—',
      contact:         row.phone || row.email || '—',
      email:           row.email || '—',
      phone:           row.phone || '—',
      totalPurchases:  0,
      outstanding:     0,
      status:          'Active',
    }));

    suppliersData.length = 0;
    mapped.forEach(s => suppliersData.push(s));
    renderSuppliers();
    document.querySelector('#page-suppliers p').textContent = `${suppliersData.length} registered suppliers`;

  } catch (err) {
    console.error('Load suppliers error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════
   SALES
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   SALES
   ═══════════════════════════════════════════════════════════ */
async function loadSales() {
  try {
    const { data, error } = await db
      .from('sales')
      .select(`
        id, payment_type, payment_status, sale_date, paid_amount,
        customers!customer_id(name),
        sale_items!sale_items_sale_id_fkey(
          id, quantity, unit_price, subtotal,
          items!item_id(id, name, uom)
        )
      `)
      .order('sale_date', { ascending: false })
      .limit(200);

    if (error) throw error;

    const statusMap = { paid: 'Completed', pending: 'Pending', partial: 'Pending', partial_paid: 'Pending' };
    const payLabel = t => ({ bkash:'bKash', nagad:'Nagad', cash:'Cash', card:'Card' }[String(t).toLowerCase()] || t);

    const mapped = (data || []).map(row => {
      // Safely handle customer object or array
      const cust = Array.isArray(row.customers) ? row.customers[0] : row.customers;
      const customerName = cust?.name || 'Walk-in';

      // Safely handle sale_items and nested items
      const sItems = Array.isArray(row.sale_items) ? row.sale_items : (row.sale_items ? [row.sale_items] : []);
      const lineItems = sItems.map(si => {
        const itemObj = Array.isArray(si.items) ? si.items[0] : si.items;
        return {
          id:        itemObj?.id   || '',
          name:      itemObj?.name || 'Unknown Item',
          uom:       itemObj?.uom  || '',
          qty:       si.quantity || 0,
          unitPrice: parseFloat(si.unit_price) || 0,
          subtotal:  parseFloat(si.subtotal) || 0,
        };
      });

      const itemSummary = lineItems.length
        ? lineItems.map(li => li.name.length > 30 ? li.name.slice(0, 28) + '…' : li.name).join(', ')
        : '—';

      // Safe date parsing to prevent JS crashes
      let sd = '—';
      if (row.sale_date) {
        try {
          const sdate = new Date(row.sale_date);
          if (!isNaN(sdate)) sd = sdate.toISOString().replace('T', ' ').slice(0, 16);
        } catch(e) {}
      }

      return {
        _dbId:       row.id,
        id:          String(row.id).slice(0, 8).toUpperCase(),
        customer:    customerName,
        items:       lineItems.length || 1,
        itemSummary: itemSummary,
        total:       lineItems.reduce((s, li) => s + li.subtotal, 0),
        payment:     payLabel(row.payment_type || 'cash'),
        status:      statusMap[row.payment_status] || 'Completed',
        date:        sd,
        lineItems:   lineItems,
      };
    });

    recentSales.length = 0;
    mapped.forEach(s => recentSales.push(s));

    renderRecentSales();
    renderSalesTable();
    renderInvoices();

    // Update sales stats
    const totalRevenue = recentSales.reduce((s, r) => s + r.total, 0);
    const pending = recentSales.filter(r => r.status === 'Pending').length;
    const miniStats = document.querySelectorAll('#page-sales .mini-stat-val');
    if (miniStats[0]) miniStats[0].textContent = `৳${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    if (miniStats[1]) miniStats[1].textContent = recentSales.length;
    if (miniStats[2]) miniStats[2].textContent = pending;

  } catch (err) {
    console.error('Load sales error:', err);
    showBanner('error', `❌ Sales failed to load: ${err.message}`);
  }
}

/* ═══════════════════════════════════════════════════════════
   PURCHASES (supplier_purchases)
   ═══════════════════════════════════════════════════════════ */
async function loadPurchases() {
  try {
    const { data, error } = await db
        .from('supplier_purchases')
        .select(`
          id, total_amount, purchase_date, payment_status, paid_amount,
          quantity, item_id,
          suppliers(name),
          items!item_id(id, name, uom)
        `)
        .order('purchase_date', { ascending: false })
        .limit(200);

    if (error) throw error;

    const statusMap = { paid: 'Received', pending: 'Pending', partial_paid: 'In Transit', partial: 'In Transit' };

    const mapped = (data || []).map(row => {
      // Safely handle supplier
      const supp = Array.isArray(row.suppliers) ? row.suppliers[0] : row.suppliers;
      const supplierName = supp?.name || '—';

      // Build line item directly from supplier_purchases row fields
      const itemObj = Array.isArray(row.items) ? row.items[0] : row.items;
      const lineItems = itemObj ? [{
        name:      itemObj.name || 'Unknown Item',
        uom:       itemObj.uom  || '',
        qty:       row.quantity || 0,
        unitPrice: parseFloat(itemObj.cost_price) || (row.quantity > 0 ? parseFloat(row.total_amount) / row.quantity : 0),
        subtotal:  parseFloat(row.total_amount) || 0,
      }] : [];

      const itemSummary = lineItems.length
        ? lineItems.map(li => li.name.length > 30 ? li.name.slice(0, 28) + '…' : li.name).join(', ')
        : '—';

      // Safe date calculations
      let d = '—', due = '—';
      if (row.purchase_date) {
        try {
          const pd = new Date(row.purchase_date);
          if (!isNaN(pd)) {
            d = pd.toISOString().split('T')[0];
            due = new Date(pd.getTime() + 30*24*60*60*1000).toISOString().split('T')[0];
          }
        } catch(e) {}
      }

      return {
        _dbId:       row.id,
        id:          'PO-' + String(row.id).slice(0, 8).toUpperCase(),
        supplier:    supplierName,
        items:       lineItems.length || 1,
        itemSummary: itemSummary,
        total:       parseFloat(row.total_amount) || 0,
        paidAmount:  parseFloat(row.paid_amount)  || 0,
        status:      statusMap[row.payment_status] || 'Pending',
        date:        d,
        dueDate:     due,
        lineItems:   lineItems,
      };
    });

    purchases.length = 0;
    mapped.forEach(p => purchases.push(p));
    renderPurchases();

    /* ── Update mini-stats on purchases page ── */
    const totalVal  = purchases.reduce((s, p) => s + p.total, 0);
    const pendingCt = purchases.filter(p => p.status === 'Pending' || p.status === 'In Transit').length;
    const overdueCt = purchases.filter(p => p.status === 'Overdue').length;
    const ms = document.querySelectorAll('#page-purchases .mini-stat-val');
    if (ms[0]) ms[0].textContent = purchases.length;
    if (ms[1]) ms[1].textContent = '৳' + totalVal.toLocaleString('en-IN', { minimumFractionDigits: 0 });
    if (ms[2]) ms[2].textContent = pendingCt;
    if (ms[3]) ms[3].textContent = overdueCt;

  } catch (err) {
    console.error('Load purchases error:', err);
    showBanner('error', `❌ Purchases failed to load: ${err.message}`);
  }
}


/* ═══════════════════════════════════════════════════════════
   SAVE NEW PURCHASE ORDER TO SUPABASE
   ═══════════════════════════════════════════════════════════ */
async function savePurchaseToDB(formData) {
  try {
    /* 1. Resolve supplier id from name */
    let supplierId = null;
    if (formData.supplierName) {
      const { data: supRows } = await db
        .from('suppliers')
        .select('id')
        .ilike('name', formData.supplierName.trim())
        .limit(1);
      if (supRows && supRows.length) supplierId = supRows[0].id;
    }

    /* 2. Resolve first line item — supplier_purchases stores item_id & quantity directly */
    const firstItem = formData.lineItems && formData.lineItems.length
      ? formData.lineItems.filter(li => li.qty > 0)[0]
      : null;

    /* 3. Insert purchase row (no separate line-items table needed) */
    const { data: poRows, error: poErr } = await db
      .from('supplier_purchases')
      .insert([{
        supplier_id:    supplierId,
        item_id:        firstItem?.itemId || null,
        quantity:       firstItem?.qty    || null,
        total_amount:   parseFloat(formData.total) || 0,
        payment_status: formData.paymentStatus || 'pending',
        purchase_date:  new Date().toISOString(),
      }])
      .select();
    if (poErr) throw poErr;

    await loadPurchases();
    return { success: true };
  } catch (err) {
    console.error('Save purchase error:', err);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════
   SALES & PURCHASE REPORT (Updated error checking)
   ═══════════════════════════════════════════════════════════ */

function loadSalesPurchaseReport() {
  try {
    const totalSale     = recentSales.reduce((s, r) => s + (r.total || 0), 0);
    const saleDue       = recentSales.filter(r => r.status === 'Pending').reduce((s, r) => s + (r.total || 0), 0);
    const totalPurchase = purchases.reduce((s, p) => s + (p.total || 0), 0);
    const purchaseDue   = purchases.filter(p => p.status === 'Pending' || p.status === 'In Transit').reduce((s, p) => s + (p.total || 0), 0);

    setText('totalPurchase',        totalPurchase);
    setText('purchaseIncTax',       totalPurchase);
    setText('purchaseReturnIncTax', 0);
    setText('purchaseDue',          purchaseDue);
    setText('totalSale',            totalSale);
    setText('saleIncTax',           totalSale);
    setText('saleReturnIncTax',     0);
    setText('saleDue',              saleDue);
    setText('saleMinusPurchase',    totalSale - totalPurchase, true);
    setText('totalDueAmount',       saleDue   - purchaseDue,   true);

    const tbody = document.getElementById('psrTbody');
    if (!tbody) return;

    const badge = st => {
      const map = {
        Completed: ['b-green','Paid'], paid: ['b-green','Paid'],
        Received:  ['b-green','Received'],
        Pending:   ['b-mango','Pending'], pending: ['b-mango','Pending'],
        'In Transit': ['b-mango','In Transit'],
        partial_paid: ['b-mango','Partial'], partial: ['b-mango','Partial'],
      };
      const [cls, label] = map[st] || ['b-grey', st || '—'];
      return `<span class="badge ${cls}">${label}</span>`;
    };

    const saleRows = recentSales.map(s => ({
      date: s.date || '—',
      ref:  `<span class="mono">${s.id}</span>`,
      type: `<span class="badge b-green" style="font-size:10px">Sale</span>`,
      party: s.customer || 'Walk-in',
      amount: s.total || 0,
      status: s.status,
    }));

    const purRows = purchases.map(p => ({
      date: p.date || '—',
      ref:  `<span class="mono">${p.id}</span>`,
      type: `<span class="badge b-blue" style="font-size:10px">Purchase</span>`,
      party: p.supplier || '—',
      amount: p.total || 0,
      status: p.status,
    }));

    const rows = [...saleRows, ...purRows].sort((a, b) => b.date.localeCompare(a.date));

    tbody.innerHTML = rows.length === 0
      ? '<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:24px">No transactions found.</td></tr>'
      : rows.map((r, i) => `
          <tr style="animation:fadeUp .3s ease ${i*30}ms both">
            <td style="color:var(--text-soft);font-size:12px">${r.date}</td>
            <td>${r.ref}</td>
            <td>${r.type}</td>
            <td style="font-weight:600">${r.party}</td>
            <td><span class="mono" style="font-weight:700">৳${r.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></td>
            <td>${badge(r.status)}</td>
          </tr>`).join('');
  } catch (err) {
    console.error('Report error:', err);
    const tbody = document.getElementById('psrTbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--red);padding:24px">Error: ${err.message}</td></tr>`;
  }
}

/* ── setText helper ── */
function setText(id, value, colorize = false) {
  const el = document.getElementById(id);
  if (!el) return;
  el.textContent = '৳ ' + value.toLocaleString('en-IN', { minimumFractionDigits: 2 });
  if (colorize) { el.classList.remove('positive','negative'); el.classList.add(value >= 0 ? 'positive' : 'negative'); }
}


/* ═══════════════════════════════════════════════════════════
   REAL-TIME SUBSCRIPTIONS  –  auto-refresh tables on change
   ═══════════════════════════════════════════════════════════ */
function setupRealtimeSubscriptions() {
  db.channel('realtime-all')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'items' },
      () => loadProducts())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' },
      () => { 
        loadSales(); 
        loadDashboardStats(); 
        loadSalesPurchaseReport("this_year");
      })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' },
      () => loadCustomers())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' },
      () => loadSuppliers())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_purchases' },
      () => { 
        loadPurchases();
        loadSalesPurchaseReport("this_year");
      })
    .subscribe();
}

/* ═══════════════════════════════════════════════════════════
   OVERRIDE submitProduct to save to Supabase
   ═══════════════════════════════════════════════════════════ */
function submitProduct(e) {
  e.preventDefault();
  const form = e.target;
  const inputs = form.querySelectorAll('input, select');
  const formData = {
    name:        inputs[0]?.value,
    sku:         inputs[1]?.value,
    category:    inputs[2]?.value,
    price:       inputs[3]?.value,
    cost:        inputs[4]?.value,
    stock:       inputs[5]?.value,
    minStock:    inputs[6]?.value,
  };
  saveProduct(formData).then(result => {
    if (result.success) {
      closeModal();
      showBanner('success', '✅ Product saved to Supabase!', 3000);
    } else {
      showBanner('error', `❌ Failed to save: ${result.error}`);
    }
  });
}

/* ═══════════════════════════════════════════════════════════
   BOOT  –  called after DOM is ready
   ═══════════════════════════════════════════════════════════ */
async function initSupabase() {
  const ok = await checkSupabaseConnection();
  if (!ok) return;

  // Load all data - run individually so one failure doesn't block others
  const loaders = [
    ['products',   loadProducts],
    ['customers',  loadCustomers],
    ['suppliers',  loadSuppliers],
    ['sales',      loadSales],
    ['purchases',  loadPurchases],
    ['dashboard',  loadDashboardStats],
  ];

  for (const [name, fn] of loaders) {
    try {
      await fn();
    } catch (err) {
      console.error(`Failed to load ${name}:`, err);
      showBanner('error', `⚠️ Failed to load ${name}: ${err.message}`);
    }
  }

  try {
    await loadSalesPurchaseReport('This Year');
  } catch (err) {
    console.error('Failed to load report:', err);
  }

  setupRealtimeSubscriptions();

  /* ── Wire up dateFilter dropdown ── */
  const dateFilterEl = document.getElementById('dateFilter');
  if (dateFilterEl) {
    dateFilterEl.addEventListener('change', () => loadSalesPurchaseReport(dateFilterEl.value));
  }
}