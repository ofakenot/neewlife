/* newlife.system — Sistema Operacional de Gestão, Estoque e Vendas (v22 - Full Supabase Real-Time Direct Push & Câmbio) */

// CREDENCIAIS OFICIAIS DO SUPABASE
const SUPABASE_URL = 'https://pgqbukhnfameinfrikjw.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_QyguyGPK_owHafXhuOtKgw_0ZGdmPoB';

let supabaseClient = null;
function initializeSupabaseClient() {
    try {
        if (!supabaseClient && window.supabase && typeof window.supabase.createClient === 'function') {
            supabaseClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
        }
    } catch (e) {
        console.error('Erro ao inicializar cliente Supabase:', e);
        supabaseClient = null;
    }
    return supabaseClient;
}
initializeSupabaseClient();

// CÂMBIO USD/BRL — ARBITRAGEM PARAGUAIA DO CAMBIOS CHACO
class CambioParaguai {
    constructor() {
        this.cache = null;
        this.ultimaAtualizacao = null;
        this.tempoCache = 24 * 60 * 60 * 1000;
        try {
            const salvo = JSON.parse(localStorage.getItem('nl_exchange_rate_paraguay') || 'null');
            if (salvo?.compra > 0 && salvo?.venda > 0 && salvo?.timestamp) {
                this.cache = salvo;
                this.ultimaAtualizacao = new Date(salvo.timestamp).getTime();
            }
        } catch (erro) {
            console.warn('Não foi possível carregar o cache da cotação:', erro);
        }
    }

    async getCambio() {
        if (this.cache && this._cacheValido()) return this.cache;
        // API oficial do Cambios Chaco: filial 32 = Ciudad del Este — Km7.
        const response = await fetch('https://www.cambioschaco.com.py/api/branch_office/32/exchange', {
            cache: 'no-store',
            mode: 'cors',
            headers: { Accept: 'application/json' }
        });
        if (!response.ok) throw new Error(`Cambios Chaco Km7 HTTP ${response.status}`);
        const data = await response.json();
        const real = data?.items?.find(item => item.isoCode === 'BRL');
        if (!real) throw new Error('Cotação BRL não encontrada na filial Ciudad del Este — Km7.');

        // O endpoint paraguaio entrega purchaseArbitrage/saleArbitrage diretamente em USD/BRL.
        const compra = Number(real.purchaseArbitrage);
        const venda = Number(real.saleArbitrage);
        if (!(compra > 0) || !(venda > 0)) throw new Error('Cotação USD/BRL inválida no Cambios Chaco Km7.');

        this.cache = {
            compra,
            venda,
            taxa: Number(((compra + venda) / 2).toFixed(4)),
            timestamp: new Date().toISOString(),
            proxima_atualizacao: this._getProximaAtualizacao()
        };
        this.ultimaAtualizacao = Date.now();
        try {
            localStorage.setItem('nl_exchange_rate_paraguay', JSON.stringify(this.cache));
        } catch (erro) {
            console.warn('Não foi possível salvar o cache da cotação:', erro);
        }
        return this.cache;
    }

    _cacheValido() {
        return Boolean(this.ultimaAtualizacao && Date.now() - this.ultimaAtualizacao < this.tempoCache);
    }

    _getProximaAtualizacao() {
        const amanha = new Date();
        amanha.setDate(amanha.getDate() + 1);
        amanha.setHours(0, 0, 0, 0);
        return amanha.toISOString();
    }

    limparCache() {
        this.cache = null;
        this.ultimaAtualizacao = null;
    }
}

const cambio = new CambioParaguai();
let currentExchangeRate = {
    // Última referência confirmada da filial Km7: compra R$ 5,14 / venda R$ 5,22.
    bid: 5.14,
    high: 5.22,
    ask: 5.22,
    brlRate: 5.18,
    pctChange: '0',
    updated: 'Referência local',
    source: 'Cambios Chaco — Paraguai — USD/BRL'
};

async function fetchExchangeRate() {
    try {
        const quote = await cambio.getCambio();
        currentExchangeRate = {
            ...currentExchangeRate,
            bid: quote.compra,
            ask: quote.venda,
            high: quote.venda,
            brlRate: quote.taxa,
            updated: new Date(quote.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            source: 'Cambios Chaco — Ciudad del Este Km7 — USD/BRL'
        };
        updateExchangeRateUI();
    } catch (e) {
        // Mantém a última cotação válida (ou a referência local inicial) para não deixar o widget vazio.
        console.error('Erro ao buscar arbitragem USD/BRL no Cambios Chaco:', e);
        updateExchangeRateUI();
    }
}

function updateExchangeRateUI() {
    const el = document.getElementById('exchangeRateWidget');
    if (el) {
        el.innerHTML = `
            <div class="flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                <span class="text-amber-400">💵 <b>USD/BRL:</b> ${currentExchangeRate.bid ? money(currentExchangeRate.bid) : '—'}–${currentExchangeRate.ask ? money(currentExchangeRate.ask) : '—'}</span>
                <span class="text-emerald-400 font-extrabold">Média: ${currentExchangeRate.brlRate ? money(currentExchangeRate.brlRate) : '—'}</span>
                <small class="text-slate-400 text-[10px]">Km7 · ${currentExchangeRate.updated || 'Aguardando atualização'}</small>
            </div>
        `;
    }
}

// CONSTANTES FIXAS DE INTERFACE
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
    trash: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>`,
    upload: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>`,
    chat: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-9 8.5 9.9 9.9 0 0 1-4-.8L3 21l1.8-4.2A8.4 8.4 0 1 1 21 11.5z"/><path d="M8 12h.01M12 12h.01M16 12h.01"/></svg>`,
    send: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>`,
    box: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>`,
    alert: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.3 3.7 2.4 17a2 2 0 0 0 1.7 3h15.8a2 2 0 0 0 1.7-3L13.7 3.7a2 2 0 0 0-3.4 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
    text: `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4h16v16H4z"/><path d="M8 9h8M8 13h6M8 17h4"/></svg>`
};

const cityCoordinates = {
    'São Paulo': [-23.5505, -46.6333],
    'Curitiba': [-25.4284, -49.2733],
    'Cotia': [-23.6039, -46.9190],
    'São Luís': [-2.5307, -44.3068],
    'Barueri': [-23.5106, -46.8761],
    'Assunção': [-25.2637, -57.5759]
};

// O catálogo oficial é carregado exclusivamente da tabela public.product_catalog.

const brazilStatesList = ['AC', 'AL', 'AP', 'AM', 'BA', 'CE', 'DF', 'ES', 'GO', 'MA', 'MT', 'MS', 'MG', 'PA', 'PB', 'PR', 'PE', 'PI', 'RJ', 'RN', 'RS', 'RO', 'RR', 'SC', 'SP', 'SE', 'TO'];
const ibgeCitiesCache = {};

let currentUser = JSON.parse(localStorage.getItem('nl_current_user') || 'null');
let activeTab = 'adminHome';
let sellerActiveTab = 'sales';
let drawerOpen = false;
let currentPageReportContext = null;

// ESTADO DO BANCO DE DADOS EM MEMÓRIA
let dbCache = {
    users: [],
    warehouses: [],
    motoboys: [],
    products: [],
    product_catalog: [],
    wg_ik_messages: [],
    sales: [],
    orders: [],
    warehouse_inventory: [],
    transfers: [],
    wg_ik_shipments: [],
    ik_seller_allocations: [],
    seller_payment_ledger: [],
    seller_payment_sheets: [],
    seller_payment_sheet_lines: [],
    seller_balance_payments: []
};

// 1. FUNÇÃO EXCLUSIVA DE ENVIO (PUSH) SITE -> SUPABASE
async function pushAllToSupabase() {
    if (!supabaseClient) return alert('Cliente Supabase não inicializado.');
    
    try {
        showToast('⏳ Enviando alterações para o Supabase...');

        if (dbCache.users.length) {
            await supabaseClient.from('system_users').upsert(dbCache.users.map(u => ({
                id: u.id,
                username: u.user,
                password: u.password,
                name: u.name,
                role: u.role,
                supervisor: u.supervisor,
                city: u.city,
                uf: u.uf,
                country: 'BR',
                active: u.active !== false,
                avatar_url: u.avatarUrl || u.avatar_url
            })));
        }

        if (dbCache.product_catalog.length) {
            const { error: catalogError } = await supabaseClient.from('product_catalog').upsert(dbCache.product_catalog.map(p => ({
                id: p.id,
                name: p.name,
                brand: p.brand,
                created_at: p.createdAt || p.created_at || new Date().toISOString(),
                created_by: p.createdBy || p.created_by || currentUser?.id || null
            })), { onConflict: 'id' });
            if (catalogError) throw catalogError;
        }

        if (dbCache.wg_ik_messages.length) {
            const { error: chatError } = await supabaseClient.from('wg_ik_messages').upsert(dbCache.wg_ik_messages.map(m => ({
                id: m.id, sender_id: m.senderId, sender_role: m.senderRole, recipient_id: m.recipientId,
                message_type: m.messageType || 'normal', body: m.body, metadata: m.metadata || {},
                reply_to: m.replyTo || null, created_at: m.createdAt, read_at: m.readAt || null
            })), { onConflict: 'id' });
            if (chatError) throw chatError;
        }

        if (dbCache.products.length) {
            await supabaseClient.from('seller_products').upsert(dbCache.products.map(p => ({
                id: p.id,
                seller_id: p.sellerId,
                name: p.name,
                brand: p.brand,
                price: Number(p.price || 0),
                stock: Number(p.stock || 0)
            })));
        }

        if (dbCache.warehouse_inventory.length) {
            await supabaseClient.from('warehouse_inventory').upsert(dbCache.warehouse_inventory.map(i => ({
                id: i.id,
                warehouse_id: i.warehouseId,
                product_name: i.productName,
                brand: i.brand,
                stock: Number(i.stock || 0)
            })));
        }

        if (dbCache.sales.length) {
            await supabaseClient.from('sales').upsert(dbCache.sales.map(s => ({
                id: s.id,
                seller_id: s.sellerId,
                product_id: s.productId,
                quantity: Number(s.quantity || 0),
                unit_price: Number(s.unitPrice || 0),
                total: Number(s.total || 0),
                created_at: s.createdAt
            })));
        }

        if (dbCache.orders.length) {
            await supabaseClient.from('orders').upsert(dbCache.orders.map(o => ({
                id: o.id,
                seller_id: o.sellerId,
                seller_name: o.sellerName,
                supervisor: o.supervisor,
                delivery_date: o.deliveryDate,
                product_name: o.productName,
                brand: o.brand,
                quantity: Number(o.quantity || 0),
                status: o.status,
                created_at: o.createdAt,
                delivered_at: o.deliveredAt
            })));
        }

        if (dbCache.transfers.length) {
            await supabaseClient.from('transfers').upsert(dbCache.transfers.map(t => ({
                id: t.id,
                warehouse_id: t.warehouseId,
                warehouse_name: t.warehouseName,
                target_type: t.targetType,
                target_id: t.targetId,
                target_name: t.targetName,
                product_name: t.productName,
                brand: t.brand,
                quantity: Number(t.quantity || 0),
                price: Number(t.price || 0),
                reverted: t.reverted || false,
                created_at: t.createdAt,
                reverted_at: t.revertedAt
            })));
        }

        if (dbCache.wg_ik_shipments.length) {
            await supabaseClient.from('wg_ik_shipments').upsert(dbCache.wg_ik_shipments.map(x => ({
                id: x.id, wg_id: x.wgId, ik_id: x.ikId, product_name: x.productName, brand: x.brand,
                quantity_sent: Number(x.quantitySent || 0), quantity_remaining: Number(x.quantityRemaining || 0),
                unit_cost_brl: Number(x.unitCostBRL || 0), total_value_brl: Number(x.totalValueBRL || 0),
                remaining_value_brl: Number(x.remainingValueBRL || 0), status: x.status || 'OPEN', notes: x.notes || null,
                created_at: x.createdAt, updated_at: x.updatedAt
            })));
        }
        if (dbCache.ik_seller_allocations.length) {
            await supabaseClient.from('ik_seller_allocations').upsert(dbCache.ik_seller_allocations.map(x => ({
                id: x.id, shipment_id: x.shipmentId || null, ik_id: x.ikId, seller_id: x.sellerId,
                product_name: x.productName, brand: x.brand, quantity_sent: Number(x.quantitySent || 0),
                quantity_remaining: Number(x.quantityRemaining || 0), unit_cost_brl: Number(x.unitCostBRL || 0),
                sale_price_brl: Number(x.salePriceBRL || 0), total_value_brl: Number(x.totalValueBRL || 0),
                remaining_value_brl: Number(x.remainingValueBRL || 0), status: x.status || 'OPEN',
                created_at: x.createdAt, updated_at: x.updatedAt
            })));
        }
        if (dbCache.seller_payment_sheet_lines.length) {
            await supabaseClient.from('seller_payment_sheet_lines').upsert(dbCache.seller_payment_sheet_lines.map(x => ({
                id:x.id, sheet_id:x.sheetId, seller_id:x.sellerId, row_number:Number(x.rowNumber), product_name:x.productName || '', brand:x.brand || '',
                total_value_brl:Number(x.totalValueBRL || 0), paid_value_brl:Number(x.paidValueBRL || 0), balance_brl:Number(x.balanceBRL || 0), status:x.status || 'OPEN', notes:x.notes || null,
                updated_by:x.updatedBy || currentUser?.id, created_at:x.createdAt, updated_at:x.updatedAt
            })));
        }
        if (dbCache.seller_payment_sheets.length) {
            await supabaseClient.from('seller_payment_sheets').upsert(dbCache.seller_payment_sheets.map(x => ({
                id: x.id, wg_id: x.wgId, ik_id: x.ikId, seller_id: x.sellerId,
                product_name: x.productName, brand: x.brand || '',
                total_value_brl: Number(x.totalValueBRL || 0), paid_value_brl: Number(x.paidValueBRL || 0),
                balance_brl: Number(x.balanceBRL || 0), status: x.status || 'OPEN', notes: x.notes || null,
                created_at: x.createdAt, closed_at: x.closedAt || null, updated_at: x.updatedAt
            })));
        }
        if (dbCache.seller_payment_ledger.length) {
            await supabaseClient.from('seller_payment_ledger').upsert(dbCache.seller_payment_ledger.map(x => ({
                id: x.id, allocation_id: x.allocationId, seller_id: x.sellerId, ik_id: x.ikId,
                amount_brl: Number(x.amountBRL || 0), payment_date: x.paymentDate, frequency: x.frequency || 'DAILY',
                notes: x.notes || null, created_by: x.createdBy, created_at: x.createdAt
            })));
        }

        if (dbCache.seller_balance_payments.length) {
            await supabaseClient.from('seller_balance_payments').upsert(dbCache.seller_balance_payments.map(x => ({
                id: x.id, seller_id: x.sellerId, payer_id: x.payerId, payer_role: x.payerRole,
                currency: x.currency, original_amount: Number(x.originalAmount || 0), amount_brl: Number(x.amountBRL || 0),
                exchange_rate_brl: Number(x.exchangeRateBRL || 0), notes: x.notes || null, created_at: x.createdAt
            })));
        }

        if (dbCache.motoboys.length) {
            await supabaseClient.from('motoboys').upsert(dbCache.motoboys.map(m => ({
                id: m.id,
                name: m.name,
                whatsapp: m.whatsapp,
                supervisor: m.supervisor,
                uf: m.uf,
                city: m.city
            })));
        }

        showToast('✅ Todas as alterações foram salvas no Supabase!');
    } catch (err) {
        console.error('Erro ao enviar dados para o Supabase:', err);
        alert('Erro ao enviar as alterações para o Supabase. Verifique o console.');
    }
}

// 2. BUSCA E MAPEAMENTO RIGOROSO DE DADOS DO SUPABASE
async function fetchSupabaseData() {
    if (!supabaseClient) return;
    try {
        const [uRes, wRes, mRes, pRes, sRes, oRes, wiRes, tRes, wsRes, iaRes, payRes, sheetRes, lineRes, cRes, chatRes, balanceRes] = await Promise.all([
            supabaseClient.from('system_users').select('*'),
            supabaseClient.from('warehouses').select('*'),
            supabaseClient.from('motoboys').select('*'),
            supabaseClient.from('seller_products').select('*'),
            supabaseClient.from('sales').select('*'),
            supabaseClient.from('orders').select('*'),
            supabaseClient.from('warehouse_inventory').select('*'),
            supabaseClient.from('transfers').select('*'),
            supabaseClient.from('wg_ik_shipments').select('*'),
            supabaseClient.from('ik_seller_allocations').select('*'),
            supabaseClient.from('seller_payment_ledger').select('*'),
            supabaseClient.from('seller_payment_sheets').select('*'),
            supabaseClient.from('seller_payment_sheet_lines').select('*'),
            supabaseClient.from('product_catalog').select('*').order('brand').order('name'),
            supabaseClient.from('wg_ik_messages').select('*').order('created_at'),
            supabaseClient.from('seller_balance_payments').select('*').order('created_at')
        ]);

        if (uRes.data) {
            dbCache.users = uRes.data.map(u => ({
                ...u,
                user: String(u.username || u.user || '').trim().toLowerCase(),
                password: String(u.password || '').trim(),
                avatarUrl: u.avatar_url || u.avatarUrl,
                warehouseId: u.warehouse_id || u.warehouseId,
                active: u.active !== false
            }));
            localStorage.setItem('nl_users', JSON.stringify(dbCache.users));
        }

        if (wRes.data) {
            dbCache.warehouses = wRes.data;
            localStorage.setItem('nl_warehouses', JSON.stringify(dbCache.warehouses));
        }

        if (cRes?.error) console.warn('Tabela public.product_catalog indisponível. Execute product_catalog.sql no Supabase:', cRes.error.message);
        if (cRes?.data) {
            dbCache.product_catalog = cRes.data.map(p => ({
                ...p,
                createdAt: p.created_at || p.createdAt,
                createdBy: p.created_by || p.createdBy
            }));
        }
        if (chatRes?.error) console.warn('Tabela public.wg_ik_messages indisponível. Execute wg_ik_messages.sql no Supabase:', chatRes.error.message);
        if (chatRes?.data) {
            dbCache.wg_ik_messages = chatRes.data.map(m => ({
                ...m, senderId: m.sender_id, senderRole: m.sender_role, recipientId: m.recipient_id,
                messageType: m.message_type || 'normal', replyTo: m.reply_to, createdAt: m.created_at, readAt: m.read_at
            }));
            localStorage.setItem('nl_wg_ik_messages', JSON.stringify(dbCache.wg_ik_messages));
        }

        if (wsRes?.data) {
            dbCache.wg_ik_shipments = wsRes.data.map(x => ({ ...x, wgId: x.wg_id, ikId: x.ik_id,
                productName: x.product_name, quantitySent: Number(x.quantity_sent || 0), quantityRemaining: Number(x.quantity_remaining || 0),
                unitCostBRL: Number(x.unit_cost_brl || 0), totalValueBRL: Number(x.total_value_brl || 0), remainingValueBRL: Number(x.remaining_value_brl || 0),
                createdAt: x.created_at, updatedAt: x.updated_at }));
            localStorage.setItem('nl_wg_ik_shipments', JSON.stringify(dbCache.wg_ik_shipments));
        }
        if (iaRes?.data) {
            dbCache.ik_seller_allocations = iaRes.data.map(x => ({ ...x, shipmentId: x.shipment_id, ikId: x.ik_id, sellerId: x.seller_id,
                productName: x.product_name, quantitySent: Number(x.quantity_sent || 0), quantityRemaining: Number(x.quantity_remaining || 0),
                unitCostBRL: Number(x.unit_cost_brl || 0), salePriceBRL: Number(x.sale_price_brl || 0), totalValueBRL: Number(x.total_value_brl || 0), remainingValueBRL: Number(x.remaining_value_brl || 0),
                createdAt: x.created_at, updatedAt: x.updated_at }));
            localStorage.setItem('nl_ik_seller_allocations', JSON.stringify(dbCache.ik_seller_allocations));
        }
        if (lineRes?.data) {
            dbCache.seller_payment_sheet_lines = lineRes.data.map(x => ({...x, sheetId:x.sheet_id, sellerId:x.seller_id, rowNumber:Number(x.row_number), productName:x.product_name || '', totalValueBRL:Number(x.total_value_brl || 0), paidValueBRL:Number(x.paid_value_brl || 0), balanceBRL:Number(x.balance_brl || 0), updatedBy:x.updated_by, createdAt:x.created_at, updatedAt:x.updated_at}));
            localStorage.setItem('nl_seller_payment_sheet_lines', JSON.stringify(dbCache.seller_payment_sheet_lines));
        }
        if (sheetRes?.data) {
            dbCache.seller_payment_sheets = sheetRes.data.map(x => ({ ...x,
                wgId: x.wg_id, ikId: x.ik_id, sellerId: x.seller_id, productName: x.product_name,
                totalValueBRL: Number(x.total_value_brl || 0), paidValueBRL: Number(x.paid_value_brl || 0),
                balanceBRL: Number(x.balance_brl || 0), createdAt: x.created_at, closedAt: x.closed_at, updatedAt: x.updated_at
            }));
            localStorage.setItem('nl_seller_payment_sheets', JSON.stringify(dbCache.seller_payment_sheets));
        }
        if (payRes?.data) {
            dbCache.seller_payment_ledger = payRes.data.map(x => ({ ...x, allocationId: x.allocation_id, sellerId: x.seller_id, ikId: x.ik_id,
                amountBRL: Number(x.amount_brl || 0), paymentDate: x.payment_date, createdBy: x.created_by, createdAt: x.created_at }));
            localStorage.setItem('nl_seller_payment_ledger', JSON.stringify(dbCache.seller_payment_ledger));
        }

        if (balanceRes?.data) {
            dbCache.seller_balance_payments = balanceRes.data.map(x => ({
                ...x, sellerId: x.seller_id, payerId: x.payer_id, payerRole: x.payer_role,
                currency: x.currency || 'BRL', originalAmount: Number(x.original_amount || 0),
                amountBRL: Number(x.amount_brl || 0), exchangeRateBRL: Number(x.exchange_rate_brl || 0),
                createdAt: x.created_at
            }));
            localStorage.setItem('nl_seller_balance_payments', JSON.stringify(dbCache.seller_balance_payments));
        }

        if (mRes.data) {
            dbCache.motoboys = mRes.data;
            localStorage.setItem('nl_motoboys', JSON.stringify(dbCache.motoboys));
        }

        if (pRes.data) {
            dbCache.products = pRes.data.map(p => ({
                ...p,
                sellerId: p.seller_id || p.sellerId,
                price: Number(p.price || 0),
                stock: Number(p.stock || 0)
            }));
            localStorage.setItem('atlasProducts', JSON.stringify(dbCache.products));
        }

        if (sRes.data) {
            dbCache.sales = sRes.data.map(s => ({
                ...s,
                sellerId: s.seller_id || s.sellerId,
                productId: s.product_id || s.productId,
                unitPrice: Number(s.unit_price || s.unitPrice || 0),
                total: Number(s.total || 0),
                quantity: Number(s.quantity || 0),
                createdAt: s.created_at || s.createdAt
            }));
            localStorage.setItem('atlasSales', JSON.stringify(dbCache.sales));
        }

        if (oRes.data) {
            dbCache.orders = oRes.data.map(o => ({
                ...o,
                sellerId: o.seller_id || o.sellerId,
                sellerName: o.seller_name || o.sellerName,
                deliveryDate: o.delivery_date || o.deliveryDate,
                productName: o.product_name || o.productName,
                quantity: Number(o.quantity || 0),
                createdAt: o.created_at || o.createdAt,
                deliveredAt: o.delivered_at || o.deliveredAt
            }));
            localStorage.setItem('atlasOrders', JSON.stringify(dbCache.orders));
        }

        if (wiRes.data) {
            dbCache.warehouse_inventory = wiRes.data.map(i => ({
                ...i,
                warehouseId: i.warehouse_id || i.warehouseId,
                productName: i.product_name || i.productName,
                stock: Number(i.stock || 0)
            }));
            localStorage.setItem('nl_warehouse_inventory', JSON.stringify(dbCache.warehouse_inventory));
        }

        if (tRes.data) {
            dbCache.transfers = tRes.data.map(t => ({
                ...t,
                warehouseId: t.warehouse_id || t.warehouseId,
                warehouseName: t.warehouse_name || t.warehouseName,
                targetType: t.target_type || t.targetType,
                targetId: t.target_id || t.targetId,
                targetName: t.target_name || t.targetName,
                productName: t.product_name || t.productName,
                quantity: Number(t.quantity || 0),
                price: Number(t.price || 0),
                createdAt: t.created_at || t.createdAt,
                revertedAt: t.reverted_at || t.revertedAt
            }));
            localStorage.setItem('nl_transfers', JSON.stringify(dbCache.transfers));
        }

        console.log('✅ Dados carregados do Supabase com sucesso!');
    } catch (err) {
        console.error('⚠️ Erro de leitura no Supabase:', err);
    }
}

