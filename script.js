/**
 * @fileoverview Core Game Engine - QuizParty
 * Architecture: Modular State Machine & Mock Network Event Loop
 * Authorship: Production-grade Enterprise Architecture
 */

'use strict';

/**
 * @typedef {Object} Player
 * @property {string} id
 * @property {string} name
 * @property {number} score
 * @property {number|null} currentRating
 * @property {number|null} currentQuizAnswer
 * @property {boolean} isBot
 */
var GameConfig = {
    MAX_PLAYERS: 3,
    PROFESSION_PHASE_COUNT: 40,
    QUIZ_TIMER_DURATION: 10, // segundos
    BOT_LATENCY_MIN: 400,    // ms
    BOT_LATENCY_MAX: 1800    // ms
};

/**
 * Banco de Dados Estrito: 40 Profissões Detalhadas
 */
var PROFESSIONS_DATA = [
    { id: 1, name: "Engenheiro Informático", sector: "Tecnologia" },
    { id: 2, name: "Economista", sector: "Finanças" },
    { id: 3, name: "Médico", sector: "Saúde" },
    { id: 4, name: "Farmacêutico", sector: "Saúde" },
    { id: 5, name: "Piloto de F1", sector: "Desporto Automóvel" },
    { id: 6, name: "Jogador de Futebol", sector: "Desporto" },
    { id: 7, name: "Advogado", sector: "Jurídico" },
    { id: 8, name: "Arquiteto", sector: "Construção" },
    { id: 9, name: "Gestor de Marketing", sector: "Corporativo" },
    { id: 10, name: "Psicólogo", sector: "Saúde Mental" },
    { id: 11, name: "Cientista de Dados", sector: "Tecnologia" },
    { id: 12, name: "Designer de Moda", sector: "Artes" },
    { id: 13, name: "Chefe de Cozinha", sector: "Restauração" },
    { id: 14, name: "Jornalista", sector: "Comunicação" },
    { id: 15, name: "Veterinário", sector: "Saúde Animal" },
    { id: 16, name: "Engenheiro Civil", sector: "Construção" },
    { id: 17, name: "Biólogo Marinho", sector: "Ciência" },
    { id: 18, name: "Astrónomo", sector: "Ciência" },
    { id: 19, name: "Professor", sector: "Educação" },
    { id: 20, name: "Nutricionista", sector: "Saúde" },
    { id: 21, name: "Fisioterapeuta", sector: "Saúde" },
    { id: 22, name: "Piloto de Aviação", sector: "Transportes" },
    { id: 23, name: "Designer de Videojogos", sector: "Entretenimento" },
    { id: 24, name: "Ator", sector: "Artes" },
    { id: 25, name: "Músico", sector: "Artes" },
    { id: 26, name: "Fotógrafo", sector: "Média" },
    { id: 27, name: "Banqueiro de Investimento", sector: "Finanças" },
    { id: 28, name: "Corretor de Imóveis", sector: "Comercial" },
    { id: 29, name: "Criminologista", sector: "Investigação" },
    { id: 30, name: "Empreendedor", sector: "Negócios" },
    { id: 31, name: "Arqueólogo", sector: "Ciência" },
    { id: 32, name: "Tradutor Simultâneo", sector: "Linguística" },
    { id: 33, name: "Designer Gráfico", sector: "Artes" },
    { id: 34, name: "Especialista em Cibersegurança", sector: "Tecnologia" },
    { id: 35, name: "Engenheiro Aeroespacial", sector: "Engenharia" },
    { id: 36, name: "Geólogo", sector: "Ciência" },
    { id: 37, name: "Produtor Musical", sector: "Entretenimento" },
    { id: 38, name: "Youtuber / Streamer", sector: "Média Digital" },
    { id: 39, name: "Político", sector: "Governo" },
    { id: 40, name: "Treinador de Futebol", sector: "Desporto" }
];

/**
 * Banco de Dados de Perguntas do Quiz (Total Absoluto: 41 Perguntas Solicitadas)
 */
