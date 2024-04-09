"use strict";


import {MongoClient} from "mongodb";

import DB_CONF from "../conf/mongodb.conf.js";


class UserStatsDb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db(DB_CONF.dbName);
            this.usersStats = this.database.collection(DB_CONF.userStatsCollection + "");
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.usersStats !== 'undefined') return;
        await this.connect();
    }

    async addStats(userId, stats) {
        await this.verifyConnection();

        try {
            if (!await this.existsStatsForThisUser(userId)) {
                return await this.usersStats.insertOne({userId, ...stats});
            } else {
                return await this.usersStats.updateOne({userId}, {$set: {userId, ...stats}});
            }
        } catch (error) {
            console.error(error);
        }
    }

    async existsStatsForThisUser(userId) {
        await this.verifyConnection();

        try {
            return await this.usersStats.findOne({userId}) !== null;
        } catch (error) {
            console.error(error);
        }
    }

    async getStatsForUser(userId) {
        await this.verifyConnection();

        try {
            if (await this.existsStatsForThisUser(userId)) {
                return await this.usersStats.findOne({userId});
            } else {
                await this.addStats(userId, this.getDefaultStats());
                return this.getStatsForUser(userId);
            }
        } catch (error) {
            console.error(error);
        }
    }

    async removeAllStats() {
        await this.verifyConnection();

        try {
            return await this.usersStats.deleteMany({});
        } catch (error) {
            console.error(error);
        }
    }

    getDefaultStats() {
        return {gamesPlayed: 0, elo: 1500}
    }

    async updateElo(userId, newElo) {
        await this.verifyConnection();

        try {
            return await this.usersStats.updateOne({userId}, {$set: {elo: newElo}});
        } catch (error) {
            console.error(error);
        }
    }

    async getUsersByElo() {
        await this.verifyConnection();
        try {
            return await this.usersStats.find({}).sort({elo: -1}).toArray();
        } catch (error) {
            console.error(error);
        }
    }
}


export default new UserStatsDb();