// CARREGAMENTO SEGURO DE DADOS COM FALLBACK
const readStorage = (k, defaultVal = []) => {
    try {
        return JSON.parse(localStorage.getItem(k)) || defaultVal;
    } catch (e) {
        return defaultVal;
    }
};

function allUsers() { return dbCache.users.length ? dbCache.users : readStorage('nl_users', []); }
function allSellers() { return allUsers().filter(u => u.role === 'SELLER' || u.role === 'ADMIN_SELLER'); }
function allSupervisors() { return allUsers().filter(u => u.role === 'SUPERVISOR' || u.role === 'ADMIN_SUPERVISOR'); }
function allMotoboys() { return dbCache.motoboys.length ? dbCache.motoboys : readStorage('nl_motoboys', []); }
function products() { return dbCache.products.length ? dbCache.products : readStorage('atlasProducts', []); }
function sales() { return dbCache.sales.length ? dbCache.sales : readStorage('atlasSales', []); }
function orders() { return dbCache.orders.length ? dbCache.orders : readStorage('atlasOrders', []); }
function warehouses() { return dbCache.warehouses.length ? dbCache.warehouses : readStorage('nl_warehouses', []); }
function warehouseInventory() { return dbCache.warehouse_inventory.length ? dbCache.warehouse_inventory : readStorage('nl_warehouse_inventory', []); }
function warehouseTransfers() { return dbCache.transfers.length ? dbCache.transfers : readStorage('nl_transfers', []); }
function wgIkShipments() { return dbCache.wg_ik_shipments.length ? dbCache.wg_ik_shipments : readStorage('nl_wg_ik_shipments', []); }
function ikSellerAllocations() { return dbCache.ik_seller_allocations.length ? dbCache.ik_seller_allocations : readStorage('nl_ik_seller_allocations', []); }
function sellerPaymentLedger() { return dbCache.seller_payment_ledger.length ? dbCache.seller_payment_ledger : readStorage('nl_seller_payment_ledger', []); }
function sellerBalancePayments() { return dbCache.seller_balance_payments.length ? dbCache.seller_balance_payments : readStorage('nl_seller_balance_payments', []); }
function sellerPaymentSheets() { return dbCache.seller_payment_sheets.length ? dbCache.seller_payment_sheets : readStorage('nl_seller_payment_sheets', []); }
function sellerPaymentSheetLines() { return dbCache.seller_payment_sheet_lines.length ? dbCache.seller_payment_sheet_lines : readStorage('nl_seller_payment_sheet_lines', []); }
function activeSellerSheetFor(sellerId) { return sellerPaymentSheets().find(x => x.sellerId === sellerId && x.status === 'OPEN'); }
function isWGAccount(u = currentUser) { return u?.id === 'u_wg' || String(u?.user || u?.username || '').toLowerCase() === 'wg'; }
function isIKAccount(u = currentUser) { return u?.id === 'ik' || u?.id === 'u_ik' || String(u?.user || u?.username || '').toLowerCase() === 'ik'; }
function wgAccountId() { return allUsers().find(u => isWGAccount(u))?.id || 'u_wg'; }
function ikAccountId() { return allUsers().find(u => isIKAccount(u))?.id || 'ik'; }
function canEditWgIk(u = currentUser) { return isWGAccount(u) || isIKAccount(u) || hasAdminAccess(u); }
function allocationPaidValue(allocationId) { return sellerPaymentLedger().filter(p => p.allocationId === allocationId).reduce((sum, p) => sum + Number(p.amountBRL || 0), 0); }
function allocationBalance(a) { return Math.max(Number(a.totalValueBRL || 0) - allocationPaidValue(a.id), 0); }
function writeWgIkCaches() {
    localStorage.setItem('nl_wg_ik_shipments', JSON.stringify(wgIkShipments()));
    localStorage.setItem('nl_ik_seller_allocations', JSON.stringify(ikSellerAllocations()));
    localStorage.setItem('nl_seller_payment_ledger', JSON.stringify(sellerPaymentLedger()));
}
function productCatalog() { return dbCache.product_catalog || []; }
function conversationMessages() { return dbCache.wg_ik_messages || readStorage('nl_wg_ik_messages', []); }
function canUseWgIkChat(u = currentUser) { return isWGAccount(u) || isIKAccount(u) || hasAdminAccess(u); }
function systemCatalog() { return productCatalog().map(x => [x.name, x.brand]); }

// PERSISTÊNCIA EM MEMÓRIA E LOCALSTORAGE
function write(key, val) {
    localStorage.setItem(key, JSON.stringify(val));
    if (key === 'nl_users') dbCache.users = val;
    if (key === 'nl_warehouses') dbCache.warehouses = val;
    if (key === 'nl_motoboys') dbCache.motoboys = val;
    if (key === 'atlasProducts') dbCache.products = val;
    if (key === 'atlasSales') dbCache.sales = val;
    if (key === 'atlasOrders') dbCache.orders = val;
    if (key === 'nl_warehouse_inventory') dbCache.warehouse_inventory = val;
    if (key === 'nl_transfers') dbCache.transfers = val;
    if (key === 'nl_wg_ik_shipments') dbCache.wg_ik_shipments = val;
    if (key === 'nl_ik_seller_allocations') dbCache.ik_seller_allocations = val;
    if (key === 'nl_seller_payment_ledger') dbCache.seller_payment_ledger = val;
    if (key === 'nl_seller_balance_payments') dbCache.seller_balance_payments = val;
    if (key === 'nl_seller_payment_sheets') dbCache.seller_payment_sheets = val;
    if (key === 'nl_seller_payment_sheet_lines') dbCache.seller_payment_sheet_lines = val;
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? '').replace(/[&<>'"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&#34;' }[c]));

function money(brlVal) {
    const brl = Number(brlVal || 0);
    return brl.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}
