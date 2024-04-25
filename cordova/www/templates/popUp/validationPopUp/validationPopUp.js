import {BASE_URL_PAGE} from "../../../util/frontPath.js";

function validationPopUp(functionToExecute, text) {
    const validationPopUp = document.createElement("div");
    validationPopUp.classList.add("popup");

    const popUpContainer = document.createElement("div")
    popUpContainer.classList.add("popup-container", "flex-column");

    const content = document.createElement("p")
    content.innerText = text;

    const buttonsContainer = document.createElement("div");
    buttonsContainer.classList.add("buttons-popup", "flex-row");

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("cross-container");

    const closeIcon = document.createElement("img");
    closeIcon.src = BASE_URL_PAGE + "images/cross.png";

    closeIcon.addEventListener("click", () => {
        validationPopUp.remove();
    });

    const yesButton = document.createElement("button");
    yesButton.innerText = "Oui";
    yesButton.addEventListener("click", () => {
        functionToExecute();
        validationPopUp.remove();
    });

    const noButton = document.createElement("button");
    noButton.innerText = "Non";
    noButton.addEventListener("click", () => {
        validationPopUp.remove();
    });

    // ------------------ Add elements to the DOM ------------------

    imgContainer.appendChild(closeIcon);

    const buttonsFragment = document.createDocumentFragment();

    buttonsFragment.appendChild(yesButton);
    buttonsFragment.appendChild(noButton);

    buttonsContainer.appendChild(buttonsFragment);

    const popUpFragment = document.createDocumentFragment();
    popUpFragment.appendChild(imgContainer);
    popUpFragment.appendChild(content);
    popUpFragment.appendChild(buttonsContainer);

    popUpContainer.appendChild(popUpFragment);
    validationPopUp.appendChild(popUpContainer);

    document.body.appendChild(validationPopUp);
}

export {validationPopUp};
