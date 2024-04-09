"use strict";


import {PROFILE_URL} from "../../util/path.js";
import {BASE_URL_PAGE} from "../../util/frontPath.js";

function createUserPreviewDiv(userObj) {
    const container = document.createElement('div');
    const img = document.createElement('img');
    const usernameContainer = document.createElement('p');

    // TODO change the link to redirect to the user page
    container.addEventListener("click", () => {
        let destination = BASE_URL_PAGE + PROFILE_URL + "?userId=" + userObj.userId;

        if (localStorage.getItem("userId") === userObj.userId) {
            destination = BASE_URL_PAGE + PROFILE_URL;
        }
        window.location.replace(destination);
    })

    usernameContainer.classList.add("username");

    container.classList.add("user-profile");
    img.classList.add("profile-picture");

    img.src = BASE_URL_PAGE + "images/user-solid.svg";
    img.alt = "Image de profil de l'utilisateur.";

    usernameContainer.innerText = userObj.username;
    container.id = userObj.userId;

    const fragment = document.createDocumentFragment();
    fragment.appendChild(img);
    fragment.appendChild(usernameContainer);

    container.appendChild(fragment);
    return container;
}

export {createUserPreviewDiv};
