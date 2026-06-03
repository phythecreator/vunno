const supabaseUrl = 'https://swxyxseudukuaujmsua.supabase.co';
const supabaseKey = 'sb_publishable_zjFFRlswNi8IajReRhtLfg_a_6ntgLo';
const _sup = supabase.createClient(supabaseUrl, supabaseKey);

let user = null;
let feedItems = [];
let dbComentarios = [];
let currentCreateType = 'text'; // 'text' ou 'poll'

document.addEventListener("DOMContentLoaded", () => {
    carregarFeed();
    setupAvatarUploader();
    setInterval(carregarFeed, 6000); // Sincronização global entre dispositivos
});

function toggleModal(id) { document.getElementById(id).classList.toggle('hidden'); }

// ==========================================
// CARREGAMENTO DE IMAGEM REAL (FILE READER)
// ==========================================
function setupAvatarUploader() {
    const input = document.getElementById('avatar-file-input');
    input.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const base64Img = event.target.result;
            if (user) user.avatar = base64Img;
            
            const imgHTML = `<img src="${base64Img}" class="w-full h-full object-cover">`;
            document.getElementById('avatar-preview-box').innerHTML = imgHTML;
            document.getElementById('avatar-display-main').innerHTML = imgHTML;
        };
        reader.readAsDataURL(file);
    });
}

function executarAuth() {
    const name = document.getElementById('auth-username').value.trim();
    const email = document.getElementById('auth-email').value.trim();
    if (!name || !email) return alert("Preenche todos os campos.");

    user = { name, email, avatar: '' };
    toggleModal('auth-modal');
    
    document.getElementById('user-profile').innerHTML = `
        <div class="flex items-center gap-2 cursor-pointer bg-gray-100 hover:bg-gray-200 py-1 px-3 rounded-full border border-gray-200" onclick="toggleModal('avatar-modal')">
            <span class="text-xs font-bold text-gray-700">${user.name}</span>
            <span class="text-2xs text-blue-500">⚙️ Perfil</span>
        </div>
    `;
    toggleModal('avatar-modal');
}

// ==========================================
// GESTÃO DO FEED (POSTS E SONDAGENS)
// ==========================================
function abrirCriador(type) {
    if (!user) return toggleModal('auth-modal');
    currentCreateType = type;
    document.getElementById('create-modal-title').innerText = type === 'text' ? 'Criar Post de Texto' : 'Criar Nova Votação (Poll)';
    document.getElementById('post-content-input').style.display = type === 'text' ? 'block' : 'none';
    document.getElementById('poll-options-setup').style.display = type === 'poll' ? 'block' : 'none';
    toggleModal('create-modal');
}

async function publicarConteudo() {
    const title = document.getElementById('post-title-input').value.trim();
    if (!title) return alert("Insere um título!");

    let payload = {
        title: title,
        type: currentCreateType,
        autor: user.name,
        avatar: user.avatar || '👤',
        likes: 0
    };

    if (currentCreateType === 'text') {
        payload.content = document.getElementById('post-content-input').value.trim();
    } else {
        const inputs = document.querySelectorAll('.poll-opt-input');
        let options = [];
        inputs.forEach((inp, idx) => {
            const txt = inp.value.trim();
            if (txt) options.push({ id: idx, text: txt, votes: 0 });
        });
        if (options.length < 2) return alert("Insere pelo menos 2 opções para a votação!");
        payload.poll_options = options;
    }

    const { error } = await _sup.from('posts').insert([payload]);
    if (error) return alert("Erro ao publicar: " + error.message);

    // Limpar campos e fechar
    document.getElementById('post-title-input').value = '';
    document.getElementById('post-content-input').value = '';
    document.querySelectorAll('.poll-opt-input').forEach(i => i.value = '');
    toggleModal('create-modal');
    carregarFeed();
}

async function carregarFeed() {
    const { data: posts } = await _sup.from('posts').select('*').order('id', { ascending: false });
    const { data: comments } = await _sup.from('comentarios').select('*').order('id', { ascending: true });
    
    if (posts) feedItems = posts;
    if (comments) dbComentarios = comments;
    renderizarFeed();
}

async function alterarLike(id, delta) {
    const item = feedItems.find(p => p.id === id);
    if (!item) return;
    await _sup.from('posts').update({ likes: parseInt(item.likes) + delta }).eq('id', id);
    carregarFeed();
}

async function votarPoll(postId, optionId) {
    if (!user) return toggleModal('auth-modal');
    const post = feedItems.find(p => p.id === postId);
    if (!post) return;

    // Atualizar os contadores dentro da estrutura JSONB
    const novasOpcoes = post.poll_options.map(opt => {
        if (opt.id === optionId) opt.votes = (opt.votes || 0) + 1;
        return opt;
    });

    await _sup.from('posts').update({ poll_options: novasOpcoes }).eq('id', postId);
    carregarFeed();
}

