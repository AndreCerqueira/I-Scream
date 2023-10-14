const tempoInicial = 20;
let tempoRestante = tempoInicial; 
let jogoIniciado = true;
let playerPosition = { x: 0, y: 0 }; 
let temporizador;
let isAnimating = false;
let lastMoveWasValid = false;

// localStorage.setItem('bestScore', 20);
let bestScore = localStorage.getItem('bestScore');

if (!bestScore) bestScore = 0;
document.getElementById("game-best-score").innerHTML = "<strong> Best Score: " + bestScore + "</strong>";
const placar = document.getElementById('game-score');

const elementoContagemRegressiva = document.getElementById('contagemRegressiva');

let characterColor = sessionStorage.getItem('characterColor');
if (!characterColor) characterColor = 'pink';

criarTabuleiro();
atribuirCoresTabuleiro();
iniciarTemporizador();

function iniciarTemporizador() {

    elementoContagemRegressiva.style.animation = 'pulse 1s infinite';

    temporizador = setInterval(() => {
        tempoRestante--;
        if (tempoRestante < 0) tempoRestante = 0;
        elementoContagemRegressiva.innerText = tempoRestante;

        if (tempoRestante <= 5) {
            elementoContagemRegressiva.style.color = 'red';
        } else if (tempoRestante <= 10) {
            elementoContagemRegressiva.style.color = 'yellow';
        } else {
            elementoContagemRegressiva.style.color = 'green';
        }

        if (tempoRestante === 0) {
            elementoContagemRegressiva.style.animation = 'none';
        }

        if (tempoRestante <= 0) {
            clearInterval(temporizador);
            
            if (score >= bestScore) {
                bestScore = score;
                localStorage.setItem('bestScore', score);

                try {
                    updateLeaderboard(score, getFlavorId(characterColor));
                } catch (error) {
                }
            }

            showGameOverModal(); 
        }
    }, 1000);
}

playerPosition = spawnPlayer();
changeCharacterColor(characterColor);
document.querySelector('.melted-ice-cream').src = `../img/${characterColor}-melted.svg`;

document.addEventListener('keyup', (event) => {
    if (event.key === 'r' || event.key === 'R') {
        restartGame(); 
        return; 
    }

    if (!jogoIniciado || !playerPosition || tempoRestante <= 0 || isAnimating) return;

    const cell = tabuleiro.querySelector(`#cell-${playerPosition.x}-${playerPosition.y}`);
    const character = cell.querySelector('.character-container');
    let isValidMove = false;
    if (!character) return;

    let animationClass = '';
    let newPosition = { ...playerPosition }; 

    switch(event.key) {
        case 'ArrowUp':
            if (playerPosition.x > 0) {
                animationClass = 'move-up';
                isValidMove = true;
                newPosition.x--;
            }
            break;
        case 'ArrowDown':
            if (playerPosition.x < numRows - 1) {
                animationClass = 'move-down';
                isValidMove = true;
                newPosition.x++;
            }
            break;
        case 'ArrowLeft':
            if (playerPosition.y > 0) {
                animationClass = 'move-left';
                isValidMove = true;
                newPosition.y--;
            }
            break;
        case 'ArrowRight':
            if (playerPosition.y < numCols - 1) {
                animationClass = 'move-right';
                isValidMove = true;
                newPosition.y++;
            }
            break;
        default:
            return;
    }
    lastMoveWasValid = isValidMove;
    
    if (!isValidMove) return;
    
    isAnimating = true;
    
    character.classList.add(animationClass);

    character.addEventListener('animationend', () => {
        character.classList.remove(animationClass);
        const newCell = document.getElementById(`cell-${newPosition.x}-${newPosition.y}`);
        if (newCell) newCell.appendChild(character);
        playerPosition = newPosition; 

        const powerUp = newCell.querySelector('.power-up');
        if (powerUp) {
            catchPowerUp(powerUp, newCell); 
        }

        incrementMoveCounter();
        ajustarTempoEPontuacao(newCell);
        mudarCorDasOutrasCelulas(newCell);

        isAnimating = false;
    }, {once: true});
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

    if (tempoRestante < 0) tempoRestante = 0;
    elementoContagemRegressiva.innerText = tempoRestante;
    placar.innerText = 'Score: ' + score;
}

let pauseButtonPressed = false;
let continueButtonPressed = false;
function pauseGame() {
    if (pauseButtonPressed && continueButtonPressed) return;

    const pauseButton = document.querySelector('#pauseButton');

    if (jogoIniciado && !pauseButtonPressed) {
        jogoIniciado = false;
        clearInterval(temporizador);
        clearInterval(powerUpInterval); 
        pauseButton.innerText = 'Continue'; 
        pauseButton.classList.remove('playing');
        pauseButton.classList.add('paused');
        pauseButtonPressed = true;
    } else {

        if (continueButtonPressed)
            return;

        jogoIniciado = true;
        iniciarTemporizador();
        pauseButton.innerText = 'Pause';
        pauseButton.classList.remove('paused');
        pauseButton.classList.add('playing');
        continueButtonPressed = true;
    }
}

function restartGame() {
    modal.style.display = "none";
    jogoIniciado = true;

    document.getElementById("game-best-score").innerHTML = "<strong> Best Score: " + bestScore + "</strong>";
    score = 0;
    moveCounter = 0;
    elementoContagemRegressiva.style.color = 'green';
    tempoRestante = tempoInicial;
    elementoContagemRegressiva.innerText = tempoRestante;
    placar.innerText = 'Score: 0';
    pauseButtonPressed = false;
    continueButtonPressed = false;
    
    clearInterval(temporizador); 
    iniciarTemporizador(); 
    reatribuirCoresTabuleiro();
    removeAllPowerUps();
    clearAllInventorySlots();
    removePlayer();
    playerPosition = spawnPlayer();
    changeCharacterColor(characterColor);
}

function exitGame() {
    window.location.href = '../index.html';
}