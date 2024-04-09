import { MongoClient } from "mongodb";
import { v4 as uuidv4 } from 'uuid'; // N'oubliez pas d'installer uuid avec npm ou yarn

class Gamedb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db("DatabaseName");
            this.games = this.database.collection("games"+ "");
            this.#init()
        } catch (error) {
            console.error(error);
        }
    }
    #init() {
        this.games.insertOne({
            idSender: "1",
            idReceiver: "2",
            message: "Hello",
            read: false,
            sentDate: new Date(),
        });
    }

    async verifyConnection() {
        if (this.games) return;
        await this.connect();
    }

    async saveGameState(gameState) {
        await this.verifyConnection();
        try {
            // Si gameState n'a pas de gameId, nous en générons un nouveau.
            if (!gameState.gameId) {
                gameState.gameId = uuidv4();
            }
            await this.games.updateOne({ gameId: gameState.gameId }, { $set: gameState }, { upsert: true });
            return gameState.gameId; // Retourne l'ID de la partie pour référence future.
        } catch (error) {
            console.error(error);
        }
    }

    async getGameState(gameId) {
        await this.verifyConnection();
        try {
            return await this.games.findOne({ gameId: gameId });
        } catch (error) {
            console.error(error);
        }
    }
}

export default new Gamedb();
