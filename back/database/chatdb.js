import {MongoClient} from "mongodb";



class ChatDb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db("DatabaseName");
            this.chats = this.database.collection("chats" + "");
            this.#init();
        } catch (error) {
            console.error(error);
        }
    }

    #init() {
        this.chats.insertOne({
            idSender: "1",
            idReceiver: "2",
            message: "Hello",
            read: false,
            sentDate: new Date(),
        });
    }

    async verifyConnection() {
        if (typeof this.chats !== 'undefined') return;
        await this.connect();
    }

    async addMessage(idSender, idReceiver, message) {
        await this.verifyConnection();
        try {
            this.chats.insertOne({
                idSender: idSender,
                idReceiver: idReceiver,
                message: message,
                read: false,
                sentDate: new Date(),
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getMessages(idSender, idReceiver, numberMessagesToGet, numberMessagesToSkip) {
        await this.verifyConnection();
        try {
            let messages = await this.chats.find({
                $or: [
                    {idSender: idSender, idReceiver: idReceiver},
                    {idSender: idReceiver, idReceiver: idSender}
                ]
            });
            return await messages.sort({sentDate: -1}).skip(numberMessagesToSkip).limit(numberMessagesToGet)
                .toArray();
        } catch (error) {
            console.error(error);
        }
    }

    async readMessages(idSender, idReceiver) {
        await this.verifyConnection();
        try {
            this.chats.updateMany({
                idSender: idSender,
                idReceiver: idReceiver,
            }, {
                $set: {
                    read: true
                }
            });
        } catch (error) {
            console.error(error);
        }
    }

    async getLastReceivedMessage(idSender, idReceiver) {
        await this.verifyConnection();
        try {
            let messages = await this.chats.find({
                $or: [
                    {idSender: idSender, idReceiver: idReceiver},
                    {idSender: idReceiver, idReceiver: idSender}
                ]
            });
            return await messages.sort({sentDate: -1}).limit(1)
                .toArray();
        } catch (error) {
            console.error(error);
        }
    }

}

export default new ChatDb();