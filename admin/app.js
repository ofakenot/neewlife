/* newlife.system — Sistema Operacional de Gestão, Estoque e Vendas (v18 - Conexão Nuvem Supabase) */

// Conexão Supabase
const SUPABASE_URL = 'https://pgqbukhnfameinfrikjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QyguyGPK_owHafXhuOtKgw_0ZGdmPoB'; // <--- Cole sua chave anon aqui

const supabase = window.supabase ? window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY) : null;

// Biblioteca de Ícones SVG
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
  pdf: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 1-2 2v16a2 2 0 0 1 2 2h12a2 2 0 0 1 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>`,
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

// Coordenadas Geográficas
const cityCoordinates = {
  'São Paulo': [-23.5505, -46.6333],
  'Curitiba': [-25.4284, -49.2733],
  'Cotia': [-23.6039, -46.9190],
  'São Luís': [-2.5307, -44.3068],
  'Barueri': [-23.5106, -46.8761],
  'Assunção': [-25.2637, -57.5759]
};

// Cache local de segurança
let localState = {
  users: [],
  warehouses: [],
  inventory: [],
  sellerProducts: [],
  sales: [],
  transfers: [],
  orders: [],
  motoboys: []
};

// Sessão Ativa
let currentUser = JSON.parse(localStorage.getItem('nl_current_user') || 'null');
let activeTab = 'adminHome';
let sellerActiveTab = 'sales';
let drawerOpen = false;

/* COMUNICAÇÃO DE BANCO DE DADOS COM O SUPABASE */

async function syncAllDataFromSupabase() {
  if (!supabase) return;
  try {
    const [u, w, inv, sp, sl, tr, ord, mb] = await Promise.all([
      supabase.from('system_users').select('*'),
      supabase.from('warehouses').select('*'),
      supabase.from('warehouse_inventory').select('*'),
      supabase.from('seller_products').select('*'),
      supabase.from('sales').select('*'),
      supabase.from('transfers').select('*'),
      supabase.from('orders').select('*'),
      supabase.from('motoboys').select('*')
    ]);

    if (u.data) localState.users = u.data.map(x => ({ ...x, user: x.username, avatarUrl: x.avatar_url, warehouseId: x.warehouse_id }));
    if (w.data) localState.warehouses = w.data;
    if (inv.data) localState.inventory = inv.data.map(x => ({ ...x, warehouseId: x.warehouse_id, productName: x.product_name }));
    if (sp.data) localState.sellerProducts = sp.data.map(x => ({ ...x, sellerId: x.seller_id }));
    if (sl.data) localState.sales = sl.data.map(x => ({ ...x, sellerId: x.seller_id, productId: x.product_id, unitPrice: x.unit_price, createdAt: x.created_at }));
    if (tr.data) localState.transfers = tr.data.map(x => ({ ...x, warehouseId: x.warehouse_id, warehouseName: x.warehouse_name, targetType: x.target_type, targetId: x.target_id, targetName: x.target_name, productName: x.product_name, createdAt: x.created_at }));
    if (ord.data) localState.orders = ord.data.map(x => ({ ...x, sellerId: x.seller_id, sellerName: x.seller_name, deliveryDate: x.delivery_date, productName: x.product_name, deliveredAt: x.delivered_at, createdAt: x.created_at }));
    if (mb.data) localState.motoboys = mb.data;
  } catch (err) {
    console.error("Erro na sincronização Supabase:", err);
  }
}

async function dbSave(table, record) {
  if (!supabase) return;
  const { error } = await supabase.from(table).upsert(record);
  if (error) console.error(`Erro ao salvar na tabela ${table}:`, error);
}

async function dbDelete(table, id) {
  if (!supabase) return;
  const { error } = await supabase.from(table).delete().eq('id', id);
  if (error) console.error(`Erro ao deletar de ${table}:`, error);
}

// Auxiliares de Consulta Local Rápida
function allUsers() { return localState.users; }
function allSellers() { return allUsers().filter(u => u.role === 'SELLER' || u.role === 'ADMIN_SELLER'); }
function allSupervisors() { return allUsers().filter(u => u.role === 'SUPERVISOR' || u.role === 'ADMIN_SUPERVISOR'); }
function allMotoboys() { return localState.motoboys; }
function products() { return localState.sellerProducts; }
function sales() { return localState.sales; }
function orders() { return localState.orders; }
function warehouses() { return localState.warehouses; }
function warehouseInventory() { return localState.inventory; }
function warehouseTransfers() { return localState.transfers; }

function hasAdminAccess(user) { return user?.role === 'ADMIN_SUPERVISOR' || user?.role === 'ADMIN_SELLER' || user?.role === 'ADMIN'; }
function hasSupervisorAccess(user) { return user?.role === 'SUPERVISOR' || user?.role === 'ADMIN_SUPERVISOR'; }
function isSellerUser(user) { return user?.role === 'SELLER' || user?.role === 'ADMIN_SELLER'; }

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' }[c]));

function money(brlVal) {
  const brl = Number(brlVal || 0);
  return brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function avatarFor(u) {
  return String(u?.name || u?.user || 'NL').split(/\s+/).filter(Boolean).slice(0, 2).map(x => x[0]).join('').toUpperCase();
}

function renderAvatarHTML(u, extraClasses = '') {
  if (u && u.avatarUrl) {
    return `<div class="avatar ${extraClasses}" style="padding:0; overflow:hidden; border-radius:9999px;"><img src="${esc(u.avatarUrl)}" style="width:100%; height:100%; object-fit:cover;" alt="${esc(u.name)}"></div>`;
  }
  return `<div class="avatar ${extraClasses}">${avatarFor(u)}</div>`;
}

// Atualizador Dinâmico de Tela
async function refreshCurrentScreen() {
  await syncAllDataFromSupabase();
  if (!currentUser) return;
  if (currentUser.role === 'STOCK') { renderStockPanel(); }
  else if (hasAdminAccess(currentUser)) { renderAdmin(); }
  else if (hasSupervisorAccess(currentUser)) { renderSupervisor(); }
  else { renderSeller(); }
}

function getAppRoot() {
  let root = document.getElementById('appRoot');
  if (!root) {
    root = document.createElement('div');
    root.id = 'appRoot';
    document.body.appendChild(root);
  }
  Array.from(document.body.children).forEach(child => {
    if (child !== root && child.id !== 'loginScreen' && child.tagName !== 'SCRIPT' && child.tagName !== 'LINK') {
      child.style.display = 'none';
    }
  });
  root.style.display = 'block';
  return root;
}

/* LOGIN E SESSÃO */
async function login(user) {
  if (user.active === false) {
    const err = document.getElementById('loginError');
    if (err) err.textContent = 'Esta conta foi desativada pelo Administrador.';
    return;
  }

  currentUser = user;
  localStorage.setItem('nl_current_user', JSON.stringify(user));

  const loginScreen = document.getElementById('loginScreen');
  if (loginScreen) loginScreen.style.display = 'none';

  await refreshCurrentScreen();
}

function logout() {
  currentUser = null;
  localStorage.removeItem('nl_current_user');
  location.reload();
}

function appFooter() {
  return `
    <footer class="app-footer">
      <div class="footer-container">
        <div><b>newlife.system</b> &copy; 2026 — Gestão Integrada Supabase (R$)</div>
        <div class="footer-links"><span>Estoques Sep. (SP / ASU)</span> · <span>Modo Vendedor + ADM</span></div>
      </div>
    </footer>
  `;
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
      <button class="mobile-close-drawer md:hidden text-slate-400 hover:text-white text-xl p-2" title="Fechar Menu">✕</button>
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
      <button class="side-link ${activeTab === 'warehouses' ? 'active' : ''}" data-admin-tab="warehouses">${icons.warehouse} <span>3 Estoques (SP/CENTRO, SP/OE, ASU)</span></button>
      <button class="side-link ${activeTab === 'adminSupervisors' ? 'active' : ''}" data-admin-tab="adminSupervisors">${icons.users} <span>Supervisores & Vendedores</span></button>
      <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-admin-tab="sellers">${icons.users} <span>Equipe de Vendedores</span></button>
      <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-admin-tab="motoboys">${icons.motoboy} <span>Gestão de Motoboys</span></button>
      <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
      <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">${icons.products} <span>Atribuir / Enviar Estoque</span></button>
    ` : `
      <button class="side-link ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">${icons.summary} <span>Resumo da Equipe</span></button>
      <button class="side-link ${activeTab === 'sales' ? 'active' : ''}" data-tab="sales">${icons.chart} <span>Dar Baixa / Registrar Venda</span></button>
      <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-tab="sellers">${icons.users} <span>Meus Vendedores</span></button>
      <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-tab="motoboys">${icons.motoboy} <span>Meus Motoboys</span></button>
      <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
      <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-tab="products">${icons.products} <span>Atribuir / Enviar Estoque</span></button>
    `}

    <div class="side-account mt-auto">
      <div class="editSelfAvatarTrigger flex items-center gap-2 cursor-pointer" title="Alterar Foto de Perfil">
        ${renderAvatarHTML(currentUser, 'small')}
        <div class="min-w-0 flex-1"><b>${esc(currentUser.name)}</b><small>@${esc(currentUser.user)}</small></div>
      </div>
      <button class="logoutSideBtn" title="Sair">${icons.logout}</button>
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
              <button id="hamburgerBtn" class="hamburger-btn md:hidden shrink-0 p-2 text-slate-700 hover:text-slate-900 rounded-lg hover:bg-slate-100 flex items-center justify-center" title="Abrir Menu">
                ${icons.menu}
              </button>
              <div class="hidden md:block">
                <div class="eyebrow text-[10px] font-bold text-sky-600 uppercase tracking-wider">NEWLIFE.SYSTEM · SUPABASE NUVEM</div>
                <h1 class="text-xl font-black text-slate-900 leading-tight">${title}</h1>
                <p class="text-xs text-slate-500">${sub}</p>
              </div>
              <div class="md:hidden font-extrabold text-xs text-slate-800 truncate">${title}</div>
            </div>

            <div class="flex items-center gap-2 shrink-0 ml-auto">
              <button id="refreshPage" class="outline-btn flex items-center gap-1 text-xs py-1.5 px-3 bg-sky-50 text-sky-700 border-sky-200 hover:bg-sky-100 font-bold">
                ${icons.refresh} <span>Atualizar</span>
              </button>
              <div class="editSelfAvatarTrigger cursor-pointer" title="Alterar Foto de Perfil">
                ${renderAvatarHTML(currentUser, 'flex')}
              </div>
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
  document.querySelectorAll('.switchToSellerBtn').forEach(b => { b.onclick = () => { closeMobileDrawer(); sellerActiveTab = 'sales'; renderSeller(); }; });
  document.querySelectorAll('.logoutSideBtn').forEach(b => b.onclick = logout);
  document.querySelectorAll('.editSelfAvatarTrigger').forEach(b => b.onclick = editSelfAvatarModal);

  const refreshBtn = document.getElementById('refreshPage');
  if (refreshBtn) refreshBtn.onclick = async () => { await refreshCurrentScreen(); showToast('Sincronizado com o Supabase!'); };
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

