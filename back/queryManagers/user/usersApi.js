// //import UserValidator from "../../object/UserValidator.sockets";
// //import userdb from "../../database/userdb.js";
// //import jwt from "jsonwebtoken";
// const jwt = require("jsonwebtoken");
// const {BODY} = require("../utilsApi.js");
//
// //import {BODY, sendResponse} from "../utilsApi.js";
//
// const {JWTSecretCode} = require("../../credentials/credentials.sockets.js");
// //import {JWTSecretCode} from "../../credentials/credentials.sockets";
//
// const {bcrypt} = require("bcryptjs");
// //import bcrypt from "bcryptjs";
//
// const {addCors} = require("../api.js");
// //import {addCors} from "../api.js";
//
// const{MongoClient} = require("mongodb");
// //import {MongoClient} from "mongodb";
//
// const client = new MongoClient("mongodb://root:example@mongodb:27017");
// const dbName = "DatabaseName";
//
//
//
// async function connectToDb() {
//     await client.connect();
//     console.log("Connected to MongoDB");
// }
//
// function getUsersCollection() {
//     const database = client.db(dbName);
//     return database.collection("users");
// }
//
//
// function userSignUpOrLogin(request, response) {
//     addCors(response);
//
//     if (request.method === 'OPTIONS') {
//         // Répondre aux pré-vérifications OPTIONS en appelant la fonction addCors
//         addCors(response);
//         response.statusCode = 204;
//         response.end();
//
//     } else if (request.method === 'POST') {
//         // Collecter les données de la requête
//         let body = '';
//         request.on('data', chunk => {
//             body += chunk.toString();
//         });
//
//         request.on('end',async () => {
//             // Parsez le corps de la requête
//             const data = JSON.parse(body);
//             const users = getUsersCollection(); // Récupérer la collection des utilisateurs
//
//             if (request.url === '/api/inscription') {
//                 // Vérifier si l'email existe déjà
//                 const existingUser = await users.findOne({ email: data.email });
//                 if (existingUser) {
//                     response.writeHead(400, { 'Content-Type': 'application/json' });
//                     response.end(JSON.stringify({ error: 'Email déjà utilisé' }));
//                 }
//                 // const existingUserName = await users.findOne({ username: data.username });
//                 // if (existingUserName) {
//                 //     response.writeHead(400, { 'Content-Type': 'application/json' });
//                 //     response.end(JSON.stringify({ error: 'Username déjà utilisé' }));
//                 // }
//
//
//                     // checkEmailExists(data.email, exists => {
//                     //     if (exists) {
//                     //         response.writeHead(400, { 'Content-Type': 'application/json' });
//                     //         response.end(JSON.stringify({ error: 'Email déjà utilisé' }));
//                     //     } else {
//                     // Créer un nouveau token et l'enregistrer
//
//                 else {
//                     const hashedPassword = await bcrypt.hash(data.password, 10);
//                     const result = await users.insertOne({ email: data.email, password: hashedPassword });
//
//                     const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
//                     //saveToken(data.email, data.username, data.password, token);
//
//                     response.writeHead(200, { 'Content-Type': 'application/json' });
//                     response.end(JSON.stringify({ message: 'Inscription réussie', token }));
//                 }
//
//
//             } else if (request.url === '/api/login') {
//                 // Ici, ajoutez la logique pour vérifier les informations de connexion
//                 // Créez et envoyez un JWT en cas de succès
//                 // const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
//                 // response.writeHead(200, { 'Content-Type': 'application/json' });
//                 // response.end(JSON.stringify({ token }));
//
//                 const user = await users.findOne({ email: data.email });
//
//                 const passwordValid = user && await bcrypt.compare(data.password, user.password);
//                 if (passwordValid) {
//                     const token = jwt.sign({ email: data.email }, 'votre_cle_secrete');
//                     response.writeHead(200, { 'Content-Type': 'application/json' });
//                     response.end(JSON.stringify({ token }));
//
//                 } else {
//                     response.writeHead(403, { 'Content-Type': 'application/json' });
//                     response.end(JSON.stringify({ error: 'Email ou mot de passe incorrect' }));
//                 }
//             }
//
//         });
//
//     } else {
//         response.writeHead(404, { 'Content-Type': 'text/plain' });
//         response.end('Méthode non supportée');
//     }
// }
//
//
// connectToDb().catch(console.error);
//
// module.exports= {userSignUpOrLogin};
//
//
//









import userdb from "../../database/userdb.js";
import {authorizeRequest, PARAMS, sendResponse, USER_ID} from "../utilsApi.js";
//import gamedb from "../../database/gamedb.js";


function usersApiGet(request, response, urlPathArray) {
    if (!authorizeRequest(request, response)) {
        return;
    }

    let requesterUserId = request[USER_ID];
    let paramsObject = request[PARAMS]

    switch (urlPathArray[0]) {
        // case "getCurrentAIGame":
        //     getCurrentAIGame(response, requesterUserId);
        //     break;
        case "getName":
            getUser(requesterUserId, response, paramsObject);
            break;
        case "get":
            if (urlPathArray[1] === undefined) {
                sendResponse(response, 404, "Malformed request : userId is undefined");
                return;
            }
            getUserById(response, urlPathArray[1]);
            break;
        default:
            console.log("URL", urlPathArray, "not supported");
            sendResponse(response, 404, "URL " + request.url + " not supported");
    }
}

function getUser(userId, response, paramsObject) {
    if (paramsObject.name === undefined) {
        sendResponse(response, 404, "Malformed request : name is undefined");
        return;
    }

    userdb.getUsersByNameRegex(paramsObject.name).then((users) => {
        sendResponse(response, 200, JSON.stringify(users));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

function getUserById(response, userId) {
    userdb.getUserById(userId).then((user) => {
        sendResponse(response, 200, JSON.stringify(user));
    }).catch((err) => {
        sendResponse(response, 404, "Malformed request : " + err);
    });
}

// function getCurrentAIGame(response, userId) {
//     gamedb.getGamePlayerId(userId).then((game) => {
//         sendResponse(response, 200, JSON.stringify(game));
//     }).catch((err) => {
//         sendResponse(response, 404, "Malformed request : " + err);
//     });
// }

export {usersApiGet};
