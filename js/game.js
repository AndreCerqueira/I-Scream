const tempoInicial = 20;
let tempoRestante = tempoInicial; 
let jogoIniciado = true;
let playerPosition = { x: 0, y: 0 }; 

const placar = document.getElementById('score');
const elementoContagemRegressiva = document.getElementById('contagemRegressiva');
let characterColor = sessionStorage.getItem('characterColor');
if (!characterColor) characterColor = 'pink';


criarTabuleiro();
atribuirCoresTabuleiro();



// Criar slots de inventário
for (let i = 0; i < 3; i++) {
    const slot = document.createElement('div');
    slot.className = 'slot';
    slot.id = 'slot' + (i + 1);

    // Adicionar um item de exemplo ao slot (opcional)
    const item = document.createElement('img');
    // item.src = 'caminho/para/o/item' + (i + 1) + '.png'; // Substitua com o caminho real para as imagens dos itens
    // item.alt = 'Item ' + (i + 1);
    // item.className = 'item';
    slot.appendChild(item);

    inventario.appendChild(slot);
}

// Começar o temporizador
const temporizador = setInterval(() => {
    tempoRestante--;
    elementoContagemRegressiva.innerText = tempoRestante;

    if (tempoRestante <= 0) {
        clearInterval(temporizador);
        tempoRestante = tempoInicial;
    }
}, 1000);


playerPosition = spawnPlayer();
changeCharacterColor(characterColor);



document.addEventListener('keyup', (event) => {
    if (!jogoIniciado || !playerPosition) return;

    const cell = tabuleiro.querySelector(`#cell-${playerPosition.x}-${playerPosition.y}`);
    const character = cell.querySelector('.character-container');
    if (!character) return;


    switch(event.key) {
        case 'ArrowUp':
            if (playerPosition.x > 0) playerPosition.x--;
            break;
        case 'ArrowDown':
            if (playerPosition.x < numRows - 1) playerPosition.x++;
            break;
        case 'ArrowLeft':
            if (playerPosition.y > 0) playerPosition.y--;
            break;
        case 'ArrowRight':
            if (playerPosition.y < numCols - 1) playerPosition.y++;
            break;
        default:
            return; // Se não for uma tecla de seta, saia da função
    }
    console.log(playerPosition);

    const newCell = document.getElementById(`cell-${playerPosition.x}-${playerPosition.y}`);
    if (newCell) newCell.appendChild(character); // Mova o contêiner do personagem para a nova célula

    ajustarTempoEPontuacao(newCell);
    reatribuirCoresTabuleiro();
});


function ajustarTempoEPontuacao(celula) {
    if (celula.classList.contains('celula-vermelho')) {
        tempoRestante -= 3;
    } else if (celula.classList.contains('celula-laranja')) {
        score += 1;
    } else if (celula.classList.contains('celula-azul')) {
        tempoRestante += 1;
        score += 3;
    }

    // Atualiza o display de tempo e pontuação
    elementoContagemRegressiva.innerText = tempoRestante;
    placar.innerText = 'Score: ' + score;
}



function pauseGame() {
    if (!jogoIniciado) return;
    jogoIniciado = false;
    clearInterval(temporizador);
}

function restartGame() {
    pontuacao = 0;
    tempoRestante = tempoInicial;
    placar.innerText = 'Score: 0';
}

function exitGame() {
    window.location.href = 'index.html';
}