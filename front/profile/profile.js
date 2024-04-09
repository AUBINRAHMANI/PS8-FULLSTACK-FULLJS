"use strict";


import {ACHIEVEMENTS_API, API_URL, FRIENDS_API, STATS_API, USERS_API} from "../util/path.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../util/frontPath.js";
import {achievementRepresentation} from "../templates/achievement/achievementRepresentation.js";
import {validationPopUp} from "../templates/popUp/validationPopUp/validationPopUp.js";


let myUserId = localStorage.getItem("userId");
let myUserName = localStorage.getItem("username");
let url = new URL(window.location.href);
let userIdOfThisPage = url.searchParams.get("userId");
let itIsMyProfile = !Boolean(userIdOfThisPage);

let userIdWeAreLookingAt = itIsMyProfile ? myUserId : userIdOfThisPage;

getUserStats(userIdWeAreLookingAt).then((stats) => {
    document.getElementById("elo").innerText = "ELO : " + stats.elo;
}).catch((error) => {
    console.log("error while getting the stats for user", error);
});

let user;
if (itIsMyProfile) {
    document.getElementById("salutation").innerText = "Bonjour " + myUserName + " !";
} else {
    user = await getUser(userIdWeAreLookingAt);
    document.getElementById("salutation").innerText = "Bienvenue sur la page de " + user.username + " !";
    document.getElementsByClassName("page-title")[0].innerText = "Profil de " + user.username;
    addFriendshipButton();
    await updateButton();
}

populateAchievementsDiv(userIdWeAreLookingAt).then(() => {
}).catch((error) => {
    console.log("error while populating achievements div", error);
});


// functions ------------------------------------------------------------------------------------------------------------
function addFriendshipButton() {
    // add a button to the page
    let friendshipButton = document.createElement("button");
    friendshipButton.innerText = "Ajouter en ami";
    friendshipButton.id = "friendshipButton";
    // add this button to the page
    document.getElementById("friendshipButtonDiv").appendChild(friendshipButton);
}

async function updateButton() {
    let friendshipButton = document.getElementById("friendshipButton");

    let status = await getStatus(userIdOfThisPage);

    // Clone the button to remove existing event listeners
    let newButton = friendshipButton.cloneNode(true);
    friendshipButton.parentNode.replaceChild(newButton, friendshipButton);
    friendshipButton = newButton;

    switch (status) {
        case "request":
            friendshipButton.innerText = "Annuler la demande d'ami";
            const functionToExecuteCancelRequest = () => {
                cancelRequest(userIdOfThisPage).then(() => {
                    updateButton();
                })
            };
            friendshipButton.addEventListener("click",
                () => validationPopUp(functionToExecuteCancelRequest, `Voulez-vous vraiment annuler la demande d'ami à ${user.username} ?`)
            );

            break;
        case "friend":
            friendshipButton.innerText = "Retirer de mes amis";

            const functionToExecuteRemoveFriend = () => {
                removeFriend(userIdOfThisPage).then(() => {
                    updateButton();
                    location.reload();
                });
            };
            friendshipButton.addEventListener("click",
                () => validationPopUp(functionToExecuteRemoveFriend, `Voulez-vous vraiment retirer ${user.username} des amis ?`)
            );

            break;
        case "pending":
            friendshipButton.innerText = "Accepter la demande";
            friendshipButton.addEventListener("click", () => {
                acceptFriend(userIdOfThisPage).then(() => {
                    updateButton();
                    location.reload();
                });
            });
            break;

        case "none":
            friendshipButton.innerText = "Ajouter aux amis";
            friendshipButton.addEventListener("click", () => {
                addFriend(userIdOfThisPage).then(() => {
                    updateButton();
                });
            });
            break;
    }
}

function getStatus(userId) {
    return callFriendAPI('get', 'friendshipStatus', userId);
}

function addFriend(userIdOfThisPage) {
    return callFriendAPI('post', 'add', userIdOfThisPage);
}

function acceptFriend(userIdOfThisPage) {
    return callFriendAPI('post', 'accept', userIdOfThisPage);
}

function cancelRequest(userIdOfThisPage) {
    return callFriendAPI('delete', 'removeRequest', userIdOfThisPage);
}

function removeFriend(userIdOfThisPage) {
    return callFriendAPI('delete', 'removeFriend', userIdOfThisPage);
}

async function populateAchievementsDiv(userId) {
    let achievements = await getUserAchievements(userId);
    let allPossibleAchievements = await getAllPossibleAchievements();

    let achievementsDiv = document.getElementById("achievements");

    for (let achievementElement of Object.entries(allPossibleAchievements)) {
        let achievementId = achievementElement[0];
        let achievement = achievementElement[1];

        let userAchievement = achievements.find(userAchievement => userAchievement.achievementId === achievementId);

        if (!achievement.isHidden || (achievement.isHidden && userAchievement && userAchievement.obtained)) {
            let name = achievement.friendlyName;
            let found = userAchievement ? userAchievement.obtained : false;
            let advancement_ratio = userAchievement ? userAchievement.progress : 0;
            let goal = achievement.maxProgress;
            let srcImg = BASE_URL_PAGE + achievement.imgSrc;
            let achievementDiv = achievementRepresentation(name, found, advancement_ratio, goal, srcImg);
            achievementsDiv.appendChild(achievementDiv);
        }

    }
}

function getAllPossibleAchievements() {
    return callAPI(BASE_URL_API + API_URL + ACHIEVEMENTS_API + "getAllPossible/", "post");
}

function getUserAchievements(userId) {
    return callAPI(BASE_URL_API + API_URL + ACHIEVEMENTS_API + "getAll/" + userId, "post");
}

function getUserStats(userId) {
    return callAPI(BASE_URL_API + API_URL + STATS_API + "getAll/" + userId, "get");
}

function callAPI(url, method) {
    return fetch(url, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API" + response.status)
        }
        return response.json();
    }).then((object) => {
        return object;
    }).catch(error => {
        console.log(error);
    });
}

function callFriendAPI(method, subUrl, userId) {
    return fetch(BASE_URL_API + API_URL + FRIENDS_API + subUrl + "/" + userId, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        return response.text();
    }).then((data) => {
        return data;
    }).catch(error => {
        console.log(error);
    });
}

function getUser(userId) {
    return callAPI(BASE_URL_API + API_URL + USERS_API + "get/" + userId, "get");
}
