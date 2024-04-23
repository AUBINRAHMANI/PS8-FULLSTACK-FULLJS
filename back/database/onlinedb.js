import {MongoClient} from "mongodb";
import {v4 as uuidv4} from 'uuid'; // Assurez-vous d'installer uuid

class Onlinedb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db("DatabaseName");
            this.rooms = this.database.collection("gameOnline");
        } catch (error) {
            console.error(error);
        }
    }


    async createOrJoinRoom(playerId) {
        await this.verifyConnection();
        try {
            // Vérifier s'il existe une salle en attente
            let room = await this.rooms.findOne({state: 'waiting'});
            if (room) {
                // Rejoindre la salle existante et initialiser l'état du jeu
                await this.rooms.updateOne(
                    {_id: room._id},
                    {
                        $set: {
                            state: 'active',
                            players: [room.players[0], playerId],
                            currentPlayerIndex: 0,
                            playerPositions: {
                                player1: null, // Position initiale hypothétique pour le joueur 1
                                player2: null  // Position initiale hypothétique pour le joueur 2
                            },
                            walls: [], // Aucun mur placé initialement
                            currentPlayer: 'player1' // Le joueur 1 commence
                        }
                    }
                );
                console.log("Bite room " + room);
                console.log("Undefined ? " + room._id);
                return {roomId: room._id, state: 'active', playerRole: 'player2'};
            } else {
                // Créer une nouvelle salle sans état du jeu initial
                // L'état du jeu sera initialisé lorsque le deuxième joueur rejoindra
                const roomId = uuidv4();
                await this.rooms.insertOne(
                    {
                        _id: roomId,
                        players: [playerId],
                        state: 'waiting',
                        currentPlayerIndex: 0
                        // Pas d'état du jeu initial ici, attendre le deuxième joueur
                    }
                );
                console.log("Bite2 room " + room);
                return {roomId, state: 'waiting', playerRole: 'player1'};
            }
        } catch (error) {
            console.error(error);
        }
    }


    async isMoveValid(currentPosition, newPosition) {
        if (!currentPosition || !newPosition) {
            console.log("Pas de position : " + newPosition + currentPosition);
            return false;
        }

        // Vérifier si les propriétés x et y des positions sont définies
        if (currentPosition.x===null|| currentPosition.y===null || newPosition.x===null|| !newPosition.y===null) {
            console.log(currentPosition.x + "=x " + currentPosition.y + "=y " + newPosition.x + "=new x " + newPosition.y + "=newY");
            console.log("coordonnées manquantes ");
            return false;
        }
        const dx = Math.abs(currentPosition.x - newPosition.x);
        console.log("dx = " + dx);
        const dy = Math.abs(currentPosition.y - newPosition.y)
        const result = Math.abs(dx-dy);
        console.log("dy = " + dy);
        console.log("Result = " + result);
        return (dx === 2 && dy === 0) || (dx === 0 && dy === 2) ;
    }

    async validateWallPlacement(gameState, cellIndex, wallType) {

        if (gameState.walls.some(wall => wall.cellIndex === cellIndex && wall.wallType === wallType)) {
            return false; // Un mur existe déjà à cette position
        }

        // Si aucun chevauchement n'est détecté, le placement est valide
        return true;
    }

    async calculateWallCells(cellIndex, wallType) {
        // Calcul des cellules que le mur occupe sur la grille, dépendant du type
        if (wallType === 'column') {
            // Supposons que le mur de colonne s'étende verticalement à partir de l'indice donné
            return [cellIndex, cellIndex + 17]; // Assurez-vous que cela correspond à la taille de votre grille
        } else if (wallType === 'row') {
            // Supposons que le mur de rangée s'étende horizontalement à partir de l'indice donné
            return [cellIndex, cellIndex + 1];
        }
        return [];
    }
    async getRoomState(roomId) {
        await this.verifyConnection();
        try {
            console.log("Room id + " + roomId);
            return await this.rooms.findOne({ _id: roomId });

        } catch (error) {
            console.error(error);
        }
    }

    async getGameState(roomId) {
        await this.verifyConnection();
        try {
            // Récupérer la salle avec l'ID spécifié
            console.log("getGameState  " + roomId);
            const room = await this.rooms.findOne({ _id: roomId });
            if (!room) {
                console.error("Aucune salle trouvée avec l'ID :", roomId);
                return null; // Ou gérer autrement si la salle n'existe pas
            }

            // Construire et renvoyer l'état du jeu actuel
            return {
                playerPositions: room.playerPositions,
                walls: room.walls,
                currentPlayer: room.currentPlayer,
                // Ajouter d'autres éléments de l'état du jeu si nécessaire
            };
        } catch (error) {
            console.error("Erreur lors de la récupération de l'état du jeu :", error);
            return null; // Ou gérer autrement en cas d'erreur
        }
    }


    async verifyConnection() {
        if (this.rooms) return;
        await this.connect();
    }

    async deleteRoom(roomId) {
        await this.verifyConnection();
        try {
            await this.rooms.deleteOne({ _id: roomId });
            console.log(`Room ${roomId} deleted.`);
        } catch (error) {
            console.error("Error deleting room:", error);
        }
    }
    async endGame(roomId, winnerId) {
        await this.verifyConnection();
        try {
            // on peut ajouter plus de logique selon les besoins de votre application.
            await this.rooms.updateOne({ _id: roomId }, { $set: { state: 'ended', winner: winnerId } });
            console.log(`Game in room ${roomId} ended. Winner: ${winnerId}`);
        } catch (error) {
            console.error("Error ending game:", error);
        }
    }

    async moveToNextPlayer(roomId) {
        await this.verifyConnection();
        try {
            const room = await this.rooms.findOne({ _id: roomId });
            let nextPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;
            await this.rooms.updateOne(
                { _id: roomId },
                { $set: { currentPlayerIndex: nextPlayerIndex } }
            );
            console.log(`Moved to next player in room ${roomId}.`);
        } catch (error) {
            console.error("Error moving to next player:", error);
        }
    }

    async updateRoomState(roomId, updateFields) {
        await this.verifyConnection();
        try {
            // Mise à jour de l'état de la salle avec les nouveaux champs fournis
            await this.rooms.updateOne({ _id: roomId }, { $set: updateFields });
            console.log(`Room ${roomId} updated with fields: ${JSON.stringify(updateFields)}`);
        } catch (error) {
            console.error("Error updating room state:", error);
        }
    }

    async updateGameState(roomId, updatedGameState) {
        await this.verifyConnection();
        try {
            // Mettre à jour l'état du jeu pour la room spécifiée
            await this.rooms.updateOne(
                { _id: roomId },
                { $set: {
                        playerPositions: updatedGameState.playerPositions,
                        walls: updatedGameState.walls,
                        currentPlayer: updatedGameState.currentPlayer
                    }}
            );
        } catch (error) {
            console.error("Erreur lors de la mise à jour de l'état du jeu :", error);
        }
    }

}



export default new Onlinedb();