// ==========================================
// RENDERIZAÇÃO COMPLETA DE INTERFACE
// ==========================================
function renderizarFeed() {
    const feed = document.getElementById('main-feed');
    if (feedItems.length === 0) {
        feed.innerHTML = `<p class="text-center text-gray-400 py-12 bg-white reddit-border rounded">Nenhuma publicação criada na comunidade. Sê o primeiro!</p>`;
        return;
    }

    feed.innerHTML = feedItems.map(item => {
        let conteudoHTML = '';

        if (item.type === 'text') {
            conteudoHTML = `<p class="text-sm text-gray-700 mt-2 leading-relaxed">${item.content || ''}</p>`;
        } else {
            // Lógica de cálculo matemático das percentagens da Poll
            const totalVotos = item.poll_options.reduce((acc, cur) => acc + (cur.votes || 0), 0);
            conteudoHTML = `<div class="space-y-2 mt-3 max-w-md">` + item.poll_options.map(opt => {
                const percent = totalVotos > 0 ? Math.round((opt.votes / totalVotos) * 100) : 0;
                return `
                    <button onclick="votarPoll(${item.id}, ${opt.id})" class="w-full bg-gray-50 hover:bg-gray-100 border border-gray-200 text-left text-xs font-semibold p-2.5 rounded-md relative flex justify-between items-center overflow-hidden transition-all">
                        <div class="absolute top-0 left-0 bottom-0 bg-blue-100/60 z-0 transition-all" style="width: ${percent}%"></div>
                        <span class="z-10 text-gray-800">${opt.text}</span>
                        <span class="z-10 text-gray-500">${opt.votes || 0}v (${percent}%)</span>
                    </button>
                `;
            }).join('') + `<span class="block text-3xs font-bold text-gray-400 uppercase mt-1">${totalVotos} votos totais</span></div>`;
        }

        const postComments = dbComentarios.filter(c => c.post_id === item.id && c.parent_id === null);
        const avatarImg = item.avatar.startsWith('data:') ? `<img src="${item.avatar}" class="w-7 h-7 rounded-full object-cover">` : `<div class="w-7 h-7 bg-gray-200 rounded-full flex items-center justify-center text-xs">${item.avatar}</div>`;

        return `
            <div class="bg-white reddit-border rounded flex shadow-xs">
                <div class="bg-gray-50/50 p-2 w-11 flex flex-col items-center border-r border-gray-100 pt-3 text-gray-400">
                    <button onclick="alterarLike(${item.id}, 1)" class="hover:text-orange-500 font-bold text-sm">▲</button>
                    <span class="text-xs font-bold my-1 text-gray-800">${item.likes}</span>
                    <button onclick="alterarLike(${item.id}, -1)" class="hover:text-blue-500 font-bold text-sm">▼</button>
                </div>
                <div class="p-4 flex-1 space-y-2">
                    <div class="flex items-center gap-2 text-3xs text-gray-500 font-semibold">
                        ${avatarImg}
                        <span class="text-gray-900 font-bold">${item.autor}</span>
                        <span>•</span> Publicado em vunno.eu
                    </div>
                    <h2 class="text-base font-bold text-gray-900 tracking-tight">${item.title}</h2>
                    ${conteudoHTML}
                    
                    <div class="pt-3 border-t border-gray-100 space-y-4">
                        <div class="text-3xs font-bold text-gray-500 uppercase flex items-center gap-4">
                            <span class="text-blue-600">💬 ${dbComentarios.filter(c => c.post_id === item.id).length} Comentários</span>
                            <button onclick="document.getElementById('comment-box-${item.id}').classList.toggle('hidden')" class="hover:text-black">Escrever Comentário</button>
                        </div>
                        
                        <div id="comment-box-${item.id}" class="hidden space-y-2">
                            <textarea id="comment-input-${item.id}" rows="2" placeholder="O que tens a dizer sobre isto?" class="w-full bg-gray-50 border border-gray-200 rounded-md p-2 text-xs outline-none focus:bg-white focus:border-blue-500 resize-none"></textarea>
                            <div class="flex justify-end"><button onclick="enviarComentario(${item.id}, null)" class="reddit-blue text-white text-3xs font-bold px-4 py-1.5 rounded-full">Comentar</button></div>
                        </div>

                        <div class="space-y-3 pt-2">${postComments.map(c => gerarHTMLComentario(c)).join('')}</div>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

function gerarHTMLComentario(c) {
    const respostas = dbComentarios.filter(r => r.parent_id === c.id);
    const cAvatar = c.avatar.startsWith('data:') ? `<img src="${c.avatar}" class="w-6 h-6 rounded-full object-cover">` : `<div class="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center text-2xs">${c.avatar}</div>`;
    
    return `
        <div class="bg-gray-50/60 p-2.5 rounded-md text-xs space-y-1 border border-gray-100">
            <div class="flex items-center gap-2 text-3xs text-gray-500">
                ${cAvatar}
                <span class="font-bold text-gray-900">${c.autor}</span>
            </div>
            <p class="text-gray-800 pl-1">${c.texto}</p>
            <button onclick="document.getElementById('reply-box-${c.id}').classList.toggle('hidden')" class="text-3xs text-gray-400 font-bold uppercase hover:text-black block pl-1">💬 Responder</button>
            
            <div id="reply-box-${c.id}" class="hidden space-y-2 pt-1 pl-2 border-l-2 border-gray-200">
                <input type="text" id="reply-input-${c.id}" placeholder="Escreve uma resposta pública..." class="w-full bg-white border border-gray-200 rounded p-1.5 text-2xs outline-none">
                <div class="flex justify-end"><button onclick="enviarComentario(${c.post_id}, ${c.id})" class="reddit-blue text-white text-3xs font-bold px-3 py-1 rounded-full">Responder</button></div>
            </div>
            ${respostas.length > 0 ? `<div class="space-y-2 pt-2 pl-3 border-l border-gray-200 flex flex-col gap-1">${respostas.map(r => gerarHTMLComentario(r)).join('')}</div>` : ''}
        </div>
    `;
}

async function enviarComentario(postId, parentId = null) {
    if (!user) return toggleModal('auth-modal');
    const input = document.getElementById(parentId ? `reply-input-${parentId}` : `comment-input-${postId}`);
    const texto = input.value.trim();
    if (!texto) return;

    const { error } = await _sup.from('comentarios').insert([{
        post_id: postId, parent_id: parentId, autor: user.name, avatar: user.avatar || '👤', texto: texto
    }]);

    if (!error) { input.value = ''; carregarFeed(); }
}
