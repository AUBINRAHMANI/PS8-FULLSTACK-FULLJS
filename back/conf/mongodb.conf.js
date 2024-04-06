const {
    DB_USER,
    DB_PASSWORD,
    DB_HOST,
    DB_PORT,
    DB_NAME,
    USER_COLLECTION,
    GAME_COLLECTION,
    ACHIEVEMENTS_COLLECTION,
    FRIENDS_COLLECTION,
    USER_STATS_COLLECTION,
    CHATS_COLLECTION,
    NOTIFICATION_COLLECTION,
} = process.env;

export default{
    mongodbUri: "mongodb://root:example@mongodb:27017",
    dbName: DB_NAME,
    userCollection: USER_COLLECTION,
    gameCollection: GAME_COLLECTION,
    achievementsCollection: ACHIEVEMENTS_COLLECTION,
    friendsCollection: FRIENDS_COLLECTION,
    userStatsCollection: USER_STATS_COLLECTION,
    chatsCollection: CHATS_COLLECTION,
    notificationCollection: NOTIFICATION_COLLECTION,
};
