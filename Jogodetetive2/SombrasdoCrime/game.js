/*
 * O DETETIVE — Lógica do jogo
 *
 * Este ficheiro controla tudo o que acontece no jogo:
 * - A intro dramática do caso (cinemática)
 * - A música de fundo (feita com Web Audio, sem ficheiros mp3)
 * - O assassino é sorteado aleatoriamente a cada partida
 * - As perguntas, respostas e pistas dos interrogatórios
 * - O quadro de dedução (combinar pistas = novas conclusões)
 * - A pontuação, ranking e reputação do jogador
 * - As notas pessoais do jogador (guardadas no navegador)
 * - Notificações e partilha de resultado
 */

// --- Valores fixos do jogo ---
const MAX_WRONG   = 3;      // máximo de acusações erradas antes de perder
const SCORE_BASE  = 1000;   // pontos iniciais
const SCORE_WRONG = 200;    // pontos perdidos por cada erro
const SCORE_CLUE  = 40;     // pontos ganhos por cada pista
const SCORE_DEDUCTION = 80; // pontos ganhos por cada dedução
// Rankings possíveis: quanto mais pontos, melhor o título
const RANKS = [
  { min: 1100, label: 'Detetive Lendário',    icon: '🏆', stars: 5 },
  { min:  850, label: 'Inspector Habilidoso', icon: '🥇', stars: 4 },
  { min:  600, label: 'Agente Competente',    icon: '🥈', stars: 3 },
  { min:  350, label: 'Investigador Novato',  icon: '🥉', stars: 2 },
  { min:    0, label: 'Aprendiz',             icon: '🔍', stars: 1 },
];

// --- Estado do jogo (tudo o que muda durante uma partida) ---
let state = {
  caseIndex:        0,
  murdererIndex:    -1,
  clues:            [],        // { suspectId, suspectName, text, isKey }
  deductions:       [],        // conclusões descobertas
  wrongAccusations: 0,
  usedQuestions:    {},        // { suspectId: [idx, ...] }
  allAnswers:       {},        // { suspectId: [{q, a, revealedClue}, ...] }
  currentSuspect:   null,
  deductionSlots:   { a: null, b: null },  // pistas selecionadas
  clueFilter:       'all',
  startTime:        null,
  timerInterval:    null,
  gameOver:         false,
  lastResult:       null,      // para partilhar
};

// Carrega a reputação guardada no navegador (progresso entre jogos)
let reputation = loadReputation();

// --- Motor de som (gera a música ambiente sem precisar de ficheiros) ---
let audioCtx = null;
let masterGain = null;
let audioNodes = [];
let soundEnabled = false;

// Inicia o sistema de áudio (só funciona após interação do utilizador)
function initAudio() {
  if (audioCtx) return;
  try {
    audioCtx  = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = audioCtx.createGain();
    masterGain.gain.value = soundEnabled ? 0.18 : 0;
    masterGain.connect(audioCtx.destination);
    scheduleAmbient();
  } catch(e) { /* sem suporte */ }
}

// Agenda os sons ambientes para criar o clima noir
function scheduleAmbient() {
  if (!audioCtx) return;
  // Sons graves contínuos que criam a atmosfera
  playDronePad(55,  20, 0);
  playDronePad(82,  16, 4);
  playDronePad(110, 12, 8);
  // Notas aleatórias tipo piano de jazz
  schedulePianoNotes();
}

// Toca um som grave contínuo (cria aquela vibração de fundo)
function playDronePad(freq, duration, startDelay) {
  if (!audioCtx) return;
  const osc  = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  osc.type = 'sine';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0, audioCtx.currentTime + startDelay);
  gain.gain.linearRampToValueAtTime(0.25, audioCtx.currentTime + startDelay + 3);
  gain.gain.linearRampToValueAtTime(0,    audioCtx.currentTime + startDelay + duration);
  osc.connect(gain);
  gain.connect(masterGain);
  osc.start(audioCtx.currentTime + startDelay);
  osc.stop(audioCtx.currentTime  + startDelay + duration);
  // Quando acaba, repete automaticamente
  setTimeout(() => playDronePad(freq, duration, 0), (startDelay + duration) * 1000 + 2000);
}

// Toca notas soltas de "piano" em intervalos aleatórios
function schedulePianoNotes() {
  if (!audioCtx) return;
  const jazzNotes = [196, 220, 246, 261, 293, 329, 349, 392];
  const play = () => {
    if (!audioCtx || !soundEnabled) { setTimeout(play, 3000); return; }
    const freq = jazzNotes[Math.floor(Math.random() * jazzNotes.length)];
    const osc  = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.type = 'triangle';
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 1.2);
    osc.connect(gain);
    gain.connect(masterGain);
    osc.start();
    osc.stop(audioCtx.currentTime + 1.2);
    setTimeout(play, 1500 + Math.random() * 4000);
  };
  setTimeout(play, 2000);
}

