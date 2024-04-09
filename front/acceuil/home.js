import {PLAY_AI_ORDER_URL, PLAY_LOCAL_URL, PLAY_MATCHMAKING_URL} from "../util/path.js";
//import {KonamiCode} from "../EasterEggs/konami.js";
import {BASE_URL_PAGE} from "../util/frontPath.js";

//const { PLAY_AI_ORDER_URL, PLAY_LOCAL_URL, PLAY_MATCHMAKING_URL } = require("../util/path.js");
//const { KonamiCode } = require("../EasterEggs/konami.js");
//const { BASE_URL_PAGE } = require("../util/frontPath.js");


// document.getElementById("play-ai").addEventListener("click", () => {
//     window.location.href = BASE_URL_PAGE + PLAY_AI_ORDER_URL;
// });
//
// document.getElementById("play-local").addEventListener("click", () => {
//     window.location.href = BASE_URL_PAGE + PLAY_LOCAL_URL;
// });
//
// document.getElementById("play-matchmaking").addEventListener("click", () => {
//     window.location.href = BASE_URL_PAGE + PLAY_MATCHMAKING_URL;
// });

// ----------- Handle offline and online mode -----------

document.addEventListener("offline", onOffline, false);
document.addEventListener("online", onOnline, false);

function onOffline() {
    document.getElementById("offline-info").style.display = "block";
    document.getElementById("play-ai").style.display = "none";
    document.getElementById("play-matchmaking").style.display = "none";
    document.getElementsByTagName("burger-menu-open-close")[0].style.display = "none";
    document.getElementsByTagName("burger-menu")[0].style.display = "none";
    document.getElementsByTagName("main")[0].style.width = "100vw";
    document.getElementsByClassName("top-page")[0].style.width = "100%"
}

function onOnline() {
    document.getElementById("offline-info").style.display = "none";
    document.getElementById("play-ai").style.display = "block";
    document.getElementById("play-matchmaking").style.display = "block";
    document.getElementsByTagName("burger-menu-open-close")[0].style.display = "flex";
    document.getElementsByTagName("burger-menu")[0].style.display = "block";
    document.getElementsByTagName("main")[0].style.width = "auto";
    document.getElementsByClassName("top-page")[0].style.width = "calc(100% - 79px)";
}
