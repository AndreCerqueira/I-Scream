function spawnPlayer() {
    const tabuleiro = document.getElementById('tabuleiro');
    if (!tabuleiro) {
        console.error('Tabuleiro não encontrado');
        return null;
    }

    const cells = tabuleiro.getElementsByClassName('celula');
    if (cells.length === 0) {
        console.error('Nenhuma célula encontrada no tabuleiro');
        return null;
    }

    // Índices dos cantos do tabuleiro
    const cornerIndices = [0, 2, 6, 8];

    // Selecionar um índice de canto aleatório
    const randomIndex = cornerIndices[Math.floor(Math.random() * cornerIndices.length)];
    const cornerCell = cells[randomIndex];

    const characterHTML = `
        <div id="character-container" class="character-container">
            <div class="ice-cream">
                <div class="glare"></div>
                <div class="face">
                    <div class="eyes">
                        <div class="eye left"></div>
                        <div class="eye right"></div>
                    </div>
                    <div class="mouth"></div>
                </div>
            </div>
            <div class="stick"></div>
        </div>
    `;

    cornerCell.innerHTML += characterHTML;

    const numRows = 3;
    const numCols = 3;
    const row = Math.floor(randomIndex / numRows);
    const col = randomIndex % numCols;

    // Retornar a posição (linha, coluna)
    return { x: row, y: col };
}

function removePlayer() {
    const character = document.querySelector('.character-container');
    if (character) character.remove();
}

function changeCharacterColor(cor, element = document) {
    const cores = {
        pink: {
            background: '#F982BF',
            lights: '#FF98CC',
            shadow: '#962b62',
            glare: '#FF98CC',
            eye: '#FF2995',
            mouth: '#FF2995'
        },
        yellow: {
            background: '#F9E07F',
            lights: '#fff9aa',
            shadow: '#b89b3b',
            glare: '#fff9aa',
            eye: '#c49318',
            mouth: '#c49318'
        },
        green: {
            background: '#8CF982',
            lights: '#abffae',
            shadow: '#4a7f4e',
            glare: '#abffae',
            eye: '#228B22',
            mouth: '#228B22'
        }
    };

    const corCSS = cores[cor];

    if (!corCSS) {
        console.error('Unrecognized color:', cor);
        return;
    }

    const iceCreams = element.querySelectorAll('.ice-cream');
    const glares = element.querySelectorAll('.glare');
    const eyes = element.querySelectorAll('.eye');
    const mouths = element.querySelectorAll('.mouth');
    const titles = element.querySelectorAll('.title');

    iceCreams.forEach(iceCream => {
        iceCream.style.backgroundColor = corCSS['background'];
        iceCream.style.borderTopColor = corCSS['lights'];
    });

    glares.forEach(glare => {
        glare.style.backgroundColor = corCSS['glare'];
    });

    eyes.forEach(eye => {
        eye.style.backgroundColor = corCSS['eye'];
        eye.style.borderBottomColor = corCSS['lights'];
    });

    mouths.forEach(mouth => {
        mouth.style.backgroundColor = corCSS['mouth'];
        mouth.style.borderBottomColor = corCSS['lights'];
    });

    titles.forEach(title => {
        title.style.color = corCSS['lights'];
        title.style.textShadow = `0 0 10px ${corCSS['shadow']}`;
    });
}

function getFlavorId(characterColor){
    const flavors = {
        pink: 1,
        yellow: 2,
        green: 3
    };
    return flavors[characterColor];
}

function getFlavorName(flavorId){
    const flavors = {
        1: 'pink',
        2: 'yellow',
        3: 'green'
    };
    return flavors[flavorId];
}

function getTodayDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = (today.getMonth() + 1).toString().padStart(2, '0'); // padStart ensures that month is always two digits
    const day = today.getDate().toString().padStart(2, '0'); // padStart ensures that day is always two digits
    return `${year}-${month}-${day}`;
}