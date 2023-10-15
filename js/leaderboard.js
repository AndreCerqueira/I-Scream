
import { app } from './configDB.js';

// Importa o Firestore
import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, doc, deleteDoc } from "./firebase-firestore.js";

const db = getFirestore(app);

let devRank = 0;
let artistRank = 0;
let devRankToday = 0;
let artistRankToday = 0;
async function getAllTimeLeaderboard() {
    const leaderboardCollection = collection(db, 'leaderboard');
    const q = query(leaderboardCollection, orderBy('score', 'desc'), orderBy('date'));
    
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardTable = document.getElementById('leaderboardTableAllTime').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Limpa a tabela existente

    const players = {};

    leaderboardSnapshot.forEach(doc => {
        const data = doc.data();
        if (!players[data.name] || players[data.name].score < data.score) {
            players[data.name] = data; // Armazena o score mais alto para cada jogador
        }
    });

    const sortedPlayers = Object.values(players).sort((a, b) => b.score - a.score).slice(0, 10); // Pega os top 10 jogadores

    let rank = 1; // Adiciona um contador de rank

    let totalScores = { 1: 0, 2: 0, 3: 0 };
    let totalPoints = 0;

    sortedPlayers.forEach(data => {
        totalScores[data.flavor] += data.score;
        totalPoints += data.score;
        const row = leaderboardTable.insertRow();

        // Adiciona a classe CSS correta com base no rank
        if (rank === 1) {
            row.className = 'gold';
            row.insertCell().innerHTML = `<img src="../img/golden-cup.png" width="40">`;
        } else if (rank === 2) {
            row.className = 'silver';
            row.insertCell().innerHTML = `<img src="../img/silver-cup.png" width="40">`;
        } else if (rank === 3) {
            row.className = 'bronze';
            row.insertCell().innerHTML = `<img src="../img/bronze-cup.png" width="40">`;
        } else {
            row.insertCell().innerText = rank;
        }

        row.insertCell().innerText = data.name;
        row.insertCell().innerText = data.score;

        const flavorCell = row.insertCell();
        const icon = document.createElement('div');
        icon.className = 'character-container';
        icon.innerHTML = `
        <div class="character-container">
            <div class="ice-cream">
            <div class="glare"></div>
            <div class="face">
            <div class="eyes">
            <div class="eye left">
            </div>
            <div class="eye right">
            </div>
            </div>
            <div class="mouth"></div>
            </div>
            </div>
            <div class="stick"></div>
        </div>
        `;
        flavorCell.appendChild(icon);
        changeCharacterColor(getFlavorName(data.flavor), icon);

        if (data.name.toLowerCase() === 'né') {
            devRank = rank;
        }
        if (data.name.toLowerCase() === 'orange') {
            artistRank = rank;
        }

        rank++; // Incrementa o contador de rank
    });

    // Atualiza a largura das barras de sabor com base na porcentagem do total de pontos
    if (totalPoints > 0) {
        Object.keys(totalScores).forEach(flavor => {
            const percentage = (totalScores[flavor] / totalPoints) * 100;
            const scoreBar = document.getElementById(`${flavor}Score`);
            scoreBar.style.width = `${percentage}%`;
    
            // Adiciona a pontuação dentro da barra de progresso
            const scoreText = scoreBar.querySelector('.score-text');
            scoreText.textContent = totalScores[flavor];
        });
    }
    document.getElementById('flavorScores').style.display = 'flex';

    if (artistRank != 0){
        const artistWarning = document.createElement('div');
        artistWarning.innerHTML = `
            <div class="artist-container">
                <div class="icon">
                    <div class="arrow"></div>
                </div>
                <div class="artist-info">
                    <span class="artist-text">This chad is an artist. 😶</span>
                </div>
            </div>
        `;
    
        const row = document.getElementById('leaderboardTableAllTime').rows[artistRank];
        const rect = row.getBoundingClientRect();
        artistWarning.style.position = 'absolute';
        artistWarning.style.right = `${window.innerWidth - rect.left + window.scrollX + 120}px`; // Modificado para aparecer à esquerda
        artistWarning.style.top = `${rect.top + window.scrollY - 20}px`;
    
        document.body.appendChild(artistWarning);
    }

    if (devRank != 0){
        const devWarning = document.createElement('div');
        devWarning.innerHTML = `
            <div class="dev-container">
                <div class="icon">
                    <div class="arrow"></div>
                </div>
                <div class="dev-info">
                    <span class="dev-text">This dude is the dev. 😐</span>
                </div>
            </div>
        `;

        const row = document.getElementById('leaderboardTableAllTime').rows[devRank]; // +1 para ignorar o cabeçalho da tabela

        // Posiciona o aviso ao lado da linha do usuário "ne"
        const rect = row.getBoundingClientRect();
        devWarning.style.position = 'absolute';
        devWarning.style.left = `${rect.right + window.scrollX + 10}px`; // 10px para dar um pequeno espaço entre o aviso e a tabela
        devWarning.style.top = `${rect.top + window.scrollY - 20}px`;

        document.body.appendChild(devWarning);
    }
}

