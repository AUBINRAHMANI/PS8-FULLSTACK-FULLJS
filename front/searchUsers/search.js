
import {API_URL, USERS_API} from "../util/path.js";
import {createUserPreviewDiv} from "../templates/userInList/UserRepresentationInList.js";
import {BASE_URL_API} from "../util/frontPath.js";


const usersListContainer = document.getElementById("search-result");

window.addEventListener('load', function () {
    document.getElementById("search-form").addEventListener("submit", function (event) {
        event.preventDefault();
        removeUsersListContent();

        let name = document.getElementById("form-username").value
        fetch(BASE_URL_API + API_URL + USERS_API + "getName?" + new URLSearchParams({
            name: name
        }), {
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
        }).then(data => data.forEach(user => {
            let userDiv = createUserPreviewDiv(user);

            let searchName = document.getElementById("form-username").value.toLowerCase();
            makeTextBoldFromSearch(userDiv, user, searchName);

            usersListContainer.appendChild(userDiv);
        }))
    });
});

function makeTextBoldFromSearch(userDiv, completeUser, searchName) {
    // Get the <p> element containing the username in userDiv
    let usernameElement = userDiv.querySelector("p");
    let usernameText = usernameElement.innerText;

    let dbUsername = completeUser.username.toLowerCase();

    let index = dbUsername.indexOf(searchName);
    // If the search term is found in the username, make the search term bold
    if (index !== -1) {
        let boldElement = document.createElement("b");
        boldElement.innerText = usernameText.substring(index, index + searchName.length);
        usernameElement.innerHTML = usernameText.substring(0, index) + boldElement.outerHTML + usernameText.substring(index + searchName.length);
    }
}

function removeUsersListContent() {
    usersListContainer.innerHTML = ""
}


