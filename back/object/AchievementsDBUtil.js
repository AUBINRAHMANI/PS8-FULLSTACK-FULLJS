 import userstatsdb from "../database/userstatsdb.js";
 import achievementdb from "../database/achievementdb.js";




function updateAchievements(userId) {
    userstatsdb.getStatsForUser(userId).then(function (result) {
        nbGamesAchievement(userId, "1stGame", 1, result.gamesPlayed);
        nbGamesAchievement(userId, "10Games", 10, result.gamesPlayed);
        eloAchievement(userId, "bronze", 1500, result.elo);
        eloAchievement(userId, "silver", 2000, result.elo);
        eloAchievement(userId, "gold", 3000, result.elo);
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
}

function nbGamesAchievement(userId, achievementId, goal, actual) {
    if (actual < goal) {
        let percentage = actual / goal;
        achievementdb.addAchievement(userId, achievementId, percentage, false).then(function (result) {
            console.log("The achievementRepresentation 'result.stats.elo > " + goal + "' : '" + achievementId + "' was added to the database ! ");
        }).catch(function (error) {
            console.log("error while adding the achievementRepresentation to the database");
            console.log(error);
        });
    } else if (actual === goal) {
        achievementdb.addAchievement(userId, achievementId, 1, true).then(function (result) {
            console.log("The achievementRepresentation 'result.stats.elo > " + goal + "' : '" + achievementId + "' was added to the database ! ");
        }).catch(function (error) {
            console.log("error while adding the achievementRepresentation to the database");
            console.log(error);
        });
    }
}

function eloAchievement(userId, achievementId, goal, actual) {
    console.log("adding achievementRepresentation: " + achievementId + " for user: " + userId + " with goal: " + goal + " and actual: " + actual);
    if (actual >= goal) {
        achievementdb.addAchievement(userId, achievementId, 1, true).then(function (result) {
            console.log("The achievementRepresentation 'result.stats.elo > " + goal + "' : '" + achievementId + "' was added to the database ! ");
        }).catch(function (error) {
            console.log("error while adding the achievementRepresentation to the database");
            console.log(error);
        });
    }
}

export default {updateAchievements};


