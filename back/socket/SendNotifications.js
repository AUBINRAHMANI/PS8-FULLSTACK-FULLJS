import connectedPlayer from "./PermanentSocketPlayers.js";
import notificationdb from "../database/notificationdb.js";
import Action from "../entities/Action.js";
import Notification from "../entities/Notification.js";



class SendNotifications {

    static #sendNotification = (receiverId, notification) => {
        SendNotifications.#addNotificationToDatabase(receiverId, notification).then((notificationFromDB) => {
            delete notificationFromDB.userId;
            SendNotifications.#sendNotificationToSocketPlayer(receiverId, notificationFromDB);
        });
    }

    static #sendNotificationToSocketPlayer = (receiverId, notification) => {
        if (connectedPlayer.isPlayerConnected(receiverId)) {
            connectedPlayer.sendToPlayer(receiverId, "notificationReceived", notification);
        }
    }

    static #addNotificationToDatabase = (receiverId, notification) => {
        return notificationdb.addNotification(receiverId, notification);
    }

    // ----------------------------------------- FRIEND REQUEST ----------------------------------------------
    static sendNotificationFriendRequestReceived(receiverId, userId, username) {
        let action = new Action("post", `friends/accept/${userId}`, {});
        let notification = new Notification(`Demande d'ami reçue par ${username}`, action);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRequestAccepted(receiverId, username) {
        let notification = new Notification(`Demande d'ami acceptée par ${username}`);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRequestRefused(receiverId, username) {
        let notification = new Notification(`Demande d'ami refusée par ${username}`);
        SendNotifications.#sendNotification(receiverId, notification);
    }

    static sendNotificationFriendRemoved(receiverId, username) {
        let notification = new Notification(`Vous n'êtes plus ami avec ${username}`);
        SendNotifications.#sendNotification(receiverId, notification);
    }


}

export default SendNotifications;
