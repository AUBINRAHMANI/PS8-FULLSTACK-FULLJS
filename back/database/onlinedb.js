import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from 'uuid'; // Assurez-vous d'installer uuid

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
            let room = await this.rooms.findOne({ state: 'waiting' });
            if (room) {
                // Rejoindre la salle existante
                await this.rooms.updateOne({ _id: room._id }, { $set: { state: 'active', player2: playerId } });
                return { roomId: room._id, state: 'active' };
            } else {
                // Créer une nouvelle salle
                const roomId = uuidv4();
                await this.rooms.insertOne({ _id: roomId, player1: playerId, state: 'waiting' });
                return { roomId, state: 'waiting' };
            }
        } catch (error) {
            console.error(error);
        }
    }
    async getRoomState(roomId) {
        await this.verifyConnection();
        try {
            return await this.rooms.findOne({ _id: roomId });
        } catch (error) {
            console.error(error);
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

}

export default new Onlinedb();