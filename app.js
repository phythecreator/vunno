// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================
const supabaseUrl = 'COLA_AQUI_O_TEU_URL';
const supabaseKey = 'COLA_AQUI_A_TUA_CHAVE';
// Nota: Quando criares o Supabase, descomenta a linha abaixo:
// const supabase = supabase.createClient(supabaseUrl, supabaseKey);

// ==========================================
// 2. ESTADO DA APLICAÇÃO (Dados em Memória)
// ==========================================
let utilizadorLogado = null; // Guarda os dados do user se ele fizer login

// Dados fictícios para a app funcionar imediatamente antes de ligares a DB
let dbVotos = { comboios: 0, escolas: 0 };
let dbComentarios = [
    { id: 1, parent_id: null, autor: "Filipe", avatar: "🥷", texto: "Aqui na minha zona não há comboios de todo, a estação está deserta.", data: "Há 5 min" },
    { id: 2, parent_id: 1, autor: "Sara", avatar: "🦊", texto: "Confirmo, a Linha de Sintra está completamente parada.", data: "Há 2 min" },
    { id: 3, parent_id: null, autor: "Pedro", avatar: "🤖", texto: "Na minha escola as aulas estão a decorrer normalmente.", data: "Há 1 min" }
];

// ==========================================
// 3. INICIALIZAÇÃO
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    renderizarComentarios();
    atualizarEstatisticasVotos();
});

// Alternar visibilidade dos Modais
function toggleModal(id) {
    const modal = document.getElementById(id);
    modal.classList.toggle('hidden');
}

// ==========================================
// 4. SISTEMA DE AUTENTICAÇÃO E AVATAR
// ==========================================
function executarAuth() {
    const username = document.getElementById('auth-username').value;
    const email = document.getElementById('auth-email').value;
    
    if(!username || !email) return alert("Preenche os campos!");

    utilizadorLogado = {
        name: username,
        email: email,
        avatar: "🥷" // Avatar padrão inicial
    };

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
    
    // Atualiza também os comentários antigos do user na memória local para veres o efeito
    dbComentarios.forEach(c => { if(c.autor === utilizadorLogado.name) c.avatar = emoji; });
    renderizarComentarios();
}

// ==========================================
// 5. LÓGICA DE VOTAÇÃO
// ==========================================
function registarVoto(setor, tipo) {
    if (!utilizadorLogado) return alert("Tens de fazer login para poder votar!");
    
    dbVotos[setor] += 1;
    atualizarEstatisticasVotos();
    alert(`Obrigado pelo teu voto no setor ${setor}!`);
}

function atualizarEstatisticasVotos() {
    document.getElementById('votos-total-comboios').innerText = `${dbVotos.comboios} votos`;
    document.getElementById('votos-total-escolas').innerText = `${dbVotos.escolas} votos`;
}

// ==========================================
// 6. MOTOR DE COMENTÁRIOS (ANINHADOS)
// ==========================================
function enviarComentario(parentId = null) {
    if (!utilizadorLogado) return alert("Faz login primeiro para comentares!");
    
    let inputId = parentId ? `reply-input-${parentId}` : 'novo-comentario-txt';
    const inputElement = document.getElementById(inputId);
    const texto = inputElement.value.trim();

    if (!texto) return;

    const novoComentario = {
        id: Date.now(),
        parent_id: parentId,
        autor: utilizadorLogado.name,
        avatar: utilizadorLogado.avatar,
        texto: texto,
        data: "Agora mesmo"
    };

    dbComentarios.push(novoComentario);
    inputElement.value = '';
    renderizarComentarios();
}

// Função recursiva para gerar HTML de comentários em árvore (estilo Reddit)
function gerarHTMLComentario(comentario) {
    // Procura se este comentário tem respostas (filhos)
    const respostas = dbComentarios.filter(c => c.parent_id === comentario.id);
    let respostasHTML = '';

    if (respostas.length > 0) {
        respostasHTML = `<div class="comment-reply-chain mt-3 space-y-3">
            ${respostas.map(r => gerarHTMLComentario(r)).join('')}
        </div>`;
    }

    return `
        <div class="bg-slate-900/40 p-4 rounded-xl border border-slate-700/60 shadow-sm text-sm">
            <div class="flex items-center gap-2 mb-2">
                <span class="text-xl bg-slate-800 w-7 h-7 flex items-center justify-center rounded-full">${comentario.avatar}</span>
                <span class="font-bold text-blue-300">${comentario.autor}</span>
                <span class="text-xs text-slate-500">${comentario.data}</span>
            </div>
            <p class="text-slate-300 pl-1">${comentario.texto}</p>
            
            <!-- Botão de Resposta rápida -->
            <div class="mt-2 pl-1">
                <button onclick="mostrarCaixaResposta(${comentario.id})" class="text-xs text-blue-400 hover:underline font-medium">Responder</button>
            </div>

            <!-- Caixa de resposta (escondida por padrão) -->
            <div id="reply-box-${comentario.id}" class="hidden mt-3 pl-1 space-y-2">
                <input type="text" id="reply-input-${comentario.id}" placeholder="Escreve a tua resposta..." class="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-xs">
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
    const caixa = document.getElementById(`reply-box-${id}`);
    caixa.classList.toggle('hidden');
}

function renderizarComentarios() {
    const feed = document.getElementById('comments-feed');
    // Filtra apenas os comentários principais (aqueles que não são resposta a ninguém)
    const principais = dbComentarios.filter(c => c.parent_id === null);
    
    if(principais.length === 0) {
        feed.innerHTML = `<p class="text-center text-xs text-slate-500 py-4">Nenhum comentário ainda. Sê o primeiro!</p>`;
        return;
    }

    feed.innerHTML = principais.map(c => gerarHTMLComentario(c)).join('');
}
