import {BASE_URL_PAGE} from "../../../util/frontPath.js";
import {endGamePopUp} from "./endGamePopUp.js";

function winningPopUp() {
    endGamePopUp("Tu as gagné !", BASE_URL_PAGE + "images/win.png")
}

export {winningPopUp};
