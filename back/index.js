// The http module contains methods to handle http queries.
//const http = require('http')
import * as http from 'http';

// // Let's import our logic.
// const fileQuery = require('./queryManagers/front.js')
// const apiQuery = require('./queryManagers/api.js')
// //const AuthRoutes = require('./routes/AuthRoutes.js');
// const UserModel = require('./models/userModel.js');
// const { Server } = require("socket.io");
//
// const jwt = require("jsonwebtoken");
// const { displayACaughtError } = require("./util/util.js");
// const { JWTSecretCode } = require("./credentials/credentials.js");
// const { jsonValidator } = require("./util/jsonValidator.js");
// const connectedPlayer = require("./socket/PermanentSocketPlayers.js");
// const ConnectedPlayers = require("./socket/ConnectedPlayers.js");
// const chatManager = require("./socket/chatManager.js");
// const achievementdb = require("./database/achievementdb.js");
// const userstatsdb = require("./database/userstatsdb.js");
//
//
// const { MongoClient } = require("mongodb");
//
// const uri = "mongodb://root:example@mongodb:27017";
// const client = new MongoClient(uri);
//
//
 const host = '0.0.0.0';
 const port = 8000;





import * as fileQuery from './queryManagers/front.js'
import * as apiQuery from './queryManagers/api.js'
import {Server} from "socket.io";
import jwt from "jsonwebtoken";
import {displayACaughtError} from "./util/util.js";
import {JWTSecretCode} from "./credentials/credentials.js";
import {jsonValidator} from "./util/jsonValidator.js";
import connectedPlayer from "./socket/PermanentSocketPlayers.js";
import ConnectedPlayers from "./socket/ConnectedPlayers.js";
import chatManager from "./socket/chatManager.js";





/*async function run() {
    try {
        const database = client.db('sample_mflix');
        const movies = database.collection('movies');
        // Query for a movie that has the title 'Back to the Future'
        const query = { title: 'Back to the Future' };
        const movie = await movies.findOne(query);
        console.log(movie);
    } finally {
        // Ensures that the client will close when you finish/error
        await client.close();
    }
}
run().catch(console.dir);*/




/* The http module contains a createServer function, which takes one argument, which is the function that
** will be called whenever a new request arrives to the server.
 */
let httpServer = http.createServer(function (request, response) {
    // First, let's check the URL to see if it's a REST request or a file request.
    // We will remove all cases of "../" in the url for security purposes.
    let filePath = request.url.split("/").filter(function(elem) {
        return elem !== "..";
    });

    try {
        // If the URL starts by /api, then it's a REST request (you can change that if you want).
        if (filePath[1] === "api") {
            apiQuery.manage(request, response);
            response.statusCode = 200;
            console.log(`api request`)
            // If it doesn't start by /api, then it's a request for a file.
        } else {
            fileQuery.manage(request, response);
            console.log(`error while processing ${request.url}: ${error}`)

        }
    } catch(error) {
        console.log(`error while processing ${request.url}: ${error}`)
        response.statusCode = 400;
        response.end(`Something in your request (${request.url}) is strange...`);
    }

}).listen(8000);


// // For the server to be listening to request, it needs a port, which is set thanks to the listen function.
// }).listen(port, host, () => {
//     console.log(`Server is running on http://${host}:${port}`);
// });





// SetUp of the webSocket server.

const io = new Server(httpServer, {
    cors: {
        origin: "*", methods: ["GET", "POST", "PUT", "PATCH"], allowedHeaders: "*", credentials: true
    }
});





const gameSocket = io.of("/api/game");
const chatSocket = io.of("/api/chat");
const permanentSocket = io.of("/api/permanent")

// let wipeDBOnServerStart = false;
// if (wipeDBOnServerStart) {
//     gamedb.removeAllGames().then(() => {
//         console.log("Server started, all the games                 have been removed from the database, look for /back/signup.js to change this behaviour");
//     });
//     achievementdb.removeAllAchievements().then(() => {
//         console.log("Server started, all the user achievements have been removed from the database, look for /back/signup.js to change this behaviour");
//     });
//     userstatsdb.removeAllStats().then(() => {
//         console.log("Server started, all the user stats        have been removed from the database, look for /back/signup.js to change this behaviour");
//     });
// }




