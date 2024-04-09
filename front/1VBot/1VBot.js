const socket = io("/api/games",{auth: {token: localStorage.getItem("token")}});
// script.sockets
let currentPlayer = 'player1';
let player1Timer;
let player2Timer;
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

document.addEventListener('DOMContentLoaded', () => {
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


    // Appliquer la classe 'first-row' aux cellules de la première ligne du joueur actuel
    const firstRow = currentPlayer === 'player1' ? 0 : 16;
    const firstRowCells = cells.filter((_, index) => Math.floor(index / 17) === firstRow);
    firstRowCells.forEach(firstRowCell => {
        firstRowCell.classList.add('first-row');
        // Initialiser les cellules de la première ligne en vert
        updateCellAppearance(firstRowCell, 1);
    });

    // Appliquer la classe 'first-row' aux cellules de la première ligne du joueur opposé
    const oppositePlayer = currentPlayer === 'player1' ? 'player2' : 'player1';
    const oppositeFirstRow = firstRow === 0 ? 16 : 0; // Inverser la rangée pour le joueur opposé
    const oppositeFirstRowCells = cells.filter((_, index) => Math.floor(index / 17) === oppositeFirstRow);
    oppositeFirstRowCells.forEach(oppositeFirstRowCell => {
        oppositeFirstRowCell.classList.add('first-row');
        // Initialiser les cellules de la première ligne en vert pour le joueur opposé
        updateCellAppearance(oppositeFirstRowCell, 1);
    });


    board.addEventListener('click', handleInitialCellClick);
    startPlayerTimer(); //A remettre si on séparre la sauvgarde de la partie normale
    //loadGameState();

    emitGameState();
    const gameId = localStorage.getItem('gameId');
    if (gameId) {
        socket.emit('requestGameState', gameId);
    }
});

function formatTime(timeInMillis) {
    let minutes = Math.floor(timeInMillis / 60000);
    let seconds = ((timeInMillis % 60000) / 1000).toFixed(0);
    return minutes + ":" + (seconds < 10 ? '0' : '') + seconds;
}


// Ajoute ces lignes dans la fonction 'DOMContentLoaded' après la création des éléments HTML
document.getElementById('validateButtonPlayer1').addEventListener('click', handleValidateButtonClickPlayer1);
document.getElementById('validateButtonPlayer2').addEventListener('click', handleValidateButtonClickPlayer2);
document.getElementById('cancelButtonPlayer1').addEventListener('click', handleCancelButtonClickPlayer1);
document.getElementById('cancelButtonPlayer2').addEventListener('click', handleCancelButtonClickPlayer2);
document.getElementById('quitButton').addEventListener('click', handleQuitButtonClick);
function emitGameState() {

    const gameState = {
        currentPlayer,
        player1Timer: player1Timer ? turnTimeLimit - parseInt(document.getElementById('player1Timer').textContent.split(':')[1]) : turnTimeLimit,
        player2Timer: player2Timer ? turnTimeLimit - parseInt(document.getElementById('player2Timer').textContent.split(':')[1]) : turnTimeLimit,
        player1Position,
        player2Position,
        player1WallsRemaining,
        player2WallsRemaining,
        placedWallsPlayer1,
        placedWallsPlayer2,
        currentWallPlacement
        //

    };

    socket.emit('saveGameState', gameState);
}

socket.on('gameStateSaved', function(data) {
    const { gameId } = data;
    localStorage.setItem('gameId', gameId);
});

socket.on('gameState', function(gameState) {
    // Mettre à jour l'état du jeu côté client avec les données reçues

    if (gameState.player1Position !== null) {
        setPlayerPosition(gameState.player1Position, 'player1');
    }
    if (gameState.player2Position !== null) {
        setPlayerPosition(gameState.player2Position, 'player2');
    }
    currentPlayer = gameState.currentPlayer;
    player1Position = gameState.player1Position;
    player2Position = gameState.player2Position;
    currentWallPlacement = gameState.currentWallPlacement;
    player1WallsRemaining= gameState.player1WallsRemaining;
    player2WallsRemaining = gameState.player2WallsRemaining;
    placedWallsPlayer1 =  gameState.placedWallsPlayer1;
    placedWallsPlayer2 = gameState.placedWallsPlayer2;
    player1Timer = gameState.player1Timer;
    player2Timer = gameState.player2Timer;
    //updateUIBasedOnGameState();
    displayWalls();
});

