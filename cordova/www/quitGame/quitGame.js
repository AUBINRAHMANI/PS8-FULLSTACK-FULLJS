document.getElementById('quitButton').addEventListener('click', function() {
    var confirmation = confirm("Êtes-vous sûr de vouloir quitter la partie ?");
    if (confirmation) {
        window.location.href = '../acceuil/acceuil.html';
    }
});