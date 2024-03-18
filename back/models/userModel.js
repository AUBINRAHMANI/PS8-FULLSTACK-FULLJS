const { MongoClient, ObjectId } = require('mongodb');

class UserModel {
    constructor(db) {
        this.collection = db.collection('users');
    }



    async findUserByEmail(email) {
        return await this.collection.findOne({ email });
    }

    async createUser(email, hashedPassword) {
        return await this.collection.insertOne({ email, password: hashedPassword });
    }


/*    // Créer un utilisateur
    async createUser(username, mail, password) {
        const user = {
            username,
            mail,
            password,
            createdAt: new Date(),
            updatedAt: new Date(),
        };
        const result = await this.collection.insertOne(user);
        return result.ops[0];
    }

    // Obtenir un utilisateur par ID
    async getUserById(userId) {
        const _id = new ObjectId(userId);
        return await this.collection.findOne({ _id });
    }

    // Obtenir un utilisateur par nom d'utilisateur
    async getUserByUsername(username) {
        return await this.collection.findOne({ username });
    }

    // Mettre à jour un utilisateur
    async updateUser(userId, updates) {
        const _id = new ObjectId(userId);
        const result = await this.collection.updateOne(
            { _id },
            { $set: updates, $currentDate: { updatedAt: true } }
        );
        return result.modifiedCount;
    }

    // Supprimer un utilisateur
    async deleteUser(userId) {
        const _id = new ObjectId(userId);
        const result = await this.collection.deleteOne({ _id });
        return result.deletedCount;
    }*/
}

// Exemple d'utilisation :
// (dans un fichier séparé après avoir établi une connexion à MongoDB)
// const db = client.db('your_database_name');
// const userModel = new UserModel(db);

module.exports = UserModel;