function displayWalls() {
    // Nettoyer tous les murs précédents
    cells.forEach(cell => {
        cell.classList.remove('wall');
        cell.style.backgroundColor = '';
    });

    // Afficher les murs horizontaux et verticaux
    placedWallsPlayer1.forEach(wall => displaySingleWall(wall));
    placedWallsPlayer2.forEach(wall => displaySingleWall(wall));
}

function displaySingleWall(wall) {
    const cellIndex = wall.cellIndex;
    const cell = cells[cellIndex];
    if (cell) {
        cell.classList.add('wall');
        cell.style.backgroundColor = 'orange';

        // Pour les murs verticaux, colorier aussi la cellule en dessous
        // Ici, on suppose que l'index donné est celui du haut du mur vertical
        if (wall.wallType === 'column') {
            const cellBelowIndex = cellIndex + 34; // Ajoutez 17 si vous comptez par "ligne" pour décaler vers le bas
            if (cellBelowIndex < cells.length) {
                const cellBelow = cells[cellBelowIndex];
                cellBelow.classList.add('wall');
                cellBelow.style.backgroundColor = 'orange';
            }
        }

        // Pour les murs horizontaux, colorier aussi la cellule à droite
        // Ici, on suppose que l'index donné est celui de la gauche du mur horizontal
        if (wall.wallType === 'row') {
            const cellRightIndex = cellIndex + 2;
            if ((cellRightIndex % 17) !== 0) { // Vérifier que le mur n'est pas sur le bord droit du plateau
                const cellRight = cells[cellRightIndex]; // S'assurer que l'index est correct
                cellRight.classList.add('wall');
                cellRight.style.backgroundColor = 'orange';
            }
        }
    }
}

function handleValidateButtonClickPlayer1() {
    // Logique de validation pour le joueur 1
    finalizeWallPlacementPlayer1();
}

function handleValidateButtonClickPlayer2() {
    // Logique de validation pour le joueur 2
    finalizeWallPlacementPlayer2();
}



function handleCancelButtonClickPlayer1() {
    // Logique d'annulation pour le joueur 1
    cancelCurrentWallPlacement();
    cancelButtonPlayer1.style.display = 'none';
}

function handleCancelButtonClickPlayer2() {
    // Logique d'annulation pour le joueur 2
    cancelCurrentWallPlacement();
    cancelButtonPlayer2.style.display = 'none';
}

function finalizeWallPlacementPlayer1() {
    // Ajoute ici la logique de finalisation pour le joueur 1
    // Par exemple, tu peux appeler la fonction 'finalizeWallPlacement' avec des paramètres spécifiques au joueur 1
    finalizeWallPlacement('player1');
}

function finalizeWallPlacementPlayer2() {
    // Ajoute ici la logique de finalisation pour le joueur 2
    // Par exemple, tu peux appeler la fonction 'finalizeWallPlacement' avec des paramètres spécifiques au joueur 2
    finalizeWallPlacement('player2');
}

function finalizeWallPlacement(player) {
    // Ajou(te ici la logique de finalisation en fonction du joueur
    // Par exemple, tu peux utiliser la variable 'player' pour effectuer des actions spécifiques à chaque joueur
    if(currentWallPlacement){
        const wallData = { cellIndex: currentWallPlacement.cellIndex, wallType: currentWallPlacement.wallType };
        if (player === 'player1') {
            player1WallsRemaining--;
            placedWallsPlayer1.push(wallData);
        } else if (player === 'player2') {
            player2WallsRemaining--;
            placedWallsPlayer2.push(wallData);
        }
        console.log("Finalizewall P1 : "+ placedWallsPlayer2 + "P2 " + placedWallsPlayer2);
        currentWallPlacement = null;
    }


    // Accède au bouton de validation spécifique au joueur
    const validateButton = document.getElementById(`validateButton${player.charAt(0).toUpperCase() + player.slice(1)}`);
    const cancelButton = document.getElementById(`cancelButton${player.charAt(0).toUpperCase() + player.slice(1)}`);
    document.getElementById('quitButton').addEventListener('click', handleQuitButtonClick);

    validateButton.style.display = 'none';
    cancelButton.style.display = 'none';

    togglePlayer();
    emitGameState();

}

