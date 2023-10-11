let pontuacao = 0;
let tempo = 0;
let jogoIniciado = false;

// const personagem = document.getElementById('personagem');
const tabuleiro = document.getElementById('tabuleiro');
// const placar = document.getElementById('placar');
// const contador = document.getElementById('temporizador');


// Preencher o tabuleiro
for (let i = 0; i < 9; i++) {
    const celula = document.createElement('div');
    tabuleiro.appendChild(celula);
}


let tempoRestante = 60; // Você pode ajustar o tempo inicial conforme necessário
const elementoContagemRegressiva = document.getElementById('contagemRegressiva');

const temporizador = setInterval(() => {
    tempoRestante--;
    elementoContagemRegressiva.innerText = tempoRestante;

    if (tempoRestante <= 0) {
        clearInterval(temporizador);
        tempoRestante = 60;
    }
}, 1000);


function iniciarJogo() {
    if (jogoIniciado) return;
    jogoIniciado = true;
    temporizador = setInterval(() => {
        tempo++;
        contador.innerText = 'Tempo: ' + tempo;
    }, 1000);
}

function pausarJogo() {
    if (!jogoIniciado) return;
    jogoIniciado = false;
    clearInterval(temporizador);
}

function reiniciarJogo() {
    pausarJogo();
    pontuacao = 0;
    tempo = 0;
    placar.innerText = 'Pontuação: 0';
    contador.innerText = 'Tempo: 0';
}