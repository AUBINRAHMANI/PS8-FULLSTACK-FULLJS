
document.addEventListener('DOMContentLoaded', () => {

    //pour basculer entre les formulaires
    let register_btn = document.querySelector(".Register-btn");
    let login_btn = document.querySelector(".Login-btn");
    let form = document.querySelector(".Form-box");

    register_btn.addEventListener("click", () => {
        form.classList.add("change-form");
    });

    login_btn.addEventListener("click", () => {
        form.classList.remove("change-form");
    });

    // Ajout du code pour gérer la soumission des formulaires
    const loginForm = document.querySelector(".Login-form");
    const registerForm = document.querySelector(".Register-form");

    loginForm.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(this, 'http://localhost:8000/api/login', 'login');
    });

    registerForm.addEventListener('submit', function (event) {
        event.preventDefault();
        submitForm(this, 'http://localhost:8000/api/inscription', 'inscription');
    });
});

function submitForm(form, url,type) {

    console.log(`Tentative de soumission du formulaire à ${url}`);
    const formData = new FormData(form);
    const data = {
        email: form.querySelector('input[name="email"]').value,
        password: form.querySelector('input[name="password"]').value,
    };
    formData.forEach((value, key) => { data[key] = value; });

    fetch(url, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
    })
        .then(response => {
            console.log(response);
            return response.json();
        })

        .then(data => {
            if (type === 'inscription') {
                let form = document.querySelector(".Form-box");

                console.log('Inscription réussie:', data);
                alert("Inscription réussie. Vous allez être redirigé vers la page de connexion.");
                form.classList.remove("change-form");

            } else if (type === 'login') {
                if (data.token) {
                    console.log('Connexion réussie:', data);
                    alert("Connexion réussie:");
                    window.location.href = '../acceuil/acceuil.html';
                } else {
                    alert("Échec de la connexion. Veuillez réessayer.");
                }
            }
        })
        .catch((error) => {
            console.error('Error:', error);
        });
}
