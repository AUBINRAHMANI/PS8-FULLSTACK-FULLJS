const socket = io('/api/gameOnline',{auth: {token: localStorage.getItem("token")}});

socket.emit('joinGame');

socket.on('waitingForOpponent', (message) => {
    // Afficher un message d'attente pour l'utilisateur
    console.log(message);
});

socket.on('gameStart', (data) => {

    console.log(data.message);

});