// Toca efeitos sonoros específicos (pista, erro, vitória, dedução)
function playSound(type) {
  if (!audioCtx || !soundEnabled) return;
  const ctx = audioCtx;
  const g   = ctx.createGain();
  g.connect(masterGain);
  if (type === 'clue') {
    // Som agudo quando descobre uma pista
    const o = ctx.createOscillator();
    o.type = 'sine'; o.frequency.value = 880;
    g.gain.setValueAtTime(0.5, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    o.connect(g); o.start(); o.stop(ctx.currentTime + 0.6);
  } else if (type === 'wrong') {
    // Som grave quando erra uma acusação
    const o = ctx.createOscillator();
    o.type = 'sawtooth'; o.frequency.value = 120;
    g.gain.setValueAtTime(0.4, ctx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.8);
    o.connect(g); o.start(); o.stop(ctx.currentTime + 0.8);
  } else if (type === 'victory') {
    // Fanfarra quando resolve o caso!
    [523, 659, 784, 1046].forEach((f, i) => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'triangle'; o2.frequency.value = f;
      g2.gain.setValueAtTime(0, ctx.currentTime + i * 0.15);
      g2.gain.linearRampToValueAtTime(0.4, ctx.currentTime + i * 0.15 + 0.05);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.15 + 0.4);
      o2.connect(g2); g2.connect(masterGain);
      o2.start(ctx.currentTime + i * 0.15);
      o2.stop(ctx.currentTime  + i * 0.15 + 0.4);
    });
  } else if (type === 'deduce') {
    [440, 550].forEach((f, i) => {
      const o2 = ctx.createOscillator();
      const g2 = ctx.createGain();
      o2.type = 'sine'; o2.frequency.value = f;
      g2.gain.setValueAtTime(0.3, ctx.currentTime + i * 0.2);
      g2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + i * 0.2 + 0.5);
      o2.connect(g2); g2.connect(masterGain);
      o2.start(ctx.currentTime + i * 0.2);
      o2.stop(ctx.currentTime  + i * 0.2 + 0.5);
    });
  }
}

// Liga ou desliga a música de fundo
function toggleSound() {
  soundEnabled = !soundEnabled;
  if (!audioCtx) initAudio();
  if (masterGain) masterGain.gain.setTargetAtTime(soundEnabled ? 0.18 : 0, audioCtx.currentTime, 0.5);
  document.getElementById('sound-btn').textContent = soundEnabled ? '🔊' : '🔇';
  showToast(soundEnabled ? '🎵 Música activada' : '🔇 Música desactivada');
}

// --- Quando a página carrega, prepara tudo ---
window.addEventListener('DOMContentLoaded', () => {
  renderCaseSelector();
  renderReputationBar();
  loadNotesFromStorage();
});

// --- Criar os cartões de seleção de caso ---
// Mostra os casos disponíveis no ecrã inicial
function renderCaseSelector() {
  const container = document.getElementById('case-cards');
  container.innerHTML = CASES.map((c, i) => {
    const solved  = reputation.solvedCases[c.id];
    const selText = solved ? `<div class="case-solved">✓ Resolvido · Melhor pontuação: ${solved.bestScore}</div>` : '';
    return `
      <div class="case-card ${i === 0 ? 'selected' : ''}" id="case-card-${i}" onclick="selectCase(${i})">
        <div class="case-title">${c.icon} ${c.title}</div>
        <div class="case-meta">📍 ${c.setting} · ${c.difficulty}</div>
        <div class="case-intro">${c.intro}</div>
        ${selText}
      </div>`;
  }).join('');
}

// Quando o jogador clica num caso para o selecionar
function selectCase(index) {
  state.caseIndex = index;
  document.querySelectorAll('.case-card').forEach((el, i) => {
    el.classList.toggle('selected', i === index);
  });
}

// --- Começar uma nova partida ---
// Tudo o que acontece quando o jogador carrega em "Iniciar"
function startGame() {
  initAudio();

  const c = CASES[state.caseIndex];
  const murdererIndex = randomInt(c.suspects.length);
  c._fixedMurderer = murdererIndex;

  state = {
    caseIndex:        state.caseIndex,
    murdererIndex,
    clues:            [],
    deductions:       [],
    wrongAccusations: 0,
    usedQuestions:    {},
    allAnswers:       {},
    currentSuspect:   null,
    deductionSlots:   { a: null, b: null },
    clueFilter:       'all',
    startTime:        null,
    timerInterval:    null,
    gameOver:         false,
    lastResult:       null,
  };
  c.suspects.forEach(s => { state.usedQuestions[s.id] = []; state.allAnswers[s.id] = []; });

  // Mostra a intro dramática antes de começar
  showCinematic(c, () => {
    state.startTime = Date.now();
    startTimer();
    renderCaseHeaderBar();
    renderSuspectsGrid();
    renderClueBoard();
    renderDeductionBoard();
    updateStatusBar();
    showScreen('screen-investigate');
    switchTab('tab-suspects', document.querySelector('.tab'));
  });
}

