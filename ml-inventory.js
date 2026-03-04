/* ── DATA ── */
const salesData=[{month:'Jan',sales:42000,purchases:28000,profit:14000},{month:'Feb',sales:38000,purchases:25000,profit:13000},{month:'Mar',sales:55000,purchases:31000,profit:24000},{month:'Apr',sales:47000,purchases:27000,profit:20000},{month:'May',sales:63000,purchases:35000,profit:28000},{month:'Jun',sales:58000,purchases:33000,profit:25000},{month:'Jul',sales:72000,purchases:40000,profit:32000},{month:'Aug',sales:69000,purchases:38000,profit:31000},{month:'Sep',sales:81000,purchases:44000,profit:37000},{month:'Oct',sales:76000,purchases:42000,profit:34000},{month:'Nov',sales:94000,purchases:52000,profit:42000},{month:'Dec',sales:110000,purchases:61000,profit:49000}];
const weeklyData=[{day:'Mon',sales:8200},{day:'Tue',sales:6800},{day:'Wed',sales:9400},{day:'Thu',sales:7200},{day:'Fri',sales:11800},{day:'Sat',sales:14200},{day:'Sun',sales:5600}];
const categoryData=[{name:'Electronics',value:35,color:'#f5a623'},{name:'Clothing',value:25,color:'#3caf82'},{name:'Food & Bev.',value:20,color:'#4a85e8'},{name:'Home & Living',value:12,color:'#8b6be8'},{name:'Others',value:8,color:'#a8c5b8'}];
const products=[
  {id:'PRD-001',name:'Sony WH-1000XM5',category:'Electronics',sku:'SON-WH1000XM5-BLK',stock:48,minStock:10,price:399.99,cost:220,supplier:'TechWorld Distributors',status:'In Stock',
   iconSvg:'<path d="M3 18v-6a9 9 0 0 1 18 0v6"/><path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z"/>'},
  {id:'PRD-002',name:'MacBook Air M3',category:'Electronics',sku:'APL-MBA-M3-256',stock:12,minStock:5,price:1299.99,cost:950,supplier:'Apple Premium Reseller',status:'In Stock',
   iconSvg:'<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'},
  {id:'PRD-003',name:'Nike Air Max 270',category:'Clothing',sku:'NIK-AM270-WHT-42',stock:3,minStock:15,price:149.99,cost:72,supplier:'Nike Bangladesh',status:'Low Stock',
   iconSvg:'<path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>'},
  {id:'PRD-004',name:'Organic Green Tea 100g',category:'Food & Beverage',sku:'TEA-GRN-100G',stock:240,minStock:50,price:12.99,cost:5.50,supplier:"Nature's Best",status:'In Stock',
   iconSvg:'<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" y1="2" x2="6" y2="4"/><line x1="10" y1="2" x2="10" y2="4"/><line x1="14" y1="2" x2="14" y2="4"/>'},
  {id:'PRD-005',name:'Ergonomic Office Chair',category:'Home & Living',sku:'CHAIR-ERG-BLK',stock:0,minStock:5,price:549.99,cost:280,supplier:'FurniCo Ltd',status:'Out of Stock',
   iconSvg:'<path d="M20 9V6a2 2 0 0 0-2-2H6a2 2 0 0 0-2 2v3"/><path d="M2 11v5a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-5a2 2 0 0 0-4 0v2H6v-2a2 2 0 0 0-4 0Z"/><path d="M4 18v2"/><path d="M20 18v2"/><path d="M12 4v9"/>'},
  {id:'PRD-006',name:'Samsung 4K Monitor 27"',category:'Electronics',sku:'SAM-MON-4K-27',stock:22,minStock:8,price:459.99,cost:290,supplier:'Samsung BD',status:'In Stock',
   iconSvg:'<rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/>'},
  {id:'PRD-007',name:'Premium Cotton T-Shirt',category:'Clothing',sku:'APP-TSH-CTN-M',stock:156,minStock:30,price:24.99,cost:8,supplier:'Dhaka Garments',status:'In Stock',
   iconSvg:'<path d="M20.38 3.46 16 2a4 4 0 0 1-8 0L3.62 3.46a2 2 0 0 0-1.34 2.23l.58 3.57a1 1 0 0 0 .99.84H6v10c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2V10h2.15a1 1 0 0 0 .99-.84l.58-3.57a2 2 0 0 0-1.34-2.23z"/>'},
  {id:'PRD-008',name:'Logitech MX Master 3S',category:'Electronics',sku:'LOG-MXM3S-GRY',stock:7,minStock:10,price:99.99,cost:58,supplier:'TechWorld Distributors',status:'Low Stock',
   iconSvg:'<path d="M5 4h1a3 3 0 0 1 3 3 3 3 0 0 1 3-3h1"/><path d="M13 20H6a2 2 0 0 1-2-2V6"/><path d="M13 20a2 2 0 0 0 2-2V6"/><line x1="9" y1="7" x2="9" y2="7"/>'},
];
const recentSales=[
  {id:'INV-2024-1842',customer:'Rafiq Ahmed',items:3,total:847.97,payment:'Cash',status:'Completed',date:'2024-02-15 14:32',
   lineItems:[{name:'Sony WH-1000XM5',qty:1,unitPrice:399.99,subtotal:399.99},{name:'Premium Cotton T-Shirt',qty:4,unitPrice:24.99,subtotal:99.96},{name:'Organic Green Tea 100g',qty:3,unitPrice:12.99,subtotal:38.97}]},
  {id:'INV-2024-1841',customer:'Nadia Islam',items:1,total:1299.99,payment:'Card',status:'Completed',date:'2024-02-15 13:18',
   lineItems:[{name:'MacBook Air M3',qty:1,unitPrice:1299.99,subtotal:1299.99}]},
  {id:'INV-2024-1840',customer:'Karim Miah',items:5,total:174.95,payment:'Mobile Banking',status:'Pending',date:'2024-02-15 12:05',
   lineItems:[{name:'Organic Green Tea 100g',qty:5,unitPrice:12.99,subtotal:64.95},{name:'Premium Cotton T-Shirt',qty:4,unitPrice:24.99,subtotal:99.96},{name:'Nike Air Max 270',qty:0,unitPrice:0,subtotal:10.04}]},
  {id:'INV-2024-1839',customer:'Fatema Begum',items:2,total:549.98,payment:'Card',status:'Completed',date:'2024-02-15 10:47',
   lineItems:[{name:'Ergonomic Office Chair',qty:1,unitPrice:549.99,subtotal:549.98}]},
  {id:'INV-2024-1838',customer:'Tanvir Hossain',items:4,total:399.96,payment:'Cash',status:'Refunded',date:'2024-02-15 09:22',
   lineItems:[{name:'Premium Cotton T-Shirt',qty:4,unitPrice:24.99,subtotal:99.96},{name:'Logitech MX Master 3S',qty:3,unitPrice:99.99,subtotal:299.97}]},
  {id:'INV-2024-1837',customer:'Sara Chowdhury',items:1,total:459.99,payment:'Mobile Banking',status:'Completed',date:'2024-02-14 18:55',
   lineItems:[{name:'Samsung 4K Monitor 27"',qty:1,unitPrice:459.99,subtotal:459.99}]},
];
const purchases=[
  {id:'PO-2024-0412',supplier:'TechWorld Distributors',items:4,total:12480,status:'Received',date:'2024-02-13',dueDate:'2024-03-13'},
  {id:'PO-2024-0411',supplier:'Apple Premium Reseller',items:10,total:9500,status:'Pending',date:'2024-02-12',dueDate:'2024-03-12'},
  {id:'PO-2024-0410',supplier:'Nike Bangladesh',items:50,total:3600,status:'In Transit',date:'2024-02-10',dueDate:'2024-03-10'},
  {id:'PO-2024-0409',supplier:"Nature's Best",items:200,total:1100,status:'Received',date:'2024-02-08',dueDate:'2024-03-08'},
  {id:'PO-2024-0408',supplier:'FurniCo Ltd',items:8,total:2240,status:'Overdue',date:'2024-01-28',dueDate:'2024-02-12'},
];
const customers=[
  {id:'CUS-001',name:'Rafiq Ahmed',phone:'+880-1711-123456',email:'rafiq@email.com',totalPurchases:12,totalSpent:8420,outstanding:0,status:'Active'},
  {id:'CUS-002',name:'Nadia Islam',phone:'+880-1811-234567',email:'nadia@email.com',totalPurchases:5,totalSpent:5840,outstanding:1299,status:'Active'},
  {id:'CUS-003',name:'Karim Miah',phone:'+880-1911-345678',email:'karim@email.com',totalPurchases:28,totalSpent:3210,outstanding:0,status:'Active'},
  {id:'CUS-004',name:'Fatema Begum',phone:'+880-1612-456789',email:'fatema@email.com',totalPurchases:8,totalSpent:2890,outstanding:549,status:'Active'},
  {id:'CUS-005',name:'Tanvir Hossain',phone:'+880-1512-567890',email:'tanvir@email.com',totalPurchases:3,totalSpent:1240,outstanding:0,status:'Inactive'},
];
const suppliersData=[
  {id:'SUP-001',name:'TechWorld Distributors',category:'Electronics',contact:'+880-1711-234567',totalPurchases:84200,outstanding:12480,status:'Active'},
  {id:'SUP-002',name:'Apple Premium Reseller',category:'Electronics',contact:'+880-1811-345678',totalPurchases:156000,outstanding:9500,status:'Active'},
  {id:'SUP-003',name:'Nike Bangladesh',category:'Clothing',contact:'+880-1911-456789',totalPurchases:42000,outstanding:0,status:'Active'},
  {id:'SUP-004',name:"Nature's Best",category:'Food & Beverage',contact:'+880-1612-567890',totalPurchases:18600,outstanding:0,status:'Active'},
  {id:'SUP-005',name:'FurniCo Ltd',category:'Home & Living',contact:'+880-1512-678901',totalPurchases:28400,outstanding:2240,status:'Inactive'},
  {id:'SUP-006',name:'Samsung BD',category:'Electronics',contact:'+880-1312-789012',totalPurchases:67000,outstanding:0,status:'Active'},
];

