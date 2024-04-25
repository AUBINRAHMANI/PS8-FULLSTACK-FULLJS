"use strict";


import {BASE_URL_PAGE} from "../util/frontPath.js";

const burgerMenuOpenCloseTemplate = document.createElement("template");

burgerMenuOpenCloseTemplate.innerHTML = `
<link rel="stylesheet" href="${BASE_URL_PAGE}menu/burgermenu.css">
<a>
    <div class="hamburger">
        <span class="bar"></span>
        <span class="bar"></span>
        <span class="bar"></span>
    </div>
</a> 
`;

class BurgermenuOpenClose extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({mode: "open"});
        this.shadowRoot.appendChild(burgerMenuOpenCloseTemplate.content.cloneNode(true));
    }

    connectedCallback() {
        const hamburger = this.shadowRoot.querySelector(".hamburger");
        const burgerMenu = document.querySelector("burger-menu");
        const navBar = burgerMenu.shadowRoot.querySelector(".nav-bar");
        const navButtonsDiv = burgerMenu.shadowRoot.querySelector("#menu-buttons");

        hamburger.addEventListener("click", () => {
            hamburger.classList.toggle("active");
            navBar.classList.toggle("active");


            let navButtons = burgerMenu.shadowRoot.querySelectorAll("button");
            if (hamburger.classList.contains("active")) {
                navButtonsDiv.style.display = "block";
            } else {
                navButtonsDiv.style.display = "none";
            }
        });

        this.shadowRoot
            .querySelectorAll(".nav-link")
            .forEach(n => n.addEventListener("click", () => {
                hamburger.classList.remove("active");
                navBar.classList.remove("active");
            }));
    }
}

window.customElements.define('burger-menu-open-close', BurgermenuOpenClose);
