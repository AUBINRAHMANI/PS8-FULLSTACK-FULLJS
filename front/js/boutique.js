const avatarProducts = document.getElementById('avatar-products');

window.addEventListener('resize', () => {
    adjustProductContainer();
});

function adjustProductContainer() {
    const containerWidth = avatarProducts.clientWidth;
    const productCount = avatarProducts.children.length;
    const productWidth = avatarProducts.children[0].offsetWidth;
    const totalProductWidth = productWidth * productCount;

    if (totalProductWidth > containerWidth) {
        avatarProducts.style.justifyContent = 'flex-start';
    } else {
        avatarProducts.style.justifyContent = 'center';
    }
}

window.onload = adjustProductContainer; // Appeler la fonction lors du chargement initial