/* ── Returns data (populated by Supabase or locally) ── */
let salesReturns = [];
let purchaseReturns = [];

/* ── SVG helpers ── */
const svgIcon = (path,size=14,color='currentColor') =>
  `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">${path}</svg>`;
const checkSvg  = '<polyline points="20 6 9 17 4 12"/>';
const warnSvg   = '<path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>';
const xCircSvg  = '<circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>';
const clockSvg  = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
const truckSvg  = '<rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>';
const phoneSvg  = '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12 19.79 19.79 0 0 1 1.61 3.53 2 2 0 0 1 3.6 1h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 8.62a16 16 0 0 0 6.29 6.29l.91-.91a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/>';
const mailSvg   = '<path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/>';
const eyeSvg    = '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>';
const editSvg   = '<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>';
const trashSvg  = '<polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>';
const printSvg  = '<polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/>';
const rotateSvg = '<polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-3.51"/>';
const okSvg     = '<circle cx="12" cy="12" r="10"/><polyline points="12 8 12 12 14 14"/>';

/* ── STATUS BADGE ── */
const statusBadge = s => {
  const map = {
    'In Stock':    ['b-green',  checkSvg],
    'Completed':   ['b-green',  checkSvg],
    'Active':      ['b-green',  checkSvg],
    'Received':    ['b-green',  checkSvg],
    'Processed':   ['b-green',  checkSvg],
    'Low Stock':   ['b-mango',  warnSvg],
    'Pending':     ['b-mango',  clockSvg],
    'Near Full':   ['b-mango',  warnSvg],
    'In Transit':  ['b-blue',   truckSvg],
    'Out of Stock':['b-red',    xCircSvg],
    'Refunded':    ['b-red',    rotateSvg],
    'Overdue':     ['b-red',    warnSvg],
    'Inactive':    ['b-grey',   ''],
  };
  const [cls, icon] = map[s] || ['b-grey',''];
  return `<span class="badge ${cls}">${icon ? svgIcon(icon,8) : ''} ${s}</span>`;
};

const paymentColor = p => ({Cash:'color:var(--green)',Card:'color:var(--blue)','Mobile Banking':'color:var(--purple)'}[p]||'color:var(--text-soft)');
const sfClass = (stk,min) => stk===0?'sr':stk<=min?'sm':'sg';
const snColor = (stk,min) => stk===0?'var(--red)':stk<=min?'var(--mango-dk)':'var(--text)';
const fmt = n => n.toLocaleString('en-IN',{minimumFractionDigits:2});

