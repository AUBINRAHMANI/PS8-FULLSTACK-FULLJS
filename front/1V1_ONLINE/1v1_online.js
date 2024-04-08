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
function initializeGameBoard(playerRole) {
    const cells = [];
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

  // Supposons que vous avez une manière de référencer toutes les cellules du plateau

    // Déterminer les premières lignes pour le joueur et son adversaire
    const firstRow = playerRole === 'player1' ? 0 : 16;
    const oppositeFirstRow = playerRole === 'player1' ? 16 : 0;

    // Mettre en évidence la première ligne du joueur
    const firstRowCells = cells.filter((_, index) => Math.floor(index / 17) === firstRow);
    firstRowCells.forEach(firstRowCell => {
        firstRowCell.classList.add('first-row');
        // Initialiser les cellules de la première ligne en vert ou toute autre logique spécifique
        updateCellAppearance(firstRowCell, 1);
    });

    // Mettre en évidence la première ligne de l'adversaire
    const oppositeFirstRowCells = cells.filter((_, index) => Math.floor(index / 17) === oppositeFirstRow);
    oppositeFirstRowCells.forEach(oppositeFirstRowCell => {
        oppositeFirstRowCell.classList.add('first-row');
        // Vous pouvez choisir d'initialiser différemment les cellules de l'adversaire
        updateCellAppearance(oppositeFirstRowCell, 1);
    });
}
function updateCellAppearance(cell, visibility) {
    // Mettez à jour l'apparence de la cellule en fonction de la visibilité
    cell.classList.toggle('visible', visibility >= 0);
    cell.classList.toggle('hidden', visibility < 0);
}

socket.on('waitingForOpponent', (message) => {
    // Afficher un message d'attente pour l'utilisateur
    document.getElementById('matchmakingStatus').textContent = message;
    console.log(message);
});

socket.on('gameStart', (data) => {
    playerRole = data.role;
    roomId = data.roomId;
    document.getElementById('matchmakingStatus').textContent = data.message;
    console.log(data.message);

    // Afficher le board du jeu et le bouton Quitter
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('quitGame').style.display = 'block';
    initializeGameBoard();


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

socket.on('turnSwitched', (data) => {
    if (data.player === playerRole) {
        // Activer l'interface utilisateur pour le joueur
        enablePlayerUI();
    } else {
        // Désactiver l'interface utilisateur et montrer qu'il doit attendre
        disablePlayerUI();
    }
});

document.getElementById('quitGame').addEventListener('click', () => {
    socket.emit('disconnect');
    // Reset l'UI pour revenir à l'écran principal ou d'attente
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('quitGame').style.display = 'none';
    document.getElementById('gameStatus').textContent = "Vous avez quitté la partie. Recherche d'un adversaire...";
    // Éventuellement, réémettre un 'joinGame' si vous voulez que le joueur cherche immédiatement un autre jeu
});

function enablePlayerUI() {
    // Activer les clics sur la grille du jeu pour ce joueur
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.addEventListener('click', handleCellClick);
    });

    // Activer les boutons de validation et d'annulation pour le joueur actuel
    document.getElementById('validateButtonPlayer1').style.display = 'block';
    document.getElementById('cancelButtonPlayer1').style.display = 'block';
    // Si tu as des boutons séparés pour le joueur 2, ajuste selon ton besoin
    // document.getElementById('validateButtonPlayer2').style.display = 'block';
    // document.getElementById('cancelButtonPlayer2').style.display = 'block';

    // Modifier l'apparence pour indiquer que c'est au tour du joueur
    // Par exemple, changer la couleur du fond ou des bordures de certains éléments
    document.getElementById('gameBoard').classList.add('playerTurn');
}

function disablePlayerUI() {
    // Désactiver les clics sur la grille du jeu pour ce joueur
    document.querySelectorAll('.cell').forEach(cell => {
        cell.style.pointerEvents = 'none'; // Empêcher les clics
    });

    // Désactiver les boutons de validation et d'annulation pour le joueur actuel
    document.getElementById('validateButtonPlayer1').style.display = 'none';
    document.getElementById('cancelButtonPlayer1').style.display = 'none';
    // Si tu as des boutons séparés pour le joueur 2, ajuste selon ton besoin
    // document.getElementById('validateButtonPlayer2').style.display = 'none';
    // document.getElementById('cancelButtonPlayer2').style.display = 'none';

    // Modifier l'apparence pour indiquer que ce n'est pas le tour du joueur
    // Par exemple, changer la couleur du fond ou des bordures de certains éléments pour les rendre moins visibles
    document.getElementById('gameBoard').classList.remove('playerTurn');
}

function handleCellClick(cellIndex) {
    // Prépare l'action du joueur
    const action = { type: 'move', cellIndex, player: playerRole };

    // Envoyer l'action au serveur
    socket.emit('playerAction', { roomId, action });
}

socket.on('updateGameState', (updatedGameState) => {
    // Supposons que updatedGameState contienne :
    // - playerPositions: { player1: {x, y}, player2: {x, y} }
    // - walls: [ {type: "vertical", x, y}, {type: "horizontal", x, y} ]
    // - currentPlayer: "player1" ou "player2"

    // Mettre à jour les positions des joueurs sur le plateau
    updatePlayerPosition(updatedGameState.playerPositions.player1, 'player1');
    updatePlayerPosition(updatedGameState.playerPositions.player2, 'player2');

    // Mettre à jour les murs sur le plateau
    updatedGameState.walls.forEach(wall => {
        placeWall(wall);
    });

    // Mettre à jour l'interface utilisateur pour refléter qui est le joueur actuel
    if (updatedGameState.currentPlayer === playerRole) {
        enablePlayerUI(); // C'est le tour de ce joueur
    } else {
        disablePlayerUI(); // C'est le tour de l'adversaire
    }
});

function updatePlayerPosition(position, player) {
    // Trouver et mettre à jour la position du joueur sur le plateau
    const playerElement = document.querySelector(`.${player}`);
    // Supposons que tu as une fonction pour convertir la position {x, y} en id de cellule ou en index
    const cellId = positionToCellId(position);
    const newCell = document.getElementById(cellId);

    if (playerElement && newCell) {
        // Déplacer l'élément du joueur vers la nouvelle cellule
        newCell.appendChild(playerElement);
    }
}

function placeWall(wall) {
    // Trouver et placer un mur sur le plateau
    const wallElement = document.createElement('div');
    wallElement.className = 'wall';
    // Supposons que tu as une fonction pour convertir la position {x, y} et le type de mur en id de cellule ou en index
    const cellId = wallPositionToCellId(wall);
    const wallCell = document.getElementById(cellId);

    if (wallCell) {
        // Ajouter l'élément du mur à la cellule correspondante
        wallCell.appendChild(wallElement);
    }
}

// Exemple de fonction pour convertir la position {x, y} en id de cellule
function positionToCellId(position) {
    // Implémenter la logique de conversion basée sur ton implémentation spécifique du plateau
    return `cell-${position.x}-${position.y}`;
}

// Exemple de fonction pour convertir la position et le type de mur en id de cellule
function wallPositionToCellId(wall) {
    // Implémenter la logique de conversion basée sur ton implémentation spécifique du plateau et le type de mur
    return `wall-${wall.x}-${wall.y}-${wall.type}`;
}