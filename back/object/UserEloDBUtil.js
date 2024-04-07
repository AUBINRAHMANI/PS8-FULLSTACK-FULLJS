 import userstatsdb from "../database/userstatsdb.js";
 import userdb from "../database/userdb.js";



async function updateElo(winnerId, loserId) {
    let winnerElo = 0;
    let loserElo = 0;
    await userstatsdb.getStatsForUser(winnerId).then(function (result) {
        winnerElo = result.elo;
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
    await userstatsdb.getStatsForUser(loserId).then(function (result) {
        loserElo = result.elo;
    }).catch(function (error) {
        console.log("error while retrieving the user stats");
        console.log(error);
    });
    let winnerExpected = 1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    let loserExpected = 1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));
    winnerElo = Math.round(winnerElo + 50 * (1 - winnerExpected));
    loserElo = Math.round(loserElo + 50 * (0 - loserExpected));
    if (loserElo < 0) {
        loserElo = 0;
    }
    await userstatsdb.updateElo(winnerId, winnerElo).then(r => {
        console.log("updated elo for winner");
    }).catch(e => {
        console.log("error while updating elo for winner");
        console.log(e);
    });
    await userstatsdb.updateElo(loserId, loserElo).then(r => {
        console.log("updated elo for loser");
    }).catch(e => {
        console.log("error while updating elo for loser");
        console.log(e);
    });
}

async function getAllUsersByElo() {
    let users = [];
    await userdb.getAllUsers().then(function (result) {
        users = result;
    }).catch(function (error) {
        console.log("error while retrieving all users");
        console.log(error);
    });
    let userStats = [];
    await userstatsdb.getUsersByElo().then(function (result) {
        userStats = result;
    }).catch(function (error) {
        console.log("error while retrieving all user stats");
        console.log(error);
    });
    let usersNames = [];
    for (let i = 0; i < userStats.length; i++) {
        for (const user of users) {
            if (user._id.toString() === userStats[i].userId) {
                usersNames.push({username: user.username, elo: userStats[i].elo});
                break;
            }
        }
    }
    return usersNames;
}



export default {updateElo, getAllUsersByElo};
