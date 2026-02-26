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
    const { data, error } = await db
      .from('sales')
      .select(`
        id, total_amount, payment_type, payment_status, sale_date,
        customers ( name )
      `)
      .order('sale_date', { ascending: false })
      .limit(50);
    if (error) throw error;

    const statusMap = { paid: 'Completed', pending: 'Pending', partial: 'Pending' };
    const mapped = (data || []).map(row => ({
      id:       row.id.slice(0, 14).toUpperCase(),
      customer: row.customers?.name || 'Walk-in',
      items:    1,
      total:    parseFloat(row.total_amount),
      payment:  row.payment_type || 'Cash',
      status:   statusMap[row.payment_status] || 'Completed',
      date:     row.sale_date ? row.sale_date.replace('T', ' ').slice(0, 16) : '—',
    }));

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
        id, total_amount, purchase_date, payment_status,
        suppliers ( name )
      `)
      .order('purchase_date', { ascending: false })
      .limit(50);
    if (error) throw error;

    const statusMap = { paid: 'Received', pending: 'Pending' };
    const mapped = (data || []).map(row => {
      const d = row.purchase_date ? row.purchase_date.split('T')[0] : '—';
      const due = row.purchase_date
        ? new Date(new Date(row.purchase_date).getTime() + 30*24*60*60*1000).toISOString().split('T')[0]
        : '—';
      return {
        id:       'PO-' + row.id.slice(0, 8).toUpperCase(),
        supplier: row.suppliers?.name || '—',
        items:    1,
        total:    parseFloat(row.total_amount),
        status:   statusMap[row.payment_status] || 'Pending',
        date:     d,
        dueDate:  due,
      };
    });

    purchases.length = 0;
    mapped.forEach(p => purchases.push(p));
    renderPurchases();

  } catch (err) {
    console.error('Load purchases error:', err);
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
      () => { loadSales(); loadDashboardStats(); })
    .on('postgres_changes', { event: '*', schema: 'public', table: 'customers' },
      () => loadCustomers())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'suppliers' },
      () => loadSuppliers())
    .on('postgres_changes', { event: '*', schema: 'public', table: 'supplier_purchases' },
      () => loadPurchases())
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

  // Load all data in parallel
  await Promise.all([
    loadProducts(),
    loadCustomers(),
    loadSuppliers(),
    loadSales(),
    loadPurchases(),
    loadDashboardStats(),
  ]);

  setupRealtimeSubscriptions();
}