function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();
  const t = document.createElement('div');
  t.className = 'toast glass-panel show';
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

function confirmActionModal({ title, subtitle, warningText, confirmText = 'Confirmar e Salvar', cancelText = 'Cancelar', onConfirm }) {
  const m = modal(`
    <div class="confirm-dialog-wrap p-2">
      <div class="confirm-icon text-sky-600 mb-2">${icons.flash}</div>
      <h2 class="text-lg font-black text-slate-900 mb-1">${esc(title)}</h2>
      ${subtitle ? `<p class="text-xs text-slate-500 mb-3">${esc(subtitle)}</p>` : ''}
      <div class="confirm-warning-box p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 mb-4">
        <strong>⚠️ Confirmação Exigida pelo Sistema:</strong>
        <span class="block mt-1">${esc(warningText || 'Confirme se todas as informações estão corretas.')}</span>
      </div>
      <div class="confirm-dialog-actions flex justify-end gap-2 mt-4">
        <button type="button" class="outline-btn text-xs py-2 px-4 cancel-dialog">${esc(cancelText)}</button>
        <button type="button" class="primary-btn text-xs py-2 px-4 confirm-dialog">${icons.check} ${esc(confirmText)}</button>
      </div>
    </div>
  `);

  m.querySelector('.cancel-dialog').onclick = () => m.remove();
  m.querySelector('.confirm-dialog').onclick = async () => {
    m.remove();
    if (typeof onConfirm === 'function') await onConfirm();
  };
}