function moneyUSD(brlVal) {
    const brl = Number(brlVal || 0);
    const rate = Number(currentExchangeRate.ask || currentExchangeRate.bid || 0);
    return rate > 0 ? (brl / rate).toLocaleString('en-US', { style: 'currency', currency: 'USD' }) : 'US$ —';
}
function moneyPair(brlVal) { return `${money(brlVal)} · ${moneyUSD(brlVal)}`; }
function moneyPairSigned(brlVal) {
    const value = Number(brlVal || 0);
    const sign = value < 0 ? '-' : '';
    const absolute = Math.abs(value);
    return `${sign}${money(absolute)} · ${sign}${moneyUSD(absolute)}`;
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

function openAvatarCropModal(file, onConfirm) {
    if (!file || !file.type.startsWith('image/')) return alert('Selecione um arquivo de imagem válido.');
    if (file.size > 10 * 1024 * 1024) return alert('Foto muito grande! Escolha uma imagem de até 10 MB.');
    const reader = new FileReader();
    reader.onload = event => {
        const source = event.target.result;
        const crop = modal(`
            <h2>Ajustar e Recortar Avatar</h2>
            <p class="text-xs text-slate-500 mb-3">Use o zoom para centralizar o rosto na área quadrada.</p>
            <div class="flex justify-center bg-slate-100 rounded-xl p-3"><div id="avatarCropViewport" style="width:240px;height:240px;overflow:hidden;border-radius:9999px;position:relative;background:#e2e8f0;"><img id="avatarCropImage" src="${source}" style="width:100%;height:100%;object-fit:cover;transform:scale(1);transform-origin:center;" /></div></div>
            <label class="block text-xs font-bold mt-3">Zoom <input id="avatarCropZoom" type="range" min="1" max="3" step="0.01" value="1" class="w-full"></label>
            <div class="flex justify-end gap-2 mt-4"><button type="button" class="outline-btn cancel-avatar-crop">Cancelar</button><button type="button" class="primary-btn confirm-avatar-crop">Usar Foto Recortada</button></div>
        `);
        const image = crop.querySelector('#avatarCropImage');
        const zoom = crop.querySelector('#avatarCropZoom');
        zoom.oninput = () => image.style.transform = `scale(${zoom.value})`;
        crop.querySelector('.cancel-avatar-crop').onclick = () => crop.remove();
        crop.querySelector('.confirm-avatar-crop').onclick = () => {
            const canvas = document.createElement('canvas');
            canvas.width = 640; canvas.height = 640;
            const ctx = canvas.getContext('2d');
            const side = Math.min(image.naturalWidth, image.naturalHeight);
            const factor = Number(zoom.value);
            const cropSide = side / factor;
            const sx = (image.naturalWidth - cropSide) / 2;
            const sy = (image.naturalHeight - cropSide) / 2;
            ctx.drawImage(image, sx, sy, cropSide, cropSide, 0, 0, canvas.width, canvas.height);
            onConfirm(canvas.toDataURL('image/jpeg', 0.88));
            crop.remove();
        };
    };
    reader.readAsDataURL(file);
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

function setPageReportContext(title, subtitle, key = activeTab) {
    currentPageReportContext = { title, subtitle, key };
}

function currentReportScope(list) {
    if (hasAdminAccess(currentUser)) return list;
    if (isSellerUser(currentUser)) return list.filter(x => x.sellerId === currentUser.id);
    if (isWGAccount(currentUser)) return list;
    return list.filter(x => {
        const seller = allUsers().find(u => u.id === x.sellerId);
        return seller && String(seller.supervisor || '').toLowerCase() === String(currentUser?.user || '').toLowerCase();
    });
}

function buildCurrentPageReport() {
    const context = currentPageReportContext || { title: 'Relatório da Página', subtitle: '', key: activeTab };
    const key = context.key;
    if (key === 'catalog') {
        return { title: context.title, subtitle: context.subtitle, headers: ['Marca', 'Produto'], rows: productCatalog().map(p => [p.brand, p.name]) };
    }
    if (key === 'products') {
        const visible = hasAdminAccess(currentUser) ? products() : products().filter(p => p.sellerId === currentUser.id || allSellers().some(s => s.id === p.sellerId && s.supervisor === currentUser.user));
        return { title: context.title, subtitle: context.subtitle, headers: ['Vendedor', 'Marca', 'Produto', 'Estoque', 'Preço'], rows: visible.map(p => [allUsers().find(u => u.id === p.sellerId)?.name || p.sellerId, p.brand, p.name, `${p.stock} un.`, money(p.price)]) };
    }
    if (key === 'warehouses' || key === 'stock') {
        const visible = key === 'stock' ? warehouseInventory().filter(i => i.warehouseId === currentUser?.warehouseId) : warehouseInventory();
        return { title: context.title, subtitle: context.subtitle, headers: ['Estoque', 'Marca', 'Produto', 'Quantidade'], rows: visible.map(i => [warehouses().find(w => w.id === i.warehouseId)?.name || i.warehouseId, i.brand, i.productName, `${i.stock} un.`]) };
    }
    if (key === 'motoboys') {
        const visible = hasAdminAccess(currentUser) ? allMotoboys() : allMotoboys().filter(m => String(m.supervisor || '').toLowerCase() === String(currentUser?.user || '').toLowerCase());
        return { title: context.title, subtitle: context.subtitle, headers: ['Nome', 'WhatsApp', 'Cidade', 'UF'], rows: visible.map(m => [m.name, m.whatsapp || m.phone, m.city, m.uf]) };
    }
    if (key === 'orders' || key === 'archived' || key === 'sellerOrders') {
        const visible = currentReportScope(orders()).filter(o => key === 'archived' ? o.status === 'Entregue' : key === 'orders' ? o.status !== 'Entregue' : o.sellerId === currentUser?.id);
        return { title: context.title, subtitle: context.subtitle, headers: ['Vendedor', 'Produto', 'Marca', 'Quantidade', 'Status', 'Data'], rows: visible.map(o => [o.sellerName, o.productName, o.brand, o.quantity, o.status, o.deliveryDate || new Date(o.createdAt).toLocaleDateString('pt-BR')]) };
    }
    if (key === 'sales') {
        const visible = hasAdminAccess(currentUser) ? sales() : sales().filter(s => s.sellerId === currentUser?.id);
        return { title: context.title, subtitle: context.subtitle, headers: ['Data', 'Vendedor', 'Produto', 'Quantidade', 'Total'], rows: visible.map(s => [new Date(s.createdAt).toLocaleString('pt-BR'), allUsers().find(u => u.id === s.sellerId)?.name || s.sellerId, products().find(p => p.id === s.productId)?.name || s.productId, s.quantity, money(s.total)]) };
    }
    if (key === 'sellers' || key === 'sellerTotals' || key === 'reports' || key === 'adminReports' || key === 'summary' || key === 'adminHome') {
        const sellers = hasAdminAccess(currentUser) || isWGAccount(currentUser) ? allSellers() : allSellers().filter(s => s.supervisor === currentUser?.user);
        return { title: context.title, subtitle: context.subtitle, headers: ['Vendedor', 'Localização', 'Qtd. no período', 'Faturamento'], rows: sellers.map(s => [s.name, `${s.city || 'N/A'}/${s.uf || 'N/A'}`, periodSales(s.id, 'month').reduce((n, x) => n + Number(x.quantity || 0), 0), money(sellerRevenue(s.id, 'month'))]) };
    }
    if (key === 'wgTransfers') {
        return { title: context.title, subtitle: context.subtitle, headers: ['Data', 'Produto', 'Marca', 'Quantidade', 'Valor'], rows: wgIkShipments().map(x => [new Date(x.createdAt || x.updatedAt).toLocaleDateString('pt-BR'), x.productName, x.brand, x.quantitySent, money(x.totalValueBRL)]) };
    }
    const visibleSales = currentReportScope(sales());
    return { title: context.title, subtitle: context.subtitle, headers: ['Data', 'Produto', 'Quantidade', 'Total'], rows: visibleSales.map(s => [new Date(s.createdAt).toLocaleString('pt-BR'), products().find(p => p.id === s.productId)?.name || s.productId, s.quantity, money(s.total)]) };
}

function generateCurrentPageReport() {
    const payload = buildCurrentPageReport();
    const slug = String(payload.title || 'pagina').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'pagina';
    exportUniversalPDF({ ...payload, fileName: `newlife-${slug}.pdf` });
}

function bindPageReportButton() {
    const button = document.getElementById('generatePageReportBtn');
    if (button) button.onclick = generateCurrentPageReport;
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

async function deleteAllRowsFromSupabase(table, filterColumn = 'id', filterValue = '__newlife_never__') {
    if (!supabaseClient) return;
    const { error } = await supabaseClient.from(table).delete().neq(filterColumn, filterValue);
    if (error) throw error;
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
    setupSupabaseRealtimeSync();
    refreshCurrentScreen();
}

function setLoginError(message) {
    const errorElements = [
        document.getElementById('loginError'),
        document.querySelector('[data-login-error]')
    ].filter(Boolean);
    errorElements.forEach(el => { el.textContent = message || ''; });
}

function findLoginForm() {
    return document.getElementById('loginForm') ||
        document.querySelector('form[data-login-form]') ||
        document.getElementById('loginUsername')?.form ||
        document.getElementById('loginUser')?.form ||
        document.querySelector('input[name="username"]')?.form ||
        document.querySelector('input[name="user"]')?.form;
}

function getLoginField(form, selectors) {
    for (const selector of selectors) {
        const field = form.querySelector(selector);
        if (field) return field;
    }
    return null;
}

async function authenticateLogin(username, password) {
    const normalizedUsername = String(username || '').trim().toLowerCase();
    const normalizedPassword = String(password || '').trim();
    if (!normalizedUsername || !normalizedPassword) return { error: 'Informe o usuário e a senha.' };

    let users = allUsers();
    let user = users.find(u => String(u.user || u.username || '').trim().toLowerCase() === normalizedUsername && String(u.password || '').trim() === normalizedPassword);

    // If local data is empty or stale, query only the matching user directly.
    if (!user && supabaseClient) {
        try {
            const { data, error } = await supabaseClient
                .from('system_users')
                .select('*')
                .ilike('username', normalizedUsername)
                .limit(1);
            if (error) throw error;
            const remote = data?.[0];
            if (remote && String(remote.password || '').trim() === normalizedPassword) {
                user = {
                    ...remote,
                    user: String(remote.username || remote.user || '').trim().toLowerCase(),
                    password: String(remote.password || '').trim(),
                    avatarUrl: remote.avatar_url || remote.avatarUrl,
                    warehouseId: remote.warehouse_id || remote.warehouseId,
                    active: remote.active !== false
                };
                dbCache.users = [...users.filter(u => u.id !== user.id), user];
                localStorage.setItem('nl_users', JSON.stringify(dbCache.users));
            }
        } catch (error) {
            console.error('Erro ao consultar usuário no Supabase:', error);
        }
    }

    if (!user) return { error: 'Usuário ou senha inválidos.' };
    if (user.active === false) return { error: 'Esta conta foi desativada pelo Administrador.' };
    return { user };
}

function setupLoginEvents() {
    const form = findLoginForm();
    if (!form || form.dataset.loginEventsReady === 'true') return;
    form.dataset.loginEventsReady = 'true';

    const usernameField = getLoginField(form, ['#loginUsername', '#loginUser', 'input[name="username"]', 'input[name="user"]', 'input[type="text"]']);
    const passwordField = getLoginField(form, ['#loginPassword', 'input[name="password"]', 'input[type="password"]']);
    if (!usernameField || !passwordField) return;

    form.addEventListener('submit', async event => {
        event.preventDefault();
        event.stopPropagation();
        setLoginError('');
        const submitButton = form.querySelector('button[type="submit"], input[type="submit"]');
        if (submitButton) submitButton.disabled = true;
        try {
            initializeSupabaseClient();
            const result = await authenticateLogin(usernameField.value, passwordField.value);
            if (result.error) {
                setLoginError(result.error);
                return;
            }
            await login(result.user);
        } catch (error) {
            console.error('Erro ao realizar login:', error);
            setLoginError('Não foi possível realizar o login. Tente novamente.');
        } finally {
            if (submitButton) submitButton.disabled = false;
        }
    }, true);
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
    } else if (hasSupervisorAccess(currentUser) || isWGAccount(currentUser)) {
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
    const isWG = isWGAccount(currentUser);

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
        ${isWG ? `
            <button class="side-link ${activeTab === 'summary' ? 'active' : ''}" data-tab="summary">${icons.summary} <span>Resumo da Equipe</span></button>
            <button class="side-link ${activeTab === 'wgIkChat' ? 'active' : ''}" data-tab="wgIkChat">${icons.chat} <span>Conversa WG ↔ IK</span></button>
            <button class="side-link ${activeTab === 'wgTransfers' ? 'active' : ''}" data-tab="wgTransfers">${icons.warehouse} <span>Envios WG → IK</span></button>
            <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-tab="products">${icons.products} <span>3 Estoques</span></button>
            <button class="side-link ${activeTab === 'sellerTotals' ? 'active' : ''}" data-tab="sellerTotals">${icons.chart} <span>Totais por Vendedor</span></button>
            <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
            <button class="side-link ${activeTab === 'map' ? 'active' : ''}" data-tab="map">${icons.map} <span>Mapa de Localizações</span></button>
            <button class="side-link ${activeTab === 'sales' ? 'active' : ''}" data-tab="sales">${icons.chart} <span>Dar Baixa / Registrar Venda</span></button>
            <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-tab="sellers">${icons.users} <span>Meus Vendedores</span></button>
            <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-tab="motoboys">${icons.motoboy} <span>Meus Motoboys</span></button>
            <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
            <button class="side-link ${activeTab === 'reports' ? 'active' : ''}" data-tab="reports">${icons.reports} <span>Relatórios</span></button>
            <button class="side-link ${activeTab === 'archived' ? 'active' : ''}" data-tab="archived">${icons.archive} <span>Arquivados</span></button>
        ` : isAdmin ? `
            ${(isWGAccount(currentUser) || isIKAccount(currentUser) || (!isWGAccount(currentUser) && !isIKAccount(currentUser))) ? `<button class="side-link ${activeTab === 'warehouses' ? 'active' : ''}" data-admin-tab="warehouses">${icons.warehouse} <span>3 Estoques</span></button>` : ''}
            ${(!isWGAccount(currentUser) || (!isWGAccount(currentUser) && !isIKAccount(currentUser))) ? `<button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-admin-tab="products">${icons.products} <span>${isIKAccount(currentUser) ? 'Enviar / Distribuir Estoque' : 'Atribuir / Enviar Estoque'}</span></button>` : ''}
            ${(isWGAccount(currentUser) || isIKAccount(currentUser)) ? `<button class="side-link ${activeTab === 'wgIkChat' ? 'active' : ''}" data-admin-tab="wgIkChat">${icons.chat} <span>Conversa WG ↔ IK</span></button><button class="side-link ${activeTab === 'wgTransfers' ? 'active' : ''}" data-admin-tab="wgTransfers">${icons.warehouse} <span>Envios WG → IK</span></button><button class="side-link ${activeTab === 'sellerTotals' ? 'active' : ''}" data-admin-tab="sellerTotals">${icons.chart} <span>Totais por Vendedor</span></button>` : ''}
            <button class="side-link ${activeTab === 'adminHome' ? 'active' : ''}" data-admin-tab="adminHome">${icons.summary} <span>Visão Consolidada</span></button>
            <button class="side-link ${activeTab === 'sellers' ? 'active' : ''}" data-admin-tab="sellers">${icons.users} <span>Equipe de Vendedores</span></button>
            <button class="side-link ${activeTab === 'adminSupervisors' ? 'active' : ''}" data-admin-tab="adminSupervisors">${icons.users} <span>Supervisores & Vendedores</span></button>
            <button class="side-link ${activeTab === 'orders' ? 'active' : ''}" data-admin-tab="orders">${icons.orders} <span>Pedidos de Reposição</span></button>
            <button class="side-link ${activeTab === 'map' ? 'active' : ''}" data-admin-tab="map">${icons.map} <span>Mapa de Localizações</span></button>
            <button class="side-link ${activeTab === 'motoboys' ? 'active' : ''}" data-admin-tab="motoboys">${icons.motoboy} <span>Gestão de Motoboys</span></button>
            <button class="side-link ${activeTab === 'catalog' ? 'active' : ''}" data-admin-tab="catalog">${icons.catalog} <span>Catálogo do Sistema</span></button>
            <button class="side-link ${activeTab === 'sales' ? 'active' : ''}" data-admin-tab="sales">${icons.chart} <span>Dar Baixa / Registrar Venda</span></button>
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
            <button class="side-link ${activeTab === 'products' ? 'active' : ''}" data-tab="products">${icons.products} <span>${isIKAccount(currentUser) ? 'Enviar / Distribuir Estoque' : 'Atribuir / Enviar Estoque'}</span></button>
            ${(isWGAccount(currentUser) || isIKAccount(currentUser)) ? `<button class="side-link ${activeTab === 'wgIkChat' ? 'active' : ''}" data-tab="wgIkChat">${icons.chat} <span>Conversa WG ↔ IK</span></button><button class="side-link ${activeTab === 'wgTransfers' ? 'active' : ''}" data-tab="wgTransfers">${icons.warehouse} <span>Envios WG → IK</span></button><button class="side-link ${activeTab === 'sellerTotals' ? 'active' : ''}" data-tab="sellerTotals">${icons.chart} <span>Totais por Vendedor</span></button>` : ''}
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



function ensureStableResponsiveTheme() {
    if (document.getElementById('newlifeStableTheme')) return;
    const style = document.createElement('style');
    style.id = 'newlifeStableTheme';
    style.textContent = `
        :root { --nl-blue:#1769d1; --nl-blue-2:#2f8bf0; --nl-ink:#172235; --nl-muted:#718096; --nl-line:#e5ebf2; --nl-card:#ffffff; --nl-radius:18px; }
        html, body { min-height:100%; }
        body { margin:0; background:linear-gradient(145deg,#f7faff 0%,#eef4f9 55%,#e9f1f7 100%); color:var(--nl-ink); font-family:-apple-system,BlinkMacSystemFont,"SF Pro Text","SF Pro Display",Inter,system-ui,sans-serif; -webkit-font-smoothing:antialiased; }
        .app-layout { min-height:100vh; background:transparent !important; }
        .app-responsive-sidebar { width:270px !important; flex:0 0 270px; position:sticky; top:0; height:100vh; overflow-y:auto; overflow-x:hidden; z-index:50; background:rgba(248,251,255,.92) !important; border-right:1px solid rgba(148,163,184,.2); box-shadow:10px 0 35px rgba(31,51,77,.07); }
        .app-brand { padding:20px 18px !important; border-bottom:1px solid var(--nl-line); }
        .brand-mark { width:38px; height:38px; display:grid; place-items:center; border-radius:12px; background:linear-gradient(145deg,var(--nl-blue-2),var(--nl-blue)); color:#fff; box-shadow:0 8px 18px rgba(23,105,209,.2); }
        .side-label { padding:18px 16px 7px !important; color:#96a2b3 !important; font-size:9px !important; font-weight:900 !important; letter-spacing:.14em !important; }
        .side-link { margin:3px 10px; min-height:42px; border:1px solid transparent !important; border-radius:12px !important; color:#526174 !important; font-size:11px !important; font-weight:750 !important; transition:background .18s ease,color .18s ease,transform .18s ease,box-shadow .18s ease; }
        .side-link:hover { background:#fff !important; color:#185db4 !important; transform:translateX(2px); box-shadow:0 6px 16px rgba(36,69,105,.08); }
        .side-link.active { color:#145db8 !important; background:linear-gradient(90deg,#e8f2ff,#f5f9ff) !important; border-color:#cfe2f8 !important; box-shadow:0 7px 17px rgba(36,105,190,.1); }
        .side-link.active::before { content:""; position:absolute; left:-11px; top:9px; bottom:9px; width:3px; border-radius:0 3px 3px 0; background:#2d86e8; }
        .side-account { margin:14px 10px !important; padding:10px !important; border:1px solid var(--nl-line); border-radius:14px; background:#fff; }
        .app-content { min-width:0; background:transparent !important; }
        .app-header { min-height:76px; background:rgba(255,255,255,.88) !important; border:0 !important; border-bottom:1px solid var(--nl-line) !important; box-shadow:0 7px 22px rgba(37,58,84,.05) !important; backdrop-filter:blur(12px); }
        .app-header h1 { letter-spacing:-.04em; font-size:clamp(18px,1.8vw,26px) !important; }
        .page-body { width:100%; max-width:1560px; margin:0 auto; padding:clamp(18px,2.4vw,36px) clamp(14px,3vw,48px) !important; }
        .glass-panel, .panel, .metric-card { background:rgba(255,255,255,.84) !important; border:1px solid rgba(255,255,255,.95) !important; outline:1px solid rgba(148,163,184,.16); border-radius:var(--nl-radius) !important; box-shadow:0 12px 34px rgba(39,62,91,.08) !important; }
        .panel { padding:clamp(16px,2vw,26px) !important; }
        .stats-grid { grid-template-columns:repeat(auto-fit,minmax(220px,1fr)) !important; gap:16px !important; }
        .metric-card { min-height:130px; padding:18px !important; transition:transform .18s ease,box-shadow .18s ease; }
        .metric-card:hover { transform:translateY(-3px); box-shadow:0 18px 38px rgba(39,62,91,.13) !important; }
        .seller-attribution-grid { grid-template-columns:repeat(auto-fit,minmax(min(100%,300px),1fr)) !important; gap:18px !important; }
        .seller-attribution-grid > * { min-width:0; border-radius:20px !important; border:1px solid rgba(255,255,255,.95) !important; outline:1px solid rgba(148,163,184,.14); box-shadow:0 13px 30px rgba(39,62,91,.08) !important; transition:transform .18s ease,box-shadow .18s ease; }
        .seller-attribution-grid > *:hover { transform:translateY(-4px); box-shadow:0 20px 38px rgba(39,62,91,.13) !important; }
        .table-row { background:rgba(255,255,255,.62) !important; border-color:var(--nl-line) !important; border-radius:13px !important; }
        .primary-btn,.outline-btn,.small-btn,.delete-btn { min-height:38px; border-radius:11px !important; font-weight:800 !important; transition:transform .16s ease,box-shadow .16s ease,background .16s ease; }
        .primary-btn { background:linear-gradient(135deg,#2f8cf0,#1765cb) !important; box-shadow:0 7px 16px rgba(23,105,209,.18) !important; }
        .primary-btn:hover,.outline-btn:hover,.small-btn:hover { transform:translateY(-1px); }
        .outline-btn,.small-btn { background:#fff !important; border-color:#d9e3ee !important; color:#456079 !important; }
        .control,input,select,textarea { border-radius:11px !important; border-color:#d6e0eb !important; background:#fff !important; }
        .control:focus,input:focus,select:focus,textarea:focus { outline:0; border-color:#72a9df !important; box-shadow:0 0 0 3px rgba(47,140,240,.12) !important; }
        .drawer-overlay { display:none; }
        @media (min-width:1600px) { .page-body{max-width:1720px;} .seller-attribution-grid{grid-template-columns:repeat(4,minmax(280px,1fr)) !important;} }
        @media (min-width:2200px) { .page-body{max-width:1920px;} .seller-attribution-grid{grid-template-columns:repeat(5,minmax(280px,1fr)) !important;} }
        @media (max-width:767px) {
            .app-responsive-sidebar { position:fixed; inset:0 auto 0 0; width:min(86vw,330px) !important; height:100dvh; transform:translateX(-105%); transition:transform .24s ease; box-shadow:20px 0 45px rgba(22,39,61,.22); }
            .app-responsive-sidebar.open { transform:translateX(0); }
            .drawer-overlay.open { display:block; position:fixed; inset:0; z-index:40; background:rgba(15,23,42,.32); backdrop-filter:blur(3px); }
            .app-header { min-height:64px; padding:11px 13px !important; }
            .app-header .primary-btn span,.app-header #pushToSupabaseBtn span,.app-header #generatePageReportBtn span { display:none; }
            .app-header .primary-btn,.app-header .outline-btn { padding:9px !important; min-width:38px; }
            .page-body { padding:14px 12px 24px !important; }
            .seller-attribution-grid { grid-template-columns:1fr !important; gap:14px !important; }
            .stats-grid { grid-template-columns:repeat(2,minmax(0,1fr)) !important; gap:10px !important; }
            .metric-card { min-height:108px; padding:14px !important; }
            .panel { padding:15px !important; }
        }
        @media (max-width:420px) { .stats-grid{grid-template-columns:1fr !important;} .side-link{margin-left:8px;margin-right:8px;} }
        @media (prefers-reduced-motion:reduce) { *,*::before,*::after{transition-duration:.01ms !important;animation-duration:.01ms !important;} }
    `;
    document.head.appendChild(style);
}

function appFrame(title, sub, body) {
    ensureStableResponsiveTheme();
    setPageReportContext(title, sub, activeTab);
    const container = getAppRoot();
    container.innerHTML = `
        <div class="app-layout w-full min-h-screen flex flex-col md:flex-row">
            <aside id="appDrawer" class="app-sidebar app-responsive-sidebar flex flex-col ${drawerOpen ? 'open' : ''}">${navContent()}</aside>
            <div id="appDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
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

                        <!-- WIDGET CÂMBIO DÓLAR / REAL -->
                        <div id="exchangeRateWidget" class="hidden sm:block shrink-0">
                            <div class="flex items-center gap-2 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl border border-slate-700 shadow-sm">
                                <span class="text-amber-400">💵 <b>USD/BRL:</b> R$ ${currentExchangeRate.bid ? currentExchangeRate.bid.toFixed(2) : '—'}</span>
                                <span class="text-emerald-400 font-extrabold">(Máx: R$ ${currentExchangeRate.high ? currentExchangeRate.high.toFixed(2) : '—'})</span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2 shrink-0 ml-auto">
                            <button id="pushToSupabaseBtn" class="primary-btn flex items-center gap-1.5 text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm border-0">
                                ${icons.upload} <span>Enviar Alterações p/ Supabase</span>
                            </button>
                            <button id="generatePageReportBtn" class="outline-btn flex items-center gap-1.5 text-xs py-1.5 px-3">
                                ${icons.pdf} <span>Gerar Relatório</span>
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

    const pushBtn = document.getElementById('pushToSupabaseBtn');
    if (pushBtn) {
        pushBtn.onclick = async () => {
            await pushAllToSupabase();
        };
    }
    bindPageReportButton();
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
                if (targetProduct) {
                    await supabaseClient.from('seller_products').update({ stock: targetProduct.stock }).eq('id', targetProduct.id);
                }
                await supabaseClient.from('transfers').update({ reverted: true, reverted_at: t.revertedAt }).eq('id', t.id);
            }

            showToast('Envio desfeito com sucesso! Estoque restaurado no Supabase.');
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

    fileInput.onchange = e => openAvatarCropModal(e.target.files[0], cropped => {
        m.querySelector('#selfAvatarBase64').value = cropped;
        m.querySelector('#selfAvatarPreview').innerHTML = `<img src="${cropped}" style="width:100%; height:100%; object-fit:cover;">`;
    });

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

        showToast('Perfil atualizado e gravado no Supabase!');
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
    if (canUseWgIkChat() && activeTab === 'wgIkChat') return renderWgIkChatPage();
    if (activeTab === 'sales') return renderSupervisorSalesPage();
    if (activeTab === 'map') return renderMapPage();
    if (activeTab === 'sellers') return renderSellersPage();
    if (activeTab === 'motoboys') return renderMotoboysPage();
    if (activeTab === 'orders') return renderSupervisorOrdersPage();
    if (activeTab === 'archived') return renderArchivedPage();
    if (activeTab === 'catalog') return renderCatalogPage();
    if (activeTab === 'products') return isWGAccount(currentUser) ? renderWarehousesPage() : renderProductsPage();
    if (activeTab === 'wgTransfers' || activeTab === 'wgIkStock') return renderWgTransfersPage();
    if (activeTab === 'sellerTotals' || activeTab === 'sellerSheets') return renderSellerTotalsPage();
    if (activeTab === 'reports') return renderReportsPage();
    renderSummary();
}

function renderAdmin() {
    if (canUseWgIkChat() && activeTab === 'wgIkChat') return renderWgIkChatPage();
    if (activeTab === 'sales') return renderSupervisorSalesPage();
    if (activeTab === 'map') return renderMapPage();
    if (activeTab === 'warehouses') return renderWarehousesPage();
    if (activeTab === 'adminSupervisors') return renderAdminSupervisorsPage();
    if (activeTab === 'sellers') return renderSellersPage();
    if (activeTab === 'motoboys') return renderMotoboysPage();
    if (activeTab === 'orders') return renderSupervisorOrdersPage();
    if (activeTab === 'catalog') return renderCatalogPage();
    if (activeTab === 'products') return isWGAccount(currentUser) ? renderWarehousesPage() : renderProductsPage();
    if (activeTab === 'wgTransfers' || activeTab === 'wgIkStock') return renderWgTransfersPage();
    if (activeTab === 'sellerTotals' || activeTab === 'sellerSheets') return renderSellerTotalsPage();
    if (activeTab === 'backup') return renderBackupPage();
    if (activeTab === 'adminReports') return renderReportsPage();
    renderAdminHome();
}

// ABA: VISÃO CONSOLIDADA
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

    appFrame('Visão Consolidada & Controle Geral', 'Painel de controle com faturamento em tempo real e gravação direta no Supabase.', `
        <div class="stats-grid mb-6">
            <div class="metric-card glass-panel">
                <div class="metric-top"><span>Faturamento Global</span><span class="metric-icon cyan">${icons.dollar}</span></div>
                <div class="metric-value text-base md:text-lg font-black">${moneyPair(totalRevenueBRL)}</div>
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
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                    <h2>Auditoria Global de Vendas Registradas</h2>
                    <p class="text-xs text-slate-500">Histórico completo de saídas de mercadorias lançadas por vendedores e supervisores.</p>
                </div>
                <!-- BOTÃO DE LIMPAR DADOS DOS LOGS DE VENDAS -->
                ${allSalesList.length ? `
                    <button id="clearSalesLogsBtn" class="delete-btn text-xs py-2 px-3 flex items-center gap-1.5" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca;">
                        ${icons.trash} <span>Limpar Logs de Vendas</span>
                    </button>
                ` : ''}
            </div>

            ${allSalesList.length ? `
                <div class="data-table flex flex-col gap-3">
                    <div class="table-head hidden md:grid" style="grid-template-columns: 1.5fr 2fr 1.8fr 1fr 1.8fr; align-items: center;">
                        <span>Data e Hora</span><span>Vendedor / Responsável</span><span>Produto Lançado</span><span>Qtd Vendida</span><span>Valor Total (R$)</span>
                    </div>
                    ${allSalesList.slice().reverse().map(s => {
                        const seller = users.find(u => u.id === s.sellerId);
                        const prod = allProds.find(p => p.id === s.productId);
                        const prodName = prod ? `${prod.name} (${prod.brand})` : 'Produto Registrado';
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
                                    <span class="font-bold text-slate-700">${esc(prodName)}</span>
                                </div>
                                <div class="flex justify-between items-center md:block">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Qtd</span>
                                    <b>${s.quantity} un.</b>
                                </div>
                                <div class="flex justify-between items-center md:block pt-2 md:pt-0 border-t border-slate-100 md:border-0">
                                    <span class="text-xs font-bold text-slate-400 uppercase md:hidden">Total</span>
                                    <strong class="highlight-val text-emerald-600">${money(s.total)}</strong>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>
            ` : '<div class="empty-state">Nenhuma venda registrada no sistema ainda.</div>'}
        </div>
    `);

    const clearBtn = document.getElementById('clearSalesLogsBtn');
    if (clearBtn) {
        clearBtn.onclick = () => {
            confirmActionModal({
                title: '🗑️ Limpar Logs de Vendas',
                subtitle: 'Aba Visão Consolidada',
                warningText: 'Atenção! Esta ação apaga permanentemente o histórico de vendas registradas no sistema local e no Supabase.',
                confirmText: 'Confirmar e Limpar Vendas',
                onConfirm: async () => {
                    try {
                        await deleteAllRowsFromSupabase('sales');
                        write('atlasSales', []);
                        showToast('Logs de vendas zerados com sucesso!');
                        renderAdminHome();
                    } catch (error) {
                        console.error('Erro ao apagar logs de vendas:', error);
                        alert(`Não foi possível apagar os logs de vendas: ${error.message}`);
                    }
                }
            });
        };
    }
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
                        showToast(`Supervisor do vendedor alterado e salvo no Supabase!`);
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

    fileInput.onchange = e => openAvatarCropModal(e.target.files[0], cropped => {
        avatarBase64.value = cropped;
        preview.innerHTML = `<img src="${cropped}" style="width:100%;height:100%;object-fit:cover;">`;
    });

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
                        username: sup.user,
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
                showToast('Supervisor salvo com sucesso no Supabase!');
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

    fileInput.onchange = e => openAvatarCropModal(e.target.files[0], cropped => {
        avatarBase64.value = cropped;
        preview.innerHTML = `<img src="${cropped}" style="width:100%;height:100%;object-fit:cover;">`;
    });

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
                        username: seller.user,
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
                    if (!existing) {
                        try { await createInitialSheetForSeller(seller.id); } catch (sheetError) { console.error('Vendedor salvo, mas a planilha inicial não foi criada:', sheetError); }
                    }
                }

                m.remove();
                showToast('Vendedor salvo com sucesso no Supabase!');
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

            showToast('Vendedor removido do Supabase!');
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
                showToast('Motoboy salvo com sucesso no Supabase!');
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

    appFrame('Backup & Importação de Dados', 'Exporte o banco de dados completo em JSON ou baixe uma PLANILHA CONSOLIDADA ÚNICA (CSV/Excel) com estoque e vendas.', `
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
                    systemVersion: 'v22',
                    exportedAt: new Date().toISOString(),
                    users: allUsers(),
                    warehouses: warehouses(),
                    warehouseInventory: warehouseInventory(),
                    transfers: warehouseTransfers(),
                    wgIkShipments: wgIkShipments(),
                    ikSellerAllocations: ikSellerAllocations(),
                    sellerPaymentLedger: sellerPaymentLedger(),
                    sellerPaymentSheets: sellerPaymentSheets(),
                    sellerPaymentSheetLines: sellerPaymentSheetLines(),
                    products: products(),
                    sales: sales(),
                    orders: orders(),
                    motoboys: allMotoboys(),
                    productCatalog: productCatalog(),
                    wgIkMessages: conversationMessages()
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
                    onConfirm: async () => {
                        write('nl_users', data.users || []);
                        write('nl_warehouses', data.warehouses || []);
                        write('nl_warehouse_inventory', data.warehouseInventory || []);
                        write('nl_transfers', data.transfers || []);
                        write('nl_wg_ik_shipments', data.wgIkShipments || []);
                        write('nl_ik_seller_allocations', data.ikSellerAllocations || []);
                        write('nl_seller_payment_ledger', data.sellerPaymentLedger || []);
                        write('nl_seller_payment_sheets', data.sellerPaymentSheets || []);
                        write('nl_seller_payment_sheet_lines', data.sellerPaymentSheetLines || []);
                        write('atlasProducts', data.products || []);
                        write('atlasSales', data.sales || []);
                        write('atlasOrders', data.orders || []);
                        write('nl_motoboys', data.motoboys || []);
                        dbCache.product_catalog = (data.productCatalog || []).map(p => ({ ...p, createdAt: p.created_at || p.createdAt, createdBy: p.created_by || p.createdBy }));
                        dbCache.wg_ik_messages = (data.wgIkMessages || []).map(m => ({ ...m, senderId: m.sender_id || m.senderId, senderRole: m.sender_role || m.senderRole, recipientId: m.recipient_id || m.recipientId, messageType: m.message_type || m.messageType || 'normal', createdAt: m.created_at || m.createdAt, readAt: m.read_at || m.readAt }));
                        localStorage.setItem('nl_wg_ik_messages', JSON.stringify(dbCache.wg_ik_messages));
                        
                        await pushAllToSupabase();
                        
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

    csv += `\n=== 3. RESUMO DE VENDAS E BAIXAS NOS ULTIMOS 7 DIAS ===\nNome Integrante,Cargo / Função,Supervisor,Cidade/UF,Qtd Vendas (Ultimos 7 Dias),Total Faturado (R$ / US$)\n`;
    [...supsList, ...sellersList].forEach(u => {
        const sales7d = periodSales(u.id, '7days');
        const totalQty7d = sales7d.reduce((a, x) => a + x.quantity, 0);
        const totalRev7d = sales7d.reduce((a, x) => a + x.total, 0);
        csv += `"${u.name} (@${u.user})","${u.role}","${u.supervisor || 'Geral'}","${u.city}/${u.uf}",${totalQty7d},${totalRev7d.toFixed(2)},${currentExchangeRate.ask > 0 ? (totalRev7d / currentExchangeRate.ask).toFixed(2) : '0.00'}\n`;
    });

    csv += `\n=== 4. HISTORICO COMPLETO DE BAIXAS REGISTRADAS ===\nID Venda,Data e Hora,Vendedor / Responsavel,Produto,Quantidade Vendida,Preço Unitario (R$ / US$),Total Faturado (R$ / US$)\n`;
    salesList.slice().reverse().forEach(s => {
        const seller = usersList.find(u => u.id === s.sellerId);
        const prod = prodsList.find(p => p.id === s.productId);
        csv += `"${s.id}","${new Date(s.createdAt).toLocaleString('pt-BR')}","${seller ? seller.name : s.sellerId}","${prod ? prod.name : 'Produto Registrado'}",${s.quantity},${(s.unitPrice || 0).toFixed(2)},${s.total.toFixed(2)},${currentExchangeRate.ask > 0 ? (s.total / currentExchangeRate.ask).toFixed(2) : '0.00'}\n`;
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

function removeProductsForUserModal() {
    if (!hasAdminAccess(currentUser) && !hasSupervisorAccess(currentUser)) {
        return showToast('Apenas admin e supervisor podem excluir produtos em nome de outra pessoa.');
    }

    const allowedUsers = hasAdminAccess(currentUser)
        ? [...allSupervisors(), ...allSellers()]
        : [...allSellers().filter(s => (s.supervisor || '').toLowerCase() === (currentUser.user || '').toLowerCase()), currentUser];
    const initialUser = allowedUsers[0];
    if (!initialUser) return alert('Nenhum usuário disponível para realizar a baixa.');

    const m = modal(`
        <h2>Excluir Produtos em Nome de Outra Pessoa</h2>
        <p class="text-xs text-slate-500 mb-3">Admin e supervisor podem remover unidades do estoque do usuário selecionado. Esta ação ficará registrada como baixa de estoque.</p>
        <form id="removeForUserForm" class="seller-form">
            <label>Usuário responsável pelo estoque
                <select name="userId" id="removeForUserSelect" class="control" required>
                    ${allowedUsers.map(u => `<option value="${u.id}">${esc(u.name)} (@${esc(u.user)}) — ${esc(u.role)}</option>`).join('')}
                </select>
            </label>
            <label>Produto a excluir
                <select name="productId" id="removeForProductSelect" class="control" required></select>
            </label>
            <label>Quantidade a excluir
                <input name="quantity" type="number" min="1" value="1" class="control" required>
            </label>
            <button type="button" id="confirmRemoveForUserBtn" class="delete-btn w-full mt-3" style="background:#dc2626; color:white;">${icons.trash} Excluir Produtos</button>
        </form>
    `);

    const userSelect = m.querySelector('#removeForUserSelect');
    const productSelect = m.querySelector('#removeForProductSelect');
    const quantityInput = m.querySelector('[name="quantity"]');
    const refreshProducts = () => {
        const ownerId = userSelect.value;
        const available = products().filter(p => p.sellerId === ownerId && Number(p.stock) > 0);
        productSelect.innerHTML = available.length
            ? available.map(p => `<option value="${p.id}" data-stock="${p.stock}">${esc(p.name)} (${esc(p.brand)}) — ${p.stock} un.</option>`).join('')
            : '<option value="">Nenhum produto com estoque</option>';
        quantityInput.max = available[0]?.stock || 0;
    };
    userSelect.onchange = refreshProducts;
    productSelect.onchange = () => { quantityInput.max = productSelect.selectedOptions[0]?.dataset.stock || 0; };
    refreshProducts();

    m.querySelector('#confirmRemoveForUserBtn').onclick = () => {
        const form = m.querySelector('form');
        if (!form.checkValidity()) { form.reportValidity(); return; }
        const f = new FormData(form);
        const owner = allowedUsers.find(u => u.id === f.get('userId'));
        const allProducts = products();
        const product = allProducts.find(p => p.id === f.get('productId') && p.sellerId === owner?.id);
        const qty = Number(f.get('quantity'));
        if (!owner || !product) return alert('Selecione um usuário e produto válidos.');
        if (!Number.isInteger(qty) || qty < 1 || qty > Number(product.stock)) return alert(`Quantidade inválida. Disponível: ${product.stock} unidade(s).`);

        confirmActionModal({
            title: 'Confirmar Exclusão de Produtos',
            subtitle: `${qty}x ${product.name} de ${owner.name}`,
            warningText: `O estoque de ${owner.name} será reduzido em ${qty} unidade(s). A operação será executada por ${currentUser.name}.`,
            confirmText: 'Confirmar Exclusão',
            onConfirm: async () => {
                product.stock = Number(product.stock) - qty;
                const sl = sales();
                const removal = {
                    id: uid(), sellerId: owner.id, productId: product.id, quantity: qty,
                    unitPrice: Number(product.price || 0), total: 0,
                    type: 'ADMIN_SUPERVISOR_REMOVAL', removedBy: currentUser.id,
                    removedByName: currentUser.name, createdAt: new Date().toISOString()
                };
                sl.push(removal);
                write('atlasProducts', allProducts);
                write('atlasSales', sl);
                if (supabaseClient) {
                    await supabaseClient.from('seller_products').update({ stock: product.stock }).eq('id', product.id);
                    await supabaseClient.from('sales').insert({
                        id: removal.id, seller_id: removal.sellerId, product_id: removal.productId,
                        quantity: removal.quantity, unit_price: removal.unitPrice, total: removal.total,
                        created_at: removal.createdAt
                    });
                }
                m.remove();
                showToast(`Produtos excluídos do estoque de ${owner.name}!`);
                renderSupervisorSalesPage();
            }
        });
    };
}

function renderSupervisorSalesPage() {
    const myProducts = products().filter(p => p.sellerId === currentUser.id && Number(p.stock) > 0);

    appFrame('Dar Baixa / Registrar Vendas (Supervisor)', 'Registre as vendas efetuadas diretamente do seu estoque próprio de supervisor.', `
        <div class="panel glass-panel">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-4">
                <h2>Registrar Baixas do Seu Estoque</h2>
                ${myProducts.length ? `<button id="registerSupSaleBtn" class="primary-btn w-full sm:w-auto">${icons.check} Confirmar Vendas</button>` : ''}
                ${(hasAdminAccess(currentUser) || hasSupervisorAccess(currentUser)) ? `<button id="removeProductsForUserBtn" class="delete-btn w-full sm:w-auto text-xs py-2 px-3" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca;">${icons.trash} Excluir Produtos em Nome de Outra Pessoa</button>` : ''}
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

    const removeForUserBtn = document.getElementById('removeProductsForUserBtn');
    if (removeForUserBtn) removeForUserBtn.onclick = removeProductsForUserModal;

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
                    showToast('Vendas do supervisor registradas no Supabase!');
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
                showToast('Produtos enviados ao vendedor e salvos no Supabase!');
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
                <div class="metric-value text-base md:text-lg font-black">${moneyPair(revBRL)}</div>
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
                    <span>Vendedor</span><span>Localização</span><span>Qtd Vendida</span><span>Faturamento (R$ / US$)</span>
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
                            <strong class="highlight-val">${moneyPair(r.xs.reduce((a, x) => a + x.total, 0))}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);
}

// ABA: 3 ESTOQUES (WAREHOUSES)
function renderWarehousesPage() {
    const whList = warehouses();
    const inv = warehouseInventory();
    const transfers = warehouseTransfers();

    appFrame('3 Estoques', 'Gerencie os três estoques físicos e envie produtos.', `
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
                ${inv.length ? `<button id="clearPhysicalInventoryLogsBtn" class="delete-btn text-xs py-2 px-3 flex items-center gap-1.5" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca;">${icons.trash} <span>Excluir Logs do Inventário</span></button>` : ''}
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
                                <button class="delete-btn delete-inv-btn text-xs py-1 px-2" data-id="${i.id}">${icons.trash} Excluir</button>
                            </div>
                        </div>
                    `;
                }).join('') : '<div class="p-6 text-center text-slate-400">Nenhum produto cadastrado nos estoques. Clique em "+ Inserir Produto" para adicionar.</div>'}
            </div>
        </div>

        <div class="panel glass-panel">
            <div class="panel-head flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-3">
                <div>
                    <h2>Histórico Geral de Transferências (Com opção de Desfazer)</h2>
                    <p class="text-xs text-slate-500">Histórico de saídas dos depósitos centrais para vendedores e supervisores.</p>
                </div>
                <!-- BOTÃO DE LIMPAR LOGS DE TRANSFERÊNCIA -->
                ${transfers.length ? `
                    <button id="clearTransferLogsBtn" class="delete-btn text-xs py-2 px-3 flex items-center gap-1.5" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca;">
                        ${icons.trash} <span>Limpar Logs de Transferências</span>
                    </button>
                ` : ''}
            </div>
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

    const clearPhysicalBtn = document.getElementById('clearPhysicalInventoryLogsBtn');
    if (clearPhysicalBtn) {
        clearPhysicalBtn.onclick = () => {
            confirmActionModal({
                title: '🗑️ Excluir Logs do Inventário Físico',
                subtitle: 'Listagem de inventário físico dos estoques centrais',
                warningText: 'Atenção! Esta ação excluirá permanentemente todos os itens registrados no inventário físico dos depósitos matriz, no sistema local e no Supabase.',
                confirmText: 'Confirmar e Excluir Logs',
                onConfirm: async () => {
                    try {
                        await deleteAllRowsFromSupabase('warehouse_inventory');
                        write('nl_warehouse_inventory', []);
                        showToast('Logs do inventário físico excluídos com sucesso!');
                        renderWarehousesPage();
                    } catch (error) {
                        console.error('Erro ao apagar logs do inventário:', error);
                        alert(`Não foi possível apagar os logs do inventário: ${error.message}`);
                    }
                }
            });
        };
    }

    document.querySelectorAll('.add-item-wh').forEach(b => b.onclick = () => addWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.send-from-wh').forEach(b => b.onclick = () => transferStockModal(b.dataset.id));
    document.querySelectorAll('.edit-inv-btn').forEach(b => b.onclick = () => editWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.delete-inv-btn').forEach(b => b.onclick = () => deleteWarehouseItem(b.dataset.id));
    document.querySelectorAll('.undo-transfer-btn').forEach(b => b.onclick = () => undoTransferModal(b.dataset.id));

    const clearTrBtn = document.getElementById('clearTransferLogsBtn');
    if (clearTrBtn) {
        clearTrBtn.onclick = () => {
            confirmActionModal({
                title: '🗑️ Limpar Logs de Transferências',
                subtitle: 'Aba Estoque',
                warningText: 'Deseja apagar permanentemente o histórico de transferências de estoque do sistema local e do Supabase?',
                confirmText: 'Confirmar e Limpar Transferências',
                onConfirm: async () => {
                    try {
                        await deleteAllRowsFromSupabase('transfers');
                        write('nl_transfers', []);
                        showToast('Logs de transferências limpos com sucesso!');
                        renderWarehousesPage();
                    } catch (error) {
                        console.error('Erro ao apagar logs de transferências:', error);
                        alert(`Não foi possível apagar os logs de transferências: ${error.message}`);
                    }
                }
            });
        };
    }
}

function renderStockPanel() {
    const wh = warehouses().find(w => w.id === currentUser.warehouseId) || warehouses()[0];
    setPageReportContext(`Estoque ${wh?.name || ''}`, 'Inventário e histórico de saídas deste estoque.', 'stock');
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
                    <button id="pushStockSupabaseBtn" class="primary-btn flex items-center gap-1.5 text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm border-0">
                        ${icons.upload} <span>Enviar Alterações p/ Supabase</span>
                    </button>
                    <button id="generatePageReportBtn" class="outline-btn flex items-center gap-1.5 text-xs py-1.5 px-3">${icons.pdf} <span>Gerar Relatório</span></button>
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
                    <div class="flex justify-between items-center mb-4">
                        <h3 class="text-sm font-bold text-sky-600 uppercase tracking-wider">Histórico de Saídas / Envios</h3>
                        ${myTransfers.length ? `
                            <button id="clearStockTransfersBtn" class="delete-btn text-xs py-1.5 px-3 flex items-center gap-1" style="background:#fef2f2; color:#dc2626; border:1px solid #fecaca;">
                                ${icons.trash} <span>Limpar Logs</span>
                            </button>
                        ` : ''}
                    </div>
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

    document.getElementById('pushStockSupabaseBtn').onclick = pushAllToSupabase;
    bindPageReportButton();
    document.getElementById('stockLogout').onclick = logout;
    document.getElementById('stockAddItemBtn').onclick = () => addWarehouseItemModal(wh.id);
    document.getElementById('stockDispatchBtn').onclick = () => transferStockModal(wh.id);
    document.querySelectorAll('.edit-stock-item').forEach(b => b.onclick = () => editWarehouseItemModal(b.dataset.id));
    document.querySelectorAll('.undo-transfer-btn').forEach(b => b.onclick = () => undoTransferModal(b.dataset.id));

    const clStockTrBtn = document.getElementById('clearStockTransfersBtn');
    if (clStockTrBtn) {
        clStockTrBtn.onclick = () => {
            confirmActionModal({
                title: '🗑️ Limpar Logs de Transferência',
                warningText: 'Deseja apagar todos os registros de transferências deste depósito?',
                confirmText: 'Limpar Registros',
                onConfirm: async () => {
                    try {
                        if (supabaseClient) {
                            const { error } = await supabaseClient.from('transfers').delete().eq('warehouse_id', wh.id);
                            if (error) throw error;
                        }
                        const remainingTransfers = warehouseTransfers().filter(t => t.warehouseId !== wh.id);
                        write('nl_transfers', remainingTransfers);
                        showToast('Logs de transferências zerados!');
                        renderStockPanel();
                    } catch (error) {
                        console.error('Erro ao apagar logs do estoque:', error);
                        alert(`Não foi possível apagar os logs deste estoque: ${error.message}`);
                    }
                }
            });
        };
    }
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
                showToast('Produto adicionado ao estoque e salvo no Supabase!');
                currentUser.role === 'STOCK' ? renderStockPanel() : renderWarehousesPage();
            }
        });
    };
}

async function deleteWarehouseItem(itemId) {
    if (!hasAdminAccess(currentUser) && currentUser?.role !== 'STOCK') {
        return showToast('Você não tem permissão para excluir itens do inventário.');
    }
    const inv = warehouseInventory();
    const item = inv.find(i => i.id === itemId);
    if (!item) return;
    const wh = warehouses().find(w => w.id === item.warehouseId);

    confirmActionModal({
        title: 'Excluir Produto do Inventário Físico',
        subtitle: `${item.productName} (${item.brand}) — ${wh?.name || 'Depósito'}`,
        warningText: 'O item será removido permanentemente da listagem de inventário físico e do Supabase.',
        confirmText: 'Excluir Produto',
        onConfirm: async () => {
            write('nl_warehouse_inventory', inv.filter(i => i.id !== itemId));
            if (supabaseClient) {
                await supabaseClient.from('warehouse_inventory').delete().eq('id', itemId);
            }
            showToast('Produto excluído do inventário físico!');
            currentUser.role === 'STOCK' ? renderStockPanel() : renderWarehousesPage();
        }
    });
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
                showToast('Estoque atualizado no Supabase!');
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
                showToast('Produto enviado e registrado no Supabase!');
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
                        showToast('Status do pedido atualizado no Supabase!');
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
                        showToast('Pedido entregue e arquivado no Supabase!');
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

// ABA: CATÁLOGO DO SISTEMA (COM BOTÃO ADICIONAR PRODUTO)
function renderCatalogPage() {
    const sysCat = systemCatalog();

    appFrame('Catálogo do Sistema', 'Catálogo oficial multi-marcas. Adicione novos produtos que serão atualizados no Supabase.', `
        <div class="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-3">
            <b>${sysCat.length} Produtos Registrados no Catálogo</b>
            <button id="addCatalogProductBtn" class="primary-btn text-xs py-2.5 px-4 flex items-center justify-center gap-1.5 w-full sm:w-auto">
                + Adicionar Novo Produto ao Catálogo
            </button>
        </div>

        <div class="panel glass-panel">
            <div class="catalog-grid grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                ${sysCat.map(p => `
                    <div class="catalog-card p-4 bg-white/90 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between gap-2">
                        <div class="catalog-badge self-start font-bold uppercase text-[10px] tracking-wider text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded-md">${esc(p[1])}</div>
                        <h3 class="font-bold text-slate-900 text-sm mt-1">${esc(p[0])}</h3>
                    </div>
                `).join('')}
            </div>
        </div>
    `);

    const addCatBtn = document.getElementById('addCatalogProductBtn');
    if (addCatBtn) {
        addCatBtn.onclick = () => {
            const m = modal(`
                <h2>+ Adicionar Produto ao Catálogo</h2>
                <p class="text-xs text-slate-500 mb-3">O novo produto ficará disponível em todo o sistema para atribuição e reposições.</p>
                <form id="addCatalogForm" class="seller-form">
                    <label>Nome do Produto
                        <input name="name" class="control" required placeholder="ex: Retatrutide 80mg">
                    </label>
                    <label>Marca / Fabricante
                        <input name="brand" class="control" required placeholder="ex: New Life">
                    </label>
                    <button type="submit" class="primary-btn w-full mt-3">${icons.check} Salvar no Catálogo e Supabase</button>
                </form>
            `);

            m.querySelector('#addCatalogForm').onsubmit = async e => {
                e.preventDefault();
                const f = new FormData(e.target);
                const pName = f.get('name').trim();
                const pBrand = f.get('brand').trim();

                if (!pName || !pBrand) return alert('Informe o nome e a marca do produto.');

                confirmActionModal({
                    title: 'Adicionar Produto ao Catálogo',
                    subtitle: `${pName} (${pBrand})`,
                    warningText: 'Deseja cadastrar este novo produto no catálogo do sistema?',
                    confirmText: 'Confirmar Cadastro',
                    onConfirm: async () => {
                        if (!supabaseClient) return alert('Supabase não está conectado. O produto não foi cadastrado.');
                        const duplicate = productCatalog().some(x => String(x.name).trim().toLowerCase() === pName.toLowerCase() && String(x.brand).trim().toLowerCase() === pBrand.toLowerCase());
                        if (duplicate) return alert('Este produto já existe no catálogo para esta marca.');
                        const now = new Date().toISOString();
                        const newCatalogProduct = { id: uid(), name: pName, brand: pBrand, createdAt: now, createdBy: currentUser?.id || null };
                        const { error } = await supabaseClient.from('product_catalog').insert({
                            id: newCatalogProduct.id,
                            name: newCatalogProduct.name,
                            brand: newCatalogProduct.brand,
                            created_at: newCatalogProduct.createdAt,
                            created_by: newCatalogProduct.createdBy
                        });
                        if (error) return alert(`Não foi possível cadastrar o produto: ${error.message}`);
                        dbCache.product_catalog = [...productCatalog(), newCatalogProduct].sort((a, b) => `${a.brand} ${a.name}`.localeCompare(`${b.brand} ${b.name}`, 'pt-BR'));
                        showToast('Novo produto cadastrado e sincronizado com o Supabase!');
                        m.remove();
                        renderCatalogPage();
                    }
                });
            };
        };
    }
}

function editSellerStockModal(productId) {
    if (!hasAdminAccess(currentUser)) return;
    const allP = products();
    const target = allP.find(p => p.id === productId);
    const seller = allSellers().find(u => u.id === target?.sellerId);
    if (!target || !seller) return;
    const m = modal(`
        <h2>Editar Quantidade em Estoque</h2>
        <p class="text-xs text-slate-500 mb-3">${esc(target.name)} — ${esc(seller.name)}</p>
        <form id="editStockForm" class="seller-form">
            <label>Quantidade atual
                <input name="stock" type="number" min="0" step="1" value="${Number(target.stock) || 0}" class="control" required>
            </label>
            <button type="submit" class="primary-btn w-full mt-3">${icons.check} Salvar Quantidade</button>
        </form>
    `);
    m.querySelector('form').onsubmit = async e => {
        e.preventDefault();
        const newStock = Number(new FormData(e.target).get('stock'));
        if (!Number.isInteger(newStock) || newStock < 0) return alert('Informe uma quantidade inteira igual ou maior que zero.');
        target.stock = newStock;
        write('atlasProducts', allP);
        if (supabaseClient) await supabaseClient.from('seller_products').update({ stock: newStock }).eq('id', target.id);
        showToast('Quantidade atualizada com sucesso!');
        m.remove();
        renderProductsPage();
    };
}

function deleteSellerStockProduct(productId) {
    if (!hasAdminAccess(currentUser)) return;
    const allP = products();
    const target = allP.find(p => p.id === productId);
    const seller = allSellers().find(u => u.id === target?.sellerId);
    if (!target || !seller) return;
    confirmActionModal({
        title: 'Excluir Produto do Estoque',
        subtitle: `${target.name} — ${seller.name}`,
        warningText: 'O produto será removido permanentemente do estoque deste vendedor. Esta ação não altera o catálogo global.',
        confirmText: 'Excluir Produto',
        onConfirm: async () => {
            write('atlasProducts', allP.filter(p => p.id !== productId));
            if (supabaseClient) await supabaseClient.from('seller_products').delete().eq('id', productId);
            showToast('Produto removido do estoque do vendedor.');
            renderProductsPage();
        }
    });
}


// OPERAÇÃO WG → IK → VENDEDORES (tabelas normalizadas no Supabase)
function openWgShipmentModal() {
    if (!isWGAccount()) return showToast('Somente WG pode enviar estoque ao IK.');
    const catalogItems=[...new Map(systemCatalog().map(([name,brand])=>[`${name}::${brand}`,{name,brand}])).values()];
    const options='<option value="">Selecione um produto do catálogo</option>'+catalogItems.map(item=>`<option value="${esc(item.name)}" data-brand="${esc(item.brand)}">${esc(item.name)}${item.brand?` — ${esc(item.brand)}`:''}</option>`).join('');
    const m=modal(`<h2>WG: Cadastrar Estoque para IK</h2><p class="text-xs text-slate-500 mb-3">Selecione o produto cadastrado e informe manualmente o valor que o WG passou para o IK.</p><form id="wgShipmentForm" class="seller-form"><label>Produto do catálogo<select name="productName" id="wgProductSelect" class="control" required>${options}</select></label><input type="hidden" name="brand" id="wgProductBrand"><label>Quantidade<input name="quantity" type="number" min="1" class="control" required></label><label>Valor unitário passado ao IK (R$)<input name="unitCost" type="number" min="0" step="0.01" class="control" required placeholder="Digite o valor manualmente"></label><label>Observação<input name="notes" class="control"></label><button class="primary-btn w-full mt-3" type="submit">Salvar estoque para IK</button></form>`);
    const productSelect=m.querySelector('#wgProductSelect'); productSelect.onchange=()=>{m.querySelector('#wgProductBrand').value=productSelect.selectedOptions[0]?.dataset.brand||'';};
    m.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const qty=Number(f.get('quantity'));const unit=Number(f.get('unitCost'));const productName=String(f.get('productName')||'').trim();if(!productName||!Number.isInteger(qty)||qty<1||!(unit>=0))return alert('Selecione um produto e informe quantidade e valor válidos.');const now=new Date().toISOString();const item={id:uid(),wgId:wgAccountId(),ikId:ikAccountId(),productName,brand:String(f.get('brand')||''),quantitySent:qty,quantityRemaining:qty,unitCostBRL:Number(unit.toFixed(2)),totalValueBRL:Number((qty*unit).toFixed(2)),remainingValueBRL:Number((qty*unit).toFixed(2)),status:'OPEN',notes:String(f.get('notes')||'').trim(),createdAt:now,updatedAt:now};const existing=wgIkShipments().filter(x=>x.status!=='CLOSED'&&x.productName===item.productName&&String(x.brand||'')===item.brand).sort((a,b)=>new Date(b.updatedAt||b.createdAt)-new Date(a.updatedAt||a.createdAt))[0];
        let error=null; let list=wgIkShipments();
        if(existing){
            const newRemainingQty=Number(existing.quantityRemaining)+qty; const newSentQty=Number(existing.quantitySent)+qty; const newTotal=Number((newRemainingQty*unit).toFixed(2));
            const result=await supabaseClient.from('wg_ik_shipments').update({quantity_sent:newSentQty,quantity_remaining:newRemainingQty,unit_cost_brl:item.unitCostBRL,total_value_brl:Number((newSentQty*unit).toFixed(2)),remaining_value_brl:newTotal,updated_at:now,notes:item.notes||existing.notes}).eq('id',existing.id); error=result.error;
            if(!error){existing.quantitySent=newSentQty;existing.quantityRemaining=newRemainingQty;existing.unitCostBRL=item.unitCostBRL;existing.totalValueBRL=Number((newSentQty*unit).toFixed(2));existing.remainingValueBRL=newTotal;existing.updatedAt=now;existing.notes=item.notes||existing.notes;}
        } else {
            const result=await supabaseClient.from('wg_ik_shipments').insert({id:item.id,wg_id:item.wgId,ik_id:item.ikId,product_name:item.productName,brand:item.brand,quantity_sent:item.quantitySent,quantity_remaining:item.quantityRemaining,unit_cost_brl:item.unitCostBRL,total_value_brl:item.totalValueBRL,remaining_value_brl:item.remainingValueBRL,status:item.status,notes:item.notes,created_at:now,updated_at:now}); error=result.error; if(!error)list.push(item);
        }
        if(error)return alert(`Não foi possível registrar: ${error.message}`);write('nl_wg_ik_shipments',list);m.remove();showToast(existing?'Valor do produto atualizado para o IK.':'Produto cadastrado no estoque do IK.');renderWgIkStockPage();};
}


function openIkAllocationModal() {
    if (!isIKAccount() && !hasAdminAccess()) return showToast('Somente IK pode repassar estoque aos vendedores.');
    const available=wgIkShipments().filter(x=>Number(x.quantityRemaining)>0&&x.status!=='CLOSED'); const sellers=allSellers(); const rate=Number(currentExchangeRate.ask||currentExchangeRate.bid||0);
    if(!available.length)return alert('Não há estoque recebido do WG disponível para repasse.'); if(!sellers.length)return alert('Nenhum vendedor cadastrado.');
    const m=modal(`<h2>IK: Repassar Estoque para Vendedor</h2><p class="text-xs text-slate-500 mb-3">O IK só pode repassar a quantidade disponível enviada pelo WG. Informe manualmente o valor total enviado ao vendedor em reais ou dólares.</p><form id="ikAllocationForm" class="seller-form"><label>Produto recebido do WG<select name="shipmentId" id="ikShipmentSelect" class="control" required>${available.map(x=>`<option value="${x.id}" data-max="${x.quantityRemaining}" data-cost="${x.unitCostBRL}">${esc(x.productName)} (${esc(x.brand)}) — ${x.quantityRemaining} un.</option>`).join('')}</select></label><label>Vendedor<select name="sellerId" class="control" required>${sellers.map(x=>`<option value="${x.id}">${esc(x.name)} (@${esc(x.user)})</option>`).join('')}</select></label><label>Quantidade<input name="quantity" type="number" min="1" class="control" required></label><label>Preço de revenda por unidade (R$)<input name="salePrice" type="number" min="0" step="0.01" class="control" required></label><label>Moeda do valor enviado<select name="debitCurrency" class="control"><option value="BRL">Real (R$)</option><option value="USD">Dólar (US$)</option></select></label><label>Valor total enviado ao vendedor<input name="debitValue" type="number" min="0.01" step="0.01" class="control" required placeholder="Digite o valor total"></label><small class="text-xs text-slate-500">Cotação utilizada: 1 USD = ${rate?money(rate):'aguardando atualização'}</small><button class="primary-btn w-full mt-3" type="submit">Enviar ao Vendedor</button></form>`);
    const select=m.querySelector('#ikShipmentSelect'); const qtyInput=m.querySelector('[name="quantity"]'); const syncMax=()=>{qtyInput.max=select.selectedOptions[0]?.dataset.max||0;}; select.onchange=syncMax; syncMax();
    m.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const shipment=available.find(x=>x.id===f.get('shipmentId'));const seller=sellers.find(x=>x.id===f.get('sellerId'));const qty=Number(f.get('quantity'));const salePrice=Number(f.get('salePrice'));const currency=String(f.get('debitCurrency')||'BRL');const entered=Number(f.get('debitValue'));const debitBRL=currency==='USD'?entered*rate:entered;if(!shipment||!seller||!Number.isInteger(qty)||qty<1||qty>Number(shipment.quantityRemaining)||!(salePrice>=0)||!(entered>0)||!(debitBRL>0))return alert('Informe produto, quantidade, preço e valor total válidos.');
        const now=new Date().toISOString();const allocation={id:uid(),shipmentId:shipment.id,ikId:ikAccountId(),sellerId:seller.id,productName:shipment.productName,brand:shipment.brand,quantitySent:qty,quantityRemaining:qty,unitCostBRL:Number(shipment.unitCostBRL),salePriceBRL:Number(salePrice.toFixed(2)),totalValueBRL:Number(debitBRL.toFixed(2)),remainingValueBRL:Number(debitBRL.toFixed(2)),status:'OPEN',createdAt:now,updatedAt:now};
        const newShipmentQty=Number(shipment.quantityRemaining)-qty;const shipmentStatus=newShipmentQty===0?'CLOSED':'PARTIAL';const sRes=await supabaseClient.from('wg_ik_shipments').update({quantity_remaining:newShipmentQty,remaining_value_brl:newShipmentQty*Number(shipment.unitCostBRL),status:shipmentStatus,updated_at:now}).eq('id',shipment.id).eq('quantity_remaining',shipment.quantityRemaining);if(sRes.error||!sRes.data?.length)return alert('O lote mudou. Atualize a tela e tente novamente.');
        const aRes=await supabaseClient.from('ik_seller_allocations').insert({id:allocation.id,shipment_id:allocation.shipmentId,ik_id:allocation.ikId,seller_id:allocation.sellerId,product_name:allocation.productName,brand:allocation.brand,quantity_sent:allocation.quantitySent,quantity_remaining:allocation.quantityRemaining,unit_cost_brl:allocation.unitCostBRL,sale_price_brl:allocation.salePriceBRL,total_value_brl:allocation.totalValueBRL,remaining_value_brl:allocation.remainingValueBRL,status:allocation.status,created_at:now,updated_at:now});if(aRes.error){await supabaseClient.from('wg_ik_shipments').update({quantity_remaining:shipment.quantityRemaining,remaining_value_brl:shipment.remainingValueBRL,status:shipment.status,updated_at:shipment.updatedAt}).eq('id',shipment.id);return alert(`Não foi possível criar o repasse: ${aRes.error.message}`);}
        const existing=products().find(p=>p.sellerId===seller.id&&p.name===allocation.productName&&p.brand===allocation.brand);const productId=existing?.id||uid();const stock=Number(existing?.stock||0)+qty;const pData={id:productId,seller_id:seller.id,name:allocation.productName,brand:allocation.brand,price:allocation.salePriceBRL,stock};const pRes=existing?await supabaseClient.from('seller_products').update({price:allocation.salePriceBRL,stock}).eq('id',productId):await supabaseClient.from('seller_products').insert(pData);if(pRes.error)return alert(`Repasse criado, mas o estoque do vendedor falhou: ${pRes.error.message}`);
        shipment.quantityRemaining=newShipmentQty;shipment.remainingValueBRL=newShipmentQty*Number(shipment.unitCostBRL);shipment.status=shipmentStatus;shipment.updatedAt=now;const sl=ikSellerAllocations();sl.push(allocation);const pl=products();if(existing){existing.stock=stock;existing.price=allocation.salePriceBRL;}else pl.push({id:productId,sellerId:seller.id,name:allocation.productName,brand:allocation.brand,price:allocation.salePriceBRL,stock});write('nl_wg_ik_shipments',wgIkShipments());write('nl_ik_seller_allocations',sl);write('atlasProducts',pl);m.remove();showToast(`Repasse salvo: ${currency==='USD'?'US$':'R$'} ${entered.toFixed(2)} para ${seller.name}.`);renderProductsPage();
    };
}

async function clearWgIkTransferLogs() {
    if(!canEditWgIk()) return showToast('Apenas WG e IK podem apagar logs.');
    confirmActionModal({title:'Apagar logs de transferência',subtitle:'WG ↔ IK',warningText:'Isso apaga o histórico de lotes WG → IK e dos repasses para vendedores. O estoque atual e os produtos dos vendedores não serão alterados.',confirmText:'Apagar logs',onConfirm:async()=>{
        try {
            if(supabaseClient){
                const results = await Promise.all([
                    supabaseClient.from('wg_ik_shipments').delete().neq('id','__newlife_never__'),
                    supabaseClient.from('ik_seller_allocations').delete().neq('id','__newlife_never__')
                ]);
                const failed = results.find(result => result.error);
                if(failed) return alert(`Não foi possível apagar os logs: ${failed.error.message}`);
            }
            write('nl_wg_ik_shipments',[]);
            write('nl_ik_seller_allocations',[]);
            showToast('Logs WG ↔ IK apagados com sucesso.');
            renderWgIkStockPage();
        } catch(error) {
            console.error(error);
            alert(`Não foi possível apagar os logs: ${error.message}`);
        }
    }});
}

function renderWgIkStockPage() {
    if(!canEditWgIk()) return showToast('Acesso restrito às contas WG e IK.');
    const shipments=wgIkShipments().filter(x=>isWGAccount()?(x.wgId===currentUser.id||x.wgId==='u_wg'):true);
    const allocations=ikSellerAllocations(); const rate=Number(currentExchangeRate.ask||currentExchangeRate.bid||0);
    const groups={};
    shipments.forEach(x=>{const day=String(x.createdAt||x.updatedAt||'').slice(0,10)||'sem-data';const key=`${x.wgId||'wg'}-${day}`;(groups[key]??={key,date:day,shipments:[]}).shipments.push(x);});
    const batchCards=Object.values(groups).sort((a,b)=>String(b.date).localeCompare(String(a.date))).map(batch=>{
        const ids=new Set(batch.shipments.map(x=>x.id)); const batchAllocs=allocations.filter(a=>ids.has(a.shipmentId)); const totalBatch=batch.shipments.reduce((n,x)=>n+Number(x.totalValueBRL||0),0); const remaining=batch.shipments.reduce((n,x)=>n+Number(x.remainingValueBRL||0),0); const sellerGroups={};
        batchAllocs.forEach(a=>{const key=a.sellerId;(sellerGroups[key]??={seller:allSellers().find(s=>s.id===key),items:[],total:0}).items.push(a);sellerGroups[key].total+=Number(a.totalValueBRL||0);});
        const products=batch.shipments.map(x=>`<div class="wgik-batch-product"><div><b>${esc(x.productName)}</b><span>${esc(x.brand||'Sem marca')}</span></div><div class="wgik-batch-product-meta"><b>${Number(x.quantitySent||0)} un.</b><span>${money(x.unitCostBRL)} / un.</span><strong>${money(x.totalValueBRL)}</strong></div></div>`).join('');
        const sellers=Object.values(sellerGroups).map(g=>`<div class="wgik-batch-seller"><div><b>${esc(g.seller?.name||g.items[0]?.sellerId||'Vendedor')}</b><span>${g.items.map(i=>esc(i.productName)).join(' · ')}</span></div><strong>${money(g.total)} <small>· US$ ${(rate?g.total/rate:0).toFixed(2)}</small></strong></div>`).join('')||'<div class="wgik-empty-small">Nenhum produto repassado a vendedor neste lote.</div>';
        const dateLabel=batch.date==='sem-data'?'Data não informada':new Date(`${batch.date}T12:00:00`).toLocaleDateString('pt-BR');
        return `<article class="wgik-batch-card"><div class="wgik-batch-head"><div><span class="ik-stock-label">Lote WG → IK</span><h2>${esc(dateLabel)}</h2><p>${batch.shipments.length} produto(s) enviado(s) ao IK</p></div><div class="wgik-batch-values"><span>Valor repassado ao IK</span><b>${money(totalBatch)} · US$ ${(rate?totalBatch/rate:0).toFixed(2)}</b><small>Restante: ${money(remaining)}</small></div></div><div class="wgik-batch-section"><h3>Produtos do lote</h3><div class="wgik-batch-products">${products}</div></div><div class="wgik-batch-section"><h3>Vendedores que receberam produtos</h3><div class="wgik-batch-sellers">${sellers}</div></div></article>`;
    }).join('')||'<div class="empty-state">Nenhum lote enviado pelo WG.</div>';
    appFrame('Envios WG → IK','Lotes enviados pelo WG, com produtos, data, valor repassado ao IK e totais por vendedor.',`<style>
    .wgik-batch-list{display:grid;gap:18px}.wgik-batch-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px;padding:18px;box-shadow:0 8px 24px rgba(15,23,42,.06)}.wgik-batch-head{display:flex;justify-content:space-between;gap:18px;align-items:flex-start;padding-bottom:15px;border-bottom:1px solid #e2e8f0}.wgik-batch-head h2{margin:4px 0 2px;font-size:19px;color:#0f172a}.wgik-batch-head p{margin:0;color:#64748b;font-size:12px}.wgik-batch-values{text-align:right;background:#eef6ff;border:1px solid #dbeafe;border-radius:12px;padding:10px 12px;min-width:190px}.wgik-batch-values span,.wgik-batch-values small{display:block;color:#64748b;font-size:10px}.wgik-batch-values b{display:block;margin:3px 0;color:#1d4ed8;font-size:14px}.wgik-batch-section{margin-top:15px}.wgik-batch-section h3{margin:0 0 8px;color:#475569;text-transform:uppercase;font-size:10px;letter-spacing:.06em}.wgik-batch-products,.wgik-batch-sellers{display:grid;gap:7px}.wgik-batch-product,.wgik-batch-seller{display:flex;justify-content:space-between;align-items:center;gap:12px;padding:11px 12px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:11px}.wgik-batch-product span,.wgik-batch-seller span{display:block;color:#64748b;font-size:11px;margin-top:2px}.wgik-batch-product-meta{display:flex;align-items:center;gap:12px;color:#475569;font-size:11px}.wgik-batch-product-meta strong{color:#0f172a;font-size:12px}.wgik-batch-seller{background:#f0fdf4;border-color:#bbf7d0}.wgik-batch-seller strong{color:#166534;font-size:13px;white-space:nowrap}.wgik-batch-seller small{font-weight:600;color:#15803d}.wgik-empty-small{padding:12px;color:#64748b;background:#f8fafc;border-radius:10px;font-size:12px}@media(max-width:640px){.wgik-batch-head{display:block}.wgik-batch-values{text-align:left;margin-top:12px}.wgik-batch-product,.wgik-batch-seller{align-items:flex-start;flex-direction:column}.wgik-batch-product-meta{width:100%;justify-content:space-between;gap:5px}}
    </style><div class="ik-stock-actions">${isWGAccount()?'<button id="newWgShipmentBtn" class="primary-btn">+ Cadastrar produto para IK</button>':''}${isIKAccount()||hasAdminAccess()?'<button id="newIkAllocationBtn" class="primary-btn">Repassar para vendedor</button>':''}<button id="openSellerSheetsBtn" class="small-btn">Totais por Vendedor</button><button id="clearWgIkLogsBtn" class="small-btn danger-outline">Apagar log</button></div><div class="wgik-batch-list">${batchCards}</div>`);
    document.getElementById('newWgShipmentBtn')?.addEventListener('click',openWgShipmentModal);document.getElementById('newIkAllocationBtn')?.addEventListener('click',openIkAllocationModal);document.getElementById('openSellerSheetsBtn')?.addEventListener('click',()=>{activeTab='sellerTotals';renderSellerTotalsPage();});document.getElementById('clearWgIkLogsBtn')?.addEventListener('click',clearWgIkTransferLogs);
}

function renderWgTransfersPage() {
    return renderWgIkStockPage();
}

function sellerBalancePaidBRL(sellerId) {
    return sellerBalancePayments().filter(p => p.sellerId === sellerId).reduce((sum, p) => sum + Number(p.amountBRL || 0), 0);
}

async function saveSellerBalanceDebit(sellerId, currency, entered, notes = '') {
    if (!canEditWgIk()) return showToast('Apenas WG e IK podem registrar abatimentos.');
    const seller = allSellers().find(x => x.id === sellerId);
    const rate = Number(currentExchangeRate.ask || currentExchangeRate.bid || 0);
    const originalAmount = Number(entered);
    const amountBRL = currency === 'USD' ? originalAmount * rate : originalAmount;
    const productsTotal = products().filter(p => p.sellerId === sellerId).reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0), 0);
    const allocationsTotal = ikSellerAllocations().filter(a => a.sellerId === sellerId).reduce((sum, a) => sum + Number(a.totalValueBRL || 0), 0);
    const totalDueBRL = allocationsTotal > 0 ? allocationsTotal : productsTotal;
    const alreadyPaid = sellerBalancePaidBRL(sellerId);
    const remaining = Math.max(totalDueBRL - alreadyPaid, 0);
    if (!seller || !(originalAmount > 0) || !(amountBRL > 0)) return alert('Informe um valor de abatimento válido.');
    if (amountBRL > remaining + 0.01) return alert(`O abatimento não pode ser maior que o saldo restante de ${money(remaining)}.`);
    const now = new Date().toISOString();
    const payment = { id: uid(), sellerId, payerId: currentUser.id, payerRole: currentUser.role, currency, originalAmount: Number(originalAmount.toFixed(2)), amountBRL: Number(amountBRL.toFixed(2)), exchangeRateBRL: Number(rate.toFixed(6)), notes: String(notes || '').trim(), createdAt: now };
    if (!supabaseClient) return alert('Supabase não está conectado. Não foi possível registrar o abatimento.');
    const { error } = await supabaseClient.from('seller_balance_payments').insert({
        id: payment.id, seller_id: payment.sellerId, payer_id: payment.payerId, payer_role: payment.payerRole,
        currency: payment.currency, original_amount: payment.originalAmount, amount_brl: payment.amountBRL,
        exchange_rate_brl: payment.exchangeRateBRL, notes: payment.notes || null, created_at: payment.createdAt
    });
    if (error) return alert(`Não foi possível registrar o abatimento: ${error.message}`);
    const payments = sellerBalancePayments();
    payments.push(payment);
    write('nl_seller_balance_payments', payments);
    showToast(`Abatimento de ${currency === 'USD' ? 'US$' : 'R$'} ${originalAmount.toFixed(2)} registrado para ${seller.name}.`);
    renderSellerTotalsPage();
}

function openSellerBalanceDebitModal(sellerId) {
    if (!canEditWgIk()) return showToast('Apenas WG e IK podem registrar abatimentos.');
    const seller = allSellers().find(x => x.id === sellerId);
    if (!seller) return;
    const rate = Number(currentExchangeRate.ask || currentExchangeRate.bid || 0);
    const productsTotal = products().filter(p => p.sellerId === sellerId).reduce((sum, p) => sum + Number(p.stock || 0) * Number(p.price || 0), 0);
    const allocationsTotal = ikSellerAllocations().filter(a => a.sellerId === sellerId).reduce((sum, a) => sum + Number(a.totalValueBRL || 0), 0);
    const totalDueBRL = allocationsTotal > 0 ? allocationsTotal : productsTotal;
    const remaining = Math.max(totalDueBRL - sellerBalancePaidBRL(sellerId), 0);
    if (!(remaining > 0)) return showToast('Este vendedor já está totalmente abatido.');
    const m = modal(`<h2>Abater valor — ${esc(seller.name)}</h2><p class="text-xs text-slate-500 mb-3">O valor será convertido para reais pela cotação atual e descontado do saldo deste vendedor.</p><div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm mb-3"><div class="flex justify-between"><span>Saldo restante</span><b>${money(remaining)} · US$ ${(rate ? remaining / rate : 0).toFixed(2)}</b></div></div><form id="sellerBalanceDebitForm" class="seller-form"><label>Moeda<select name="currency" class="control"><option value="BRL">Real (R$)</option><option value="USD">Dólar (US$)</option></select></label><label>Valor abatido<input name="amount" type="number" min="0.01" step="0.01" class="control" required></label><label>Observação<input name="notes" class="control" placeholder="Opcional"></label><button class="primary-btn w-full mt-3" type="submit">Registrar abatimento</button></form>`);
    m.querySelector('form').onsubmit = async event => {
        event.preventDefault();
        const form = new FormData(event.target);
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        try { await saveSellerBalanceDebit(sellerId, String(form.get('currency') || 'BRL'), Number(form.get('amount')), String(form.get('notes') || '')); if (document.body.contains(m)) m.remove(); } finally { button.disabled = false; }
    };
}

function renderSellerTotalsPage() {
    if (!isWGAccount() && !isIKAccount() && !hasAdminAccess()) return showToast('Acesso restrito às contas WG e IK.');
    const rate = Number(currentExchangeRate.ask || currentExchangeRate.bid || 1);
    const sellers = allSellers();
    const cards = sellers.map(s => {
        const stockProducts = products().filter(p => p.sellerId === s.id);
        const totalBRL = stockProducts.reduce((n, p) => n + Number(p.stock || 0) * Number(p.price || 0), 0);
        const qty = stockProducts.reduce((n, p) => n + Number(p.stock || 0), 0);
        const allocations = ikSellerAllocations().filter(a => a.sellerId === s.id);
        const allocationTotalBRL = allocations.reduce((n, a) => n + Number(a.totalValueBRL || 0), 0);
        const totalDueBRL = allocationTotalBRL > 0 ? allocationTotalBRL : totalBRL;
        const paidBRL = sellerBalancePaidBRL(s.id);
        const remainingBRL = Math.max(totalDueBRL - paidBRL, 0);
        const paidPercent = totalDueBRL > 0 ? Math.min((paidBRL / totalDueBRL) * 100, 100) : 0;
        return `<article class="panel glass-panel p-4 rounded-2xl bg-white/90 border border-slate-200"><div class="flex items-center justify-between gap-3 mb-4"><div class="flex items-center gap-2">${renderAvatarHTML(s, 'small')}<div><h3 class="font-black text-slate-900">${esc(s.name)}</h3><p class="text-xs text-slate-500">@${esc(s.user)}</p></div></div><span class="text-xs font-bold text-slate-500">${qty} un.</span></div><div class="grid grid-cols-2 gap-2 text-xs"><div class="rounded-xl bg-emerald-50 border border-emerald-100 p-3"><span class="block text-slate-500">Total de referência (R$)</span><b class="text-emerald-800 text-base">${money(totalDueBRL)}</b></div><div class="rounded-xl bg-sky-50 border border-sky-100 p-3"><span class="block text-slate-500">Total de referência (US$)</span><b class="text-sky-800 text-base">$ ${(rate ? totalDueBRL / rate : 0).toFixed(2)}</b></div></div><div class="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100 text-xs"><div class="flex justify-between gap-2"><span class="text-slate-600">Abatido</span><b class="text-emerald-700">${money(paidBRL)} · US$ ${(rate ? paidBRL / rate : 0).toFixed(2)}</b></div><div class="flex justify-between gap-2 mt-1"><span class="text-slate-600">Falta para quitar</span><b class="text-amber-800">${money(remainingBRL)} · US$ ${(rate ? remainingBRL / rate : 0).toFixed(2)}</b></div><div class="h-2 rounded-full bg-white mt-2 overflow-hidden"><div class="h-full rounded-full bg-emerald-500" style="width:${paidPercent.toFixed(2)}%"></div></div><small class="block text-slate-500 mt-1">${paidPercent.toFixed(1)}% abatido</small></div><button class="primary-btn w-full mt-3 seller-balance-debit-btn" data-seller-id="${s.id}">Abater valor em R$ ou US$</button><div class="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-500">${allocationTotalBRL > 0 ? `Custo total recebido do WG: <b class="text-slate-800">${money(allocationTotalBRL)} · US$ ${(rate ? allocationTotalBRL / rate : 0).toFixed(2)}</b>` : 'Total calculado pelo estoque atual do vendedor.'}</div></article>`;
    }).join('') || '<div class="empty-state">Nenhum vendedor cadastrado.</div>';
    appFrame('Totais por Vendedor', `Valores abatidos em R$ ou US$ pela cotação atual de 1 USD = ${money(rate)}.`, `<div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">${cards}</div>`);
    document.querySelectorAll('.seller-balance-debit-btn').forEach(button => button.addEventListener('click', () => openSellerBalanceDebitModal(button.dataset.sellerId)));
}

function openSellerPaymentSheetModal(sheetId) {
    if (!canEditWgIk()) return showToast('Apenas WG e IK podem editar as planilhas.');
    const sheet = sellerPaymentSheets().find(x => x.id === sheetId);
    if (!sheet || sheet.status === 'CLOSED') return alert('Esta planilha está fechada. Crie uma nova para o vendedor.');
    const seller = allSellers().find(x => x.id === sheet.sellerId);
    const balance = Math.max(Number(sheet.totalValueBRL || 0) - Number(sheet.paidValueBRL || 0), 0);
    const m = modal(`<h2>Atualizar Planilha de ${esc(seller?.name || sheet.sellerId)}</h2><p class="text-xs text-slate-500 mb-3">Produto: <b>${esc(sheet.productName)}</b> · Valor total: <b>${money(sheet.totalValueBRL)}</b><br>Já pago: <b>${money(sheet.paidValueBRL)}</b> · Saldo: <b>${money(balance)}</b></p><form id="sheetPaymentForm" class="seller-form"><label>Valor pago agora (R$)<input name="amount" type="number" min="0.01" max="${balance.toFixed(2)}" step="0.01" class="control" required></label><label>Periodicidade<select name="frequency" class="control"><option value="DAILY">Diário</option><option value="WEEKLY">Semanal</option><option value="MONTHLY">Mensal</option><option value="OTHER">Outro</option></select></label><label>Data<input name="paymentDate" type="date" value="${new Date().toISOString().slice(0,10)}" class="control" required></label><label>Observação<input name="notes" class="control"></label><button class="primary-btn w-full mt-3" type="submit">Salvar pagamento</button></form>`);
    m.querySelector('form').onsubmit = async e => {
        e.preventDefault(); const f = new FormData(e.target); const amount = Number(f.get('amount'));
        if (!(amount > 0) || amount > balance + 0.001) return alert(`Valor inválido. Saldo: ${money(balance)}.`);
        const now = new Date().toISOString(); const newPaid = Number((Number(sheet.paidValueBRL || 0) + amount).toFixed(2)); const newBalance = Math.max(Number(sheet.totalValueBRL || 0) - newPaid, 0); const closed = newBalance <= 0;
        const payment = { id: uid(), sheetId: sheet.id, sellerId: sheet.sellerId, ikId: sheet.ikId, amountBRL: Number(amount.toFixed(2)), paymentDate: f.get('paymentDate'), frequency: f.get('frequency'), notes: String(f.get('notes') || ''), createdBy: currentUser.id, createdAt: now };
        const sheetUpdate = { paid_value_brl: newPaid, balance_brl: newBalance, status: closed ? 'CLOSED' : 'OPEN', closed_at: closed ? now : null, updated_at: now };
        const sRes = await supabaseClient.from('seller_payment_sheets').update(sheetUpdate).eq('id', sheet.id).eq('status', 'OPEN'); if (sRes.error) return alert(`Não foi possível atualizar a planilha: ${sRes.error.message}`);
        const pRes = await supabaseClient.from('seller_payment_ledger').insert({ id:payment.id, sheet_id:payment.sheetId, allocation_id:null, seller_id:payment.sellerId, ik_id:payment.ikId, amount_brl:payment.amountBRL, payment_date:payment.paymentDate, frequency:payment.frequency, notes:payment.notes, created_by:payment.createdBy, created_at:payment.createdAt });
        if (pRes.error) { await supabaseClient.from('seller_payment_sheets').update({ paid_value_brl:sheet.paidValueBRL, balance_brl:balance, status:'OPEN', closed_at:null }).eq('id',sheet.id); return alert(`Não foi possível registrar o pagamento: ${pRes.error.message}`); }
        sheet.paidValueBRL = newPaid; sheet.balanceBRL = newBalance; sheet.status = closed ? 'CLOSED' : 'OPEN'; sheet.closedAt = closed ? now : null; sheet.updatedAt = now; const payments = sellerPaymentLedger(); payments.push(payment); write('nl_seller_payment_sheets', sellerPaymentSheets()); write('nl_seller_payment_ledger', payments); m.remove(); showToast(closed ? 'Planilha quitada e fechada. Agora você pode criar uma nova.' : 'Pagamento salvo e abatido do saldo.'); renderSellerSheetsPage();
    };
}

function openNewSellerSheetModal() {
    if (!canEditWgIk()) return showToast('Apenas WG e IK podem criar planilhas.'); const sellers = allSellers(); if (!sellers.length) return alert('Nenhum vendedor cadastrado.');
    const m = modal(`<h2>Nova Planilha de Acerto</h2><p class="text-xs text-slate-500 mb-3">O WG informa o produto, o vendedor responsável e o valor total. A planilha permanece aberta até a quitação completa.</p><form id="newSheetForm" class="seller-form"><label>Vendedor<select name="sellerId" class="control" required>${sellers.map(x => `<option value="${x.id}">${esc(x.name)} (@${esc(x.user)})</option>`).join('')}</select></label><label>Nome do produto<input name="productName" class="control" required></label><label>Marca<input name="brand" class="control"></label><label>Valor total devido (R$)<input name="totalValue" type="number" min="0.01" step="0.01" class="control" required></label><label>Observação<input name="notes" class="control"></label><button class="primary-btn w-full mt-3" type="submit">Criar planilha</button></form>`);
    m.querySelector('form').onsubmit = async e => { e.preventDefault(); const f = new FormData(e.target); const seller = sellers.find(x => x.id === f.get('sellerId')); const value = Number(f.get('totalValue')); if (!seller || !(value > 0)) return alert('Informe vendedor e valor total válido.'); if (activeSellerSheetFor(seller.id)) return alert('Este vendedor já possui uma planilha aberta. Finalize-a antes de criar outra.'); const now = new Date().toISOString(); const sheet = { id:uid(), wgId:wgAccountId(), ikId:ikAccountId(), sellerId:seller.id, productName:String(f.get('productName')).trim(), brand:String(f.get('brand')||'').trim(), totalValueBRL:Number(value.toFixed(2)), paidValueBRL:0, balanceBRL:Number(value.toFixed(2)), status:'OPEN', notes:String(f.get('notes')||''), createdAt:now, closedAt:null, updatedAt:now }; const {error}=await supabaseClient.from('seller_payment_sheets').insert({id:sheet.id,wg_id:sheet.wgId,ik_id:sheet.ikId,seller_id:sheet.sellerId,product_name:sheet.productName,brand:sheet.brand,total_value_brl:sheet.totalValueBRL,paid_value_brl:0,balance_brl:sheet.balanceBRL,status:'OPEN',notes:sheet.notes,created_at:now,updated_at:now}); if(error)return alert(`Não foi possível criar a planilha: ${error.message}`); const list=sellerPaymentSheets(); list.push(sheet); write('nl_seller_payment_sheets',list); m.remove(); showToast('Nova planilha criada para o vendedor.'); renderSellerSheetsPage(); };
}

async function createInitialSheetForSeller(sellerId) {
    if (!supabaseClient || activeSellerSheetFor(sellerId)) return activeSellerSheetFor(sellerId);
    const now=new Date().toISOString(); const sheet={id:uid(),wgId:wgAccountId(),ikId:ikAccountId(),sellerId,productName:'Planilha manual',brand:'',totalValueBRL:0,paidValueBRL:0,balanceBRL:0,status:'OPEN',notes:'Planilha criada automaticamente para o vendedor',createdAt:now,closedAt:null,updatedAt:now};
    const {error}=await supabaseClient.from('seller_payment_sheets').insert({id:sheet.id,wg_id:sheet.wgId,ik_id:sheet.ikId,seller_id:sheet.sellerId,product_name:sheet.productName,brand:'',total_value_brl:0,paid_value_brl:0,balance_brl:0,status:'OPEN',notes:sheet.notes,created_at:now,updated_at:now});
    if(error) throw error; const list=sellerPaymentSheets(); list.push(sheet); write('nl_seller_payment_sheets',list); return sheet;
}

async function ensureManualSheet(sellerId) {
    let sheet=activeSellerSheetFor(sellerId);
    if (sheet) return sheet;
    const now=new Date().toISOString(); sheet={id:uid(),wgId:wgAccountId(),ikId:ikAccountId(),sellerId,productName:'Planilha manual',brand:'',totalValueBRL:0,paidValueBRL:0,balanceBRL:0,status:'OPEN',notes:'Planilha com 20 linhas editáveis',createdAt:now,closedAt:null,updatedAt:now};
    const {error}=await supabaseClient.from('seller_payment_sheets').insert({id:sheet.id,wg_id:sheet.wgId,ik_id:sheet.ikId,seller_id:sheet.sellerId,product_name:sheet.productName,brand:'',total_value_brl:0,paid_value_brl:0,balance_brl:0,status:'OPEN',notes:sheet.notes,created_at:now,updated_at:now});
    if(error) throw error; const list=sellerPaymentSheets(); list.push(sheet); write('nl_seller_payment_sheets',list); return sheet;
}

async function saveManualSheetTotal(sellerId,card) {
    if(!canEditWgIk()) return showToast('Apenas WG e IK podem editar esta planilha.');
    const total=Number(card.querySelector('[data-sheet-total]')?.value||0); const paid=Number(card.querySelector('[data-sheet-paid]')?.value||0);
    if(!(total>0) || paid<0 || paid>total) return alert('Informe o valor total da planilha e um valor pago entre zero e o total.');
    const sheet=await ensureManualSheet(sellerId); const now=new Date().toISOString(); const balance=Number(Math.max(total-paid,0).toFixed(2)); const {error}=await supabaseClient.from('seller_payment_sheets').update({total_value_brl:Number(total.toFixed(2)),paid_value_brl:Number(paid.toFixed(2)),balance_brl:balance,status:'OPEN',closed_at:null,updated_at:now}).eq('id',sheet.id); if(error)return alert(`Não foi possível salvar o total da planilha: ${error.message}`);
    sheet.totalValueBRL=Number(total.toFixed(2)); sheet.paidValueBRL=Number(paid.toFixed(2)); sheet.balanceBRL=balance; sheet.updatedAt=now; write('nl_seller_payment_sheets',sellerPaymentSheets()); showToast('Total geral e pagamento acumulado salvos.'); renderSellerSheetsPage();
}

async function saveManualProductLine(sellerId,rowNumber,card) {
    if(!canEditWgIk()) return showToast('Apenas WG e IK podem editar esta planilha.');
    const productSelect=card.querySelector(`[data-product-line="${sellerId}-${rowNumber}"]`); const productName=productSelect?.value||''; const brand=productSelect?.selectedOptions?.[0]?.dataset.brand||''; const notes=(card.querySelector(`[data-notes-line="${sellerId}-${rowNumber}"]`)?.value||'').trim(); const quantity=Number(card.querySelector(`[data-quantity-line="${sellerId}-${rowNumber}"]`)?.value||0); const unitPrice=Number(card.querySelector(`[data-unit-line="${sellerId}-${rowNumber}"]`)?.value||0); const lineTotal=Number((quantity*unitPrice).toFixed(2));
    if(!productName) return alert('Selecione um produto da lista.'); if(!Number.isInteger(quantity)||quantity<1) return alert('Informe uma quantidade inteira maior que zero.'); if(!(unitPrice>=0)) return alert('Informe um valor unitário válido.');
    const sheet=await ensureManualSheet(sellerId); const existing=sellerPaymentSheetLines().find(x=>x.sheetId===sheet.id&&Number(x.rowNumber)===rowNumber); const now=new Date().toISOString(); const line={id:existing?.id||uid(),sheetId:sheet.id,sellerId,rowNumber,productName,brand,quantity,unitPriceBRL:Number(unitPrice.toFixed(2)),lineTotalBRL:lineTotal,totalValueBRL:lineTotal,paidValueBRL:0,balanceBRL:lineTotal,status:'OPEN',notes,updatedBy:currentUser.id,createdAt:existing?.createdAt||now,updatedAt:now}; const {error}=await supabaseClient.from('seller_payment_sheet_lines').upsert({id:line.id,sheet_id:line.sheetId,seller_id:line.sellerId,row_number:line.rowNumber,product_name:line.productName,brand:line.brand,quantity:line.quantity,unit_price_brl:line.unitPriceBRL,line_total_brl:line.lineTotalBRL,total_value_brl:line.lineTotalBRL,paid_value_brl:0,balance_brl:line.lineTotalBRL,status:'OPEN',notes:line.notes,updated_by:line.updatedBy,created_at:line.createdAt,updated_at:now}); if(error)return alert(`Não foi possível salvar o produto: ${error.message}`);
    const rows=sellerPaymentSheetLines(); const idx=rows.findIndex(x=>x.id===line.id); if(idx>=0)rows[idx]=line;else rows.push(line); write('nl_seller_payment_sheet_lines',rows); const filled=rows.filter(x=>x.sheetId===sheet.id&&x.productName&&Number(x.lineTotalBRL||x.totalValueBRL)>0); await supabaseClient.from('seller_payment_sheets').update({total_value_brl:filled.reduce((n,x)=>n+Number(x.lineTotalBRL||x.totalValueBRL||0),0),paid_value_brl:filled.reduce((n,x)=>n+Number(x.paidValueBRL||0),0),balance_brl:filled.reduce((n,x)=>n+Number(x.lineTotalBRL||x.totalValueBRL||0),0),updated_at:now}).eq('id',sheet.id); showToast('Produto e total da linha salvos.'); renderSellerSheetsPage();
}

async function resetSellerSheet(sellerId) {
    if(!canEditWgIk()) return showToast('Apenas WG e IK podem fechar a planilha.');
    const sheet=activeSellerSheetFor(sellerId); if(!sheet) return alert('Nenhuma planilha aberta para este vendedor.'); const total=Number(sheet.totalValueBRL||0), paid=Number(sheet.paidValueBRL||0); if(!(total>0) || paid<total) return alert('Só é possível zerar a planilha depois que o total estiver totalmente pago.');
    const now=new Date().toISOString(); const {error}=await supabaseClient.from('seller_payment_sheets').update({status:'CLOSED',closed_at:now,balance_brl:0,updated_at:now}).eq('id',sheet.id).eq('status','OPEN'); if(error)return alert(`Não foi possível fechar a planilha: ${error.message}`); sheet.status='CLOSED';sheet.closedAt=now;sheet.balanceBRL=0;sheet.updatedAt=now; write('nl_seller_payment_sheets',sellerPaymentSheets()); try { await createInitialSheetForSeller(sellerId); } catch(e) { console.error('Planilha fechada, mas a nova não foi criada:',e); } showToast('Planilha zerada e nova planilha criada para o vendedor.'); renderSellerSheetsPage();
}

function addManualSheetRow(sellerId) { if(!canEditWgIk()) return showToast('Apenas WG e IK podem editar esta planilha.'); window.manualSheetExtraRows=window.manualSheetExtraRows||{}; window.manualSheetExtraRows[sellerId]=(window.manualSheetExtraRows[sellerId]||0)+1; renderSellerSheetsPage(); }

function recalcSheetLineTotal(row) { const q=Number(row.querySelector('[data-calc-quantity]')?.value||0); const u=Number(row.querySelector('[data-calc-unit]')?.value||0); const total=Number((q*u).toFixed(2)); const target=row.querySelector('[data-line-total]'); if(target)target.textContent=total?money(total):'—'; }

function renderSellerSheetsPage() {
    if (!canEditWgIk()) return showToast('Acesso restrito às contas WG e IK.');
    const sellers=allSellers(), sheets=sellerPaymentSheets(), lines=sellerPaymentSheetLines();
    window.manualSheetExtraRows=window.manualSheetExtraRows||{};
    const catalogItems=[...new Map(systemCatalog().map(([name,brand])=>[`${name}::${brand}`,{name,brand}])).values()];
    const cards=sellers.map(seller=>{
        const sheet=activeSellerSheetFor(seller.id);
        const saved=lines.filter(x=>x.sheetId===sheet?.id).sort((a,b)=>Number(a.rowNumber)-Number(b.rowNumber));
        const extra=window.manualSheetExtraRows[seller.id]||0;
        const rows=Array.from({length:Math.max(1,saved.length+extra+1)},(_,i)=>saved.find(x=>Number(x.rowNumber)===i+1)||{rowNumber:i+1,productName:'',quantity:1,unitPriceBRL:0,lineTotalBRL:0,notes:''});
        const total=Number(sheet?.totalValueBRL||0), paid=Number(sheet?.paidValueBRL||0), balance=Math.max(total-paid,0);
        const productRows=rows.map(x=>{
            const options='<option value="">Selecionar produto</option>'+catalogItems.map(item=>`<option value="${esc(item.name)}" data-brand="${esc(item.brand)}" ${item.name===x.productName?'selected':''}>${esc(item.name)}${item.brand?` — ${esc(item.brand)}`:''}</option>`).join('');
            return `<tr data-sheet-row="${seller.id}-${x.rowNumber}"><td class="sheet-row-number">${x.rowNumber}</td><td><select class="control sheet-product-select" data-product-line="${seller.id}-${x.rowNumber}">${options}</select></td><td><input class="control sheet-quantity sheet-calc" data-calc-quantity data-quantity-line="${seller.id}-${x.rowNumber}" type="number" min="1" step="1" value="${Number(x.quantity||1)}"></td><td><input class="control sheet-unit sheet-calc" data-calc-unit data-unit-line="${seller.id}-${x.rowNumber}" type="number" min="0" step="0.01" value="${Number(x.unitPriceBRL||0)||''}" placeholder="0,00"></td><td class="sheet-line-total" data-line-total>${x.lineTotalBRL?money(x.lineTotalBRL):'—'}</td><td><input class="control sheet-note" data-notes-line="${seller.id}-${x.rowNumber}" value="${esc(x.notes||'')}" placeholder="Observação"></td><td><button class="small-btn save-product-line" data-seller="${seller.id}" data-row="${x.rowNumber}">Salvar</button></td></tr>`;
        }).join('');
        return `<section class="panel glass-panel p-4 sheet-card" data-seller-card="${seller.id}">
            <div class="sheet-card-header"><div><h2 class="m-0">${esc(seller.name)}</h2><p class="text-xs text-slate-500 mt-1">Planilha compartilhada entre WG e IK</p></div><div class="sheet-summary"><div><span>Valor total</span><strong>${money(total)}</strong></div><div><span>Valor pago</span><strong class="text-emerald-700">${money(paid)}</strong></div></div></div>
            <div class="sheet-payment-bar"><label>Total pago acumulado (R$)<input data-sheet-paid class="control" type="number" min="0" max="${total.toFixed(2)}" step="0.01" value="${paid||''}" placeholder="0,00"></label><button class="primary-btn save-sheet-total" data-seller="${seller.id}">Salvar pagamento</button>${total>0&&balance<=0?`<button class="small-btn reset-sheet-btn" data-seller="${seller.id}">Zerar e começar outra</button>`:''}</div>
            <div class="sheet-table-wrap"><table class="sheet-table"><thead><tr><th>#</th><th>Produto</th><th>Qtd.</th><th>Valor unitário</th><th>Total da linha</th><th>Observação</th><th></th></tr></thead><tbody>${productRows}</tbody></table></div>
            <button class="small-btn add-sheet-row mt-3" data-seller="${seller.id}">+ Adicionar linha</button>
        </section>`;
    }).join('');
    appFrame('Planilhas dos Vendedores','Escolha o produto, informe quantidade e valor unitário. O total geral é a soma das linhas; o pagamento abate somente o total da planilha.',`<style>.sheet-cards-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(420px,1fr));gap:20px}.sheet-card{background:#fff;border:1px solid #e2e8f0;border-radius:18px!important;box-shadow:0 8px 24px rgba(15,23,42,.06)}.sheet-card-header{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;padding-bottom:15px;border-bottom:1px solid #e2e8f0}.sheet-card-header h2{font-size:18px}.sheet-summary{display:flex;gap:12px;text-align:right}.sheet-summary span{display:block;color:#64748b;font-size:10px}.sheet-summary strong{display:block;color:#0f172a;font-size:13px;margin-top:3px}.sheet-payment-bar{display:flex;align-items:end;flex-wrap:wrap;gap:10px;padding:15px 0}.sheet-payment-bar label{font-size:11px;font-weight:700;color:#475569}.sheet-payment-bar input{display:block;width:170px;margin-top:5px}.sheet-table-wrap{overflow-x:auto;border:1px solid #e2e8f0;border-radius:12px}.sheet-table{width:100%;min-width:720px;border-collapse:collapse;font-size:11px}.sheet-table th{padding:10px 8px;background:#f8fafc;color:#64748b;text-transform:uppercase;font-size:9px;letter-spacing:.04em}.sheet-table td{padding:8px;border-top:1px solid #f1f5f9;vertical-align:middle}.sheet-table .control{font-size:11px;padding:7px 8px}.sheet-row-number{width:25px;color:#94a3b8;font-weight:800}.sheet-line-total{font-weight:800;color:#334155;white-space:nowrap}.sheet-card .primary-btn,.sheet-card .small-btn{white-space:nowrap}@media(max-width:640px){.sheet-cards-grid{grid-template-columns:1fr}.sheet-card-header{display:block}.sheet-summary{justify-content:space-between;text-align:left;margin-top:12px}.sheet-payment-bar{display:block}.sheet-payment-bar label{display:block;margin-bottom:9px}.sheet-payment-bar input{width:100%}.sheet-payment-bar button{margin:4px 4px 0 0}}</style><div class="flex flex-wrap gap-2 mb-5"><button id="backWgIkStockBtn" class="small-btn">Voltar ao Estoque WG ↔ IK</button></div><div class="sheet-cards-grid">${cards}</div>`);
    document.getElementById('backWgIkStockBtn')?.addEventListener('click',()=>{activeTab='wgTransfers';renderWgTransfersPage();});
    document.querySelectorAll('.save-sheet-total').forEach(btn=>btn.addEventListener('click',()=>saveManualSheetTotal(btn.dataset.seller,btn.closest('[data-seller-card]'))));
    document.querySelectorAll('.save-product-line').forEach(btn=>btn.addEventListener('click',()=>saveManualProductLine(btn.dataset.seller,Number(btn.dataset.row),btn.closest('[data-seller-card]'))));
    document.querySelectorAll('.add-sheet-row').forEach(btn=>btn.addEventListener('click',()=>addManualSheetRow(btn.dataset.seller)));
    document.querySelectorAll('.reset-sheet-btn').forEach(btn=>btn.addEventListener('click',()=>resetSellerSheet(btn.dataset.seller)));
    document.querySelectorAll('[data-sheet-row]').forEach(row=>row.querySelectorAll('.sheet-calc').forEach(input=>input.addEventListener('input',()=>recalcSheetLineTotal(row))));
}


// ABA: ATRIBUIR / ENVIAR ESTOQUE (COM SUBTOTAL E VENDAS EM VERMELHO HOJE)
async function adminRegisterSellerSale(productId) {
    if (!hasAdminAccess(currentUser)) {
        return showToast('Apenas o administrador pode dar baixa diretamente nesta tela.');
    }
    if (!supabaseClient) {
        return alert('Supabase não está conectado. A baixa não foi realizada.');
    }

    const product = products().find(p => p.id === productId);
    const seller = allSellers().find(u => u.id === product?.sellerId);
    const available = Number(product?.stock || 0);
    if (!product || !seller || available < 1) return alert('Produto sem estoque disponível ou não encontrado.');

    const m = modal(`
        <h2>Dar Baixa no Estoque</h2>
        <p class="text-xs text-slate-500 mb-3">Vendedor: <b>${esc(seller.name)}</b><br>Produto: <b>${esc(product.name)}</b> (${esc(product.brand)})</p>
        <form id="adminSaleForm" class="seller-form">
            <label>Quantidade vendida/baixada
                <input name="quantity" type="number" min="1" max="${available}" value="1" class="control" required>
            </label>
            <p class="text-xs text-slate-500 mt-2">Disponível: <b>${available}</b> unidade(s). A operação será registrada no histórico de vendas.</p>
            <button type="submit" class="primary-btn w-full mt-3">${icons.check} Confirmar Baixa</button>
        </form>
    `);

    m.querySelector('form').onsubmit = async e => {
        e.preventDefault();
        const qty = Number(new FormData(e.target).get('quantity'));
        if (!Number.isInteger(qty) || qty < 1 || qty > available) {
            return alert(`Quantidade inválida. Disponível: ${available} unidade(s).`);
        }

        const beforeStock = Number(product.stock || 0);
        const afterStock = beforeStock - qty;
        const saleId = uid();
        const createdAt = new Date().toISOString();
        const sale = {
            id: saleId,
            sellerId: seller.id,
            productId: product.id,
            quantity: qty,
            unitPrice: Number(product.price || 0),
            total: Number((qty * Number(product.price || 0)).toFixed(2)),
            type: 'ADMIN_SELLER_STOCK_WRITE_OFF',
            removedBy: currentUser.id,
            removedByName: currentUser.name,
            createdAt
        };

        const submit = e.target.querySelector('button[type="submit"]');
        if (submit) submit.disabled = true;
        try {
            const updateResult = await supabaseClient
                .from('seller_products')
                .update({ stock: afterStock })
                .eq('id', product.id)
                .eq('stock', beforeStock)
                .select('id, stock');
            if (updateResult.error) throw updateResult.error;
            if (!updateResult.data?.length) throw new Error('O estoque mudou antes da baixa. Atualize a tela e tente novamente.');

            const insertResult = await supabaseClient.from('sales').insert({
                id: sale.id,
                seller_id: sale.sellerId,
                product_id: sale.productId,
                quantity: sale.quantity,
                unit_price: sale.unitPrice,
                total: sale.total,
                created_at: sale.createdAt
            });
            if (insertResult.error) {
                await supabaseClient.from('seller_products').update({ stock: beforeStock }).eq('id', product.id).eq('stock', afterStock);
                throw insertResult.error;
            }

            product.stock = afterStock;
            const localSales = sales();
            localSales.push(sale);
            write('atlasProducts', products());
            write('atlasSales', localSales);
            await fetchSupabaseData();
            m.remove();
            showToast(`Baixa realizada. ${seller.name} agora possui ${afterStock} unidade(s).`);
            refreshCurrentScreen();
        } catch (error) {
            console.error('Erro ao registrar baixa do vendedor:', error);
            if (submit) submit.disabled = false;
            alert(`Não foi possível registrar a baixa: ${error.message || error}`);
        }
    };
}

function formatChatTime(value) {
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? '' : date.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' });
}

function chatMessageTypeLabel(type) {
    return ({ stock_request: 'Pedido de estoque', sales_total: 'Total vendido', seller_report: 'Relato de baixa', normal: 'Mensagem' })[type] || 'Mensagem';
}

function chatShortcut(type) {
    const templates = {
        stock_request: 'PEDIDO DE ESTOQUE\nProduto: \nQuantidade: \nUrgência/observação: ',
        sales_total: 'TOTAL VENDIDO\nPeríodo: \nTotal de unidades: \nObservação: ',
        seller_report: 'RELATO DE BAIXA DE VENDEDOR\nVendedor: \nProduto: \nQuantidade: \nDetalhes: ',
        normal: ''
    };
    const input = document.getElementById('wgIkMessageInput');
    if (!input) return;
    input.value = templates[type] || '';
    input.dataset.messageType = type;
    input.focus();
    input.setSelectionRange(input.value.length, input.value.length);
}

async function markWgIkMessagesRead() {
    const unread = conversationMessages().filter(m => m.recipientId === currentUser?.id && !m.readAt);
    if (!unread.length) return;
    const now = new Date().toISOString();
    unread.forEach(m => { m.readAt = now; });
    dbCache.wg_ik_messages = conversationMessages();
    localStorage.setItem('nl_wg_ik_messages', JSON.stringify(dbCache.wg_ik_messages));
    if (supabaseClient) await supabaseClient.from('wg_ik_messages').update({ read_at: now }).in('id', unread.map(m => m.id));
}

function renderWgIkChatPage() {
    if (!canUseWgIkChat()) return renderSummary();
    const messages = conversationMessages().filter(m => {
        const parties = [m.senderId, m.recipientId];
        return parties.includes(wgAccountId()) && parties.includes(ikAccountId());
    }).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    const otherName = isWGAccount(currentUser) ? 'IK' : 'WG';
    setPageReportContext('Conversa WG ↔ IK', 'Comunicação direta entre WG e IK.', 'wgIkChat');
    appFrame('Conversa WG ↔ IK', 'Comunicação direta, pedidos e avisos operacionais.', `
        <style>
            .wgik-chat-shell{display:grid;grid-template-rows:auto 1fr auto;min-height:calc(100vh - 190px);max-width:1050px;margin:0 auto;background:linear-gradient(180deg,#f8fbff 0%,#eef5fb 100%);border:1px solid #dbe7f2;border-radius:24px;overflow:hidden;box-shadow:0 14px 40px rgba(15,23,42,.08)}
            .wgik-chat-top{display:flex;align-items:center;justify-content:space-between;gap:14px;padding:18px 20px;background:#fff;border-bottom:1px solid #e2e8f0}.wgik-chat-person{display:flex;align-items:center;gap:12px}.wgik-chat-status{display:flex;align-items:center;gap:7px;color:#16a34a;font-size:11px;font-weight:800}.wgik-chat-status i{width:8px;height:8px;border-radius:99px;background:#22c55e;box-shadow:0 0 0 4px #dcfce7}.wgik-chat-body{padding:20px;overflow:auto;display:flex;flex-direction:column;gap:12px;background-image:radial-gradient(#dbe7f2 1px,transparent 1px);background-size:18px 18px}.wgik-chat-empty{text-align:center;padding:55px 20px;color:#64748b}.wgik-bubble-row{display:flex;gap:9px;align-items:flex-end}.wgik-bubble-row.mine{justify-content:flex-end}.wgik-bubble{max-width:min(78%,680px);padding:11px 13px;border-radius:16px 16px 16px 4px;background:#fff;border:1px solid #dbe5ee;box-shadow:0 3px 10px rgba(15,23,42,.05)}.wgik-bubble-row.mine .wgik-bubble{border-radius:16px 16px 4px 16px;background:#dff4e9;border-color:#b7e5c8}.wgik-bubble-kicker{font-size:10px;font-weight:900;letter-spacing:.04em;text-transform:uppercase;color:#2563eb;margin-bottom:5px}.wgik-bubble-row.mine .wgik-bubble-kicker{color:#15803d}.wgik-bubble-text{white-space:pre-wrap;color:#1e293b;font-size:13px;line-height:1.5}.wgik-bubble-meta{display:flex;justify-content:flex-end;gap:7px;margin-top:7px;color:#94a3b8;font-size:10px}.wgik-reply-btn{border:0;background:transparent;color:#64748b;font-size:10px;cursor:pointer;padding:0}.wgik-shortcuts{display:flex;gap:8px;flex-wrap:wrap;padding:13px 16px 0}.wgik-shortcut{display:inline-flex;align-items:center;gap:7px;padding:9px 11px;border:1px solid #dbe5ee;border-radius:12px;background:#fff;color:#334155;font-size:11px;font-weight:800;cursor:pointer;transition:.15s}.wgik-shortcut:hover{border-color:#60a5fa;color:#1d4ed8;transform:translateY(-1px)}.wgik-compose{padding:13px 16px 16px;background:#fff;border-top:1px solid #e2e8f0}.wgik-compose-form{display:flex;align-items:flex-end;gap:9px}.wgik-compose textarea{min-height:48px;max-height:150px;resize:vertical;flex:1;border:1px solid #cbd5e1;border-radius:15px;padding:13px 14px;font-size:13px;outline:none}.wgik-compose textarea:focus{border-color:#60a5fa;box-shadow:0 0 0 3px #dbeafe}.wgik-send{height:48px;min-width:105px;display:flex;align-items:center;justify-content:center;gap:7px;border:0;border-radius:14px;background:#2563eb;color:#fff;font-weight:900;cursor:pointer}.wgik-send:disabled{opacity:.6;cursor:wait}.wgik-replying{display:none;margin-bottom:8px;padding:8px 11px;border-left:3px solid #2563eb;background:#eff6ff;color:#475569;font-size:11px;border-radius:7px}.wgik-replying.show{display:flex;justify-content:space-between;align-items:center}.wgik-reply-cancel{border:0;background:transparent;color:#2563eb;cursor:pointer;font-weight:800}@media(max-width:640px){.wgik-chat-shell{min-height:calc(100vh - 130px);border-radius:16px}.wgik-chat-top{padding:14px}.wgik-chat-body{padding:14px}.wgik-bubble{max-width:89%}.wgik-compose-form{align-items:stretch}.wgik-send{min-width:52px}.wgik-send span{display:none}}
        </style>
        <div class="wgik-chat-shell">
            <div class="wgik-chat-top"><div class="wgik-chat-person"><div class="avatar bg-blue-100 text-blue-700 font-black">${esc(isWGAccount(currentUser) ? 'WG' : 'IK')}</div><div><h2 class="text-base font-black text-slate-900">WG ↔ IK</h2><div class="wgik-chat-status"><i></i> Conversa privada · online</div></div></div><span class="text-xs text-slate-400 font-semibold">${esc(otherName)} recebe em tempo real</span></div>
            <div id="wgIkChatBody" class="wgik-chat-body">${messages.length ? messages.map(m => { const mine = m.senderId === currentUser.id; return `<div class="wgik-bubble-row ${mine ? 'mine' : ''}"><div class="wgik-bubble"><div class="wgik-bubble-kicker">${esc(chatMessageTypeLabel(m.messageType))}</div><div class="wgik-bubble-text">${esc(m.body)}</div><div class="wgik-bubble-meta"><span>${formatChatTime(m.createdAt)}</span><button class="wgik-reply-btn" data-reply-id="${esc(m.id)}">Responder</button>${mine ? `<span>${m.readAt ? 'Lido' : 'Enviado'}</span>` : ''}</div></div></div>`; }).join('') : '<div class="wgik-chat-empty"><div class="text-blue-600 mb-3">' + icons.chat + '</div><strong>Nenhuma mensagem ainda.</strong><p class="text-xs mt-2">Use um atalho abaixo para iniciar uma conversa organizada com ' + esc(otherName) + '.</p></div>'}</div>
            <div><div class="wgik-shortcuts"><button class="wgik-shortcut" data-chat-shortcut="stock_request">${icons.box}<span>Pedir estoque</span></button><button class="wgik-shortcut" data-chat-shortcut="sales_total">${icons.chart}<span>Total vendido</span></button><button class="wgik-shortcut" data-chat-shortcut="seller_report">${icons.alert}<span>Relatar baixa de vendedor</span></button><button class="wgik-shortcut" data-chat-shortcut="normal">${icons.text}<span>Digitar texto livre</span></button></div><div class="wgik-compose"><div id="wgIkReplying" class="wgik-replying"><span id="wgIkReplyingText"></span><button id="wgIkCancelReply" class="wgik-reply-cancel">Cancelar</button></div><form id="wgIkChatForm" class="wgik-compose-form"><textarea id="wgIkMessageInput" class="control" placeholder="Escreva uma mensagem para ${esc(otherName)}..." required></textarea><button class="wgik-send" type="submit">${icons.send}<span>Enviar</span></button></form></div></div>
        </div>
    `);
    const body = document.getElementById('wgIkChatBody');
    if (body) body.scrollTop = body.scrollHeight;
    document.querySelectorAll('[data-chat-shortcut]').forEach(button => button.onclick = () => chatShortcut(button.dataset.chatShortcut));
    let replyTo = null;
    document.querySelectorAll('.wgik-reply-btn').forEach(button => button.onclick = () => {
        replyTo = conversationMessages().find(m => m.id === button.dataset.replyId) || null;
        const replyBox = document.getElementById('wgIkReplying');
        document.getElementById('wgIkReplyingText').textContent = replyTo ? `Respondendo: ${replyTo.body.slice(0, 90)}` : '';
        replyBox.classList.toggle('show', Boolean(replyTo));
        document.getElementById('wgIkMessageInput').focus();
    });
    document.getElementById('wgIkCancelReply').onclick = () => { replyTo = null; document.getElementById('wgIkReplying').classList.remove('show'); };
    document.getElementById('wgIkChatForm').onsubmit = async event => {
        event.preventDefault();
        const input = document.getElementById('wgIkMessageInput');
        const bodyText = input.value.trim();
        if (!bodyText || !canUseWgIkChat()) return;
        const button = event.target.querySelector('button[type="submit"]');
        button.disabled = true;
        const message = { id: uid(), senderId: currentUser.id, senderRole: isWGAccount(currentUser) ? 'WG' : isIKAccount(currentUser) ? 'IK' : 'ADMIN', recipientId: isWGAccount(currentUser) ? ikAccountId() : wgAccountId(), messageType: input.dataset.messageType || 'normal', body: bodyText, metadata: {}, replyTo: replyTo?.id || null, createdAt: new Date().toISOString(), readAt: null };
        try {
            if (!supabaseClient) throw new Error('Supabase não está conectado.');
            const { error } = await supabaseClient.from('wg_ik_messages').insert({ id: message.id, sender_id: message.senderId, sender_role: message.senderRole, recipient_id: message.recipientId, message_type: message.messageType, body: message.body, metadata: message.metadata, reply_to: message.replyTo, created_at: message.createdAt });
            if (error) throw error;
            dbCache.wg_ik_messages = [...conversationMessages(), message];
            localStorage.setItem('nl_wg_ik_messages', JSON.stringify(dbCache.wg_ik_messages));
            input.value = ''; input.dataset.messageType = 'normal'; replyTo = null; document.getElementById('wgIkReplying').classList.remove('show');
            renderWgIkChatPage();
        } catch (error) {
            console.error(error);
            alert(`Não foi possível enviar a mensagem: ${error.message}`);
            button.disabled = false;
        }
    };
    markWgIkMessagesRead().catch(error => console.warn('Não foi possível marcar mensagens como lidas:', error));
}

function setupSupabaseRealtimeSync() {
    if (!supabaseClient || window.newlifeRealtimeChannel) return;
    window.newlifeRealtimeChannel = supabaseClient
        .channel('newlife-stock-sync')
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wg_ik_messages' }, async () => {
            await fetchSupabaseData();
            if (canUseWgIkChat() && activeTab === 'wgIkChat') renderWgIkChatPage();
            else refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'product_catalog' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'system_users' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'motoboys' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'warehouse_inventory' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'transfers' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_products' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'sales' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'wg_ik_shipments' }, async (payload) => {
            const before=wgIkShipments().find(x=>x.id===payload?.new?.id);
            const changed=before&&payload?.new&&Number(before.unit_cost_brl??before.unitCostBRL)!==Number(payload.new.unit_cost_brl);
            await fetchSupabaseData();
            if(isIKAccount()&&changed) showToast(`WG atualizou o valor de ${payload.new.product_name||'um produto'}. O novo valor já está ativo.`);
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'ik_seller_allocations' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_payment_sheet_lines' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_balance_payments' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_payment_sheets' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .on('postgres_changes', { event: '*', schema: 'public', table: 'seller_payment_ledger' }, async () => {
            await fetchSupabaseData();
            refreshCurrentScreen();
        })
        .subscribe(status => console.log('Sincronização de estoque:', status));
}

async function applyIkSellerDebit(sellerId, currency, entered, notes='') {
    if(!isIKAccount()&&!hasAdminAccess()) return showToast('Somente IK pode registrar abatimentos.');
    const seller=allSellers().find(x=>x.id===sellerId); const allocations=ikSellerAllocations().filter(a=>a.sellerId===sellerId&&a.status!=='CLOSED'&&allocationBalance(a)>0).sort((a,b)=>new Date(a.createdAt)-new Date(b.createdAt)); const rate=Number(currentExchangeRate.ask||currentExchangeRate.bid||0); const amountBRL=currency==='USD'?Number(entered)*rate:Number(entered); const totalDue=allocations.reduce((n,a)=>n+allocationBalance(a),0);
    if(!seller||!(entered>0)||!(amountBRL>0)||amountBRL>totalDue+0.001)return alert(`Valor inválido. Total em aberto: ${money(totalDue)}.`);
    let remaining=Number(amountBRL.toFixed(2)); const now=new Date().toISOString(); const written=[];
    for(const a of allocations){if(remaining<=0)break;const part=Number(Math.min(remaining,allocationBalance(a)).toFixed(2));if(!(part>0))continue;const paid=Number((allocationPaidValue(a.id)+part).toFixed(2));const newBalance=Number(Math.max(Number(a.totalValueBRL)-paid,0).toFixed(2));const closed=newBalance<=0;const p={id:uid(),allocationId:a.id,sellerId,ikId:ikAccountId(),amountBRL:part,paymentDate:new Date().toISOString().slice(0,10),frequency:'OTHER',notes:`Abatimento manual ${currency}: ${Number(entered).toFixed(2)}${notes?' — '+notes:''}`,createdBy:currentUser.id,createdAt:now};const pr=await supabaseClient.from('seller_payment_ledger').insert({id:p.id,allocation_id:a.id,sheet_id:null,seller_id:p.sellerId,ik_id:p.ikId,amount_brl:p.amountBRL,payment_currency:currency,original_amount:Number(Number(entered).toFixed(2)),exchange_rate_brl:Number(rate.toFixed(6)),payment_date:p.paymentDate,frequency:p.frequency,notes:p.notes,created_by:p.createdBy,created_at:p.createdAt});if(pr.error)return alert(`Pagamento não salvo: ${pr.error.message}`);const ar=await supabaseClient.from('ik_seller_allocations').update({remaining_value_brl:newBalance,status:closed?'CLOSED':'PARTIAL',updated_at:now}).eq('id',a.id).eq('status',a.status);if(ar.error)return alert(`Saldo não atualizado: ${ar.error.message}`);a.remainingValueBRL=newBalance;a.status=closed?'CLOSED':'PARTIAL';written.push(p);remaining=Number((remaining-part).toFixed(2));}
    const local=sellerPaymentLedger();local.push(...written);write('nl_seller_payment_ledger',local);const localA=ikSellerAllocations();written.forEach(p=>{const a=localA.find(x=>x.id===p.allocationId);if(a){a.remainingValueBRL=Math.max(Number(a.totalValueBRL)-allocationPaidValue(a.id),0);if(a.remainingValueBRL<=0)a.status='CLOSED';}});write('nl_ik_seller_allocations',localA);showToast(`Abatimento de ${currency==='USD'?'US$':'R$'} ${Number(entered).toFixed(2)} registrado para ${seller.name}.`);renderProductsPage();
}

function openIkSellerDebitModal(sellerId) {
    if(!isIKAccount()&&!hasAdminAccess()) return showToast('Somente IK pode registrar abatimentos.');
    const seller=allSellers().find(x=>x.id===sellerId); const allocations=ikSellerAllocations().filter(a=>a.sellerId===sellerId&&a.status!=='CLOSED'&&allocationBalance(a)>0); const totalDue=allocations.reduce((n,a)=>n+allocationBalance(a),0); const rate=Number(currentExchangeRate.ask||currentExchangeRate.bid||0); if(!seller||!(totalDue>0))return showToast('Este vendedor não possui valor em aberto.');
    const m=modal(`<h2>Abater valor — ${esc(seller.name)}</h2><p class="text-xs text-slate-500 mb-3">Digite o valor total abatido. O sistema distribuirá o pagamento automaticamente entre os produtos, sem exigir valor por produto.</p><div class="p-3 rounded-xl bg-slate-50 border border-slate-200 text-sm mb-3"><div class="flex justify-between"><span>Total em aberto</span><b>${money(totalDue)} · US$ ${(rate?totalDue/rate:0).toFixed(2)}</b></div></div><form id="ikSellerDebitForm" class="seller-form"><label>Moeda<select name="currency" class="control"><option value="BRL">Real (R$)</option><option value="USD">Dólar (US$)</option></select></label><label>Valor abatido<input name="amount" type="number" min="0.01" step="0.01" class="control" required></label><label>Observação<input name="notes" class="control"></label><button class="primary-btn w-full mt-3" type="submit">Abater valor do total</button></form>`);
    m.querySelector('form').onsubmit=async e=>{e.preventDefault();const f=new FormData(e.target);const btn=e.target.querySelector('button');btn.disabled=true;await applyIkSellerDebit(sellerId,String(f.get('currency')||'BRL'),Number(f.get('amount')),String(f.get('notes')||''));m.remove();};
}

function renderProductsPage() {
    const ss = hasAdminAccess(currentUser) ? allSellers() : allSellers().filter(s => s.supervisor === currentUser.user);
    const mySupStock = products().filter(p => p.sellerId === currentUser.id && p.stock > 0);

    appFrame('Atribuir & Enviar Produtos', `Gestão de estoque dos vendedores. Cotação: 1 USD = ${money(currentExchangeRate.ask || currentExchangeRate.bid)} (${esc(currentExchangeRate.source || 'aguardando atualização')}).`, `
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
                
                // Cálculo de Vendas do Dia (Total em vermelho ex: -4.000)
                const sSalesToday = periodSales(s.id, 'day');
                const sTotalSoldTodayBRL = sSalesToday.reduce((a, x) => a + Number(x.total || 0), 0);
                const formattedSoldToday = moneyPairSigned(-sTotalSoldTodayBRL);

                // Subtotal da soma de todos os produtos do vendedor
                const sSubtotalBRL = sProds.reduce((a, p) => a + (p.stock * p.price), 0);
                const sTotalUnits = sProds.reduce((a, p) => a + p.stock, 0);
                const sAllocations = ikSellerAllocations().filter(a => a.sellerId === s.id);
                const sSentQty = sAllocations.reduce((n, a) => n + Number(a.quantitySent || 0), 0);
                const sRemainingQty = sAllocations.reduce((n, a) => n + Number(a.quantityRemaining || 0), 0);
                const sSentValue = sAllocations.reduce((n, a) => n + Number(a.totalValueBRL || 0), 0);
                const sPaidValue = sAllocations.reduce((n, a) => n + allocationPaidValue(a.id), 0);
                const sOpenValue = Math.max(sSentValue - sPaidValue, 0);

                return `
                    <div class="seller-card glass-panel p-5 rounded-2xl flex flex-col justify-between gap-3 bg-white/90 border border-slate-200 shadow-sm">
                        <div>
                            <div class="flex items-center justify-between mb-2">
                                <div class="flex items-center gap-2">
                                    ${renderAvatarHTML(s, 'small')}
                                    <div>
                                        <h3 class="text-base font-bold text-slate-900 leading-tight">${esc(s.name)}</h3>
                                        <p class="text-xs text-slate-500">@${esc(s.user)} · ${esc(s.city || 'N/A')}/${esc(s.uf || 'N/A')}</p>
                                    </div>
                                </div>
                                <!-- TOTAL VENDIDO NO DIA EM VERMELHO -->
                                <div class="text-right" title="Total Vendido Hoje">
                                    <span class="text-xs font-black px-2 py-0.5 rounded-md bg-red-50 text-red-600 border border-red-200 block" style="color: #ef4444; font-weight: 800;">
                                        ${formattedSoldToday}
                                    </span>
                                </div>
                            </div>

                            <!-- SUBTOTAL DA SOMA DE TODOS OS PRODUTOS DO CARD -->
                            <div class="p-3 bg-slate-100/80 rounded-xl mb-3 border border-slate-200/60">
                                <span class="text-[10px] font-bold text-slate-500 uppercase block">Subtotal em Posse (Soma)</span>
                                <strong class="text-base text-slate-900 font-black">${moneyPair(sSubtotalBRL)}</strong>
                                <small class="block text-slate-500 text-[11px] font-semibold">${sTotalUnits} un. totais em estoque</small>
                            </div>
                            <div class="p-3 bg-indigo-50/70 rounded-xl mb-3 border border-indigo-100 text-xs">
                                <div class="flex justify-between gap-2"><span class="text-slate-500 font-semibold">Enviado pelo IK</span><b class="text-slate-800">${sRemainingQty}/${sSentQty || sTotalUnits} un.</b></div>
                                <div class="flex justify-between gap-2 mt-1"><span class="text-slate-500 font-semibold">Valor enviado</span><b class="text-slate-800">${moneyPair(sSentValue)}</b></div>
                                <div class="flex justify-between gap-2 mt-1"><span class="text-slate-500 font-semibold">Total em aberto</span><b class="text-amber-700">${moneyPair(sOpenValue)}</b></div>${isIKAccount(currentUser)?`<div class="ik-inline-debit mt-3"><div class="flex gap-2"><select class="control ik-debit-currency flex-1 text-xs" data-seller-id="${s.id}"><option value="BRL">R$</option><option value="USD">US$</option></select><input class="control ik-debit-amount flex-[2] text-xs" data-seller-id="${s.id}" type="number" min="0.01" step="0.01" placeholder="Valor abatido"><button class="small-btn ik-inline-debit-btn" data-seller-id="${s.id}">Abater</button></div><small class="text-[10px] text-slate-500 block mt-1">Digite o valor total pago pelo vendedor; o sistema desconta automaticamente.</small></div>`:''}
                            </div>

                            <div class="text-xs text-slate-600 space-y-2">
                                ${sProds.length ? sProds.map(p => {
                                    const itemTotalValBRL = p.stock * p.price;
                                    return `
                                        <div class="flex justify-between items-center p-2.5 bg-slate-50 rounded-xl border border-slate-100">
                                            <div>
                                                <b class="text-slate-900 block">${esc(p.name)}</b>
                                                <small class="text-slate-500 font-semibold">${moneyPair(p.price)}/un · <span class="text-emerald-700 font-extrabold">Total: ${moneyPair(itemTotalValBRL)}</span></small>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <b class="text-slate-800 text-sm font-black">${p.stock} un.</b>
                                                <button class="small-btn edit-seller-price-btn text-[10px] py-0.5 px-1.5" data-id="${p.id}">Preço</button>
                                                        ${hasAdminAccess(currentUser) ? `<button class="small-btn edit-seller-stock-btn text-[10px] py-0.5 px-1.5" data-id="${p.id}">Qtd.</button><button class="small-btn admin-writeoff-btn text-[10px] py-0.5 px-1.5" data-id="${p.id}">Baixa</button><button class="delete-btn delete-seller-stock-btn text-[10px] py-0.5 px-1.5" data-id="${p.id}">${icons.trash}</button>` : ''}
                                            </div>
                                        </div>
                                    `;
                                }).join('') : '<i class="text-slate-400 block p-2">Sem produtos no momento</i>'}
                            </div>
                        </div>
                    </div>
                `;
            }).join('')}
        </div>
    `);

    const trBtn = document.getElementById('supTransferStockBtn');
    if (trBtn) trBtn.onclick = transferSupervisorStockModal;

    document.querySelectorAll('.edit-seller-stock-btn').forEach(b => b.onclick = () => editSellerStockModal(b.dataset.id));
    document.querySelectorAll('.admin-writeoff-btn').forEach(b => b.onclick = () => adminRegisterSellerSale(b.dataset.id));
    document.querySelectorAll('.ik-seller-debit-btn').forEach(b => b.onclick = () => openIkSellerDebitModal(b.dataset.sellerId));
    document.querySelectorAll('.ik-inline-debit-btn').forEach(b => b.onclick = async () => { const id=b.dataset.sellerId; const amount=document.querySelector(`.ik-debit-amount[data-seller-id="${id}"]`); const currency=document.querySelector(`.ik-debit-currency[data-seller-id="${id}"]`); if(!amount||!(Number(amount.value)>0)) return alert('Digite o valor abatido.'); b.disabled=true; await applyIkSellerDebit(id,currency?.value||'BRL',Number(amount.value)); });
    document.querySelectorAll('.delete-seller-stock-btn').forEach(b => b.onclick = () => deleteSellerStockProduct(b.dataset.id));

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

                showToast('Preço do vendedor atualizado no Supabase!');
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
                    <span>Vendedor</span><span>Localização</span><span>Qtd Vendida</span><span>Faturamento (R$ / US$)</span>
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
                            <strong class="highlight-val">${moneyPair(sellerRevenue(s.id, 'month'))}</strong>
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
    `);

    document.getElementById('downloadPdfBtn').onclick = () => {
        exportUniversalPDF({
            title: 'Relatório Oficial de Vendas em Reais (R$) e Dólares (US$)',
            headers: ['Vendedor', 'Localizacao', 'Qtd Vendida', 'Faturamento (R$ / US$)'],
            rows: ss.map(s => [s.name, `${s.city}/${s.uf}`, `${periodSales(s.id, 'month').reduce((a, x) => a + x.quantity, 0)} un.`, moneyPair(sellerRevenue(s.id, 'month'))]),
            fileName: 'newlife-relatorio.pdf'
        });
    };
}

/* PAINEL DO VENDEDOR */
function renderSeller() {
    setPageReportContext('Painel do Vendedor', 'Produtos, vendas e pedidos do vendedor atual.', sellerActiveTab === 'newOrder' ? 'sellerOrders' : sellerActiveTab);
    const sellerProducts = products().filter(p => p.sellerId === currentUser.id && Number(p.stock) > 0);
    const container = getAppRoot();

    container.innerHTML = `
        <div class="app-layout w-full min-h-screen flex flex-col md:flex-row">
            <aside id="appDrawer" class="app-sidebar app-responsive-sidebar flex flex-col ${drawerOpen ? 'open' : ''}">${sellerNavContent()}</aside>
            <div id="appDrawerOverlay" class="drawer-overlay ${drawerOpen ? 'open' : ''}"></div>
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
                            <button id="pushSellerSupabaseBtn" class="primary-btn flex items-center gap-1.5 text-xs py-1.5 px-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg shadow-sm border-0">
                                ${icons.upload} <span>Enviar Alterações p/ Supabase</span>
                            </button>
                            <button id="generatePageReportBtn" class="outline-btn flex items-center gap-1.5 text-xs py-1.5 px-3">${icons.pdf} <span>Gerar Relatório</span></button>
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

    document.getElementById('pushSellerSupabaseBtn').onclick = pushAllToSupabase;
    bindPageReportButton();
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
                    showToast('Vendas confirmadas e salvas no Supabase!');
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

                    showToast('Pedido enviado e gravado no Supabase!');
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
    ensureStableResponsiveTheme();
    // Busca cotação de Câmbio ao vivo
    fetchExchangeRate();
    setInterval(fetchExchangeRate, 60000); // Atualiza a cada 60s

    // Conecta o formulário existente na página ao fluxo de autenticação.
    setupLoginEvents();

    if (supabaseClient) {
        await fetchSupabaseData();
        setupSupabaseRealtimeSync();
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

    if (currentUser) {
        refreshCurrentScreen();
    }
});