/* ── NAV ── */
const pageCfg = {
  dashboard:  {title:'Dashboard',  sub:'Tuesday, 24 February 2026', act:'New Sale'},
  products:   {title:'Products',   sub:'8 total products',           act:'Add Product'},
  categories: {title:'Categories', sub:'Manage product categories',  act:'Add Category'},
  warehouses: {title:'Warehouses', sub:'Storage locations',          act:'Add Warehouse'},
  adjustments:{title:'Adjustments',sub:'Manual stock corrections',   act:'New Adjustment'},
  sales:      {title:'Sales',      sub:'Manage all transactions',    act:'New Sale'},
  purchases:  {title:'Purchases',  sub:'Purchase orders',            act:'New PO'},
  'sales-returns':   {title:'Sales Returns',    sub:'Customer returns & refunds', act:'New Return'},
  'purchase-returns': {title:'Purchase Returns', sub:'Returns to suppliers',       act:'New Return'},
  customers:  {title:'Customers',  sub:'5 registered customers',     act:'Add Customer'},
  suppliers:  {title:'Suppliers',  sub:'6 registered suppliers',     act:'Add Supplier'},
  reports:    {title:'Reports',    sub:'Analytics overview',         act:'Download'},
  analytics:  {title:'Analytics',  sub:'Performance insights',       act:'Export'},
  invoices:   {title:'Invoices',   sub:'All issued invoices',        act:'New Invoice'},
  settings:   {title:'Settings',   sub:'System preferences',         act:null},
};

function navigate(page) {
  document.querySelectorAll('.page-section').forEach(s=>s.classList.remove('active'));
  document.getElementById('page-'+page).classList.add('active');
  document.querySelectorAll('.nav-item[data-page],.settings-nav[data-page]').forEach(n=>{
    n.classList.toggle('active',n.dataset.page===page);
  });
  const cfg=pageCfg[page]||{title:page,sub:'',act:null};
  document.getElementById('topbar-title').textContent=cfg.title;
  document.getElementById('topbar-sub').textContent=cfg.sub;
  const btn=document.getElementById('topActionBtn');
  if(cfg.act){btn.style.display='';btn.childNodes[1]&&(btn.childNodes[1].textContent=' '+cfg.act);}
  else btn.style.display='none';
  window.scrollTo(0,0);
  /* Refresh Purchase & Sell Report when navigating to it */
  if (page === 'Purchase and Sell Report' && typeof loadSalesPurchaseReport === 'function') {
    loadSalesPurchaseReport();
  }
}
document.querySelectorAll('.nav-item[data-page]').forEach(n=>n.addEventListener('click',()=>navigate(n.dataset.page)));

/* ── CHART ENGINE ── */
let chartView='monthly';
const hiddenSeries = new Set();

function toggleSeries(key) {
  hiddenSeries.has(key) ? hiddenSeries.delete(key) : hiddenSeries.add(key);
  document.querySelectorAll('.legend-item').forEach(el => {
    el.classList.toggle('dimmed', hiddenSeries.has(el.dataset.series));
  });
  renderRevenueChart();
}

function setChartView(v){
  chartView=v;
  document.getElementById('chartMonthly').classList.toggle('active',v==='monthly');
  document.getElementById('chartWeekly').classList.toggle('active',v==='weekly');
  // show/hide legend items for series only relevant in monthly
  document.querySelectorAll('.legend-item[data-series="purchases"], .legend-item[data-series="profit"]').forEach(el=>{
    el.style.display = v==='monthly' ? '' : 'none';
  });
  renderRevenueChart();
}

