// ==========================================
// CONFIGURAÇÃO SUPABASE (Dados Oficiais)
// ==========================================
const supabaseUrl = 'https://swxyxseudukuaujmsua.supabase.co';
const supabaseKey = 'sb_publishable_zjFFRlswNi8IajReRhtLfg_a_6ntgLo';
const _sup = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// ESTADO DO PROJETO E POLS DINÂMICOS
// ==========================================
let user = null;
let dbComentarios = [];

// Lista expansível de Polls (podes adicionar quantas quiseres aqui!)
const listaPolls = [
    { id: 'comboios', titulo: 'Comboios (CP / Fertagus)', desc: 'Circulação de comboios urbanos e regionais.' },
    { id: 'escolas', titulo: 'Escolas e Universidades', desc: 'Aulas e funcionamento das secretarias.' },
    { id: 'saude', titulo: 'Hospitais e Centros de Saúde', desc: 'Urgências e consultas agendadas.' },
    { id: 'transportes', titulo: 'Metropolitano e Autocarros', desc: 'Carris, Metro de Lisboa e Porto.' }
];

// Opções do Customizador de Avatar Estilo Reddit
const avatarOptions = {
    bases: ['🤖', '🦊', '🐱', '🐼', '👽', '🐸', '🦁'],
    props: ['❌', '👑', '🎩', '🕶️', '🎧', '🎓', '🎸'],
    bgs: ['bg-gray-100', 'bg-red-100', 'bg-blue-100', 'bg-green-100', 'bg-yellow-100', 'bg-purple-100']
};

let currentAvatarSelection = { base: '🤖', prop: '❌', bg: 'bg-gray-100' };

// ==========================================
// MOTOR INICIALIZADOR
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    renderizarEstruturaPolls();
    atualizarEstatisticasVotos();
    carregarComentarios();
    setupConfiguradorAvatar();
    setInterval(carregarComentarios, 5000); // Atualização Real a cada 5s
});

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

// ==========================================
// SISTEMA DE POLLS & VOTOS DINÂMICOS
// ==========================================
function renderizarEstruturaPolls() {
    const container = document.getElementById('polls-container');
    const sidebar = document.getElementById('sidebar-polls-list');
    
    container.innerHTML = listaPolls.map(poll => `
        <div class="bg-white reddit-border rounded p-4 shadow-xs">
            <span class="text-xs font-bold text-gray-400">VOTAÇÃO COMUNITÁRIA</span>
            <h2 class="text-lg font-bold tracking-tight text-gray-900 mt-0.5">${poll.titulo}</h2>
            <p class="text-xs text-gray-500 mb-4">${poll.desc}</p>
            
            <div class="grid grid-cols-2 gap-3 mb-3">
                <button onclick="registarVoto('${poll.id}', 'greve')" class="bg-red-50 hover:bg-red-100 text-red-600 border border-red-200 text-xs font-bold p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all">
                    <span>🛑 Parado / Greve</span>
                    <span id="count-${poll.id}-greve" class="text-base font-black">0</span>
                </button>
                <button onclick="registarVoto('${poll.id}', 'ok')" class="bg-green-50 hover:bg-green-100 text-green-600 border border-green-200 text-xs font-bold p-3 rounded-lg flex flex-col items-center justify-center gap-1 transition-all">
                    <span>✅ A Funcionar</span>
                    <span id="count-${poll.id}-ok" class="text-base font-black">0</span>
                </button>
            </div>
            <div class="text-right text-2xs text-gray-400 font-medium" id="total-${poll.id}">0 votos registados</div>
        </div>
    `).join('');

    sidebar.innerHTML = listaPolls.map(p => `<div class="p-2 hover:bg-gray-200 rounded cursor-pointer text-gray-600 truncate">📌 ${p.titulo}</div>`).join('');
}

async function registarVoto(setor, tipo) {
    if (!user) return toggleModal('auth-modal');
    const { error } = await _sup.from('votos').insert([{ setor, tipo }]);
    if (error) return alert("Erro: " + error.message);
    atualizarEstatisticasVotos();
}

async function atualizarEstatisticasVotos() {
    const { data } = await _sup.from('votos').select('setor, tipo');
    if (!data) return;

    document.getElementById('widget-total-votos').innerText = data.length;

    listaPolls.forEach(poll => {
        const greve = data.filter(v => v.setor === poll.id && v.tipo === 'greve').length;
        const ok = data.filter(v => v.setor === poll.id && v.tipo === 'ok').length;
        
        document.getElementById(`count-${poll.id}-greve`).innerText = greve;
        document.getElementById(`count-${poll.id}-ok`).innerText = ok;
        document.getElementById(`total-${poll.id}`).innerText = `${greve + ok} votos registados`;
    });
}

// ==========================================
// CUSTOMIZADOR DE AVATAR (ESTILO REDDIT)
// ==========================================
function setupConfiguradorAvatar() {
    const renderOp = (id, arr, tipo) => {
        document.getElementById(id).innerHTML = arr.map(item => `
            <button onclick="mudarPecaAvatar('${tipo}', '${item}')" class="p-1.5 hover:bg-white rounded border border-transparent hover:border-gray-300 transition-all">${item.replace('bg-', '🎨')}</button>
        `).join('');
    };
    renderOp('selector-base', avatarOptions.bases, 'base');
    renderOp('selector-props', avatarOptions.props, 'prop');
    renderOp('selector-bg', avatarOptions.bgs, 'bg');
}