function handleQuitButtonClick() {
    // Première confirmation pour quitter.
    const saveGame = confirm("Voulez-vous sauvegarder la partie avant de quitter ?");
    if (saveGame) {
        // Appeler la fonction pour sauvegarder l'état du jeu.
        emitGameState();
        // Ajoutez ici le code nécessaire pour gérer la navigation après la sauvegarde
        // Peut-être revenir à l'écran d'accueil ou fermer la session de jeu.
    } else {
        // Si l'utilisateur choisit de ne pas sauvegarder, alors réinitialisez le jeu.
        resetGame();
        // Ajoutez ici le code nécessaire pour gérer la navigation après la réinitialisation
        // Peut-être revenir à l'écran d'accueil ou fermer la session de jeu.
    }
}

function startTimer(timerId) {
    let timerElement = document.getElementById(timerId);
    let duration = turnTimeLimit;

    return setInterval(function () {
        let seconds = duration % 60;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        timerElement.textContent = "00:" + seconds;
        --duration;
        if (timerElement.textContent === "00:00") {
            togglePlayer();
        }
        emitGameState();
    }, 1000);


}

function startPlayerTimer() {
    if (currentPlayer === 'player1') {
        clearInterval(player1Timer)
        player1Timer = startTimer('player1Timer');
        document.getElementById('player2Timer').innerText = formatTime(40000);
    } else {
        player2Timer = startTimer('player2Timer');
        document.getElementById('player1Timer').innerText = formatTime(40000);
    }
    emitGameState();
}

function resetPlayerTimer() {
    clearInterval(player1Timer);
    clearInterval(player2Timer);
    startPlayerTimer();
}

function updateTimer(timerId) {
    const timerElement = document.getElementById(timerId);
    const remainingTime = parseInt(timerElement.innerText.split(' ')[1]); // Extract remaining time
    if (remainingTime > 0) {
        timerElement.innerText = `Timer: ${remainingTime - 1}s`;
    } else {
        switchPlayerTurn();
        console.log("time heeeeeeere")
    }
}

function switchPlayerTurn() {
    if (currentPlayer === 'player1') {
        currentPlayer = 'player2';
    } else {
        currentPlayer = 'player1';
    }
    resetPlayerTimer();
    togglePlayer();
}

function handleInitialCellClick(event) {

    const cellIndex = cells.indexOf(event.target);
    if (cellIndex !== -1) {
        const row = Math.floor(cellIndex / 17);
        let visibility = (row < 7 &&  currentPlayer === 'player1') || (row > 8 && currentPlayer === 'player2') ? 1 : (row === 8 ? 0 : -1);

        if ((currentPlayer === 'player1' && row === 0) || (currentPlayer === 'player2' && row === 16)) {
            setPlayerPosition(cellIndex, currentPlayer);
            togglePlayer();

            resetFirstRowBackgroundColor();
            resetOppositeFirstRowBackgroundColor();
            // Remove the event listener after both players have selected their positions
            if (player1Position !== null && player2Position !== null) {
                board.removeEventListener('click', handleInitialCellClick);
            }
        } else {
            alert("Joueur " + (currentPlayer === 'player1' ? '1' : '2') + ", veuillez choisir une case dans la ligne appropriée.");
        }
        cells[cellIndex].setAttribute('data-visibility', visibility);

        updateCellAppearance(cells[cellIndex], visibility);

    }
}
function resetFirstRowBackgroundColor(oppositeFirstRow) {
    // Retrouver toutes les cellules de la première ligne et réinitialiser leur couleur de fond
    for (let i = 0; i < 17; i++) {
        cells[i].classList.remove('first-row');
    }
}
function resetOppositeFirstRowBackgroundColor() {
    // Déterminer la rangée opposée en fonction du joueur actuel
    const oppositeFirstRow = currentPlayer === 'player1' ? 16 : 0;

    // Retrouver toutes les cellules de la première ligne du joueur opposé et réinitialiser leur couleur de fond
    for (let i = 0; i < 17; i++) {
        cells[oppositeFirstRow * 17 + i].classList.remove('first-row');
    }
}

function resetGame() {
    // Réinitialiser les positions des joueurs
    player1Position = null;
    player2Position = null;
    player1WallsRemaining = 10;
    player2WallsRemaining = 10;
    currentPlayer = 'player1';
    placedWallsPlayer1=[];
    placedWallsPlayer2=[];
    // Réinitialiser les classes des cellules
    cells.forEach(cell => {
        cell.classList.remove('player1', 'player2','wall');
    });
    resetPlayerTimer();

    const board = document.getElementById('board');
    // Ajouter à nouveau l'écouteur d'événement pour la sélection initiale
    board.addEventListener('click', handleInitialCellClick);

    visibilityChangedCells.clear();
    emitGameState();
}

