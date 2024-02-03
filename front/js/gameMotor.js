// script.js
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
    board.addEventListener('click', handleInitialCellClick);
    startPlayerTimer();


});

/*---------------------------*/

function startTimer(timerId) {
    let timerElement = document.getElementById(timerId);
    let duration = turnTimeLimit;

    return setInterval(function () {
        let seconds = duration % 60;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        timerElement.textContent = "00:" + seconds;

        if (--duration <= 0) {
            clearInterval(timerInterval);
            timerElement.textContent = "Temps écoulé!";
            console.log("Le temps est écoulé! Passer au joueur suivant...");
            switchPlayerTurn();
        }
        
    }, 1000);
}

function startPlayerTimer() {
    if (currentPlayer === 'player1') {
        player1Timer = startTimer('player1Timer');
    } else {
        player2Timer = startTimer('player2Timer');
    }
}

/*function startPlayerTimer() {
    if (currentPlayer === 'player1') {
        player1Timer = setInterval(() => {
            updateTimer('player1Timer');
        }, 1000);
    } else {
        player2Timer = setInterval(() => {
            updateTimer('player2Timer');
        }, 1000);
    }
}*/


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
    }
}

function switchPlayerTurn() {
    clearInterval(player1Timer);
    clearInterval(player2Timer);
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
function resetGame() {
    // Réinitialiser les positions des joueurs
    player1Position = null;
    player2Position = null;

    // Réinitialiser les classes des cellules
    cells.forEach(cell => {
        cell.classList.remove('player1', 'player2');
    });

    // Ajouter à nouveau l'écouteur d'événement pour la sélection initiale
    board.addEventListener('click', handleInitialCellClick);
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

    updateCellVisibility();
    openAntiCheatPage();

    clearInterval(player1Timer);
    clearInterval(player2Timer);


    startPlayerTimer();

    const playerPosition = currentPlayer === 'player1' ? player1Position : player2Position;
    const visibilityChange = currentPlayer === 'player1' ? 2 : 2;
    updateFogOfWar(playerPosition, visibilityChange);
}


function updateCellVisibility() {
    cells.forEach((cell, index) => {
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

}



function handleWallClick(cellIndex, wallType) {
    if(currentAction === 'move'|| !player1Position || !player2Position){
        return;
    }

    if (canPlaceWall(cellIndex, wallType)) {
        placeWall(cellIndex, wallType);
        currentAction = 'placeWall';
        togglePlayer();
    }
}

function canPlaceWall(cellIndex, wallType) {
    // Ajoutez votre logique pour vérifier si le mur peut être placé
    // Retournez true si le mur peut être placé, sinon false
    // Vous devez vous assurer que le mur ne chevauche pas d'autres murs
    // et qu'il respecte les règles du jeu Qoridor.
    // Vous pouvez utiliser la position actuelle des joueurs et les indices des murs.
    // Exemple : vérifiez si le mur chevauche d'autres murs ou s'il bloque le chemin d'un joueur.

    // Placeholder, veuillez mettre en œuvre votre propre logique
    return true;
}

function placeWall(cellIndex, wallType) {
    cells[cellIndex].classList.add('wall');
    cells[cellIndex].style.backgroundColor = 'orange';

    const currentPlayerVisibilityChange = currentPlayer === 'player1' ? 2 : -2;
    applyVisibilityChange(cellIndex, currentPlayerVisibilityChange);

    if (wallType === 'column') {
        const adjCellIndex = cellIndex + 34;
        cells[adjCellIndex].classList.add('wall');
        cells[adjCellIndex].style.backgroundColor = 'orange';

        applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
        updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);

    } else if (wallType === 'row') {
        const adjCellIndex = cellIndex + 2;
        cells[adjCellIndex].classList.add('wall');
        cells[adjCellIndex].style.backgroundColor = 'orange';

        applyVisibilityChange(adjCellIndex, currentPlayerVisibilityChange);
        updateVisibilityAdjacentToWall(adjCellIndex, currentPlayerVisibilityChange);
    }
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
    const antiCheatUrl = 'anti-cheat-sheet.html';

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