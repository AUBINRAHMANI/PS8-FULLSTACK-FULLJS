"use strict";



//const { PROFILE_URL } = require("./path.js");
//const { BASE_URL_PAGE } = require("./frontPath.js");

import {PROFILE_URL} from "./path.js";
import {BASE_URL_PAGE} from "./frontPath.js";


let username = document.getElementById("username");
username.innerText = localStorage.getItem("username");
 username.addEventListener("click", () => {
     window.location.replace(BASE_URL_PAGE + PROFILE_URL);
 });
