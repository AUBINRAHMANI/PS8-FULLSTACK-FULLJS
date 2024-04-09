const { MongoClient, ObjectId } = require('mongodb');

class MessageModel {
    constructor(db) {
        this.collection = db.collection('messages');
    }

    // Créer un message
    async createMessage(chatId, senderId, text) {
        const message = {
            chatId,
            senderId,
            text,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await this.collection.insertOne(message);
        return result.ops[0];
    }

    // Obtenir un message par ID
    async getMessageById(messageId) {
        const _id = new ObjectId(messageId);
        return await this.collection.findOne({ _id });
    }

    // Obtenir tous les messages pour un chatId
    async getMessagesByChatId(chatId) {
        return await this.collection.find({ chatId }).toArray();
    }

    // Mettre à jour un message
    async updateMessage(messageId, newText) {
        const _id = new ObjectId(messageId);
        const result = await this.collection.updateOne(
            { _id },
            { $set: { text: newText, updatedAt: new Date() } }
        );
        return result.modifiedCount;
    }

    // Supprimer un message
    async deleteMessage(messageId) {
        const _id = new ObjectId(messageId);
        const result = await this.collection.deleteOne({ _id });
        return result.deletedCount;
    }
}

// Exemple d'utilisation :
// (dans un fichier séparé après avoir établi une connexion à MongoDB)
// const db = client.db('your_database_name');
// const messageModel = new MessageModel(db);

module.exports = MessageModel;
