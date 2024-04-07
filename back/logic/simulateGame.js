const { setup, nextMove, correction, updateBoard } = require('./equipeQuortnite');

// Initialiser l'état du jeu
let gameState = {
    opponentWalls: [],
    ownWalls: [],
    board: Array(9).fill().map((_, rowIndex) =>
        // Si l'index de la ligne est supérieur ou égal à 4 (la 5ème ligne et au-delà), remplir de -1
        rowIndex >= 5 ? Array(9).fill(-1) : Array(9).fill(0)
    ),
};

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Simuler une partie
async function simulateGame() {
    // Configurer les positions initiales des IA
    const player1Position = await setup(1);
    const player2Position = await setup(2);

    // Initialiser l'état du plateau avec les positions des joueurs
    gameState.board[0][0] = 1; // Joueur 1 position initiale
    gameState.board[8][8] = 2; // Joueur 2 position initiale

    console.log("État initial du plateau :");
    printBoard(gameState.board);

    let winner = null;

    // Continuer jusqu'à ce qu'un joueur atteigne la ligne de l'arrivée
    while (!winner) {
        for (let player = 1; player <= 2; player++) {
            console.log(`Tour du joueur ${player}:`);

            // Imprimer les listes des murs
            console.log("Murs du joueur 1 (Own Walls):", gameState.ownWalls);
            console.log("Murs du joueur 2 (Opponent Walls):", gameState.opponentWalls);

            // Obtenir et appliquer le prochain mouvement de l'IA
            const move = await nextMove(gameState,player);
            console.log("Mouvement choisi:", move);

            // Appliquer le mouvement à l'état du jeu
            // Cette partie doit être implémentée selon les règles de votre jeu
            // Mettre à jour gameState ici

            if (move.action === "wall") {
                // Ajouter le mur à la liste appropriée
                if (player === 1) {
                    gameState.ownWalls.push(move.value);
                } else {
                    gameState.opponentWalls.push(move.value);
                }

            } else if (move.action === "move") {
                // Appliquer le mouvement
                applyMoveToBoard(player, move, gameState.board);
            }


            await updateBoard(gameState);

            if (player === 2) {
                updateVisibility(player, gameState.board);
            }

            // Vérifier si le joueur a gagné
            if (hasPlayerWon(player, gameState.board)) {
                winner = player;
                console.log(`Le joueur ${winner} a gagné!`);
                break; // Sortir de la boucle si un joueur a gagné
            }

            // Afficher l'état mis à jour du plateau
            printBoard(gameState.board);
            await delay(1000);
        }
    }
}


// Fonction pour déterminer si un joueur a gagné
function hasPlayerWon(player, board) {
    // Condition de victoire pour le joueur 1 (atteindre la dernière ligne)
    if (player === 1) {
        return board[8].includes(1);
    }
    // Condition de victoire pour le joueur 2 (atteindre la première ligne)
    else if (player === 2) {
        return board[0].includes(2);
    }
    return false;
}

function applyMoveToBoard(player, move, board) {
    if (move.action === "move") {
        // Extraire les coordonnées de la valeur de mouvement
        const x = parseInt(move.value[0], 10)-1;
        const y = parseInt(move.value[1], 10)-1;


        // Effacer la position actuelle du joueur
        for (let i = 0; i < board.length; i++) {
                for (let j = 0; j < board[i].length; j++) {
                    if (board[i][j] === player) {
                        board[i][j] = 0; // Vider la position actuelle
                        break;
                    }
                }
            }

        // Appliquer le nouveau mouvement
        board[x][y] = player;
    }
    // Gérer ici d'autres types d'actions, comme "wall"
}


// Fonction pour afficher l'état du plateau
function printBoard(board) {
    board.forEach(row => {
        console.log(row.map(cell => cell === -1 ? 'X' : cell).join(' '));
    });
    console.log('\n');
}


function updateVisibility(player, board) {
    // Trouver la position actuelle du joueur
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j] === player) {
                // Rendre les cases adjacentes invisibles (-1)
                if (i > 0) board[i-1][j] = -1; // Case au-dessus
                if (i < board.length - 1) board[i+1][j] = -1; // Case en-dessous
                if (j > 0) board[i][j-1] = -1; // Case à gauche
                if (j < board[i].length - 1) board[i][j+1] = -1; // Case à droite
                return; // Sortie précoce après avoir mis à jour la visibilité
            }
        }
    }
}


simulateGame().catch(console.error);






