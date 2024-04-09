"use strict";

import {API_URL, CHATS_API, FRIENDS_API} from "../util/path.js";
import {BASE_URL_API, BASE_URL_PAGE} from "../util/frontPath.js";







// do not import io, it is imported from the HTML file.
const chatSocket = io("/api/chat", {auth: {token: localStorage.getItem("token")}});

const back = BASE_URL_PAGE + "images/arrow-left-solid.svg";

const chatTemplate = document.createElement("template");

chatTemplate.innerHTML = `
<link rel="stylesheet" href="${BASE_URL_PAGE}chat/chat.css">

    <!DOCTYPE html>
<html lang="fr" >
<head>
  <meta charset="UTF-8">
  <title>Chat</title>

</head>
<body>
<div class="center">
  <div class="contacts">
  <div class="back">
        <img alt="Retour" src=` + back + `>
    </div>
    <h2>
      Contacts
    </h2>
  </div>
  <div class="chat">
    <div class="back">
        <img alt="Retour" src=` + back + `>
    </div>
    <div class="contact bar">
      <div class="name" id="friendSelected">
      </div>
    </div>
    <div class="messages" id="chat">
    </div>
    <form class="input">
      <input placeholder="Ecris ton message ici !" type="text" class="message-input"/>
      <button type="submit">
        <i class="send-button">Envoyer</i>
    </form>
  </div>
</div>

</body>
</html>
`;

