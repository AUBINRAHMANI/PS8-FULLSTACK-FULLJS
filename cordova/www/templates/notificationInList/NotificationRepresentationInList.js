"use strict";

import {API_URL, NOTIFICATIONS_API} from "../../util/path.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../../util/frontPath.js";
import {validationPopUp} from "../popUp/validationPopUp/validationPopUp.js";


function createNotificationRepresentation(notificationInDB) {
    const container = document.createElement('div');
    const messageContainer = document.createElement('div');
    const message = document.createElement('p');
    const actionButton = document.createElement('img');
    const deleteButton = document.createElement('img');

    let notification = notificationInDB.notification;

    container.classList.add("flex-row", "notification-container");
    messageContainer.classList.add("flex-row", "message-container");
    messageContainer.id = notificationInDB.notificationId;

    deleteButton.src = `${BASE_URL_PAGE}images/trash-solid.svg`;
    deleteButton.alt = "Supprimer la notification";
    deleteButton.style.cursor = "pointer";

    actionButton.src = `${BASE_URL_PAGE}images/check-solid.svg`;
    actionButton.alt = "Valider l'action de la notification";
    actionButton.style.cursor = "pointer";

    deleteButton.addEventListener("click", () => {
        deleteNotificationWithValidation(container, messageContainer.id);
    });


    actionButton.addEventListener("click", () => {
        deleteNotification(container, messageContainer.id);
    });


    if (notification.action) {
        actionButton.addEventListener("click", () => {
            fetch(BASE_URL_API + API_URL + notification.action.url, {
                method: notification.action.method,
                headers: {
                    'Authorization': 'Bearer ' + localStorage.getItem('token'),
                    'Accept': 'application/json',
                    'Content-Type': 'application/json'
                },
                body: (notification.action.body) ? JSON.stringify(notification.action.body) : {}

            }).then((response) => {
                if (!response.ok) {
                    console.log("Error while retrieving notifications", response.status)
                    // There is an error
                }
                messageContainer.remove();
            }).catch(error => {
                console.log(error);
            })
        })
    }

    if (notification.link) {
        actionButton.addEventListener("click", () => {
            window.location.replace(BASE_URL_PAGE + notification.link);
        })
    }


    message.innerText = notification.message;
    messageContainer.appendChild(message);

    const fragment = document.createDocumentFragment();
    fragment.appendChild(messageContainer);
    fragment.appendChild(deleteButton);
    if (notification.action || notification.link) {
        fragment.appendChild(actionButton);
    }
    container.appendChild(fragment);

    return container;
}

function deleteNotification(container, notificationId) {
    fetch(BASE_URL_API + API_URL + NOTIFICATIONS_API + "delete/" + notificationId, {
        method: "delete", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            console.log("Error while deleting notifications", response.status, response.text())
            // There is an error
        }
        container.remove();
    }).catch(error => {
        console.log(error);
    });
}

function deleteNotificationWithValidation(container, notificationId) {
    validationPopUp(() => deleteNotification(container, notificationId), "Voulez-vous supprimer cette notification ?");
}

export {createNotificationRepresentation};
