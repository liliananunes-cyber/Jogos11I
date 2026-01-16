const gameBoard = document.querySelector(".memory-game");

// 🧩 Emojis do jogo (8 pares)
const symbols = ["🍎","🍎","🍌","🍌","🍇","🍇","🍓","🍓", "M", "M", "C", "C", "L", "L", "U", "U"];

let firstCard = null;
let secondCard = null;
let lockBoard = false;
let moves = 0;
let matches = 0;

// 📊 Painel de informações
const infoPanel = document.createElement("div");
infoPanel.style.textAlign = "center";
infoPanel.style.marginTop = "20px";
infoPanel.innerHTML = `
    <h2>🧠 Jogo da Memória 🎮</h2>
    <p>👆 Jogadas: <span id="moves">0</span></p>
    <p>✅ Pares encontrados: <span id="matches">0</span> / 8</p>
    <button id="restart">🔄 Reiniciar Jogo</button>
`;
document.body.appendChild(infoPanel);

document.getElementById("restart").addEventListener("click", restartGame);

// 🔀 Embaralhar cartas
function shuffle(array) {
    return array.sort(() => Math.random() - 0.5);
}

// 🃏 Criar tabuleiro
function createBoard() {
    gameBoard.innerHTML = "";
    shuffle(symbols).forEach(symbol => {
        const card = document.createElement("div");
        card.classList.add("card");
        card.dataset.symbol = symbol;
        card.textContent = "❓";
        card.addEventListener("click", flipCard);
        gameBoard.appendChild(card);
    });
}

// 🔍 Virar carta
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add("flipped");
    this.textContent = this.dataset.symbol;

    if (!firstCard) {
        firstCard = this;
        return;
    }

    secondCard = this;
    moves++;
    document.getElementById("moves").textContent = moves;

    checkMatch();
}

// 🎯 Verificar par
function checkMatch() {
    const isMatch = firstCard.dataset.symbol === secondCard.dataset.symbol;
    isMatch ? keepCards() : hideCards();
}

// 🟢 Manter cartas iguais abertas
function keepCards() {
    firstCard.removeEventListener("click", flipCard);
    secondCard.removeEventListener("click", flipCard);
    matches++;
    document.getElementById("matches").textContent = matches;
    resetTurn();

    if (matches === symbols.length / 2) {
        setTimeout(() => {
            alert(`🎉🥳 PARABÉNS! 🥳🎉\nConcluíste o jogo em ${moves} jogadas 👏🧠`);
        }, 300);
    }
}

// 🔴 Esconder cartas diferentes
function hideCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove("flipped");
        secondCard.classList.remove("flipped");
        firstCard.textContent = "❓";
        secondCard.textContent = "❓";
        resetTurn();
    }, 1000);
}

// 🔄 Resetar jogada
function resetTurn() {
    [firstCard, secondCard, lockBoard] = [null, null, false];
}

// 🔁 Reiniciar jogo
function restartGame() {
    moves = 0;
    matches = 0;
    document.getElementById("moves").textContent = "0";
    document.getElementById("matches").textContent = "0";
    resetTurn();
    createBoard();
}

// 🚀 Iniciar jogo
createBoard();