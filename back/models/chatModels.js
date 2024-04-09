const { MongoClient, ObjectId } = require('mongodb');

class ChatModel {
    constructor(db) {
        this.collection = db.collection('chats');
    }

    // Créer un chat
    async createChat(members) {
        const chat = {
            members,
            createdAt: new Date(),
            updatedAt: new Date()
        };
        const result = await this.collection.insertOne(chat);
        return result.ops[0];
    }

    // Obtenir un chat par ID
    async getChatById(chatId) {
        const _id = new ObjectId(chatId);
        return await this.collection.findOne({ _id });
    }

    // Mettre à jour les membres d'un chat
    async updateChatMembers(chatId, members) {
        const _id = new ObjectId(chatId);
        const result = await this.collection.updateOne(
            { _id },
            { $set: { members, updatedAt: new Date() } }
        );
        return result.modifiedCount;
    }

    // Supprimer un chat
    async deleteChat(chatId) {
        const _id = new ObjectId(chatId);
        const result = await this.collection.deleteOne({ _id });
        return result.deletedCount;
    }

    // Obtenir tous les chats d'un membre
    async getChatsByMemberId(memberId) {
        return await this.collection.find({ members: memberId }).toArray();
    }

    // Ajouter un membre à un chat
    async addMemberToChat(chatId, memberId) {
        const _id = new ObjectId(chatId);
        const result = await this.collection.updateOne(
            { _id },
            { $addToSet: { members: memberId }, $currentDate: { updatedAt: true } }
        );
        return result.modifiedCount;
    }

    // Retirer un membre d'un chat
    async removeMemberFromChat(chatId, memberId) {
        const _id = new ObjectId(chatId);
        const result = await this.collection.updateOne(
            { _id },
            { $pull: { members: memberId }, $currentDate: { updatedAt: true } }
        );
        return result.modifiedCount;
    }
}

// Exemple d'utilisation :
// (dans un fichier séparé après avoir établi une connexion à MongoDB)
// const db = client.db('your_database_name');
// const chatModel = new ChatModel(db);

module.exports = ChatModel;
