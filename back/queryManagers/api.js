// Main method, exported at the end of the file. It's the one that will be called when a REST request is received.
"use strict";

const http = require('http');
const jwt = require('jsonwebtoken'); // Utilisez jsonwebtoken pour créer des JWT
const fs = require('fs');

const { MongoClient } = require("mongodb");
const bcrypt = require("bcryptjs");

const {sendResponse, urlNotFound,BODY, PARAMS} = require("./utilsApi");
const {SIGNUP_API,LOGIN_API,CHATS_API,USERS_API,FRIENDS_API, NOTIFICATIONS_API} = require("../../front/util/path");

const {userSignUpOrLogin, usersApiGet} = require("./user/userApi");
const {messagesApiGet} = require("./chat/apiChats");
const {friendsApiDelete, friendsApiGet, friendsApiPost}=require("./friends/apiFriends.js");
const {notificationsApiDelete,notificationsApiGet} = require("./notification/apiNotifications");
const {userLogin, userSignUp, userLogIn} = require("./user/accountApi");


const uri = "mongodb://root:example@mongodb:27017";
const client = new MongoClient(uri);
const dbName = "DatabaseName";





function manageRequest(request, response) {
    addCors(response)

    let url = request.url.split("?")
    let urlPathArray = url[0].split("/")

    removeUselessInformationsUrlPathArray(urlPathArray)

    retrieveParamsQuery(request)

    switch (request.method) {
        case "OPTIONS":
            sendResponse(response, 200, "OK");
            break;
        case "POST":
            let body = "";
            request.on('data', function (data) {
                body += data;
            });

            request.on('end', function () {
                putBodyInRequest(request, body)

                switch (urlPathArray[0] + "/") {
                    case SIGNUP_API:
                        //userSignUpOrLogin(request, response);
                        userSignUp(request, response);
                        break;
                    case LOGIN_API:
                        userLogIn(request, response);
                        //userSignUpOrLogin(request, response);
                        break;
                    case FRIENDS_API:
                        urlPathArray.shift();
                        friendsApiPost(request, response, urlPathArray);
                        break;
                    default:
                        urlNotFound(request, response)
                }
            });
            break;
        case "GET":
            switch (urlPathArray[0] + "/") {
                case USERS_API:
                    urlPathArray.shift()
                    usersApiGet(request, response,urlPathArray);
                    break;
                case FRIENDS_API:
                    urlPathArray.shift()
                    friendsApiGet(request, response, urlPathArray);
                    break;
                case CHATS_API:
                    urlPathArray.shift()
                    messagesApiGet(request, response, urlPathArray);
                    break;


                default:
                    urlNotFound(request, response)
            }
            break;
        case "DELETE":
            switch (urlPathArray[0] + "/") {
                case FRIENDS_API:
                    urlPathArray.shift()
                    friendsApiDelete(request, response, urlPathArray);
                    break;
                default:
                    urlNotFound(request, response)
            }
            break;
        default:
            urlNotFound(request, response);
    }
}




function removeUselessInformationsUrlPathArray(urlPathArray) {
    if (urlPathArray[0] === "") {
        urlPathArray.shift();
    }

    if (urlPathArray[0] === "api") {
        urlPathArray.shift();
    }

    if (urlPathArray[urlPathArray.length - 1] === "") {
        urlPathArray.pop();
    }
}


function putBodyInRequest(request, body) {
    try {
        request[BODY] = JSON.parse(body);
    } catch (err) {
        request[BODY] = {};
    }
}

function retrieveParamsQuery(request) {
    let url = request.url.split("?")

    let paramsObject = {}
    if (url.length === 2) {
        let urlParams = url[1].split("&");
        urlParams.forEach(param => {
            const [key, value] = param.split("=")
            if (value !== undefined) {
                paramsObject[key] = value
            }
        })
    }

    request[PARAMS] = paramsObject;
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


//export {addCors};
module.exports = { addCors };




exports.manage = manageRequest;









/*

async function connectToDb() {
    await client.connect();
    console.log("Connected to MongoDB");
}

function getUsersCollection() {
    const database = client.db(dbName);
    return database.collection("users");
}



async function manageRequest(request, response) {
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

        request.on('end',async () => {
            // Parsez le corps de la requête
            const data = JSON.parse(body);
            const users = getUsersCollection(); // Récupérer la collection des utilisateurs

            if (request.url === '/api/inscription') {
                // Vérifier si l'email existe déjà
                const existingUser = await users.findOne({ email: data.email });
                if (existingUser) {
                    response.writeHead(400, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ error: 'Email déjà utilisé' }));
                }


                // checkEmailExists(data.email, exists => {
                //     if (exists) {
                //         response.writeHead(400, { 'Content-Type': 'application/json' });
                //         response.end(JSON.stringify({ error: 'Email déjà utilisé' }));
                //     } else {
                        // Créer un nouveau token et l'enregistrer

                else {
                    const hashedPassword = await bcrypt.hash(data.password, 10);
                    const result = await users.insertOne({ email: data.email, password: hashedPassword });

                    const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
                    //saveToken(data.email, data.username, data.password, token);

                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ message: 'Inscription réussie', token }));
                }


            } else if (request.url === '/api/login') {
                // Ici, ajoutez la logique pour vérifier les informations de connexion
                // Créez et envoyez un JWT en cas de succès
                // const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
                // response.writeHead(200, { 'Content-Type': 'application/json' });
                // response.end(JSON.stringify({ token }));

                const user = await users.findOne({ email: data.email });

                const passwordValid = user && await bcrypt.compare(data.password, user.password);
                if (passwordValid) {
                    const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
                    response.writeHead(200, { 'Content-Type': 'application/json' });
                    response.end(JSON.stringify({ token }));

                } else {
                response.writeHead(403, { 'Content-Type': 'application/json' });
                response.end(JSON.stringify({ error: 'Email ou mot de passe incorrect' }));
            }
        }

    });

    } else {
        response.writeHead(404, { 'Content-Type': 'text/plain' });
        response.end('Méthode non supportée');
    }
}

connectToDb().catch(console.error);
*/







