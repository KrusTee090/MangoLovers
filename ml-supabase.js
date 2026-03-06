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
    const now   = new Date();
    const today = now.toISOString().split('T')[0];
    const yest  = new Date(now); yest.setDate(yest.getDate() - 1);
    const yesterday = yest.toISOString().split('T')[0];

    // Today's revenue (exclude returned)
    const { data: todaySales } = await db
      .from('sales')
      .select('id, sale_items!sale_items_sale_id_fkey(subtotal)')
      .neq('payment_status', 'returned')
      .gte('sale_date', `${today}T00:00:00`)
      .lte('sale_date', `${today}T23:59:59`);
    const todayRevenue = (todaySales || []).reduce((sum, s) =>
      sum + (Array.isArray(s.sale_items) ? s.sale_items : []).reduce((a, si) => a + parseFloat(si.subtotal || 0), 0), 0);

    // Yesterday's revenue for % comparison (exclude returned)
    const { data: yesterdaySales } = await db
      .from('sales')
      .select('id, sale_items!sale_items_sale_id_fkey(subtotal)')
      .neq('payment_status', 'returned')
      .gte('sale_date', `${yesterday}T00:00:00`)
      .lte('sale_date', `${yesterday}T23:59:59`);
    const yesterdayRevenue = (yesterdaySales || []).reduce((sum, s) =>
      sum + (Array.isArray(s.sale_items) ? s.sale_items : []).reduce((a, si) => a + parseFloat(si.subtotal || 0), 0), 0);

    // Low stock
    const { count: lowStockCount } = await db
      .from('items').select('*', { count: 'exact', head: true }).lte('stock_quantity', 10);

    // Total products for subtitle
    const { count: totalProducts } = await db
      .from('items').select('*', { count: 'exact', head: true });

    // Update Today's Revenue card
    const revEl = document.getElementById('dash-today-revenue');
    if (revEl) revEl.textContent = `৳${todayRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;

    // Update % pill
    const pill   = document.getElementById('dash-rev-pill');
    const pctEl  = document.getElementById('dash-rev-pct');
    const arrowEl= document.getElementById('dash-rev-arrow');
    if (pctEl && pill) {
      if (yesterdayRevenue === 0) {
        pctEl.textContent = todayRevenue > 0 ? 'New' : '—';
        pill.className = 'cpill cup';
      } else {
        const pct = ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100;
        const up  = pct >= 0;
        pctEl.textContent = Math.abs(pct).toFixed(1) + '%';
        pill.className = up ? 'cpill cup' : 'cpill cdn';
        if (arrowEl) arrowEl.innerHTML = up
          ? '<polyline points="18 15 12 9 6 15"/>'
          : '<polyline points="6 9 12 15 18 9"/>';
      }
    }

    // Update Low Stock card
    const lsEl  = document.getElementById('dash-low-stock');
    const lsSubEl = document.getElementById('dash-low-sub');
    if (lsEl)  lsEl.textContent = (lowStockCount || 0);
    if (lsSubEl) lsSubEl.textContent = (lowStockCount || 0) === 0 ? 'All items well stocked' : 'items need restocking';

    pageCfg.products.sub = `${totalProducts || 0} total products`;

  } catch (err) {
    console.error('Dashboard stats error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════
   LOAD CHART DATA FROM DB
   ═══════════════════════════════════════════════════════════ */
async function loadChartData() {
  try {
    const now  = new Date();
    const year = now.getFullYear();

    // ── WEEKLY: last 7 days — use sales.total_amount directly ──
    const weekStart = new Date(now); weekStart.setDate(weekStart.getDate() - 6);
    const [{ data: weekSales }, { data: weekPurch }] = await Promise.all([
      db.from('sales')
        .select('sale_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('sale_date', weekStart.toISOString()),
      db.from('supplier_purchases')
        .select('purchase_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('purchase_date', weekStart.toISOString()),
    ]);

    const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
    const weekMap = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      weekMap[key] = { day: days[d.getDay()], sales: 0, purchases: 0 };
    }
    (weekSales || []).forEach(s => {
      const key = s.sale_date.split('T')[0];
      if (weekMap[key]) weekMap[key].sales += parseFloat(s.total_amount || 0);
    });
    (weekPurch || []).forEach(p => {
      const key = p.purchase_date.split('T')[0];
      if (weekMap[key]) weekMap[key].purchases += parseFloat(p.total_amount || 0);
    });
    const newWeeklyData = Object.values(weekMap).map(d => ({ ...d, profit: d.sales - d.purchases }));

    // ── MONTHLY: each month of current year ──
    const [{ data: yearSales }, { data: yearPurch }] = await Promise.all([
      db.from('sales')
        .select('sale_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('sale_date', `${year}-01-01T00:00:00`)
        .lte('sale_date', `${year}-12-31T23:59:59`),
      db.from('supplier_purchases')
        .select('purchase_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('purchase_date', `${year}-01-01T00:00:00`)
        .lte('purchase_date', `${year}-12-31T23:59:59`),
    ]);

    const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const monthMap = {};
    for (let m = 0; m < 12; m++) monthMap[m] = { month: monthNames[m], sales: 0, purchases: 0 };
    (yearSales || []).forEach(s => {
      const m = new Date(s.sale_date).getMonth();
      if (monthMap[m] !== undefined) monthMap[m].sales += parseFloat(s.total_amount || 0);
    });
    (yearPurch || []).forEach(p => {
      const m = new Date(p.purchase_date).getMonth();
      if (monthMap[m] !== undefined) monthMap[m].purchases += parseFloat(p.total_amount || 0);
    });
    const newMonthlyData = Object.values(monthMap).map(d => ({ ...d, profit: d.sales - d.purchases }));

    // ── YEARLY: last 5 years ──
    const [{ data: allSales }, { data: allPurch }] = await Promise.all([
      db.from('sales')
        .select('sale_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('sale_date', `${year-4}-01-01T00:00:00`),
      db.from('supplier_purchases')
        .select('purchase_date, total_amount')
        .neq('payment_status', 'returned')
        .gte('purchase_date', `${year-4}-01-01T00:00:00`),
    ]);

    const yearMap = {};
    for (let y = year-4; y <= year; y++) yearMap[y] = { year: String(y), sales: 0, purchases: 0 };
    (allSales || []).forEach(s => {
      const y = new Date(s.sale_date).getFullYear();
      if (yearMap[y]) yearMap[y].sales += parseFloat(s.total_amount || 0);
    });
    (allPurch || []).forEach(p => {
      const y = new Date(p.purchase_date).getFullYear();
      if (yearMap[y]) yearMap[y].purchases += parseFloat(p.total_amount || 0);
    });
    const newYearlyData = Object.values(yearMap).map(d => ({ ...d, profit: d.sales - d.purchases }));

    salesData.length = 0;  newMonthlyData.forEach(d => salesData.push(d));
    weeklyData.length = 0; newWeeklyData.forEach(d => weeklyData.push(d));
    yearlyData.length = 0; newYearlyData.forEach(d => yearlyData.push(d));

    renderRevenueChart();
  } catch (err) {
    console.error('Chart data error:', err);
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
        id, customer_id, payment_type, payment_status, sale_date, paid_amount,
        customers!customer_id(name),
        sale_items!sale_items_sale_id_fkey(
          id, quantity, unit_price, subtotal,
          items!item_id(id, name, uom)
        )
      `)
      .order('sale_date', { ascending: false })
      .limit(200);

    if (error) throw error;

    const statusMap = { paid: 'Completed', pending: 'Pending', partial: 'Pending', partial_paid: 'Pending', returned: 'Returned' };
    const payLabel = t => ({ bkash:'bKash', nagad:'Nagad', cash:'Cash', card:'Card' }[String(t).toLowerCase()] || t);

    const mapped = (data || []).map(row => {
      // Resolve customer name — join result OR fallback to in-memory customers array
      const cust = Array.isArray(row.customers) ? row.customers[0] : row.customers;
      let customerName = cust?.name || null;
      if (!customerName && row.customer_id) {
        // Fallback: look up in-memory customers array (handles race conditions & join gaps)
        const found = customers.find(c => c.id === row.customer_id);
        customerName = found?.name || null;
      }
      customerName = customerName || 'Walk-in';

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
    const totalRevenue = recentSales.filter(r => r.status !== 'Returned').reduce((s, r) => s + r.total, 0);
    const pending = recentSales.filter(r => r.status === 'Pending').length;
    const miniStats = document.querySelectorAll('#page-sales .mini-stat-val');
    if (miniStats[0]) miniStats[0].textContent = `৳${totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 })}`;
    if (miniStats[1]) miniStats[1].textContent = recentSales.length;
    if (miniStats[2]) miniStats[2].textContent = pending;

    updateDashboardFinCards();

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

    const statusMap = { paid: 'Received', pending: 'Pending', partial_paid: 'In Transit', partial: 'In Transit', returned: 'Returned' };

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
    const totalVal  = purchases.filter(p => p.status !== 'Returned').reduce((s, p) => s + p.total, 0);
    const pendingCt = purchases.filter(p => p.status === 'Pending' || p.status === 'In Transit').length;
    const overdueCt = purchases.filter(p => p.status === 'Overdue').length;
    const ms = document.querySelectorAll('#page-purchases .mini-stat-val');
    if (ms[0]) ms[0].textContent = purchases.length;
    if (ms[1]) ms[1].textContent = '৳' + totalVal.toLocaleString('en-IN', { minimumFractionDigits: 0 });
    if (ms[2]) ms[2].textContent = pendingCt;
    if (ms[3]) ms[3].textContent = overdueCt;

    updateDashboardFinCards();

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
        paid_amount:    parseFloat(formData.total) || 0,
        total_amount:   parseFloat(formData.total) || 0,
        payment_status: formData.paymentStatus || 'pending',
        purchase_date:  new Date().toISOString(),
      }])
      .select();
    if (poErr) throw poErr;

    // Increment stock for every line item in the purchase
    for (const li of (formData.lineItems || [])) {
      if (!li.itemId || li.qty <= 0) continue;
      const product = products.find(p => p.id === li.itemId);
      const currentStock = product?.stock ?? 0;
      const newStock = currentStock + li.qty;
      await db.from('items').update({ stock_quantity: newStock }).eq('id', li.itemId);
    }

    await loadPurchases();
    await loadProducts();
    return { success: true };
  } catch (err) {
    console.error('Save purchase error:', err);
    return { success: false, error: err.message };
  }
}