// Adicionar um novo score ao leaderboard no Firestore
window.updateLeaderboard = async function(bestScoreToday, flavor) {
    try {
        const name = sessionStorage.getItem("characterName");
        const leaderboardCollection = collection(db, 'leaderboard');

        const today = new Date();
        today.setHours(0, 0, 0, 0); // Define a hora para meia-noite

        const tomorrow = new Date(today);
        tomorrow.setDate(today.getDate() + 1); // Define para a meia-noite de amanhã

        // Consulta para encontrar registros do dia atual com o mesmo nome de usuário
        const q = query(
            leaderboardCollection, 
            where("name", "==", name),
            where("date", ">=", today), 
            where("date", "<", tomorrow)
        );

        const querySnapshot = await getDocs(q);

        // Itera sobre os resultados
        let foundToday = false;
        querySnapshot.forEach(async (document) => {
            const data = document.data();

            if (data.score >= bestScoreToday) {
                bestScoreToday = data.score;
                foundToday = true;
            }

            // Verifica se o novo score é melhor que o antigo para o dia de hoje
            if (bestScoreToday > data.score) {
                // Apaga o registro antigo do dia de hoje
                await deleteDoc(doc(db, 'leaderboard', document.id));
            }
        });

        if (foundToday)
            return;

        // Adiciona o novo score se for o melhor do dia de hoje
        const newScore = {
            name: name,
            score: bestScoreToday,
            date: new Date(), // Ajusta para a data e hora atuais
            flavor: flavor
        };

        await addDoc(leaderboardCollection, newScore);

    } catch (error) {
        console.error("Error updating leaderboard: ", error);
    }
}


async function getTodaysLeaderboard() {
    const leaderboardCollection = collection(db, 'leaderboard');

    // Obtém a data de hoje no formato YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define a hora para meia-noite

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1); // Define para a meia-noite de amanhã

    // Consulta para encontrar registros do dia atual
    const q = query(
        leaderboardCollection, 
        where("date", ">=", today), 
        where("date", "<", tomorrow), 
        orderBy('date')
    );
    
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardTable = document.getElementById('leaderboardTableDaily').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Limpa a tabela existente

    // Cria um array para armazenar os dados recuperados
    const leaderboardData = [];
    leaderboardSnapshot.forEach(doc => {
        leaderboardData.push(doc.data());
    });

    // Ordena o array com base no score em ordem decrescente
    leaderboardData.sort((a, b) => b.score - a.score);

    let rank = 1; // Adiciona um contador de rank

    leaderboardData.forEach(data => {

        // Limita o número de linhas a 10
        if (rank > 10)
            return;
            
        const row = leaderboardTable.insertRow();

        // Adiciona a classe CSS correta com base no rank
        if (rank === 1) {
            row.className = 'gold';
            row.insertCell().innerHTML = `<img src="../img/medal-1.png" width="40">`;
        } else if (rank === 2) {
            row.className = 'silver';
            row.insertCell().innerHTML = `<img src="../img/medal-2.png" width="40">`;
        } else if (rank === 3) {
            row.className = 'bronze';
            row.insertCell().innerHTML = `<img src="../img/medal-3.png" width="40">`;
        } else {
            row.insertCell().innerText = rank;
        }

        row.insertCell().innerText = data.name;
        row.insertCell().innerText = data.score;

        const flavorCell = row.insertCell();
        const icon = document.createElement('div');
        icon.className = 'character-container';
        icon.innerHTML = `
        <div class="character-container">
            <div class="ice-cream">
            <div class="glare"></div>
            <div class="face">
            <div class="eyes">
            <div class="eye left">
            </div>
            <div class="eye right">
            </div>
            </div>
            <div class="mouth"></div>
            </div>
            </div>
            <div class="stick"></div>
        </div>
        `;
        flavorCell.appendChild(icon);
        changeCharacterColor(getFlavorName(data.flavor), icon);

        if (data.name.toLowerCase() === 'né') {
            devRank = rank;
        }
        if (data.name.toLowerCase() === 'orange') {
            artistRank = rank;
        }

        rank++; // Incrementa o contador de rank
    });
}

