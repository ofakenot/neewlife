/* newlife.system — Sistema Operacional de Gestão, Estoque e Vendas (v20 - Supabase Username Fixed) */

// CREDENCIAIS OFICIAIS DO SUPABASE
const SUPABASE_URL = 'https://pgqbukhnfameinfrikjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QyguyGPK_owHafXhuOtKgw_0ZGdmPoB';

let supabaseClient = null;
try {
    if (window.supabase) {
        supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    }
} catch (e) {
    console.error('Erro ao inicializar cliente Supabase:', e);
}

// CONSTANTES FIXAS DE INTERFACE (Ícones SVG, Coordenadas e Estados)
const icons = {
    brand: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/></svg>`,
    summary: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>`,
    map: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    users: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 1 0 7.75"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>`,
    orders: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    archive: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="21 8 21 21 3 21 3 8"/><rect x="1" y="3" width="22" height="5"/><line x1="10" y1="12" x2="14" y2="12"/></svg>`,
    catalog: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>`,
    products: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L3 12.5V21h8.5z"/><line x1="16" y1="8" x2="2" y2="22"/><line x1="17.5" y1="15" x2="9" y2="6.5"/></svg>`,
    reports: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>`,
    profile: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`,
    emergency: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    logout: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>`,
    refresh: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>`,
    dollar: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
    warehouse: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 8.35V20a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8.35A2 2 0 0 1 3.26 6.5l8-4.5a2 2 0 0 1 1.48 0l8 4.5A2 2 0 0 1 22 8.35z"/><polyline points="6 18 6 12 10 12 10 18"/><polyline points="14 18 14 12 18 12 18 18"/></svg>`,
    check: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>`,
    undo: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 7v6h6"/><path d="M21 17a9 9 0 0 0-9-9 9 9 0 0 0-6 2.3L3 13"/></svg>`,
    pdf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
    menu: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>`,
    flash: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>`,
    chart: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 3v18h18"/><path d="M18 17V9"/><path d="M13 17V5"/><path d="M8 17v-3"/></svg>`,
    clipboard: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>`,
    motoboy: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1 .4-1 1v7c0 .6.4 1 1 1h2"/><circle cx="7" cy="17" r="2"/><circle cx="17" cy="17" r="2"/><path d="M9 17h6"/></svg>`,
    database: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>`,
    whatsapp: `<svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.652zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981z"/></svg>`,
    camera: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg>`,
    trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`
};

const cityCoordinates = {
    'São Paulo': [-23.5505, -46.6333],
    'Curitiba': [-25.4284, -49.2733],
    'Cotia': [-23.6039, -46.9190],
    'São Luís': [-2.5307, -44.3068],
    'Barueri': [-23.5106, -46.8761],
    'Assunção': [-25.2637, -57.5759]
};

const catalog = [
    ['Retatrutide 60mg', 'New Life'], ['Tirzepatide 120mg', 'New Life'], ['Tirzepatide 60mg', 'New Life'],
    ['GHK-Cu 100mg', 'New Life'], ['GLOW 70mg', 'New Life'], ['KLOW 80mg', 'New Life'],
    ['AOD-9604 5mg', 'New Life'], ['NAD+ 500mg', 'New Life'], ['CJC-1295 + Ipamorelin 10mg', 'New Life'],
    ['Tesamorelin 20mg', 'New Life'], ['MOTS-c 40mg', 'New Life'], ['Semax 10mg', 'New Life'],
    ['Selank 10mg', 'New Life'], ['Epithalon 50mg', 'New Life'], ['SS-31 50mg', 'New Life'], ['CBL-514 20mg', 'New Life'],
    ['Retatrutide 40mg', 'USA Peptides'], ['Tirzepatide 120mg', 'USA Peptides'], ['Tirzepatide 60mg', 'USA Peptides'],
    ['Tirzepatide 30mg', 'USA Peptides'], ['Beauty Stack', 'USA Peptides'], ['GHK-Cu 100mg', 'USA Peptides'],
    ['GLOW Stack', 'USA Peptides'], ['KLOW Stack', 'USA Peptides'], ['SLU-PP-332 10mg', 'USA Peptides'],
    ['AOD-9604 10mg', 'USA Peptides'], ['PT-141 10mg', 'USA Peptides'], ['NAD+ 500mg', 'USA Peptides'],
    ['HGH-FRAG 10mg', 'USA Peptides'], ['BPC-157 10mg + TB-500 10mg', 'USA Peptides'], ['CJC-1295 + Ipamorelin', 'USA Peptides'],
    ['Tesamorelin 10mg', 'USA Peptides'], ['MOTS-c 10mg', 'USA Peptides'], ['Semax 10mg', 'USA Peptides'],
    ['Epithalon 10mg', 'USA Peptides'], ['SS-31 10mg', 'USA Peptides'], ['MT2 10mg', 'USA Peptides'],
    ['ZPtrop 80 — Somatropina 16 UI/VIAL', 'ZPHC'], ['Retatrutida 60mg', 'ZPHC'],
    ['Tirzepatida 15mg — 4 ampolas', 'TG'], ['Tirzepatida 15mg — 4 ampolas', 'TG antiga'],
    ['Lispax 30mg', 'QUIMFA'], ['Retatrutide 40mg', 'SYNEDICA'], ['GLOW GHK-Cu', 'SYNEDICA']
];

const brazilStatesList = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const ibgeCitiesCache = {};

let currentUser = JSON.parse(localStorage.getItem('nl_current_user') || 'null');
let activeTab = 'adminHome';
let sellerActiveTab = 'sales';
let drawerOpen = false;

// CACHE LOCAL ZERADO (CARREGA DADOS EXCLUSIVAMENTE DO SUPABASE)
let dbCache = {
    users: [],
    warehouses: [],
    motoboys: [],
    products: [],
    sales: [],
    orders: [],
    warehouse_inventory: [],
    transfers: []
};

// SINCRONIZAÇÃO TOTAL COM O SUPABASE (CORRIGIDO MAPEAMENTO DE USERNAME)
async function fetchSupabaseData() {
    if (!supabaseClient) return;
    try {
        const [uRes, wRes, mRes, pRes, sRes, oRes, wiRes, tRes] = await Promise.all([
            supabaseClient.from('system_users').select('*'),
            supabaseClient.from('warehouses').select('*'),
            supabaseClient.from('motoboys').select('*'),
            supabaseClient.from('seller_products').select('*'),
            supabaseClient.from('sales').select('*'),
            supabaseClient.from('orders').select('*'),
            supabaseClient.from('warehouse_inventory').select('*'),
            supabaseClient.from('transfers').select('*')
        ]);

        if (uRes.data) {
            dbCache.users = uRes.data.map(u => ({
                ...u,
                user: String(u.username || u.user || '').trim().toLowerCase(), // Mapeia 'username' da coluna do Supabase para 'user' no JS
                password: String(u.password || '').trim(),
                avatarUrl: u.avatar_url || u.avatarUrl,
                warehouseId: u.warehouse_id || u.warehouseId,
                active: u.active !== false
            }));
            console.log('✅ Usuários carregados do Supabase:', dbCache.users);
        }

        if (wRes.data) dbCache.warehouses = wRes.data;
        if (mRes.data) dbCache.motoboys = mRes.data;
        if (pRes.data) dbCache.products = pRes.data.map(p => ({ ...p, sellerId: p.seller_id || p.sellerId }));
        if (sRes.data) dbCache.sales = sRes.data.map(s => ({ ...s, sellerId: s.seller_id || s.sellerId, productId: s.product_id || s.productId, unitPrice: s.unit_price || s.unitPrice, createdAt: s.created_at || s.createdAt }));
        if (oRes.data) dbCache.orders = oRes.data.map(o => ({ ...o, sellerId: o.seller_id || o.sellerId, sellerName: o.seller_name || o.sellerName, deliveryDate: o.delivery_date || o.deliveryDate, productName: o.product_name || o.productName, createdAt: o.created_at || o.createdAt, deliveredAt: o.delivered_at || o.deliveredAt }));
        if (wiRes.data) dbCache.warehouse_inventory = wiRes.data.map(i => ({ ...i, warehouseId: i.warehouse_id || i.warehouseId, productName: i.product_name || i.productName }));
        if (tRes.data) dbCache.transfers = tRes.data.map(t => ({ ...t, warehouseId: t.warehouse_id || t.warehouseId, warehouseName: t.warehouse_name || t.warehouseName, targetType: t.target_type || t.targetType, targetId: t.target_id || t.targetId, targetName: t.target_name || t.targetName, productName: t.product_name || t.productName, createdAt: t.created_at || t.createdAt, revertedAt: t.reverted_at || t.revertedAt }));
    } catch (err) {
        console.error('Erro de sincronização com Supabase:', err);
    }
}

// PERSISTÊNCIA E AUXILIARES
const read = (k, d = []) => JSON.parse(localStorage.getItem(k) || JSON.stringify(d));
const write = (k, v) => {
    localStorage.setItem(k, JSON.stringify(v));
    window.dispatchEvent(new Event('storage'));
};
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' }[c]));

// FUNÇÕES DE ACESSO AO BANCO
function allUsers() { return dbCache.users.length ? dbCache.users : read('nl_users', []); }
function allSellers() { return allUsers().filter(u => u.role === 'SELLER' || u.role === 'ADMIN_SELLER'); }
function allSupervisors() { return allUsers().filter(u => u.role === 'SUPERVISOR' || u.role === 'ADMIN_SUPERVISOR'); }
function allMotoboys() { return dbCache.motoboys.length ? dbCache.motoboys : read('nl_motoboys', []); }
function products() { return dbCache.products.length ? dbCache.products : read('atlasProducts', []); }
function sales() { return dbCache.sales.length ? dbCache.sales : read('atlasSales', []); }
function orders() { return dbCache.orders.length ? dbCache.orders : read('atlasOrders', []); }
function warehouses() { return dbCache.warehouses.length ? dbCache.warehouses : read('nl_warehouses', []); }
function warehouseInventory() { return dbCache.warehouse_inventory.length ? dbCache.warehouse_inventory : read('nl_warehouse_inventory', []); }
function warehouseTransfers() { return dbCache.transfers.length ? dbCache.transfers : read('nl_transfers', []); }
function systemCatalog() { return [...catalog, ...read('atlasCustomCatalog', []).map(x => [x.name, x.brand])]; }