// --- Animação de abertura do caso ---
let cinematicCallback = null;
let cinematicTimer   = null;

// Mostra a cena de abertura com animações das frases
function showCinematic(c, callback) {
  cinematicCallback = callback;
  const el = document.getElementById('cinematic');
  el.classList.remove('hidden');

  document.getElementById('cin-location').textContent = `📍 ${c.setting}`;
  document.getElementById('cin-title').textContent    = c.title;
  document.getElementById('cin-victim').innerHTML =
    `${c.victimIcon} VÍTIMA: ${c.victim}`;

  // Cria as frases dramáticas
  const linesEl = document.getElementById('cin-lines');
  linesEl.innerHTML = c.openingLines.map(l => `<div class="cin-line">${l}</div>`).join('');

  // Mostra cada frase uma a uma
  const lines = linesEl.querySelectorAll('.cin-line');
  lines.forEach((line, i) => {
    setTimeout(() => line.classList.add('active'), 1200 + i * 700);
  });

  // Se o jogador não carregar, avança sozinho
  cinematicTimer = setTimeout(skipCinematic, 1200 + lines.length * 700 + 3500);
}

// Salta a cinemática e vai direto ao jogo
function skipCinematic() {
  clearTimeout(cinematicTimer);
  const el = document.getElementById('cinematic');
  el.style.opacity = '0';
  el.style.transition = 'opacity 0.6s ease';
  setTimeout(() => {
    el.classList.add('hidden');
    el.style.opacity = '';
    el.style.transition = '';
    if (cinematicCallback) { cinematicCallback(); cinematicCallback = null; }
  }, 600);
}

// --- Cronómetro do jogo ---
// Inicia o relógio que conta o tempo de jogo
function startTimer() {
  clearInterval(state.timerInterval);
  state.timerInterval = setInterval(() => {
    if (state.gameOver) { clearInterval(state.timerInterval); return; }
    const el = document.getElementById('timer-display');
    if (el) el.textContent = `⏱ ${formatTime(elapsedSeconds())}`;
  }, 1000);
}

