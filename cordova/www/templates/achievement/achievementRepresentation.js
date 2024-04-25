function achievementRepresentation(nameAchievement, found, advancement_ratio, goal, srcImg) {
    const imgContainer = document.createElement("div");
    const img = document.createElement("img");
    const info = document.createElement("p");

    img.src = srcImg;
    img.classList.add("achievement-img");
    info.style.visibility = "hidden";
    info.classList.add("achievement-info");

    if (!found) {
        img.classList.add("achievement-notfound");
        info.innerText = advancementRepresentation(nameAchievement, advancement_ratio, goal);
    } else {
        img.classList.add("achievement-found");
        info.innerText = nameAchievement;
    }

    img.addEventListener("mouseenter", () => {
        info.style.visibility = "visible";
    });
    img.addEventListener("mouseleave", () => {
        info.style.visibility = "hidden";
    });

    imgContainer.appendChild(img);
    imgContainer.appendChild(info);
    return imgContainer;

    function advancementRepresentation(nameAchievement, advancement_ratio, goal) {
        return `${nameAchievement} : ${advancement_ratio * goal} / ${goal} (${advancement_ratio * 100}%)`;
    }
}

export {achievementRepresentation}
