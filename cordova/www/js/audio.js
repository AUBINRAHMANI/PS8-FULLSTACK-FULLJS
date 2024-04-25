document.addEventListener('DOMContentLoaded', function() {
    var audio = document.getElementById("backgroundAudio");
  
  
    function pauseSound(){
        audio.pause();
    }

    function playSound(){
        audio.play();
    }


    // Vérifier si le son est activé ou désactivé dans le stockage local
    var audioEnabled = localStorage.getItem('audioEnabled');
    if (audioEnabled === 'false') {
        audio.pause(); // Arrêter l'audio si désactivé dans les paramètres
    }

    /*
    // Vérifier si la position de lecture est stockée localement
    var audioPosition = localStorage.getItem('audioPosition');

    if (audioPosition) {
        audio.currentTime = parseFloat(audioPosition);
    }
    // Commencer la lecture du son
    audio.play().catch(function(error) {
        console.error('Erreur de lecture audio:', error);
    });

    // Enregistrer la position de lecture lors de la fermeture de la page
    window.addEventListener('beforeunload', function() {

    });*/

    
    // Écouter les messages des autres pages pour arrêter ou démarrer l'audio
    window.addEventListener('message', function(event) {
      /*  if (event.origin !== window.location.origin) return; // Vérifier l'origine du message
        if (event.data === 'stopAudio') {
            console.log("pause");
            audio.pause();
        } else if (event.data === 'startAudio') {
            console.log("play");
            audio.play().catch(function(error) {
                console.error('Erreur de lecture audio:', error);
            });
        }*/


        if(event.data.soundOn){
            audio.play();
        }else{
            audio.pause();
        }



    });

});


