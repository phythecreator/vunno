<!DOCTYPE html>
<html lang="pt">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>vunno.eu - Greve Geral</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
    <style>
        body { background-color: #DAE0E6; color: #1A1A1B; font-family: Arial, sans-serif; }
        .reddit-border { border: 1px solid #ccc; }
        .reddit-blue { background-color: #0079D3; }
    </style>
</head>
<body class="min-h-screen flex flex-col">

    <header class="bg-white h-12 border-b border-gray-300 sticky top-0 z-50 flex items-center justify-between px-5 shadow-xs">
        <div class="flex items-center gap-3 cursor-pointer" onclick="window.location.reload()">
            <span class="text-orange-500 text-2xl font-black tracking-tighter">v/</span>
            <span class="font-bold text-lg tracking-tight">vunno</span>
        </div>
        <div id="user-profile">
            <button onclick="toggleModal('auth-modal')" class="reddit-blue text-white text-sm font-bold h-8 px-5 rounded-full hover:opacity-90 transition-all">Entrar</button>
        </div>
    </header>

    <div class="w-full h-36 bg-cover bg-center" style="background-image: url('https://images.unsplash.com/photo-1555881400-74d7acaacd8b?q=80&w=1600');"></div>

    <div class="bg-white border-b border-gray-300 mb-5">
        <div class="max-w-4xl mx-auto px-4 flex items-end justify-between pb-4 -mt-6">
            <div class="flex items-end gap-4">
                <div id="avatar-display-main" class="w-20 h-20 rounded-full border-4 border-white shadow-md bg-gray-200 overflow-hidden flex items-center justify-center text-3xl cursor-pointer" onclick="toggleModal('avatar-modal')">👤</div>
                <div class="mb-1">
                    <h1 class="text-2xl font-bold tracking-tight">Greve Geral: Comunidade</h1>
                    <p class="text-xs text-gray-500">Espaço público de debate e sondagens em tempo real</p>
                </div>
            </div>
            <div class="flex gap-2">
                <button onclick="abrirCriador('text')" class="border border-blue-500 text-blue-500 text-xs font-bold h-9 px-4 rounded-full hover:bg-blue-50">Criar Post</button>
                <button onclick="abrirCriador('poll')" class="reddit-blue text-white text-xs font-bold h-9 px-4 rounded-full hover:opacity-90">Criar Poll</button>
            </div>
        </div>
    </div>

    <main class="max-w-4xl w-full mx-auto px-4 flex-1 pb-12">
        <div id="main-feed" class="space-y-4"></div>
    </main>

    <div id="auth-modal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
        <div class="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 class="text-xl font-bold">Entrar na Comunidade</h3>
            <div class="space-y-2 text-sm">
                <label class="block font-semibold text-gray-600">Pseudónimo</label>
                <input type="text" id="auth-username" placeholder="ex: Viajante77" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500">
                <label class="block font-semibold text-gray-600 mt-2">Email</label>
                <input type="email" id="auth-email" placeholder="teu@email.com" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500">
            </div>
            <div class="flex gap-2 justify-end pt-2">
                <button onclick="toggleModal('auth-modal')" class="text-xs font-bold px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onclick="executarAuth()" class="reddit-blue text-white text-xs font-bold px-5 py-2 rounded-full">Entrar</button>
            </div>
        </div>
    </div>

    <div id="avatar-modal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-sm p-6 space-y-4 shadow-xl">
            <h3 class="text-xl font-bold">Foto de Perfil</h3>
            <p class="text-xs text-gray-500">Carrega uma imagem do teu computador para usar em todas as publicações.</p>
            <div class="flex flex-col items-center gap-4 py-2">
                <div id="avatar-preview-box" class="w-24 h-24 rounded-full bg-gray-100 border-2 border-gray-300 overflow-hidden flex items-center justify-center text-gray-400 text-3xl">👤</div>
                <input type="file" id="avatar-file-input" accept="image/*" class="text-xs text-gray-600 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100">
            </div>
            <div class="flex justify-end pt-2">
                <button onclick="toggleModal('avatar-modal')" class="reddit-blue text-white text-xs font-bold h-9 px-6 rounded-full shadow">Concluído</button>
            </div>
        </div>
    </div>

    <div id="create-modal" class="hidden fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
        <div class="bg-white rounded-xl w-full max-w-lg p-6 space-y-4 shadow-xl">
            <h3 class="text-xl font-bold" id="create-modal-title">Nova Publicação</h3>
            <div class="space-y-3 text-sm">
                <input type="text" id="post-title-input" placeholder="Título da publicação" class="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 font-semibold">
                
                <textarea id="post-content-input" rows="4" placeholder="Texto do teu post (opcional)..." class="w-full border border-gray-300 rounded-lg p-2.5 outline-none focus:border-blue-500 resize-none"></textarea>
                
                <div id="poll-options-setup" class="hidden space-y-2">
                    <span class="block text-xs font-bold text-gray-500 uppercase">Opções de Votação (Até 5)</span>
                    <input type="text" class="poll-opt-input w-full border border-gray-300 rounded-md p-2 text-xs" placeholder="Opção 1">
                    <input type="text" class="poll-opt-input w-full border border-gray-300 rounded-md p-2 text-xs" placeholder="Opção 2">
                    <input type="text" class="poll-opt-input w-full border border-gray-300 rounded-md p-2 text-xs" placeholder="Opção 3 (Opcional)">
                    <input type="text" class="poll-opt-input w-full border border-gray-300 rounded-md p-2 text-xs" placeholder="Opção 4 (Opcional)">
                    <input type="text" class="poll-opt-input w-full border border-gray-300 rounded-md p-2 text-xs" placeholder="Opção 5 (Opcional)">
                </div>
            </div>
            <div class="flex gap-2 justify-end pt-2">
                <button onclick="toggleModal('create-modal')" class="text-xs font-bold px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg">Cancelar</button>
                <button onclick="publicarConteudo()" class="reddit-blue text-white text-xs font-bold px-6 py-2 rounded-full">Publicar</button>
            </div>
        </div>
    </div>

    <script src="app.js"></script>
</body>
</html>
