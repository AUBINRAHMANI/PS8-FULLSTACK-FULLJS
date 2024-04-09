document.addEventListener("DOMContentLoaded", function () {

    const avatarsBtn = document.getElementById('avatars');
    const tablesBtn = document.getElementById('tables');
    const weaponsBtn = document.getElementById('walls');
    const dansesBtn = document.getElementById('stickers');

    const avatarProducts = document.getElementById('avatar-products');
    const tableProducts = document.getElementById('table-products');
    const weaponProducts = document.getElementById('walls-products');
    const dansesProducts = document.getElementById('stickers-products');

    avatarProducts.style.display = 'flex';
    tableProducts.style.display = 'none';
    weaponProducts.style.display = 'none';
    dansesProducts.style.display = 'none';

    avatarsBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'flex';
        tableProducts.style.display = 'none';
        weaponProducts.style.display = 'none';
        dansesProducts.style.display = 'none';
    });

    tablesBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'none';
        tableProducts.style.display = 'flex';
        weaponProducts.style.display = 'none';
        dansesProducts.style.display = 'none';
    });

    weaponsBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'none';
        tableProducts.style.display = 'none';
        weaponProducts.style.display = 'flex';
        dansesProducts.style.display = 'none';
    });

    dansesBtn.addEventListener('click', () => {
        dansesProducts.style.display = 'flex';
        avatarProducts.style.display = 'none';
        tableProducts.style.display = 'none';
        weaponProducts.style.display = 'none';
    });
    
});

function importerImage(){
     // Récupérer l'URL de l'image
     var imageUrl = "../files/GameAvat1.png";
     // Stocker l'URL dans le stockage local pour la récupérer dans gameMotor.html
     localStorage.setItem("imageUrl", imageUrl);
     // Rediriger vers la page B.html
     window.location.href = "../html/game.html?imported=true";
     
};

