const socket = io("/api/gameOnline",{auth: {token: localStorage.getItem("token")}});
socket.emit('joinGame');

let currentPlayer = 'player1';
let player1Timer;
let player2Timer;
let playerRole;
let roomId;
let players = {
    player1: {x :null, y:null, symbol: 'P1'},
    player2: {x: null, y: null, symbol: 'P2'}
};

let player1Position = null;
let player2Position = null;
let currentAction = 'none';
const cells = [];
const turnTimeLimit = 40000;
let placedWallsPlayer1 = [];
let placedWallsPlayer2 = [];
let player1WallsRemaining = 10;
let player2WallsRemaining = 10;
let currentWallPlacement = null;
let wallPlayer1 = [];
let wallPlayer2 = [];
let visibilityChangedCells = new Set();
const boardSize = 9;


function createGameBoard() {
    const boardElement = document.getElementById('board');
    for (let row = 0; row < boardSize; row++) {
        for (let col = 0; col < boardSize; col++) {
            const cellElement = document.createElement('div');
            cellElement.classList.add('cell');
            cellElement.dataset.row = row;
            cellElement.dataset.col = col;
            boardElement.appendChild(cellElement);
            cellElement.addEventListener('click', handleCellClick);
        }
    }
}
socket.on('waitingForOpponent', (message) => {
    // Afficher un message d'attente pour l'utilisateur
    document.getElementById('matchmakingStatus').textContent = message;
    console.log(message);
});

socket.on('gameStart', (data) => {
    document.getElementById('matchmakingStatus').textContent = data.message;
    console.log(data.message);

    // Afficher le board du jeu et le bouton Quitter
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('quitGame').style.display = 'block';
    const board = document.getElementById('board');
    // Create the board cells
    for (let i = 0; i < 289; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');

        // Ajouter la classe 'border-column' aux colonnes paires (B à P)
        if (i % 17 >= 1 && i % 17 <= 15 && i % 2 === 1 && Math.floor(i / 17) % 2 === 0) {
            cell.classList.add('border-column');
            //cell.classList.remove('border-row');
            cell.addEventListener('click', () => handleWallClick(i, 'column'));
        }
        // Ajouter la classe 'border-row' aux lignes paires
        if (Math.floor(i / 17) % 2 !== 0) {
            cell.classList.add('border-row');
            //cell.classList.remove('border-column');
            cell.addEventListener('click', () => handleWallClick(i, 'row'));
        }

        board.appendChild(cell);
        cells.push(cell);

        // Add event listener for cell click
        cell.addEventListener('click', () => handleCellClick(i));
    }


    });
socket.on('opponentLeft',(message) => {
    //document.getElementById('gameStatus').textContent = message;
    // Peut-être cacher le plateau de jeu ou afficher un bouton pour retourner au menu principal
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('quitGame').style.display = 'none';
    // Optionnellement, rediriger l'utilisateur ou lui montrer un bouton pour démarrer une nouvelle recherche
});

socket.on('updateGameState', (updatedGameState) => {
    // Mettre à jour l'interface utilisateur avec le nouvel état du jeu
    updateUI(updatedGameState);
});

socket.on('invalidMove', (message) => {
    alert(message); // Affichez un message d'erreur
});

socket.on('invalidWallPlacement', (message) => {
    alert(message); // Affichez un message d'erreur
});


document.getElementById('quitGame').addEventListener('click', () => {
    socket.emit('disconnect');
    // Reset l'UI pour revenir à l'écran principal ou d'attente
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('quitGame').style.display = 'none';
    document.getElementById('gameStatus').textContent = "Vous avez quitté la partie. Recherche d'un adversaire...";
    // Éventuellement, réémettre un 'joinGame' si vous voulez que le joueur cherche immédiatement un autre jeu
});