function authenticate(socket, next) {
    let token = socket.handshake.auth.token;
    if (token) {
        jwt.verify(token, JWTSecretCode, (err, decoded) => {
            if (err) {
                console.log("error while verifying the token")
                console.log(err);
                return next(new Error("Authentication error"));
            }
            socket.username = decoded.username;
            socket.userId = decoded.userId;
        });
        next();
    } else {
        next(new Error("Authentication error"));
    }
}


gameSocket.use((socket, next) => {
    authenticate(socket, next);
});

chatSocket.use((socket, next) => {
    authenticate(socket, next);
});



// let verifyObjectSetup = (setupObject) => {
//     let schema = {AIplays: 'number'}
//     let newObject = jsonValidator(setupObject, schema);
//
//     if (newObject.AIplays !== 1 && newObject.AIplays !== 2) {
//         throw new Error("AIPlays must be 1 or 2 not " + newObject.AIplays);
//     }
//
//     return newObject;
// }

//let connectedPlayers = new ConnectedPlayers();
//let matchmakingController = new MatchmakingController(gameSocket, connectedPlayers);
//let challengeController = new ChallengeController(gameSocket, connectedPlayers);

// gameSocket.on('connection', (socket) => {
//     console.log("Socket id player : " + socket.id);
//     console.log("Player " + socket.username + " connected");
//
//     socket.once('setup', (setupObject) => {
//         socket.removeAllListeners();
//         try {
//             let setupObjectChecked = verifyObjectSetup(setupObject);
//             new AiRoom(socket, gameSocket, setupObjectChecked.AIplays);
//         } catch (error) {
//             gameSocket.to(socket.id).emit("error", error.message);
//         }
//     });
//
//     socket.once('challenge_request', (id_challenged) => {
//         console.log("challenge request received from " + socket.username + " to " + id_challenged)
//         challengeController.challengeRequest(socket, id_challenged);
//     });
//
//     socket.once('challenge_accepted', (id_challenge_sender) => {
//         console.log("challenge accepted received from " + socket.username + " to " + id_challenge_sender)
//         challengeController.challengeAccepted(socket, id_challenge_sender);
//     });
//
//     socket.once('matchmaking', () => {
//         matchmakingController.newConnection(socket);
//     });
// });

permanentSocket.use((socket, next) => {
    authenticate(socket, next);
});

permanentSocket.on('connection', (socket) => {
    connectedPlayer.addPlayer(socket);

    // TODO : need to change later to a better way to handle the disconnection with timeout
    socket.on("disconnect", () => {
        connectedPlayer.removePlayer(socket);
    });
});


let chatRooms = [];
chatSocket.on('connection', (socket) => {
    console.log("Socket id chat : " + socket.id);

    let roomId;

    socket.on('init', async (user1, user2) => {
        if (user1 < user2) {
            roomId = user1 + user2;
        } else {
            roomId = user2 + user1;
        }
        if (!(chatRooms.includes(roomId))) {
            chatRooms.push(roomId);
        }
        socket.join(roomId)

    })

    socket.on('sendMessage', (message, user1, user2) => {
        let chat = new chatManager(user1, user2);
        chat.addMessage(message).then(() => {
            console.log("message added to the database");
            chatSocket.to(socket.id).emit('messageAddedInDb');
            chatSocket.to(roomId).emit('updateLastMessage', user1, user2);
        }).catch(e => {
            console.log("error while adding the message to the database");
            console.log(e);
        });
    });

    socket.on('read', (user1, user2) => {
        let chat = new chatManager(user1, user2);
        chat.readMessages().then(() => {
            console.log("messages read");
        }).catch(e => {
            console.log("error while reading the messages");
            console.log(e);
        });
    });

    socket.on('getLastMessageForProfile', async (user1, user2) => {
        let chat = new chatManager(user1, user2);
        let lastMessage = chat.getLastMessage();
        chatSocket.to(socket.id).emit('getLastMessageFromBack', await lastMessage, user2);
    });

    socket.on('updateChat', async (user1, user2) => {
        let chat = new chatManager(user1, user2);
        let lastMessage = chat.getLastMessage();
        chatSocket.to(roomId).emit('updateChatFromBack', await lastMessage, user1, user2);
    });

    socket.on('disconnect', () => {
        console.log("Socket id chat : " + socket.id + " disconnected");
    });
});



