// boutique.js

document.addEventListener("DOMContentLoaded", function () {
    const avatarsBtn = document.getElementById('avatars');
    console.log("Hello");
    const tablesBtn = document.getElementById('tables');
    const weaponsBtn = document.getElementById('weapons');

    const avatarProducts = document.getElementById('avatar-products');
    const tableProducts = document.getElementById('table-products');
    const weaponProducts = document.getElementById('weapon-products');

    avatarsBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'flex';
        avatarProducts.style.whiteSpace = nowrap;
        tableProducts.style.display = 'none';
        weaponProducts.style.display = 'none';
    });
    

    tablesBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'none';
        tableProducts.style.display = 'block';
        weaponProducts.style.display = 'none';
    });

    weaponsBtn.addEventListener('click', () => {
        avatarProducts.style.display = 'none';
        tableProducts.style.display = 'none';
        weaponProducts.style.display = 'block';
    });
});