function renderRevenueChart(){
  const wrap = document.getElementById('revenueChartWrap');
  const svgEl = document.getElementById('revenueChartSvg');
  const tooltip = document.getElementById('chartTooltip');
  const W = wrap.clientWidth || 560;
  const H = 240;
  const padL=46, padR=16, padT=14, padB=28;
  const chartW = W - padL - padR;
  const chartH = H - padT - padB;

  svgEl.setAttribute('width', W);
  svgEl.setAttribute('height', H);
  svgEl.setAttribute('viewBox', `0 0 ${W} ${H}`);

  const isMonthly = chartView === 'monthly';
  const data = isMonthly ? salesData : weeklyData;
  const labelKey = isMonthly ? 'month' : 'day';

  const seriesCfg = isMonthly ? [
    {key:'sales',    color:'#3caf82', label:'Sales'},
    {key:'purchases',color:'#4a85e8', label:'Purchases'},
    {key:'profit',   color:'#f5a623', label:'Profit'},
  ] : [
    {key:'sales', color:'#3caf82', label:'Sales'},
  ];

  const activeSeries = seriesCfg.filter(s => !hiddenSeries.has(s.key));

  // compute y scale
  let maxVal = 0;
  activeSeries.forEach(s => { data.forEach(d => { if(d[s.key] > maxVal) maxVal = d[s.key]; }); });
  if(maxVal === 0) maxVal = 1;
  maxVal = Math.ceil(maxVal / 10000) * 10000;

  const xScale = (i) => padL + (i / (data.length - 1)) * chartW;
  const yScale = (v) => padT + chartH - (v / maxVal) * chartH;

  // build SVG
  let defs = `<defs>`;
  activeSeries.forEach(s => {
    defs += `
      <linearGradient id="grad_${s.key}" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%"   stop-color="${s.color}" stop-opacity="0.18"/>
        <stop offset="100%" stop-color="${s.color}" stop-opacity="0.01"/>
      </linearGradient>`;
  });
  defs += `</defs>`;

  // grid lines + y labels
  const ticks = 5;
  let grid = '';
  for(let i=0;i<=ticks;i++){
    const v = (maxVal/ticks)*i;
    const y = yScale(v);
    const label = v>=1000 ? `৳${(v/1000).toFixed(0)}k` : `৳${v}`;
    grid += `<line x1="${padL}" y1="${y}" x2="${W-padR}" y2="${y}" stroke="rgba(196,227,216,0.5)" stroke-width="1" stroke-dasharray="3,3"/>`;
    grid += `<text x="${padL-6}" y="${y+4}" text-anchor="end" font-size="9.5" fill="#a8c5b8" font-family="JetBrains Mono,monospace">${label}</text>`;
  }

  // x labels
  let xlabels = '';
  data.forEach((d,i)=>{
    const x = xScale(i);
    const showEvery = isMonthly ? 1 : 1;
    if(i % showEvery === 0)
      xlabels += `<text x="${x}" y="${H-6}" text-anchor="middle" font-size="9.5" fill="#a8c5b8" font-family="DM Sans,sans-serif">${d[labelKey]}</text>`;
  });

  // area + line paths
  let paths = '';
  activeSeries.forEach(s => {
    const pts = data.map((d,i) => [xScale(i), yScale(d[s.key])]);

    // smooth cubic bezier path
    const curve = (points) => {
      if(points.length < 2) return '';
      let d = `M ${points[0][0]},${points[0][1]}`;
      for(let i=0;i<points.length-1;i++){
        const x0=points[i][0], y0=points[i][1];
        const x1=points[i+1][0], y1=points[i+1][1];
        const cpx = (x0+x1)/2;
        d += ` C ${cpx},${y0} ${cpx},${y1} ${x1},${y1}`;
      }
      return d;
    };

    const linePath = curve(pts);
    const bottom = padT + chartH;
    const areaPath = linePath + ` L ${pts[pts.length-1][0]},${bottom} L ${pts[0][0]},${bottom} Z`;

    paths += `<path d="${areaPath}" fill="url(#grad_${s.key})" class="chart-area-fill" style="animation:fadeUp .5s ease both"/>`;
    paths += `<path d="${linePath}" fill="none" stroke="${s.color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="chart-line" style="stroke-dasharray:1000;stroke-dashoffset:1000;animation:drawLine .9s ease forwards"/>`;
  });

  // hover dots (invisible, shown on hover)
  let dots = '';
  if(isMonthly) {
    activeSeries.forEach(s => {
      data.forEach((d,i) => {
        const x = xScale(i), y = yScale(d[s.key]);
        dots += `<circle cx="${x}" cy="${y}" r="4" fill="${s.color}" stroke="white" stroke-width="2" opacity="0" class="chart-dot" data-i="${i}" data-key="${s.key}"/>`;
      });
    });
  }

  // crosshair (vertical line shown on hover)
  const crosshair = `<line id="crosshairLine" x1="0" y1="${padT}" x2="0" y2="${padT+chartH}" stroke="var(--border)" stroke-width="1" stroke-dasharray="4,3" opacity="0" class="crosshair-line"/>`;
  // hover area
  const hoverArea = `<rect id="chartHoverRect" x="${padL}" y="${padT}" width="${chartW}" height="${chartH}" fill="transparent" style="cursor:crosshair"/>`;

  svgEl.innerHTML = `${defs}${grid}${xlabels}${paths}${dots}${crosshair}${hoverArea}`;

  // add line draw animation via CSS
  if(!document.getElementById('chartLineAnim')) {
    const st = document.createElement('style');
    st.id = 'chartLineAnim';
    st.textContent = `@keyframes drawLine { to { stroke-dashoffset:0; } }`;
    document.head.appendChild(st);
  }

  // interactive hover
  const hoverRect = document.getElementById('chartHoverRect');
  const crossLine = document.getElementById('crosshairLine');

  hoverRect.addEventListener('mousemove', (e) => {
    const rect = svgEl.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const relX = mx - padL;
    const idx = Math.round((relX / chartW) * (data.length - 1));
    const ci = Math.max(0, Math.min(data.length-1, idx));
    const x = xScale(ci);

    // crosshair
    crossLine.setAttribute('x1', x);
    crossLine.setAttribute('x2', x);
    crossLine.setAttribute('opacity', '1');

    // dots
    svgEl.querySelectorAll('.chart-dot').forEach(dot => {
      dot.setAttribute('opacity', parseInt(dot.dataset.i)===ci ? '1' : '0');
    });

    // tooltip
    const d = data[ci];
    let html = `<div class="tt-label">${d[labelKey]}</div>`;
    activeSeries.forEach(s => {
      html += `<div class="tt-row"><div class="tt-dot" style="background:${s.color}"></div><span class="tt-name">${s.label}</span><span class="tt-val">৳${(d[s.key]||0).toLocaleString()}</span></div>`;
    });
    tooltip.innerHTML = html;
    tooltip.classList.add('visible');

    // position tooltip
    const tipW = 160;
    const wrapRect = wrap.getBoundingClientRect();
    let left = e.clientX - wrapRect.left + 12;
    if(left + tipW > wrapRect.width) left = e.clientX - wrapRect.left - tipW - 12;
    tooltip.style.left = left + 'px';
    tooltip.style.top  = (e.clientY - wrapRect.top - 20) + 'px';
  });

  hoverRect.addEventListener('mouseleave', () => {
    crossLine.setAttribute('opacity','0');
    svgEl.querySelectorAll('.chart-dot').forEach(d=>d.setAttribute('opacity','0'));
    tooltip.classList.remove('visible');
  });
}

function renderDonut(){
  const svgEl=document.getElementById('donutSvg');
  const legend=document.getElementById('donutLegend');
  const cx=65,cy=65,outerR=52,innerR=34,gap=2.5;
  const total=categoryData.reduce((a,d)=>a+d.value,0);
  let angle=-Math.PI/2, paths='';

  categoryData.forEach((d,idx)=>{
    const slice=(d.value/total)*2*Math.PI - (gap*Math.PI/180);
    const x1=cx+outerR*Math.cos(angle), y1=cy+outerR*Math.sin(angle);
    const x2=cx+outerR*Math.cos(angle+slice), y2=cy+outerR*Math.sin(angle+slice);
    const xi1=cx+innerR*Math.cos(angle+slice), yi1=cy+innerR*Math.sin(angle+slice);
    const xi2=cx+innerR*Math.cos(angle), yi2=cy+innerR*Math.sin(angle);
    const lg=slice>Math.PI?1:0;
    paths+=`<path class="donut-segment" d="M${x1},${y1} A${outerR},${outerR} 0 ${lg} 1 ${x2},${y2} L${xi1},${yi1} A${innerR},${innerR} 0 ${lg} 0 ${xi2},${yi2} Z" fill="${d.color}" opacity=".9" style="animation:scaleIn .4s ease ${idx*0.07}s both"/>`;
    angle+=slice+(gap*Math.PI/180);
  });
  svgEl.innerHTML=paths;

  legend.innerHTML=categoryData.map(d=>`
    <div class="donut-row">
      <div style="display:flex;align-items:center;gap:5px">
        <div class="donut-dot" style="background:${d.color}"></div>
        <span style="font-size:10.5px;color:var(--text-mid)">${d.name}</span>
      </div>
      <span style="font-size:10.5px;font-weight:700;font-family:'JetBrains Mono',monospace">${d.value}%</span>
    </div>`).join('');
}

