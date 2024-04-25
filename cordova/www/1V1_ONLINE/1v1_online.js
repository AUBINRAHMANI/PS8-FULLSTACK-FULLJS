const socket = io("/api/gameOnline",{auth: {token: localStorage.getItem("token")}});
socket.emit('joinGame');

let currentPlayer = 'player1';
let lastGameStateUpdate = null;
let player1Timer;
let player2Timer;
let playerRole;
let roomId;
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
    //const cells = [];
    const board = document.getElementById('board');
    // Create the board cells
    for (let i = 0; i < 289; i++) {
        const cell = document.createElement('div');
        cell.classList.add('cell');
        cell.id = 'cell-' + i;
        cell.setAttribute('data-visibility', '0');

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
        createPlayerElements();
        // Ajoutez ces éléments au DOM, dans leurs positions de départ.
        // Vous devez déterminer où vous voulez les placer initialement.
        // Par exemple, si vous voulez les placer dans la première et la dernière ligne :

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

    setInitialVisibility(playerRole);
}

function setInitialVisibility(playerRole) {
    cells.forEach((cell, index) => {
        const row = Math.floor(index / 17);
        // Condition pour déterminer si la cellule doit être visible ou cachée
        if ((playerRole === 'player1' && row < 9) || (playerRole === 'player2' && row >= 9)) {
            cell.setAttribute('data-visibility', '1');
            updateCellAppearance(cell, 1); // Rendre la cellule visible
        } else {
            cell.setAttribute('data-visibility', '-1');
            updateCellAppearance(cell, -1); // Rendre la cellule cachée sous le brouillard de guerre
        }
    });
}

function initializeFogOfWar(startIndex) {
    startIndex = parseInt(startIndex);
    cells.forEach((cell, index) => {
        // Ici on va supposer une certaine logique pour la visibilité initiale, par exemple, tout est caché sauf la ligne de départ
        if (Math.abs(index - startIndex) > 34) {  // Plus d'une ligne de distance
            cell.classList.add('hidden');
        } else {
            cell.classList.add('visible');
        }
    });
}

function updateFogOfWar(playerPosition, visibilityChange, player) {
    const adjacentIndices = [
        playerPosition - 2,  // gauche
        playerPosition + 2,  // droite
        playerPosition - 34, // haut
        playerPosition + 34, // bas
        playerPosition
    ];

    adjacentIndices.forEach(index => {
        if (index >= 0 && index < cells.length) {
            const cell = cells[index];
            const currentVisibility = parseInt(cell.getAttribute('data-visibility')) || 0;
            const newVisibility = currentVisibility + visibilityChange;

            cell.setAttribute('data-visibility', newVisibility.toString());
            updateCellAppearance(cell, newVisibility);
            // Gérer la visibilité des éléments joueur dans la cellule
            updatePlayerVisibility(cell, newVisibility);
        }
    });
}
function updatePlayerVisibility(cell, visibility) {
    const players = cell.querySelectorAll('.player');
    players.forEach(player => {
        // Assurez-vous que la visibilité du joueur est mise à jour seulement si la cellule est visible
        player.style.visibility = (visibility > 0) ? 'visible' : 'hidden';
    });
}
function createPlayerElements() {
    const player1Element = document.createElement('div');
    player1Element.className = 'player player1';
    const player2Element = document.createElement('div');
    player2Element.className = 'player player2';

    // Ajouter les éléments à un endroit approprié dans votre DOM.
    // Par exemple, vous pouvez les ajouter temporairement à une cellule ou les garder hors du plateau jusqu'à ce que les positions initiales soient confirmées.
    // Si vous les ajoutez à des cellules spécifiques, assurez-vous que ces cellules existent.
    document.body.appendChild(player1Element);
    document.body.appendChild(player2Element);
}

function updateCellAppearance(cell, visibility) {
    // Mettez à jour l'apparence de la cellule en fonction de la visibilité
    if (cell) {
        cell.classList.toggle('visible', visibility >= 0);
        cell.classList.toggle('hidden', visibility < 0);
    } else {
        console.error('Tentative de mise à jour d\'une cellule qui n\'existe pas');
    }

}
function clearCellVisualState(cell) {
    // Supprimez toutes les classes liées à l'état visuel de la cellule
    cell.classList.remove('first-row');
    // Ajoutez ici d'autres classes à supprimer si nécessaire
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
    console.log(data.message, "Role:", playerRole);

    // Afficher le board du jeu et le bouton Quitter
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('quitGame').style.display = 'block';
    initializeGameBoard(playerRole);


});

