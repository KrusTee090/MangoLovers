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
      .select('total_amount')
      .gte('sale_date', `${today}T00:00:00`)
      .lte('sale_date', `${today}T23:59:59`);
    const todayRevenue = (todaySales || []).reduce((sum, s) => sum + parseFloat(s.total_amount), 0);

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
      category:        '—',
      contact:         row.phone || row.email || '—',
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
async function loadSales() {
  try {
    // Fetch sales + their line items + item names in one query
    const { data, error } = await db
      .from('sales')
      .select(`
        id, total_amount, payment_type, payment_status, sale_date, paid_amount,
        customers ( name ),
        sale_items (
          quantity, unit_price, subtotal,
          items ( id, name, UoM )
        )
      `)
      .order('sale_date', { ascending: false })
      .limit(200);
    if (error) throw error;

    // payment_status → display status
    const statusMap = { paid: 'Completed', pending: 'Pending', partial: 'Pending', partial_paid: 'Pending' };
    // payment_type capitalisation
    const payLabel = t => ({ bkash:'bKash', nagad:'Nagad', cash:'Cash', card:'Card' }[t] || t);

    const mapped = (data || []).map(row => {
      const lineItems = (row.sale_items || []).map(si => ({
        name:      si.items?.name || '—',
        uom:       si.items?.UoM  || '',
        qty:       si.quantity,
        unitPrice: parseFloat(si.unit_price),
        subtotal:  parseFloat(si.subtotal),
      }));

      // Build a short item summary for the table column
      const itemSummary = lineItems.length
        ? lineItems.map(li => li.name.length > 30 ? li.name.slice(0, 28) + '…' : li.name).join(', ')
        : '—';

      return {
        _dbId:       row.id,                                         // keep raw UUID for sub-queries
        id:          row.id.slice(0, 8).toUpperCase(),
        customer:    row.customers?.name || 'Walk-in',
        items:       lineItems.length || 1,
        itemSummary: itemSummary,
        total:       parseFloat(row.total_amount),
        payment:     payLabel(row.payment_type || 'cash'),
        status:      statusMap[row.payment_status] || 'Completed',
        date:        row.sale_date ? row.sale_date.replace('T', ' ').slice(0, 16) : '—',
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
        suppliers ( name ),
        supplier_purchase_items (
          quantity, unit_cost, subtotal,
          items ( id, name, UoM )
        )
      `)
      .order('purchase_date', { ascending: false })
      .limit(200);
    if (error) throw error;

    const statusMap = { paid: 'Received', pending: 'Pending', partial_paid: 'In Transit', partial: 'In Transit' };

    const mapped = (data || []).map(row => {
      const lineItems = (row.supplier_purchase_items || []).map(pi => ({
        name:      pi.items?.name || '—',
        uom:       pi.items?.UoM  || '',
        qty:       pi.quantity,
        unitPrice: parseFloat(pi.unit_cost),
        subtotal:  parseFloat(pi.subtotal),
      }));

      const itemSummary = lineItems.length
        ? lineItems.map(li => li.name.length > 30 ? li.name.slice(0, 28) + '…' : li.name).join(', ')
        : '—';

      const d = row.purchase_date ? row.purchase_date.split('T')[0] : '—';
      const due = row.purchase_date
        ? new Date(new Date(row.purchase_date).getTime() + 30*24*60*60*1000).toISOString().split('T')[0]
        : '—';

      return {
        _dbId:       row.id,
        id:          'PO-' + row.id.slice(0, 8).toUpperCase(),
        supplier:    row.suppliers?.name || '—',
        items:       lineItems.length || 1,
        itemSummary: itemSummary,
        total:       parseFloat(row.total_amount),
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

    /* 2. Insert the purchase header */
    const { data: poRows, error: poErr } = await db
      .from('supplier_purchases')
      .insert([{
        supplier_id:    supplierId,
        total_amount:   parseFloat(formData.total) || 0,
        payment_status: formData.paymentStatus || 'pending',
        purchase_date:  new Date().toISOString(),
      }])
      .select();
    if (poErr) throw poErr;
    const newPO = poRows[0];

    /* 3. Insert line items if provided */
    if (formData.lineItems && formData.lineItems.length && newPO) {
      const lineRows = formData.lineItems
        .filter(li => li.name && li.qty > 0)
        .map(li => ({
          purchase_id: newPO.id,
          item_id:   li.itemId || null,
          quantity:  li.qty,
          unit_cost: li.unitCost,
          subtotal:  li.qty * li.unitCost,
        }));
      if (lineRows.length) {
        const { error: liErr } = await db.from('supplier_purchase_items').insert(lineRows);
        if (liErr) console.warn('Line items insert error:', liErr.message);
      }
    }

    await loadPurchases();
    return { success: true };
  } catch (err) {
    console.error('Save purchase error:', err);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════
   SALES & PURCHASE REPORT
   ═══════════════════════════════════════════════════════════ */

async function loadSalesPurchaseReport(range) {
  // Determine range from the dateFilter dropdown if not passed
  if (!range) {
    const sel = document.getElementById('dateFilter');
    range = sel ? sel.value : 'This Year';
  }
  try {
    let salesQuery = db.from('sales')
      .select('id, total_amount, payment_status, sale_date, customers(name)')
      .order('sale_date', { ascending: false });
    let purchaseQuery = db.from('supplier_purchases')
      .select('id, total_amount, payment_status, purchase_date, suppliers(name)')
      .order('purchase_date', { ascending: false });

    /* ───────────── DATE FILTERING ───────────── */
    const now = new Date();
    const pad = n => String(n).padStart(2,'0');
    const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;

    let startDate = null, endDate = null;

    if (range === 'Today') {
      startDate = endDate = ymd(now);
    } else if (range === 'Yesterday') {
      const y = new Date(now); y.setDate(y.getDate()-1);
      startDate = endDate = ymd(y);
    } else if (range === 'Last 7 Days') {
      const s = new Date(now); s.setDate(s.getDate()-6);
      startDate = ymd(s); endDate = ymd(now);
    } else if (range === 'Last 30 Days') {
      const s = new Date(now); s.setDate(s.getDate()-29);
      startDate = ymd(s); endDate = ymd(now);
    } else if (range === 'This Month') {
      startDate = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;
      endDate = ymd(now);
    } else if (range === 'Last Month') {
      const first = new Date(now.getFullYear(), now.getMonth()-1, 1);
      const last  = new Date(now.getFullYear(), now.getMonth(), 0);
      startDate = ymd(first); endDate = ymd(last);
    } else if (range === 'This Year' || range === 'this_year') {
      startDate = `${now.getFullYear()}-01-01`;
      endDate = ymd(now);
    } else if (range === 'Last Year') {
      startDate = `${now.getFullYear()-1}-01-01`;
      endDate   = `${now.getFullYear()-1}-12-31`;
    }
    // 'Custom Range' — no server filter, show all (could be enhanced later)

    if (startDate) {
      salesQuery    = salesQuery.gte('sale_date', `${startDate}T00:00:00`);
      purchaseQuery = purchaseQuery.gte('purchase_date', `${startDate}T00:00:00`);
    }
    if (endDate) {
      salesQuery    = salesQuery.lte('sale_date', `${endDate}T23:59:59`);
      purchaseQuery = purchaseQuery.lte('purchase_date', `${endDate}T23:59:59`);
    }

    const [{ data: sales }, { data: purches }] = await Promise.all([salesQuery, purchaseQuery]);

    /* ───────────── CALCULATE SALES ───────────── */
    let totalSale = 0, saleDue = 0;
    (sales || []).forEach(s => {
      const amount = parseFloat(s.total_amount) || 0;
      totalSale += amount;
      if (s.payment_status !== 'paid') saleDue += amount;
    });

    /* ───────────── CALCULATE PURCHASES ───────────── */
    let totalPurchase = 0, purchaseDue = 0;
    (purches || []).forEach(p => {
      const amount = parseFloat(p.total_amount) || 0;
      totalPurchase += amount;
      if (p.payment_status !== 'paid') purchaseDue += amount;
    });

    /* ───────────── UPDATE SUMMARY CARDS ───────────── */
    setText('totalPurchase', totalPurchase);
    setText('purchaseIncTax', totalPurchase);        // same (no separate tax field)
    setText('purchaseReturnIncTax', 0);
    setText('purchaseDue', purchaseDue);
    setText('totalSale', totalSale);
    setText('saleIncTax', totalSale);
    setText('saleReturnIncTax', 0);
    setText('saleDue', saleDue);
    setText('saleMinusPurchase', totalSale - totalPurchase, true);
    setText('totalDueAmount', saleDue - purchaseDue, true);

    /* ───────────── POPULATE TRANSACTIONS TABLE ───────────── */
    const tbody = document.getElementById('psrTbody');
    if (tbody) {
      const statusBadgePSR = (st, type) => {
        const map = {
          paid:         ['b-green',  'Paid'],
          pending:      ['b-mango',  'Pending'],
          partial_paid: ['b-mango',  'Partial'],
          partial:      ['b-mango',  'Partial'],
        };
        const [cls, label] = map[st] || ['b-grey', st || '—'];
        return `<span class="badge ${cls}">${label}</span>`;
      };

      const saleRows = (sales || []).map(s => ({
        date:   s.sale_date ? s.sale_date.replace('T',' ').slice(0,16) : '—',
        ref:    `<span class="mono">${s.id.slice(0,8).toUpperCase()}</span>`,
        type:   `<span class="badge b-green" style="font-size:10px">Sale</span>`,
        party:  s.customers?.name || 'Walk-in',
        amount: parseFloat(s.total_amount) || 0,
        status: s.payment_status,
      }));

      const purRows = (purches || []).map(p => ({
        date:   p.purchase_date ? p.purchase_date.split('T')[0] : '—',
        ref:    `<span class="mono">PO-${p.id.slice(0,8).toUpperCase()}</span>`,
        type:   `<span class="badge b-blue" style="font-size:10px">Purchase</span>`,
        party:  p.suppliers?.name || '—',
        amount: parseFloat(p.total_amount) || 0,
        status: p.payment_status,
      }));

      const rows = [...saleRows, ...purRows].sort((a,b) => b.date.localeCompare(a.date));

      if (rows.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:var(--text-soft);padding:24px">No transactions found for this period.</td></tr>';
      } else {
        tbody.innerHTML = rows.map((r,i) => `
          <tr style="animation:fadeUp .3s ease ${i*30}ms both">
            <td style="color:var(--text-soft);font-size:12px">${r.date}</td>
            <td>${r.ref}</td>
            <td>${r.type}</td>
            <td>${r.party}</td>
            <td><span class="mono" style="font-weight:700">৳${r.amount.toLocaleString('en-IN',{minimumFractionDigits:2})}</span></td>
            <td>${statusBadgePSR(r.status)}</td>
          </tr>`).join('');
      }
    }

  } catch (err) {
    console.error('Report load error:', err);
    const tbody = document.getElementById('psrTbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="6" style="text-align:center;color:var(--red);padding:24px">Error loading data: ${err.message}</td></tr>`;
  }
}

/* Helper to update text + color */
function setText(id, value, colorize = false) {
  const el = document.getElementById(id);
  if (!el) return;

  el.textContent = "৳ " + value.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  if (colorize) {
    el.classList.remove('positive', 'negative');
    el.classList.add(value >= 0 ? 'positive' : 'negative');
  }
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