// Transforma segundos em formato "minutos:segundos"
function formatTime(secs) {
  const m = Math.floor(secs / 60);
  const s = secs % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

// Calcula quantos segundos já passaram desde o início
function elapsedSeconds() {
  if (!state.startTime) return 0;
  return Math.floor((Date.now() - state.startTime) / 1000);
}

// --- Navegar entre ecrãs e abas ---
// Mostra um ecrã e esconde os outros
function showScreen(id) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  document.getElementById(id).classList.add('active');
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Muda de aba (Suspeitos, Evidências, etc.)
function switchTab(tabId, btn) {
  document.querySelectorAll('.tab-content').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  document.getElementById(tabId).classList.add('active');
  if (btn) btn.classList.add('active');
}

// Volta ao ecrã inicial para jogar de novo
function resetGame() {
  clearInterval(state.timerInterval);
  renderCaseSelector();
  renderReputationBar();
  showScreen('screen-start');
}

// --- Atualiza a barra de estado no topo ---
// Mostra as pistas encontradas e erros cometidos
function updateStatusBar() {
  const c = currentCase();
  document.getElementById('status-case').textContent  = `🕵️ ${c.title}`;
  document.getElementById('clue-count').textContent   = state.clues.length;

  const pipsEl = document.getElementById('wrong-pips');
  pipsEl.innerHTML = Array.from({ length: MAX_WRONG }, (_, i) =>
    `<span class="wrong-pip ${i < state.wrongAccusations ? 'used' : ''}"></span>`
  ).join('');

  // Atualiza o número na aba de evidências
  const badge = document.getElementById('clue-tab-count');
  if (badge) {
    badge.textContent = state.clues.length || '';
    badge.classList.toggle('hidden', state.clues.length === 0);
  }
}

// --- Cabeçalho do caso (ícone, título, vítima) ---
function renderCaseHeaderBar() {
  const c = currentCase();
  document.getElementById('case-header-bar').innerHTML = `
    <div class="case-header-bar">
      <div class="ch-icon">${c.icon}</div>
      <div>
        <h3>${c.title}</h3>
        <p>📍 ${c.setting} · Vítima: ${c.victim}</p>
      </div>
    </div>`;
}

// --- Grelha com os cartões dos suspeitos ---
// Desenha os cartões de cada suspeito no ecrã
function renderSuspectsGrid() {
  const c    = currentCase();
  const grid = document.getElementById('suspects-grid');
  grid.innerHTML = c.suspects.map(s => {
    const clueCount = state.clues.filter(cl => cl.suspectId === s.id).length;
    const usedQ     = state.usedQuestions[s.id] || [];
    const allDone   = usedQ.length === s.questions.length;
    return `
      <div class="suspect-card" onclick="interrogate(${s.id})" title="Interrogar ${s.name}">
        ${clueCount > 0 ? `<div class="clue-badge">${clueCount}</div>` : ''}
        ${allDone     ? `<div class="done-badge">✓</div>` : ''}
        <span class="avatar">${s.avatar}</span>
        <div class="name">${s.name}</div>
        <div class="role">${s.role}</div>
      </div>`;
  }).join('');
}

// --- Interrogatório (perguntas e respostas) ---
// Abre o interrogatório de um suspeito
function interrogate(suspectId) {
  if (state.gameOver) return;
  const c = currentCase();
  const s = c.suspects.find(x => x.id === suspectId);
  if (!s) return;
  state.currentSuspect = suspectId;

  const usedQ = state.usedQuestions[suspectId] || [];

  // Verifica se este suspeito reage a pistas já descobertas
  const crossHTML = buildCrossReactionHint(s);

  const questionsHTML = s.questions.map((q, i) => {
    const used    = usedQ.includes(i);
    const hasClue = used && q.revealClue;
    return `
      <button class="question-btn ${hasClue ? 'revealed' : ''}"
        onclick="askQuestion(${suspectId}, ${i})" ${used ? 'disabled' : ''}>
        ${used ? '✓ ' : ''}${q.q}
      </button>`;
  }).join('');

  document.getElementById('interrogation-content').innerHTML = `
    <div class="interrogation-header">
      <div class="big-avatar">${s.avatar}</div>
      <div>
        <h3>${s.name}</h3>
        <div class="suspect-role">${s.role}</div>
        <div class="alibi-box"><strong>Alibi declarado:</strong> "${s.alibi}"</div>
      </div>
    </div>
    ${crossHTML}
    <div class="section-label">Perguntas</div>
    <div class="questions-list" id="questions-list-${suspectId}">${questionsHTML}</div>
    <div id="answer-area"></div>`;

  // Mostra o histórico de respostas anteriores
  renderAnswerHistory(suspectId);
  showScreen('screen-interrogate');
}

// Verifica se o suspeito tem algo a dizer sobre pistas de outros
function buildCrossReactionHint(s) {
  const reactions = [];
  s.questions.forEach(q => {
    if (!q.crossReaction) return;
    const trigger = state.clues.find(cl => cl.text === q.crossReaction.triggeredByClue);
    if (trigger) reactions.push(q.crossReaction.reaction);
  });
  if (reactions.length === 0) return '';
  return reactions.map(r => `
    <div class="answer-box" style="margin-bottom:12px">
      <strong>⚡ Reação a nova evidência:</strong> "${r}"
    </div>`).join('');
}

// Quando o jogador faz uma pergunta ao suspeito
function askQuestion(suspectId, questionIndex) {
  if (state.gameOver) return;
  const c = currentCase();
  const s = c.suspects.find(x => x.id === suspectId);
  const q = s.questions[questionIndex];

  if (!state.usedQuestions[suspectId]) state.usedQuestions[suspectId] = [];
  if (!state.usedQuestions[suspectId].includes(questionIndex)) {
    state.usedQuestions[suspectId].push(questionIndex);
  }

  // Guarda a resposta no histórico
  if (!state.allAnswers[suspectId]) state.allAnswers[suspectId] = [];
  state.allAnswers[suspectId].push({ q: q.q, a: q.a, revealedClue: q.revealClue ? q.clueText : null });

  // Se a resposta contém uma pista, adiciona ao quadro
  let clueFlashHTML = '';
  if (q.revealClue && q.clueText) {
    const already = state.clues.find(cl => cl.text === q.clueText);
    if (!already) {
      state.clues.push({ suspectId, suspectName: s.name, text: q.clueText, isKey: !!q.isKeyClue });
      playSound('clue');
      renderClueBoard();
      renderSuspectsGrid();
      updateStatusBar();
      checkDeductionUnlocks();
      clueFlashHTML = `
        <div class="clue-flash">
          ${q.isKeyClue ? '⭐' : '🔍'} Nova pista adicionada ao Quadro de Evidências!
        </div>`;
      showToast(`${q.isKeyClue ? '⭐' : '🔍'} Nova pista descoberta!`);
    }
  }

  // Marca o botão como já usado
  const btn = document.querySelector(`#questions-list-${suspectId} .question-btn:nth-child(${questionIndex + 1})`);
  if (btn) { btn.disabled = true; if (q.revealClue) btn.classList.add('revealed'); }

  document.getElementById('answer-area').innerHTML = `
    <div class="answer-box">
      <strong>${s.name}:</strong>
      "${q.a}"
    </div>
    ${clueFlashHTML}`;

  renderAnswerHistory(suspectId);
}

// --- Mostra o histórico de perguntas e respostas ---
function renderAnswerHistory(suspectId) {
  const answers = state.allAnswers[suspectId] || [];
  const panel   = document.getElementById('answer-history-panel');
  const list    = document.getElementById('answer-history-list');
  if (answers.length === 0) { panel.classList.add('hidden'); return; }
  panel.classList.remove('hidden');
  list.innerHTML = answers.map(a => `
    <div class="history-item">
      <div class="history-q">— ${a.q}</div>
      <div class="history-a">"${a.a}"${a.revealedClue ? ` <span style="color:var(--gold);font-size:.75rem"> [pista revelada]</span>` : ''}</div>
    </div>`).join('');
}

// --- Quadro de pistas (aba de Evidências) ---
function renderClueBoard() {
  renderClueBoardFull();
}

// Desenha a lista completa de pistas com filtros
function renderClueBoardFull() {
  const c     = currentCase();
  const list  = document.getElementById('clues-list-full');
  const filtersEl = document.getElementById('clue-filters');

  const filtered = state.clueFilter === 'all'
    ? state.clues
    : state.clues.filter(cl => cl.suspectId === parseInt(state.clueFilter));

  if (state.clues.length === 0) {
    list.innerHTML = `<p class="clue-empty">Nenhuma pista ainda. Interrogue os suspeitos.</p>`;
    filtersEl.innerHTML = '';
    return;
  }

  // Cria os botões de filtro (por suspeito, cruciais, etc.)
  const suspectIdsWithClues = [...new Set(state.clues.map(cl => cl.suspectId))];
  filtersEl.innerHTML = `
    <button class="clue-filter-btn ${state.clueFilter === 'all' ? 'active' : ''}" onclick="filterClues('all')">Todos (${state.clues.length})</button>
    ${suspectIdsWithClues.map(id => {
      const s = c.suspects.find(x => x.id === id);
      const n = state.clues.filter(cl => cl.suspectId === id).length;
      return `<button class="clue-filter-btn ${state.clueFilter == id ? 'active' : ''}" onclick="filterClues(${id})">${s.avatar} ${s.name} (${n})</button>`;
    }).join('')}
    <button class="clue-filter-btn ${state.clueFilter === 'key' ? 'active' : ''}" onclick="filterClues('key')">⭐ Cruciais</button>`;

  const toShow = state.clueFilter === 'key'
    ? state.clues.filter(cl => cl.isKey)
    : filtered;

  list.innerHTML = toShow.length === 0
    ? `<p class="clue-empty">Nenhuma pista neste filtro.</p>`
    : toShow.map(cl => `
        <div class="clue-item ${cl.isKey ? 'key-clue' : ''}">
          <span class="clue-icon">${cl.isKey ? '⭐' : '🔍'}</span>
          <span>
            <span class="clue-suspect">[${cl.suspectName}]</span>
            <span class="clue-text"> ${cl.text}</span>
          </span>
        </div>`).join('');
}

function filterClues(val) {
  state.clueFilter = val;
  renderClueBoardFull();
}

// --- Quadro de dedução (combinar duas pistas) ---
// Desenha a lista de conclusões já descobertas
function renderDeductionBoard() {
  const list = document.getElementById('deductions-list');
  if (state.deductions.length === 0) {
    list.innerHTML = `<p class="clue-empty">Nenhuma conclusão ainda.</p>`;
    return;
  }
  list.innerHTML = state.deductions.map(d => `
    <div class="deduction-found-item">
      <span class="df-label">${d.isKey ? '⭐ Conclusão Crucial' : '💡 Conclusão'}</span>
      ${d.conclusion}
    </div>`).join('');
}

// Abre a janela para o jogador escolher uma pista
function openCluePickerFor(slot) {
  if (state.clues.length === 0) { showToast('Descubra pistas primeiro!'); return; }
  const other = slot === 'a' ? state.deductionSlots.b : state.deductionSlots.a;
  const modal = document.getElementById('clue-picker-modal');
  const list  = document.getElementById('clue-picker-list');

  list.innerHTML = state.clues.map((cl, i) => {
    const isSlotted = other && other.text === cl.text;
    return `
      <div class="clue-picker-item ${isSlotted ? 'already-slotted' : ''}"
        onclick="selectClueForSlot('${slot}', ${i})">
        <span>${cl.isKey ? '⭐' : '🔍'}</span>
        <span><strong>[${cl.suspectName}]</strong> ${cl.text}</span>
      </div>`;
  }).join('');

  modal.classList.add('open');
  modal._targetSlot = slot;
}

// Quando o jogador escolhe uma pista para o slot
function selectClueForSlot(slot, clueIndex) {
  state.deductionSlots[slot] = state.clues[clueIndex];
  closeCluePickerModal();
  // Atualiza o visual dos dois slots
  updateDeductionSlotUI('a');
  updateDeductionSlotUI('b');
}

// Atualiza o aspeto visual de um slot (vazio ou com pista)
function updateDeductionSlotUI(slot) {
  const clue   = state.deductionSlots[slot];
  const slotEl = document.getElementById(`slot-${slot}`);
  const content= document.getElementById(`slot-${slot}-content`);
  if (clue) {
    slotEl.classList.add('filled');
    content.innerHTML = `<strong>[${clue.suspectName}]</strong> ${clue.text}`;
  } else {
    slotEl.classList.remove('filled');
    content.textContent = 'Clique para escolher';
  }
}

function closeCluePickerModal(event) {
  const modal = document.getElementById('clue-picker-modal');
  if (event && event.target !== modal) return;
  modal.classList.remove('open');
}

// Tenta deduzir algo a partir das duas pistas selecionadas
function deduce() {
  const { a, b } = state.deductionSlots;
  if (!a || !b) { showToast('Selecione duas pistas primeiro!'); return; }
  if (a.text === b.text)  { showToast('Selecione duas pistas diferentes!'); return; }

  const c = currentCase();
  const match = (c.deductions || []).find(d =>
    (d.clues.includes(a.text) && d.clues.includes(b.text))
  );

  const resultEl = document.getElementById('deduction-result');

  if (match) {
    const already = state.deductions.find(d => d.conclusion === match.conclusion);
    if (already) {
      resultEl.innerHTML = `<div class="deduction-miss">Esta conclusão já foi descoberta.</div>`;
    } else {
      state.deductions.push({ conclusion: match.conclusion, isKey: match.isKeyDeduction });
      playSound('deduce');
      renderDeductionBoard();
      updateStatusBar();
      // Atualiza o badge na aba de dedução
      const badge = document.getElementById('deduction-badge');
      if (badge) { badge.classList.remove('hidden'); badge.textContent = state.deductions.length; }
      resultEl.innerHTML = `
        <div class="deduction-conclusion">
          <span class="deduce-label">${match.isKeyDeduction ? '⭐ Conclusão Crucial!' : '💡 Nova Conclusão!'}</span>
          ${match.conclusion}
        </div>`;
      showToast(match.isKeyDeduction ? '⭐ Conclusão crucial descoberta!' : '💡 Nova dedução revelada!');
    }
  } else {
    resultEl.innerHTML = `<div class="deduction-miss">Estas duas pistas não revelam uma conclusão directa. Tente outra combinação.</div>`;
  }

  // Limpa os slots para tentar de novo
  state.deductionSlots = { a: null, b: null };
  updateDeductionSlotUI('a');
  updateDeductionSlotUI('b');
}

// Verifica se há novas deduções possíveis com as pistas atuais
function checkDeductionUnlocks() {
  const c = currentCase();
  const possible = (c.deductions || []).filter(d =>
    d.clues.every(clue => state.clues.some(c => c.text === clue)) &&
    !state.deductions.find(x => x.conclusion === d.conclusion)
  );
  if (possible.length > 0) {
    const badge = document.getElementById('deduction-badge');
    if (badge) badge.classList.remove('hidden');
    showToast('🧩 Nova dedução disponível!');
  }
}

// --- Bloco de notas do jogador ---
// Carrega as notas guardadas no navegador
function loadNotesFromStorage() {
  const ta = document.getElementById('notebook-text');
  if (!ta) return;
  const key = `notes_${state.caseIndex}`;
  ta.value = localStorage.getItem(key) || '';
  ta.addEventListener('input', () => {
    localStorage.setItem(key, ta.value);
    const ind = document.getElementById('notes-saved-indicator');
    if (ind) { ind.textContent = '✓ Guardado'; setTimeout(() => { if(ind) ind.textContent = ''; }, 2000); }
  });
}

// Apaga todas as notas
function clearNotes() {
  const ta = document.getElementById('notebook-text');
  if (!ta) return;
  ta.value = '';
  localStorage.removeItem(`notes_${state.caseIndex}`);
  showToast('Notas apagadas.');
}

// --- Janela de acusação (escolher quem é o culpado) ---
// Abre a janela para fazer a acusação final
function openAccuseModal() {
  if (state.gameOver) return;
  const c    = currentCase();
  const grid = document.getElementById('accusation-grid');
  grid.innerHTML = c.suspects.map(s => `
    <button class="accuse-btn" onclick="accuse(${s.id})">
      <span class="acc-avatar">${s.avatar}</span>
      <span class="acc-name">${s.name}</span>
      <span class="acc-role">${s.role}</span>
    </button>`).join('');
  document.getElementById('accuse-modal').classList.add('open');
}

function closeAccuseModal(event) {
  if (event && event.target !== document.getElementById('accuse-modal')) return;
  document.getElementById('accuse-modal').classList.remove('open');
}

// --- Lógica da acusação (acertou ou errou?) ---
// Quando o jogador acusa alguém: verifica se acertou
function accuse(suspectId) {
  document.getElementById('accuse-modal').classList.remove('open');
  const c = currentCase();

  if (suspectId === state.murdererIndex) {
    state.gameOver = true;
    clearInterval(state.timerInterval);
    playSound('victory');
    const result = buildResult(c, true);
    state.lastResult = result;
    saveReputation(c, result.score, true);
    showVictory(c, result);
  } else {
    state.wrongAccusations++;
    playSound('wrong');
    updateStatusBar();
    if (state.wrongAccusations >= MAX_WRONG) {
      state.gameOver = true;
      clearInterval(state.timerInterval);
      saveReputation(c, 0, false);
      showDefeat(c);
    } else {
      showWrongModal(c, suspectId);
    }
  }
}

// Mostra a janela de "errou a acusação"
function showWrongModal(c, suspectId) {
  const s         = c.suspects.find(x => x.id === suspectId);
  const remaining = MAX_WRONG - state.wrongAccusations;
  document.getElementById('wrong-modal-title').textContent = `${s.name} é inocente!`;
  document.getElementById('wrong-modal-body').textContent  =
    `As evidências não apontam para ${s.name}. Continue a investigar — restam-lhe ${remaining} acusação(ões).`;
  document.getElementById('wrong-modal-pips').innerHTML =
    `<div class="wrong-pips-row">` +
    Array.from({ length: MAX_WRONG }, (_, i) =>
      `<span class="wrong-pip ${i < state.wrongAccusations ? 'used' : ''}"></span>`).join('') +
    `</div>`;
  document.getElementById('wrong-modal').classList.add('open');
}

function closeWrongModal(event) {
  if (event && event.target !== document.getElementById('wrong-modal')) return;
  document.getElementById('wrong-modal').classList.remove('open');
  showScreen('screen-investigate');
}

// --- Calcular a pontuação final ---
// Calcula os pontos com base em pistas, erros, deduções e tempo
function buildResult(c, won) {
  const secs   = elapsedSeconds();
  const score  = won
    ? Math.max(0,
        SCORE_BASE
        - state.wrongAccusations * SCORE_WRONG
        + state.clues.length     * SCORE_CLUE
        + state.deductions.length * SCORE_DEDUCTION
        - Math.floor(secs / 30) * 10
      )
    : 0;
  const rank = RANKS.find(r => score >= r.min) || RANKS[RANKS.length - 1];
  return { score, rank, secs };
}

function getRank(score) {
  return RANKS.find(r => score >= r.min) || RANKS[RANKS.length - 1];
}

// --- Ecrã de vitória (caso resolvido!) ---
// Mostra o ecrã de parabéns com a pontuação
function showVictory(c, result) {
  const killer = c.suspects[state.murdererIndex];
  document.getElementById('result-content').innerHTML = `
    <div class="result-box win">
      <div class="result-icon">🎉</div>
      <h2>Caso Resolvido!</h2>
      <p class="tagline">O Detetive Marlowe desvendou o crime. A justiça prevalece.</p>

      <div class="result-reveal">
        <div class="reveal-name">${killer.avatar} ${killer.name} — ${killer.role}</div>
        <div class="reveal-row"><span class="reveal-label">Motivo:</span> ${killer.murdererMotive}</div>
        <div class="reveal-row"><span class="reveal-label">Arma:</span> ${c.weapon}</div>
        <div class="reveal-row"><span class="reveal-label">Método:</span> ${killer.murdererMethod}</div>
      </div>

      <div class="result-score">
        <div class="score-item"><span class="score-num" style="color:var(--success)">${result.score}</span><span class="score-label">Pontuação</span></div>
        <div class="score-item"><span class="score-num">${state.clues.length}</span><span class="score-label">Pistas</span></div>
        <div class="score-item"><span class="score-num">${state.deductions.length}</span><span class="score-label">Deduções</span></div>
        <div class="score-item"><span class="score-num">${state.wrongAccusations}</span><span class="score-label">Erros</span></div>
        <div class="score-item"><span class="score-num">${formatTime(result.secs)}</span><span class="score-label">Tempo</span></div>
      </div>

      <div class="rank-badge">${result.rank.icon} ${result.rank.label}</div>
    </div>`;
  showScreen('screen-result');
}

// --- Ecrã de derrota (o assassino fugiu) ---
// Mostra o ecrã de game over
function showDefeat(c) {
  const killer = c.suspects[state.murdererIndex];
  document.getElementById('result-content').innerHTML = `
    <div class="result-box lose">
      <div class="result-icon">💀</div>
      <h2>O Caso Falhou...</h2>
      <p class="tagline">Demasiados erros. O assassino fugiu. O caso fica em aberto.</p>
      <div class="result-reveal">
        <div class="reveal-name">${killer.avatar} ${killer.name} — ${killer.role}</div>
        <div class="reveal-row"><span class="reveal-label">Motivo:</span> ${killer.murdererMotive}</div>
        <div class="reveal-row"><span class="reveal-label">Arma:</span> ${c.weapon}</div>
        <div class="reveal-row"><span class="reveal-label">Método:</span> ${killer.murdererMethod}</div>
      </div>
      <div class="result-score">
        <div class="score-item"><span class="score-num" style="color:var(--blood)">0</span><span class="score-label">Pontuação</span></div>
        <div class="score-item"><span class="score-num">${state.clues.length}</span><span class="score-label">Pistas</span></div>
        <div class="score-item"><span class="score-num">${MAX_WRONG}</span><span class="score-label">Erros</span></div>
      </div>
    </div>`;
  showScreen('screen-result');
}

// --- Copiar resultado para partilhar ---
// Copia o resultado do jogo para a área de transferência
function shareResult() {
  const c = currentCase();
  const killer = c.suspects[state.murdererIndex];
  const r = state.lastResult;
  const text = r
    ? `🕵️ O Detetive — ${c.title}\n` +
      `Assassino: ${killer.name}\n` +
      `Pontuação: ${r.score} · ${r.rank.icon} ${r.rank.label}\n` +
      `Pistas: ${state.clues.length} · Deduções: ${state.deductions.length} · Erros: ${state.wrongAccusations}\n` +
      `⏱ Tempo: ${formatTime(r.secs)}`
    : `🕵️ O Detetive — Jogo em curso...`;
  navigator.clipboard.writeText(text).then(() => showToast('📋 Resultado copiado!'));
}

// --- Reputação do jogador (guardada entre sessões) ---
// Carrega a reputação guardada no navegador
function loadReputation() {
  try {
    return JSON.parse(localStorage.getItem('detective_reputation')) || { totalScore: 0, gamesPlayed: 0, solvedCases: {} };
  } catch { return { totalScore: 0, gamesPlayed: 0, solvedCases: {} }; }
}

// Guarda a reputação atualizada após cada jogo
function saveReputation(c, score, won) {
  reputation.gamesPlayed++;
  reputation.totalScore += score;
  if (won) {
    const prev = reputation.solvedCases[c.id];
    reputation.solvedCases[c.id] = {
      bestScore: prev ? Math.max(prev.bestScore, score) : score,
      solvedCount: (prev ? prev.solvedCount : 0) + 1,
    };
  }
  localStorage.setItem('detective_reputation', JSON.stringify(reputation));
}

// Mostra a barra de reputação no ecrã inicial
function renderReputationBar() {
  const bar = document.getElementById('reputation-bar');
  if (!bar) return;
  if (reputation.gamesPlayed === 0) { bar.classList.remove('visible'); return; }
  const rank = getRank(Math.floor(reputation.totalScore / Math.max(1, reputation.gamesPlayed)));
  const stars = '★'.repeat(rank.stars) + '☆'.repeat(5 - rank.stars);
  bar.classList.add('visible');
  bar.innerHTML = `
    <span class="rep-label">Reputação</span>
    <span class="rep-stars">${stars}</span>
    <span class="rep-rank">${rank.icon} ${rank.label}</span>
    <span class="rep-score">· ${reputation.gamesPlayed} caso(s) · Pontuação total: ${reputation.totalScore}</span>`;
}

// --- Notificações rápidas (aparecem e desaparecem) ---
// Mostra uma mensagem temporária no fundo do ecrã
function showToast(msg) {
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = msg;
  container.appendChild(toast);
  setTimeout(() => { if (toast.parentNode) toast.parentNode.removeChild(toast); }, 3000);
}

// --- Funções auxiliares ---
function currentCase() { return CASES[state.caseIndex]; } // devolve o caso atual
function randomInt(max) { return Math.floor(Math.random() * max); } // gera número aleatório