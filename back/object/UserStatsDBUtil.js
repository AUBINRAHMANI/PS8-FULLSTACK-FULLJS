"use strict";

 import AchievementsDBUtil from "./AchievementsDBUtil.js";
 import userstatsdb from "../database/userstatsdb.js";
 import {updateElo} from "./UserEloDBUtil.js";




export function STATSaddGamePlayed(userId) {
    userstatsdb.getStatsForUser(userId).then(function (result) {
        let gamesPlayed = result.gamesPlayed;

        if (!Number.isFinite(gamesPlayed)) {
            console.log("no previous stats found for this user, creating new stats");
            gamesPlayed = 0;
        }

        gamesPlayed++;

        userstatsdb.addStats(userId, {gamesPlayed: gamesPlayed}).then(function (result) {
            AchievementsDBUtil.updateAchievements(userId);
        }).catch(function (error) {
            console.log("error while saving the stats to the database");
            console.log(error);
        });
    });
}

export function STATSupdateElo(winnerId, loserId) {
    updateElo(winnerId, loserId);
}