/* ── PAGE LOAD ORCHESTRATION ── */
function runPageLoadAnimations() {
  // Sidebar slides in from left
  const sidebar = document.getElementById('sidebar');
  sidebar.style.cssText = 'opacity:0;transform:translateX(-16px)';
  setTimeout(()=>{
    sidebar.style.transition='opacity .45s ease, transform .45s cubic-bezier(.4,0,.2,1)';
    sidebar.style.opacity='1'; sidebar.style.transform='';
  }, 60);

  // Topbar fades in
  const topbar = document.querySelector('.topbar');
  topbar.style.cssText = 'opacity:0;transform:translateY(-10px)';
  setTimeout(()=>{
    topbar.style.transition='opacity .4s ease, transform .4s ease';
    topbar.style.opacity='1'; topbar.style.transform='';
  }, 150);

  // Alert banner
  const banner = document.querySelector('.alert-banner');
  if(banner){ banner.style.cssText='opacity:0;transform:translateY(-8px)'; setTimeout(()=>{ banner.style.transition='opacity .35s ease, transform .35s ease'; banner.style.opacity='1'; banner.style.transform=''; }, 280); }

  // Stat cards stagger
  document.querySelectorAll('#page-dashboard .stat-card').forEach((card, i) => {
    card.style.cssText='opacity:0;transform:translateY(18px)';
    setTimeout(()=>{
      card.style.transition='opacity .4s ease, transform .4s cubic-bezier(.34,1.1,.64,1), box-shadow .25s';
      card.style.opacity='1'; card.style.transform='';
    }, 340 + i*70);
  });

  // Stat values count-up
  setTimeout(()=>{
    document.querySelectorAll('.stat-val').forEach(el => {
      el.style.cssText='opacity:0;transform:translateY(8px)';
      setTimeout(()=>{
        el.style.transition='opacity .4s ease, transform .4s ease';
        el.style.opacity='1'; el.style.transform='';
      }, 100);
    });
  }, 500);

  // Chart cards slide in
  const charts = document.querySelectorAll('#page-dashboard .dash-charts .card');
  charts.forEach((card, i) => {
    card.style.cssText='opacity:0;transform:translateY(20px)';
    setTimeout(()=>{
      card.style.transition='opacity .45s ease, transform .45s cubic-bezier(.34,1.1,.64,1), box-shadow .25s';
      card.style.opacity='1'; card.style.transform='';
    }, 640 + i*80);
  });

  // Bottom panels
  document.querySelectorAll('#page-dashboard .dash-panels .card').forEach((card,i)=>{
    card.style.cssText='opacity:0;transform:translateY(20px)';
    setTimeout(()=>{
      card.style.transition='opacity .45s ease, transform .45s cubic-bezier(.34,1.1,.64,1), box-shadow .25s';
      card.style.opacity='1'; card.style.transform='';
    }, 820 + i*80);
  });
}


/* ── RENDER FUNCTIONS ── */
function renderRecentSales(){
  document.getElementById('recentSalesTbody').innerHTML=recentSales.map(s=>`<tr style="cursor:pointer" onclick="viewInvoice(recentSales.find(x=>x.id==='${s.id}'))">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${s.id}</span></td>
    <td><div style="display:flex;align-items:center;gap:7px">
      <div style="width:24px;height:24px;border-radius:50%;background:var(--mango-bg);border:1px solid rgba(245,166,35,.25);display:flex;align-items:center;justify-content:center;font-size:10px;font-weight:700;color:var(--mango-dk);flex-shrink:0">${s.customer[0]}</div>
      <span>${s.customer}</span></div></td>
    <td><div style="font-size:11.5px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.itemSummary||''}"><span class="mono" style="color:var(--text-soft)">${s.items}</span> · ${s.itemSummary||'—'}</div></td>
    <td><span class="mono" style="font-weight:700">৳${fmt(s.total)}</span></td>
    <td><span style="font-size:11.5px;${paymentColor(s.payment)}">${s.payment}</span></td>
    <td>${statusBadge(s.status)}</td>
    <td><span class="mono" style="font-size:10.5px;color:var(--text-faint)">${s.date}</span></td>
  </tr>`).join('');
}

function renderStockAlerts(){
  const low=products.filter(p=>p.stock<=p.minStock);
  document.getElementById('stockAlerts').innerHTML=low.map(p=>{
    const pct=p.stock===0?0:Math.min(100,(p.stock/p.minStock)*100);
    const sc=p.stock===0?'var(--red)':'var(--mango-dk)';
    return `<div class="alert-item">
      <div class="alert-row">
        <div class="alert-prod-icon">${svgIcon(p.iconSvg,14)}</div>
        <div style="flex:1;min-width:0"><div class="alert-pname">${p.name}</div><div class="alert-pcat">${p.category}</div></div>
        <div style="text-align:right"><div class="alert-qty" style="color:${sc}">${p.stock}</div><div class="alert-min">/ ${p.minStock} min</div></div>
      </div>
      <div class="sbar" style="width:100%"><div class="sfill ${p.stock===0?'sr':'sm'}" style="width:${pct}%"></div></div>
    </div>`;
  }).join('');
}

let pCatFilter='All', pStatFilter='All';
function renderCatPills(){
  const cats=['All',...new Set(products.map(p=>p.category))];
  document.getElementById('catPills').innerHTML=cats.map(c=>`<div class="pill ${c===pCatFilter?'active':''}" onclick="setCatF('${c}',this)">${c}</div>`).join('');
}
function setCatF(cat,el){
  pCatFilter=cat;
  el.closest('.pill-bar').querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderProducts();
}
function renderProducts(){
  const q=document.getElementById('productSearch').value.toLowerCase();
  const filt=products.filter(p=>{
    return (p.name.toLowerCase().includes(q)||p.sku.toLowerCase().includes(q))
      &&(pCatFilter==='All'||p.category===pCatFilter)
      &&(pStatFilter==='All'||p.status===pStatFilter);
  });
  document.getElementById('productsSubtitle').textContent=`${filt.length} of ${products.length} products`;
  document.getElementById('productsPagInfo').textContent=`Showing ${filt.length} of ${products.length}`;
  document.getElementById('productsTbody').innerHTML=filt.map((p,i)=>{
    const pct=p.stock===0?0:Math.min(100,(p.stock/p.minStock)*100);
    return `<tr style="animation:fadeUp .3s ease ${i*35}ms both">
      <td><div class="prod-cell">
        <div class="prod-thumb">${svgIcon(p.iconSvg,15)}</div>
        <div><div class="prod-name">${p.name}</div><div class="prod-meta">${p.supplier}</div></div>
      </div></td>
      <td><span class="mono" style="font-size:11px;color:var(--text-soft)">${p.sku}</span></td>
      <td style="font-size:12px;color:var(--text-soft)">${p.category}</td>
      <td><div class="sbar-wrap"><span class="mono" style="font-size:12.5px;font-weight:700;color:${snColor(p.stock,p.minStock)}">${p.stock}</span><div style="display:flex;align-items:center;gap:3px"><div class="sbar"><div class="sfill ${sfClass(p.stock,p.minStock)}" style="width:${pct}%"></div></div><span style="font-size:9px;color:var(--text-faint)">/${p.minStock}</span></div></div></td>
      <td><span class="mono" style="font-weight:700">৳${p.price.toFixed(2)}</span></td>
      <td><span class="mono" style="color:var(--text-soft)">৳${p.cost.toFixed(2)}</span></td>
      <td>${statusBadge(p.status)}</td>
      <td><div class="act-group">
        <button class="act-btn" title="View" onclick="_prodAction('view','${p.id}')">${svgIcon(eyeSvg,12)}</button>
        <button class="act-btn edit" title="Edit" onclick="_prodAction('edit','${p.id}')">${svgIcon(editSvg,12)}</button>
        <button class="act-btn danger" title="Delete" onclick="_prodAction('delete','${p.id}')">${svgIcon(trashSvg,12)}</button>
      </div></td>
    </tr>`;
  }).join('');
}
document.getElementById('productSearch').addEventListener('input',renderProducts);
document.getElementById('statusFilter').addEventListener('change',e=>{pStatFilter=e.target.value;renderProducts();});

