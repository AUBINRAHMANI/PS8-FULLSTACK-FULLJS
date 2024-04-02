document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById("backgroundAudio");
    // Vérifier si la position de lecture est stockée localement
    var audioPosition = localStorage.getItem('audioPosition');

 /*   var valeurBooléenne = localStorage.getItem('maValeurBooléenne');

    if(valeurBooléenne){
        audio.play();
    }else{
        audio.pause()
    }*/

    if (audioPosition) {
        audio.currentTime = parseFloat(audioPosition);
    }
    // Commencer la lecture du son
    audio.play().catch(function(error) {
        console.error('Erreur de lecture audio:', error);
    });

    // Enregistrer la position de lecture lors de la fermeture de la page
    window.addEventListener('beforeunload', function() {


        
//        localStorage.setItem('audioPosition', audio.currentTime);




    });

    // Écouter les messages des autres pages pour arrêter ou démarrer l'audio
    window.addEventListener('message', function(event) {
        if (event.origin !== window.location.origin) return; // Vérifier l'origine du message
        if (event.data === 'stopAudio') {
            console.log("pause");
            audio.pause();
        } else if (event.data === 'startAudio') {
            console.log("play");
            audio.play();
        }
    });

});
