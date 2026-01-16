// Variáveis globais do jogo
let tentativas = 6; // Quantas chances o jogador tem (começa com 6)
let listaDinamica = []; // Array que guarda as letras já acertadas ou espaços (ex: ["_", "_", " ", "A", ...])
let palavraSecretaCategoria; // Armazena a categoria da palavra sorteada (ex: "PAÍS")
let palavraSecretaSorteada; // A palavra secreta atual (string completa)
let palavras = []; // Lista completa de palavras disponíveis para sortear
let jogoAutomatico = true; // Controla se está no modo automático (palavras pré-definidas) ou manual
let dificuldade; // Nível atual: "facil", "medio" ou "dificil"
let pontos = parseInt(localStorage.getItem("forcaPontos") || "0"); // Pontuação do jogador (carregada do armazenamento local)
let letrasErradas = new Set(); // Conjunto de letras erradas já escolhidas (evita penalizar repetidas)

const nomesDif = {
  // Tradução amigável dos níveis de dificuldade para exibição
  facil: "FÁCIL",
  medio: "MÉDIO",
  dificil: "DIFÍCIL",
};

/**
 * Atualiza a pontuação na tela e salva no localStorage
 * @param {number} delta - Quantos pontos adicionar (positivo) ou subtrair (negativo)
 */
function atualizarPontuacao(delta = 0) {
  if (delta !== 0) {
    pontos += delta;
    localStorage.setItem("forcaPontos", pontos); // Salva a pontuação persistente
  }

  const el = document.getElementById("pontos");
  if (el) {
    el.textContent = pontos;
    // Efeito visual simples: aumenta e diminui o tamanho do número
    el.style.transition = "all 0.3s";
    el.style.transform = "scale(1.2)";
    setTimeout(() => (el.style.transform = "scale(1)"), 200);
  }
}

// Inicialização do jogo ao carregar a página
carregaListaAutomatica(); // Carrega as palavras pré-definidas
initDificuldade(); // Configura o nível de dificuldade salvo ou padrão
atualizarPontuacao(); // Mostra a pontuação inicial na tela
criarPalavraSecreta(); // Sorteia a primeira palavra
montarPalavraNaTela(); // Desenha a palavra secreta (com underscores) na tela

// Evento do botão "Zerar Pontos" (opcional)
document.getElementById("resetPontos")?.addEventListener("click", () => {
  if (confirm("Tem certeza que deseja zerar a pontuação?")) {
    pontos = 0;
    localStorage.setItem("forcaPontos", "0");
    atualizarPontuacao();
  }
});

/**
 * Inicializa os botões de dificuldade e carrega o nível salvo
 */
function initDificuldade() {
  dificuldade = localStorage.getItem("dificuldade") || "medio";
  const btnIds = ["facil", "medio", "dificil"];
  btnIds.forEach((id) => {
    document.getElementById("btn-" + id).classList.remove("selecionado");
  });
  document.getElementById("btn-" + dificuldade).classList.add("selecionado");

  // Define os eventos de clique nos botões de dificuldade
  document.getElementById("btn-facil").onclick = () => setDificuldade("facil");
  document.getElementById("btn-medio").onclick = () => setDificuldade("medio");
  document.getElementById("btn-dificil").onclick = () =>
    setDificuldade("dificil");
}

/**
 * Muda o nível de dificuldade, salva no localStorage e sorteia nova palavra
 * @param {string} novaDif - "facil", "medio" ou "dificil"
 */
function setDificuldade(novaDif) {
  const btnIds = ["facil", "medio", "dificil"];
  btnIds.forEach((id) => {
    document.getElementById("btn-" + id).classList.remove("selecionado");
  });
  document.getElementById("btn-" + novaDif).classList.add("selecionado");

  if (dificuldade !== novaDif) {
    dificuldade = novaDif;
    localStorage.setItem("dificuldade", novaDif);
    sortear(); // Nova palavra com o filtro da nova dificuldade
  }
}

/**
 * Escolhe aleatoriamente uma palavra da lista, respeitando o filtro de dificuldade
 */
function criarPalavraSecreta() {
  const filteredPalavras = palavras.filter((palavraObj) => {
    const letras = palavraObj.nome.replace(/\s+/g, "").length;
    switch (dificuldade) {
      case "facil":
        return letras <= 6;
      case "medio":
        return letras >= 7 && letras <= 10;
      case "dificil":
        return letras >= 11;
      default:
        return true;
    }
  });

  let palavraEscolhida;
  if (filteredPalavras.length === 0) {
    abreModal(
      "Atenção!",
      "Nenhuma palavra para esta dificuldade.<br>Usando todas as palavras."
    );
    const index = Math.floor(Math.random() * palavras.length);
    palavraEscolhida = palavras[index];
  } else {
    const index = Math.floor(Math.random() * filteredPalavras.length);
    palavraEscolhida = filteredPalavras[index];
  }

  palavraSecretaSorteada = palavraEscolhida.nome;
  palavraSecretaCategoria = palavraEscolhida.categoria;
}

/**
 * Monta a palavra secreta na tela (mostra letras acertadas e underscores para as não acertadas)
 */