function renderCategories(){
  const cats={};
  products.forEach(p=>{
    if(!cats[p.category])cats[p.category]={count:0,stock:0,prices:[]};
    cats[p.category].count++;cats[p.category].stock+=p.stock;cats[p.category].prices.push(p.price);
  });
  document.getElementById('categoriesTbody').innerHTML=Object.entries(cats).map(([cat,d])=>`<tr>
    <td><div class="prod-cell">
      <div class="prod-thumb">${svgIcon('<path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"/><line x1="7" y1="7" x2="7.01" y2="7"/>',14)}</div>
      <span style="font-weight:600">${cat}</span>
    </div></td>
    <td class="mono">${d.count}</td>
    <td class="mono">${d.stock.toLocaleString()}</td>
    <td class="mono">৳${(d.prices.reduce((a,b)=>a+b,0)/d.prices.length).toFixed(2)}</td>
    <td><div class="act-group" style="opacity:1">${svgIcon(editSvg,12)} ${svgIcon(trashSvg,12)}</div></td>
  </tr>`).join('');
}

let salesFilter='All';
function filterSales(s,el){
  salesFilter=s;
  el.closest('.pill-bar').querySelectorAll('.pill').forEach(p=>p.classList.remove('active'));
  el.classList.add('active');
  renderSalesTable();
}
function renderSalesTable(){
  const q=document.getElementById('salesSearch').value.toLowerCase();
  const filt=recentSales.filter(s=>(s.customer.toLowerCase().includes(q)||s.id.toLowerCase().includes(q))&&(salesFilter==='All'||s.status===salesFilter));
  document.getElementById('salesTbody').innerHTML=filt.map((s,i)=>`<tr style="animation:fadeUp .3s ease ${i*45}ms both">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${s.id}</span></td>
    <td><div style="display:flex;align-items:center;gap:7px">
      <div style="width:26px;height:26px;border-radius:50%;background:var(--mango-bg);border:1px solid rgba(245,166,35,.25);display:flex;align-items:center;justify-content:center;font-size:10.5px;font-weight:700;color:var(--mango-dk);flex-shrink:0">${s.customer[0]}</div>${s.customer}</div></td>
    <td><div style="font-size:11.5px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${s.itemSummary||''}"><span class="mono" style="color:var(--text-soft)">${s.items}</span> · ${s.itemSummary||'—'}</div></td>
    <td><span class="mono" style="font-weight:700">৳${fmt(s.total)}</span></td>
    <td><span style="font-size:11.5px;${paymentColor(s.payment)}">${s.payment}</span></td>
    <td>${statusBadge(s.status)}</td>
    <td><span class="mono" style="font-size:10.5px;color:var(--text-faint)">${s.date}</span></td>
    <td><div class="act-group">
      <button class="act-btn" title="View" onclick="viewInvoice(recentSales.find(x=>x.id==='${s.id}'))">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn" title="Print" onclick="printSale(recentSales.find(x=>x.id==='${s.id}'))">${svgIcon(printSvg,12)}</button>
      <button class="act-btn danger" title="Return" onclick="toast('Return initiated for ${s.id}','info')">${svgIcon(rotateSvg,12)}</button>
    </div></td>
  </tr>`).join('');
}
document.getElementById('salesSearch').addEventListener('input',renderSalesTable);
document.getElementById('purchasesSearch')?.addEventListener('input',renderPurchases);

let _purchaseStatusFilter = 'All';

function filterPurchases(status, el) {
  _purchaseStatusFilter = status;
  document.querySelectorAll('#page-purchases .pill').forEach(p => p.classList.remove('active'));
  if (el) el.classList.add('active');
  renderPurchases();
}

function renderPurchases(){
  const search = (document.getElementById('purchasesSearch')?.value || '').toLowerCase();
  const filtered = purchases.filter(po => {
    const matchStatus = _purchaseStatusFilter === 'All' || po.status === _purchaseStatusFilter;
    const matchSearch = !search ||
      po.id.toLowerCase().includes(search) ||
      po.supplier.toLowerCase().includes(search) ||
      (po.itemSummary || '').toLowerCase().includes(search);
    return matchStatus && matchSearch;
  });

  if (filtered.length === 0) {
    document.getElementById('purchasesTbody').innerHTML =
      `<tr><td colspan="8" style="text-align:center;color:var(--text-soft);padding:24px">No purchase orders found.</td></tr>`;
    return;
  }

  document.getElementById('purchasesTbody').innerHTML=filtered.map((po,i)=>`<tr style="animation:fadeUp .3s ease ${i*55}ms both">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${po.id}</span></td>
    <td style="font-weight:600">${po.supplier}</td>
    <td><div style="font-size:11.5px;max-width:200px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap" title="${po.itemSummary||''}"><span class="mono" style="color:var(--text-soft)">${po.items}</span> · ${po.itemSummary||'—'}</div></td>
    <td><span class="mono" style="font-weight:700">৳${po.total.toLocaleString()}</span></td>
    <td>${statusBadge(po.status)}</td>
    <td><span class="mono" style="font-size:11.5px;color:var(--text-soft)">${po.date}</span></td>
    <td><span class="mono" style="font-size:11.5px;${po.status==='Overdue'?'color:var(--red);font-weight:700':'color:var(--text-soft)'}">${po.dueDate}</span></td>
    <td><div class="act-group">
      <button class="act-btn" title="View" onclick="_poAction('view',purchases.indexOf(po))">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn" title="Print" onclick="_poAction('print',purchases.indexOf(po))">${svgIcon(printSvg,12)}</button>
      <button class="act-btn ok" title="Update status" onclick="_poAction('confirm',purchases.indexOf(po))">${svgIcon(checkSvg,12)}</button>
    </div></td>
  </tr>`).join('');
}