function setPlayerPosition(cellIndex, player) {
    // Retirer la classe 'possible-move' de toutes les cellules
    cells.forEach(cell => cell.classList.remove('possible-move'));

    // Retirer la classe du joueur actif de sa position actuelle
    if (player === 'player1' && player1Position !== null) {
        cells[player1Position].classList.remove('player1');
    } else if (player === 'player2' && player2Position !== null) {
        cells[player2Position].classList.remove('player2');
    }
    // Ajouter la classe du joueur actif à sa nouvelle position
    cells[cellIndex].classList.add(player);

    // Mettre à jour la position du joueur
    if (player === 'player1') {
        player1Position = cellIndex;
    } else {
        player2Position = cellIndex;
    }

}
function getValidMoves(position) {
    const row = Math.floor(position / 17);
    const col = position % 17;
    const moves = [];
    const otherPlayerPosition = currentPlayer === 'player1' ? player2Position : player1Position;
    // Déplacements horizontaux et verticaux
    if (row > 1 && !isWallBetweenPositions(position, position - 34) && (position-34!==otherPlayerPosition)) moves.push(position - 34);
    if (row < 15 && !isWallBetweenPositions(position, position + 34) && (position + 34 !== otherPlayerPosition)) moves.push(position + 34);
    if (col > 1 && !isWallBetweenPositions(position, position - 2) && (position - 2 !== otherPlayerPosition)) moves.push(position - 2);
    if (col < 15 && !isWallBetweenPositions(position, position + 2) && (position + 2 !== otherPlayerPosition)) moves.push(position + 2);
    return moves;
}

function togglePlayer(){
    currentPlayer = (currentPlayer === 'player1') ? 'player2' : 'player1';
    currentAction = 'none'; // Réinitialiser l'action pour le prochain joueur

    if (currentPlayer === 'player2') {
        botMakeMove(); // Laissez le bot faire un mouvement
    } else {
        // Logique du joueur humain
        resetPlayerTimer();
    }
    emitGameState();

    resetPlayerTimer();
    updateCellVisibility();
    //openAntiCheatPage();

    const playerPosition = currentPlayer === 'player1' ? player1Position : player2Position;
    const visibilityChange = currentPlayer === 'player1' ? 2 : 2;
    updateFogOfWar(playerPosition, visibilityChange);


    // Mettre à jour le compteur de murs
    updateWallsRemaining();

}

function botMakeMove() {
    // Exemple de logique simple du bot
    // Ici, le bot essaie de placer un mur aléatoirement ou de bouger aléatoirement
    if (player2WallsRemaining > 0 && Math.random() > 0.5) {
        // Tentez de placer un mur de manière aléatoire
        tryPlaceWallForBot();
    } else {
        // Ou faites un mouvement aléatoire
        moveBotRandomly();
    }
    setTimeout(() => togglePlayer(), 1000); // Donne du temps pour visualiser le mouvement du bot
}


function moveBotRandomly() {
    // Obtenez les mouvements valides pour le bot
    const validMoves = getValidMoves(player2Position);
    if (validMoves.length > 0) {
        const randomMove = validMoves[Math.floor(Math.random() * validMoves.length)];
        setPlayerPosition(randomMove, 'player2');
    }
}



function startPlayerTimer() {
    // Gestion du timer seulement pour le joueur humain
    if (currentPlayer === 'player1') {
        clearInterval(player1Timer);
        player1Timer = startTimer('player1Timer');
    }
}



