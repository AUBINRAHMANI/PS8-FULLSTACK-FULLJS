import {BASE_URL_PAGE} from "../../../util/frontPath.js";

function informativePopUp(text, functionToExecute) {
    const validationPopUp = document.createElement("div");
    validationPopUp.classList.add("popup");

    const popUpContainer = document.createElement("div")
    popUpContainer.classList.add("popup-container", "flex-column");

    const content = document.createElement("p")
    content.innerText = text;

    const imgContainer = document.createElement("div");
    imgContainer.classList.add("cross-container");

    const closeIcon = document.createElement("img");
    closeIcon.src = BASE_URL_PAGE + "images/cross.png";

    closeIcon.addEventListener("click", () => {
        if (functionToExecute) functionToExecute();
        validationPopUp.remove();
    });

    // ------------------ Add elements to the DOM ------------------

    imgContainer.appendChild(closeIcon);


    const popUpFragment = document.createDocumentFragment();
    popUpFragment.appendChild(imgContainer);
    popUpFragment.appendChild(content);

    popUpContainer.appendChild(popUpFragment);
    validationPopUp.appendChild(popUpContainer);

    document.body.appendChild(validationPopUp);
}

export {informativePopUp};
