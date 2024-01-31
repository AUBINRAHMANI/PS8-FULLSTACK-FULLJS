// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
const http = require('http');
const jwt = require('jsonwebtoken'); // Utilisez jsonwebtoken pour créer des JWT
const fs = require('fs');



function manageRequest(request, response) {
    addCors(response);

    if (request.method === 'OPTIONS') {
        // Répondre aux pré-vérifications OPTIONS en appelant la fonction addCors
        addCors(response);
        response.statusCode = 204;
        response.end();

    } else if (request.method === 'POST') {
        // Collecter les données de la requête
        let body = '';
        request.on('data', chunk => {
            body += chunk.toString();
        });

        request.on('end', () => {
            // Parsez le corps de la requête
            const data = JSON.parse(body);

            if (request.url === '/api/inscription') {
                // Vérifier si l'email existe déjà
                checkEmailExists(data.email, exists => {
                    if (exists) {
                        response.writeHead(400, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ error: 'Email déjà utilisé' }));
                    } else {
                        // Créer un nouveau token et l'enregistrer
                        const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
                        saveToken(data.email, data.username, data.password, token);

                        response.writeHead(200, { 'Content-Type': 'application/json' });
                        response.end(JSON.stringify({ message: 'Inscription réussie', token }));
                    }
                });

            } else if (request.url === '/api/login') {
                // Ici, ajoutez la logique pour vérifier les informations de connexion
                // Créez et envoyez un JWT en cas de succès
                const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
                response.writeHead(200, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ token }));
            } else {
                response.writeHead(403, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Email ou mot de passe incorrect' }));
            }
        });
    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Méthode non supportée');
    }
}



function saveToken(email,username, password, token) {
    const filePath = './back/queryManagers/tokens.json';
    fs.readFile(filePath, (err, data) => {
        let tokens = {};
        let users = {};

        if (err && err.code !== 'ENOENT') {
            console.error("Erreur lors de la lecture du fichier tokens.json", err);
            return;
        }

        if (data && data.length > 0) {
            try {
                users = JSON.parse(data.toString());
            } catch (parseErr) {
                console.error("Erreur lors de l'analyse des tokens", parseErr);
                return;
            }
        }

        users[username] = {
            email: email,
            username: username,
            password: password, // Attention: il faut hacher le mot de passe avec bcrypt par exemple
            token: token
        };

        fs.writeFile(filePath, JSON.stringify(users, null, 2), (writeErr) => {
            if (writeErr) {
                console.error("Erreur lors de l'écriture dans tokens.json", writeErr);
            }
        });
    });
}

function checkEmailExists(email, callback) {
    fs.readFile('./back/queryManagers/tokens.json', (err, data) => {
        if (err) {
            console.error("Erreur lors de la lecture du fichier tokens.json", err);
            callback(false);
            return;
        }
        let tokens;
        try {
            tokens = JSON.parse(data.toString());
        } catch (parseErr) {
            console.error("Erreur lors de l'analyse des tokens", parseErr);
            callback(false);
            return;
        }
        callback(tokens.hasOwnProperty(email));
    });
}



function authenticateUser(email, password, callback) {
    fs.readFile('./back/queryManagers/tokens.json', (err, data) => {
        if (err) {
            console.error("Erreur lors de la lecture du fichier tokens.json", err);
            callback(false);
            return;
        }

        let users;
        try {
            users = JSON.parse(data.toString());
        } catch (parseErr) {
            console.error("Erreur lors de l'analyse des utilisateurs", parseErr);
            callback(false);
            return;
        }

        // Comparez les mots de passe en clair
        if (users[email] && users[email].password === password) {
            callback(true, users[email].username); // Connexion réussie
        } else {
            callback(false); // Échec de la connexion
        }
    });
}



/* This method is a helper in case you stumble upon CORS problems. It shouldn't be used as-is:
** Access-Control-Allow-Methods should only contain the authorized method for the url that has been targeted
** (for instance, some of your api urls may accept GET and POST request whereas some others will only accept PUT).
** Access-Control-Allow-Headers is an example of how to authorize some headers, the ones given in this example
** are probably not the ones you will need. */
function addCors(response) {
    // Website you wish to allow to connect to your server.
    response.setHeader('Access-Control-Allow-Origin', '*');
    // Request methods you wish to allow.
    response.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    // Request headers you wish to allow.
    response.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    // Set to true if you need the website to include cookies in the requests sent to the API.
    response.setHeader('Access-Control-Allow-Credentials', true);
}



exports.manage = manageRequest;