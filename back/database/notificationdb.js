

 import {MongoClient, ObjectId} from "mongodb";
 import DB_CONF from "../conf/mongodb.conf.js";


class GameDb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.notifications = this.database.collection(DB_CONF.notificationCollection);
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.notifications !== 'undefined') return;
        await this.connect();
    }

    async addNotification(userId, notification) {
        await this.verifyConnection();
        let object = this.createNewNotificationDBObject(userId, notification);
        await this.notifications.insertOne(object);
        object["notificationId"] = object._id.toString();
        delete object._id;
        return object;
    }

    async getNotifications(userId, numberNotificationsToGet, numberNotificationsToSkip) {
        await this.verifyConnection();
        const query = {userId: userId};
        const projection = [
            {"$match": query},
            {"$addFields": {notificationId: "$_id"}},
            {"$project": {_id: 0, userId: 0}},
        ];
        return await this.notifications.aggregate(projection).sort({date: -1}).skip(numberNotificationsToSkip).limit(numberNotificationsToGet).toArray();
    }

    async deleteNotification(notificationId) {
        await this.verifyConnection();
        const result = await this.notifications.deleteOne({_id: new ObjectId(notificationId)})
        // if result.deletedCount === 0, the notification was not deleted, otherwise 1 it was deleted
        return result.deletedCount;
    }

    createNewNotificationDBObject(userId, notification) {
        return {
            userId: userId,
            // friends of the user
            notification: notification,
            date: Date.now(),
        };
    }

}

 export default new GameDb();