var QUIZ_DATA = [
    // --- ECONOMIA (Dificuldade: 6/10) ---
    { id: 1, category: "Economia", question: "Se a taxa de inflação de um país duplicar, o que acontece de forma imediata ao valor real da moeda?", options: ["Aumenta na mesma proporção", "Mantém-se inalterado", "Diminui o seu poder de compra", "Fica indexado ao ouro"], correct: 2 },
    { id: 2, category: "Economia", question: "O Produto Interno Bruto (PIB) de uma nação é tecnicamente definido como:", options: ["O total de ativos financeiros guardados nos bancos", "O valor de mercado de todos os bens e serviços finais produzidos num período", "A soma de todas as exportações menos as importações privadas", "O orçamento total do governo centralizado"], correct: 1 },
    { id: 3, category: "Economia", question: "A mecânica dos juros compostos difere dos juros simples porque:", options: ["Os juros incidem apenas sobre o capital inicial acumulado", "Os juros são calculados sobre o capital inicial acrescido dos juros acumulados", "As taxas diminuem ao longo do tempo de aplicação fixa", "São aplicados exclusivamente a fundos de alto risco imobiliário"], correct: 1 },
    { id: 4, category: "Economia", question: "O fenómeno da deflação estrutural na economia de mercado gera:", options: ["Uma queda generalizada e continuada dos preços de bens e serviços", "Um aumento descontrolado do consumo imediato", "A valorização imediata de commodities agrícolas", "A redução imediata da dívida soberana externa"], correct: 0 },
    { id: 5, category: "Economia", question: "A diversificação de uma carteira de investimentos tem como objetivo financeiro primário:", options: ["Garantir lucros fixos diários acima da média de mercado", "Eliminar por completo o risco sistémico do mercado global", "Mitigar o risco não-sistémico distribuindo os ativos por setores diferentes", "Evitar o pagamento de taxas alfandegárias internacionais"], correct: 2 },

    // --- FUTEBOL (Dificuldade: 7/10) ---
    { id: 6, category: "Futebol", question: "Que equipa histórica derrotou o AC Milan na final da UEFA Champions League de 1993?", options: ["Olympique de Marseille", "Barcelona", "Juventus", "Red Star Belgrade"], correct: 0 },
    { id: 7, category: "Futebol", question: "Qual é o único jogador do futebol mundial a conquistar três campeonatos mundiais da FIFA como atleta ativo?", options: ["Diego Maradona", "Pelé", "Garrincha", "Zinedine Zidane"], correct: 1 },
    { id: 8, category: "Futebol", question: "O recorde absoluto de golos numa única edição de um Campeonato do Mundo pertence a Just Fontaine. Quantos golos marcou?", options: ["10 golos", "11 golos", "13 golos", "15 golos"], correct: 2 },
    { id: 9, category: "Futebol", question: "Em que ano foi fundada a International Football Association Board (IFAB), órgão que dita as leis do futebol?", options: ["1886", "1904", "1930", "1954"], correct: 0 },
    { id: 10, category: "Futebol", question: "Quem foi o vencedor do prémio Ballon d'Or da France Football no ano de 2003?", options: ["Ronaldo Nazário", "Zinedine Zidane", "Pavel Nedvěd", "Thierry Henry"], correct: 2 },

    // --- BANDEIRAS (Dificuldade: 5/10) ---
    { id: 11, category: "Bandeiras", question: "A bandeira nacional do Canadá apresenta no seu centro uma folha de que árvore típica?", options: ["Carvalho", "Acer (Bordo)", "Pinheiro Silvestre", "Eucalipto"], correct: 1 },
    { id: 12, category: "Bandeiras", question: "Quais são as três cores horizontais que compõem a bandeira oficial da Alemanha de cima para baixo?", options: ["Preto, Vermelho, Amarelo", "Vermelho, Preto, Amarelo", "Preto, Amarelo, Vermelho", "Amarelo, Preto, Vermelho"], correct: 0 },
    { id: 13, category: "Bandeiras", question: "Que país asiático possui uma bandeira circular vermelha sobre um fundo totalmente verde?", options: ["Japão", "Bangladesh", "Palau", "Coreia do Sul"], correct: 1 },
    { id: 14, category: "Bandeiras", question: "A bandeira do Brasil contém uma faixa branca com que inscrição oficial?", options: ["União e Força", "Ordem e Progresso", "Liberdade e Igualdade", "Paz e Prosperidade"], correct: 1 },
    { id: 15, category: "Bandeiras", question: "Qual é o único país soberano cuja bandeira oficial tem um formato não quadrilátero?", options: ["Suíça", "Vaticano", "Nepal", "Mónaco"], correct: 2 },

    // --- PREÇO JUSTO: PRODUTO ANTI-VESPAS (1 Pergunta Especial) ---
    { id: 16, category: "Preço Justo", question: "Qual é o preço médio estimado de mercado em Portugal para um Spray Inseticida específico Contra Vespas de 750ml?", options: ["Entre 2.50€ e 4.50€", "Entre 7.00€ e 9.50€", "Entre 17.00€ e 22.00€", "Entre 29.00€ e 35.00€"], correct: 1 },

    // --- GRAMÁTICA PORTUGUESA: FUNÇÕES SINTÁTICAS (Dificuldade: 6/10) ---
    { id: 17, category: "Gramática", question: "Na frase 'O diretor considerou a proposta excelente', qual é a função sintática da palavra 'excelente'?", options: ["Modificador do Nome Apposto", "Complemento Direto", "Predicativo do Complemento Direto", "Predicativo do Sujeito"], correct: 2 },
    { id: 18, category: "Gramática", question: "Identifique a correta função sintática do elemento sublinhado em: 'O livro foi lido _pelo aluno_'.", options: ["Complemento Indireto", "Complemento Agente da Passiva", "Complemento Oblíquo", "Modificador do Grupo Verbal"], correct: 1 },
    { id: 19, category: "Gramática", question: "Na oração 'Lisboa, _capital de Portugal_, atrai milhares de turistas', o constituinte entre vírgulas é um:", options: ["Sujeito Composto", "Vocativo", "Modificador Aperitivo", "Modificador do Nome Apositivo"], correct: 3 },
    { id: 20, category: "Gramática", question: "Em 'Entreguei o relatório _ao gestor de projeto_', a expressão destacada desempenha a função de:", options: ["Complemento Direto", "Complemento Indireto", "Complemento Oblíquo", "Predicativo do Sujeito"], correct: 1 },
    { id: 21, category: "Gramática", question: "Na frase 'Ele reside _em Braga_', o constituinte sublinhado cumpre a função sintática gramatical de:", options: ["Complemento Oblíquo", "Modificador do Grupo Verbal", "Complemento Direto", "Predicativo do Sujeito"], correct: 0 },

    // --- FÍSICO-QUÍMICA (Dificuldade: 6/10) ---
    { id: 22, category: "Físico-Química", question: "De acordo com a Lei de Ohm, se mantivermos a resistência constante e duplicarmos a tensão, o que acontece à corrente?", options: ["Reduz para metade", "Mantém-se estável", "Duplica", "Quadruplica"], correct: 2 },
    { id: 23, category: "Físico-Química", question: "Qual é a aceleração aproximada da gravidade na superfície terrestre utilizada nos cálculos de física clássica?", options: ["9.81 m/s²", "1.62 m/s²", "3.71 m/s²", "12.4 m/s²"], correct: 0 },
    { id: 24, category: "Físico-Química", question: "A reação química de oxidação-redução envolve obrigatoriamente a transferência ativa de:", options: ["Protões", "Neutrões", "Eletrões", "Positões"], correct: 2 },
    { id: 25, category: "Físico-Química", question: "Qual das seguintes opções descreve uma mudança de estado físico designada por Condensação?", options: ["Sólido para Líquido", "Líquido para Gasoso", "Gasoso para Líquido", "Líquido para Sólido"], correct: 2 },
    { id: 26, category: "Físico-Química", question: "O elemento químico mais abundante no universo observável é o:", options: ["Oxigénio", "Hélio", "Azoto", "Hidrogénio"], correct: 3 },

    // --- CIÊNCIAS GERAIS (Dificuldade: 6/10) ---
    { id: 27, category: "Ciências", question: "Qual destas estruturas celulares é a responsável direta pela produção de energia (ATP) via respiração celular?", options: ["Complexo de Golgi", "Ribossoma", "Mitocôndria", "Lisossoma"], correct: 2 },
    { id: 28, category: "Ciências", question: "O processo biológico de divisão celular que origina quatro células-filhas haploides chama-se:", options: ["Mitose", "Meiose", "Fissão Binária", "Esporulação"], correct: 1 },
    { id: 29, category: "Ciências", question: "As ondas sonoras não se propagam em qual dos seguintes meios ambientais?", options: ["Água Salgada", "Aço Maciço", "Vácuo Absoluto", "Ar Atmosférico"], correct: 2 },
    { id: 30, category: "Ciências", question: "Que hormona humana é produzida pelo pâncreas para diminuir os níveis de glicose na corrente sanguínea?", options: ["Glucagom", "Adrenalina", "Insulina", "Cortisol"], correct: 2 },
    { id: 31, category: "Ciências", question: "A principal camada da atmosfera terrestre onde ocorrem quase todos os fenómenos meteorológicos é a:", options: ["Estratosfera", "Troposfera", "Mesosfera", "Termosfera"], correct: 1 },

    // --- EA SPORTS FC (Dificuldade: 6/10) ---
    { id: 32, category: "EA FC", question: "No Ultimate Team do EA FC, qual é o número máximo de pontos de química que um único jogador pode receber na sua carta?", options: ["3 pontos", "5 pontos", "10 pontos", "33 pontos"], correct: 0 },
    { id: 33, category: "EA FC", question: "Para realizar uma finta clássica estilo 'Elastico' no jogo, o jogador precisa de ter um nível mínimo de quantas estrelas de Skill Moves?", options: ["3 estrelas", "4 estrelas", "5 estrelas", "Não requer estrelas"], correct: 2 },
    { id: 34, category: "EA FC", question: "Qual é o nome do sistema tecnológico de animação e movimentação realista introduzido recentemente no motor de jogo do EA FC?", options: ["HyperMotionV", "Frostbite Evolution", "Impact Engine 2.0", "TruePhysics"], correct: 0 },
    { id: 35, category: "EA FC", question: "A sigla UT Champions (antiga WL) é jogada tradicionalmente durante que período da semana?", options: ["Segunda a Quarta", "Apenas às Quartas-feiras", "Sexta-feira a Segunda-feira", "Terça a Quinta"], correct: 2 },
    { id: 36, category: "EA FC", question: "Que tipo de remate é executado ao pressionar os botões mecânicos L1 + R1 (no PlayStation) juntamente com o botão de remate?", options: ["Remate em Jeito (Finesse)", "Remate Potente (Power Shot)", "Chapéu / Cavadinha", "Remate Rasteiro Manual"], correct: 1 },

    // --- FORMULA 1 (Dificuldade: 6/10) ---
    { id: 37, category: "Formula 1", question: "Qual destes pilotos detém a marca histórica de vencer o seu primeiro campeonato do mundo de F1 em 2008 de forma dramática na última curva de Interlagos?", options: ["Fernando Alonso", "Sebastian Vettel", "Lewis Hamilton", "Kimi Räikkönen"], correct: 2 },
    { id: 38, category: "Formula 1", question: "Que composto de pneu Pirelli é identificado pela cor oficial vermelha nos fins de semana normais de Grande Prémio?", options: ["Pneu Duro (Hard)", "Pneu Médio (Medium)", "Pneu Macio (Soft)", "Pneu de Chuva Extrema"], correct: 2 },
    { id: 39, category: "Formula 1", question: "Qual é o nome técnico do sistema de segurança obrigatório introduzido em 2018 para proteger o cockpit dos pilotos?", options: ["Aeroscreen", "Halo", "HANS Device", "Survival Cell"], correct: 1 },
    { id: 40, category: "Formula 1", question: "Em qual destes circuitos míticos da Europa localiza-se a famosa e ultra-rápida sequência de curvas Eau Rouge - Raidillon?", options: ["Monza", "Silverstone", "Spa-Francorchamps", "Nürburgring"], correct: 2 },
    { id: 41, category: "Formula 1", question: "O sistema DRS (Drag Reduction System) atua especificamente em que parte aerodinâmica do monolugar?", options: ["Asa Dianteira", "Difusor Traseiro", "Asa Traseira", "Entradas de Ar dos Pontões"], correct: 2 }
];