async function getYesterdaysLeaderboard() {
    const leaderboardCollection = collection(db, 'leaderboard');

    // Obtém a data de ontem e hoje no formato YYYY-MM-DD
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Define a hora para meia-noite

    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1); // Define para a meia-noite de ontem

    // Consulta para encontrar registros do dia anterior
    const q = query(
        leaderboardCollection, 
        where("date", ">=", yesterday), 
        where("date", "<", today), 
        orderBy('date')
    );
    
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardTable = document.getElementById('leaderboardTableYesterday').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Limpa a tabela existente

    // Cria um array para armazenar os dados recuperados
    const leaderboardData = [];
    leaderboardSnapshot.forEach(doc => {
        leaderboardData.push(doc.data());
    });

    // Ordena o array com base no score em ordem decrescente
    leaderboardData.sort((a, b) => b.score - a.score);

    let rank = 1; // Adiciona um contador de rank

    leaderboardData.forEach(data => {

        // Limita o número de linhas a 10
        if (rank > 10)
            return;
            
        const row = leaderboardTable.insertRow();

        // Adiciona a classe CSS correta com base no rank
        if (rank === 1) {
            row.className = 'gold';
            row.insertCell().innerHTML = `<img src="../img/medal-1.png" width="40">`;
        } else if (rank === 2) {
            row.className = 'silver';
            row.insertCell().innerHTML = `<img src="../img/medal-2.png" width="40">`;
        } else if (rank === 3) {
            row.className = 'bronze';
            row.insertCell().innerHTML = `<img src="../img/medal-3.png" width="40">`;
        } else {
            row.insertCell().innerText = rank;
        }

        row.insertCell().innerText = data.name;
        row.insertCell().innerText = data.score;

        const flavorCell = row.insertCell();
        const icon = document.createElement('div');
        icon.className = 'character-container';
        icon.innerHTML = `
        <div class="character-container">
            <div class="ice-cream">
            <div class="glare"></div>
            <div class="face">
            <div class="eyes">
            <div class="eye left">
            </div>
            <div class="eye right">
            </div>
            </div>
            <div class="mouth"></div>
            </div>
            </div>
            <div class="stick"></div>
        </div>
        `;
        flavorCell.appendChild(icon);
        changeCharacterColor(getFlavorName(data.flavor), icon);

        rank++; // Incrementa o contador de rank
    });
}


if (window.location.pathname.includes('/leaderboard.html')){

    document.getElementById('flavorScores').style.display = 'none';
    
    getAllTimeLeaderboard(); // Chama a função quando a página é carregada
    getTodaysLeaderboard();
    getYesterdaysLeaderboard();
    getTopAwardsLeaderboard();

    changeCharacterColor("pink", document.getElementById('pink-character'));
    changeCharacterColor("yellow", document.getElementById('yellow-character'));
    changeCharacterColor("green", document.getElementById('green-character'));

// Adiciona um observador para verificar se a tabela "All Time" está visível
const observer = new IntersectionObserver(entries => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            // Se a tabela "All Time" está visível

            try {
                document.querySelector('.dev-container').style.display = 'flex';
            } catch (error) {
            }

            try {
                document.querySelector('.artist-container').style.display = 'flex';
            } catch (error) {
            }
        } else {
            // Se a tabela "All Time" não está visível

            try {
                document.querySelector('.dev-container').style.display = 'none';
            } catch (error) {
            }

            try {
                document.querySelector('.artist-container').style.display = 'none';
            } catch (error) {
            }
        }
    });
}, { threshold: 0.1 });  // Ajuste o threshold conforme necessário

// Observa a tabela "All Time" para detectar quando ela entra ou sai da viewport
observer.observe(document.getElementById('leaderboardTableAllTime'));

}

