
// On load check for corPersonagem in sessionStorage
// If it exists, set the color of the character

const corPersonagem = sessionStorage.getItem('corPersonagem');
alterarCorPersonagem(corPersonagem);


function openGame() {
    document.location.href = "game.html";
}

function openCostumization() {
    document.location.href = "costumization.html";
}

function openInstructions() {
    
}