function updateCellVisibility() {
    cells.forEach((cell, index) => {
        if (visibilityChangedCells.has(index)) return;

        const row = Math.floor(index / 17);
        const col = index % 17;
        let visibility = (row < 8 && currentPlayer === 'player1') || (row > 8 && currentPlayer === 'player2') ? 1 : (row === 8 ? 0 : -1);


        // Conserver les classes existantes sur la cellule
        const existingClasses = cell.className;

        // Appliquer la classe de visibilité en arrière-plan
        updateCellAppearance(cell, visibility);

        // Ajouter la classe du joueur actif à sa position si elle existe déjà
        if (existingClasses.includes('player1') && index === player1Position) {
            cell.classList.add('player1');
        } else if (existingClasses.includes('player2') && index === player2Position) {
            cell.classList.add('player2');
        }

        // Ajouter la classe 'possible-move' aux cellules valides si elle existe déjà
        if (existingClasses.includes('possible-move') && getValidMoves(index).includes(index)) {
            cell.classList.add('possible-move');
        }

        updateCellAppearance(cell, visibility);
    });
}
function updateFogOfWar(playerPosition, visibilityChange) {
    const adjacentIndices = [
        playerPosition - 2, // gauche
        playerPosition + 2, // droite
        playerPosition - 34, // haut
        playerPosition + 34, // bas
        playerPosition,
    ];

    adjacentIndices.forEach(index => {
        if (cells[index]) {
            // Ajoutez la visibilité changeante à la valeur existante du brouillard de guerre
            const currentVisibility = parseInt(cells[index].getAttribute('data-visibility')) || 0;
            const newVisibility = currentVisibility + visibilityChange;

            // Mettez à jour la valeur du brouillard de guerre
            cells[index].setAttribute('data-visibility', newVisibility);

            // Mettez à jour l'apparence de la cellule en fonction de la nouvelle visibilité
            updateCellAppearance(cells[index], newVisibility);
        }
    });
}
function updateCellAppearance(cell, visibility) {
    // Mettez à jour l'apparence de la cellule en fonction de la visibilité
    cell.classList.toggle('visible', visibility >= 0);
    cell.classList.toggle('hidden', visibility < 0);
}

function winner(player){
    alert("Le joueur " + (player === 'player1' ? '1' : '2') + " a gagné !");
    const playAgain = confirm("Voulez-vous commencer une nouvelle partie ?");
    if (playAgain) {
        resetGame();
    }
}

function movePlayerKey(movement){
    let position = currentPlayer === 'player1' ? player1Position : player2Position;
    let newPosition;

    switch (movement) {
        case 'up' :
            newPosition = position - 34; //car double grille
            break;
        case 'down' :
            newPosition = position + 34;
            break;
        case 'left':
            newPosition = position - 2;
            break;
        case 'right':
            newPosition = position + 2;
            break;

    }
    if (!isWallBetweenPositions(newPosition)) {
        const validMoves = (getValidMoves(position));
        if (validMoves.includes(newPosition)) {
            updateFogOfWar(position, currentPlayer === 'player1' ? 2 : -2);
            setPlayerPosition(newPosition, currentPlayer);
            const goalRow = currentPlayer === 'player1' ? 16 : 0;
            if (Math.floor(newPosition / 17) === goalRow) {
                // Retarder l'affichage du pop-up
                setTimeout(() => {
                    winner(currentPlayer);
                    resetGame();
                }, 100);
            } else {
                // Basculer vers l'autre joueur
                togglePlayer();
            }
        }
    }
}

function handleCellClick(cellIndex) {
    if (currentAction === 'placeWall' || !player1Position || !player2Position) {
        return; // Ignorer si le joueur est en train de placer un mur ou si les positions initiales ne sont pas définies
    }

    const validMoves = getValidMoves(currentPlayer === 'player1' ? player1Position : player2Position);
    // Supprimer la classe 'possible-move' de toutes les cellules
    cells.forEach(cell => cell.classList.remove('possible-move'));
    // Ajouter la classe 'possible-move' aux cellules valides
    validMoves.forEach(move => cells[move].classList.add('possible-move'));

    const playerPosition = currentPlayer === 'player1' ? player1Position : player2Position;
    if (cellIndex === playerPosition) {
        // Le joueur a été sélectionné mais pas déplacé
        // Ajoutez ici la logique pour gérer la sélection
        return;
    }

    if (validMoves.includes(cellIndex)) {
        setPlayerPosition(cellIndex, currentPlayer);
        currentAction = 'move';

        // Vérifier si le joueur a atteint la ligne d'arrivée
        const goalRow = currentPlayer === 'player1' ? 16 : 0;
        if (Math.floor(cellIndex / 17) === goalRow) {
            // Retarder l'affichage du pop-up
            setTimeout(() => {
                winner(currentPlayer);
                resetGame();
            }, 100);
        } else {
            // Basculer vers l'autre joueur
            togglePlayer();
        }

    }
    emitGameState();

}
function cancelCurrentWallPlacement() {
    if (currentWallPlacement && !currentWallPlacement.placed) {
        cancelWallPlacement();
    }
}