/* RENDERIZAÇÃO DE TELAS DA ADMINISTRAÇÃO E SUPERVISÃO */
function renderAdmin() {
  if (activeTab === 'sales') return renderSupervisorSalesPage();
  if (activeTab === 'warehouses') return renderWarehousesPage();
  if (activeTab === 'adminSupervisors') return renderAdminSupervisorsPage();
  if (activeTab === 'sellers') return renderSellersPage();
  if (activeTab === 'motoboys') return renderMotoboysPage();
  if (activeTab === 'orders') return renderSupervisorOrdersPage();
  if (activeTab === 'products') return renderProductsPage();
  renderAdminHome();
}

function renderSupervisor() {
  if (activeTab === 'sales') return renderSupervisorSalesPage();
  if (activeTab === 'sellers') return renderSellersPage();
  if (activeTab === 'motoboys') return renderMotoboysPage();
  if (activeTab === 'orders') return renderSupervisorOrdersPage();
  if (activeTab === 'products') return renderProductsPage();
  renderSummary();
}

function renderAdminHome() {
  const usersList = allUsers();
  const allSalesList = sales();
  const allProds = products();
  
  const totalRevenueBRL = allSalesList.reduce((a, x) => a + Number(x.total || 0), 0);
  const totalItemsSold = allSalesList.reduce((a, x) => a + Number(x.quantity || 0), 0);
  const sellerStockValueBRL = allProds.filter(p => p.stock > 0).reduce((a, p) => a + (p.price * p.stock), 0);

  appFrame('Visão Consolidada Supabase', 'Faturamento em tempo real gravado no banco de dados da nuvem.', `
    <div class="stats-grid mb-6">
      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Faturamento Global</span><span class="metric-icon cyan">${icons.dollar}</span></div>
        <div class="metric-value text-base md:text-lg font-black">${money(totalRevenueBRL)}</div>
        <small class="text-xs text-slate-500 mt-1 block">${totalItemsSold} unidades vendidas no total</small>
      </div>

      <div class="metric-card glass-panel">
        <div class="metric-top"><span>Estoque em Posse (Vendedores)</span><span class="metric-icon green">${icons.warehouse}</span></div>
        <div class="metric-value text-base md:text-lg font-black">${money(sellerStockValueBRL)}</div>
      </div>
    </div>

    <div class="panel glass-panel mb-6">
      <div class="panel-head mb-4"><h2>Auditoria de Vendas Registradas</h2></div>
      ${allSalesList.length ? `
        <div class="data-table flex flex-col gap-3">
          <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 2fr 1.5fr 1fr 2fr; align-items: center;">
            <span>Data e Hora</span><span>Vendedor</span><span>Produto ID</span><span>Qtd</span><span>Total (R$)</span>
          </div>
          ${allSalesList.slice().reverse().slice(0, 15).map(s => {
            const seller = usersList.find(u => u.id === s.sellerId);
            return `
              <div class="table-row flex flex-col md:grid md:grid-cols-5 gap-2.5 p-4 border border-slate-200 bg-white rounded-xl text-xs">
                <div><small>${new Date(s.createdAt).toLocaleString('pt-BR')}</small></div>
                <div><b>${esc(seller ? seller.name : s.sellerId)}</b></div>
                <div><span>${esc(s.productId)}</span></div>
                <div><b>${s.quantity} un.</b></div>
                <div><strong class="highlight-val">${money(s.total)}</strong></div>
              </div>
            `;
          }).join('')}
        </div>
      ` : '<div class="empty-state">Nenhuma venda registrada no banco de dados.</div>'}
    </div>
  `);
}

