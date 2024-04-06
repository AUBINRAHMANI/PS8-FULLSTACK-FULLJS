import {API_URL, FRIENDS_API, PLAY_CHALLENGE_URL} from "../util/path.js";
import {createUserPreviewDiv} from "../templates/userInList/UserRepresentationInList.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../util/frontPath.js";
import {IS_NEW_CHALLENGE, OPPONENT_ID} from "../play/challenge/constantsChallenge.js";
import {validationPopUp} from "../templates/popUp/validationPopUp/validationPopUp.js";



const friendsListContainer = document.getElementById("users-friends");
const pendingListContainer = document.getElementById("users-pending");
const requestsListContainer = document.getElementById("users-requests");
window.addEventListener('load', getAllData);

function getAllData() {
    fetch(BASE_URL_API + API_URL + FRIENDS_API + "getAll", {
        method: "get", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            console.log("Error while retrieving users", response.status)
        }
        return response.json()

    }).then(data => {
        data["friends"].forEach(user => addFriendToContainer(user));
        data["pending"].forEach(user => addPendingToContainer(user));
        data["requests"].forEach(user => addRequestToContainer(user));
    })
}

function addFriendToContainer(friend) {
    const friendContainer = document.createElement('div')
    const friendDiv = createUserPreviewDiv(friend);
    const removeButton = document.createElement('button');
    const challengeButton = document.createElement('button');

    friendContainer.classList.add("flex-row");
    let userId = friendDiv.id;

    removeButton.innerText = "Retirer";
    removeButton.addEventListener("click", () => {
        const functionToExecute = () => deleteFriendApi("removeFriend", userId, friendContainer);
        validationPopUp(functionToExecute, `Voulez-vous vraiment retirer ${friend.username} de vos amis ?`);
    });

    challengeButton.innerText = "Défier";
    challengeButton.addEventListener("click", () => {
        window.location.replace(BASE_URL_PAGE + PLAY_CHALLENGE_URL + `?${OPPONENT_ID}=${userId}&${IS_NEW_CHALLENGE}=true`)
    });

    const buttonsDiv = document.createElement('div');

    buttonsDiv.classList.add("flex-row");
    buttonsDiv.appendChild(removeButton);
    buttonsDiv.appendChild(challengeButton);
    const fragment = document.createDocumentFragment();
    fragment.appendChild(friendDiv);
    fragment.appendChild(buttonsDiv);

    friendContainer.appendChild(fragment);
    friendsListContainer.appendChild(friendContainer);
}

function addPendingToContainer(pending) {
    const pendingContainer = document.createElement('div')
    const pendingDiv = createUserPreviewDiv(pending);
    const removeButton = document.createElement('button');
    const acceptButton = document.createElement('button');

    pendingContainer.classList.add("flex-row");
    let userId = pendingDiv.id;

    removeButton.innerText = "Décliner";
    removeButton.addEventListener("click", () => {
        const functionToExecute = () => deleteFriendApi("removePending", userId, pendingContainer)
        validationPopUp(functionToExecute, `Voulez-vous vraiment décliner la demande d'ami de ${pending.username} ?`);
    });
    acceptButton.innerText = "Accepter";
    acceptButton.addEventListener("click", () => addFriendApi("accept", userId, pendingContainer));

    const buttonsDiv = document.createElement('div');

    buttonsDiv.classList.add("flex-row");
    buttonsDiv.appendChild(removeButton);
    buttonsDiv.appendChild(acceptButton);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(pendingDiv);
    fragment.appendChild(buttonsDiv);

    pendingContainer.appendChild(fragment);
    pendingListContainer.appendChild(pendingContainer);
}

function addRequestToContainer(request) {
    const requestContainer = document.createElement('div')
    const requestDiv = createUserPreviewDiv(request);
    const removeButton = document.createElement('button');

    let userId = requestDiv.id;

    requestContainer.classList.add("flex-row");
    removeButton.innerText = "Retirer";
    removeButton.addEventListener("click", () => {
        const functionToExecute = () => deleteFriendApi("removeRequest", userId, requestContainer);
        validationPopUp(functionToExecute, `Voulez-vous vraiment retirer votre demande d'ami à ${request.username} ?`);
    });

    const fragment = document.createDocumentFragment();
    fragment.appendChild(requestDiv);
    fragment.appendChild(removeButton);

    requestContainer.appendChild(fragment);
    requestsListContainer.appendChild(requestContainer);
}

function callFriendAPI(method, action, id) {
    return fetch(BASE_URL_API + API_URL + FRIENDS_API + action + "/" + id, {
        method: method, headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    });
}

function addFriendApi(action, id, container) {
    callFriendAPI("post", action, id).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        addFriendToContainer(
            {
                userId: container.getAttribute("id"),
                username: container.getElementsByClassName("username")[0].innerText
            })
        container.remove();
        location.reload();
    }).catch(error => {
        console.log(error);
    });
}

function deleteFriendApi(action, id, container) {
    callFriendAPI("delete", action, id).then((response) => {
        if (!response.ok) {
            throw new Error("Error while calling API (button) " + response.status)
        }
        container.remove();
        location.reload();
    }).catch(error => {
        console.log(error);
    });
}