function cancelWallPlacement() {
    if (currentWallPlacement) {
        const { cellIndex, wallType } = currentWallPlacement;

        // Supprimez le mur actuel
        cells[cellIndex].classList.remove('wall');
        cells[cellIndex].style.backgroundColor = '';

        cells.forEach(cell => cell.classList.remove('possible-move'));

        const currentPlayerVisibilityChange = currentPlayer === 'player1' ? 2 : -2;
        applyVisibilityChange(cellIndex, -currentPlayerVisibilityChange);

        if (wallType === 'column') {
            let adjCellIndex;
            if ([273, 275, 277, 279, 281, 283, 285, 287].includes(cellIndex)) {
                adjCellIndex = cellIndex - 34;
            }else{
                adjCellIndex = cellIndex + 34;
            }
            cells[adjCellIndex].classList.remove('wall');
            cells[adjCellIndex].style.backgroundColor = '';

            applyVisibilityChange(adjCellIndex, -currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, -currentPlayerVisibilityChange);

        } else if (wallType === 'row') {
            let adjCellIndex;
            if ([33, 67, 101, 135, 169, 203, 237, 271].includes(cellIndex)) {
                adjCellIndex = cellIndex - 2;
            } else {
                adjCellIndex = cellIndex + 2;
            }
            cells[adjCellIndex].classList.remove('wall');
            cells[adjCellIndex].style.backgroundColor = '';

            applyVisibilityChange(adjCellIndex, -currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, -currentPlayerVisibilityChange);
        }

        // Réinitialisez la variable de placement du mur
        currentWallPlacement = null;

        // Cachez le bouton "Valider"
        const validateButton = document.getElementById(`validateButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        const cancelButton = document.getElementById(`cancelButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        validateButton.style.display = 'none';
        cancelButton.style.display = 'none';


        // Réinitialiser les classes 'possible-move' sur les cellules valides
        currentAction = 'none';
        const validMoves = getValidMoves(currentPlayer === 'player1' ? player1Position : player2Position);
        validMoves.forEach(move => cells[move].classList.add('possible-move'));
    }
}

function validateWallPlacement() {
    if (currentWallPlacement && !currentWallPlacement.placed) {
        // Marquez le mur comme placé
        currentWallPlacement.placed = true;

        if (currentPlayer === 'player1') {
            placedWallsPlayer1.push(cellIndex);
        } else {
            placedWallsPlayer2.push(cellIndex);

        }

        // Décrémenter le nombre de murs disponibles uniquement lorsque le placement est validé
        if (currentPlayer === 'player1') {
            player1WallsRemaining--;
        } else {
            player2WallsRemaining--;
        }

        // Mettre à jour l'affichage du nombre de murs restants
        updateWallsRemaining();

        // Cachez le bouton "Valider"
        const validateButton = document.getElementById(`validateButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        const cancelButton = document.getElementById(`cancelButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        validateButton.style.display = 'none';
        cancelButton.style.display = 'none';
    }

}


function handleWallClick(cellIndex, wallType) {
    if(currentAction === 'move'|| !player1Position || !player2Position){
        return;
    }
    if (cells[cellIndex].classList.contains('wall')) {
        return;
    }

    // Vérifiez si le mur a déjà été validé
    const currentPlayerWalls = currentPlayer === 'player1' ? placedWallsPlayer1 : placedWallsPlayer2;
    console.log("murs PA : " + placedWallsPlayer1 + "murs P2 " +placedWallsPlayer2);
    if (currentPlayerWalls.includes(cellIndex)) {
        alert("Ce mur a déjà été validé. Choisissez un autre emplacement.");
        return;
    }

    cancelWallPlacement();

    // Sauvegardez l'emplacement du mur en cours de placement
    currentWallPlacement = { cellIndex, wallType };
    if(currentPlayer==='player1'){
        wallPlayer1 = {cellIndex,wallType};
    }
    else if(currentPlayer==='player2'){
        wallPlayer2 = {cellIndex,wallType};
    }
    console.log(currentPlayerWalls);


    // Vérifier si le joueur a des murs disponibles
    const wallsRemaining = currentPlayer === 'player1' ? player1WallsRemaining : player2WallsRemaining;
    if (wallsRemaining <= 0) {
        alert("Max number of walls reached. Please move your player.");
        return;
    }

    if (canPlaceWall(cellIndex, wallType)) {
        placeWall(cellIndex, wallType);
        currentAction = 'placeWall';
        const validateButton = document.getElementById(`validateButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        const cancelButton = document.getElementById(`cancelButton${currentPlayer.charAt(0).toUpperCase() + currentPlayer.slice(1)}`);
        validateButton.style.display = 'block';
        cancelButton.style.display = 'block';

        //togglePlayer();
    }

    const validMoves = getValidMoves(currentPlayer === 'player1' ? player1Position : player2Position);
    // Supprimer la classe 'possible-move' de toutes les cellules
    cells.forEach(cell => cell.classList.remove('possible-move'));


}

function canPlaceWall(cellIndex, wallType) {
    // Ajoutez votre logique pour vérifier si le mur peut être placé
    // Retournez true si le mur peut être placé, sinon false
    // Vous devez vous assurer que le mur ne chevauche pas d'autres murs
    // et qu'il respecte les règles du jeu Qoridor.
    // Vous pouvez utiliser la position actuelle des joueurs et les indices des murs.
    // Exemple : vérifiez si le mur chevauche d'autres murs ou s'il bloque le chemin d'un joueur.
    let row = Math.floor(cellIndex / 17);
    let col = cellIndex % 17;
    if (row % 2 !== 0 && col % 2 !== 0) {
        return false;
    }
    if (row % 2 !== 0 && col % 2 !== 0) {return false;}
    if (cells[cellIndex].classList.contains('wall')) {
        return false;
    }
    if (placedWallsPlayer1.includes(cellIndex) || placedWallsPlayer2.includes(cellIndex)) {
        return false;
    }
    // Placeholder, veuillez mettre en œuvre votre propre logique
    return true;

}

function placeWall(cellIndex, wallType) {
    if ((currentPlayer === 'player1' && player1WallsRemaining <= 0) || (currentPlayer === 'player2' && player2WallsRemaining <= 0)) {
        // Le joueur n'a plus de murs disponibles
        return;
    }

    const wallCell = cells[cellIndex];

    // Vérifiez si un mur existe déjà à l'emplacement spécifié
    if (wallCell.classList.contains('wall')) {
        // Mettez à jour la classe du mur existant
        wallCell.style.backgroundColor = 'orange';
        const currentPlayerVisibilityChange = currentPlayer === 'player1' ? 2 : -2;
        applyVisibilityChange(cellIndex, currentPlayerVisibilityChange);

        if (wallType === 'column') {
            let adjCellIndex;
            if ([273, 275, 277, 279, 281, 283, 285, 287].includes(cellIndex)) {
                adjCellIndex = cellIndex - 34;
            }else{
                adjCellIndex = cellIndex + 34;
            }
            const adjWallCell = cells[adjCellIndex];
            // Mettez à jour la classe du mur adjacent
            adjWallCell.style.backgroundColor = 'orange';
            applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);

        } else if (wallType === 'row') {
            let adjCellIndex;
            if ([33, 67, 101, 135, 169, 203, 237, 271].includes(cellIndex)) {
                adjCellIndex = cellIndex - 2;
            } else {
                adjCellIndex = cellIndex + 2;
            }
            const adjWallCell = cells[adjCellIndex];
            // Mettez à jour la classe du mur adjacent
            adjWallCell.style.backgroundColor = 'orange';
            applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);
        }

    } else {
        // Créez un nouveau mur
        wallCell.classList.add('wall');
        wallCell.style.backgroundColor = 'orange';
        const currentPlayerVisibilityChange = currentPlayer === 'player1' ? 2 : -2;
        applyVisibilityChange(cellIndex, currentPlayerVisibilityChange);

        if (wallType === 'column') {
            let adjCellIndex;
            if ([273, 275, 277, 279, 281, 283, 285, 287].includes(cellIndex)) {
                adjCellIndex = cellIndex - 34;
            }else{
                adjCellIndex = cellIndex + 34;
            }
            cells[adjCellIndex].classList.add('wall');
            cells[adjCellIndex].style.backgroundColor = 'orange';

            applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);

        } else if (wallType === 'row') {
            let adjCellIndex;
            if ([33, 67, 101, 135, 169, 203, 237, 271].includes(cellIndex)) {
                adjCellIndex = cellIndex - 2;
            } else {
                adjCellIndex = cellIndex + 2;
            }
            cells[adjCellIndex].classList.add('wall');
            cells[adjCellIndex].style.backgroundColor = 'orange';

            applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
            updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);
        }

        const validMoves = getValidMoves(currentPlayer === 'player1' ? player1Position : player2Position);
        // Supprimer la classe 'possible-move' de toutes les cellules
        cells.forEach(cell => cell.classList.remove('possible-move'));

    }
}

function updateWallsRemaining() {
    const wallsRemainingElement = document.getElementById(currentPlayer === 'player1' ? 'wallsRemainingPlayer1' : 'wallsRemainingPlayer2');
    wallsRemainingElement.innerText = `Remaining walls: ${currentPlayer === 'player1' ? player1WallsRemaining : player2WallsRemaining}`;
}

function updateVisibilityAdjacentToWall(wallIndex, visibilityChange) {
    const adjacentIndices = [
        wallIndex - 1, // gauche
        wallIndex + 1, // droite
        wallIndex - 33, // haut
        wallIndex - 35, // bas

        wallIndex - 1, // gauche
        wallIndex + 1, // droite
        wallIndex - 33, // haut
        wallIndex - 35, // bas
    ];
    adjacentIndices.forEach(index => {
        if (cells[index]) {
            applyVisibilityChange(index, visibilityChange);
        }
    });
}

function applyVisibilityChange(cellIndex, visibilityChange) {
    if (cells[cellIndex]) {
        const currentVisibility = parseInt(cells[cellIndex].getAttribute('data-visibility')) || 0;
        const newVisibility = currentVisibility + visibilityChange;

        cells[cellIndex].setAttribute('data-visibility', newVisibility);
        updateCellAppearance(cells[cellIndex], newVisibility);

        visibilityChangedCells.add(cellIndex);
    }
}

function isWallBetweenPositions(startIndex, endIndex) {
    const startRow = Math.floor(startIndex / 17);
    const startCol = startIndex % 17;
    const endRow = Math.floor(endIndex / 17);
    const endCol = endIndex % 17;

    // Vérifier s'il y a un mur entre les positions horizontalement
    if (startRow === endRow) {
        const minCol = Math.min(startCol, endCol);
        const maxCol = Math.max(startCol, endCol);
        for (let col = minCol + 1; col < maxCol; col++) {
            const index = startRow * 17 + col;
            if (cells[index] && cells[index].classList.contains('wall')) {
                return true;
            }
        }
    }

    // Vérifier s'il y a un mur entre les positions verticalement
    if (startCol === endCol) {
        const minRow = Math.min(startRow, endRow);
        const maxRow = Math.max(startRow, endRow);
        for (let row = minRow + 1; row < maxRow; row++) {
            const index = row * 17 + startCol;
            if (cells[index] && cells[index].classList.contains('wall')) {
                return true;
            }
        }
    }

    return false;

}

function openAntiCheatPage() {
    const antiCheatUrl = '../acceuil/anti-cheat-sheet.html';

    const width = 850;
    const height = 600;
    const left = window.innerWidth / 2 - width /2 + window.screenX;
    const top = window.innerHeight  - height / 2 + window.screenY;

    const antiCheatWindow = window.open(antiCheatUrl, '_blank', `width=${width},height=${height},left=${left},top=${top},modal=yes,alwaysRaised=yes`);

    if (antiCheatWindow) {
        antiCheatWindow.focus();
    }
}


document.addEventListener('keydown', function(event) {
    if (!player1Position || !player2Position) {
        // Si les positions de départ ne sont pas encore sélectionnées, ignorez les touches du clavier
        return;
    }
    if (currentPlayer === 'player1') {
        switch (event.key) {
            case 'z':
                movePlayerKey('up');
                break;
            case 's':
                movePlayerKey('down');
                break;
            case 'q':
                movePlayerKey('left');
                break;
            case 'd':
                movePlayerKey('right');
                break;
        }
    } else {
        switch (event.key) {
            case 'ArrowUp':
                movePlayerKey('up');
                break;
            case 'ArrowDown':
                movePlayerKey('down');
                break;
            case 'ArrowLeft':
                movePlayerKey('left');
                break;
            case 'ArrowRight':
                movePlayerKey('right');
                break;
        }
    }
});