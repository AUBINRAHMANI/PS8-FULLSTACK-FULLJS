import {endGamePopUp} from "./endGamePopUp.js";
import {BASE_URL_PAGE} from "../../../util/frontPath.js";

function drawPopUp() {
    endGamePopUp("Egalité !", BASE_URL_PAGE + "images/draw.png")
}

export {drawPopUp};
