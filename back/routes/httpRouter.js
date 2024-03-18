const http = require('http');
const { registerUser, loginUser } = require('../controllers/AuthController');

const httpRouter = http.createServer(async (request, response) => {
    const { url, method } = request;

    // Route pour l'enregistrement
    if (url === '/register' && method === 'POST') {
        await registerUser(request, response);
        return;
    }

    // Route pour le login
    if (url === '/login' && method === 'POST') {
        await loginUser(request, response);
        return;
    }



    // Gestion des routes non trouvées
    response.writeHead(404, { 'Content-Type': 'application/json' });
    response.end(JSON.stringify({ message: 'Route not found' }));
});

module.exports = httpRouter;