function renderCustomers(filter=''){
  const filt=customers.filter(c=>c.name.toLowerCase().includes(filter.toLowerCase())||c.phone.includes(filter));
  document.getElementById('customersSubtitle').textContent=`${filt.length} registered customers`;
  document.getElementById('customerGrid').innerHTML=filt.map((c,i)=>`
    <div class="customer-card fade-up" style="animation-delay:${i*55}ms;cursor:pointer" onclick="_custAction(${i})">
      <div style="display:flex;align-items:flex-start;justify-content:space-between;margin-bottom:12px">
        <div style="display:flex;align-items:center;gap:9px">
          <div class="cust-avatar">${c.name[0]}</div>
          <div><div style="font-size:13px;font-weight:700">${c.name}</div><div class="mono" style="font-size:9.5px;color:var(--text-faint)">${c.id}</div></div>
        </div>
        ${statusBadge(c.status)}
      </div>
      <div style="margin-bottom:12px">
        <div class="cust-info-row"><span class="icon">${svgIcon(phoneSvg,12)}</span>${c.phone}</div>
        <div class="cust-info-row"><span class="icon">${svgIcon(mailSvg,12)}</span>${c.email}</div>
      </div>
      <div class="cust-stat-grid">
        <div><div class="cust-stat-lbl">Purchases</div><div class="cust-stat-val">${c.totalPurchases}</div></div>
        <div><div class="cust-stat-lbl">Spent</div><div class="cust-stat-val" style="font-size:12px;color:var(--mint)">৳${c.totalSpent.toLocaleString()}</div></div>
        <div><div class="cust-stat-lbl">Due</div><div class="cust-stat-val" style="font-size:12px;${c.outstanding?'color:var(--red)':'color:var(--text-soft)'}">৳${c.outstanding}</div></div>
      </div>
    </div>`).join('');
}
document.getElementById('customerSearch').addEventListener('input',e=>renderCustomers(e.target.value));

function renderSuppliers(){
  document.getElementById('suppliersTbody').innerHTML=suppliersData.map((s,i)=>`<tr style="animation:fadeUp .3s ease ${i*45}ms both">
    <td><div><div style="font-weight:600">${s.name}</div><div class="mono" style="font-size:9.5px;color:var(--text-faint)">${s.id}</div></div></td>
    <td><span class="badge b-blue">${s.category}</span></td>
    <td style="font-size:12px;color:var(--text-soft)">${s.contact}</td>
    <td><span class="mono" style="font-weight:700">৳${s.totalPurchases.toLocaleString()}</span></td>
    <td><span class="mono" style="${s.outstanding?'color:var(--red);font-weight:700':'color:var(--text-soft)'}">৳${s.outstanding.toLocaleString()}</span></td>
    <td>${statusBadge(s.status)}</td>
    <td><div class="act-group" style="opacity:1">
      <button class="act-btn" title="View" onclick="_suppAction('view',${i})">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn edit" title="Edit" onclick="_suppAction('edit',${i})">${svgIcon(editSvg,12)}</button>
    </div></td>
  </tr>`).join('');
}

function renderInvoices(){
  document.getElementById('invoicesTbody').innerHTML=recentSales.map((s,i)=>`<tr style="animation:fadeUp .3s ease ${i*45}ms both">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${s.id}</span></td>
    <td>${s.customer}<div style="font-size:10.5px;color:var(--text-faint);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;max-width:140px" title="${s.itemSummary||''}">${s.itemSummary||'—'}</div></td>
    <td><span class="mono" style="font-size:11.5px;color:var(--text-soft)">${s.date.split(' ')[0]}</span></td>
    <td><span class="mono" style="font-weight:700">৳${fmt(s.total)}</span></td>
    <td><span style="font-size:11.5px;${paymentColor(s.payment)}">${s.payment}</span></td>
    <td>${statusBadge(s.status)}</td>
    <td><div class="act-group" style="opacity:1">
      <button class="act-btn" title="View" onclick="viewInvoice(recentSales.find(x=>x.id==='${s.id}'))">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn" title="Print" onclick="printSale(recentSales.find(x=>x.id==='${s.id}'))">${svgIcon(printSvg,12)}</button>
    </div></td>
  </tr>`).join('');
}

function renderReports(){
  const sm=[82,65,91,74,110,58,43];
  const days=['Mon','Tue','Wed','Thu','Fri','Sat','Sun'];
  const mxS=Math.max(...sm);
  document.getElementById('stockMovChart').innerHTML=sm.map((v,i)=>`<div class="bar-col"><div class="bseg bs-sales" style="height:${Math.round((v/mxS)*95)}px"></div><div class="bar-lbl">${days[i]}</div></div>`).join('');
  const mxC=Math.max(...categoryData.map(d=>d.value));
  document.getElementById('revCatChart').innerHTML=categoryData.map(d=>`<div class="bar-col"><div class="bseg" style="height:${Math.round((d.value/mxC)*95)}px;background:${d.color};border-radius:4px 4px 0 0"></div><div class="bar-lbl">${d.name.split(' ')[0]}</div></div>`).join('');
  const top=[...products].sort((a,b)=>(b.stock*b.price)-(a.stock*a.price)).slice(0,5);
  const mxV=top[0].stock*top[0].price;
  document.getElementById('topProdsReport').innerHTML=top.map(p=>`<div class="top-row">
    <div class="top-icon-box">${svgIcon(p.iconSvg,13)}</div>
    <div style="flex:1;min-width:0"><div style="font-size:12px;font-weight:600;margin-bottom:4px">${p.name}</div><div class="top-bar"><div class="top-fill" style="width:${((p.stock*p.price)/mxV)*100}%"></div></div></div>
    <div class="top-val">৳${(p.stock*p.price).toFixed(0)}</div>
  </div>`).join('');
}


function renderSalesReturns(){
  const tbody = document.getElementById('salesReturnsTbody');
  if(!tbody) return;
  const s_icon = '<polyline points="20 6 9 17 4 12"/>';
  const c_icon = '<circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>';
  tbody.innerHTML = salesReturns.map((r,i) => `<tr style="animation:fadeUp .3s ease ${i*45}ms both">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${r.id}</span></td>
    <td><span class="mono" style="color:var(--text-soft);font-size:11.5px">${r.invoiceId}</span></td>
    <td>${r.customer}</td>
    <td style="font-size:12.5px">${r.product}</td>
    <td class="mono">${r.qty}</td>
    <td><span class="mono" style="font-weight:700;color:var(--red)">৳${r.refundAmt.toFixed(2)}</span></td>
    <td style="font-size:12px;color:var(--text-soft)">${r.reason}</td>
    <td>${statusBadge(r.status)}</td>
    <td><div class="act-group">
      <button class="act-btn" title="View" onclick="viewSalesReturn(salesReturns[${i}])">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn" title="Print" onclick="printSalesReturn(salesReturns[${i}])">${svgIcon(printSvg,12)}</button>
    </div></td>
  </tr>`).join('');
  // update stat counters
  const pending   = salesReturns.filter(r=>r.status==='Pending').length;
  const processed = salesReturns.filter(r=>r.status==='Processed').length;
  const tc = document.getElementById('sr-total-count');
  const pc = document.getElementById('sr-pending-count');
  const rc = document.getElementById('sr-processed-count');
  if(tc) tc.textContent = salesReturns.length;
  if(pc) pc.textContent = pending;
  if(rc) rc.textContent = processed;
}

