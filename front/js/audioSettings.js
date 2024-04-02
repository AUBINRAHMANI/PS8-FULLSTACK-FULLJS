document.addEventListener('DOMContentLoaded', function() {
    var soundToggle = document.querySelector(".switch input[type='checkbox']");
    soundToggle.addEventListener('change', function() {
        var audioCommand = soundToggle.checked ? 'startAudio' : 'stopAudio';
        if (audioCommand === 'stopAudio') {
            var audioFrame = document.getElementById('audioFrame').contentWindow;
            audioFrame.postMessage('stopAudio', '*');
        }
        else if ( audioCommand === 'startAudio') {
            var audioFrame = document.getElementById('audioFrame').contentWindow;
            audioFrame.postMessage('startAudio', '*');
        }
        window.parent.postMessage(audioCommand, '*');
    });
});