/* ═══════════════════════════════════════════════════════════
   DASHBOARD FIN CARDS  –  reads from already-loaded arrays
   ═══════════════════════════════════════════════════════════ */
function updateDashboardFinCards() {
  const fmt = v => '৳' + v.toLocaleString('en-IN', { minimumFractionDigits: 2 });

  // Total Sales — all non-returned sales
  const totalSales = recentSales
    .filter(s => s.status !== 'Returned')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // Total Purchase — all non-returned purchases
  const totalPurchase = purchases
    .filter(p => p.status !== 'Returned')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  // Invoice Due — sales with Pending status (customer hasn't paid yet)
  const invoiceDue = recentSales
    .filter(s => s.status === 'Pending')
    .reduce((sum, s) => sum + (s.total || 0), 0);

  // Purchase Due — purchases still Pending or In Transit
  const purchaseDue = purchases
    .filter(p => p.status === 'Pending' || p.status === 'In Transit')
    .reduce((sum, p) => sum + (p.total || 0), 0);

  // Expense — sum from expenses table
  const expense = (typeof expensesData !== 'undefined' ? expensesData : []).reduce((s,e) => s + parseFloat(e.amount||0), 0);

  // Net = Total Sales − Expense (invoice due is receivable, not a deduction)
  const net = totalSales - expense;

  // Update DOM
  const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = fmt(val); };
  set('fin-total-sales',    totalSales);
  set('fin-total-purchase', totalPurchase);
  set('fin-invoice-due',    invoiceDue);
  set('fin-purchase-due',   purchaseDue);
  set('fin-expense',        expense);

  // Net card — special handling for colour + icon
  const netValEl   = document.getElementById('fin-net-val');
  const netIconBox = document.getElementById('fin-net-icon-box');
  const netIcon    = document.getElementById('fin-net-icon');
  const netAccent  = document.getElementById('fin-net-accent');
  if (netValEl) {
    const positive = net >= 0;
    const color    = positive ? 'var(--mint)' : 'var(--red)';
    const bg       = positive ? 'rgba(60,175,130,0.12)' : 'rgba(229,83,83,0.12)';
    netValEl.textContent    = (net < 0 ? '-' : '') + '৳' + Math.abs(net).toLocaleString('en-IN', { minimumFractionDigits: 2 });
    netValEl.style.color    = color;
    if (netIconBox) netIconBox.style.background = bg;
    if (netAccent)  netAccent.style.background  = `linear-gradient(90deg,transparent,${color},transparent)`;
    if (netIcon) {
      netIcon.setAttribute('stroke', color);
      netIcon.innerHTML = positive
        ? '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>'
        : '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>';
    }
  }

  // Also refresh the net card in ml-inventory.js if it exists
  if (typeof renderFinancialSummary === 'function') renderFinancialSummary();
}

/* ═══════════════════════════════════════════════════════════
   SALES & PURCHASE REPORT (Updated error checking)
   ═══════════════════════════════════════════════════════════ */

let _psrFrom = null, _psrTo = null;

function psrQuickFilter(range) {
  const now = new Date();
  const pad = n => String(n).padStart(2, '0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  let from, to;
  if (range === 'all')        { from = null; to = null; }
  else if (range === 'today') { from = to = ymd(now); }
  else if (range === 'week')  { const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7)); from = ymd(mon); to = ymd(now); }
  else if (range === 'month') { from = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`; to = ymd(now); }
  else if (range === 'year')  { from = `${now.getFullYear()}-01-01`; to = ymd(now); }
  ['all','today','week','month','year'].forEach(k => {
    const el = document.getElementById(`psr-pill-${k}`);
    if (el) el.classList.toggle('active', k === range);
  });
  const fromEl = document.getElementById('psr-from');
  const toEl   = document.getElementById('psr-to');
  if (fromEl) fromEl.value = from || '';
  if (toEl)   toEl.value   = to   || '';
  _psrFrom = from; _psrTo = to;
  loadSalesPurchaseReport();
}

function psrApplyFilter() {
  _psrFrom = document.getElementById('psr-from')?.value || null;
  _psrTo   = document.getElementById('psr-to')?.value   || null;
  ['all','today','week','month','year'].forEach(k => {
    const el = document.getElementById(`psr-pill-${k}`);
    if (el) el.classList.remove('active');
  });
  loadSalesPurchaseReport();
}

function printPurchaseSaleReport() {
  const from  = _psrFrom || '';
  const to    = _psrTo   || '';
  const range = (from && to) ? `${from} to ${to}` : 'All Time';
  const getVal = id => document.getElementById(id)?.textContent || '৳ 0.00';
  const row = (label, id, bold=false) =>
    `<tr${bold ? ' style="font-weight:700"' : ''}><td>${label}</td><td style="text-align:right;font-family:monospace">${getVal(id)}</td></tr>`;
  const tbodyEl = document.getElementById('psrTbody');
  const tableRows = tbodyEl ? tbodyEl.innerHTML : '';
  const win = window.open('', '_blank', 'width=860,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
  <title>Purchase & Sale Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',Arial,sans-serif;color:#1a2e22;background:#fff;padding:40px;font-size:13px}
    h1{font-size:22px;font-weight:800;margin-bottom:4px}
    .sub{color:#6b8a74;font-size:12px;margin-bottom:28px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
    .box{border:1px solid #e0ede7;border-radius:10px;overflow:hidden}
    .box-title{background:#f7faf8;padding:10px 16px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#4a6659;border-bottom:1px solid #e0ede7}
    table{width:100%;border-collapse:collapse}
    td{padding:9px 16px;border-bottom:1px solid #f0f6f2}
    tr:last-child td{border-bottom:none}
    .summary{border:2px solid #3caf82;border-radius:12px;padding:20px 24px;margin-bottom:24px}
    .sum-row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e0ede7}
    .sum-row:last-child{border-bottom:none}
    .sum-label{font-size:12px;color:#4a6659}
    .sum-val{font-size:15px;font-weight:800;font-family:monospace}
    .txn-table{width:100%;border-collapse:collapse;font-size:12px}
    .txn-table th{background:#f7faf8;padding:8px 12px;text-align:left;font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:.05em;border-bottom:1px solid #e0ede7}
    .txn-table td{padding:8px 12px;border-bottom:1px solid #f0f6f2}
    .footer{text-align:center;color:#a8c5b8;font-size:11px;border-top:1px solid #e0ede7;padding-top:14px;margin-top:20px}
    @media print{body{padding:20px}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div style="font-size:13px;font-weight:700;margin-bottom:2px">MangoLovers</div>
      <h1>Purchase &amp; Sale Report</h1>
      <div class="sub">Period: ${range} &nbsp;·&nbsp; Generated: ${new Date().toLocaleString()}</div>
    </div>
  </div>
  <div class="grid">
    <div class="box">
      <div class="box-title">Purchases</div>
      <table>
        ${row('Total Purchase', 'totalPurchase', true)}
        ${row('Purchase Including Tax', 'purchaseIncTax')}
        ${row('Total Purchase Return Inc. Tax', 'purchaseReturnIncTax')}
        ${row('Purchase Due', 'purchaseDue')}
      </table>
    </div>
    <div class="box">
      <div class="box-title">Sales</div>
      <table>
        ${row('Total Sale', 'totalSale', true)}
        ${row('Sale Including Tax', 'saleIncTax')}
        ${row('Total Sell Return Inc. Tax', 'saleReturnIncTax')}
        ${row('Sale Due', 'saleDue')}
      </table>
    </div>
  </div>
  <div class="summary">
    <div class="sum-row"><span class="sum-label">Sale − Purchase</span><span class="sum-val">${getVal('saleMinusPurchase')}</span></div>
    <div class="sum-row"><span class="sum-label">Due Amount</span><span class="sum-val">${getVal('totalDueAmount')}</span></div>
  </div>
  <div class="box" style="margin-bottom:20px">
    <div class="box-title">Transactions</div>
    <table class="txn-table">
      <thead><tr><th>Date</th><th>Reference</th><th>Type</th><th>Party</th><th>Amount</th><th>Status</th></tr></thead>
      <tbody>${tableRows}</tbody>
    </table>
  </div>
  <div class="footer">MangoLovers Inventory System · Printed ${new Date().toLocaleString()}</div>
  <script>window.onload=()=>window.print()<\/script>
  </body></html>`);
  win.document.close();
}

