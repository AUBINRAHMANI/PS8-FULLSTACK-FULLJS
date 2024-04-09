document.addEventListener('DOMContentLoaded', function() {
    var soundToggle = document.querySelector(".switch input[type='checkbox']");
    //var audioFrame = document.getElementById('audioFrame').contentWindow;
    var audioFrame = document.getElementById('audioFrame');


    function updateSound(){
        audioFrame.contentWindow.postMessage({ soundOn: soundToggle.checked}, "*");
    }

    soundToggle.addEventListener("change", updateSound);
    updateSound();
    

    /*soundToggle.addEventListener('change', function() {
        var audioCommand = soundToggle.checked ? 'startAudio' : 'stopAudio';
        if (audioCommand === 'stopAudio') {
            audioFrame.postMessage('stopAudio', '*');
            console.log("Pause1");
        }
        else if ( audioCommand === 'startAudio') {
            audioFrame.postMessage('startAudio', '*');
        }

        console.log("Envoi du message à la page principale :", audioCommand);
        localStorage.setItem('audioEnabled', soundToggle.checked);
        window.parent.postMessage(audioCommand, '*');



    });*/
});
