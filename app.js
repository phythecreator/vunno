// ==========================================
// 1. LIGAÇÃO DO SUPABASE (Dados reais do teu projeto!)
// ==========================================
const supabaseUrl = 'https://swxyxseudukuaujmsua.supabase.co';

// Chave integrada com sucesso!
const supabaseKey = 'sb_publishable_zjFFRlswNi8IajReRhtLfg_a_6ntgLo';

// Inicializa o cliente oficial do Supabase
const supabaseClient = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. ESTADO LOCAL DA APP
// ==========================================
let utilizadorLogado = null;
let dbComentarios = [];

// Quando a página carrega, vai buscar os dados ao Supabase
document.addEventListener("DOMContentLoaded", () => {
    atualizarEstatisticasVotos();
    carregarComentarios();
    
    // Atualiza os comentários automaticamente a cada 5 segundos
    setInterval(carregarComentarios, 5000);
});

function toggleModal(id) {
    document.getElementById(id).classList.toggle('hidden');
}

// ==========================================
// 3. AUTENTICAÇÃO E AVATAR
// ==========================================
function ejecutarAuth() {
    const username = document.getElementById('auth-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    
    if(!username || !email) return alert("Preenche todos os campos!");

    utilizadorLogado = { name: username, email: email, avatar: "🥷" };
    toggleModal('auth-modal');
    atualizarInterfaceUser();
}

function atualizarInterfaceUser() {
    const profileSection = document.getElementById('user-profile');
    if (utilizadorLogado) {
        profileSection.innerHTML = `
            <div class="flex items-center gap-2 cursor-pointer bg-slate-700/50 p-1.5 pr-3 rounded-full" onclick="toggleModal('avatar-modal')">
                <span class="text-2xl bg-slate-800 w-8 h-8 flex items-center justify-center rounded-full border border-slate-600">${utilizadorLogado.avatar}</span>
                <span class="text-sm font-medium text-slate-200">${utilizadorLogado.name}</span>
            </div>
        `;
    }
}

function selecionarAvatar(emoji) {
    if (!utilizadorLogado) return;
    utilizadorLogado.avatar = emoji;
    atualizarInterfaceUser();
}

// ==========================================
// 4. LÓGICA DE VOTAÇÃO REAL
// ==========================================
async function registarVoto(setor, tipo) {
    if (!utilizadorLogado) return alert("Tens de definir um Nome/Email primeiro para votar!");
    
    const { error } = await supabaseClient.from('votos').insert([{ setor: setor, tipo: tipo }]);
    
    if (error) {
        alert("Erro ao votar: " + error.message);
    } else {
        alert("Voto contabilizado com sucesso!");
        atualizarEstatisticasVotos();
    }
}

async function atualizarEstatisticasVotos() {
    const { data, error } = await supabaseClient.from('votos').select('setor, tipo');
    if (error || !data) return;

    const comboiosGreve = data.filter(v => v.setor === 'comboios' && v.tipo === 'greve').length;
    const comboiosOK = data.filter(v => v.setor === 'comboios' && v.tipo === 'ok').length;
    const escolasGreve = data.filter(v => v.setor === 'escolas' && v.tipo === 'greve').length;
    const escolasOK = data.filter(v => v.setor === 'escolas' && v.tipo === 'ok').length;

    document.getElementById('votos-total-comboios').innerText = `${comboiosGreve + comboiosOK} votos`;
    document.getElementById('votos-total-escolas').innerText = `${escolasGreve + escolasOK} votos`;
}

// ==========================================
// 5. COMENTÁRIOS REAIS
// ==========================================
async function carregarComentarios() {
    const { data, error } = await supabaseClient.from('comentarios').select('*').order('id', { ascending: true });
    if (error) return;

    dbComentarios = data;
    renderizarComentarios();
}

async function enviarComentario(parentId = null) {
    if (!utilizadorLogado) return alert("Identifica-te primeiro para comentares!");
    
    const inputId = parentId ? `reply-input-${parentId}` : 'novo-comentario-txt';
    const inputElement = document.getElementById(inputId);
    const texto = inputElement.value.trim();

    if (!texto) return;

    const { error } = await supabaseClient.from('comentarios').insert([{
        parent_id: parentId,
        autor: utilizadorLogado.name,
        avatar: utilizadorLogado.avatar,
        texto: texto
    }]);

    if (error) {
        alert("Erro ao enviar comentário: " + error.message);
    } else {
        inputElement.value = '';
        carregarComentarios();
    }
}

function gerarHTMLComentario(comentario) {
    const respostas = dbComentarios.filter(c => c.parent_id === comentario.id);
    let respostasHTML = '';

    if (respostas.length > 0) {
        respostasHTML = `<div class="comment-reply-chain mt-3 space-y-3">${respostas.map(r => gerarHTMLComentario(r)).join('')}</div>`;
    }

    return `
        <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-700/60 shadow-sm text-sm">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xl bg-slate-800 w-7 h-7 flex items-center justify-center rounded-full">${comentario.avatar}</span>
                <span class="font-bold text-blue-300">${comentario.autor}</span>
            </div>
            <p class="text-slate-300 pl-1">${comentario.texto}</p>
            <div class="mt-2 pl-1">
                <button onclick="mostrarCaixaResposta(${comentario.id})" class="text-xs text-blue-400 hover:underline font-medium">Responder</button>
            </div>
            <div id="reply-box-${comentario.id}" class="hidden mt-3 pl-1 space-y-2">
                <input type="text" id="reply-input-${comentario.id}" placeholder="Escreve a tua resposta..." class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs text-white">
                <div class="flex gap-2 justify-end">
                    <button onclick="mostrarCaixaResposta(${comentario.id})" class="text-xs bg-slate-700 px-3 py-1.5 rounded">Cancelar</button>
                    <button onclick="enviarComentario(${comentario.id})" class="text-xs bg-blue-600 px-3 py-1.5 rounded font-semibold">Enviar</button>
                </div>
            </div>
            ${respostasHTML}
        </div>
    `;
}

function mostrarCaixaResposta(id) {
    document.getElementById(`reply-box-${id}`).classList.toggle('hidden');
}

function renderizarComentarios() {
    const feed = document.getElementById('comments-feed');
    const principais = dbComentarios.filter(c => c.parent_id === null);
    
    if(principais.length === 0) {
        feed.innerHTML = `<p class="text-center text-xs text-slate-500 py-4">Nenhum comentário ainda. Sê o primeiro!</p>`;
        return;
    }
    feed.innerHTML = principais.map(c => gerarHTMLComentario(c)).join('');
}