/* RENDERIZAÇÃO DO MODO VENDEDOR */
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
              <button id="refreshSellerScreen" class="outline-btn flex items-center gap-1 text-xs py-1.5 px-3 bg-sky-50 text-sky-700 font-bold border-sky-200">${icons.refresh} <span>Atualizar</span></button>
            </div>
          </header>

          <div class="page-body p-4 md:p-6">
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
                    <div class="table-row flex flex-col md:grid md:grid-cols-4 gap-2.5 p-4 border border-slate-200 bg-white rounded-xl text-xs">
                      <div><b class="text-slate-900">${esc(p.name)}</b></div>
                      <div><span class="text-slate-700 font-semibold">${money(p.price)}</span></div>
                      <div><b class="text-emerald-600">${p.stock} un.</b></div>
                      <div><input class="baja-input control w-28 md:w-full" data-id="${p.id}" type="number" min="0" max="${p.stock}" value="0"></div>
                    </div>
                  `).join('')}
                </div>
              ` : '<div class="empty-state">Você não possui produtos em estoque no momento.</div>'}
            </div>
          </div>
        </div>
        ${appFooter()}
      </section>
    </div>
  `;

  document.getElementById('refreshSellerScreen').onclick = async () => { await refreshCurrentScreen(); showToast('Painel atualizado!'); };
  document.querySelectorAll('.editSelfAvatarTrigger').forEach(b => b.onclick = editSelfAvatarModal);

  const btn = document.getElementById('registerSaleBtn');
  if (btn) {
    btn.onclick = () => {
      const inputs = [...document.querySelectorAll('.baja-input')];
      const items = inputs.map(i => ({ p: sellerProducts.find(x => x.id === i.dataset.id), q: Number(i.value) })).filter(x => x.q > 0);
      if (!items.length) return alert('Informe as vendas.');

      confirmActionModal({
        title: 'Confirmar Lançamento de Baixas',
        warningText: `Confirma o registro da venda no banco Supabase?`,
        confirmText: 'Registrar Vendas',
        onConfirm: async () => {
          for (const x of items) {
            const newStock = x.p.stock - x.q;
            await dbSave('seller_products', { id: x.p.id, stock: newStock });
            await dbSave('sales', {
              id: uid(),
              seller_id: currentUser.id,
              product_id: x.p.id,
              quantity: x.q,
              unit_price: x.p.price,
              total: x.q * x.p.price
            });
          }
          showToast('Vendas salvas no banco Supabase!');
          await refreshCurrentScreen();
        }
      });
    };
  }
}

/* MODAL FOTO DE PERFIL COM REMOÇÃO */
function editSelfAvatarModal() {
  const m = modal(`
    <h2>Foto de Perfil</h2>
    <p class="text-xs text-slate-500 mb-3">Escolha uma foto ou remova a foto atual da sua conta.</p>
    <div class="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-2xl mb-4 border border-slate-200">
      <div id="selfAvatarPreview" class="w-24 h-24 mb-3 rounded-full overflow-hidden border-2 border-sky-500 flex items-center justify-center bg-white">
        ${renderAvatarHTML(currentUser, 'w-full h-full')}
      </div>
      <input type="file" id="selfAvatarInput" accept="image/*" class="hidden">
      <div class="flex gap-2">
        <button type="button" id="triggerChooseSelfAvatar" class="outline-btn text-xs py-2 px-3">${icons.camera} Selecionar Imagem</button>
        <button type="button" id="removeSelfAvatarBtn" class="delete-btn text-xs py-2 px-3" style="background:#fef2f2; color:#dc2626; border: 1px solid #fecaca;">
          ${icons.trash} Remover Foto
        </button>
      </div>
      <input type="hidden" id="selfAvatarBase64" value="${esc(currentUser.avatarUrl || '')}">
    </div>
    <div class="flex justify-end gap-2">
      <button type="button" class="outline-btn cancel-avatar-btn">Cancelar</button>
      <button type="button" id="saveSelfAvatarBtn" class="primary-btn">${icons.check} Salvar no Banco</button>
    </div>
  `);

  const fileInput = m.querySelector('#selfAvatarInput');
  const triggerBtn = m.querySelector('#triggerChooseSelfAvatar');
  const removeBtn = m.querySelector('#removeSelfAvatarBtn');
  const preview = m.querySelector('#selfAvatarPreview');
  const base64Input = m.querySelector('#selfAvatarBase64');

  triggerBtn.onclick = () => fileInput.click();

  removeBtn.onclick = () => {
    base64Input.value = '';
    preview.innerHTML = `<div class="avatar text-xl font-black text-slate-700">${avatarFor(currentUser)}</div>`;
    showToast('Foto removida! Clique em Salvar para confirmar.');
  };

  fileInput.onchange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) return alert('A foto deve ter no máximo 2MB para envio rápido.');
      const reader = new FileReader();
      reader.onload = (ev) => {
        base64Input.value = ev.target.result;
        preview.innerHTML = `<img src="${ev.target.result}" style="width:100%; height:100%; object-fit:cover;">`;
      };
      reader.readAsDataURL(file);
    }
  };

  m.querySelector('.cancel-avatar-btn').onclick = () => m.remove();

  m.querySelector('#saveSelfAvatarBtn').onclick = async () => {
    const newAvatarUrl = base64Input.value;
    currentUser.avatarUrl = newAvatarUrl;
    
    await dbSave('system_users', {
      id: currentUser.id,
      username: currentUser.user,
      password: currentUser.password,
      name: currentUser.name,
      role: currentUser.role,
      avatar_url: newAvatarUrl
    });

    localStorage.setItem('nl_current_user', JSON.stringify(currentUser));
    showToast('Foto de perfil salva no Supabase!');
    m.remove();
    await refreshCurrentScreen();
  };
}

/* DOM READY E INICIALIZAÇÃO */
document.addEventListener('DOMContentLoaded', async () => {
  // Sincronizar banco Supabase no carregamento
  await syncAllDataFromSupabase();

  const passwordInput = document.getElementById('loginPassword');
  if (passwordInput) {
    const parent = passwordInput.parentElement;
    if (parent) {
      parent.style.position = 'relative';
      passwordInput.style.paddingRight = '75px';

      let toggleBtn = document.getElementById('toggleLoginPasswordBtn');
      if (!toggleBtn) {
        toggleBtn = document.createElement('button');
        toggleBtn.type = 'button';
        toggleBtn.id = 'toggleLoginPasswordBtn';
        parent.appendChild(toggleBtn);
      }

      toggleBtn.textContent = 'Mostrar';
      toggleBtn.style.cssText = `
        position: absolute; right: 12px; top: 50%; transform: translateY(-50%);
        background: transparent; border: none; cursor: pointer; font-size: 11px;
        font-weight: 700; color: #0284c7; z-index: 10;
      `;

      toggleBtn.onclick = () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        toggleBtn.textContent = isPassword ? 'Ocultar' : 'Mostrar';
      };
    }
  }

  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.onsubmit = async e => {
      e.preventDefault();
      await syncAllDataFromSupabase();
      const u = document.getElementById('loginUser').value.trim().toLowerCase();
      const p = document.getElementById('loginPassword').value;
      const account = allUsers().find(x => String(x.user).toLowerCase() === u && x.password === p);

      if (!account) {
        document.getElementById('loginError').textContent = 'Usuário ou senha incorretos no Supabase.';
        return;
      }
      await login(account);
    };
  }

  // Se já houver usuário na sessão local, reconecta e atualiza
  if (currentUser) {
    await login(currentUser);
  }
});