class Chat extends HTMLElement {
    #userId;
    #friends;
    #LastMessage;
    #friendSelected;
    #messagesToGet;
    #messagesToSkip;
    #chat;

    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(chatTemplate.content.cloneNode(true));
        this.#userId = localStorage.getItem("userId");
        this.#messagesToGet = 10;
        this.#messagesToSkip = 0;
        this.#LastMessage = "No message";
        this.#chat = this.shadowRoot.querySelector("#chat");
    }

    async connectedCallback() {
        this.#addSocketEvent();
        let contacts = this.shadowRoot.querySelector(".contacts");
        this.#friends = fetch(BASE_URL_API + API_URL + FRIENDS_API + 'getFriends' + "/" + this.#userId, {
            method: 'get', headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                throw new Error("Error while calling API (button) " + response.status)
            }
            return response.json();
        }).then((data) => {
            return data;
        }).catch(error => {
            console.log(error);
        });
        this.#friends = await this.#friends;
        for (let i = 0; i < this.#friends.length; i++) {
            this.addFriendToChat(i, contacts);
        }
        if (this.#friends.length === 0) {
            let noFriend = document.createElement("div");
            noFriend.innerText = "Ajoutez des amis pour pouvoir chatter avec eux";
            contacts.appendChild(noFriend);
        } else {
            this.#friendSelected = this.#friends[0];
            let name = this.shadowRoot.querySelector("#friendSelected");
            name.innerText = this.#friendSelected.username;
            this.#addEventSubmit();
            chatSocket.emit("init", this.#userId, this.#friendSelected.userId);
            this.#getMessagesFromBack();
            this.#chat.addEventListener("scroll", () => {
                if (this.#chat.scrollTop <= 0 && this.#messagesToSkip >= 10) {
                    this.#getMessagesFromBack();
                }
            });
        }
        let back = this.shadowRoot.querySelectorAll(".back");
        back[0].addEventListener("click", () => {
                this.style.display = "none";
            }
        );
        back[1].addEventListener("click", () => {
                let globalChat = this.shadowRoot.querySelector(".chat");
                globalChat.style.visibility = "hidden";
            }
        );
    }

    addFriendToChat(i, contacts) {
        let contact = document.createElement("div");
        let name = document.createElement("div");
        let message = document.createElement("div");
        let notif = document.createElement("span");
        contact.classList.add("contact");
        name.classList.add("name");
        message.classList.add("message");
        notif.classList.add("notif");
        // querySelector method uses CSS3 selectors for querying the DOM and CSS3 doesn't support ID selectors that start with a digit:
        message.id = "a" + this.#friends[i].userId;
        notif.id = "n" + this.#friends[i].userId;
        name.innerText = this.#friends[i].username;
        notif.innerHTML = "&#128308;";
        chatSocket.emit("getLastMessageForProfile", this.#userId, this.#friends[i].userId);
        message.innerText = this.#LastMessage;
        let fragment = document.createDocumentFragment();
        fragment.appendChild(name.cloneNode(true));
        fragment.appendChild(message.cloneNode(true));
        fragment.appendChild(notif.cloneNode(true));
        contact.appendChild(fragment);
        contacts.appendChild(contact.cloneNode(true));
        this.#addFriendSelector();
        chatSocket.emit('init', this.#userId, this.#friends[i].userId);
    }

    #addSocketEvent() {
        chatSocket.on("getLastMessageFromBack", (message, user2) => {
            if (message.length !== 0) {
                let id = "#a" + user2;
                let messageDiv = this.shadowRoot.querySelector(id);
                messageDiv.innerText = "Dernier message : " + message[0].message;
            }
        });
        chatSocket.on('messageAddedInDb', () => {
            chatSocket.emit("updateChat", this.#userId, this.#friendSelected.userId);
        });
        chatSocket.on('updateLastMessage', (user1, user2) => {
            if (user1 === this.#userId) {
                chatSocket.emit("getLastMessageForProfile", user1, user2);
            } else
                chatSocket.emit("getLastMessageForProfile", user2, user1);
        });

        chatSocket.on('updateChatFromBack', (message, user1, user2) => {
            if (user1 === this.#userId && user2 === this.#friendSelected.userId || user1 === this.#friendSelected.userId && user2 === this.#userId) {
                let messageToAdd = document.createElement("div");
                messageToAdd.classList.add("message");
                if (message[0].idSender === this.#userId) {
                    messageToAdd.classList.add("sender");
                } else {
                    messageToAdd.classList.add("receiver");
                }
                messageToAdd.innerText = message[0].message;
                this.#chat.append(messageToAdd);
                this.#chat.scrollTop = this.#chat.scrollHeight;
            } else {
                let notifId = "#n" + user1;
                let notif = this.shadowRoot.querySelector(notifId);
                notif.style.visibility = "visible";
                notif.style.display = "block";
            }

            if (message[0].idReceiver === this.#userId) {
                //beepDevice(1);
            }
        });
    }

    #addFriendSelector() {
        let contacts = this.shadowRoot.querySelector(".contacts");
        let contact = contacts.lastChild;
        contact.addEventListener("click", (e) => {
            e.preventDefault();
            this.#friendSelected = this.#friends.find(friend => friend.username === contact.childNodes[0].textContent);
            let name = this.shadowRoot.querySelector("#friendSelected");
            chatSocket.emit('read', this.#friendSelected.userId, this.#userId);
            name.innerText = this.#friendSelected.username;
            this.#messagesToSkip = 0;
            chatSocket.emit("init", this.#userId, this.#friendSelected.userId);
            this.#chat.innerText = "";
            //chatSocket.emit("getLastMessageForProfile", this.#userId, this.#friendSelected.userId);
            this.#getMessagesFromBack();
            let notifId = "#n" + this.#friendSelected.userId;
            let notif = this.shadowRoot.querySelector(notifId);
            notif.style.visibility = "hidden";
            let chatGlobal = this.shadowRoot.querySelector(".chat");
            chatGlobal.style.visibility = "visible";
        });
    }


    #addEventSubmit() {
        let submitForm = this.shadowRoot.querySelector(".input");
        let submitButton = this.shadowRoot.querySelector(".send-button");
        submitButton.addEventListener("click", (event) => {
            event.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.userId);
                submitForm.querySelector(".message-input").value = "";
                this.#messagesToSkip = 0;
            }
        });
        submitForm.addEventListener("submit", (event) => {
            event.preventDefault();
            if (submitForm.querySelector(".message-input").value !== "") {
                let message = submitForm.querySelector(".message-input").value;
                chatSocket.emit("sendMessage", message, this.#userId, this.#friendSelected.userId);
                submitForm.querySelector(".message-input").value = "";
                this.#messagesToSkip = 0;
            }
        });
    }

    #getMessagesFromBack() {
        fetch(BASE_URL_API + API_URL + CHATS_API + "get?"
            + `friendId=${this.#friendSelected.userId}&numberMessagesToGet=${this.#messagesToGet}&numberMessagesToSkip=${this.#messagesToSkip}`, {
            method: "get", headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token'),
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            }
        }).then((response) => {
            if (!response.ok) {
                console.log("Error while retrieving messages from back", response.status);
            }
            return response.json();
        }).then(data => {
                data.forEach(messageInDB => {
                    let messageDiv = document.createElement("div");
                    messageDiv.classList.add("message");
                    if (messageInDB.idSender === this.#userId) {
                        messageDiv.classList.add("sender");
                    } else {
                        messageDiv.classList.add("receiver");
                    }
                    messageDiv.innerHTML = messageInDB.message;
                    this.#chat.prepend(messageDiv);
                    messageDiv.scrollIntoView();
                })
                if (this.#messagesToSkip === 0) {
                    this.#chat.scrollTop = this.#chat.scrollHeight;
                }
                this.#messagesToSkip += data.length;
            }
        )
    }

}

window.customElements.define('chat-global', Chat)