function renderPurchaseReturns(){
  const tbody = document.getElementById('purchaseReturnsTbody');
  if(!tbody) return;
  tbody.innerHTML = purchaseReturns.map((r,i) => `<tr style="animation:fadeUp .3s ease ${i*45}ms both">
    <td><span class="mono" style="color:var(--mint);font-size:11.5px">${r.id}</span></td>
    <td><span class="mono" style="color:var(--text-soft);font-size:11.5px">${r.poId}</span></td>
    <td style="font-weight:600">${r.supplier}</td>
    <td style="font-size:12.5px">${r.product}</td>
    <td class="mono">${r.qty}</td>
    <td><span class="mono" style="font-weight:700;color:var(--red)">৳${r.creditAmt.toFixed(2)}</span></td>
    <td style="font-size:12px;color:var(--text-soft)">${r.reason}</td>
    <td>${statusBadge(r.status)}</td>
    <td><div class="act-group">
      <button class="act-btn" title="View" onclick="viewPurchaseReturn(purchaseReturns[${i}])">${svgIcon(eyeSvg,12)}</button>
      <button class="act-btn" title="Print" onclick="printPurchaseReturn(purchaseReturns[${i}])">${svgIcon(printSvg,12)}</button>
    </div></td>
  </tr>`).join('');
  const pending  = purchaseReturns.filter(r=>r.status==='Pending').length;
  const approved = purchaseReturns.filter(r=>r.status==='Approved').length;
  const tc = document.getElementById('pr-total-count');
  const pc = document.getElementById('pr-pending-count');
  const ac = document.getElementById('pr-approved-count');
  if(tc) tc.textContent = purchaseReturns.length;
  if(pc) pc.textContent = pending;
  if(ac) ac.textContent = approved;
}
function renderAnalytics(){
  const mxM=Math.max(...salesData.map(d=>d.sales));
  document.getElementById('analyticsMonthlySales').innerHTML=salesData.map(d=>`<div class="bar-col"><div class="bseg bs-sales" style="height:${Math.round((d.sales/mxM)*95)}px"></div><div class="bar-lbl">${d.month}</div></div>`).join('');
  const mxW=Math.max(...weeklyData.map(d=>d.sales));
  document.getElementById('analyticsWeekly').innerHTML=weeklyData.map(d=>`<div class="bar-col"><div class="bseg bs-profit" style="height:${Math.round((d.sales/mxW)*95)}px"></div><div class="bar-lbl">${d.day}</div></div>`).join('');
}

/* ── MODAL ── */
function openModal(){document.getElementById('modalOverlay').classList.add('open');}
function closeModal(){document.getElementById('modalOverlay').classList.remove('open');}
function submitProduct(e){e.preventDefault();closeModal();}
document.getElementById('modalOverlay').addEventListener('click',e=>{if(e.target===e.currentTarget)closeModal();});
document.getElementById('topActionBtn').addEventListener('click',openModal);

/* ── GLOBAL SEARCH ── */
document.getElementById('globalSearch').addEventListener('input',e=>{
  if(e.target.value.length>1){navigate('products');document.getElementById('productSearch').value=e.target.value;renderProducts();}
});

/* ── FINANCIAL SUMMARY — NET CARD ── */
function renderFinancialSummary() {
  // Parse the placeholder values from the DOM (backend will populate these ids)
  const parse = id => {
    const el = document.getElementById(id);
    if (!el) return 0;
    const raw = el.textContent.replace(/[৳,\s]/g, '');
    return parseFloat(raw) || 0;
  };

  const totalSales  = parse('fin-total-sales');
  const invoiceDue  = parse('fin-invoice-due');
  const expense     = parse('fin-expense');
  const net         = totalSales - invoiceDue - expense;

  const netValEl      = document.getElementById('fin-net-val');
  const netIconBox    = document.getElementById('fin-net-icon-box');
  const netIcon       = document.getElementById('fin-net-icon');
  const netAccent     = document.getElementById('fin-net-accent');

  if (!netValEl) return;

  const isPositive = net >= 0;
  const color      = isPositive ? 'var(--mint)' : 'var(--red)';
  const bgColor    = isPositive ? 'rgba(60,175,130,0.12)' : 'rgba(229,83,83,0.12)';

  // Format with ৳ sign and 2 decimal places
  const sign = isPositive ? '' : '-';
  netValEl.textContent = `${sign}৳${Math.abs(net).toLocaleString('en-IN', {minimumFractionDigits:2})}`;
  netValEl.style.color = color;
  netIconBox.style.background = bgColor;
  netAccent.style.background  = `linear-gradient(90deg,transparent,${color},transparent)`;

  // Swap icon: trending-up for positive, trending-down for negative
  if (isPositive) {
    netIcon.setAttribute('stroke', 'var(--mint)');
    netIcon.innerHTML = '<polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/>';
  } else {
    netIcon.setAttribute('stroke', 'var(--red)');
    netIcon.innerHTML = '<polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/>';
  }
}

/* ── INIT ── */
// Remove CSS fade-up from dashboard cards so JS handles them
document.querySelectorAll('#page-dashboard .fade-up').forEach(el=>el.classList.remove('fade-up'));

renderRecentSales(); renderStockAlerts();
renderProducts(); renderCatPills(); renderCategories(); renderSalesTable();
renderPurchases(); renderCustomers(); renderSuppliers(); renderInvoices();
renderSalesReturns(); renderPurchaseReturns();
renderReports(); renderAnalytics();
renderFinancialSummary();

// Charts render after layout is ready
requestAnimationFrame(()=>{
  renderRevenueChart();
  renderDonut();
  runPageLoadAnimations();
});

// Re-render chart on resize for responsiveness
let resizeTimer;
window.addEventListener('resize', ()=>{
  clearTimeout(resizeTimer);
  resizeTimer = setTimeout(renderRevenueChart, 120);
});