socket.on('opponentJoined', (data) => {
    document.getElementById('matchmakingStatus').textContent = data.message;
    playerRole = data.role;
    roomId = data.roomId;
    console.log("Joueur opposant : " + playerRole + "roomId + " + roomId);
    // Maintenant que l'opposant a rejoint, vous pouvez initialiser le tableau de jeu pour le premier joueur
    // Assurez-vous que playerRole est défini pour le premier joueur

    // Afficher le plateau de jeu et le bouton pour quitter
    document.getElementById('gameBoard').style.display = 'block';
    document.getElementById('quitGame').style.display = 'block';
    console.log(data.message, "Role:", playerRole);
    initializeGameBoard(playerRole);
    console.log("Opposant rejoint");

});

socket.on('opponentLeft',(message) => {
    //document.getElementById('gameStatus').textContent = message;
    // Peut-être cacher le plateau de jeu ou afficher un bouton pour retourner au menu principal
    document.getElementById('gameBoard').style.display = 'none';
    document.getElementById('quitGame').style.display = 'none';
    // Optionnellement, rediriger l'utilisateur ou lui montrer un bouton pour démarrer une nouvelle recherche
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

function enablePlayerUI() {
    // Activer les clics sur la grille du jeu pour ce joueur
    const cells = document.querySelectorAll('.cell:not(.wall)');
    cells.forEach(cell => {
        if (playerRole === currentPlayer) {
            cell.addEventListener('click', handleCellClick);
        }
    });

    // Activer les boutons de validation et d'annulation pour le joueur actuel
    //  document.getElementById('validateButtonPlayer1').style.display = 'block'; A ACTIVER QUE QUAND IL CLIQUE ET LORSQUE IL VALIDE AVEC CE BOUTON ALORS CA ENVOIT LE TRUC
    //document.getElementById('cancelButtonPlayer1').style.display = 'block';
    // Si tu as des boutons séparés pour le joueur 2, ajuste selon ton besoin
    // document.getElementById('validateButtonPlayer2').style.display = 'block';
    // document.getElementById('cancelButtonPlayer2').style.display = 'block';

    // Modifier l'apparence pour indiquer que c'est au tour du joueur
    // Par exemple, changer la couleur du fond ou des bordures de certains éléments
    document.getElementById('gameBoard').classList.add('playerTurn');
}

function disablePlayerUI() {
    // Désactiver les clics sur la grille du jeu pour ce joueur
    const cells = document.querySelectorAll('.cell');
    cells.forEach(cell => {
        cell.removeEventListener('click', handleCellClick);
    });

    // Désactiver les boutons de validation et d'annulation pour le joueur actuel
    // document.getElementById('validateButtonPlayer1').style.display = 'none';
    // document.getElementById('cancelButtonPlayer1').style.display = 'none';
    // Si tu as des boutons séparés pour le joueur 2, ajuste selon ton besoin
    // document.getElementById('validateButtonPlayer2').style.display = 'none';
    // document.getElementById('cancelButtonPlayer2').style.display = 'none';

    // Modifier l'apparence pour indiquer que ce n'est pas le tour du joueur
    // Par exemple, changer la couleur du fond ou des bordures de certains éléments pour les rendre moins visibles
    document.getElementById('gameBoard').classList.remove('playerTurn');
}

let isInitialPlayer1 =true;
let isInitialPlayer2 = true;

function handleCellClick(cellIndex) {

    console.log("Current Player : " + currentPlayer + " Player Role = " + playerRole);
    const cell = cells[cellIndex];
    const visibility = parseInt(cell.getAttribute('data-visibility'));
  //  if (visibility > 0) {
    if (lastGameStateUpdate === null && currentPlayer === playerRole) {
        // Sélection initiale du joueur
        if ((playerRole === 'player1' && player1Position === null) || (playerRole === 'player2' && player2Position === null)) {
            //console.log("PlayerRolesssssssss : " + playerRole);
            console.log("Sélection initiale pour", playerRole, "à l'index", cellIndex);
            resetOppositeFirstRowBackgroundColor();
            if((playerRole==='player1')){
                isInitialPlayer1 = false;
            }
            if((playerRole==='player2')){
                isInitialPlayer2 = false;
            }
            socket.emit('selectInitialPosition', { cellIndex, playerRole, roomId });


        } else {
            console.log("Player has already a initial position")
            // Mouvement normal après la sélection initiale
            const action = { type: 'move', cellIndex, player: playerRole };
            console.log("Mouvement normal pour", playerRole, "à l'index", cellIndex);
            socket.emit('playerAction', { roomId, action });
        }
    } else {
        console.log("Ce n'est pas votre tour ou mise à jour de l'état du jeu en attente.");
    }
    //}
}
let temporaryWall;
function handleWallClick(cellIndex,wallType){
    if (currentPlayer === playerRole) {
        removeTemporaryWall();  // Nettoyer d'abord le mur temporaire
        displayTemporaryWall(cellIndex, wallType);
        temporaryWall = { cellIndex, wallType };
        showWallButtons();
    }

}

function validateWallPlacement() {

    if (!temporaryWall) {
        console.log("Aucun mur temporaire à valider.");
        return;
    }
    console.log("TEMPORARY INDEX CELLULE : " + temporaryWall.cellIndex);
    const additionalIndex = temporaryWall.wallType === 'row' ? temporaryWall.cellIndex + 2 : temporaryWall.cellIndex + 34;

    const action = {
        type: 'placeWall',
        wall: {
            cellIndices: [temporaryWall.cellIndex, additionalIndex],
            wallType: temporaryWall.wallType,
            player: currentPlayer,
        }
    };

    socket.emit('playerAction', {
        roomId: roomId,
        action: action
    });


    removeTemporaryWall();
    temporaryWall = null;
    hideWallButtons();

}




function cancelWallPlacement(){
    removeTemporaryWall();
    temporaryWall = null;
    hideWallButtons();
}


function showWallButtons(playerRole) {
    const validateBtn = document.getElementById(`validateButtonPlayer${currentPlayer === 'player1' ? '1' : '2'}`);
    const cancelBtn = document.getElementById(`cancelButtonPlayer${currentPlayer === 'player1' ? '1' : '2'}`);

    validateBtn.style.display = 'inline';
    cancelBtn.style.display = 'inline';

}

function hideWallButtons(){
    const validateBtn = document.getElementById(`validateButtonPlayer${currentPlayer === 'player1' ? '1' : '2'}`);
    const cancelBtn = document.getElementById(`cancelButtonPlayer${currentPlayer === 'player1' ? '1' : '2'}`);

    validateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

function displayTemporaryWall(cellIndex, wallType){
    const cell = cells[cellIndex];
    const adjacentCellIndex = wallType === 'column' ? cellIndex + 34 : cellIndex + 2;

    if (cell && !cell.classList.contains('wall')) {
        cell.classList.add('temporary-wall'); // Ajouter une classe spécifique pour l'aperçu
        cell.style.backgroundColor = 'grey'; // Couleur temporaire pour l'aperçu

        // Appliquer le style à la cellule adjacente pour les murs qui prennent deux cellules
        const adjacentCell = cells[adjacentCellIndex];
        if (adjacentCell && !adjacentCell.classList.contains('wall')) {
            adjacentCell.classList.add('temporary-wall');
            adjacentCell.style.backgroundColor = 'grey';

        }
    }

    // Gestion de l'annulation du placement du mur temporaire
    document.getElementById(`cancelButtonPlayer${currentPlayer === 'player1' ? '1' : '2'}`).addEventListener('click', function() {
        removeTemporaryWall(cellIndex, wallType);
    });
}

function removeTemporaryWall(cellIndex, wallType) {
    // Récupérer la cellule correspondante dans le tableau
    // Retirer tous les murs temporaires du plateau
    const temporaryWalls = document.querySelectorAll('.temporary-wall');
    temporaryWalls.forEach(cell => {
        cell.classList.remove('temporary-wall');
        cell.style.backgroundColor = ''; // Enlever la couleur
    });

    // Réinitialiser l'objet de mur temporaire
    temporaryWall = null;
}

document.getElementById('validateButtonPlayer1').addEventListener('click', validateWallPlacement);
document.getElementById('cancelButtonPlayer1').addEventListener('click', cancelWallPlacement);
document.getElementById('validateButtonPlayer2').addEventListener('click', validateWallPlacement);
document.getElementById('cancelButtonPlayer2').addEventListener('click', cancelWallPlacement);

socket.on('updateGameState', (updatedGameState) => {
    // Planifier le traitement de la dernière mise à jour reçue
    if (updatedGameState.playerPositions) {
        updatePlayerPosition(updatedGameState.playerPositions.player1, 'player1');
        updatePlayerPosition(updatedGameState.playerPositions.player2, 'player2');
    }
    if(playerRole==='player1' && isInitialPlayer1 === false){
        player1Position = updatedGameState.playerPositions;
    }
    else if (playerRole==='player2' && isInitialPlayer2 === false ){
        player2Position = updatedGameState.playerPositions;
    }

    if (updatedGameState.walls) {
        updatedGameState.walls.forEach(wall => {
            placeWall(wall.cellIndex, wall.wallType);
        });
    }

    lastGameStateUpdate = updatedGameState;
    console.log("UpdateGameState : "+ updatedGameState);
    setTimeout(processLastGameStateUpdate, 0);
});


function resetOppositeFirstRowBackgroundColor() {
    // Déterminer la rangée opposée en fonction du joueur actuel

    const oppositeFirstRow = currentPlayer === 'player1' ? 0 : 16;

    // Retrouver toutes les cellules de la première ligne du joueur opposé et réinitialiser leur couleur de fond
    for (let i = 0; i < 17; i++) {
        cells[oppositeFirstRow * 17 + i].classList.remove('first-row');
    }
}
function processLastGameStateUpdate() {
    if (lastGameStateUpdate) {
        const updatedGameState = lastGameStateUpdate;
        lastGameStateUpdate = null;

        // Logique pour mettre à jour l'interface utilisateur avec la dernière mise à jour d'état
        updateUIBasedOnGameState(updatedGameState);
    }
}

function updateUIBasedOnGameState(updatedGameState) {
    // Votre logique existante pour mettre à jour l'UI basée sur l'état du jeu
    console.log("Mise à jour de l'état du jeu reçue :", updatedGameState);

    if (updatedGameState.playerPositions && updatedGameState.playerPositions.player1) {
        console.log("On met la position Player 1, x : " + updatedGameState.playerPositions.player1.x + "y : "+ updatedGameState.playerPositions.player1.y );
        updatePlayerPosition(updatedGameState.playerPositions.player1, 'player1');
    }
    if (updatedGameState.playerPositions && updatedGameState.playerPositions.player2){
        console.log("On met la position Player 1, x : " + updatedGameState.playerPositions.player2.x + + "y : "+ updatedGameState.playerPositions.player2.y );
        updatePlayerPosition(updatedGameState.playerPositions.player2, 'player2');
    }
// Traitez également ici les autres parties de l'état du jeu reçu, comme la position des murs, etc.
    updatedGameState.walls.forEach(wall => {
        placeWall(wall);
    });

    currentPlayer = updatedGameState.currentPlayer;
    console.log("Player current : " + currentPlayer);
    console.log("Player role : " + playerRole);

}

function updatePlayerPosition(position, player) {
    if (position && typeof position.x === 'number' && typeof position.y === 'number') {
        const oldPositionIndex = player === 'player1' ? player1Position : player2Position;
        const newPositionIndex = position.y + position.x*17;
        const oldCell = cells[oldPositionIndex];
        const newCell = cells[newPositionIndex];
        let playerElement = document.querySelector(`.${player}`);

        // Mettre à jour l'ancienne position pour réduire la visibilité
        if (oldPositionIndex != null) {
            updateFogOfWar(oldPositionIndex, -1, player);
        }

        // Ajouter ou déplacer l'élément du joueur à la nouvelle position
        if (!playerElement) {
            playerElement = document.createElement('div');
            playerElement.className = `player ${player}`;
            document.body.appendChild(playerElement);
        }

        if (newCell && playerElement) {
            if (!newCell.contains(playerElement)) {
                newCell.appendChild(playerElement);
            }
            updateFogOfWar(newPositionIndex, 1, player); // Augmenter la visibilité autour de la nouvelle position
        } else {
            console.error('Position invalide fournie à updatePlayerPosition:', position);
        }

        // Mettre à jour la position stockée
        if (player === 'player1') {
            player1Position = newPositionIndex;
        } else {
            player2Position = newPositionIndex;
        }
    }
}

function placeWall(wall) {
    console.log("Tentative de placement d'un mur:", wall);
    // Trouver et placer un mur sur le plateau
    const wallCell = document.getElementById(`cell-${wall.cellIndex}`);
    if (wallCell) {
        // Si la cellule existe, on ajoute la classe 'wall'
        wallCell.classList.add('wall');
        wallCell.style.backgroundColor = 'orange'; // Choisir une couleur qui signifie un mur permanent
        console.log(`Placement d'un mur à l'index cell-${wall.cellIndex} (${wall.wallType})`);
    } else {
        console.error('Cannot place wall, cell not found:', `cell-${wall.cellIndex}`);
    }
}