

const characterColor = sessionStorage.getItem('characterColor');
changeCharacterColor(characterColor);

let caminho = "";
if (window.location.pathname.includes('/index.html')){
    caminho += "pages/";
}

function openGame() {
    document.location.href = caminho + "game.html";
}

function openCostumization() {
    document.location.href = caminho + "costumization.html";
}

function openInstructions() {
    document.location.href = caminho + "instructions.html";
}


function openIndex() {
    document.location.href = caminho + "../index.html";
}

function openLeaderboard() {
    document.location.href = caminho + "leaderboard.html";
}