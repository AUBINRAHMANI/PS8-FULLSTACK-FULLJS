
import {authorizeRequest, sendResponse, urlNotFound, USER_ID, USERNAME} from "../utilsApi.js";
import frienddb from "../../database/frienddb.js";
import userdb from "../../database/userdb.js";
import sendNotifications from "../../socket/SendNotifications.js";
import SendNotifications from "../../socket/SendNotifications.js";





function friendsApiGet(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    switch (urlPathArray[0]) {
        case "getFriends":
            getFriends(request, response);
            break;
        case "getPending":
            getPending(request, response);
            break;
        case "getRequests":
            getRequest(request, response);
            break;
        case "getAll":
            getAll(request, response);
            break;
        case "friendshipStatus":
            friendshipStatus(request, response, urlPathArray[1]);
            break;
        default:
            urlNotFound(request, response)
    }
}

function friendsApiPost(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    switch (urlPathArray[0]) {
        case "add":
            addFriend(request, response, urlPathArray[1]);
            break;
        case "accept":
            acceptFriend(request, response, urlPathArray[1]);
            break;
        default:
            urlNotFound(request, response)
    }
}

function friendsApiDelete(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    switch (urlPathArray[0]) {
        case "removeFriend":
            removeFriend(request, response, urlPathArray[1]);
            break;
        case "removePending":
            removePending(request, response, urlPathArray[1]);
            break;
        case "removeRequest":
            removeRequest(request, response, urlPathArray[1]);
            break;
        default:
            urlNotFound(request, response);
    }
}

// ------------------------------------------------------------------------------------------------------------------

function addFriend(request, response, friendId) {
    let userIdEmitTheRequest = request[USER_ID];
    let username = request[USERNAME];

    checkUserIds(userIdEmitTheRequest, friendId).then((values) => {
        let requestPromise = frienddb.addRequest(userIdEmitTheRequest, friendId);
        let pendingPromise = frienddb.addPending(friendId, userIdEmitTheRequest);
        Promise.all([requestPromise, pendingPromise]).then(() => {
            sendResponse(response, 200, "Friend request sent to " + friendId + " from " + userIdEmitTheRequest);

            try {
                sendNotifications.sendNotificationFriendRequestReceived(friendId, userIdEmitTheRequest, username);
            } catch (err) {
                console.log("add Friend send notification " + err)
            }
        }).catch((err) => {
            console.log("add Friend end 2")
            sendResponse(response, 404, "Friend request not processed : " + err);
        });
    }).catch((err) => {
        console.log("add Friend end 3" + err)
        sendResponse(response, 404, err);
    });
}

function acceptFriend(request, response, friendId) {
    let userIdEmitTheRequest = request[USER_ID];
    let username = request[USERNAME];
    checkUserIds(userIdEmitTheRequest, friendId).then((values) => {
        frienddb.addFriends(userIdEmitTheRequest, friendId).then(() => {
            sendResponse(response, 200, "Friend request accepted from " + friendId + " to " + userIdEmitTheRequest);
            sendNotifications.sendNotificationFriendRequestAccepted(friendId, username);
        }).catch((err) => {
            sendResponse(response, 404, "" + err);
        });
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });

}

function getFriends(request, response) {
    let userIdEmitTheRequest = request[USER_ID];
    getFriendsInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getFriendsInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getFriends(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function removeFriend(request, response, friendId) {
    let userIdEmitTheRequest = request[USER_ID];
    frienddb.removeFriend(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Friend " + friendId + " removed from " + userIdEmitTheRequest);
        SendNotifications.sendNotificationFriendRemoved(friendId, request[USERNAME]);
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function removePending(request, response, friendId) {
    let userIdEmitTheRequest = request[USER_ID];
    frienddb.removePending(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Pending friend " + friendId + " removed from " + userIdEmitTheRequest);
        SendNotifications.sendNotificationFriendRequestRefused(friendId, request[USERNAME])
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function removeRequest(request, response, friendId) {
    let userIdEmitTheRequest = request[USER_ID];
    frienddb.removeRequest(userIdEmitTheRequest, friendId).then(() => {
        sendResponse(response, 200, "Request friend " + friendId + " removed from " + userIdEmitTheRequest);
    }).catch((err) => {
        sendResponse(response, 404, "" + err);
    });
}

function getPending(request, response) {
    let userIdEmitTheRequest = request[USER_ID];
    getPendingInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getPendingInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getPending(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function getRequest(request, response) {
    let userIdEmitTheRequest = request[USER_ID];
    getRequestInternal(userIdEmitTheRequest).then(friends => {
        sendResponse(response, 200, JSON.stringify(friends));
    }).catch(err => {
        sendResponse(response, 500, "Impossible to retrieve friends " + err)
    });
}

async function getRequestInternal(userIdEmitTheRequest) {
    await userdb.checkUserExists(userIdEmitTheRequest)
    let friendsId = await frienddb.getRequests(userIdEmitTheRequest);
    return await userdb.getUsersByIds(friendsId);
}

function checkUserIds(userId, friendId) {
    let checkUserId = userdb.checkUserExists(userId);
    let checkFriendId = userdb.checkUserExists(friendId);
    return Promise.all([checkUserId, checkFriendId]);
}

function getAll(request, response) {
    let userIdEmitTheRequest = request[USER_ID];
    Promise.all([
        getFriendsInternal(userIdEmitTheRequest),
        getPendingInternal(userIdEmitTheRequest),
        getRequestInternal(userIdEmitTheRequest)]
    ).then((values) => {
        let friends = values[0];
        let pending = values[1];
        let requests = values[2];
        sendResponse(response, 200, JSON.stringify(
            {friends: friends, pending: pending, requests: requests}
        ));
    }).catch((err) => {
        sendResponse(response, 500, "" + err)
    });
}

function friendshipStatus(request, response, friendId) {
    let askerId = request[USER_ID];
    let test = frienddb.recoverFriendWithInit(askerId);

    Promise.all([test]).then((values) => {
        let friends = values[0];
        if (friends.friends.includes(friendId)) {
            sendResponse(response, 200, "friend");
            return;
        }
        if (friends.pending.includes(friendId)) {
            sendResponse(response, 200, "pending");
            return;
        }
        if (friends.requests.includes(friendId)) {
            sendResponse(response, 200, "request");
            return;
        }
        sendResponse(response, 200, "none");
    });
}

export {friendsApiGet, friendsApiPost, friendsApiDelete};
