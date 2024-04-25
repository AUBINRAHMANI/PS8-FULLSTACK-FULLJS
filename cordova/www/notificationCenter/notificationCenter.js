import {createNotificationRepresentation} from "../templates/notificationInList/NotificationRepresentationInList.js";
import {API_URL, NOTIFICATIONS_API} from "../util/path.js";
import {BASE_URL_API} from "../util/frontPath.js";




let container = document.getElementById("notifications-container")
const DEFAULT_NUMBER_NOTIFICATIONS_TO_GET = 13;

let nbNotificationsReceived = 0;

const permanentSocket = io("/api/permanent", {auth: {token: localStorage.getItem("token")}});

// When the page is loaded, we want to load the first notifications
window.window.addEventListener('load', () => {
    getMoreNotifications(0);
});

// When the user scrolls down, we want to load more notifications
window.addEventListener('scroll', () => {
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight - 1;
    if (window.scrollY >= scrollableHeight) {
        getMoreNotifications(nbNotificationsReceived);
    }
});

permanentSocket.on("connect", () => {

    permanentSocket.on("notificationReceived", (notification) => {
        // We want to display the notification at the top because it is the most recent
        container.insertBefore(createNotificationRepresentation(notification), container.firstChild);
        nbNotificationsReceived++;
    });
});

function getMoreNotifications(numberToSkip) {
    fetch(BASE_URL_API + API_URL + NOTIFICATIONS_API + "get?"
        + `numberNotificationsToGet=${DEFAULT_NUMBER_NOTIFICATIONS_TO_GET}&numberNotificationsToSkip=${numberToSkip}`, {
        method: "get", headers: {
            'Authorization': 'Bearer ' + localStorage.getItem('token'),
            'Accept': 'application/json',
            'Content-Type': 'application/json'
        }
    }).then((response) => {
        if (!response.ok) {
            console.log("Error while retrieving notifications", response.status)
            // There is an error
        }
        return response.json()
    }).then(data => data.forEach(notificationInDB => {
        // Add a user case on the web page
        // Notifications are received from the most recent to the oldest
        // We want to display them from the more recent at the top to the oldest at the bottom
        container.appendChild(createNotificationRepresentation(notificationInDB));
        nbNotificationsReceived++;
    }));
}