/**
 * GameState Engine Container
 */
var GameStateMachine = (function() {
    // Atributos Privados do Jogo
    var _playersList = [];
    var _userProfile = null;
    var _activeProfessionIndex = 0;
    var _activeQuizIndex = 0;
    var _quizIntervalClock = null;
    var _currentClockCountdown = 10;
    var _hasUserSubmittedRating = false;
    var _hasUserSubmittedQuiz = false;

    /**
     * Inicializador do Módulo de Jogo
     */
    function init() {
        _bindDOMEvents();
    }

    /**
     * Mapeamento de Eventos de Interface (DOM Listeners)
     */
    function _bindDOMEvents() {
        var btnEnter = document.getElementById('btn-enter');
        if (btnEnter) {
            btnEnter.addEventListener('click', _handleUserLogin);
        }
        var btnStart = document.getElementById('btn-start-game');
        if (btnStart) {
            btnStart.addEventListener('click', _startFirstPhase);
        }
    }

    /**
     * Tratamento de Entrada do Utilizador (Login Ecrã 1)
     */
    function _handleUserLogin() {
        var usernameInput = document.getElementById('username');
        if (!usernameInput) return;

        var cleanName = usernameInput.value.trim();
        if (cleanName.length < 2) {
            alert("Por favor, introduz um nome válido com pelo menos 2 caracteres.");
            return;
        }

        // Definição estrita dos 3 utilizadores da sala online
        _playersList = [
            { id: "user_main", name: cleanName, score: 0, currentRating: null, currentQuizAnswer: null, isBot: false },
            { id: "online_player_2", name: "Rodrigo (Online)", score: 0, currentRating: null, currentQuizAnswer: null, isBot: true },
            { id: "online_player_3", name: "Mafalda (Online)", score: 0, currentRating: null, currentQuizAnswer: null, isBot: true }
        ];

        _renderLobbyScreen();
    }

    /**
     * Renderização e Atualização do Lobby da Sala (Ecrã 2)
     */
    function _renderLobbyScreen() {
        var loginScreen = document.getElementById('screen-login');
        var lobbyScreen = document.getElementById('screen-lobby');
        var lobbyContainer = document.getElementById('lobby-players');
        var btnStart = document.getElementById('btn-start-game');

        if (loginScreen) loginScreen.classList.remove('active');
        if (lobbyScreen) lobbyScreen.classList.add('active');

        if (lobbyContainer) {
            lobbyContainer.innerHTML = '';
            _playersList.forEach(function(player) {
                var htmlRow = document.createElement('div');
                htmlRow.className = 'player-tag';
                htmlRow.innerHTML = '<span>👤 <strong>' + player.name + '</strong></span><span style="color: var(--success); font-weight:600;">● Conectado</span>';
                lobbyContainer.appendChild(htmlRow);
            });
        }

        // Simulação assíncrona de sincronização de rede da sala online
        setTimeout(function() {
            if (btnStart) {
                btnStart.disabled = false;
                btnStart.innerText = "Começar Jogo Party";
            }
        }, 1200);
    }

    /**
     * Transição e Inicialização da Fase 1: Profissões (Ecrã 3)
     */
    function _startFirstPhase() {
        var lobbyScreen = document.getElementById('screen-lobby');
        var professionsScreen = document.getElementById('screen-professions');

        if (lobbyScreen) lobbyScreen.classList.remove('active');
        if (professionsScreen) professionsScreen.classList.add('active');

        _generateRatingUI();
        _loadActiveProfession();
    }

    /**
     * Geração Estruturada dos Botões de Avaliação de 0 a 10
     */
    function _generateRatingUI() {
        var ratingContainer = document.getElementById('rating-container');
        if (!ratingContainer) return;
        ratingContainer.innerHTML = '';

        var _loop_assign = function(ratingValue) {
            var btn = document.createElement('button');
            btn.className = 'rating-btn';
            btn.innerText = ratingValue.toString();
            btn.addEventListener('click', function() {
                _executeRatingSubmission(ratingValue);
            });
            ratingContainer.appendChild(btn);
        };

        for (var i = 0; i <= 10; i++) {
            _loop_assign(i);
        }
    }

    /**
     * Carregamento da Profissão Atual
     */
    function _loadActiveProfession() {
        if (_activeProfessionIndex >= PROFESSIONS_DATA.length) {
            _startSecondPhase();
            return;
        }

        _hasUserSubmittedRating = false;
        var currentProf = PROFESSIONS_DATA[_activeProfessionIndex];
        
        // Elementos de Interface
        var counter = document.getElementById('prof-counter');
        var progress = document.getElementById('prof-progress');
        var profName = document.getElementById('current-profession-name');
        var targetText = document.getElementById('target-player-text');
        var statusBox = document.getElementById('prof-status');

        if (counter) counter.innerText = (_activeProfessionIndex + 1) + '/' + PROFESSIONS_DATA.length;
        if (progress) progress.style.width = ((_activeProfessionIndex + 1) / PROFESSIONS_DATA.length * 100) + '%';
        if (profName) profName.innerText = currentProf.name;

        // Atribuição Dinâmica: Roda o alvo da avaliação entre os 3 elementos da sala
        var targetPlayer = _playersList[_activeProfessionIndex % _playersList.length];
        
        if (targetText) {
            // Nota mandatória respeitando o nome introduzido pelo utilizador
            targetText.innerHTML = 'Avalia de 0 a 10 o quanto achas que o utilizador <strong>' + targetPlayer.name + '</strong> ia gostar de ter esta profissão!';
        }
        if (statusBox) statusBox.innerHTML = '<span style="color:var(--text-muted)">A aguardar votos da sala online...</span>';
    }

    /**
     * Submissão das Notas de Afinidade
     * @param {number} scoreAssigned
     */
    function _executeRatingSubmission(scoreAssigned) {
        if (_hasUserSubmittedRating) return;
        _hasUserSubmittedRating = true;

        _playersList[0].currentRating = scoreAssigned;
        var statusBox = document.getElementById('prof-status');
        if (statusBox) statusBox.innerHTML = '🎯 Tu votaste ' + scoreAssigned + '. A aguardar que os outros finalizem...';

        // Simulação assíncrona dos outros 2 jogadores em tempo real
        var networkDelay = Math.floor(Math.random() * (GameConfig.BOT_LATENCY_MAX - GameConfig.BOT_LATENCY_MIN)) + GameConfig.BOT_LATENCY_MIN;

        setTimeout(function() {
            _playersList[1].currentRating = Math.floor(Math.random() * 11);
            _playersList[2].currentRating = Math.floor(Math.random() * 11);

            // Algoritmo Próximo de Afinidade: Se o utilizador acertar na vizinhança da nota simulada, pontua bónus
            var actualTargetSecretWish = Math.floor(Math.random() * 11);
            _playersList.forEach(function(p) {
                if (Math.abs(p.currentRating - actualTargetSecretWish) <= 2) {
                    p.score += 15; // Recompensa de Sintonia Empática
                }
            });

            _activeProfessionIndex++;
            _loadActiveProfession();
        }, networkDelay);
    }

    /**
     * Transição e Inicialização da Fase 2: Quiz Síncrono (Ecrã 4)
     */
    function _startSecondPhase() {
        var professionsScreen = document.getElementById('screen-professions');
        var quizScreen = document.getElementById('screen-quiz');

        if (professionsScreen) professionsScreen.classList.remove('active');
        if (quizScreen) quizScreen.classList.add('active');

        _activeQuizIndex = 0;
        _loadQuizQuestion();
    }

    /**
     * Carregamento da Pergunta Ativa do Quiz Cronometrado
     */
    function _loadQuizQuestion() {
        if (_activeQuizIndex >= QUIZ_DATA.length) {
            _finishEntireGameParty();
            return;
        }

        _hasUserSubmittedQuiz = false;
        _playersList.forEach(function(p) { p.currentQuizAnswer = null; });

        // Limpeza Visual de Controlos Relacionados
        var correctionBox = document.getElementById('correction-box');
        var feedbackBox = document.getElementById('quiz-feedback');
        if (correctionBox) correctionBox.classList.add('hidden');
        if (feedbackBox) feedbackBox.innerHTML = '';

        var currentQuestion = QUIZ_DATA[_activeQuizIndex];

        // Atualização dos elementos informativos
        var badge = document.getElementById('category-badge');
        var questionText = document.getElementById('quiz-question-text');
        var optionsGrid = document.getElementById('quiz-options');

        if (badge) badge.innerText = 'Tópico: ' + currentQuestion.category + ' (' + (_activeQuizIndex + 1) + '/' + QUIZ_DATA.length + ')';
        if (questionText) questionText.innerText = currentQuestion.question;

        if (optionsGrid) {
            optionsGrid.innerHTML = '';
            currentQuestion.options.forEach(function(optionString, indexOption) {
                var btnOpt = document.createElement('button');
                btnOpt.className = 'option-btn';
                btnOpt.innerText = (indexOption + 1) + '. ' + optionString;
                btnOpt.addEventListener('click', function() {
                    _submitQuizChoice(indexOption);
                });
                optionsGrid.appendChild(btnOpt);
            });
        }

        _startClockCountdown();
    }

    /**
     * Inicializador do Relógio Cronómetro de 10 segundos por pergunta
     */
    function _startClockCountdown() {
        if (_quizIntervalClock) clearInterval(_quizIntervalClock);
        _currentClockCountdown = GameConfig.QUIZ_TIMER_DURATION;

        var timerText = document.getElementById('timer-text');
        if (timerText) timerText.innerText = _currentClockCountdown.toString();

        _quizIntervalClock = setInterval(function() {
            _currentClockCountdown--;
            if (timerText) timerText.innerText = _currentClockCountdown.toString();

            if (_currentClockCountdown <= 0) {
                clearInterval(_quizIntervalClock);
                _forceQuizResolutionDueToTimeout();
            }
        }, 1000);
    }

    /**
     * Evento Ativado pela Escolha do Utilizador Ativo
     * @param {number} selectedIndex
     */
    function _submitQuizChoice(selectedIndex) {
        if (_hasUserSubmittedQuiz) return;
        _hasUserSubmittedQuiz = true;
        clearInterval(_quizIntervalClock);

        _playersList[0].currentQuizAnswer = selectedIndex;
        _resolveOnlinePlayersAnswers();
    }

    /**
     * Execução Imperativa do Fim do Tempo Limite (Estouro do Cronómetro)
     */
    function _forceQuizResolutionDueToTimeout() {
        _hasUserSubmittedQuiz = true;
        _playersList[0].currentQuizAnswer = -1; // Flag de penalização sem resposta
        _resolveOnlinePlayersAnswers();
    }

    /**
     * Simulação em Tempo Real do Input dos Outros Jogadores Online
     */
    function _resolveOnlinePlayersAnswers() {
        var currentQuestion = QUIZ_DATA[_activeQuizIndex];

        // Determinação dos palpites dos bots em paralelo com base na resposta correta
        _playersList.forEach(function(player) {
            if (player.isBot) {
                var randomChance = Math.random();
                // 65% de probabilidade do bot simular a resposta certa
                if (randomChance > 0.35) {
                    player.currentQuizAnswer = currentQuestion.correct;
                } else {
                    player.currentQuizAnswer = Math.floor(Math.random() * 4);
                }
            }
        });

        // Verificação e Atribuição Consecutiva de Pontuação
        _playersList.forEach(function(player) {
            if (player.currentQuizAnswer === currentQuestion.correct) {
                player.score += 25; // Pontos por Acerto Técnico
            }
        });

        _displayQuizResolutionLayout();
    }

    /**
     * Renderização do Feedback das Respostas da Sala e Caixa de Correção Oficial
     */
    function _displayQuizResolutionLayout() {
        var currentQuestion = QUIZ_DATA[_activeQuizIndex];
        var feedbackBox = document.getElementById('quiz-feedback');
        var correctionBox = document.getElementById('correction-box');
        var correctionText = document.getElementById('correction-text');

        if (feedbackBox) {
            feedbackBox.innerHTML = _playersList.map(function(p) {
                var textAnswer = p.currentQuizAnswer === -1 ? 'Sem tempo limite ❌' : 'Opção ' + (p.currentQuizAnswer + 1);
                var statusColor = p.currentQuizAnswer === currentQuestion.correct ? 'var(--success)' : 'var(--accent)';
                return '<div style="padding:4px 0;">👤 <strong style="color:' + statusColor + '">' + p.name + '</strong> escolheu: ' + textAnswer + '</div>';
            }).join('');
        }

        if (correctionBox && correctionText) {
            var correctStringValue = currentQuestion.options[currentQuestion.correct];
            correctionText.innerHTML = '<strong>Explicação Gramatical / Gabinete Técnico:</strong> A resposta exata é a alternativa <strong>' + (currentQuestion.correct + 1) + ') ' + correctStringValue + '</strong>.';
            correctionBox.classList.remove('hidden');
        }

        // Delay Mandatório de visualização de 3.5 segundos antes de passar à próxima ronda
        setTimeout(function() {
            _activeQuizIndex++;
            _loadQuizQuestion();
        }, 3500);
    }

    /**
     * Ecrã Final: Apresentação do Quadro de Honra e Scoreboard (Ecrã 5)
     */
    function _finishEntireGameParty() {
        var quizScreen = document.getElementById('screen-quiz');
        var resultsScreen = document.getElementById('screen-results');
        var scoreboard = document.getElementById('final-scoreboard');

        if (quizScreen) quizScreen.classList.remove('active');
        if (resultsScreen) resultsScreen.classList.add('active');

        // Ordenação Decrescente Profissional dos Jogadores
        var sortedRanking = [].concat(_playersList).sort(function(alpha, beta) {
            return beta.score - alpha.score;
        });

        if (scoreboard) {
            scoreboard.innerHTML = '';
            sortedRanking.forEach(function(p, i) {
                var item = document.createElement('div');
                item.className = 'player-tag';
                if (i === 0) {
                    item.style.borderColor = 'var(--success)';
                    item.style.background = 'rgba(16, 185, 129, 0.08)';
                }
                item.innerHTML = '<span><strong>#' + (i + 1) + '</strong> ' + p.name + '</span><strong>' + p.score + ' Pts</strong>';
                scoreboard.appendChild(item);
            });
        }
    }

    return {
        start: init
    };
})();

// Ativação Segura do Motor de Jogo após o carregamento da Janela DOM
window.addEventListener('DOMContentLoaded', function() {
    GameStateMachine.start();
});
