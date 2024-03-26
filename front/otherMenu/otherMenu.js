document.getElementById("logoutMenu").addEventListener("click", () => {
        localStorage.clear();
    }
);

window.onbeforeunload = function () {
    screen.orientation.unlock();
}

function onDeviceReady() {
    screen.orientation.lock('landscape');
}

document.addEventListener("deviceready", onDeviceReady, false);
