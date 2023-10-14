
import { app } from './configDB.js';

// Importa o Firestore
import { getFirestore, collection, query, where, orderBy, limit, getDocs, addDoc, doc, deleteDoc } from "./firebase-firestore.js";

const db = getFirestore(app);

async function getLeaderboard() {
    const leaderboardCollection = collection(db, 'leaderboard');
    const q = query(leaderboardCollection, orderBy('score', 'desc'), limit(10)); // Ordena por score e limita para o top 10
    const leaderboardSnapshot = await getDocs(q);
    const leaderboardTable = document.getElementById('leaderboardTable').getElementsByTagName('tbody')[0];
    leaderboardTable.innerHTML = ''; // Limpa a tabela existente

    let rank = 1; // Adiciona um contador de rank

    let totalScores = { 1: 0, 2: 0, 3: 0 };
    let totalPoints = 0;

    leaderboardSnapshot.forEach(doc => {
        const data = doc.data();
        totalScores[data.flavor] += data.score;
        totalPoints += data.score;
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
        // flavorCell.innerText = data.flavor;
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
}

// Adicionar um novo score ao leaderboard no Firestore
window.updateLeaderboard = async function(score, flavor) {
    try {
        const name = sessionStorage.getItem("characterName");
        const leaderboardCollection = collection(db, 'leaderboard');
        let haveBetterScore = false;

        // Consulta para encontrar registros com o mesmo nome de usuário
        const q = query(leaderboardCollection, where("name", "==", name));
        const querySnapshot = await getDocs(q);

        // Itera sobre os resultados
        querySnapshot.forEach(async (document) => {
            const data = document.data();

            if (data.score >= score) {
                haveBetterScore = true;
            }

            // Verifica se o novo score é melhor que o antigo
            if (score > data.score) {
                // Apaga o registro antigo
                await deleteDoc(doc(db, 'leaderboard', document.id));
            }
        });

        // Verifica se o novo score é melhor que o antigo
        if (haveBetterScore) {
            return;
        }

        // Adiciona o novo score
        const newScore = {
            name: name,
            score: score,
            date: new Date(),
            flavor: flavor
        };
        await addDoc(leaderboardCollection, newScore);

    } catch (error) {
    }
}

if (window.location.pathname.includes('/leaderboard.html')){

    document.getElementById('flavorScores').style.display = 'none';
    
    getLeaderboard(); // Chama a função quando a página é carregada

    changeCharacterColor("pink", document.getElementById('pink-character'));
    changeCharacterColor("yellow", document.getElementById('yellow-character'));
    changeCharacterColor("green", document.getElementById('green-character'));
}