function montarPalavraNaTela() {
  const categoria = document.getElementById("categoria");
  categoria.innerHTML = `
    <strong>CATEGORIA: ${palavraSecretaCategoria}</strong><br>
    <em style="color: #228B22; font-weight: bold;">DIFICULDADE: ${nomesDif[dificuldade]}</em>
  `;

  const palavraTela = document.getElementById("palavra-secreta");
  palavraTela.innerHTML = "";

  for (let i = 0; i < palavraSecretaSorteada.length; i++) {
    if (listaDinamica[i] == undefined) {
      if (palavraSecretaSorteada[i] === " ") {
        listaDinamica[i] = " ";
        palavraTela.innerHTML += `<div class='letrasEspaco'> </div>`;
      } else {
        listaDinamica[i] = "&nbsp;";
        palavraTela.innerHTML += `<div class='letras'>&nbsp;</div>`;
      }
    } else {
      if (palavraSecretaSorteada[i] === " ") {
        palavraTela.innerHTML += `<div class='letrasEspaco'> </div>`;
      } else {
        palavraTela.innerHTML += `<div class='letras'>${listaDinamica[i]}</div>`;
      }
    }
  }
}

/**
 * Função chamada quando o jogador clica em uma letra no teclado virtual
 * @param {string} letra - Letra clicada (maiúscula)
 */
function verificaLetraEscolhida(letra) {
  const tecla = document.getElementById("tecla-" + letra);
  if (!tecla || tecla.disabled) return; // Já foi usada ou não existe

  tecla.disabled = true;

  if (tentativas > 0) {
    mudarStyleLetra("tecla-" + letra, false); // Muda cor inicialmente (será ajustado depois)
    comparalistas(letra);
    montarPalavraNaTela();
  }
}

/**
 * Altera a cor da tecla clicada para indicar acerto ou erro
 * @param {string} tecla - ID da tecla (ex: "tecla-A")
 * @param {boolean} acertou - Se a letra estava na palavra
 */
function mudarStyleLetra(tecla, acertou) {
  const elemento = document.getElementById(tecla);
  if (acertou) {
    elemento.style.background = "#008000"; // Verde
    elemento.style.color = "#ffffff";
  } else {
    elemento.style.background = "#C71585"; // Rosa/vermelho
    elemento.style.color = "#ffffff";
  }
}

/**
 * Verifica se a letra está na palavra secreta, atualiza o estado do jogo e checa vitória/derrota
 * @param {string} letra - Letra escolhida
 */
function comparalistas(letra) {
  const palavraNormalizada = palavraSecretaSorteada
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();

  const letraNormalizada = letra.toUpperCase();
  const pos = palavraNormalizada.indexOf(letraNormalizada);

  if (pos < 0) {
    // Letra errada
    if (!letrasErradas.has(letraNormalizada)) {
      letrasErradas.add(letraNormalizada);
      tentativas--;
      carregaImagemForca();

      if (tentativas === 0) {
        abreModal(
          "OPS!",
          "Não foi dessa vez...<br>A palavra era: <strong>" +
            palavraSecretaSorteada +
            "</strong>"
        );
        piscarBotaoJogarNovamente(true);
      }
    }
  } else {
    // Letra certa
    mudarStyleLetra("tecla-" + letra, true);
    for (let i = 0; i < palavraSecretaSorteada.length; i++) {
      const charNormal = palavraSecretaSorteada[i]
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toUpperCase();

      if (charNormal === letraNormalizada) {
        listaDinamica[i] = palavraSecretaSorteada[i]; // Mantém o acento original
      }
    }
  }

  // Verifica se o jogador ganhou (todas letras não-espaço foram descobertas)
  let venceu = true;
  for (let i = 0; i < palavraSecretaSorteada.length; i++) {
    if (
      palavraSecretaSorteada[i] !== " " &&
      palavraSecretaSorteada[i] !== listaDinamica[i]
    ) {
      venceu = false;
      break;
    }
  }

  if (venceu) {
    atualizarPontuacao(50);
    abreModal("PARABÉNS!", "Você acertou!<br>+50 pontos");
    tentativas = 0;
    piscarBotaoJogarNovamente(true);
  }
}

/**
 * Atualiza a imagem da forca de acordo com o número de tentativas restantes
 */
function carregaImagemForca() {
  const imagens = [
    "Image/forca.png",
    "Image/forca01.png",
    "Image/forca02.png",
    "Image/forca03.png",
    "Image/forca04.png",
    "Image/forca05.png",
    "Image/forca06.png",
  ];
  document.getElementById("imagem").style.backgroundImage = `url('${
    imagens[6 - tentativas]
  }')`;
}

/**
 * Abre o modal Bootstrap com título e mensagem personalizados
 * @param {string} titulo
 * @param {string} mensagem
 */
function abreModal(titulo, mensagem) {
  document.getElementById("exampleModalLabel").innerText = titulo;
  document.getElementById("modalBody").innerHTML = mensagem;
  $("#myModal").modal({ show: true });
}

// Botão de reiniciar página (recarrega tudo)
document
  .querySelector("#btnReiniciar")
  .addEventListener("click", () => location.reload());