function money(brlVal) {
    const brl = Number(brlVal || 0);
    return brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function moneySimple(brlVal) { return money(brlVal); }

function hasAdminAccess(user) { return user?.role === 'ADMIN_SUPERVISOR' || user?.role === 'ADMIN_SELLER' || user?.role === 'ADMIN'; }
function hasSupervisorAccess(user) { return user?.role === 'SUPERVISOR' || user?.role === 'ADMIN_SUPERVISOR'; }
function isSellerUser(user) { return user?.role === 'SELLER' || user?.role === 'ADMIN_SELLER'; }

function dayStart(days = 0) {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    d.setDate(d.getDate() - days);
    return d;
}

function periodSales(sid, period) {
    const now = new Date();
    const start = period === 'day' ? dayStart() : period === '7days' ? dayStart(6) : period === 'month' ? new Date(now.getFullYear(), now.getMonth(), 1) : new Date(now.getFullYear(), 0, 1);
    return sales().filter(x => (!sid || x.sellerId === sid) && new Date(x.createdAt) >= start);
}

function sellerRevenue(id, period = 'day') { return periodSales(id, period).reduce((a, x) => a + Number(x.total || 0), 0); }
function stock(sid) { return products().filter(p => p.sellerId === sid).reduce((a, p) => a + Number(p.stock || 0), 0); }

function avatarFor(u) {
    return String(u?.name || u?.user || u?.username || 'NL').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function renderAvatarHTML(u, extraClasses = '') {
    if (u && (u.avatarUrl || u.avatar_url)) {
        const url = u.avatarUrl || u.avatar_url;
        return `<div class="avatar ${extraClasses}" style="padding:0; overflow:hidden; border-radius:9999px;"><img src="${esc(url)}" style="width:100%; height:100%; object-fit:cover;" alt="${esc(u.name)}"></div>`;
    }
    return `<div class="avatar ${extraClasses}">${avatarFor(u)}</div>`;
}

function loadLeaflet(callback) {
    if (window.L) return callback();
    if (!document.getElementById('leaflet-css')) {
        const link = document.createElement('link');
        link.id = 'leaflet-css';
        link.rel = 'stylesheet';
        link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
        document.head.appendChild(link);
    }
    if (!document.getElementById('leaflet-js')) {
        const script = document.createElement('script');
        script.id = 'leaflet-js';
        script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
        script.onload = callback;
        document.head.appendChild(script);
    } else {
        const check = setInterval(() => {
            if (window.L) { clearInterval(check); callback(); }
        }, 100);
    }
}

async function fetchCitiesForRegion(uf, citySelect, targetCity = '') {
    citySelect.innerHTML = '<option value="">Carregando lista de cidades...</option>';
    citySelect.disabled = true;
    if (!uf) {
        citySelect.innerHTML = '<option value="">Selecione o estado primeiro</option>';
        citySelect.disabled = false;
        return;
    }
    try {
        if (!ibgeCitiesCache[uf]) {
            const res = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?ordenacao=nome`);
            const data = await res.json();
            ibgeCitiesCache[uf] = data.map(m => m.nome);
        }
        const cities = ibgeCitiesCache[uf];
        citySelect.innerHTML = `<option value="">Selecione a cidade (${cities.length} disponíveis)</option>` +
            cities.map(c => `<option value="${esc(c)}" ${targetCity === c ? 'selected' : ''}>${esc(c)}</option>`).join('');
    } catch (e) {
        citySelect.innerHTML = '<option value="">Erro ao carregar cidades</option>';
    }
    citySelect.disabled = false;
}

function confirmActionModal({ title, subtitle, warningText, confirmText = 'Confirmar e Salvar', cancelText = 'Cancelar', onConfirm }) {
    const m = modal(`
        <div class="confirm-dialog-wrap p-2">
            <div class="confirm-icon text-sky-600 mb-2">${icons.flash}</div>
            <h2 class="text-lg font-black text-slate-900 mb-1">${esc(title)}</h2>
            ${subtitle ? `<p class="text-xs text-slate-500 mb-3">${esc(subtitle)}</p>` : ''}
            <div class="confirm-warning-box p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4">
                <strong>⚠️ Confirmação Exigida pelo Sistema:</strong>
                <span class="block mt-1">${esc(warningText || 'Confirme se todas as informações fornecidas estão corretas antes de salvar.')}</span>
            </div>
            <div class="confirm-dialog-actions flex justify-end gap-2 mt-4">
                <button type="button" class="outline-btn text-xs py-2 px-4 cancel-dialog">${esc(cancelText)}</button>
                <button type="button" class="primary-btn text-xs py-2 px-4 confirm-dialog">${icons.check} ${esc(confirmText)}</button>
            </div>
        </div>
    `);
    m.querySelector('.cancel-dialog').onclick = () => m.remove();
    m.querySelector('.confirm-dialog').onclick = () => {
        m.remove();
        if (typeof onConfirm === 'function') onConfirm();
    };
}

function exportUniversalPDF({ title, subtitle, headers = [], rows = [], fileName = 'relatorio.pdf' }) {
    if (!window.jspdf) return alert('Aguarde o carregamento do gerador de PDF.');
    const doc = new window.jspdf.jsPDF('p', 'mm', 'a4');
    const nowStr = new Date().toLocaleString('pt-BR');

    doc.setFillColor(15, 23, 42);
    doc.rect(0, 0, 210, 28, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('NEWLIFE.SYSTEM', 14, 12);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`${title.toUpperCase()}`, 14, 19);
    doc.text(`Gerado em: ${nowStr}`, 130, 19);

    let startY = 36;
    if (subtitle) {
        doc.setTextColor(51, 65, 85);
        doc.setFontSize(9);
        doc.text(subtitle, 14, startY);
        startY += 8;
    }

    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.setFillColor(241, 245, 249);
    doc.rect(14, startY, 182, 7, 'F');
    doc.setTextColor(15, 23, 42);

    const colWidth = 182 / (headers.length || 1);
    headers.forEach((h, i) => { doc.text(String(h), 16 + (i * colWidth), startY + 5); });

    startY += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);

    rows.forEach((r, rowIdx) => {
        if (startY > 275) { doc.addPage(); startY = 20; }
        if (rowIdx % 2 === 0) { doc.setFillColor(248, 250, 252); doc.rect(14, startY - 4, 182, 7, 'F'); }
        r.forEach((cell, i) => {
            const cellText = String(cell || '—').replace(/<[^>]*>?/gm, '');
            doc.text(cellText.length > 30 ? cellText.substring(0, 28) + '...' : cellText, 16 + (i * colWidth), startY);
        });
        startY += 7;
    });

    doc.save(fileName);
    showToast('Relatório PDF baixado!');
}

function showToast(msg) {
    const existing = document.querySelector('.toast');
    if (existing) existing.remove();
    const t = document.createElement('div');
    t.className = 'toast glass-panel show';
    t.textContent = msg;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 2600);
}

function modal(content) {
    const m = document.createElement('div');
    m.className = 'modal open';
    m.innerHTML = `<div class="modal-card glass-panel"><button class="close-btn" type="button">×</button>${content}</div>`;
    document.body.appendChild(m);
    const close = () => m.remove();
    m.querySelector('.close-btn').onclick = close;
    m.onclick = e => { if (e.target === m) close(); };
    return m;
}

function getAppRoot() {
    let root = document.getElementById('appRoot');

    document.querySelectorAll('body > *').forEach(el => {
        const tag = el.tagName.toLowerCase();
        if (tag !== 'script' && tag !== 'link' && tag !== 'style' && !el.classList.contains('modal') && !el.classList.contains('toast')) {
            if (el.id === 'appRoot') {
                el.style.display = 'block';
            } else {
                el.style.display = 'none';
            }
        }
    });

    if (!root) {
        root = document.createElement('div');
        root.id = 'appRoot';
        document.body.appendChild(root);
        root.style.display = 'block';
    }

    return root;
}

async function login(user) {
    if (user.active === false) {
        const err = document.getElementById('loginError');
        if (err) err.textContent = 'Esta conta foi desativada pelo Administrador.';
        return;
    }
    currentUser = user;
    localStorage.setItem('nl_current_user', JSON.stringify(user));
    await fetchSupabaseData();
    refreshCurrentScreen();
}

function logout() {
    currentUser = null;
    localStorage.removeItem('nl_current_user');
    location.reload();
}

function refreshCurrentScreen() {
    if (!currentUser) return;
    if (currentUser.role === 'STOCK') {
        renderStockPanel();
    } else if (hasAdminAccess(currentUser)) {
        renderAdmin();
    } else if (hasSupervisorAccess(currentUser)) {
        renderSupervisor();
    } else {
        renderSeller();
    }
}

function appFooter() {
    return `<footer class="app-footer"><b>newlife.system</b> &copy; 2026 — Gestão Integrada de Estoque e Vendas (R$)</footer>`;
}

function navContent() {
    const isAdmin = hasAdminAccess(currentUser);
    const isSeller = isSellerUser(currentUser);

    return `
        <div class="app-brand flex items-center justify-between p-4">
            <div class="flex items-center gap-2">
                <div class="brand-mark">${icons.brand}</div>
                <div><b>newlife<span>.system</span></b><small>gestão</small></div>
            </div>
            <button class="mobile-close-drawer md:hidden text-slate-400 hover:text-white text-xl p-2">✕</button>
        </div>

        ${isSeller ? `
            <div style="padding: 0 12px 10px 12px;">
                <button class="switchToSellerBtn primary-btn w-full flex items-center justify-center gap-2" style="background: #0284c7; color: #fff; height: 38px; font-size: 11px; font-weight: 800; border-radius: 10px;">
                    ${icons.chart} <span>🛒 MODO VENDEDOR (DAR BAIXA)</span>
                </button>
            </div>
        ` : ''}

        <div class="side-label">${isAdmin ? 'ADMINISTRAÇÃO GERAL' : 'SUPERVISÃO OPERACIONAL'}</div>
        ${isAdmin ? `
            <button class="side-link ${activeTab === 'adminHome' ? 'active' : ''}" data-admin-tab="adminHome">${icons.summary} <span>Visão Consolidada</span></button>
            <button class="side-link ${activeTab === 'sales' ? 'active' : ''}" data-admin-tab="sales">${icons.chart} <span>Dar Baixa / Registrar Venda</span></button>
            <button class="side-link ${activeTab === 'map' ? 'active' : ''}" data-admin-tab="map">${icons.map} <span>Mapa de Localizações</span></button>
            <button class="side-link ${activeTab === 'warehouses' ? 'active' : ''}" data-admin-tab="warehouses">${icons.warehouse} <span>3 Estoques (SP/CENTRO, SP/OE, ASU)</span></button>
            <button class="side-link ${activeTab === 'adminSupervisors' ? 'active' : ''}" data-admin-tab="adminSupervisors">${icons.users} <span>Supervisores & Vendedores</span></button>
            <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-admin-tab="sellers">${icons.users} <span>Equipe de Vendedores</span></button>
            <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-admin-tab="motoboys">${icons.motoboy} <span>Gestão de Motoboys</span></button>
            <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
            <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-admin-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
            <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">${icons.products} <span>Atribuir / Enviar Estoque</span></button>
            <button class="side-link ${activeTab === 'backup' ? 'active' : ''}" data-admin-tab="backup">${icons.database} <span>Backup & Importação</span></button>
            <button class="side-link ${activeTab === 'adminReports' ? 'active' : ''}" data-admin-tab="adminReports">${icons.reports} <span>Relatórios Globais</span></button>
        ` : `
            <button class="side-link ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">${icons.summary} <span>Resumo da Equipe</span></button>
            <button class="side-link ${activeTab === 'sales' ? 'active' : ''}" data-tab="sales">${icons.chart} <span>Dar Baixa / Registrar Venda</span></button>
            <button class="side-link ${activeTab === 'map' ? 'active' : ''}" data-tab="map">${icons.map} <span>Mapa de Localizações</span></button>
            <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-tab="sellers">${icons.users} <span>Meus Vendedores</span></button>
            <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-tab="motoboys">${icons.motoboy} <span>Meus Motoboys</span></button>
            <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
            <button class="side-link ${activeTab === 'archived' ? 'active' : ''}" data-tab="archived">${icons.archive} <span>Arquivados / Histórico</span></button>
            <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
            <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-tab="products">${icons.products} <span>Atribuir / Enviar Estoque</span></button>
            <button class="side-link ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">${icons.reports} <span>Relatórios</span></button>
        `}

        ${isAdmin ? `
            <div class="side-danger"><button class="emergencyBtn">${icons.emergency} <span>Reset do Sistema</span></button></div>
        ` : ''}

        <div class="side-account">
            <div class="editSelfAvatarTrigger flex items-center gap-2 cursor-pointer">
                ${renderAvatarHTML(currentUser, 'small')}
                <div class="min-w-0 flex-1"><b>${esc(currentUser.name)}</b><small>@${esc(currentUser.user)}</small></div>
            </div>
            <button class="logoutSideBtn" title="Sair">${icons.logout}</button>
        </div>
    `;
}

function sellerNavContent() {
    const isAdmin = hasAdminAccess(currentUser);
    return `
        <div class="app-brand flex items-center justify-between p-4">
            <div class="flex items-center gap-2">
                <div class="brand-mark">${icons.brand}</div>
                <div><b>newlife<span>.system</span></b><small>vendedor</small></div>
            </div>
            <button class="mobile-close-drawer md:hidden text-slate-400 hover:text-white text-xl p-2">✕</button>
        </div>

        ${isAdmin ? `
            <div style="padding: 0 12px 10px 12px;">
                <button class="switchToAdminBtn outline-btn w-full flex items-center justify-center gap-2" style="background: rgba(124, 58, 237, 0.1); color: #7c3aed; border: 1px solid rgba(124, 58, 237, 0.3); height: 38px; font-size: 11px; font-weight: 800; border-radius: 10px;">
                    ${icons.summary} <span>⚙️ PAINEL ADMINISTRATIVO</span>
                </button>
            </div>
        ` : ''}

        <div class="side-label">PAINEL DO VENDEDOR</div>
        <button class="side-link ${sellerActiveTab === 'sales' ? 'active' : ''}" data-seller-tab="sales">${icons.chart} <span>Registrar Baixas / Vendas</span></button>
        <button class="side-link ${sellerActiveTab === 'newOrder' ? 'active' : ''}" data-seller-tab="newOrder">${icons.orders} <span>Pedido de Reposição</span></button>
        <button class="side-link ${sellerActiveTab === 'myOrders' ? 'active' : ''}" data-seller-tab="myOrders">${icons.clipboard} <span>Acompanhar Meus Pedidos</span></button>
        <button class="side-link ${sellerActiveTab === 'archived' ? 'active' : ''}" data-seller-tab="archived">${icons.archive} <span>Arquivados / Histórico</span></button>

        <div class="side-account mt-auto">
            <div class="editSelfAvatarTrigger flex items-center gap-2 cursor-pointer">
                ${renderAvatarHTML(currentUser, 'small')}
                <div class="min-w-0 flex-1"><b>${esc(currentUser.name)}</b><small>@${esc(currentUser.user)}</small></div>
            </div>
            <button class="logoutSellerSideBtn" title="Sair">${icons.logout}</button>
        </div>
    `;
}

function closeMobileDrawer() {
    drawerOpen = false;
    const drawer = document.getElementById('appDrawer');
    const overlay = document.getElementById('appDrawerOverlay');
    if (drawer) drawer.classList.remove('open');
    if (overlay) overlay.classList.remove('open');
}

function openMobileDrawer() {
    drawerOpen = true;
    const drawer = document.getElementById('appDrawer');
    const overlay = document.getElementById('appDrawerOverlay');
    if (drawer) drawer.classList.add('open');
    if (overlay) overlay.classList.add('open');
}

function appFrame(title, sub, body) {
    const container = getAppRoot();
    container.innerHTML = `
        <div class="app-layout w-full min-h-screen flex flex-col md:flex-row">
            <aside class="app-sidebar hidden md:flex flex-col">${navContent()}</aside>
            <div id="appDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
            <aside id="appDrawer" class="app-sidebar drawer-sidebar md:hidden ${drawerOpen ? 'open' : ''}">${navContent()}</aside>
            <section class="app-content flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <header class="app-header glass-panel sticky top-0 z-30 w-full p-3 md:p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm flex flex-row items-center justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <button id="hamburgerBtn" class="hamburger-btn md:hidden shrink-0 p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                                ${icons.menu}
                            </button>
                            <div class="hidden md:block">
                                <div class="eyebrow text-[10px] font-bold text-sky-600 uppercase tracking-wider">NEWLIFE.SYSTEM · ${new Date().toLocaleDateString('pt-BR')}</div>
                                <h1 class="text-xl font-black text-slate-900 leading-tight">${title}</h1>
                                <p class="text-xs text-slate-500">${sub}</p>
                            </div>
                            <div class="md:hidden font-extrabold text-xs text-slate-800 truncate">${title}</div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0 ml-auto">
                            <button id="refreshPage" class="outline-btn flex items-center gap-1 text-xs py-1.5 px-3 bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 font-bold">
                                ${icons.refresh} <span>Sincronizar Supabase</span>
                            </button>
                            <div class="editSelfAvatarTrigger cursor-pointer">${renderAvatarHTML(currentUser, 'flex')}</div>
                        </div>
                    </header>
                    <div class="page-body p-4 md:p-6">${body}</div>
                </div>
                ${appFooter()}
            </section>
        </div>
    `;

    const hBtn = document.getElementById('hamburgerBtn');
    const overlay = document.getElementById('appDrawerOverlay');
    if (hBtn) hBtn.onclick = () => drawerOpen ? closeMobileDrawer() : openMobileDrawer();
    if (overlay) overlay.onclick = closeMobileDrawer;

    document.querySelectorAll('.mobile-close-drawer').forEach(b => b.onclick = closeMobileDrawer);
    document.querySelectorAll('[data-tab]').forEach(b => b.onclick = () => { activeTab = b.dataset.tab; closeMobileDrawer(); renderSupervisor(); });
    document.querySelectorAll('[data-admin-tab]').forEach(b => b.onclick = () => { activeTab = b.dataset.adminTab; closeMobileDrawer(); renderAdmin(); });
    document.querySelectorAll('.switchToSellerBtn').forEach(b => b.onclick = () => { closeMobileDrawer(); sellerActiveTab = 'sales'; renderSeller(); });
    document.querySelectorAll('.logoutSideBtn').forEach(b => b.onclick = logout);
    document.querySelectorAll('.emergencyBtn').forEach(b => b.onclick = emergencyWipeModal);
    document.querySelectorAll('.editSelfAvatarTrigger').forEach(b => b.onclick = editSelfAvatarModal);

    const refreshBtn = document.getElementById('refreshPage');
    if (refreshBtn) refreshBtn.onclick = async () => {
        await fetchSupabaseData();
        refreshCurrentScreen();
        showToast('Sessão sincronizada com Supabase!');
    };
}

function undoTransferModal(transferId) {
    const transfers = warehouseTransfers();
    const t = transfers.find(x => x.id === transferId);

    if (!t) return alert('Transferência não encontrada.');
    if (t.reverted) return alert('Esta transferência já foi desfeita anteriormente.');

    const prods = products();
    const currentInv = warehouseInventory();
    const targetProduct = prods.find(p => p.sellerId === t.targetId && p.name === t.productName);
    const targetAvailable = targetProduct ? targetProduct.stock : 0;

    if (targetAvailable < t.quantity) {
        alert(`Não é possível desfazer totalmente este envio. O destinatário (${esc(t.targetName)}) possui apenas ${targetAvailable} un. em estoque.`);
        return;
    }

    confirmActionModal({
        title: '↩️ Desfazer Envio de Estoque',
        subtitle: `Reverter ${t.quantity}x ${t.productName} enviado para ${t.targetName}`,
        warningText: `Os itens serão debitados de ${t.targetName} e retornados para o estoque de origem (${t.warehouseName}).`,
        confirmText: 'Confirmar e Reverter Envio',
        onConfirm: async () => {
            if (targetProduct) {
                targetProduct.stock -= t.quantity;
            }

            if (t.warehouseId.startsWith('sup_')) {
                const supId = t.warehouseId.replace('sup_', '');
                let supProd = prods.find(p => p.sellerId === supId && p.name === t.productName);
                if (supProd) {
                    supProd.stock += t.quantity;
                } else {
                    prods.push({ id: uid(), sellerId: supId, name: t.productName, brand: t.brand, price: t.price, stock: t.quantity });
                }
            } else {
                let invItem = currentInv.find(i => i.warehouseId === t.warehouseId && i.productName === t.productName);
                if (invItem) {
                    invItem.stock += t.quantity;
                } else {
                    currentInv.push({ id: uid(), warehouseId: t.warehouseId, productName: t.productName, brand: t.brand, stock: t.quantity });
                }
                write('nl_warehouse_inventory', currentInv);
            }

            t.reverted = true;
            t.revertedAt = new Date().toISOString();

            write('atlasProducts', prods);
            write('nl_transfers', transfers);

            if (supabaseClient) {
                await supabaseClient.from('transfers').update({ reverted: true, reverted_at: t.revertedAt }).eq('id', t.id);
            }

            showToast('Envio desfeito com sucesso! Estoque restaurado.');
            currentUser.role === 'STOCK' ? renderStockPanel() : activeTab === 'warehouses' ? renderWarehousesPage() : renderAdmin();
        }
    });
}

function editSelfAvatarModal() {
    const m = modal(`
        <h2>Foto de Perfil</h2>
        <p class="text-xs text-slate-500 mb-3">Escolha uma foto ou remova a foto atual da sua conta <b>${esc(currentUser.name)}</b>.</p>
        <div class="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-200">
            <div id="selfAvatarPreview" class="w-24 h-24 mb-3 rounded-full overflow-hidden border-2 border-sky-500 shadow-md flex items-center justify-center bg-white">
                ${renderAvatarHTML(currentUser, 'w-full h-full')}
            </div>
            <input type="file" id="selfAvatarInput" accept="image/*" class="hidden">
            <div class="flex gap-2">
                <button type="button" id="triggerChooseSelfAvatar" class="outline-btn text-xs py-2 px-3 flex items-center gap-1.5">${icons.camera} <span>Selecionar Imagem</span></button>
                <button type="button" id="removeSelfAvatarBtn" class="delete-btn text-xs py-2 px-3 flex items-center gap-1.5" style="background:#fef2f2; color:#dc2626; border: 1px solid #fecaca;">${icons.trash} <span>Remover Foto</span></button>
            </div>
            <input type="hidden" id="selfAvatarBase64" value="${esc(currentUser.avatarUrl || currentUser.avatar_url || '')}">
        </div>
        <div class="flex justify-end gap-2">
            <button type="button" class="outline-btn cancel-avatar-btn">Cancelar</button>
            <button type="button" id="saveSelfAvatarBtn" class="primary-btn">${icons.check} Salvar Alteração</button>
        </div>
    `);

    const fileInput = m.querySelector('#selfAvatarInput');
    m.querySelector('#triggerChooseSelfAvatar').onclick = () => fileInput.click();
    m.querySelector('#removeSelfAvatarBtn').onclick = () => {
        m.querySelector('#selfAvatarBase64').value = '';
        m.querySelector('#selfAvatarPreview').innerHTML = `<div class="avatar text-xl font-black text-slate-700">${avatarFor(currentUser)}</div>`;
    };

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) return alert('A foto deve ter no máximo 3MB.');
            const reader = new FileReader();
            reader.onload = ev => {
                m.querySelector('#selfAvatarBase64').value = ev.target.result;
                m.querySelector('#selfAvatarPreview').innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
            };
            reader.readAsDataURL(file);
        }
    };

    m.querySelector('.cancel-avatar-btn').onclick = () => m.remove();
    m.querySelector('#saveSelfAvatarBtn').onclick = async () => {
        const newUrl = m.querySelector('#selfAvatarBase64').value;
        currentUser.avatarUrl = newUrl;
        currentUser.avatar_url = newUrl;

        const users = allUsers();
        const u = users.find(x => x.id === currentUser.id);
        if (u) { u.avatarUrl = newUrl; u.avatar_url = newUrl; }

        write('nl_users', users);
        localStorage.setItem('nl_current_user', JSON.stringify(currentUser));

        if (supabaseClient) {
            await supabaseClient.from('system_users').update({ avatar_url: newUrl }).eq('id', currentUser.id);
        }

        showToast('Perfil atualizado com sucesso!');
        m.remove();
        refreshCurrentScreen();
    };
}

function emergencyWipeModal() {
    if (!hasAdminAccess(currentUser)) {
        showToast('Apenas administradores podem resetar o sistema.');
        return;
    }

    const m = modal(`
        <h2>🔐 Confirmação de Segurança</h2>
        <p class="text-xs text-slate-500 mb-4">Atenção! Esta ação apaga todos os vendedores, vendas, estoques e histórico. Digite sua senha de Administrador.</p>
        <form id="resetConfirmForm" class="seller-form">
            <label>Senha do Administrador (${esc(currentUser.user)})
                <input type="password" id="resetAdminPassword" class="control" required placeholder="Digite sua senha">
            </label>
            <div id="resetErrorMsg" class="text-red-500 text-xs font-bold mt-1" style="color: #ef4444; font-size: 12px; margin-top: 4px;"></div>
            <div class="flex gap-2 mt-4 justify-end">
                <button type="button" class="outline-btn cancel-reset-btn">Cancelar</button>
                <button type="submit" class="delete-btn" style="background: #dc2626; color: white;">⚠️ Confirmar Reset Geral</button>
            </div>
        </form>
    `);

    m.querySelector('.cancel-reset-btn').onclick = () => m.remove();
    m.querySelector('#resetConfirmForm').onsubmit = e => {
        e.preventDefault();
        const pwd = m.querySelector('#resetAdminPassword').value;
        if (pwd === currentUser.password || pwd === 'iksystem2026@') {
            confirmActionModal({
                title: '⚠️ ZERAR SISTEMA COMPLETO',
                warningText: 'Você está prestes a apagar todos os dados. Não haverá como desfazer esta operação.',
                confirmText: 'ZERAR AGORA',
                onConfirm: () => {
                    localStorage.clear();
                    location.reload();
                }
            });
        } else {
            m.querySelector('#resetErrorMsg').textContent = 'Senha incorreta! Operação cancelada.';
        }
    };
}

function renderSupervisor() {
    if (activeTab === 'sales') return renderSupervisorSalesPage();
    if (activeTab === 'map') return renderMapPage();
    if (activeTab === 'sellers') return renderSellersPage();
    if (activeTab === 'motoboys') return renderMotoboysPage();
    if (activeTab === 'orders') return renderSupervisorOrdersPage();
    if (activeTab === 'archived') return renderArchivedPage();
    if (activeTab === 'catalog') return renderCatalogPage();
    if (activeTab === 'products') return renderProductsPage();
    if (activeTab === 'reports') return renderReportsPage();
    renderSummary();
}

function renderAdmin() {
    if (activeTab === 'sales') return renderSupervisorSalesPage();
    if (activeTab === 'map') return renderMapPage();
    if (activeTab === 'warehouses') return renderWarehousesPage();
    if (activeTab === 'adminSupervisors') return renderAdminSupervisorsPage();
    if (activeTab === 'sellers') return renderSellersPage();
    if (activeTab === 'motoboys') return renderMotoboysPage();
    if (activeTab === 'orders') return renderSupervisorOrdersPage();
    if (activeTab === 'catalog') return renderCatalogPage();
    if (activeTab === 'products') return renderProductsPage();
    if (activeTab === 'backup') return renderBackupPage();
    if (activeTab === 'adminReports') return renderReportsPage();
    renderAdminHome();
}

function renderAdminHome() {
    const users = allUsers();
    const allSalesList = sales();
    const allProds = products();

    const totalRevenueBRL = allSalesList.reduce((a, x) => a + Number(x.total || 0), 0);
    const totalItemsSold = allSalesList.reduce((a, x) => a + Number(x.quantity || 0), 0);
    const activeSellersCount = allSellers().filter(s => s.active !== false).length;
    const activeSupCount = allSupervisors().filter(s => s.active !== false).length;
    const sellerStockValueBRL = allProds.filter(p => p.stock > 0).reduce((a, p) => a + (p.price * p.stock), 0);
    const warehouseTotalUnits = warehouseInventory().reduce((a, i) => a + Number(i.stock || 0), 0);

    appFrame('Visão Consolidada & Controle Geral', 'Painel de controle com faturamento em tempo real e auditoria global via Supabase.', `
        <div class="stats-grid mb-6">
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Faturamento Global</span><span class="metric-icon cyan">${icons.dollar}</span></div>
                <div class="metric-value text-base md:text-lg font-black">${money(totalRevenueBRL)}</div>
                <small class="text-xs text-slate-500 mt-1 block">${totalItemsSold} unidades vendidas no total</small>
            </div>
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Estoque em Posse (Vendedores)</span><span class="metric-icon green">${icons.warehouse}</span></div>
                <div class="metric-value text-base md:text-lg font-black">${money(sellerStockValueBRL)}</div>
                <small class="text-xs text-slate-500 mt-1 block">${warehouseTotalUnits} un. armazenadas nos Depósitos Matriz</small>
            </div>
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Equipe Ativa</span><span class="metric-icon orange">${icons.users}</span></div>
                <div class="metric-value text-base md:text-lg font-black">${activeSupCount} Sup. / ${activeSellersCount} Vend.</div>
                <small class="text-xs text-slate-500 mt-1 block">${allMotoboys().length} Motoboys cadastrados</small>
            </div>
        </div>

        <div class="panel glass-panel mb-6">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4">
                <div>
                    <h2>Auditoria Global de Vendas Registradas</h2>
                    <p class="text-xs text-slate-500">Histórico completo de saídas de mercadorias lançadas por vendedores e supervisores.</p>
                </div>
            </div>

            ${allSalesList.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 2fr 1.5fr 1fr 2fr; align-items: center;">
                        <span>Data e Hora</span><span>Vendedor / Responsável</span><span>Produto</span><span>Qtd</span><span>Total (R$)</span>
                    </div>
                    ${allSalesList.slice().reverse().slice(0, 15).map(s => {
                        const seller = users.find(u => u.id === s.sellerId);
                        const prod = allProds.find(p => p.id === s.productId);
                        return `
                            <div class="table-row flex flex-col md:grid md:grid-cols-5 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Data</span>
                                    <small class="text-slate-500">${new Date(s.createdAt).toLocaleString('pt-BR')}</small>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                                    <b class="text-slate-900">${esc(seller ? seller.name : s.sellerId)}</b>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                    <span>${esc(prod ? prod.name : 'Produto Registrado')}</span>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd</span>
                                    <b>${s.quantity} un.</b>
                                </div>
                                <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Total</span>
                                    <strong class="highlight-val">${money(s.total)}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<div class="empty-state">Nenhuma venda registrada no sistema ainda.</div>'}
        </div>
    `);
}

function renderAdminSupervisorsPage() {
    if (!hasAdminAccess(currentUser)) return renderSellersPage();

    const sups = allSupervisors();
    const sellersList = allSellers();

    appFrame('Supervisores & Vendedores', 'Gerencie, edite ou altere o status dos supervisores e vendedores do sistema.', `
        <div class="page-toolbar flex justify-between items-center mb-6 gap-3 flex-wrap">
            <div><b>Estrutura de Equipes da newlife.system</b></div>
            <div class="flex gap-2 w-full sm:w-auto">
                <button id="addSupervisorBtn" class="outline-btn flex-1 sm:flex-none text-xs py-2">+ Cadastrar Supervisor</button>
                <button id="addSellerBtn" class="primary-btn flex-1 sm:flex-none text-xs py-2">+ Cadastrar Vendedor</button>
            </div>
        </div>

        <div class="panel glass-panel">
            <div class="panel-head mb-4"><h2>Supervisores e Suas Equipes</h2></div>
            <div class="space-y-6">
                ${sups.map(sup => {
                    const supSellers = sellersList.filter(s => (s.supervisor || '').toLowerCase() === (sup.user || '').toLowerCase());
                    const isSupActive = sup.active !== false;

                    return `
                        <div class="p-4 md:p-5 bg-white/90 border border-slate-200 rounded-2xl shadow-sm">
                            <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 pb-3 border-b border-slate-200 gap-3">
                                <div class="flex items-center gap-3">
                                    ${renderAvatarHTML(sup)}
                                    <div>
                                        <div class="flex items-center gap-2">
                                            <h3 class="text-base font-extrabold text-slate-900">${esc(sup.name)}</h3>
                                            <span class="status-pill ${isSupActive ? 'style-green' : 'style-red'}">${isSupActive ? '🟢 Ativo' : '🔴 Desativado'}</span>
                                        </div>
                                        <small class="text-xs text-slate-500">Login: @${esc(sup.user)} · Local: ${esc(sup.city || 'N/A')}/${esc(sup.uf || 'N/A')}</small>
                                    </div>
                                </div>

                                <div class="flex items-center gap-2 w-full sm:w-auto">
                                    <button class="small-btn edit-sup-btn" data-id="${sup.id}">Editar</button>
                                    <button class="small-btn toggle-sup-status" data-id="${sup.id}" style="background: ${isSupActive ? '#fef2f2' : '#f0fdf4'}; color: ${isSupActive ? '#dc2626' : '#166534'};">
                                        ${isSupActive ? 'Desativar' : 'Ativar'}
                                    </button>
                                    <button class="delete-btn delete-sup-btn" data-id="${sup.id}">Excluir</button>
                                </div>
                            </div>

                            ${supSellers.length ? `
                                <div class="data-table flex flex-col gap-3">
                                    <div class="table-head hidden md:grid" style="grid-template-columns: 2fr 1fr 1.5fr 1.5fr 1fr auto; align-items: center;">
                                        <span>Vendedor</span><span>Status</span><span>Localização</span><span>Supervisor Destino</span><span>Estoque</span><span>Ações</span>
                                    </div>
                                    ${supSellers.map(s => {
                                        const isSellerActive = s.active !== false;
                                        return `
                                            <div class="table-row flex flex-col md:grid md:grid-cols-6 gap-3 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                                                <div class="flex justify-between items-center md:block">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                                                    <div class="flex items-center gap-2">
                                                        ${renderAvatarHTML(s, 'small')}
                                                        <div>
                                                            <b class="text-slate-900 font-bold">${esc(s.name)}</b>
                                                            <small class="text-slate-500 block">(@${esc(s.user)})</small>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div class="flex justify-between items-center md:block">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Status</span>
                                                    <span class="status-pill ${isSellerActive ? 'style-green' : 'style-red'}">${isSellerActive ? 'Ativo' : 'Desativado'}</span>
                                                </div>

                                                <div class="flex justify-between items-center md:block">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Localização</span>
                                                    <span class="text-sm font-semibold text-slate-700">${esc(s.city || 'N/A')} / ${esc(s.uf || 'N/A')}</span>
                                                </div>

                                                <div class="flex justify-between items-center md:block">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Supervisor</span>
                                                    <select class="control compact change-supervisor-select w-36 md:w-full" data-seller-id="${s.id}">
                                                        ${sups.map(sp => `<option value="${sp.user}" ${s.supervisor === sp.user ? 'selected' : ''}>${esc(sp.name)}</option>`).join('')}
                                                    </select>
                                                </div>

                                                <div class="flex justify-between items-center md:block">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Estoque</span>
                                                    <span class="font-bold text-slate-900">${stock(s.id)} un.</span>
                                                </div>

                                                <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                                    <div class="flex gap-1.5">
                                                        <button class="small-btn edit-seller-btn" data-id="${s.id}">Editar</button>
                                                        <button class="delete-btn delete-seller-btn" data-id="${s.id}">Excluir</button>
                                                    </div>
                                                </div>
                                            </div>
                                        `;
                                    }).join('')}
                                </div>
                            ` : '<div class="text-xs text-slate-400 p-3 italic">Nenhum vendedor associado a este supervisor.</div>'}
                        </div>
                    `;
                }).join('')}
            </div>
        </div>
    `);

    document.getElementById('addSupervisorBtn').onclick = () => supervisorModal();
    document.getElementById('addSellerBtn').onclick = () => sellerModal();

    document.querySelectorAll('.edit-sup-btn').forEach(b => b.onclick = () => supervisorModal(allUsers().find(u => u.id === b.dataset.id)));
    document.querySelectorAll('.delete-sup-btn').forEach(b => b.onclick = () => deleteSupervisor(b.dataset.id));

    document.querySelectorAll('.toggle-sup-status').forEach(b => {
        b.onclick = () => {
            const sup = allUsers().find(u => u.id === b.dataset.id);
            const newStatus = sup.active === false;
            confirmActionModal({
                title: `${newStatus ? 'Ativar' : 'Desativar'} Supervisor`,
                subtitle: `Supervisor: ${sup.name}`,
                warningText: `Confirma ${newStatus ? 'a ativação' : 'a desativação'} da conta deste supervisor?`,
                confirmText: 'Confirmar Status',
                onConfirm: async () => {
                    sup.active = newStatus;
                    write('nl_users', allUsers());
                    if (supabaseClient) {
                        await supabaseClient.from('system_users').update({ active: newStatus }).eq('id', sup.id);
                    }
                    showToast('Status do supervisor atualizado!');
                    renderAdminSupervisorsPage();
                }
            });
        };
    });

    document.querySelectorAll('.change-supervisor-select').forEach(sel => {
        sel.onchange = e => {
            const sellerId = e.target.dataset.sellerId;
            const newSupUser = e.target.value;
            const users = allUsers();
            const s = users.find(u => u.id === sellerId);
            if (s) {
                confirmActionModal({
                    title: 'Alterar Supervisor Responsável',
                    subtitle: `Vendedor: ${s.name} → Novo Supervisor: @${newSupUser}`,
                    warningText: 'Confirmar a transferência de supervisão deste vendedor?',
                    confirmText: 'Transferir Supervisão',
                    onConfirm: async () => {
                        s.supervisor = newSupUser;
                        write('nl_users', users);
                        if (supabaseClient) {
                            await supabaseClient.from('system_users').update({ supervisor: newSupUser }).eq('id', s.id);
                        }
                        showToast(`Supervisor do vendedor alterado!`);
                        renderAdminSupervisorsPage();
                    }
                });
            }
        };
    });

    document.querySelectorAll('.edit-seller-btn').forEach(b => b.onclick = () => sellerModal(allUsers().find(u => u.id === b.dataset.id)));
    document.querySelectorAll('.delete-seller-btn').forEach(b => b.onclick = () => deleteSeller(b.dataset.id));
}

function supervisorModal(existing = null) {
    if (!hasAdminAccess(currentUser)) return;

    const m = modal(`
        <h2>${existing ? 'Editar' : 'Cadastrar Novo'} Supervisor</h2>
        <form id="entityForm" class="seller-form">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                <div id="supAvatarPreview" class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-sky-100 text-sky-700 font-bold border border-sky-300 shrink-0">
                    ${existing?.avatarUrl ? `<img src="${esc(existing.avatarUrl)}" style="width:100%;height:100%;object-fit:cover;">` : (existing ? avatarFor(existing) : 'SUP')}
                </div>
                <div class="flex-1">
                    <label class="text-xs font-bold text-slate-700 block mb-1">Foto de Perfil (Avatar)</label>
                    <input type="file" id="supAvatarInput" accept="image/*" class="text-xs control">
                    <div class="flex gap-2 mt-2">
                        <button type="button" id="removeSupAvatarBtn" class="delete-btn text-[11px] py-1 px-2.5" style="background:#fef2f2; color:#dc2626; border: 1px solid #fecaca;">${icons.trash} Remover Foto</button>
                    </div>
                    <input type="hidden" name="avatarUrl" id="supAvatarBase64" value="${esc(existing?.avatarUrl || '')}">
                </div>
            </div>

            <label>Nome do Supervisor<input name="name" class="control" value="${esc(existing?.name)}" required></label>
            <label>Login<input name="user" class="control" value="${esc(existing?.user)}" ${existing ? 'readonly' : ''} required placeholder="ex: carlos"></label>
            <label>Senha<input name="password" class="control" value="${esc(existing?.password || '')}" required placeholder="ex: carlossystem2026@"></label>
            
            <label>Status da Conta
                <select name="active" class="control" required>
                    <option value="true" ${existing?.active !== false ? 'selected' : ''}>🟢 Ativo</option>
                    <option value="false" ${existing?.active === false ? 'selected' : ''}>🔴 Desativado</option>
                </select>
            </label>

            <div class="form-grid">
                <label>Estado (UF)
                    <select name="uf" id="supUf" class="control" required>
                        <option value="">Selecione</option>
                        ${brazilStatesList.map(u => `<option value="${u}" ${existing?.uf === u ? 'selected' : ''}>${u}</option>`).join('')}
                    </select>
                </label>
                <label>Cidade
                    <select name="city" id="supCity" class="control" required>
                        <option value="">Selecione o estado primeiro</option>
                    </select>
                </label>
            </div>

            <button type="button" id="triggerSaveSup" class="primary-btn w-full mt-3">${icons.check} Salvar Supervisor</button>
        </form>
    `);

    const fileInput = m.querySelector('#supAvatarInput');
    const removeBtn = m.querySelector('#removeSupAvatarBtn');
    const preview = m.querySelector('#supAvatarPreview');
    const avatarBase64 = m.querySelector('#supAvatarBase64');

    removeBtn.onclick = () => {
        avatarBase64.value = '';
        preview.innerHTML = existing ? avatarFor(existing) : 'SUP';
        showToast('Foto removida!');
    };

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) return alert('Foto muito grande! Escolha até 3MB.');
            const reader = new FileReader();
            reader.onload = ev => {
                avatarBase64.value = ev.target.result;
                preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
            };
            reader.readAsDataURL(file);
        }
    };

    const ufSelect = m.querySelector('#supUf');
    const citySelect = m.querySelector('#supCity');
    if (existing?.uf) fetchCitiesForRegion(existing.uf, citySelect, existing.city);
    ufSelect.onchange = () => fetchCitiesForRegion(ufSelect.value, citySelect);

    m.querySelector('#triggerSaveSup').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        confirmActionModal({
            title: existing ? 'Salvar Alterações do Supervisor' : 'Cadastrar Supervisor',
            subtitle: `Supervisor: ${f.get('name')}`,
            warningText: 'Confirmar os dados do supervisor?',
            confirmText: 'Salvar Supervisor',
            onConfirm: async () => {
                const users = allUsers();
                let sup = existing || { id: uid(), role: 'SUPERVISOR', supervisor: 'ik' };
                sup.name = f.get('name');
                sup.user = String(f.get('user')).trim().toLowerCase();
                sup.password = f.get('password');
                sup.active = f.get('active') === 'true';
                sup.avatarUrl = f.get('avatarUrl');
                sup.uf = f.get('uf');
                sup.city = f.get('city');

                const pos = users.findIndex(u => u.id === sup.id);
                pos >= 0 ? users[pos] = sup : users.push(sup);
                write('nl_users', users);

                if (supabaseClient) {
                    await supabaseClient.from('system_users').upsert({
                        id: sup.id,
                        username: sup.user, // Grava na coluna 'username' do Supabase
                        password: sup.password,
                        name: sup.name,
                        role: sup.role,
                        supervisor: sup.supervisor,
                        city: sup.city,
                        uf: sup.uf,
                        country: 'BR',
                        active: sup.active,
                        avatar_url: sup.avatarUrl
                    });
                }

                m.remove();
                showToast('Supervisor salvo com sucesso!');
                renderAdminSupervisorsPage();
            }
        });
    };
}

function deleteSupervisor(id) {
    if (!hasAdminAccess(currentUser)) return;
    const sup = allUsers().find(u => u.id === id);
    if (!sup) return;

    confirmActionModal({
        title: `Excluir Supervisor: ${sup.name}`,
        subtitle: `@${sup.user}`,
        warningText: 'Atenção! Excluir este supervisor removerá seu cadastro do sistema.',
        confirmText: 'Excluir Supervisor',
        onConfirm: async () => {
            write('nl_users', allUsers().filter(u => u.id !== id));
            if (supabaseClient) {
                await supabaseClient.from('system_users').delete().eq('id', id);
            }
            showToast('Supervisor excluído com sucesso!');
            renderAdminSupervisorsPage();
        }
    });
}

function renderSellersPage() {
    const isAdm = hasAdminAccess(currentUser);
    const sellersList = isAdm ? allSellers() : allSellers().filter(s => (s.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase());

    appFrame('Equipe de Vendedores', isAdm ? 'Gerencie a lista global de vendedores.' : 'Gerencie apenas a sua equipe direta de vendedores.', `
        <div class="page-toolbar flex justify-between items-center mb-4 gap-3 flex-wrap">
            <div><b>${sellersList.length} Vendedor(es) Ativo(s) ${isAdm ? '' : '(Sua Equipe)'}</b></div>
            <div class="flex gap-2 w-full sm:w-auto">
                <button id="supSendStockSellersBtn" class="outline-btn flex-1 sm:flex-none text-xs py-2 flex items-center justify-center gap-1">${icons.orders} Enviar do Meu Estoque</button>
                <button id="addNewSellerGlobal" class="primary-btn flex-1 sm:flex-none text-xs py-2">+ Cadastrar Novo Vendedor</button>
            </div>
        </div>

        <div class="panel glass-panel">
            ${sellersList.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: ${isAdm ? '2fr 1fr 1.5fr 1.5fr 1fr 2fr auto' : '2fr 1.5fr 1fr 2fr auto'}; align-items: center; padding: 12px 18px; font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 11px;">
                        <span>VENDEDOR & LOGIN</span>
                        ${isAdm ? '<span>STATUS</span>' : ''}
                        ${isAdm ? '<span>SUPERVISOR RESPONSÁVEL</span>' : ''}
                        <span>CIDADE / UF</span>
                        <span>ESTOQUE</span>
                        <span>VALOR EM POSSE (R$)</span>
                        <span>AÇÕES</span>
                    </div>
                    ${sellersList.map(s => {
                        const sStock = stock(s.id);
                        const sStockValBRL = products().filter(p => p.sellerId === s.id && p.stock > 0).reduce((a, p) => a + (p.price * p.stock), 0);
                        const isSellerActive = s.active !== false;

                        return `
                            <div class="table-row flex flex-col md:grid ${isAdm ? 'md:grid-cols-7' : 'md:grid-cols-5'} gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                                    <div class="flex items-center gap-2">
                                        ${renderAvatarHTML(s, 'small')}
                                        <div class="flex flex-col">
                                            <b class="text-slate-900">${esc(s.name)}</b>
                                            <small class="text-slate-500">@${esc(s.user)}</small>
                                        </div>
                                    </div>
                                </div>

                                ${isAdm ? `
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Status</span>
                                        <span class="status-pill ${isSellerActive ? 'style-green' : 'style-red'}">${isSellerActive ? 'Ativo' : 'Desativado'}</span>
                                    </div>
                                ` : ''}

                                ${isAdm ? `
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Supervisor</span>
                                        <span class="catalog-badge">${esc(s.supervisor || 'Geral')}</span>
                                    </div>
                                ` : ''}
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Cidade/UF</span>
                                    <b>${esc(s.city || 'N/A')} / ${esc(s.uf || 'N/A')}</b>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Estoque</span>
                                    <b>${sStock} un.</b>
                                </div>
                                <div class="flex justify-between items-center md:block text-xs">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Valor</span>
                                    <strong class="highlight-val">${money(sStockValBRL)}</strong>
                                </div>
                                <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                    <div class="flex gap-2">
                                        <button class="small-btn edit-seller-btn" data-id="${s.id}">Editar</button>
                                        <button class="delete-btn delete-seller-btn" data-id="${s.id}">Excluir</button>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<div class="empty-state"><strong>Nenhum vendedor encontrado.</strong></div>'}
        </div>
    `);

    document.getElementById('supSendStockSellersBtn').onclick = transferSupervisorStockModal;
    document.getElementById('addNewSellerGlobal').onclick = () => sellerModal();
    document.querySelectorAll('.edit-seller-btn').forEach(b => b.onclick = () => sellerModal(allUsers().find(u => u.id === b.dataset.id)));
    document.querySelectorAll('.delete-seller-btn').forEach(b => b.onclick = () => deleteSeller(b.dataset.id));
}

function sellerModal(existing = null) {
    const isAdm = hasAdminAccess(currentUser);
    const sups = allSupervisors();

    const m = modal(`
        <h2>${existing ? 'Editar' : 'Cadastrar Novo'} Vendedor</h2>
        <form id="sellerEntityForm" class="seller-form">
            <div class="flex items-center gap-3 p-3 bg-slate-50 rounded-xl mb-3 border border-slate-200">
                <div id="sellerAvatarPreview" class="w-12 h-12 rounded-full overflow-hidden flex items-center justify-center bg-emerald-100 text-emerald-700 font-bold border border-emerald-300 shrink-0">
                    ${existing?.avatarUrl ? `<img src="${esc(existing.avatarUrl)}" style="width:100%;height:100%;object-fit:cover;">` : (existing ? avatarFor(existing) : 'VEND')}
                </div>
                <div class="flex-1">
                    <label class="text-xs font-bold text-slate-700 block mb-1">Foto de Perfil (Avatar)</label>
                    <input type="file" id="sellerAvatarInput" accept="image/*" class="text-xs control">
                    <div class="flex gap-2 mt-2">
                        <button type="button" id="removeSellerAvatarBtn" class="delete-btn text-[11px] py-1 px-2.5" style="background:#fef2f2; color:#dc2626; border: 1px solid #fecaca;">${icons.trash} Remover Foto</button>
                    </div>
                    <input type="hidden" name="avatarUrl" id="sellerAvatarBase64" value="${esc(existing?.avatarUrl || '')}">
                </div>
            </div>

            <label>Nome Completo<input name="name" class="control" value="${esc(existing?.name)}" required></label>
            <label>Login<input name="user" class="control" value="${esc(existing?.user)}" ${existing ? 'readonly' : ''} required placeholder="ex: joaovendedor"></label>
            <label>Senha<input name="password" class="control" value="${esc(existing?.password || '')}" required placeholder="ex: joaosystem2026@"></label>
            
            <label>Status da Conta
                <select name="active" class="control" required>
                    <option value="true" ${existing?.active !== false ? 'selected' : ''}>🟢 Ativo</option>
                    <option value="false" ${existing?.active === false ? 'selected' : ''}>🔴 Desativado</option>
                </select>
            </label>

            ${isAdm ? `
                <label>Supervisor Responsável
                    <select name="supervisor" class="control" required>
                        ${sups.map(s => `<option value="${s.user}" ${existing ? (existing.supervisor === s.user ? 'selected' : '') : (s.user === currentUser.user ? 'selected' : '')}>${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
                    </select>
                </label>
            ` : `
                <input type="hidden" name="supervisor" value="${esc(currentUser.user)}">
            `}

            <div class="form-grid">
                <label>Estado (UF)
                    <select name="uf" id="ufSelect" class="control" required>
                        <option value="">Selecione</option>
                        ${brazilStatesList.map(u => `<option value="${u}" ${existing?.uf === u ? 'selected' : ''}>${u}</option>`).join('')}
                    </select>
                </label>
                <label>Cidade
                    <select name="city" id="citySelect" class="control" required>
                        <option value="">Selecione o estado primeiro</option>
                    </select>
                </label>
            </div>

            <button type="button" id="triggerSaveSeller" class="primary-btn w-full mt-3">${icons.check} Salvar Vendedor</button>
        </form>
    `);

    const fileInput = m.querySelector('#sellerAvatarInput');
    const removeBtn = m.querySelector('#removeSellerAvatarBtn');
    const preview = m.querySelector('#sellerAvatarPreview');
    const avatarBase64 = m.querySelector('#sellerAvatarBase64');

    removeBtn.onclick = () => {
        avatarBase64.value = '';
        preview.innerHTML = existing ? avatarFor(existing) : 'VEND';
        showToast('Foto removida!');
    };

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 3 * 1024 * 1024) return alert('Foto muito grande! Escolha até 3MB.');
            const reader = new FileReader();
            reader.onload = ev => {
                avatarBase64.value = ev.target.result;
                preview.innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover;">`;
            };
            reader.readAsDataURL(file);
        }
    };

    const ufSelect = m.querySelector('#ufSelect');
    const citySelect = m.querySelector('#citySelect');
    if (existing?.uf) fetchCitiesForRegion(existing.uf, citySelect, existing.city);
    ufSelect.onchange = () => fetchCitiesForRegion(ufSelect.value, citySelect);

    m.querySelector('#triggerSaveSeller').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        confirmActionModal({
            title: existing ? 'Salvar Alterações do Vendedor' : 'Cadastrar Vendedor',
            subtitle: `Vendedor: ${f.get('name')}`,
            warningText: 'Confirmar os dados do vendedor?',
            confirmText: 'Salvar Cadastro',
            onConfirm: async () => {
                const users = allUsers();
                let seller = existing || { id: uid(), role: 'SELLER' };
                seller.name = f.get('name');
                seller.user = String(f.get('user')).trim().toLowerCase();
                seller.password = f.get('password');
                seller.active = f.get('active') === 'true';
                seller.avatarUrl = f.get('avatarUrl');
                seller.supervisor = isAdm ? f.get('supervisor') : currentUser.user;
                seller.uf = f.get('uf');
                seller.city = f.get('city');

                const pos = users.findIndex(u => u.id === seller.id);
                pos >= 0 ? users[pos] = seller : users.push(seller);
                write('nl_users', users);

                if (supabaseClient) {
                    await supabaseClient.from('system_users').upsert({
                        id: seller.id,
                        username: seller.user, // Grava na coluna 'username' do Supabase
                        password: seller.password,
                        name: seller.name,
                        role: seller.role,
                        supervisor: seller.supervisor,
                        city: seller.city,
                        uf: seller.uf,
                        country: 'BR',
                        active: seller.active,
                        avatar_url: seller.avatarUrl
                    });
                }

                m.remove();
                showToast('Vendedor salvo com sucesso!');
                isAdm && activeTab === 'adminSupervisors' ? renderAdminSupervisorsPage() : renderSellersPage();
            }
        });
    };
}

function deleteSeller(id) {
    const s = allUsers().find(u => u.id === id);
    if (!hasAdminAccess(currentUser) && (s?.supervisor || '').toLowerCase() !== currentUser.user.toLowerCase()) {
        showToast('Ação não permitida para este vendedor.');
        return;
    }

    confirmActionModal({
        title: `Excluir Vendedor: ${s?.name}`,
        warningText: 'Este vendedor e seus produtos vinculados serão removidos do sistema.',
        confirmText: 'Excluir Vendedor',
        onConfirm: async () => {
            write('nl_users', allUsers().filter(u => u.id !== id));
            write('atlasProducts', products().filter(p => p.sellerId !== id));

            if (supabaseClient) {
                await supabaseClient.from('system_users').delete().eq('id', id);
                await supabaseClient.from('seller_products').delete().eq('seller_id', id);
            }

            showToast('Vendedor removido!');
            hasAdminAccess(currentUser) && activeTab === 'adminSupervisors' ? renderAdminSupervisorsPage() : renderSellersPage();
        }
    });
}

function renderMotoboysPage() {
    const isAdm = hasAdminAccess(currentUser);
    const sups = allSupervisors();
    const motoboysList = isAdm ? allMotoboys() : allMotoboys().filter(m => (m.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase());

    appFrame('Gestão de Motoboys', isAdm ? 'Cadastre entregadores e defina o supervisor responsável.' : 'Motoboys vinculados ao seu perfil.', `
        <div class="page-toolbar flex justify-between items-center mb-4 gap-3 flex-wrap">
            <div><b>${motoboysList.length} Motoboy(s) ${isAdm ? 'Cadastrado(s)' : 'Atribuído(s) a Você'}</b></div>
            ${isAdm ? `<button id="addNewMotoboyBtn" class="primary-btn text-xs py-2">+ Cadastrar Novo Motoboy</button>` : ''}
        </div>

        <div class="panel glass-panel">
            ${motoboysList.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: ${isAdm ? '2fr 1.5fr 1.5fr 1.5fr auto' : '2fr 1.5fr 1.5fr'}; align-items: center; padding: 12px 18px; font-weight: bold; color: #64748b; text-transform: uppercase; font-size: 11px;">
                        <span>NOME DO MOTOBOY</span>
                        <span>WHATSAPP DE CONTATO</span>
                        <span>LOCALIZAÇÃO (CIDADE/UF)</span>
                        ${isAdm ? '<span>SUPERVISOR ATRIBUÍDO</span>' : ''}
                        ${isAdm ? '<span>AÇÕES</span>' : ''}
                    </div>
                    ${motoboysList.map(mb => {
                        const cleanPhone = String(mb.whatsapp || mb.phone || '').replace(/\D/g, '');
                        const waUrl = cleanPhone ? `https://wa.me/55${cleanPhone}` : '#';

                        return `
                            <div class="table-row flex flex-col md:grid ${isAdm ? 'md:grid-cols-5' : 'md:grid-cols-3'} gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Motoboy</span>
                                    <div class="flex items-center gap-2">
                                        <span class="p-1.5 rounded-lg bg-sky-100 text-sky-700">${icons.motoboy}</span>
                                        <b class="text-slate-900 font-bold">${esc(mb.name)}</b>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">WhatsApp</span>
                                    <a href="${waUrl}" target="_blank" class="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg border border-emerald-200 hover:bg-emerald-100">
                                        ${icons.whatsapp} <span>${esc(mb.whatsapp || mb.phone)}</span>
                                    </a>
                                </div>

                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Localização</span>
                                    <span class="text-sm font-semibold text-slate-700">📍 ${esc(mb.city || 'N/A')} / ${esc(mb.uf || 'N/A')}</span>
                                </div>

                                ${isAdm ? `
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Supervisor</span>
                                        <select class="control compact change-motoboy-sup w-36 md:w-full" data-id="${mb.id}">
                                            ${sups.map(s => `<option value="${s.user}" ${mb.supervisor === s.user ? 'selected' : ''}>${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
                                        </select>
                                    </div>

                                    <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                        <div class="flex gap-2">
                                            <button class="small-btn edit-motoboy-btn" data-id="${mb.id}">Editar</button>
                                            <button class="delete-btn delete-motoboy-btn" data-id="${mb.id}">Excluir</button>
                                        </div>
                                    </div>
                                ` : ''}
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : `<div class="empty-state"><strong>${isAdm ? 'Nenhum motoboy cadastrado.' : 'Nenhum motoboy foi atribuído a você.'}</strong></div>`}
        </div>
    `);

    if (isAdm) {
        const addBtn = document.getElementById('addNewMotoboyBtn');
        if (addBtn) addBtn.onclick = () => motoboyModal();

        document.querySelectorAll('.change-motoboy-sup').forEach(sel => {
            sel.onchange = e => {
                const mId = e.target.dataset.id;
                const newSup = e.target.value;
                const mList = allMotoboys();
                const mb = mList.find(x => x.id === mId);
                if (mb) {
                    confirmActionModal({
                        title: 'Reatribuir Motoboy',
                        subtitle: `Motoboy: ${mb.name} → Supervisor: @${newSup}`,
                        warningText: 'Confirmar a transferência do motoboy para este supervisor?',
                        confirmText: 'Reatribuir',
                        onConfirm: async () => {
                            mb.supervisor = newSup;
                            write('nl_motoboys', mList);
                            if (supabaseClient) {
                                await supabaseClient.from('motoboys').update({ supervisor: newSup }).eq('id', mb.id);
                            }
                            showToast('Supervisor do Motoboy atualizado!');
                            renderMotoboysPage();
                        }
                    });
                }
            };
        });

        document.querySelectorAll('.edit-motoboy-btn').forEach(b => b.onclick = () => motoboyModal(allMotoboys().find(x => x.id === b.dataset.id)));
        document.querySelectorAll('.delete-motoboy-btn').forEach(b => b.onclick = () => deleteMotoboy(b.dataset.id));
    }
}

function motoboyModal(existing = null) {
    const sups = allSupervisors();

    const m = modal(`
        <h2>${existing ? 'Editar' : 'Cadastrar Novo'} Motoboy</h2>
        <form id="entityForm" class="seller-form">
            <label>Nome Completo do Motoboy
                <input name="name" class="control" value="${esc(existing?.name)}" required placeholder="ex: João Silva Express">
            </label>

            <label>WhatsApp de Contato (com DDD)
                <input name="whatsapp" class="control" value="${esc(existing?.whatsapp || existing?.phone)}" required placeholder="ex: 41999998888">
            </label>

            <label>Supervisor Responsável pelo Motoboy
                <select name="supervisor" class="control" required>
                    ${sups.map(s => `<option value="${s.user}" ${existing ? (existing.supervisor === s.user ? 'selected' : '') : ''}>${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
                </select>
            </label>

            <div class="form-grid">
                <label>Estado (UF)
                    <select name="uf" id="mbUf" class="control" required>
                        <option value="">Selecione</option>
                        ${brazilStatesList.map(u => `<option value="${u}" ${existing?.uf === u ? 'selected' : ''}>${u}</option>`).join('')}
                    </select>
                </label>
                <label>Cidade / Região
                    <select name="city" id="mbCity" class="control" required>
                        <option value="">Selecione o estado primeiro</option>
                    </select>
                </label>
            </div>

            <button type="button" id="triggerSaveMotoboy" class="primary-btn w-full mt-3">${icons.check} Salvar Motoboy</button>
        </form>
    `);

    const ufSelect = m.querySelector('#mbUf');
    const citySelect = m.querySelector('#mbCity');
    if (existing?.uf) fetchCitiesForRegion(existing.uf, citySelect, existing.city);
    ufSelect.onchange = () => fetchCitiesForRegion(ufSelect.value, citySelect);

    m.querySelector('#triggerSaveMotoboy').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        confirmActionModal({
            title: existing ? 'Salvar Alterações do Motoboy' : 'Cadastrar Motoboy',
            subtitle: `Motoboy: ${f.get('name')}`,
            warningText: 'Confirmar os dados do entregador?',
            confirmText: 'Salvar Registro',
            onConfirm: async () => {
                const list = allMotoboys();
                let mb = existing || { id: uid() };
                mb.name = f.get('name');
                mb.whatsapp = String(f.get('whatsapp')).trim();
                mb.supervisor = f.get('supervisor');
                mb.uf = f.get('uf');
                mb.city = f.get('city');

                const idx = list.findIndex(x => x.id === mb.id);
                idx >= 0 ? list[idx] = mb : list.push(mb);
                write('nl_motoboys', list);

                if (supabaseClient) {
                    await supabaseClient.from('motoboys').upsert({
                        id: mb.id,
                        name: mb.name,
                        whatsapp: mb.whatsapp,
                        supervisor: mb.supervisor,
                        uf: mb.uf,
                        city: mb.city
                    });
                }

                m.remove();
                showToast('Motoboy salvo com sucesso!');
                renderMotoboysPage();
            }
        });
    };
}

function deleteMotoboy(id) {
    const mb = allMotoboys().find(x => x.id === id);
    confirmActionModal({
        title: `Excluir Motoboy: ${mb?.name}`,
        warningText: 'O motoboy deixará de ser visível para o supervisor responsável.',
        confirmText: 'Excluir Motoboy',
        onConfirm: async () => {
            write('nl_motoboys', allMotoboys().filter(x => x.id !== id));
            if (supabaseClient) {
                await supabaseClient.from('motoboys').delete().eq('id', id);
            }
            showToast('Motoboy removido!');
            renderMotoboysPage();
        }
    });
}

function renderBackupPage() {
    if (!hasAdminAccess(currentUser)) return;

    appFrame('Backup & Importação de Dados', 'Exporte o banco de dados completo em JSON ou baixe uma PLANILHA CONSOLIDADA ÚNICA (CSV/Excel) com estoque e vendas dos últimos 7 dias.', `
        <div class="panel glass-panel p-6 rounded-2xl bg-emerald-950/5 border border-emerald-300 mb-6">
            <div class="flex items-center gap-3 mb-3">
                <span class="p-3 bg-emerald-100 text-emerald-700 rounded-xl text-xl font-bold">📊</span>
                <div>
                    <h2 class="text-base font-extrabold text-slate-900">Exportar Planilha Consolidada Completa (CSV / Excel)</h2>
                    <p class="text-xs text-slate-600">Gera UMA ÚNICA PLANILHA unificada contendo o Estoque de Vendedores, Estoque de Supervisores, Vendas dos Últimos 7 Dias e Histórico de Baixas.</p>
                </div>
            </div>
            <button id="exportConsolidatedCsvBtn" class="primary-btn w-full text-xs py-3 flex items-center justify-center gap-2" style="background: #059669;">
                ${icons.pdf} <span>📊 Baixar Planilha Geral Consolidada (.CSV)</span>
            </button>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div class="panel glass-panel p-6 rounded-2xl bg-white/90 border border-slate-200 flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="p-2.5 bg-sky-100 text-sky-600 rounded-xl">${icons.database}</span>
                        <div>
                            <h2 class="text-base font-bold text-slate-900">Exportar Backup Completo (JSON)</h2>
                            <p class="text-xs text-slate-500">Gera um arquivo com todos os cadastros, estoques, vendas e motoboys do sistema.</p>
                        </div>
                    </div>
                </div>
                <button id="exportBackupJsonBtn" class="primary-btn w-full flex items-center justify-center gap-2">
                    ${icons.pdf} <span>Baixar Backup Completo (.JSON)</span>
                </button>
            </div>

            <div class="panel glass-panel p-6 rounded-2xl bg-white/90 border border-slate-200 flex flex-col justify-between">
                <div>
                    <div class="flex items-center gap-3 mb-3">
                        <span class="p-2.5 bg-emerald-100 text-emerald-600 rounded-xl">${icons.refresh}</span>
                        <div>
                            <h2 class="text-base font-bold text-slate-900">Importar / Restaurar Backup (JSON)</h2>
                            <p class="text-xs text-slate-500">Selecione um arquivo de backup para restaurar os dados no sistema.</p>
                        </div>
                    </div>
                </div>
                <div class="relative">
                    <input type="file" id="importJsonFileInput" accept=".json" class="hidden">
                    <button id="triggerImportJsonBtn" class="outline-btn w-full flex items-center justify-center gap-2" style="background: #0284c7; color: white; border: none;">
                        ${icons.check} <span>Selecionar Arquivo de Backup</span>
                    </button>
                </div>
            </div>
        </div>
    `);

    document.getElementById('exportConsolidatedCsvBtn').onclick = () => {
        confirmActionModal({
            title: 'Gerar Planilha Consolidada Completa',
            warningText: 'Deseja exportar a planilha unificada contendo o estoque de vendedores, estoque de supervisores, vendas dos últimos 7 dias e baixas efetuadas?',
            confirmText: 'Exportar Planilha',
            onConfirm: () => exportConsolidatedExcelCSV()
        });
    };

    document.getElementById('exportBackupJsonBtn').onclick = () => {
        confirmActionModal({
            title: 'Gerar Backup Completo',
            warningText: 'Deseja gerar e baixar o arquivo JSON com todo o banco de dados atual?',
            confirmText: 'Baixar Backup',
            onConfirm: () => {
                const backupData = {
                    systemVersion: 'v20',
                    exportedAt: new Date().toISOString(),
                    users: allUsers(),
                    warehouses: warehouses(),
                    warehouseInventory: warehouseInventory(),
                    transfers: warehouseTransfers(),
                    products: products(),
                    sales: sales(),
                    orders: orders(),
                    motoboys: allMotoboys(),
                    customCatalog: read('atlasCustomCatalog', [])
                };

                const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(backupData, null, 2));
                const dlAnchorElem = document.createElement('a');
                dlAnchorElem.setAttribute('href', dataStr);
                dlAnchorElem.setAttribute('download', `newlife-backup-${new Date().toISOString().slice(0, 10)}.json`);
                document.body.appendChild(dlAnchorElem);
                dlAnchorElem.click();
                dlAnchorElem.remove();
                showToast('Backup JSON gerado com sucesso!');
            }
        });
    };

    const fileInput = document.getElementById('importJsonFileInput');
    document.getElementById('triggerImportJsonBtn').onclick = () => fileInput.click();

    fileInput.onchange = e => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = event => {
            try {
                const data = JSON.parse(event.target.result);
                confirmActionModal({
                    title: 'Restaurar Banco de Dados Completo',
                    subtitle: `Arquivo: ${file.name}`,
                    warningText: 'Esta operação irá sobrescrever permanentemente os dados locais.',
                    confirmText: 'Sobrescrever e Restaurar',
                    onConfirm: () => {
                        write('nl_users', data.users || []);
                        write('nl_warehouses', data.warehouses || []);
                        write('nl_warehouse_inventory', data.warehouseInventory || []);
                        write('nl_transfers', data.transfers || []);
                        write('atlasProducts', data.products || []);
                        write('atlasSales', data.sales || []);
                        write('atlasOrders', data.orders || []);
                        write('nl_motoboys', data.motoboys || []);
                        showToast('Banco de dados restaurado!');
                        setTimeout(() => location.reload(), 1000);
                    }
                });
            } catch (err) {
                alert('Erro ao carregar o arquivo JSON.');
            }
        };
        reader.readAsText(file);
    };
}

function exportConsolidatedExcelCSV() {
    const usersList = allUsers();
    const sellersList = allSellers();
    const supsList = allSupervisors();
    const prodsList = products();
    const salesList = sales();
    const whList = warehouses();
    const invList = warehouseInventory();

    let csv = `NEWLIFE.SYSTEM - RELATORIO CONSOLIDADO COMPLETO EM REAIS (R$)\nData de Geracao: "${new Date().toLocaleString('pt-BR')}"\n\n`;

    csv += `=== 1. ESTOQUE EM POSSE DOS VENDEDORES ===\nVendedor,Supervisor Responsavel,Cidade/UF,Produto,Marca,Quantidade em Estoque,Preco Unitario (R$),Valor Total Em Posse (R$)\n`;
    sellersList.forEach(s => {
        const sProds = prodsList.filter(p => p.sellerId === s.id && p.stock > 0);
        if (sProds.length) {
            sProds.forEach(p => {
                csv += `"${s.name} (@${s.user})","${s.supervisor}","${s.city}/${s.uf}","${p.name}","${p.brand}",${p.stock},${p.price.toFixed(2)},${(p.stock * p.price).toFixed(2)}\n`;
            });
        } else {
            csv += `"${s.name} (@${s.user})","${s.supervisor}","${s.city}/${s.uf}","Sem Estoque","—",0,0.00,0.00\n`;
        }
    });

    csv += `\n=== 2. ESTOQUE EM POSSE DOS SUPERVISORES ===\nSupervisor,Cidade/UF,Produto,Marca,Quantidade em Estoque,Preco Unitario (R$),Valor Total Em Posse (R$)\n`;
    supsList.forEach(sup => {
        const supProds = prodsList.filter(p => p.sellerId === sup.id && p.stock > 0);
        if (supProds.length) {
            supProds.forEach(p => {
                csv += `"${sup.name} (@${sup.user})","${sup.city}/${sup.uf}","${p.name}","${p.brand}",${p.stock},${p.price.toFixed(2)},${(p.stock * p.price).toFixed(2)}\n`;
            });
        } else {
            csv += `"${sup.name} (@${sup.user})","${sup.city}/${sup.uf}","Sem Estoque","—",0,0.00,0.00\n`;
        }
    });

    csv += `\n=== 3. RESUMO DE VENDAS E BAIXAS NOS ULTIMOS 7 DIAS ===\nNome Integrante,Cargo / Função,Supervisor,Cidade/UF,Qtd Vendas (Ultimos 7 Dias),Total Faturado em Reais (R$)\n`;
    [...supsList, ...sellersList].forEach(u => {
        const sales7d = periodSales(u.id, '7days');
        const totalQty7d = sales7d.reduce((a, x) => a + x.quantity, 0);
        const totalRev7d = sales7d.reduce((a, x) => a + x.total, 0);
        csv += `"${u.name} (@${u.user})","${u.role}","${u.supervisor || 'Geral'}","${u.city}/${u.uf}",${totalQty7d},${totalRev7d.toFixed(2)}\n`;
    });

    csv += `\n=== 4. HISTORICO COMPLETO DE BAIXAS REGISTRADAS ===\nID Venda,Data e Hora,Vendedor / Responsavel,Produto,Quantidade Vendida,Preco Unitario (R$),Total Faturado (R$)\n`;
    salesList.slice().reverse().forEach(s => {
        const seller = usersList.find(u => u.id === s.sellerId);
        const prod = prodsList.find(p => p.id === s.productId);
        csv += `"${s.id}","${new Date(s.createdAt).toLocaleString('pt-BR')}","${seller ? seller.name : s.sellerId}","${prod ? prod.name : 'Produto Registrado'}",${s.quantity},${(s.unitPrice || 0).toFixed(2)},${s.total.toFixed(2)}\n`;
    });

    csv += `\n=== 5. ESTOQUE FISICO NOS DEPOSITOS MATRIZ ===\nDeposito,Localizacao,Produto,Marca,Estoque Fisico Disponivel\n`;
    invList.forEach(i => {
        const w = whList.find(x => x.id === i.warehouseId);
        csv += `"${w ? w.name : i.warehouseId}","${w ? w.city : ''}/${w ? w.uf : ''}","${i.productName}","${i.brand}",${i.stock}\n`;
    });

    downloadCSV(csv, `newlife-planilha-consolidada-${new Date().toISOString().slice(0, 10)}.csv`);
}

function downloadCSV(csvContent, fileName) {
    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.setAttribute('href', URL.createObjectURL(blob));
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Planilha Consolidada baixada!');
}

function renderSupervisorSalesPage() {
    const myProducts = products().filter(p => p.sellerId === currentUser.id && Number(p.stock) > 0);

    appFrame('Dar Baixa / Registrar Vendas (Supervisor)', 'Registre as vendas efetuadas diretamente do seu estoque próprio de supervisor.', `
        <div class="panel glass-panel">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2>Registrar Baixas do Seu Estoque</h2>
                ${myProducts.length ? `<button id="registerSupSaleBtn" class="primary-btn w-full sm:w-auto">${icons.check} Confirmar Vendas</button>` : ''}
            </div>
            ${myProducts.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 2fr 2fr 1.2fr 1.8fr; align-items: center;">
                        <span>Produto</span><span>Preço Unitário (R$)</span><span>Seu Estoque Disponível</span><span>Qtd Vendida Hoje</span>
                    </div>
                    ${myProducts.map(p => `
                        <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                <div><b class="text-slate-900">${esc(p.name)}</b> <small class="text-slate-500 block md:inline">(${esc(p.brand)})</small></div>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Preço</span>
                                <span class="text-slate-700 font-semibold">${money(p.price)}</span>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Estoque Disponível</span>
                                <b class="text-emerald-600">${p.stock} un.</b>
                            </div>
                            <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd Vendida</span>
                                <input class="sup-baja-input control w-28 md:w-full" data-id="${p.id}" type="number" min="0" max="${p.stock}" value="0">
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state">Você não possui produtos em seu estoque no momento.</div>'}
        </div>
    `);

    const btn = document.getElementById('registerSupSaleBtn');
    if (btn) {
        btn.onclick = () => {
            const inputs = [...document.querySelectorAll('.sup-baja-input')];
            const items = inputs.map(i => ({ p: myProducts.find(x => x.id === i.dataset.id), q: Number(i.value) })).filter(x => x.q > 0);
            if (!items.length) return alert('Informe a quantidade de vendas.');

            confirmActionModal({
                title: 'Confirmar Baixa de Vendas',
                warningText: `Deseja dar baixa em ${items.reduce((a,x)=>a+x.q,0)} unidade(s) do seu estoque?`,
                confirmText: 'Confirmar Vendas',
                onConfirm: async () => {
                    const pl = products();
                    const sl = sales();

                    for (const x of items) {
                        const targetP = pl.find(p => p.id === x.p.id);
                        if (targetP) targetP.stock -= x.q;
                        const newSale = {
                            id: uid(),
                            sellerId: currentUser.id,
                            productId: x.p.id,
                            quantity: x.q,
                            unitPrice: x.p.price,
                            total: x.q * x.p.price,
                            createdAt: new Date().toISOString()
                        };
                        sl.push(newSale);

                        if (supabaseClient) {
                            await supabaseClient.from('seller_products').update({ stock: targetP.stock }).eq('id', targetP.id);
                            await supabaseClient.from('sales').insert({
                                id: newSale.id,
                                seller_id: newSale.sellerId,
                                product_id: newSale.productId,
                                quantity: newSale.quantity,
                                unit_price: newSale.unitPrice,
                                total: newSale.total,
                                created_at: newSale.createdAt
                            });
                        }
                    }

                    write('atlasProducts', pl);
                    write('atlasSales', sl);
                    showToast('Vendas do supervisor registradas!');
                    renderSupervisorSalesPage();
                }
            });
        };
    }
}

function transferSupervisorStockModal() {
    const myProds = products().filter(p => p.sellerId === currentUser.id && p.stock > 0);
    const mySellers = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => (s.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase());

    if (!myProds.length) return alert('Você não possui produtos em seu estoque no momento para enviar.');
    if (!mySellers.length) return alert('Você não possui vendedores cadastrados para receber produtos.');

    const m = modal(`
        <h2>Enviar Produtos para Vendedor</h2>
        <p class="text-xs text-slate-500 mb-3">Transfira itens do seu próprio estoque de supervisor diretamente para a sua equipe.</p>
        <form id="supTransferForm" class="seller-form">
            <label>Selecione o Vendedor Destinatário
                <select name="targetId" class="control" required>
                    ${mySellers.map(s => `<option value="${s.id}">${esc(s.name)} (@${esc(s.user)}) — ${esc(s.city)}/${esc(s.uf)}</option>`).join('')}
                </select>
            </label>

            <label>Produto Disponível em Seu Estoque
                <select name="productId" class="control" required>
                    ${myProds.map(p => `<option value="${p.id}">${esc(p.name)} (${esc(p.brand)}) — Disponível: ${p.stock} un.</option>`).join('')}
                </select>
            </label>

            <div class="form-grid">
                <label>Quantidade a Enviar
                    <input name="quantity" type="number" min="1" value="1" class="control" required>
                </label>
                <label>Preço de Venda do Vendedor (R$)
                    <input name="price" type="number" step="0.01" min="0" placeholder="250.00" class="control" required>
                </label>
            </div>

            <button type="button" id="triggerSupTransfer" class="primary-btn w-full mt-3">${icons.check} Confirmar Transferência</button>
        </form>
    `);

    m.querySelector('#triggerSupTransfer').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        const productId = f.get('productId');
        const targetId = f.get('targetId');
        const qty = Number(f.get('quantity'));
        const priceBRL = Number(f.get('price'));

        const prods = products();
        const supItem = prods.find(p => p.id === productId);
        const targetSeller = mySellers.find(s => s.id === targetId);

        if (!supItem) return alert('Produto inválido.');
        if (qty > supItem.stock) return alert(`Quantidade indisponível. Seu saldo é de ${supItem.stock} un.`);

        confirmActionModal({
            title: 'Confirmar Envio ao Vendedor',
            subtitle: `${qty}x ${supItem.name} → ${targetSeller.name} por ${moneySimple(priceBRL)}/un.`,
            warningText: 'A quantidade será debitada do seu estoque e creditada ao vendedor.',
            confirmText: 'Enviar Agora',
            onConfirm: async () => {
                supItem.stock -= qty;

                let sellerItem = prods.find(p => p.sellerId === targetSeller.id && p.name === supItem.name);
                if (sellerItem) {
                    sellerItem.stock += qty;
                    sellerItem.price = priceBRL;
                } else {
                    sellerItem = { id: uid(), sellerId: targetSeller.id, name: supItem.name, brand: supItem.brand, price: priceBRL, stock: qty };
                    prods.push(sellerItem);
                }
                write('atlasProducts', prods);

                const newTransfer = {
                    id: uid(),
                    warehouseId: 'sup_' + currentUser.id,
                    warehouseName: `Supervisor ${currentUser.name}`,
                    targetType: 'SELLER',
                    targetId: targetSeller.id,
                    targetName: targetSeller.name,
                    productName: supItem.name,
                    brand: supItem.brand,
                    quantity: qty,
                    price: priceBRL,
                    reverted: false,
                    createdAt: new Date().toISOString()
                };

                const transfers = warehouseTransfers();
                transfers.push(newTransfer);
                write('nl_transfers', transfers);

                if (supabaseClient) {
                    await supabaseClient.from('seller_products').upsert({ id: supItem.id, seller_id: currentUser.id, name: supItem.name, brand: supItem.brand, price: supItem.price, stock: supItem.stock });
                    await supabaseClient.from('seller_products').upsert({ id: sellerItem.id, seller_id: sellerItem.sellerId, name: sellerItem.name, brand: sellerItem.brand, price: sellerItem.price, stock: sellerItem.stock });
                    await supabaseClient.from('transfers').insert({
                        id: newTransfer.id,
                        warehouse_id: newTransfer.warehouseId,
                        warehouse_name: newTransfer.warehouseName,
                        target_type: newTransfer.targetType,
                        target_id: newTransfer.targetId,
                        target_name: newTransfer.targetName,
                        product_name: newTransfer.productName,
                        brand: newTransfer.brand,
                        quantity: newTransfer.quantity,
                        price: newTransfer.price,
                        reverted: false,
                        created_at: newTransfer.createdAt
                    });
                }

                m.remove();
                showToast('Produtos enviados ao vendedor com sucesso!');
                activeTab === 'products' ? renderProductsPage() : renderSellersPage();
            }
        });
    };
}

function renderMapPage() {
    const users = allUsers();
    const isAdm = hasAdminAccess(currentUser);
    const filteredUsers = isAdm ? users : users.filter(u => u.role === 'STOCK' || u.user === currentUser.user || u.supervisor === currentUser.user);

    appFrame('Mapa de Localizações da Equipe', 'Visualização geográfica de Vendedores, Supervisores e Depósitos no Brasil e Paraguai (ASU).', `
        <div class="stats-grid mb-6">
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Total Mapeados</span><span class="metric-icon cyan">${icons.map}</span></div>
                <div class="metric-value">${filteredUsers.length} Pessoas/Depósitos</div>
            </div>
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Legenda do Mapa</span><span class="metric-icon orange">${icons.users}</span></div>
                <div class="flex items-center gap-3 mt-2 text-xs font-bold flex-wrap">
                    <span style="color:#2563eb;">🔵 Estoque Matriz</span>
                    <span style="color:#7c3aed;">🟣 Supervisor</span>
                    <span style="color:#059669;">🟢 Vendedor</span>
                </div>
            </div>
        </div>

        <div class="panel glass-panel overflow-hidden p-0 rounded-2xl" style="height: 450px; min-height: 350px; position: relative;">
            <div id="teamMap" style="width: 100%; height: 100%; z-index: 1;"></div>
        </div>
    `);

    loadLeaflet(() => {
        const mapContainer = document.getElementById('teamMap');
        if (!mapContainer) return;

        const map = L.map('teamMap').setView([-15.7801, -47.9292], 4);
        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 18, attribution: '© OpenStreetMap' }).addTo(map);

        const blueIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
        const violetIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });
        const greenIcon = L.icon({ iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png', shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png', iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41] });

        const bounds = [];
        filteredUsers.forEach(u => {
            const coords = cityCoordinates[u.city] || [-23.5505, -46.6333];
            const latJitter = coords[0] + (Math.random() - 0.5) * 0.05;
            const lngJitter = coords[1] + (Math.random() - 0.5) * 0.05;

            let markerIcon = greenIcon;
            let roleLabel = 'Vendedor';
            if (u.role === 'STOCK') { markerIcon = blueIcon; roleLabel = 'Estoque Matriz'; }
            else if (u.role.includes('SUPERVISOR')) { markerIcon = violetIcon; roleLabel = 'Supervisor'; }

            const popupContent = `
                <div style="font-family: sans-serif; padding: 4px;">
                    <h4 style="margin: 0 0 4px 0; font-size: 14px; font-weight: bold; color: #0f172a;">${esc(u.name)}</h4>
                    <span style="font-size: 11px; padding: 2px 6px; background: #e2e8f0; border-radius: 4px; font-weight: bold; color: #334155;">${roleLabel}</span>
                    <p style="margin: 8px 0 0 0; font-size: 11px; color: #64748b;">
                        📍 <b>Local:</b> ${esc(u.city || 'N/A')} / ${esc(u.uf || 'N/A')}<br>
                        ${u.supervisor ? `👤 <b>Supervisor:</b> @${esc(u.supervisor)}` : ''}
                    </p>
                </div>
            `;

            const m = L.marker([latJitter, lngJitter], { icon: markerIcon }).addTo(map);
            m.bindPopup(popupContent);
            bounds.push([latJitter, lngJitter]);
        });

        if (bounds.length) map.fitBounds(bounds, { padding: [40, 40] });
    });
}

function renderSummary() {
    const mySellers = allSellers().filter(s => s.supervisor === currentUser.user);
    const rows = mySellers.map(s => ({ s, xs: periodSales(s.id, 'day') }));
    const revBRL = rows.reduce((a, r) => a + r.xs.reduce((x, v) => x + v.total, 0), 0);
    const qty = rows.reduce((a, r) => a + r.xs.reduce((x, v) => x + v.quantity, 0), 0);

    appFrame('Resumo da Equipe', 'Visão geral das vendas do dia da equipe.', `
        <div class="stats-grid">
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Faturamento Hoje</span><span class="metric-icon cyan">${icons.dollar}</span></div>
                <div class="metric-value text-base md:text-lg font-black">${money(revBRL)}</div>
            </div>
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Itens Vendidos</span><span class="metric-icon green">${icons.check}</span></div>
                <div class="metric-value text-lg font-black">${qty} un.</div>
            </div>
        </div>

        <div class="panel glass-panel mt-6">
            <div class="panel-head mb-4"><h2>Desempenho da Equipe Hoje</h2></div>
            <div class="data-table flex flex-col gap-3">
                <div class="table-head hidden md:grid" style="grid-template-columns: 2fr 1.5fr 1fr 2fr; align-items: center;">
                    <span>Vendedor</span><span>Localização</span><span>Qtd Vendida</span><span>Faturamento (R$)</span>
                </div>
                ${rows.map(r => `
                    <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                            <div class="flex items-center gap-2">${renderAvatarHTML(r.s, 'small')}<b class="text-slate-900">${esc(r.s.name)}</b></div>
                        </div>
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Localização</span>
                            <span class="text-slate-700">${esc(r.s.city || 'N/A')} / ${esc(r.s.uf || 'N/A')}</span>
                        </div>
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd</span>
                            <b>${r.xs.reduce((a, x) => a + x.quantity, 0)} un.</b>
                        </div>
                        <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Faturamento</span>
                            <strong class="highlight-val">${money(r.xs.reduce((a, x) => a + x.total, 0))}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
}

function renderWarehousesPage() {
    const whList = warehouses();
    const inv = warehouseInventory();
    const transfers = warehouseTransfers();

    appFrame('3 Estoques Separados (Somente ADM)', 'Gerencie o estoque físico dos depósitos matriz e envie produtos.', `
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            ${whList.map(w => {
                const wItems = inv.filter(i => i.warehouseId === w.id);
                const totalQty = wItems.reduce((a, i) => a + Number(i.stock || 0), 0);
                return `
                    <div class="p-5 glass-panel rounded-2xl bg-white/80 border border-slate-200 shadow-sm flex flex-col justify-between gap-3">
                        <div>
                            <div class="flex justify-between items-center mb-2">
                                <h3 class="font-black text-slate-900 text-base flex items-center gap-2">${icons.warehouse} ${esc(w.name)}</h3>
                                <span class="status-pill style-blue">${esc(w.uf)}</span>
                            </div>
                            <p class="text-xs text-slate-500 mb-3">Localização: ${esc(w.city)} (${esc(w.country)})</p>
                            <div class="p-3 bg-slate-100 rounded-xl mb-2">
                                <span class="text-[10px] font-bold text-slate-500 uppercase block">Estoque Físico Registrado</span>
                                <strong class="text-lg text-slate-900 font-extrabold">${totalQty} unidades</strong>
                                <small class="block text-slate-500 mt-1">${wItems.length} tipo(s) de produtos</small>
                            </div>
                        </div>
                        <div class="flex flex-col sm:flex-row gap-2">
                            <button class="primary-btn flex-1 add-item-wh text-xs py-2" data-id="${w.id}">+ Inserir Produto</button>
                            <button class="outline-btn flex-1 send-from-wh text-xs py-2" data-id="${w.id}">Enviar Produtos</button>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>

        <div class="panel glass-panel mb-6">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
                <div><h2>Produtos nos Depósitos Matriz</h2><p>Listagem de inventário físico dos estoques centrais.</p></div>
            </div>
            <div class="data-table flex flex-col gap-3">
                <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 2.5fr 1.5fr auto; align-items: center;">
                    <span>Depósito / Estoque</span><span>Produto & Marca</span><span>Estoque Físico Disponível</span><span>Ações</span>
                </div>
                ${inv.length ? inv.map(i => {
                    const w = whList.find(x => x.id === i.warehouseId);
                    return `
                        <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Depósito</span>
                                <b>${esc(w?.name || 'Desconhecido')}</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                <span><b>${esc(i.productName)}</b> <small>(${esc(i.brand)})</small></span>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Estoque</span>
                                <strong class="text-slate-800">${i.stock} un.</strong>
                            </div>
                            <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                <button class="small-btn edit-inv-btn" data-id="${i.id}">Ajustar Qtd</button>
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="p-6 text-center text-slate-400">Nenhum produto cadastrado nos estoques. Clique em "+ Inserir Produto" para adicionar.</div>'}
            </div>
        </div>

        <div class="panel glass-panel">
            <div class="panel-head mb-4"><h2>Histórico Geral de Transferências (Com opção de Desfazer)</h2></div>
            ${transfers.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 1.2fr 1.3fr 1.1fr 1.5fr 1.8fr 1fr 1.8fr auto; align-items: center;">
                        <span>Data</span><span>Estoque Origem</span><span>Tipo Destino</span><span>Destinatário</span><span>Produto</span><span>Qtd</span><span>Preço Def. (R$)</span><span>Ações</span>
                    </div>
                    ${transfers.slice().reverse().map(t => `
                        <div class="table-row flex flex-col md:grid md:grid-cols-8 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Data</span>
                                <small>${new Date(t.createdAt).toLocaleString('pt-BR')}</small>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Origem</span>
                                <b>${esc(t.warehouseName)}</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Tipo</span>
                                <span class="status-pill">${t.targetType === 'SUPERVISOR' ? 'Supervisor' : 'Vendedor'}</span>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Destinatário</span>
                                <b>${esc(t.targetName)}</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                <span>${esc(t.productName)}</span>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd</span>
                                <b>${t.quantity} un.</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Preço</span>
                                <span class="font-bold text-emerald-600">${money(t.price)}</span>
                            </div>
                            <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                ${t.reverted ? `<span class="status-pill style-red">🔴 Desfeito</span>` : `<button class="delete-btn undo-transfer-btn text-xs py-1 px-2.5 flex items-center gap-1" data-id="${t.id}">${icons.undo} Desfazer Envio</button>`}
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="p-6 text-center text-slate-400">Nenhum envio de estoque registrado ainda.</div>'}
        </div>
    `);

    document.querySelectorAll('.add-item-wh').forEach(b => b.onclick = () => addWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.send-from-wh').forEach(b => b.onclick = () => transferStockModal(b.dataset.id));
    document.querySelectorAll('.edit-inv-btn').forEach(b => b.onclick = () => editWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.undo-transfer-btn').forEach(b => b.onclick = () => undoTransferModal(b.dataset.id));
}

function renderStockPanel() {
    const wh = warehouses().find(w => w.id === currentUser.warehouseId) || warehouses()[0];
    const myInv = warehouseInventory().filter(i => i.warehouseId === wh.id);
    const myTransfers = warehouseTransfers().filter(t => t.warehouseId === wh.id);

    const container = getAppRoot();
    container.innerHTML = `
        <div class="app-layout w-full min-h-screen flex flex-col justify-between">
            <header class="app-header glass-panel sticky top-0 z-30 w-full p-3 md:p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm flex flex-row justify-between items-center">
                <div class="flex items-center gap-3">
                    <div class="brand-mark text-sky-600">${icons.warehouse}</div>
                    <div>
                        <h1 class="text-lg font-black text-slate-900">${esc(currentUser.name)}</h1>
                        <p class="text-xs text-slate-500">Gestão Exclusiva do Estoque · ${esc(wh.city)} (${esc(wh.country)})</p>
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button id="refreshStockScreen" class="outline-btn flex items-center gap-1 text-xs px-3 py-1.5 bg-sky-50 text-sky-700 font-bold border-sky-200">${icons.refresh} <span>Atualizar</span></button>
                    <button id="stockLogout" class="outline-btn flex items-center gap-1 text-xs px-3 py-1.5">${icons.logout} <span>Sair</span></button>
                </div>
            </header>

            <main class="p-4 md:p-6 flex-1 max-w-6xl w-full mx-auto space-y-6">
                <div class="p-5 glass-panel rounded-2xl flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                        <h2 class="text-lg font-bold text-slate-900">Enviar Produtos deste Estoque</h2>
                        <p class="text-xs text-slate-500">Escolha o destinatário (Supervisor ou Vendedor) e defina o preço de venda em Reais (R$).</p>
                    </div>
                    <div class="flex gap-2 w-full sm:w-auto">
                        <button id="stockAddItemBtn" class="outline-btn flex-1 sm:flex-none text-xs py-2">+ Adicionar Produtos</button>
                        <button id="stockDispatchBtn" class="primary-btn flex-1 sm:flex-none text-xs py-2">${icons.check} Enviar Produtos</button>
                    </div>
                </div>

                <div class="panel glass-panel p-4 md:p-6 rounded-2xl">
                    <h3 class="text-sm font-bold mb-4 text-sky-600 uppercase tracking-wider">Produtos Disponíveis neste Estoque (${myInv.length})</h3>
                    ${myInv.length ? `
                        <div class="data-table flex flex-col gap-3">
                            <div class="table-head hidden md:grid" style="grid-template-columns: 2.5fr 1fr auto; align-items: center;">
                                <span>Produto & Marca</span><span>Qtd Físico em Estoque</span><span>Ações</span>
                            </div>
                            ${myInv.map(i => `
                                <div class="table-row flex flex-col md:grid md:grid-cols-3 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 bg-white rounded-xl md:rounded-none">
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                        <span><b>${esc(i.productName)}</b> <small class="text-slate-500">(${esc(i.brand)})</small></span>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Estoque</span>
                                        <b class="text-emerald-600">${i.stock} un.</b>
                                    </div>
                                    <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                        <button class="small-btn edit-stock-item" data-id="${i.id}">Ajustar Qtd</button>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="p-8 text-center text-slate-400">Nenhum produto cadastrado neste estoque.</div>'}
                </div>

                <div class="panel glass-panel p-4 md:p-6 rounded-2xl">
                    <h3 class="text-sm font-bold mb-4 text-sky-600 uppercase tracking-wider">Histórico de Saídas / Envios</h3>
                    ${myTransfers.length ? `
                        <div class="data-table flex flex-col gap-3">
                            <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 1.2fr 1.5fr 1.5fr 1fr 1.8fr auto; align-items: center;">
                                <span>Data</span><span>Tipo Destino</span><span>Destinatário</span><span>Produto</span><span>Qtd</span><span>Preço Def. (R$)</span><span>Ações</span>
                            </div>
                            ${myTransfers.slice().reverse().map(t => `
                                <div class="table-row flex flex-col md:grid md:grid-cols-7 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 bg-white rounded-xl md:rounded-none text-xs">
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Data</span>
                                        <small class="text-slate-500">${new Date(t.createdAt).toLocaleString('pt-BR')}</small>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Tipo</span>
                                        <span class="status-pill style-blue">${t.targetType === 'SUPERVISOR' ? 'Supervisor' : 'Vendedor'}</span>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Destinatário</span>
                                        <b class="text-slate-800">${esc(t.targetName)}</b>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                        <span>${esc(t.productName)}</span>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd</span>
                                        <b>${t.quantity} un.</b>
                                    </div>
                                    <div class="flex justify-between items-center md:block">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Preço</span>
                                        <b class="text-emerald-600">${money(t.price)}</b>
                                    </div>
                                    <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                        <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                        ${t.reverted ? `<span class="status-pill style-red">🔴 Desfeito</span>` : `<button class="delete-btn undo-transfer-btn text-xs py-1 px-2.5 flex items-center gap-1" data-id="${t.id}">${icons.undo} Desfazer Envio</button>`}
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    ` : '<div class="p-8 text-center text-slate-400">Nenhum envio realizado ainda por este depósito.</div>'}
                </div>
            </main>

            ${appFooter()}
        </div>
    `;

    document.getElementById('refreshStockScreen').onclick = () => { renderStockPanel(); showToast('Painel atualizado!'); };
    document.getElementById('stockLogout').onclick = logout;
    document.getElementById('stockAddItemBtn').onclick = () => addWarehouseItemModal(wh.id);
    document.getElementById('stockDispatchBtn').onclick = () => transferStockModal(wh.id);
    document.querySelectorAll('.edit-stock-item').forEach(b => b.onclick = () => editWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.undo-transfer-btn').forEach(b => b.onclick = () => undoTransferModal(b.dataset.id));
}

function addWarehouseItemModal(warehouseId) {
    const wh = warehouses().find(w => w.id === warehouseId);
    const sysCat = systemCatalog();

    const m = modal(`
        <h2>Adicionar Produto ao Estoque (${esc(wh.name)})</h2>
        <form id="entityForm" class="seller-form">
            <label>Produto do Catálogo
                <select name="catalogIndex" class="control" required>
                    ${sysCat.map((c, i) => `<option value="${i}">${esc(c[0])} · ${esc(c[1])}</option>`).join('')}
                </select>
            </label>
            <div class="form-grid">
                <label>Quantidade Física em Estoque
                    <input name="stock" type="number" min="1" value="50" class="control" required>
                </label>
            </div>
            <button type="button" id="triggerAddInv" class="primary-btn w-full mt-3">${icons.check} Adicionar ao Estoque Matriz</button>
        </form>
    `);

    m.querySelector('#triggerAddInv').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        confirmActionModal({
            title: 'Adicionar Produto ao Depósito Matriz',
            subtitle: `${f.get('stock')} un. → ${wh.name}`,
            warningText: 'Confirmar inclusão do novo item no estoque central?',
            confirmText: 'Confirmar e Adicionar',
            onConfirm: async () => {
                const idx = Number(f.get('catalogIndex'));
                const item = sysCat[idx];
                const inv = warehouseInventory();
                const newItem = { id: uid(), warehouseId, productName: item[0], brand: item[1], stock: Number(f.get('stock')) };

                inv.push(newItem);
                write('nl_warehouse_inventory', inv);

                if (supabaseClient) {
                    await supabaseClient.from('warehouse_inventory').insert({
                        id: newItem.id,
                        warehouse_id: newItem.warehouseId,
                        product_name: newItem.productName,
                        brand: newItem.brand,
                        stock: newItem.stock
                    });
                }

                m.remove();
                showToast('Produto adicionado ao estoque!');
                currentUser.role === 'STOCK' ? renderStockPanel() : renderWarehousesPage();
            }
        });
    };
}

function editWarehouseItemModal(itemId) {
    const inv = warehouseInventory();
    const item = inv.find(i => i.id === itemId);

    const m = modal(`
        <h2>Ajustar Estoque: ${esc(item.productName)}</h2>
        <form id="entityForm" class="seller-form">
            <label>Nova Quantidade Física em Estoque
                <input name="stock" type="number" min="0" value="${item.stock}" class="control" required>
            </label>
            <button type="button" id="triggerEditInv" class="primary-btn w-full mt-3">${icons.check} Atualizar Estoque</button>
        </form>
    `);

    m.querySelector('#triggerEditInv').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        confirmActionModal({
            title: 'Ajustar Estoque do Item',
            subtitle: `${item.productName}`,
            warningText: `A quantidade será alterada de ${item.stock} para ${f.get('stock')} unidades.`,
            confirmText: 'Atualizar Saldo',
            onConfirm: async () => {
                item.stock = Number(f.get('stock'));
                write('nl_warehouse_inventory', inv);

                if (supabaseClient) {
                    await supabaseClient.from('warehouse_inventory').update({ stock: item.stock }).eq('id', item.id);
                }

                m.remove();
                showToast('Estoque atualizado!');
                currentUser.role === 'STOCK' ? renderStockPanel() : renderWarehousesPage();
            }
        });
    };
}

function transferStockModal(forcedWarehouseId = null) {
    const whList = warehouses();
    const sellersList = allSellers();
    const supsList = allSupervisors();
    const currentInv = warehouseInventory();

    const m = modal(`
        <h2>Enviar Produtos do Estoque Matriz</h2>
        <p>Selecione o destinatário e defina o <b>preço de venda em Reais (R$)</b>.</p>
        <form id="entityForm" class="seller-form">
            <label>Estoque Origem
                <select name="warehouseId" id="whSelect" class="control" ${forcedWarehouseId ? 'disabled' : ''} required>
                    ${whList.map(w => `<option value="${w.id}" ${forcedWarehouseId === w.id ? 'selected' : ''}>${esc(w.name)} (${esc(w.city)})</option>`).join('')}
                </select>
            </label>

            <label>Tipo de Destinatário
                <select name="targetType" id="targetTypeSelect" class="control" required>
                    <option value="SELLER" selected>Enviar para Vendedor</option>
                    <option value="SUPERVISOR">Enviar para Supervisor</option>
                </select>
            </label>

            <label id="targetLabel">Selecione o Destinatário
                <select name="targetId" id="targetIdSelect" class="control" required>
                    ${sellersList.map(s => `<option value="${s.id}">${esc(s.name)} (@${esc(s.user)})</option>`).join('')}
                </select>
            </label>

            <label>Produto Disponível em Estoque
                <select name="inventoryItemId" id="invItemSelect" class="control" required></select>
            </label>

            <div class="form-grid">
                <label>Quantidade a Enviar
                    <input name="quantity" type="number" min="1" value="10" class="control" required>
                </label>
                <label>Preço de Venda do Vendedor (R$)
                    <input name="price" type="number" step="0.01" min="0" placeholder="250.00" class="control" required>
                </label>
            </div>

            <button type="button" id="triggerTransfer" class="primary-btn w-full mt-3">${icons.check} Confirmar Envio e Debitar do Estoque</button>
        </form>
    `);

    const whSelect = m.querySelector('#whSelect');
    const targetTypeSelect = m.querySelector('#targetTypeSelect');
    const targetIdSelect = m.querySelector('#targetIdSelect');
    const invItemSelect = m.querySelector('#invItemSelect');

    const populateTargets = () => {
        const isSup = targetTypeSelect.value === 'SUPERVISOR';
        const list = isSup ? supsList : sellersList;
        targetIdSelect.innerHTML = list.map(x => `<option value="${x.id}">${esc(x.name)} (@${esc(x.user)})</option>`).join('');
    };

    const populateInventory = () => {
        const selectedWh = forcedWarehouseId || whSelect.value;
        const items = currentInv.filter(i => i.warehouseId === selectedWh && i.stock > 0);
        if (!items.length) {
            invItemSelect.innerHTML = '<option value="">Nenhum produto com estoque neste depósito</option>';
            invItemSelect.disabled = true;
        } else {
            invItemSelect.disabled = false;
            invItemSelect.innerHTML = items.map(i => `<option value="${i.id}">${esc(i.productName)} — Disp: ${i.stock} un.</option>`).join('');
        }
    };

    populateInventory();
    targetTypeSelect.onchange = populateTargets;
    if (!forcedWarehouseId) whSelect.onchange = populateInventory;

    m.querySelector('#triggerTransfer').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);

        const itemId = f.get('inventoryItemId');
        const invItem = currentInv.find(i => i.id === itemId);
        const qty = Number(f.get('quantity'));
        const priceBRL = Number(f.get('price'));

        if (!invItem) return alert('Selecione um produto válido.');
        if (qty > invItem.stock) return alert(`Quantidade indisponível em estoque. Máximo: ${invItem.stock}`);

        const targetType = f.get('targetType');
        const targetObj = targetType === 'SUPERVISOR' ? supsList.find(s => s.id === f.get('targetId')) : sellersList.find(s => s.id === f.get('targetId'));
        const wId = forcedWarehouseId || f.get('warehouseId');
        const whObj = whList.find(w => w.id === wId);

        confirmActionModal({
            title: 'Confirmar Envio do Estoque',
            subtitle: `${qty}x ${invItem.productName} → ${targetObj.name} por ${moneySimple(priceBRL)}/un.`,
            warningText: `A quantidade será debitada do estoque ${whObj.name} e creditada ao destinatário.`,
            confirmText: 'Enviar Agora',
            onConfirm: async () => {
                invItem.stock -= qty;
                write('nl_warehouse_inventory', currentInv);

                const newTransfer = {
                    id: uid(),
                    warehouseId: whObj.id,
                    warehouseName: whObj.name,
                    targetType,
                    targetId: targetObj.id,
                    targetName: targetObj.name,
                    productName: invItem.productName,
                    brand: invItem.brand,
                    quantity: qty,
                    price: priceBRL,
                    reverted: false,
                    createdAt: new Date().toISOString()
                };

                const transfers = warehouseTransfers();
                transfers.push(newTransfer);
                write('nl_transfers', transfers);

                const prods = products();
                let p = prods.find(x => x.sellerId === targetObj.id && x.name === invItem.productName);
                if (p) {
                    p.stock += qty;
                    p.price = priceBRL;
                } else {
                    p = { id: uid(), sellerId: targetObj.id, name: invItem.productName, brand: invItem.brand, price: priceBRL, stock: qty };
                    prods.push(p);
                }
                write('atlasProducts', prods);

                if (supabaseClient) {
                    await supabaseClient.from('warehouse_inventory').update({ stock: invItem.stock }).eq('id', invItem.id);
                    await supabaseClient.from('seller_products').upsert({ id: p.id, seller_id: p.sellerId, name: p.name, brand: p.brand, price: p.price, stock: p.stock });
                    await supabaseClient.from('transfers').insert({
                        id: newTransfer.id,
                        warehouse_id: newTransfer.warehouseId,
                        warehouse_name: newTransfer.warehouseName,
                        target_type: newTransfer.targetType,
                        target_id: newTransfer.targetId,
                        target_name: newTransfer.targetName,
                        product_name: newTransfer.productName,
                        brand: newTransfer.brand,
                        quantity: newTransfer.quantity,
                        price: newTransfer.price,
                        reverted: false,
                        created_at: newTransfer.createdAt
                    });
                }

                m.remove();
                showToast('Produto enviado com sucesso!');
                currentUser.role === 'STOCK' ? renderStockPanel() : renderWarehousesPage();
            }
        });
    };
}

function renderSupervisorOrdersPage() {
    const mySellers = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => (s.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase());
    const mySellerIds = mySellers.map(s => s.id);
    const activeOrders = orders().filter(o => mySellerIds.includes(o.sellerId) && o.status !== 'Entregue');

    appFrame('Pedidos em Reposição', 'Solicitações de novos produtos dos vendedores.', `
        <div class="panel glass-panel">
            <div class="panel-head mb-4"><h2>Solicitações Ativas (${activeOrders.length})</h2></div>
            ${activeOrders.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 1.2fr 2fr 1.5fr auto; align-items: center;">
                        <span>Vendedor</span><span>Data Desejada</span><span>Produtos Solicitados</span><span>Status</span><span>Ações</span>
                    </div>
                    ${activeOrders.slice().reverse().map(o => {
                        const seller = mySellers.find(s => s.id === o.sellerId);
                        return `
                            <div class="table-row flex flex-col md:grid md:grid-cols-5 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                                    <div class="flex items-center gap-2">${renderAvatarHTML(seller, 'small')}<b>${esc(seller?.name || o.sellerName)}</b></div>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Data</span>
                                    <strong class="text-sky-600">${o.deliveryDate ? new Date(o.deliveryDate + 'T12:00:00').toLocaleDateString('pt-BR') : '—'}</strong>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produtos</span>
                                    <span>${esc(o.productName || 'Vários itens')} (${o.quantity || 1} un)</span>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Status</span>
                                    <select class="control compact status-select w-32 md:w-full" data-id="${o.id}">
                                        <option value="Em análise" ${o.status === 'Em análise' ? 'selected' : ''}>Em análise</option>
                                        <option value="A caminho" ${o.status === 'A caminho' ? 'selected' : ''}>A caminho</option>
                                    </select>
                                </div>
                                <div class="flex justify-between items-center md:justify-end gap-2 pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Ações</span>
                                    <button class="small-btn mark-delivered" data-id="${o.id}">${icons.check} Marcar Entregue</button>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<div class="empty-state"><strong>Nenhum pedido pendente.</strong></div>'}
        </div>
    `);

    document.querySelectorAll('.status-select').forEach(sel => {
        sel.onchange = e => {
            const orderId = e.target.dataset.id;
            const newStatus = e.target.value;
            const allOrd = orders();
            const targetOrd = allOrd.find(o => o.id === orderId);

            confirmActionModal({
                title: 'Atualizar Status do Pedido',
                subtitle: `Pedido: ${targetOrd?.productName} (${targetOrd?.quantity} un) → Novo Status: ${newStatus}`,
                warningText: 'Deseja confirmar a alteração do status deste pedido de reposição?',
                confirmText: 'Atualizar Status',
                onConfirm: async () => {
                    if (targetOrd) {
                        targetOrd.status = newStatus;
                        write('atlasOrders', allOrd);
                        if (supabaseClient) {
                            await supabaseClient.from('orders').update({ status: newStatus }).eq('id', targetOrd.id);
                        }
                        showToast('Status do pedido atualizado!');
                        renderSupervisorOrdersPage();
                    }
                }
            });
        };
    });

    document.querySelectorAll('.mark-delivered').forEach(b => {
        b.onclick = () => {
            const allOrd = orders();
            const targetOrd = allOrd.find(o => o.id === b.dataset.id);

            confirmActionModal({
                title: 'Marcar Pedido como Entregue',
                subtitle: `Pedido: ${targetOrd?.productName}`,
                warningText: 'O pedido será finalizado e movido para o histórico de arquivados.',
                confirmText: 'Confirmar Entrega',
                onConfirm: async () => {
                    if (targetOrd) {
                        targetOrd.status = 'Entregue';
                        targetOrd.deliveredAt = new Date().toISOString();
                        write('atlasOrders', allOrd);
                        if (supabaseClient) {
                            await supabaseClient.from('orders').update({ status: 'Entregue', delivered_at: targetOrd.deliveredAt }).eq('id', targetOrd.id);
                        }
                        showToast('Pedido entregue e arquivado!');
                        renderSupervisorOrdersPage();
                    }
                }
            });
        };
    });
}

function renderArchivedPage() {
    const mySellers = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => (s.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase());
    const archived = orders().filter(o => mySellers.some(s => s.id === o.sellerId) && o.status === 'Entregue');

    appFrame('Arquivados / Histórico', 'Pedidos concluídos.', `
        <div class="panel glass-panel">
            <div class="panel-head mb-4"><h2>Pedidos Entregues (${archived.length})</h2></div>
            ${archived.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 1.2fr 2.5fr 1.2fr; align-items: center;">
                        <span>Vendedor</span><span>Data Solicitada</span><span>Produtos</span><span>Status</span>
                    </div>
                    ${archived.map(o => `
                        <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none">
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                                <b>${esc(o.sellerName)}</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Data</span>
                                <small>${new Date(o.createdAt).toLocaleDateString('pt-BR')}</small>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produtos</span>
                                <span>${esc(o.productName)} (${o.quantity} un)</span>
                            </div>
                            <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Status</span>
                                <span class="status-pill style-green">Entregue</span>
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state">Nenhum pedido arquivado.</div>'}
        </div>
    `);
}

function renderCatalogPage() {
    appFrame('Catálogo do Sistema', 'Catálogo oficial multi-marcas (Incluso TG e TG antiga).', `
        <div class="panel glass-panel">
            <div class="catalog-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${systemCatalog().map(p => `
                    <div class="catalog-card p-4 bg-white/90 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
                        <div class="catalog-badge self-start font-bold uppercase text-[10px] tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">${esc(p[1])}</div>
                        <h3 class="font-bold text-slate-900 text-sm mt-1">${esc(p[0])}</h3>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
}

function renderProductsPage() {
    const ss = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => s.supervisor === currentUser.user);
    const mySupStock = products().filter(p => p.sellerId === currentUser.id && p.stock > 0);

    appFrame('Atribuir & Enviar Produtos', 'Gestão de estoque dos vendedores e transferência do seu estoque em Reais (R$).', `
        <div class="p-4 md:p-5 bg-sky-950/5 border border-sky-200 rounded-2xl mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
                <h3 class="font-extrabold text-slate-900 text-base">Seu Estoque de Supervisor</h3>
                <p class="text-xs text-slate-600">Você possui <b>${mySupStock.reduce((a,p)=>a+p.stock,0)} unidades</b> no seu usuário para repassar.</p>
            </div>
            <button id="supTransferStockBtn" class="primary-btn w-full sm:w-auto text-xs py-2 flex items-center justify-center gap-2">${icons.orders} Enviar do Meu Estoque para Vendedor</button>
        </div>

        <div class="seller-attribution-grid grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            ${ss.map(s => {
                const sProds = products().filter(p => p.sellerId === s.id && p.stock > 0);
                return `
                    <div class="seller-card glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3 bg-white/90 border border-slate-200 shadow-sm">
                        <div>
                            <div class="flex items-center gap-2 mb-2">
                                ${renderAvatarHTML(s, 'small')}
                                <div>
                                    <h3 class="text-base font-bold text-slate-900">${esc(s.name)}</h3>
                                    <p class="text-xs text-slate-500">@${esc(s.user)} · ${esc(s.city || 'N/A')}/${esc(s.uf || 'N/A')}</p>
                                </div>
                            </div>
                            <strong class="highlight-val text-base block mb-3">${sProds.reduce((a, p) => a + p.stock, 0)} un. em posse</strong>
                            <div class="text-xs text-slate-600 space-y-2">
                                ${sProds.length ? sProds.map(p => `
                                    <div class="flex justify-between items-center p-2 bg-slate-50 rounded-lg border border-slate-100">
                                        <div><b>${esc(p.name)}</b> <small class="block text-slate-500 font-bold">${money(p.price)}</small></div>
                                        <div class="flex items-center gap-2">
                                            <b class="text-slate-800">${p.stock} un.</b>
                                            <button class="small-btn edit-seller-price-btn text-[10px] py-0.5 px-1.5" data-id="${p.id}">Preço R$</button>
                                        </div>
                                    </div>
                                `).join('') : '<i class="text-slate-400">Sem produtos no momento</i>'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `);

    const trBtn = document.getElementById('supTransferStockBtn');
    if (trBtn) trBtn.onclick = transferSupervisorStockModal;

    document.querySelectorAll('.edit-seller-price-btn').forEach(b => {
        b.onclick = () => {
            const prodId = b.dataset.id;
            const allP = products();
            const targetP = allP.find(p => p.id === prodId);
            if (!targetP) return;

            const m = modal(`
                <h2>Ajustar Preço de Venda (R$)</h2>
                <p class="text-xs text-slate-500 mb-3">Produto: <b>${esc(targetP.name)}</b></p>
                <form id="editPriceForm" class="seller-form">
                    <label>Preço Exclusivo deste Vendedor (R$)
                        <input name="price" type="number" step="0.01" min="0" value="${targetP.price}" class="control" required>
                    </label>
                    <button type="submit" class="primary-btn w-full mt-3">${icons.check} Atualizar Preço</button>
                </form>
            `);

            m.querySelector('form').onsubmit = async e => {
                e.preventDefault();
                const newPriceBRL = Number(new FormData(e.target).get('price'));
                targetP.price = newPriceBRL;
                write('atlasProducts', allP);

                if (supabaseClient) {
                    await supabaseClient.from('seller_products').update({ price: newPriceBRL }).eq('id', targetP.id);
                }

                showToast('Preço do vendedor atualizado!');
                m.remove();
                renderProductsPage();
            };
        };
    });
}

function renderReportsPage() {
    const ss = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => s.supervisor === currentUser.user);
    appFrame('Relatórios', 'Relatório operacional de faturamento e vendas.', `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <b>Resumo de Vendas Mensal</b>
            <button id="downloadPdfBtn" class="primary-btn text-xs py-2 w-full sm:w-auto flex items-center justify-center gap-1">${icons.pdf} Baixar PDF</button>
        </div>
        <div class="panel glass-panel">
            <div class="data-table flex flex-col gap-3">
                <div class="table-head hidden md:grid" style="grid-template-columns: 2fr 1.5fr 1fr 2fr; align-items: center;">
                    <span>Vendedor</span><span>Localização</span><span>Qtd Vendida</span><span>Faturamento (R$)</span>
                </div>
                ${ss.map(s => `
                    <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Vendedor</span>
                            <div class="flex items-center gap-2">${renderAvatarHTML(s, 'small')}<b class="text-slate-900">${esc(s.name)}</b></div>
                        </div>
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Localização</span>
                            <span>${esc(s.city || 'N/A')}/${esc(s.uf || 'N/A')}</span>
                        </div>
                        <div class="flex justify-between items-center md:block">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd Vendida</span>
                            <span>${periodSales(s.id, 'month').reduce((a, x) => a + x.quantity, 0)} un.</span>
                        </div>
                        <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                            <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Faturamento</span>
                            <strong class="highlight-val">${money(sellerRevenue(s.id, 'month'))}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);

    document.getElementById('downloadPdfBtn').onclick = () => {
        exportUniversalPDF({
            title: 'Relatório Oficial de Vendas em Reais (R$)',
            headers: ['Vendedor', 'Localizacao', 'Qtd Vendida', 'Faturamento (R$)'],
            rows: ss.map(s => [s.name, `${s.city}/${s.uf}`, `${periodSales(s.id, 'month').reduce((a, x) => a + x.quantity, 0)} un.`, moneySimple(sellerRevenue(s.id, 'month'))]),
            fileName: 'newlife-relatorio.pdf'
        });
    };
}

/* PAINEL DO VENDEDOR */
function renderSeller() {
    const sellerProducts = products().filter(p => p.sellerId === currentUser.id && Number(p.stock) > 0);
    const container = getAppRoot();

    container.innerHTML = `
        <div class="app-layout w-full min-h-screen flex flex-col md:flex-row">
            <aside class="app-sidebar hidden md:flex flex-col">${sellerNavContent()}</aside>
            <div id="appDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
            <aside id="appDrawer" class="app-sidebar drawer-sidebar md:hidden ${drawerOpen ? 'open' : ''}">${sellerNavContent()}</aside>
            <section class="app-content flex-1 min-w-0 flex flex-col justify-between">
                <div>
                    <header class="app-header glass-panel sticky top-0 z-30 w-full p-3 md:p-4 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm flex flex-row items-center justify-between gap-2">
                        <div class="flex items-center gap-2.5 min-w-0 flex-1">
                            <button id="hamburgerBtnSeller" class="hamburger-btn md:hidden shrink-0 p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center justify-center">
                                ${icons.menu}
                            </button>
                            <h1 class="text-xs md:text-xl font-black text-slate-900 truncate">${currentUser.name} (Painel Vendedor)</h1>
                        </div>
                        <div class="flex items-center gap-2 shrink-0 ml-auto">
                            <button id="refreshSellerScreen" class="outline-btn flex items-center gap-1 text-xs py-1.5 px-3 bg-sky-50 text-sky-700 font-bold border-sky-200">${icons.refresh} <span>Sincronizar Supabase</span></button>
                            <button class="logoutSellerSideBtn outline-btn text-xs px-2.5 py-1.5 hidden md:flex items-center gap-1">${icons.logout} <span>Sair</span></button>
                        </div>
                    </header>
                    <div class="page-body p-4 md:p-6">
                        ${sellerActiveTab === 'sales' ? renderSellerSalesTab(sellerProducts) : ''}
                        ${sellerActiveTab === 'newOrder' ? renderSellerNewOrderTab() : ''}
                        ${sellerActiveTab === 'myOrders' ? renderSellerMyOrdersTab() : ''}
                        ${sellerActiveTab === 'archived' ? renderSellerArchivedTab() : ''}
                    </div>
                </div>
                ${appFooter()}
            </section>
        </div>
    `;

    document.getElementById('refreshSellerScreen').onclick = async () => {
        await fetchSupabaseData();
        renderSeller();
        showToast('Painel do Vendedor sincronizado!');
    };
    document.querySelectorAll('.logoutSellerSideBtn').forEach(b => b.onclick = logout);
    document.querySelectorAll('.editSelfAvatarTrigger').forEach(b => b.onclick = editSelfAvatarModal);

    const hBtn = document.getElementById('hamburgerBtnSeller');
    const overlay = document.getElementById('appDrawerOverlay');
    if (hBtn) hBtn.onclick = () => drawerOpen ? closeMobileDrawer() : openMobileDrawer();
    if (overlay) overlay.onclick = closeMobileDrawer;

    document.querySelectorAll('.mobile-close-drawer').forEach(b => b.onclick = closeMobileDrawer);
    document.querySelectorAll('.switchToAdminBtn').forEach(b => b.onclick = () => { closeMobileDrawer(); activeTab = 'adminHome'; renderAdmin(); });
    document.querySelectorAll('[data-seller-tab]').forEach(b => b.onclick = () => { sellerActiveTab = b.dataset.sellerTab; closeMobileDrawer(); renderSeller(); });

    if (sellerActiveTab === 'sales') setupSalesTabEvents(sellerProducts);
    if (sellerActiveTab === 'newOrder') setupNewOrderEvents();
}

function renderSellerSalesTab(sellerProducts) {
    return `
        <div class="panel glass-panel">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2>Registrar Baixas de Vendas (Estoque Próprio)</h2>
                ${sellerProducts.length ? `<button id="registerSaleBtn" class="primary-btn w-full sm:w-auto">${icons.check} Confirmar Vendas</button>` : ''}
            </div>
            ${sellerProducts.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 2fr 2fr 1.2fr 1.8fr; align-items: center;">
                        <span>Produto</span><span>Preço (R$)</span><span>Disponível</span><span>Qtd Vendida Hoje</span>
                    </div>
                    ${sellerProducts.map(p => `
                        <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 md:border-0 md:border-b md:border-slate-200 rounded-xl md:rounded-none bg-white shadow-sm md:shadow-none text-xs">
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Produto</span>
                                <b class="text-slate-900">${esc(p.name)}</b>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Preço</span>
                                <span class="text-slate-700 font-semibold">${money(p.price)}</span>
                            </div>
                            <div class="flex justify-between items-center md:block">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Disponível</span>
                                <b class="text-emerald-600">${p.stock} un.</b>
                            </div>
                            <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd Vendida</span>
                                <input class="baja-input control w-28 md:w-full" data-id="${p.id}" type="number" min="0" max="${p.stock}" value="0">
                            </div>
                        </div>
                    `).join('')}
                </div>
            ` : '<div class="empty-state">Você não possui produtos em estoque no momento.</div>'}
        </div>
    `;
}

function setupSalesTabEvents(sellerProducts) {
    const btn = document.getElementById('registerSaleBtn');
    if (btn) {
        btn.onclick = () => {
            const inputs = [...document.querySelectorAll('.baja-input')];
            const items = inputs.map(i => ({ p: sellerProducts.find(x => x.id === i.dataset.id), q: Number(i.value) })).filter(x => x.q > 0);
            if (!items.length) return alert('Informe as vendas.');

            confirmActionModal({
                title: 'Confirmar Lançamento de Baixas',
                warningText: `Confirma o registro da venda de ${items.reduce((a,x)=>a+x.q,0)} unidade(s) do seu estoque?`,
                confirmText: 'Registrar Vendas',
                onConfirm: async () => {
                    const pl = products();
                    const sl = sales();

                    for (const x of items) {
                        const idx = pl.findIndex(p => p.id === x.p.id);
                        if (idx >= 0) pl[idx].stock -= x.q;

                        const newSale = {
                            id: uid(),
                            sellerId: currentUser.id,
                            productId: x.p.id,
                            quantity: x.q,
                            unitPrice: x.p.price,
                            total: x.q * x.p.price,
                            createdAt: new Date().toISOString()
                        };
                        sl.push(newSale);

                        if (supabaseClient) {
                            await supabaseClient.from('seller_products').update({ stock: pl[idx].stock }).eq('id', x.p.id);
                            await supabaseClient.from('sales').insert({
                                id: newSale.id,
                                seller_id: newSale.sellerId,
                                product_id: newSale.productId,
                                quantity: newSale.quantity,
                                unit_price: newSale.unitPrice,
                                total: newSale.total,
                                created_at: newSale.createdAt
                            });
                        }
                    }

                    write('atlasProducts', pl);
                    write('atlasSales', sl);
                    showToast('Vendas confirmadas!');
                    renderSeller();
                }
            });
        };
    }
}

function renderSellerNewOrderTab() {
    const sysCat = systemCatalog();
    return `
        <div class="panel glass-panel">
            <h2>Solicitar Reposição de Estoque</h2>
            <form id="newOrderForm" class="seller-form">
                <label>Data Desejada<input type="date" name="deliveryDate" class="control" required></label>
                <label>Produto
                    <select name="catIndex" class="control" required>
                        ${sysCat.map((c, i) => `<option value="${i}">${esc(c[0])} · ${esc(c[1])}</option>`).join('')}
                    </select>
                </label>
                <label>Quantidade<input name="quantity" type="number" min="1" value="10" class="control" required></label>
                <button type="submit" class="primary-btn mt-3 w-full sm:w-auto">${icons.check} Enviar Pedido</button>
            </form>
        </div>
    `;
}

function setupNewOrderEvents() {
    const form = document.getElementById('newOrderForm');
    if (form) {
        form.onsubmit = e => {
            e.preventDefault();
            const f = new FormData(form);
            const item = systemCatalog()[Number(f.get('catIndex'))];

            confirmActionModal({
                title: 'Solicitar Reposição de Estoque',
                subtitle: `${f.get('quantity')}x ${item[0]}`,
                warningText: 'Confirmar envio do pedido de reposição ao supervisor?',
                confirmText: 'Enviar Pedido',
                onConfirm: async () => {
                    const ords = orders();
                    const newOrd = {
                        id: uid(),
                        sellerId: currentUser.id,
                        sellerName: currentUser.name,
                        supervisor: currentUser.supervisor,
                        deliveryDate: f.get('deliveryDate'),
                        productName: item[0],
                        brand: item[1],
                        quantity: Number(f.get('quantity')),
                        status: 'Em análise',
                        createdAt: new Date().toISOString()
                    };

                    ords.push(newOrd);
                    write('atlasOrders', ords);

                    if (supabaseClient) {
                        await supabaseClient.from('orders').insert({
                            id: newOrd.id,
                            seller_id: newOrd.sellerId,
                            seller_name: newOrd.sellerName,
                            supervisor: newOrd.supervisor,
                            delivery_date: newOrd.deliveryDate,
                            product_name: newOrd.productName,
                            brand: newOrd.brand,
                            quantity: newOrd.quantity,
                            status: newOrd.status,
                            created_at: newOrd.createdAt
                        });
                    }

                    showToast('Pedido enviado!');
                    sellerActiveTab = 'myOrders';
                    renderSeller();
                }
            });
        };
    }
}

function renderSellerMyOrdersTab() {
    const myOrd = orders().filter(o => o.sellerId === currentUser.id && o.status !== 'Entregue');
    return `
        <div class="panel glass-panel">
            <h2 class="mb-3">Pedidos em Andamento</h2>
            ${myOrd.length ? myOrd.map(o => `<div class="p-3 bg-white rounded-lg border border-slate-200 mb-2 font-semibold text-slate-800 flex justify-between items-center text-sm"><span>${esc(o.productName)} (${o.quantity} un)</span><span class="text-sky-600 font-bold">${esc(o.status)}</span></div>`).join('') : '<div class="empty-state">Sem pedidos pendentes.</div>'}
        </div>
    `;
}

function renderSellerArchivedTab() {
    const myDelivered = orders().filter(o => o.sellerId === currentUser.id && o.status === 'Entregue');
    return `
        <div class="panel glass-panel">
            <h2 class="mb-3">Pedidos Concluídos</h2>
            ${myDelivered.length ? myDelivered.map(o => `<div class="p-3 bg-white rounded-lg border border-slate-200 mb-2 font-semibold text-slate-800 flex justify-between items-center text-sm"><span>${esc(o.productName)} (${o.quantity} un)</span><span class="text-emerald-600 font-bold">Entregue</span></div>`).join('') : '<div class="empty-state">Nenhum histórico.</div>'}
        </div>
    `;
}

/* CARREGAMENTO INICIAL E EVENTOS DOM */
document.addEventListener('DOMContentLoaded', async () => {
    if (supabaseClient) {
        await fetchSupabaseData();
    }

    const passwordInput = document.getElementById('loginPassword');
    if (passwordInput) {
        const toggleBtn = document.getElementById('toggleLoginPasswordBtn') || document.getElementById('togglePassword');
        if (toggleBtn) {
            toggleBtn.onclick = () => {
                const isPwd = passwordInput.type === 'password';
                passwordInput.type = isPwd ? 'text' : 'password';
                toggleBtn.textContent = isPwd ? 'Ocultar' : 'Mostrar';
            };
        }
    }

    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.onsubmit = async e => {
            e.preventDefault();
            const u = document.getElementById('loginUser').value.trim().toLowerCase();
            const p = document.getElementById('loginPassword').value.trim();

            let usersList = allUsers();
            if (!usersList.length && supabaseClient) {
                await fetchSupabaseData();
                usersList = allUsers();
            }

            console.log("Tentando login no frontend com:", { u, p });
            console.log("Array de usuários carregados:", usersList);

            const account = usersList.find(x => (x.user || '').toLowerCase() === u && String(x.password).trim() === p);

            if (!account) {
                console.warn('Login recusado: Usuário ou senha não batem.');
                const errDiv = document.getElementById('loginError');
                if (errDiv) errDiv.textContent = 'Usuário ou senha incorretos.';
                return;
            }

            console.log("✅ Login bem-sucedido:", account);
            await login(account);
        };
    }

    if (currentUser) {
        await login(currentUser);
    }
});