async function getTopAwardsLeaderboard() {
    const leaderboardCollection = collection(db, 'leaderboard');
    const q = query(leaderboardCollection, orderBy('date'));
    
    const leaderboardSnapshot = await getDocs(q);
    const players = {};

    leaderboardSnapshot.forEach(doc => {
        const data = doc.data();
        const date = data.date.toDate(); // Convertendo Timestamp para Date
        const dateString = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`; // Formatando a data

        if (!players[dateString]) {
            players[dateString] = [];
        }

        players[dateString].push(data);
    });

    const awards = {};

    Object.values(players).forEach(dayPlayers => {
        // Ordena o array com base no score em ordem decrescente
        dayPlayers.sort((a, b) => b.score - a.score || a.date.toDate().getTime() - b.date.toDate().getTime());

        dayPlayers.forEach((player, index) => {
            if (!awards[player.name]) {
                awards[player.name] = { gold: 0, silver: 0, bronze: 0, all_time_1st: 0, all_time_2nd: 0, all_time_3rd: 0, points: 0 };
            }

            if (index === 0) {
                awards[player.name].gold++;
                awards[player.name].points += 3;
            } else if (index === 1) {
                awards[player.name].silver++;
                awards[player.name].points += 2;
            } else if (index === 2) {
                awards[player.name].bronze++;
                awards[player.name].points++;
            }
        });
    });

    // Adicionando pontos extras para os jogadores no top 3 do placar de todos os tempos
    const allTimeTopPlayers = await getAllTimeTopPlayers(); // Você precisa implementar esta função
    allTimeTopPlayers.forEach((player, index) => {
        if (awards[player.name]) {
            if (index === 0) {
                awards[player.name].all_time_1st++;
                awards[player.name].points += 10;
            } else if (index === 1) {
                awards[player.name].all_time_2nd++;
                awards[player.name].points += 5;
            } else if (index === 2) {
                awards[player.name].all_time_3rd++;
                awards[player.name].points += 3;
            }
        }
    });

    const sortedPlayers = Object.entries(awards).sort((a, b) => b[1].points - a[1].points);
    const leaderboardTable = document.getElementById('leaderboardTableMedalists').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Limpa a tabela existente

    sortedPlayers.slice(0, 10).forEach(([name, awards], index) => {
        const row = leaderboardTable.insertRow();
        let rank = index + 1;

        // Adiciona a classe CSS correta com base no rank
        if (rank === 1) {
            row.className = 'gold';
            row.insertCell().innerHTML = `<img src="../img/gold-medal.png" width="40">`;
        } else if (rank === 2) {
            row.className = 'silver';
            row.insertCell().innerHTML = `<img src="../img/silver-medal.png" width="40">`;
        } else if (rank === 3) {
            row.className = 'bronze';
            row.insertCell().innerHTML = `<img src="../img/bronze-medal.png" width="40">`;
        } else {
            row.insertCell().innerText = rank;
        }

        row.insertCell().innerText = name;
        row.insertCell().innerText = awards.points;

        const awardsCell = row.insertCell();
        const medalsHTML = [];

        if (awards.all_time_1st > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/golden-cup.png" width="40">
                            </div>`);
        }

        if (awards.all_time_2nd > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/silver-cup.png" width="40">
                            </div>`);
        }

        if (awards.all_time_3rd > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/bronze-cup.png" width="40">
                            </div>`);
        }

        if (awards.gold > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/medal-1.png" width="40"> x${awards.gold}
                             </div>`);
        }

        if (awards.silver > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/medal-2.png" width="40"> x${awards.silver}
                             </div>`);
        }

        if (awards.bronze > 0) {
            medalsHTML.push(`<div class="medal-item">
                                <img src="../img/medal-3.png" width="40"> x${awards.bronze}
                             </div>`);
        }

        awardsCell.innerHTML = `<div class="awards-cell">
                                    <div class="medal-container">
                                        ${medalsHTML.join('')}
                                    </div>
                                </div>`;
    });
}

// Função para obter os top 3 jogadores de todos os tempos
async function getAllTimeTopPlayers() {
    const leaderboardCollection = collection(db, 'leaderboard');
    const q = query(leaderboardCollection, orderBy('score', 'desc'), orderBy('date'));
    
    const leaderboardSnapshot = await getDocs(q);
    const topPlayers = [];

    let limit = 3;
    leaderboardSnapshot.forEach(doc => {
        topPlayers.push(doc.data());

        if (--limit === 0) {
            return;
        }
    });

    return topPlayers;
}