function mudarPecaAvatar(tipo, valor) {
    currentAvatarSelection[tipo] = valor;
    const box = document.getElementById('avatar-preview-box');
    
    // Atualiza as classes de fundo CSS removendo as antigas
    avatarOptions.bgs.forEach(c => box.classList.remove(c));
    box.classList.add(currentAvatarSelection.bg);
    
    // Atualiza o display do emoji + acessório
    const acessorio = currentAvatarSelection.prop !== '❌' ? `<span class="absolute top-1 text-xl">${currentAvatarSelection.prop}</span>` : '';
    document.getElementById('preview-item').innerHTML = `
        <div class="relative flex items-center justify-center">
            ${acessorio}
            <span>${currentAvatarSelection.base}</span>
        </div>
    `;
}

function salvarAvatar() {
    if (!user) return alert("Cria a tua conta primeiro para salvar o avatar!");
    
    // Transforma o layout do avatar numa string renderizável
    const acessorio = currentAvatarSelection.prop !== '❌' ? `<span class="absolute top-0 text-xs">${currentAvatarSelection.prop}</span>` : '';
    user.avatarHTML = `
        <div class="relative w-8 h-8 rounded-full ${currentAvatarSelection.bg} flex items-center justify-center text-lg border border-gray-300">
            ${acessorio}<span>${currentAvatarSelection.base}</span>
        </div>
    `;
    
    document.getElementById('avatar-display-main').innerHTML = user.avatarHTML;
    toggleModal('avatar-modal');
    renderizarComentarios(); // Atualiza os avatares no feed de comentários
}

// ==========================================
// CONTROLO DE SESSÃO / AUTH
// ==========================================
function ejecutarAuth() {
    const name = document.getElementById('auth-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    if (!name || !email) return alert("Preenche todos os campos.");

    user = { name, email, avatarHTML: `<div class="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center text-sm font-bold">U</div>` };
    toggleModal('auth-modal');
    
    document.getElementById('user-profile').innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded-full border border-gray-200" onclick="toggleModal('avatar-modal')">
            <span class="text-xs font-bold text-gray-700">${user.name}</span>
            <span class="text-2xs text-blue-500">⚙️ Editar</span>
        </div>
    `;
    toggleModal('avatar-modal'); // Abre logo o criador de bonecos para o utilizador se divertir
}

// ==========================================
// ARQUITETURA DE COMENTÁRIOS COORDENADOS
// ==========================================
async function carregarComentarios() {
    const { data } = await _sup.from('comentarios').select('*').order('id', { ascending: true });
    if (data) { dbComentarios = data; renderizarComentarios(); }
}

async function enviarComentario(parentId = null) {
    if (!user) return toggleModal('auth-modal');
    const input = document.getElementById(parentId ? `reply-input-${parentId}` : 'novo-comentario-txt');
    const texto = input.value.trim();
    if (!texto) return;

    const { error } = await _sup.from('comentarios').insert([{
        parent_id: parentId, autor: user.name, avatar: user.avatarHTML, texto: texto
    }]);

    if (!error) { input.value = ''; carregarComentarios(); }
}

function gerarHTMLComentario(c) {
    const respostas = dbComentarios.filter(r => r.parent_id === c.id);
    return `
        <div class="bg-white reddit-border rounded p-3 text-sm space-y-2">
            <div class="flex items-center gap-2">
                ${c.avatar.includes('<div') ? c.avatar : `<div class="w-7 h-7 rounded-full bg-gray-200 flex items-center justify-center text-sm">${c.avatar}</div>`}
                <span class="font-bold text-xs text-gray-900">${c.autor}</span>
                <span class="text-3xs text-gray-400">há instantes</span>
            </div>
            <p class="text-gray-800 text-xs pl-1 leading-relaxed">${c.texto}</p>
            <div class="flex items-center gap-4 text-3xs font-bold text-gray-500 uppercase pl-1">
                <button onclick="document.getElementById('reply-box-${c.id}').classList.toggle('hidden')" class="hover:text-black">💬 Responder</button>
            </div>
            <div id="reply-box-${c.id}" class="hidden space-y-2 pt-2 pl-2 border-l-2 border-gray-200">
                <input type="text" id="reply-input-${c.id}" placeholder="Escreve uma resposta pública..." class="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-xs outline-none focus:bg-white focus:border-blue-500">
                <div class="flex gap-2 justify-end">
                    <button onclick="enviarComentario(${c.id})" class="reddit-blue text-white text-3xs font-bold px-3 py-1.5 rounded-full">Enviar</button>
                </div>
            </div>
            ${respostas.length > 0 ? `<div class="space-y-2 pt-2 pl-4 border-l-2 border-gray-100 flex flex-col gap-2">${respostas.map(r => gerarHTMLComentario(r)).join('')}</div>` : ''}
        </div>
    `;
}

function renderizarComentarios() {
    const feed = document.getElementById('comments-feed');
    const principais = dbComentarios.filter(c => c.parent_id === null);
    feed.innerHTML = principais.length === 0 
        ? `<p class="text-center text-xs text-gray-400 py-6 bg-white reddit-border rounded">Nenhum comentário no feed. Começa a discussão!</p>`
        : principais.map(c => gerarHTMLComentario(c)).join('');
}