function loadSalesPurchaseReport() {
  try {
    const from = _psrFrom, to = _psrTo;
    const inRange = date => {
      if (!from && !to) return true;
      const d = (date || '').split('T')[0];
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      return true;
    };

    const subEl = document.getElementById('psr-subtitle');
    if (subEl) subEl.textContent = (from && to) ? `${from} to ${to}` : 'All transactions';

    const filteredSales = recentSales.filter(r => inRange(r.date));
    const filteredPurch = purchases.filter(p => inRange(p.date));

    const totalSale     = filteredSales.filter(r => r.status !== 'Returned').reduce((s, r) => s + (r.total || 0), 0);
    const saleDue       = filteredSales.filter(r => r.status === 'Pending').reduce((s, r) => s + (r.total || 0), 0);
    const totalPurchase = filteredPurch.filter(p => p.status !== 'Returned').reduce((s, p) => s + (p.total || 0), 0);
    const purchaseDue   = filteredPurch.filter(p => p.status === 'Pending' || p.status === 'In Transit').reduce((s, p) => s + (p.total || 0), 0);

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

    const saleRows = filteredSales.map(s => ({
      date: s.date || '—',
      ref:  `<span class="mono">${s.id}</span>`,
      type: `<span class="badge b-green" style="font-size:10px">Sale</span>`,
      party: s.customer || 'Walk-in',
      amount: s.total || 0,
      status: s.status,
    }));

    const purRows = filteredPurch.map(p => ({
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
   RETURNS  –  Sales Returns & Purchase Returns
   ═══════════════════════════════════════════════════════════ */
/* ═══════════════════════════════════════════════════════════
   RETURNS  –  reads from existing sales / supplier_purchases
               tables where payment_status = 'returned'
   ═══════════════════════════════════════════════════════════ */
async function loadSalesReturns() {
  try {
    const { data, error } = await db
      .from('sales')
      .select(`
        id, customer_id, payment_type, payment_status, sale_date, paid_amount,
        customers!customer_id(name),
        sale_items!sale_items_sale_id_fkey(
          quantity, unit_price, subtotal,
          items!item_id(id, name, uom)
        )
      `)
      .eq('payment_status', 'returned')
      .order('sale_date', { ascending: false });
    if (error) throw error;

    console.log('[Returns] Sales returned rows:', (data||[]).length);

    salesReturns.length = 0;
    (data || []).forEach(row => {
      const cust   = Array.isArray(row.customers) ? row.customers[0] : row.customers;
      let custName = cust?.name || null;
      if (!custName && row.customer_id) {
        const found = customers.find(c => c.id === row.customer_id);
        custName = found?.name || null;
      }
      custName = custName || 'Walk-in';
      const sItems = Array.isArray(row.sale_items) ? row.sale_items : (row.sale_items ? [row.sale_items] : []);
      const productNames = sItems.map(si => {
        const it = Array.isArray(si.items) ? si.items[0] : si.items;
        return it?.name || 'Unknown Item';
      }).join(', ') || '—';
      const totalQty    = sItems.reduce((s, si) => s + (si.quantity || 0), 0);
      const refundAmt   = sItems.reduce((s, si) => s + parseFloat(si.subtotal || 0), 0);
      const date        = row.sale_date ? row.sale_date.split('T')[0] : '—';

      salesReturns.push({
        _dbId:     row.id,
        id:        'SR-' + String(row.id).slice(0, 8).toUpperCase(),
        invoiceId: String(row.id).slice(0, 8).toUpperCase(),
        customer:  custName,
        product:   productNames,
        qty:       totalQty,
        refundAmt: refundAmt,
        reason:    '—',
        status:    'Returned',
        date:      date,
      });
    });

    renderSalesReturns();
  } catch (err) {
    console.error('Load sales returns error:', err);
    showBanner('error', `⚠️ Could not load sales returns: ${err.message}`);
  }
}

async function loadPurchaseReturns() {
  try {
    const { data, error } = await db
      .from('supplier_purchases')
      .select(`
        id, total_amount, purchase_date, payment_status, paid_amount,
        suppliers(name),
        items!item_id(id, name, uom),
        quantity
      `)
      .eq('payment_status', 'returned')
      .order('purchase_date', { ascending: false });
    if (error) throw error;

    console.log('[Returns] Purchase returned rows:', (data||[]).length);

    purchaseReturns.length = 0;
    (data || []).forEach(row => {
      const supp    = Array.isArray(row.suppliers) ? row.suppliers[0] : row.suppliers;
      const itemObj = Array.isArray(row.items) ? row.items[0] : row.items;
      const date    = row.purchase_date ? row.purchase_date.split('T')[0] : '—';

      purchaseReturns.push({
        _dbId:     row.id,
        id:        'PR-' + String(row.id).slice(0, 8).toUpperCase(),
        poId:      'PO-' + String(row.id).slice(0, 8).toUpperCase(),
        supplier:  supp?.name || '—',
        product:   itemObj?.name || '—',
        qty:       row.quantity || 0,
        creditAmt: parseFloat(row.total_amount) || 0,
        reason:    '—',
        status:    'Returned',
        date:      date,
      });
    });

    renderPurchaseReturns();
  } catch (err) {
    console.error('Load purchase returns error:', err);
    showBanner('error', `⚠️ Could not load purchase returns: ${err.message}`);
  }
}

/* Mark a sale as returned by updating its payment_status */
async function markSaleAsReturned(saleId) {
  try {
    const { error } = await db
      .from('sales')
      .update({ payment_status: 'returned' })
      .eq('id', saleId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Mark sale returned error:', err);
    return { success: false, error: err.message };
  }
}

/* Mark a purchase as returned by updating its payment_status */
async function markPurchaseAsReturned(purchaseId) {
  try {
    const { error } = await db
      .from('supplier_purchases')
      .update({ payment_status: 'returned' })
      .eq('id', purchaseId);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('Mark purchase returned error:', err);
    return { success: false, error: err.message };
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
        loadSalesReturns();
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
        loadPurchaseReturns();
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
async function loadTrendingProducts() {
  try {
    const { data, error } = await db
      .from('sale_items')
      .select('quantity, items!item_id(id, name)');
    if (error) throw error;

    const map = {};
    (data || []).forEach(row => {
      const item = Array.isArray(row.items) ? row.items[0] : row.items;
      if (!item?.name) return;
      if (!map[item.name]) map[item.name] = { name: item.name, qty: 0 };
      map[item.name].qty += parseFloat(row.quantity) || 0;
    });

    const trending = Object.values(map).sort((a, b) => b.qty - a.qty).slice(0, 5);
    const el = document.getElementById('trendingProdsReport');
    if (!el) return;
    if (!trending.length) {
      el.innerHTML = '<div style="color:var(--text-faint);font-size:12px;padding:8px">No sales data yet</div>';
      return;
    }
    const mxQ = Math.max(trending[0].qty, 1);
    const medals = ['\u{1F947}','\u{1F948}','\u{1F949}','4th','5th'];
    el.innerHTML = trending.map((p, i) => `
      <div class="top-row">
        <div class="top-icon-box" style="font-size:14px;display:flex;align-items:center;justify-content:center">${medals[i]}</div>
        <div style="flex:1;min-width:0">
          <div style="font-size:12px;font-weight:600;margin-bottom:4px">${p.name}</div>
          <div class="top-bar"><div class="top-fill" style="width:${(p.qty/mxQ)*100}%"></div></div>
        </div>
        <div style="text-align:right;min-width:55px">
          <div style="font-size:11.5px;font-weight:700;color:var(--mint)">${p.qty} sold</div>
        </div>
      </div>`).join('');
  } catch (err) {
    console.error('Trending products error:', err);
  }
}

/* ═══════════════════════════════════════════════════════════
   EXPENSES
   ═══════════════════════════════════════════════════════════ */
async function loadExpenses() {
  try {
    const { data, error } = await db
      .from('expenses')
      .select('id, expense_date, amount, description, created_at')
      .order('expense_date', { ascending: false })
      .limit(500);
    if (error) throw error;
    expensesData = data || [];

    // Update fin-expense in dashboard if loaded
    const totalExp = expensesData.reduce((s, e) => s + parseFloat(e.amount || 0), 0);
    const expEl = document.getElementById('fin-expense');
    if (expEl) expEl.textContent = '৳' + totalExp.toLocaleString('en-IN', { minimumFractionDigits: 2 });

    renderExpenses();
  } catch (err) {
    console.error('loadExpenses error:', err);
    expensesData = [];
    renderExpenses();
  }
}

async function saveExpenseToDB({ expense_date, amount, description }) {
  try {
    const { error } = await db
      .from('expenses')
      .insert([{ expense_date, amount, description }]);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('saveExpenseToDB error:', err);
    return { success: false, error: err.message };
  }
}

async function deleteExpenseFromDB(id) {
  try {
    const { error } = await db.from('expenses').delete().eq('id', id);
    if (error) throw error;
    return { success: true };
  } catch (err) {
    console.error('deleteExpenseFromDB error:', err);
    return { success: false, error: err.message };
  }
}

async function initSupabase() {
  const ok = await checkSupabaseConnection();
  if (!ok) return;

  // Load all data - run individually so one failure doesn't block others
  const loaders = [
    ['products',   loadProducts],
    ['customers',  loadCustomers],
    ['suppliers',  loadSuppliers],
    ['sales',          loadSales],
    ['purchases',      loadPurchases],
    ['expenses',       loadExpenses],
    ['sales-returns',  loadSalesReturns],
    ['purch-returns',  loadPurchaseReturns],
    ['dashboard',      loadDashboardStats],
  ];

  // Load chart data from DB
  try { await loadChartData(); } catch(e) { console.error('Chart load error:', e); }
  // Load trending products
  try { await loadTrendingProducts(); } catch(e) { console.error('Trending error:', e); }

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
/* ═══════════════════════════════════════════════════════════
   PROFIT / LOSS REPORT
   ═══════════════════════════════════════════════════════════ */

// Active date filter state
let _plFrom = null;
let _plTo   = null;

function plQuickFilter(range) {
  const now   = new Date();
  const pad   = n => String(n).padStart(2,'0');
  const ymd   = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  let from, to;

  if (range === 'all') {
    from = null; to = null;
  } else if (range === 'today') {
    from = to = ymd(now);
  } else if (range === 'week') {
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7));
    from = ymd(mon); to = ymd(now);
  } else if (range === 'month') {
    from = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`;
    to   = ymd(now);
  } else if (range === 'year') {
    from = `${now.getFullYear()}-01-01`;
    to   = ymd(now);
  }

  // Update pill UI
  ['all','today','week','month','year'].forEach(k => {
    const el = document.getElementById(`pl-pill-${k}`);
    if (el) el.classList.toggle('active', k === range);
  });

  // Sync date inputs
  const fromEl = document.getElementById('pl-from');
  const toEl   = document.getElementById('pl-to');
  if (fromEl) fromEl.value = from || '';
  if (toEl)   toEl.value   = to   || '';

  _plFrom = from; _plTo = to;
  loadProfitLossReport();
}

async function loadProfitLossReport() {
  // Read date inputs if not set by quick filter
  const fromEl = document.getElementById('pl-from');
  const toEl   = document.getElementById('pl-to');
  const from = fromEl?.value || _plFrom || null;
  const to   = toEl?.value   || _plTo   || null;

  // Update subtitle
  const sub = document.getElementById('pl-subtitle');
  if (sub) sub.textContent = (from && to) ? `${from}  →  ${to}` : 'All transactions';

  const plSet = (id, val) => {
    const el = document.getElementById(id);
    if (!el) return;
    const isNeg = val < 0;
    el.textContent = (isNeg ? '−' : '') + '৳' + Math.abs(val).toLocaleString('en-IN', {minimumFractionDigits:2});
    el.style.color = id === 'pl-gross' || id === 'pl-net'
      ? (isNeg ? 'var(--red)' : 'var(--mint)')
      : '';
  };

  try {
    /* ── 1. Fetch current stock from items (used for both opening & closing) ── */
    const { data: items } = await db.from('items').select('cost_price, selling_price, stock_quantity');
    const stockCost = (items||[]).reduce((s,i) => s + parseFloat(i.cost_price||0) * (i.stock_quantity||0), 0);
    const stockSale = (items||[]).reduce((s,i) => s + parseFloat(i.selling_price||0) * (i.stock_quantity||0), 0);

    /* ── 2. Total purchases in range (non-returned) ── */
    let purQuery = db.from('supplier_purchases')
      .select('total_amount')
      .neq('payment_status','returned');
    if (from) purQuery = purQuery.gte('purchase_date', `${from}T00:00:00`);
    if (to)   purQuery = purQuery.lte('purchase_date', `${to}T23:59:59`);
    const { data: purRows } = await purQuery;
    const totalPurchase = (purRows||[]).reduce((s,r) => s + parseFloat(r.total_amount||0), 0);

    /* ── 3. Purchase returns in range ── */
    let purRetQuery = db.from('supplier_purchases')
      .select('total_amount')
      .eq('payment_status','returned');
    if (from) purRetQuery = purRetQuery.gte('purchase_date', `${from}T00:00:00`);
    if (to)   purRetQuery = purRetQuery.lte('purchase_date', `${to}T23:59:59`);
    const { data: purRetRows } = await purRetQuery;
    const totalPurReturn = (purRetRows||[]).reduce((s,r) => s + parseFloat(r.total_amount||0), 0);

    /* ── 4. Total sales in range (non-returned), using sale_items subtotals ── */
    let saleQuery = db.from('sales')
      .select('sale_items!sale_items_sale_id_fkey(subtotal)')
      .neq('payment_status','returned');
    if (from) saleQuery = saleQuery.gte('sale_date', `${from}T00:00:00`);
    if (to)   saleQuery = saleQuery.lte('sale_date', `${to}T23:59:59`);
    const { data: saleRows } = await saleQuery;
    const totalSales = (saleRows||[]).reduce((sum,s) =>
      sum + (s.sale_items||[]).reduce((a,si) => a + parseFloat(si.subtotal||0), 0), 0);

    /* ── 5. Sale returns in range ── */
    let saleRetQuery = db.from('sales')
      .select('sale_items!sale_items_sale_id_fkey(subtotal)')
      .eq('payment_status','returned');
    if (from) saleRetQuery = saleRetQuery.gte('sale_date', `${from}T00:00:00`);
    if (to)   saleRetQuery = saleRetQuery.lte('sale_date', `${to}T23:59:59`);
    const { data: saleRetRows } = await saleRetQuery;
    const totalSellReturn = (saleRetRows||[]).reduce((sum,s) =>
      sum + (s.sale_items||[]).reduce((a,si) => a + parseFloat(si.subtotal||0), 0), 0);

    /* ── 6. Zero-value fields (no expense module yet) ── */
    const expense      = (typeof expensesData !== 'undefined' ? expensesData : []).filter(e => { if (!from && !to) return true; const d=(e.expense_date||''); return (!from||d>=from) && (!to||d<=to); }).reduce((s,e)=>s+parseFloat(e.amount||0),0);
    const stockAdj     = 0;
    const purShipping  = 0;
    const purAddl      = 0;
    const transferShip = 0;
    const sellDiscount = 0;
    const custReward   = 0;
    const sellShipping = 0;
    const sellAddl     = 0;
    const stockRecover = 0;
    const purDiscount  = 0;
    const sellRoundoff = 0;

    /* ── 7. COGS, Gross Profit, Net Profit ── */
    // Opening stock = current stock (no historical snapshot available)
    // Closing stock = same (current)
    // COGS = opening stock + purchases − closing stock
    const COGS        = stockCost + totalPurchase - stockCost; // simplifies to totalPurchase when opening=closing
    const grossProfit = totalSales - totalPurchase;
    const netIncome   = sellShipping + sellAddl + stockRecover + purDiscount + sellRoundoff;
    const netCost     = stockAdj + expense + purShipping + transferShip + purAddl + sellDiscount + custReward;
    const netProfit   = grossProfit + netIncome - netCost;

    /* ── 8. Populate DOM ── */
    // Left card — cost side
    plSet('pl-opening-cost',  stockCost);
    plSet('pl-opening-sale',  stockSale);
    plSet('pl-total-purchase',totalPurchase);
    plSet('pl-stock-adj',     stockAdj);
    plSet('pl-expense',       expense);
    plSet('pl-pur-shipping',  purShipping);
    plSet('pl-pur-addl',      purAddl);
    plSet('pl-transfer-ship', transferShip);
    plSet('pl-sell-discount', sellDiscount);
    plSet('pl-cust-reward',   custReward);
    plSet('pl-sell-return',   totalSellReturn);

    // Right card — revenue side
    plSet('pl-closing-cost',    stockCost);
    plSet('pl-closing-sale',    stockSale);
    plSet('pl-total-sales',     totalSales);
    plSet('pl-sell-shipping',   sellShipping);
    plSet('pl-sell-addl',       sellAddl);
    plSet('pl-stock-recovered', stockRecover);
    plSet('pl-pur-return',      totalPurReturn);
    plSet('pl-pur-discount',    purDiscount);
    plSet('pl-sell-roundoff',   sellRoundoff);

    // Summary
    plSet('pl-cogs',  COGS);
    plSet('pl-gross', grossProfit);
    plSet('pl-net',   netProfit);

  } catch (err) {
    console.error('P&L Report error:', err);
    if (typeof toast === 'function') toast('Failed to load P&L: ' + err.message, 'error');
  }
}

function printProfitLoss() {
  const fromEl = document.getElementById('pl-from');
  const toEl   = document.getElementById('pl-to');
  const from = fromEl?.value || '';
  const to   = toEl?.value   || '';
  const range = (from && to) ? `${from} to ${to}` : 'All Time';

  const getVal = id => document.getElementById(id)?.textContent || '৳0.00';
  const row = (label, id, bold=false) =>
    `<tr${bold?' style="font-weight:700"':''}><td>${label}</td><td style="text-align:right;font-family:monospace">${getVal(id)}</td></tr>`;

  const win = window.open('', '_blank', 'width=860,height=700');
  win.document.write(`<!DOCTYPE html><html><head>
  <title>Profit / Loss Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',Arial,sans-serif;color:#1a2e22;background:#fff;padding:40px;font-size:13px}
    h1{font-size:22px;font-weight:800;margin-bottom:4px}
    .sub{color:#6b8a74;font-size:12px;margin-bottom:28px}
    .brand{font-size:13px;font-weight:700;margin-bottom:2px}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:24px;margin-bottom:28px}
    .box{border:1px solid #e0ede7;border-radius:10px;overflow:hidden}
    .box-title{background:#f7faf8;padding:10px 16px;font-weight:700;font-size:12px;text-transform:uppercase;letter-spacing:.06em;color:#4a6659;border-bottom:1px solid #e0ede7}
    table{width:100%;border-collapse:collapse}
    td{padding:9px 16px;border-bottom:1px solid #f0f6f2}
    tr:last-child td{border-bottom:none}
    .summary{border:2px solid #3caf82;border-radius:12px;padding:24px 28px;margin-bottom:20px}
    .sum-row{display:flex;justify-content:space-between;align-items:baseline;padding:12px 0;border-bottom:1px solid #e0ede7}
    .sum-row:last-child{border-bottom:none}
    .sum-label{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.06em;color:#7fa393}
    .sum-val{font-size:24px;font-weight:800;font-family:monospace}
    .sum-val.cogs{color:#1a2e22;font-size:20px}
    .sum-val.gross{color:#3caf82}
    .sum-val.net{font-size:28px}
    .footer{text-align:center;color:#a8c5b8;font-size:11px;border-top:1px solid #e0ede7;padding-top:14px;margin-top:20px}
    @media print{body{padding:20px}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px">
    <div>
      <div class="brand">MangoLovers</div>
      <h1>Profit / Loss Report</h1>
      <div class="sub">Period: ${range} &nbsp;·&nbsp; Generated: ${new Date().toLocaleString()}</div>
    </div>
  </div>
  <div class="grid">
    <div class="box">
      <div class="box-title">Cost Side</div>
      <table>
        ${row('Opening Stock (By purchase price)','pl-opening-cost')}
        ${row('Opening Stock (By sale price)','pl-opening-sale')}
        ${row('Total Purchase (Exc. tax, Discount)','pl-total-purchase',true)}
        ${row('Total Stock Adjustment','pl-stock-adj')}
        ${row('Total Expense','pl-expense')}
        ${row('Total Purchase Shipping','pl-pur-shipping')}
        ${row('Purchase Additional Expenses','pl-pur-addl')}
        ${row('Total Transfer Shipping','pl-transfer-ship')}
        ${row('Total Sell Discount','pl-sell-discount')}
        ${row('Total Customer Reward','pl-cust-reward')}
        ${row('Total Sell Return','pl-sell-return')}
      </table>
    </div>
    <div class="box">
      <div class="box-title">Revenue Side</div>
      <table>
        ${row('Closing Stock (By purchase price)','pl-closing-cost')}
        ${row('Closing Stock (By sale price)','pl-closing-sale')}
        ${row('Total Sales (Exc. tax, Discount)','pl-total-sales',true)}
        ${row('Total Sell Shipping Charge','pl-sell-shipping')}
        ${row('Sell Additional Expenses','pl-sell-addl')}
        ${row('Total Stock Recovered','pl-stock-recovered')}
        ${row('Total Purchase Return','pl-pur-return')}
        ${row('Total Purchase Discount','pl-pur-discount')}
        ${row('Total Sell Round Off','pl-sell-roundoff')}
      </table>
    </div>
  </div>
  <div class="summary">
    <div class="sum-row">
      <div><div class="sum-label">COGS</div><div style="font-size:11px;color:#a8c5b8;margin-top:3px">Opening Stock + Purchases − Closing Stock</div></div>
      <div class="sum-val cogs">${getVal('pl-cogs')}</div>
    </div>
    <div class="sum-row">
      <div><div class="sum-label">Gross Profit</div><div style="font-size:11px;color:#a8c5b8;margin-top:3px">Total Sales − Total Purchases</div></div>
      <div class="sum-val gross">${getVal('pl-gross')}</div>
    </div>
    <div class="sum-row">
      <div><div class="sum-label">Net Profit</div><div style="font-size:11px;color:#a8c5b8;margin-top:3px">Gross Profit + Revenue additions − Cost deductions</div></div>
      <div class="sum-val net" style="color:${document.getElementById('pl-net')?.style.color||'#3caf82'}">${getVal('pl-net')}</div>
    </div>
  </div>
  <div class="footer">MangoLovers Inventory System · Profit / Loss Report · ${new Date().toLocaleDateString()}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}

/* ═══════════════════════════════════════════════════════════
   ANALYTICS PAGE  –  fully DB-connected
   ═══════════════════════════════════════════════════════════ */

let _anRange = 'week';
let _anExportData = {};

function _anDateRange(range) {
  const now  = new Date();
  const ymd  = d => d.toISOString().split('T')[0];
  let from, to = ymd(now);
  if (range === 'week') {
    const w = new Date(now); w.setDate(w.getDate() - 6);
    from = ymd(w);
  } else if (range === 'month') {
    from = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-01`;
  } else if (range === 'year') {
    from = `${now.getFullYear()}-01-01`;
  } else {
    from = null; to = null;
  }
  return { from, to };
}

async function loadAnalytics(range = 'week') {
  _anRange = range;

  // Update pills
  ['week','month','year','all'].forEach(k => {
    const el = document.getElementById(`an-pill-${k}`);
    if (el) el.classList.toggle('active', k === range);
  });

  const { from, to } = _anDateRange(range);
  const rangeLabel = { week:'This Week', month:'This Month', year:'This Year', all:'All Time' }[range];
  const sub = document.getElementById('an-subtitle');
  if (sub) sub.textContent = `Showing data for: ${rangeLabel}`;

  // Show loading spinner
  const loadingEl = document.getElementById('an-loading');
  if (loadingEl) loadingEl.style.display = 'flex';

  try {
    // Build date filters
    let salesFilter   = db.from('sales').select('id, payment_type, payment_status, sale_items!sale_items_sale_id_fkey(quantity, subtotal, item_id, items(name))').neq('payment_status','returned');
    let purchFilter   = db.from('supplier_purchases').select('id, total_amount, purchase_date, supplier_id, suppliers(name)').neq('payment_status','returned');
    let salesDateFilt = db.from('sales').select('id, sale_date, payment_type, payment_status, sale_items!sale_items_sale_id_fkey(quantity, subtotal, item_id, items(name))').neq('payment_status','returned');
    let custFilter    = db.from('sales').select('customer_id, payment_status').neq('payment_status','returned');

    if (from) {
      salesFilter    = salesFilter.gte('sale_date', `${from}T00:00:00`);
      purchFilter    = purchFilter.gte('purchase_date', `${from}T00:00:00`);
      salesDateFilt  = salesDateFilt.gte('sale_date', `${from}T00:00:00`);
      custFilter     = custFilter.gte('sale_date', `${from}T00:00:00`);
    }
    if (to) {
      salesFilter    = salesFilter.lte('sale_date', `${to}T23:59:59`);
      purchFilter    = purchFilter.lte('purchase_date', `${to}T23:59:59`);
      salesDateFilt  = salesDateFilt.lte('sale_date', `${to}T23:59:59`);
      custFilter     = custFilter.lte('sale_date', `${to}T23:59:59`);
    }

    const [
      { data: salesRows },
      { data: purchRows },
      { data: salesDateRows },
      { data: custRows },
    ] = await Promise.all([
      salesFilter,
      purchFilter,
      salesDateFilt,
      custFilter,
    ]);

    // ── KPI calculations ──
    let totalRevenue = 0, totalItems = 0;
    (salesRows || []).forEach(s => {
      (s.sale_items || []).forEach(si => {
        totalRevenue += parseFloat(si.subtotal || 0);
        totalItems   += parseInt(si.quantity  || 0);
      });
    });
    const totalPurchases = (purchRows || []).reduce((sum, p) => sum + parseFloat(p.total_amount || 0), 0);
    const netProfit      = totalRevenue - totalPurchases;
    const salesCount     = (salesRows || []).length;
    const aov            = salesCount > 0 ? totalRevenue / salesCount : 0;
    const margin         = totalRevenue > 0 ? (netProfit / totalRevenue) * 100 : 0;

    // Update KPI cards
    const set = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val; };
    set('an-kpi-revenue',     '৳' + totalRevenue.toLocaleString('en-IN', { minimumFractionDigits: 0 }));
    set('an-kpi-purchases',   '৳' + totalPurchases.toLocaleString('en-IN', { minimumFractionDigits: 0 }));
    set('an-kpi-profit',      '৳' + netProfit.toLocaleString('en-IN', { minimumFractionDigits: 0 }));
    set('an-kpi-aov',         '৳' + aov.toLocaleString('en-IN', { minimumFractionDigits: 0 }));
    set('an-kpi-sales-count', salesCount + ' sales');
    set('an-kpi-po-count',    (purchRows||[]).length + ' orders');
    set('an-kpi-items-sold',  totalItems + ' items sold');

    const profitEl = document.getElementById('an-kpi-profit');
    if (profitEl) profitEl.style.color = netProfit >= 0 ? 'var(--green)' : 'var(--red)';
    set('an-kpi-margin', margin.toFixed(1) + '% margin');
    const marginEl = document.getElementById('an-kpi-margin');
    if (marginEl) marginEl.style.color = margin >= 0 ? 'var(--text-faint)' : 'var(--red)';

    // ── Revenue vs Purchases Trend chart ──
    _anRenderTrendChart(salesDateRows || [], purchRows || [], range);

    // ── Top 5 Products ──
    const prodMap = {};
    (salesRows || []).forEach(s => {
      (s.sale_items || []).forEach(si => {
        const name = si.items?.name || si.item_id || 'Unknown';
        if (!prodMap[name]) prodMap[name] = { name, revenue: 0, qty: 0 };
        prodMap[name].revenue += parseFloat(si.subtotal || 0);
        prodMap[name].qty     += parseInt(si.quantity  || 0);
      });
    });
    const topProds = Object.values(prodMap).sort((a, b) => b.revenue - a.revenue).slice(0, 5);
    _anRenderTopProducts(topProds);

    // ── Payment Breakdown ──
    const payMap = {};
    (salesRows || []).forEach(s => {
      const key = s.payment_type || 'other';
      if (!payMap[key]) payMap[key] = { label: key, count: 0, revenue: 0 };
      payMap[key].count++;
      payMap[key].revenue += (s.sale_items || []).reduce((a, si) => a + parseFloat(si.subtotal || 0), 0);
    });
    _anRenderPaymentBreakdown(Object.values(payMap));

    // ── Top Suppliers ──
    const suppMap = {};
    (purchRows || []).forEach(p => {
      const name = p.suppliers?.name || p.supplier_id || 'Unknown';
      if (!suppMap[name]) suppMap[name] = { name, total: 0, count: 0 };
      suppMap[name].total += parseFloat(p.total_amount || 0);
      suppMap[name].count++;
    });
    const topSupps = Object.values(suppMap).sort((a, b) => b.total - a.total).slice(0, 5);
    _anRenderTopSuppliers(topSupps);

    // ── Sales by Weekday ──
    const dayMap = { 0:0, 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 };
    (salesDateRows || []).forEach(s => {
      const d = new Date(s.sale_date).getDay();
      dayMap[d] += (s.sale_items || []).reduce((a, si) => a + parseFloat(si.subtotal || 0), 0);
    });
    _anRenderWeekdayChart(dayMap);

    // ── Customer Insights ──
    const uniqueCusts     = new Set((custRows || []).map(r => r.customer_id).filter(Boolean));
    const walkInCount     = (custRows || []).filter(r => !r.customer_id).length;
    const repeatMap       = {};
    (custRows || []).forEach(r => { if (r.customer_id) { repeatMap[r.customer_id] = (repeatMap[r.customer_id]||0)+1; } });
    const repeatCusts     = Object.values(repeatMap).filter(v => v > 1).length;
    const repeatRate      = uniqueCusts.size > 0 ? ((repeatCusts / uniqueCusts.size) * 100).toFixed(0) : 0;
    _anRenderCustomerInsights({ uniqueCusts: uniqueCusts.size, walkIn: walkInCount, repeatRate, totalSales: salesCount });

    // Save export data
    _anExportData = { topProds, topSupps, totalRevenue, totalPurchases, netProfit, salesCount, margin };

  } catch (err) {
    console.error('Analytics load error:', err);
  } finally {
    if (loadingEl) loadingEl.style.display = 'none';
  }
}

function _anRenderTrendChart(salesRows, purchRows, range) {
  const el = document.getElementById('an-trend-chart');
  if (!el) return;

  // Build buckets based on range
  const buckets = {};
  const now = new Date();

  if (range === 'week') {
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now); d.setDate(d.getDate() - i);
      const key = d.toISOString().split('T')[0];
      const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
      buckets[key] = { label: days[d.getDay()], rev: 0, pur: 0 };
    }
    salesRows.forEach(s => {
      const key = s.sale_date?.split('T')[0];
      if (buckets[key]) buckets[key].rev += (s.sale_items||[]).reduce((a,si)=>a+parseFloat(si.subtotal||0),0);
    });
    purchRows.forEach(p => {
      const key = p.purchase_date?.split('T')[0];
      if (buckets[key]) buckets[key].pur += parseFloat(p.total_amount||0);
    });
  } else if (range === 'month') {
    const year = now.getFullYear(), month = now.getMonth();
    const days = new Date(year, month+1, 0).getDate();
    for (let d = 1; d <= days; d++) {
      const key = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      buckets[key] = { label: d % 5 === 0 || d === 1 ? String(d) : '', rev: 0, pur: 0 };
    }
    salesRows.forEach(s => {
      const key = s.sale_date?.split('T')[0];
      if (buckets[key]) buckets[key].rev += (s.sale_items||[]).reduce((a,si)=>a+parseFloat(si.subtotal||0),0);
    });
    purchRows.forEach(p => {
      const key = p.purchase_date?.split('T')[0];
      if (buckets[key]) buckets[key].pur += parseFloat(p.total_amount||0);
    });
  } else {
    const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
    const year = range === 'year' ? now.getFullYear() : null;
    months.forEach((m, i) => {
      const key = year ? `${year}-${String(i+1).padStart(2,'0')}` : m;
      buckets[key] = { label: m, rev: 0, pur: 0 };
    });
    salesRows.forEach(s => {
      if (!s.sale_date) return;
      const d = new Date(s.sale_date);
      const key = range === 'year'
        ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
        : months[d.getMonth()];
      if (buckets[key]) buckets[key].rev += (s.sale_items||[]).reduce((a,si)=>a+parseFloat(si.subtotal||0),0);
    });
    purchRows.forEach(p => {
      if (!p.purchase_date) return;
      const d = new Date(p.purchase_date);
      const key = range === 'year'
        ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`
        : months[d.getMonth()];
      if (buckets[key]) buckets[key].pur += parseFloat(p.total_amount||0);
    });
  }

  const vals = Object.values(buckets);
  const maxVal = Math.max(...vals.map(v => Math.max(v.rev, v.pur)), 1);

  el.innerHTML = vals.map(v => `
    <div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:2px;min-width:0">
      <div style="display:flex;align-items:flex-end;gap:2px;height:100px;width:100%">
        <div title="Revenue ৳${v.rev.toLocaleString('en-IN',{minimumFractionDigits:0})}"
          style="flex:1;background:var(--green);border-radius:3px 3px 0 0;min-height:2px;height:${Math.max(2,(v.rev/maxVal)*96)}px;opacity:.85;cursor:pointer;transition:opacity .15s"
          onmouseover="this.style.opacity=1" onmouseout="this.style.opacity='.85'"></div>
        <div title="Purchases ৳${v.pur.toLocaleString('en-IN',{minimumFractionDigits:0})}"
          style="flex:1;background:var(--red);border-radius:3px 3px 0 0;min-height:2px;height:${Math.max(2,(v.pur/maxVal)*96)}px;opacity:.55;cursor:pointer;transition:opacity .15s"
          onmouseover="this.style.opacity=.85" onmouseout="this.style.opacity='.55'"></div>
      </div>
      <div style="font-size:9.5px;color:var(--text-faint);white-space:nowrap;overflow:hidden;max-width:100%;text-overflow:ellipsis">${v.label}</div>
    </div>`).join('');
}

function _anRenderTopProducts(prods) {
  const el = document.getElementById('an-top-products');
  if (!el) return;
  if (!prods.length) { el.innerHTML = '<div style="color:var(--text-faint);font-size:12px;text-align:center;padding:16px">No sales data yet</div>'; return; }
  const maxRev = prods[0].revenue || 1;
  const medals = ['🥇','🥈','🥉','',''];
  el.innerHTML = prods.map((p, i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="font-size:15px;width:20px;text-align:center;flex-shrink:0">${medals[i] || '<span style="font-size:11px;color:var(--text-faint)">#'+(i+1)+'</span>'}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${p.name}</div>
        <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;background:var(--mint);border-radius:3px;width:${(p.revenue/maxRev)*100}%"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:70px">
        <div style="font-size:12px;font-weight:700;color:var(--mint)">৳${p.revenue.toLocaleString('en-IN',{minimumFractionDigits:0})}</div>
        <div style="font-size:10px;color:var(--text-faint)">${p.qty} sold</div>
      </div>
    </div>`).join('');
}

function _anRenderPaymentBreakdown(methods) {
  const el = document.getElementById('an-payment-breakdown');
  if (!el) return;
  if (!methods.length) { el.innerHTML = '<div style="color:var(--text-faint);font-size:12px;text-align:center;padding:16px">No sales data yet</div>'; return; }
  const total = methods.reduce((s, m) => s + m.revenue, 0) || 1;
  const colors = { cash:'var(--green)', bkash:'var(--purple)', nagad:'var(--mango-dk)', card:'var(--blue)', other:'var(--text-soft)' };
  const icons  = { cash:'💵', bkash:'📱', nagad:'🔶', card:'💳', other:'💰' };
  const sorted = [...methods].sort((a, b) => b.revenue - a.revenue);
  el.innerHTML = sorted.map(m => {
    const pct = ((m.revenue / total) * 100).toFixed(1);
    const color = colors[m.label] || colors.other;
    return `
      <div style="margin-bottom:10px">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:4px">
          <span style="font-size:12px;font-weight:600;text-transform:capitalize">${icons[m.label]||'💰'} ${m.label}</span>
          <span style="font-size:11.5px;color:${color};font-weight:700">${pct}% · ৳${m.revenue.toLocaleString('en-IN',{minimumFractionDigits:0})}</span>
        </div>
        <div style="height:7px;background:var(--border);border-radius:4px;overflow:hidden">
          <div style="height:100%;background:${color};border-radius:4px;width:${pct}%;transition:width .4s ease;opacity:.85"></div>
        </div>
        <div style="font-size:10px;color:var(--text-faint);margin-top:2px">${m.count} transactions</div>
      </div>`;
  }).join('');
}

function _anRenderTopSuppliers(supps) {
  const el = document.getElementById('an-top-suppliers');
  if (!el) return;
  if (!supps.length) { el.innerHTML = '<div style="color:var(--text-faint);font-size:12px;text-align:center;padding:16px">No purchase data yet</div>'; return; }
  const maxTotal = supps[0].total || 1;
  el.innerHTML = supps.map((s, i) => `
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:12px">
      <div style="width:24px;height:24px;border-radius:6px;background:var(--mango-bg);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:var(--mango-dk);flex-shrink:0">${i+1}</div>
      <div style="flex:1;min-width:0">
        <div style="font-size:12px;font-weight:600;margin-bottom:3px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${s.name}</div>
        <div style="height:5px;background:var(--border);border-radius:3px;overflow:hidden">
          <div style="height:100%;background:var(--mango);border-radius:3px;width:${(s.total/maxTotal)*100}%;opacity:.75"></div>
        </div>
      </div>
      <div style="text-align:right;flex-shrink:0;min-width:70px">
        <div style="font-size:12px;font-weight:700;color:var(--mango-dk)">৳${s.total.toLocaleString('en-IN',{minimumFractionDigits:0})}</div>
        <div style="font-size:10px;color:var(--text-faint)">${s.count} order${s.count!==1?'s':''}</div>
      </div>
    </div>`).join('');
}

function _anRenderWeekdayChart(dayMap) {
  const el = document.getElementById('an-weekday-chart');
  if (!el) return;
  const days = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const vals = [0,1,2,3,4,5,6].map(i => ({ day: days[i], val: dayMap[i] || 0 }));
  const maxVal = Math.max(...vals.map(v => v.val), 1);
  el.innerHTML = vals.map(v => `
    <div style="display:flex;flex-direction:column;align-items:center;flex:1;gap:4px">
      <div style="font-size:9.5px;color:var(--text-faint);font-weight:600;height:16px;display:flex;align-items:center">
        ${v.val > 0 ? '৳'+Math.round(v.val/1000)+'k' : ''}
      </div>
      <div title="${v.day}: ৳${v.val.toLocaleString('en-IN',{minimumFractionDigits:0})}"
        style="width:100%;background:${v.val>0?'var(--blue)':'var(--border)'};border-radius:4px 4px 0 0;
               min-height:4px;height:${Math.max(4,(v.val/maxVal)*72)}px;opacity:${v.val>0?.8:.3};
               cursor:${v.val>0?'pointer':'default'};transition:opacity .15s"
        onmouseover="this.style.opacity=1" onmouseout="this.style.opacity='${v.val>0?.8:.3}'"></div>
      <div style="font-size:9.5px;color:var(--text-faint)">${v.day}</div>
    </div>`).join('');
}

function _anRenderCustomerInsights({ uniqueCusts, walkIn, repeatRate, totalSales }) {
  const el = document.getElementById('an-customer-insights');
  if (!el) return;
  const items = [
    { label:'Registered Customers',  val: uniqueCusts,              color:'var(--blue)',     icon:'👤' },
    { label:'Walk-in Sales',          val: walkIn,                   color:'var(--text-soft)', icon:'🚶' },
    { label:'Repeat Customer Rate',   val: repeatRate + '%',         color:'var(--green)',    icon:'🔁' },
    { label:'Total Transactions',     val: totalSales,               color:'var(--mint)',     icon:'🧾' },
  ];
  el.innerHTML = items.map(item => `
    <div style="text-align:center;padding:12px 8px;background:var(--bg);border-radius:10px;border:1px solid var(--border)">
      <div style="font-size:22px;margin-bottom:6px">${item.icon}</div>
      <div style="font-size:20px;font-weight:800;color:${item.color};font-family:monospace">${item.val}</div>
      <div style="font-size:11px;color:var(--text-faint);margin-top:3px">${item.label}</div>
    </div>`).join('');
}

function exportAnalyticsCSV() {
  const d = _anExportData;
  if (!d.topProds) { toast('No analytics data loaded yet', 'warning'); return; }
  const rows = [
    ['Metric','Value'],
    ['Total Revenue', d.totalRevenue],
    ['Total Purchases', d.totalPurchases],
    ['Net Profit', d.netProfit],
    ['Profit Margin %', d.margin.toFixed(1)],
    ['Total Sales', d.salesCount],
    ['',''],
    ['Top Product','Revenue (৳)','Qty Sold'],
    ...(d.topProds||[]).map(p => [p.name, p.revenue, p.qty]),
    ['',''],
    ['Top Supplier','Total Spend (৳)','Orders'],
    ...(d.topSupps||[]).map(s => [s.name, s.total, s.count]),
  ];
  exportCSV(rows.slice(1), `analytics_${_anRange}.csv`, [
    { label:'Metric/Name', key:'0' },
    { label:'Value/Revenue', key:'1' },
    { label:'Extra', key:'2' },
  ].map((c,i) => ({ label: rows[0][i]||'', key: i })));
  // Simple raw CSV export
  const csv = rows.map(r => r.map(v => `"${String(v||'').replace(/"/g,'""')}"`).join(',')).join('\n');
  const blob = new Blob(['\uFEFF'+csv], { type:'text/csv;charset=utf-8;' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a'); a.href=url; a.download=`analytics_${_anRange}.csv`; a.click();
  URL.revokeObjectURL(url);
  toast(`Exported analytics_${_anRange}.csv`);
}

/* ═══════════════════════════════════════════════════════════
   STOCK REPORT
   ═══════════════════════════════════════════════════════════ */

let _srData       = [];   // full dataset after load
let _srFiltered   = [];   // after search/type filter
let _srFilter     = 'all';
let _srPage       = 1;
const SR_PAGE_SIZE = 25;

function srQuickFilter(range) {
  const now = new Date();
  const pad = n => String(n).padStart(2,'0');
  const ymd = d => `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`;
  let from, to;

  if (range === 'all')        { from = null; to = null; }
  else if (range === 'today') { from = to = ymd(now); }
  else if (range === 'week')  {
    const mon = new Date(now); mon.setDate(now.getDate() - ((now.getDay()+6)%7));
    from = ymd(mon); to = ymd(now);
  }
  else if (range === 'month') { from = `${now.getFullYear()}-${pad(now.getMonth()+1)}-01`; to = ymd(now); }
  else if (range === 'year')  { from = `${now.getFullYear()}-01-01`; to = ymd(now); }

  ['all','today','week','month','year'].forEach(k => {
    const el = document.getElementById(`sr-pill-${k}`);
    if (el) el.classList.toggle('active', k === range);
  });

  const fromEl = document.getElementById('sr-from');
  const toEl   = document.getElementById('sr-to');
  if (fromEl) fromEl.value = from || '';
  if (toEl)   toEl.value   = to   || '';

  loadStockReport();
}

function setSrFilter(type) {
  _srFilter = type;
  ['all','in','out','low'].forEach(k => {
    const el = document.getElementById(`sr-f-${k}`);
    if (el) el.classList.toggle('active', k === type);
  });
  _srPage = 1;
  _applyStockFilter();
}

function filterStockTable() {
  _srPage = 1;
  _applyStockFilter();
}

function _applyStockFilter() {
  const q = (document.getElementById('sr-search')?.value || '').toLowerCase();
  _srFiltered = _srData.filter(row => {
    const matchSearch = !q || row.name.toLowerCase().includes(q) || row.itemId.toLowerCase().includes(q);
    const matchType =
      _srFilter === 'all' ? true :
      _srFilter === 'in'  ? row.stockIn > 0 :
      _srFilter === 'out' ? row.stockOut > 0 :
      _srFilter === 'low' ? row.currentStock <= 10 : true;
    return matchSearch && matchType;
  });
  _renderStockTable();
}

async function loadStockReport() {
  const fromEl = document.getElementById('sr-from');
  const toEl   = document.getElementById('sr-to');
  const from   = fromEl?.value || null;
  const to     = toEl?.value   || null;

  const sub = document.getElementById('sr-subtitle');
  if (sub) sub.textContent = (from && to) ? `Stock movement · ${from} → ${to}` : 'All stock movement from sales & purchases';

  // Show loading state
  const tbody = document.getElementById('sr-tbody');
  if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-faint);padding:40px 0">
    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="color:var(--border);display:block;margin:0 auto 10px;animation:spin 1s linear infinite"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
    Loading…</td></tr>`;

  if (!document.getElementById('srSpinStyle')) {
    const st = document.createElement('style');
    st.id = 'srSpinStyle';
    st.textContent = '@keyframes spin{to{transform:rotate(360deg)}}';
    document.head.appendChild(st);
  }

  try {
    /* ── 1. All current items ── */
    const { data: items } = await db.from('items')
      .select('id, name, uom, cost_price, selling_price, stock_quantity')
      .order('id');

    /* ── 2. Sales items in range (non-returned sales) ── */
    let saleQ = db.from('sale_items')
      .select('item_id, quantity, unit_price, subtotal, sales!inner(sale_date, payment_status)')
      .neq('sales.payment_status', 'returned');
    if (from) saleQ = saleQ.gte('sales.sale_date', `${from}T00:00:00`);
    if (to)   saleQ = saleQ.lte('sales.sale_date', `${to}T23:59:59`);
    const { data: saleItems } = await saleQ;

    /* ── 3. Sale returns (returned sales) in range ── */
    let saleRetQ = db.from('sale_items')
      .select('item_id, quantity, sales!inner(sale_date, payment_status)')
      .eq('sales.payment_status', 'returned');
    if (from) saleRetQ = saleRetQ.gte('sales.sale_date', `${from}T00:00:00`);
    if (to)   saleRetQ = saleRetQ.lte('sales.sale_date', `${to}T23:59:59`);
    const { data: saleRetItems } = await saleRetQ;

    /* ── 4. Purchase items in range (non-returned purchases) ── */
    let purQ = db.from('supplier_purchase_items')
      .select('item_id, quantity, supplier_purchases!inner(purchase_date, payment_status)')
      .neq('supplier_purchases.payment_status', 'returned');
    if (from) purQ = purQ.gte('supplier_purchases.purchase_date', `${from}T00:00:00`);
    if (to)   purQ = purQ.lte('supplier_purchases.purchase_date', `${to}T23:59:59`);
    const { data: purItems } = await purQ;

    /* ── 5. Purchase returns in range ── */
    let purRetQ = db.from('supplier_purchase_items')
      .select('item_id, quantity, supplier_purchases!inner(purchase_date, payment_status)')
      .eq('supplier_purchases.payment_status', 'returned');
    if (from) purRetQ = purRetQ.gte('supplier_purchases.purchase_date', `${from}T00:00:00`);
    if (to)   purRetQ = purRetQ.lte('supplier_purchases.purchase_date', `${to}T23:59:59`);
    const { data: purRetItems } = await purRetQ;

    /* ── 6. Aggregate by item ── */
    const agg = {};  // itemId → { stockIn, stockOut, saleReturns, purReturns, inValue, outValue }

    // initialise with all items
    (items||[]).forEach(it => {
      agg[it.id] = {
        itemId:       it.id,
        name:         it.name || it.id,
        uom:          it.uom || '—',
        costPrice:    parseFloat(it.cost_price || 0),
        sellPrice:    parseFloat(it.selling_price || 0),
        currentStock: it.stock_quantity || 0,
        stockIn:      0,
        stockOut:     0,
        saleReturns:  0,
        purReturns:   0,
        inValue:      0,
        outValue:     0,
      };
    });

    (purItems||[]).forEach(r => {
      if (!agg[r.item_id]) return;
      agg[r.item_id].stockIn  += r.quantity || 0;
      agg[r.item_id].inValue  += parseFloat(r.subtotal || 0);
    });

    (saleItems||[]).forEach(r => {
      if (!agg[r.item_id]) return;
      agg[r.item_id].stockOut += r.quantity || 0;
      agg[r.item_id].outValue += parseFloat(r.subtotal || 0);
    });

    (saleRetItems||[]).forEach(r => {
      if (!agg[r.item_id]) return;
      agg[r.item_id].saleReturns += r.quantity || 0;
    });

    (purRetItems||[]).forEach(r => {
      if (!agg[r.item_id]) return;
      agg[r.item_id].purReturns += r.quantity || 0;
    });

    // net returns = sale returns (back to stock) - purchase returns (out of stock)
    Object.values(agg).forEach(row => {
      row.netReturns  = row.saleReturns - row.purReturns;
      row.netMovement = row.stockIn - row.stockOut + row.netReturns;
      row.stockValue  = row.currentStock * row.costPrice;
    });

    _srData = Object.values(agg).sort((a,b) => (b.stockIn + b.stockOut) - (a.stockIn + a.stockOut));

    /* ── 7. Update summary stats ── */
    const totalIn   = _srData.reduce((s,r) => s + r.stockIn, 0);
    const totalOut  = _srData.reduce((s,r) => s + r.stockOut, 0);
    const totalVal  = _srData.reduce((s,r) => s + r.stockValue, 0);
    const activeItems = _srData.filter(r => r.stockIn > 0 || r.stockOut > 0).length;

    const setEl = (id, v) => { const el = document.getElementById(id); if (el) el.textContent = v; };
    setEl('sr-stat-in',    totalIn.toLocaleString('en-IN'));
    setEl('sr-stat-out',   totalOut.toLocaleString('en-IN'));
    setEl('sr-stat-items', activeItems);
    setEl('sr-stat-val',   '৳' + totalVal.toLocaleString('en-IN', {minimumFractionDigits:0}));

    /* ── 8. Apply current filter and render ── */
    _srPage = 1;
    _applyStockFilter();

  } catch (err) {
    console.error('Stock report error:', err);
    const tbody = document.getElementById('sr-tbody');
    if (tbody) tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--red);padding:30px">Error: ${err.message}</td></tr>`;
    if (typeof toast === 'function') toast('Stock report failed: ' + err.message, 'error');
  }
}

function _renderStockTable() {
  const tbody = document.getElementById('sr-tbody');
  if (!tbody) return;

  const total = _srFiltered.length;
  const pages = Math.ceil(total / SR_PAGE_SIZE);
  const start = (_srPage - 1) * SR_PAGE_SIZE;
  const rows  = _srFiltered.slice(start, start + SR_PAGE_SIZE);

  const fmt  = n => n.toLocaleString('en-IN');
  const fmtM = n => n.toLocaleString('en-IN', {minimumFractionDigits:2});

  if (rows.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;color:var(--text-faint);padding:40px">
      No items match your filter.</td></tr>`;
  } else {
    tbody.innerHTML = rows.map((r, i) => {
      const net    = r.netMovement;
      const netCol = net > 0 ? 'var(--green)' : net < 0 ? 'var(--red)' : 'var(--text-soft)';
      const netPfx = net > 0 ? '+' : '';
      const stockCol = r.currentStock === 0 ? 'var(--red)'
                     : r.currentStock <= 10  ? 'var(--mango-dk)'
                     : 'var(--text)';
      const stockBadge = r.currentStock === 0
        ? `<span class="badge b-red" style="font-size:9px;margin-left:4px">Out</span>`
        : r.currentStock <= 10
        ? `<span class="badge b-mango" style="font-size:9px;margin-left:4px">Low</span>`
        : '';

      return `<tr style="animation:fadeUp .25s ease ${i*20}ms both">
        <td><span class="mono" style="font-size:11px;color:var(--text-faint)">${r.itemId}</span></td>
        <td>
          <div style="font-weight:600;font-size:13px;max-width:240px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${r.name}">${r.name}</div>
        </td>
        <td><span style="font-size:11px;color:var(--text-soft)">${r.uom}</span></td>
        <td style="text-align:center">
          ${r.stockIn > 0
            ? `<div style="display:inline-flex;align-items:center;gap:4px;background:var(--green-bg);color:var(--green);padding:3px 9px;border-radius:7px;font-weight:700;font-size:12.5px;font-family:'JetBrains Mono',monospace">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-.49-3.51"/></svg>
                +${fmt(r.stockIn)}</div>`
            : `<span style="color:var(--text-faint);font-size:12px">—</span>`}
        </td>
        <td style="text-align:center">
          ${r.stockOut > 0
            ? `<div style="display:inline-flex;align-items:center;gap:4px;background:var(--red-bg);color:var(--red);padding:3px 9px;border-radius:7px;font-weight:700;font-size:12.5px;font-family:'JetBrains Mono',monospace">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/></svg>
                −${fmt(r.stockOut)}</div>`
            : `<span style="color:var(--text-faint);font-size:12px">—</span>`}
        </td>
        <td style="text-align:center">
          ${r.netReturns !== 0
            ? `<span style="font-family:'JetBrains Mono',monospace;font-size:12px;color:var(--blue)">${r.netReturns > 0 ? '+' : ''}${fmt(r.netReturns)}</span>`
            : `<span style="color:var(--text-faint);font-size:12px">—</span>`}
        </td>
        <td style="text-align:center">
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:${netCol}">${netPfx}${fmt(net)}</span>
        </td>
        <td style="text-align:right">
          <span style="font-family:'JetBrains Mono',monospace;font-weight:700;font-size:13px;color:${stockCol}">${fmt(r.currentStock)}</span>${stockBadge}
        </td>
        <td style="text-align:right">
          <span class="mono" style="font-size:12px;color:var(--text-soft)">৳${fmtM(r.stockValue)}</span>
        </td>
      </tr>`;
    }).join('');
  }

  // pagination
  const pag     = document.getElementById('sr-pagination');
  const info    = document.getElementById('sr-page-info');
  const btnWrap = document.getElementById('sr-page-btns');
  if (!pag) return;

  if (total <= SR_PAGE_SIZE) {
    pag.style.display = 'none';
  } else {
    pag.style.display = '';
    if (info) info.textContent = `Showing ${start+1}–${Math.min(start+SR_PAGE_SIZE, total)} of ${total} items`;
    if (btnWrap) {
      let html = `<button class="page-btn${_srPage===1?' active':''}" onclick="_srGoPage(1)">1</button>`;
      if (_srPage > 3) html += `<button class="page-btn" disabled style="cursor:default">…</button>`;
      for (let p = Math.max(2,_srPage-1); p <= Math.min(pages-1,_srPage+1); p++)
        html += `<button class="page-btn${p===_srPage?' active':''}" onclick="_srGoPage(${p})">${p}</button>`;
      if (_srPage < pages-2) html += `<button class="page-btn" disabled style="cursor:default">…</button>`;
      if (pages > 1)
        html += `<button class="page-btn${_srPage===pages?' active':''}" onclick="_srGoPage(${pages})">${pages}</button>`;
      btnWrap.innerHTML = html;
    }
  }
}

function _srGoPage(p) {
  _srPage = p;
  _renderStockTable();
  document.getElementById('page-stock-report')?.scrollIntoView({behavior:'smooth', block:'start'});
}

function printStockReport() {
  const fromEl = document.getElementById('sr-from');
  const toEl   = document.getElementById('sr-to');
  const range  = (fromEl?.value && toEl?.value) ? `${fromEl.value} to ${toEl.value}` : 'All Time';
  const fmt    = n => n.toLocaleString('en-IN');
  const fmtM   = n => n.toLocaleString('en-IN', {minimumFractionDigits:2});

  const rows = _srFiltered.map((r,i) => {
    const net    = r.netMovement;
    const netPfx = net > 0 ? '+' : '';
    const sc     = r.currentStock === 0 ? 'color:#e55353;font-weight:700' : r.currentStock <= 10 ? 'color:#d4880f;font-weight:700' : '';
    return `<tr style="background:${i%2===0?'#fff':'#f9fbf9'}">
      <td>${r.itemId}</td>
      <td>${r.name}</td>
      <td style="text-align:center">${r.uom}</td>
      <td style="text-align:center;color:#3caf82;font-weight:700">${r.stockIn > 0 ? '+'+fmt(r.stockIn) : '—'}</td>
      <td style="text-align:center;color:#e55353;font-weight:700">${r.stockOut > 0 ? '−'+fmt(r.stockOut) : '—'}</td>
      <td style="text-align:center;color:#4a85e8">${r.netReturns !== 0 ? (r.netReturns>0?'+':'')+fmt(r.netReturns) : '—'}</td>
      <td style="text-align:center;font-weight:700;color:${net>0?'#3caf82':net<0?'#e55353':'#7fa393'}">${netPfx}${fmt(net)}</td>
      <td style="text-align:right;${sc}">${fmt(r.currentStock)}</td>
      <td style="text-align:right;color:#7fa393">৳${fmtM(r.stockValue)}</td>
    </tr>`;
  }).join('');

  const totalIn  = _srFiltered.reduce((s,r)=>s+r.stockIn,0);
  const totalOut = _srFiltered.reduce((s,r)=>s+r.stockOut,0);
  const totalVal = _srFiltered.reduce((s,r)=>s+r.stockValue,0);

  const win = window.open('','_blank','width=1000,height=720');
  win.document.write(`<!DOCTYPE html><html><head>
  <title>Stock Report</title>
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{font-family:'DM Sans',Arial,sans-serif;color:#1a2e22;background:#fff;padding:30px;font-size:12px}
    h1{font-size:20px;font-weight:800;margin-bottom:3px}
    .sub{color:#6b8a74;font-size:11px;margin-bottom:18px}
    .summary{display:flex;gap:20px;margin-bottom:20px;padding:14px 18px;background:#f7faf8;border-radius:10px;border:1px solid #e0ede7}
    .sum-item{flex:1;text-align:center}
    .sum-val{font-size:18px;font-weight:800;font-family:monospace}
    .sum-lbl{font-size:10px;color:#7fa393;margin-top:2px;text-transform:uppercase;letter-spacing:.05em}
    table{width:100%;border-collapse:collapse}
    th{background:#f7faf8;font-size:10px;text-transform:uppercase;letter-spacing:.08em;color:#7fa393;padding:8px 10px;text-align:left;border-bottom:2px solid #e0ede7}
    td{padding:7px 10px;border-bottom:1px solid #f0f6f2;font-size:11.5px}
    .footer{margin-top:18px;text-align:center;font-size:10px;color:#a8c5b8;border-top:1px solid #e0ede7;padding-top:12px}
    @media print{body{padding:15px}}
  </style></head><body>
  <div style="display:flex;justify-content:space-between;align-items:flex-start">
    <div>
      <div style="font-weight:800;font-size:14px;margin-bottom:2px">MangoLovers</div>
      <h1>Stock Report</h1>
      <div class="sub">Period: ${range} · Generated: ${new Date().toLocaleString()}</div>
    </div>
  </div>
  <div class="summary">
    <div class="sum-item"><div class="sum-val" style="color:#3caf82">+${fmt(totalIn)}</div><div class="sum-lbl">Total Stock In</div></div>
    <div class="sum-item"><div class="sum-val" style="color:#e55353">−${fmt(totalOut)}</div><div class="sum-lbl">Total Stock Out</div></div>
    <div class="sum-item"><div class="sum-val">${_srFiltered.filter(r=>r.stockIn>0||r.stockOut>0).length}</div><div class="sum-lbl">Active Items</div></div>
    <div class="sum-item"><div class="sum-val" style="color:#f5a623">৳${fmtM(totalVal)}</div><div class="sum-lbl">Stock Value</div></div>
  </div>
  <table>
    <thead><tr>
      <th>Item ID</th><th>Name</th><th style="text-align:center">UoM</th>
      <th style="text-align:center">Stock In</th><th style="text-align:center">Stock Out</th>
      <th style="text-align:center">Returns</th><th style="text-align:center">Net</th>
      <th style="text-align:right">Current Stock</th><th style="text-align:right">Stock Value</th>
    </tr></thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="footer">MangoLovers Inventory System · Stock Report · ${new Date().toLocaleDateString()}</div>
  </body></html>`);
  win.document.close();
  win.focus();
  setTimeout(() => win.print(), 400);
}