/**
 * Alterna entre modo automático (palavras fixas) e manual (adicionar palavras)
 */
function listaAutomatica() {
  if (jogoAutomatico) {
    document.getElementById("jogarAutomatico").innerHTML =
      "<i class='bx bx-play-circle'></i>";
    jogoAutomatico = false;
    document.getElementById("abreModalAddPalavra").style.display = "block";
    document.getElementById("status").innerHTML = "Modo Manual";
  } else {
    carregaListaAutomatica();
    document.getElementById("jogarAutomatico").innerHTML =
      "<i class='bx bx-pause-circle'></i>";
    jogoAutomatico = true;
    document.getElementById("abreModalAddPalavra").style.display = "none";
    document.getElementById("status").innerHTML = "Modo Automático";
  }
}

// Controle do modal de adicionar palavra
const modal = document.getElementById("modal-alerta");
document.getElementById("abreModalAddPalavra").onclick = () =>
  (modal.style.display = "flex");
document.getElementById("fechaModal").onclick = () => {
  modal.style.display = "none";
  document.getElementById("addPalavra").value = "";
  document.getElementById("addCategoria").value = "";
};
window.onclick = (event) => {
  if (event.target === modal) {
    modal.style.display = "none";
    document.getElementById("addPalavra").value = "";
    document.getElementById("addCategoria").value = "";
  }
};

/**
 * Carrega a lista inicial de palavras pré-definidas
 */
function carregaListaAutomatica() {
  palavras = [
    { nome: "IRLANDA", categoria: "PAÍS" },
    { nome: "EQUADOR", categoria: "PAÍS" },
    { nome: "CHILE", categoria: "PAÍS" },
    { nome: "INDONESIA", categoria: "PAÍS" },
    { nome: "MALDIVAS", categoria: "PAÍS" },
    { nome: "INGLATERRA", categoria: "PAÍS" },
    { nome: "GROELANDIA", categoria: "PAÍS" },
    { nome: "UZBEQUISTAO", categoria: "PAÍS" },
    { nome: "BICICLETA", categoria: "TRANSPORTE" },
    { nome: "LANCHA", categoria: "TRANSPORTE" },
    { nome: "NAVIO", categoria: "TRANSPORTE" },
    { nome: "TELEFERICO", categoria: "TRANSPORTE" },
    { nome: "MOTOCICLETA", categoria: "TRANSPORTE" },
    { nome: "AERONAVE", categoria: "TRANSPORTE" },
    { nome: "XICARA", categoria: "OBJETOS" },
    { nome: "MOEDA", categoria: "OBJETOS" },
    { nome: "CHUVEIRO", categoria: "OBJETOS" },
    { nome: "LAMPADA", categoria: "OBJETOS" },
    { nome: "MELANCIA", categoria: "ALIMENTOS" },
    { nome: "AMENDOIM", categoria: "ALIMENTOS" },
    { nome: "DRAGAO", categoria: "ANIMAIS" },
    { nome: "HIPOPOTAMO", categoria: "ANIMAIS" },
    { nome: "A ERA DO GELO", categoria: "TV E CINEMA" },
    { nome: "HOMEM ARANHA", categoria: "TV E CINEMA" },
    { nome: "STRANGER THINGS", categoria: "TV E CINEMA" },
  ];
}

/**
 * Adiciona uma nova palavra e categoria digitadas pelo usuário
 */
function adicionarPalavra() {
  let palavra = document
    .getElementById("addPalavra")
    .value.trim()
    .toUpperCase();
  let categoria = document
    .getElementById("addCategoria")
    .value.trim()
    .toUpperCase();

  if (!palavra || !categoria || palavra.length < 3 || categoria.length < 3) {
    abreModal(
      "ATENÇÃO",
      "Palavra e/ou Categoria inválidos (mínimo 3 caracteres)"
    );
    return;
  }

  palavras.push({ nome: palavra, categoria: categoria });
  sortear(); // Começa nova rodada com a lista atualizada

  document.getElementById("addPalavra").value = "";
  document.getElementById("addCategoria").value = "";
  modal.style.display = "none";
}

/**
 * Reinicia o jogo: limpa variáveis, reseta forca e sorteia nova palavra
 */
function sortear() {
  listaDinamica = [];
  tentativas = 6;
  letrasErradas.clear();
  document.getElementById("imagem").style.backgroundImage =
    "url('Image/forca.png')";
  resetaTeclas();
  piscarBotaoJogarNovamente(false);
  criarPalavraSecreta();
  montarPalavraNaTela();
}

/**
 * Restaura o visual e estado das teclas do teclado virtual
 */
function resetaTeclas() {
  document
    .querySelectorAll(".teclas button:not(#btnReiniciar)")
    .forEach((btn) => {
      btn.disabled = false;
      btn.style.background = "#FFFFFF";
      btn.style.color = "#8B008B";
    });
}

/**
 * Mostra ou esconde o GIF de "Jogar Novamente"
 * @param {boolean} mostrar
 */
function piscarBotaoJogarNovamente(mostrar) {
  document.getElementById("jogarNovamente").style.display = mostrar
    ? "block"
    : "none";
}
