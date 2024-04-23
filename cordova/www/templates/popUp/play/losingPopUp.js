import {BASE_URL_PAGE} from "../../../util/frontPath.js";
import {endGamePopUp} from "./endGamePopUp.js";

function losingPopUp() {
    endGamePopUp("Tu as perdu !", BASE_URL_PAGE + "images/lose.png")
}

export {losingPopUp};
