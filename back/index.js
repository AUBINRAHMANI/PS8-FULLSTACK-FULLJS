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
    import GameDb from './database/gamedb.js';
    import Onlinedb from "./database/onlinedb.js";




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
                console.log(`api request`)
                // If it doesn't start by /api, then it's a request for a file.
            } else {
                fileQuery.manage(request, response);

            }
        } catch(error) {
            console.error(`Error while processing ${request.url}`);
            console.error(error.stack); // This will log the stack trace
            console.log(`error while processing ${request.url}: ${error}`);
            if (!response.headersSent) {
                response.statusCode = 500;
                response.end(`Internal Server Error`);
            }

            //console.log(`error while processing ${request.url}: ${error}`)
            //response.statusCode = 400;
            //response.end(`Something in your request (${request.url}) is strange...`);
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





    const gameSocket = io.of("/api/games");
    const onlineSocket = io.of("/api/gameOnline");
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

    onlineSocket.use((socket,next)=>{
        authenticate(socket,next);
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


    gameSocket.on('connection', (socket) => {
        console.log('Un client est connecté au namespace /api/games');
        socket.on('saveGameState', async (gameState) => {
            console.log("Je communique bien pour sauvegarder");
            try{
                const gameId = await GameDb.saveGameState(gameState);
                socket.emit('gameStateSaved', { gameId }); // Informer le client que l'état du jeu a été sauvegardé avec succès
                gameSocket.emit('updateGameState', gameState); // Mettre à jour tous les clients avec le nouvel état du jeu
            } catch (error) {
                console.error('Erreur lors de la sauvegarde de l\'état du jeu:', error);
                socket.emit('error', 'Erreur lors de la sauvegarde de l\'état du jeu');
            }
        });

        socket.on('requestGameState', async (gameId) => {
            try {
                const gameState = await GameDb.getGameState(gameId);
                if (gameState) {
                        socket.emit('gameState', gameState);
                } else {
                    socket.emit('error', 'Jeu introuvable');
                }
            } catch (error) {
                console.error('Erreur lors de la récupération de l\'état du jeu:', error);
                socket.emit('error', 'Erreur lors de la récupération de l\'état du jeu');
            }
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

    let waitingPlayer = null; // ID du socket du joueur en attente

    //1V1 ONLINE
    const socketRoomMap = {};
    onlineSocket.on('connection', (socket) => {
        console.log('Un joueur s\'est connecté au jeu en ligne.');

        // Matchmaking: Jumeler les joueurs
        socket.on('joinGame', async () => {
            const {roomId, state,playerRole} = await Onlinedb.createOrJoinRoom(socket.id);

            socketRoomMap[socket.id] = roomId;

            if (state === 'waiting') {
                // Jumeler le joueur actuel avec le joueur en attente
                socket.join(roomId);
                socket.emit('waitingForOpponent', 'En attente d\'un adversaire...');
            } else if (state === 'active') {
                socket.join(roomId);
                socket.emit('gameStart', { roomId: roomId, role: 'player1', message: 'La partie commence !' });
                socket.to(roomId).emit('opponentJoined', {
                    message: 'Votre adversaire a rejoint. Préparez-vous !',
                    role: 'player2', // Assurez-vous que cette valeur est correctement définie
                    roomId: roomId
                });
            }
        });

        socket.on('selectInitialPosition', async ({ cellIndex, playerRole, roomId }) => {
            const room = await Onlinedb.getRoomState(roomId);
            if (!room) {
                console.error(`Aucune salle trouvée avec l'ID: ${roomId}`);
                return;
            }

            // Convertir cellIndex en coordonnées x et y
            const x = Math.floor(cellIndex / 17); // Si cellIndex est basé sur une grille 9x9
            const y = cellIndex % 17;
1
            console.log("x: " +x + "y : "+ y);

            // Vérifier si la sélection de position est valide
            let isValidPosition = false;
            let errorMessage = "";

            if (playerRole === 'player1' && x === 0) {
                isValidPosition = true;
            } else if (playerRole === 'player2' && x ===16) { // Assurez-vous que cette condition corresponde à votre dernière ligne
                isValidPosition = true;
            } else {
                errorMessage = playerRole === 'player1' ?
                    "Veuillez cliquer sur une case de la première ligne." :
                    "Veuillez cliquer sur une case de la dernière ligne.";
            }

            if (isValidPosition) {
                // Mettre à jour l'état du jeu avec la position initiale du joueur
                const gameState = await Onlinedb.getGameState(roomId);
                await Onlinedb.updateGameState(roomId, {
                    ...gameState,
                    playerPositions: {
                        ...gameState.playerPositions,
                        [playerRole]: { x, y }
                    }
                });
                console.log(gameState.playerPositions);
                onlineSocket.in(roomId).emit('updateGameState', gameState);
                console.log("Initial gameState suceed : "+ gameState);
                // Passer au tour suivant en utilisant switchTurn
                await switchTurn(roomId);
            } else {
                // Envoyer un message d'erreur au joueur
                socket.emit('invalidInitialPosition', errorMessage);
            }
        });


        socket.on('playerAction', async ({roomId, action}) => {
            // Valider et traiter l'action ici...
            const gameState = await Onlinedb.getGameState(roomId);

            let isValidMove = true; // a changer
            // L'objet updatedGameState devrait être préparé ici après la validation
            let updatedGameState = {...gameState};

            if (action.type === 'move') {
               // isValidMove = validatePlayerMove(gameState, action);
                isValidMove = true;
                if (isValidMove) {
                    // Appliquer le déplacement dans updatedGameState si nécessaire
                }
            } else if (action.type === 'placeWall') {
                isValidMove = true;
                //isValidMove = validateWallPlacement(gameState, action);
                if (isValidMove) {
                    // Appliquer le placement du mur dans updatedGameState si nécessaire
                }
            }

            if (isValidMove) {
                console.log("Mouvement valide !");
                // Mettre à jour l'état du jeu dans la base de données
                await Onlinedb.updateGameState(roomId, updatedGameState);

                // Informer tous les clients de la mise à jour
                onlineSocket.in(roomId).emit('updateGameState', updatedGameState);

                // Déterminer et changer le tour du joueur
                await switchTurn(roomId);
            } else {
                // Si le mouvement n'est pas valide, envoyer un message d'erreur au joueur
                socket.emit('invalidMove', 'Mouvement non valide.');
            }
        });

        socket.on('disconnect', async () => {
            const roomId = socketRoomMap[socket.id];
            // Vérifier l'état de la room et prendre des mesures en conséquence
            if (roomId) {
                // Obtenez l'état de la room ici et décidez des actions appropriées
                const room = await Onlinedb.getRoomState(roomId);
                // Supposons que cette fonction renvoie { state: 'waiting' } ou { state: 'active' }

                if (room.state === 'waiting') {
                    await Onlinedb.deleteRoom(roomId);
                    // Assurez-vous de nettoyer après la suppression
                    delete socketRoomMap[socket.id];
                } else if (room.state === 'active') {
                    socket.to(roomId).emit('opponentLeft', 'Votre adversaire a quitté la partie.');
                    await Onlinedb.endGame(roomId, socket.id);
                    // Informez l'autre joueur, nettoyez la room, etc.
                }
            }
        });

        socket.on('playerMove', (data) => {
            const roomId = socketRoomMap[socket.id];
            // Valider le déplacement et mettre à jour l'état du jeu
            const validMove = validatePlayerMove(data); // Cette fonction doit être définie
            if (validMove) {
                // Mettre à jour l'état du jeu
                const updatedGameState = updateGameState(data);
                switchTurn(roomId);
                // Envoyer la mise à jour à tous les joueurs dans la room
                onlineSocket.in(roomId).emit('updateGameState', updatedGameState);
            } else {
                // Envoyer un message d'erreur au joueur qui a effectué le mouvement
                socket.emit('invalidMove', 'Déplacement invalide.');
            }

        });


        socket.on('playerPlaceWall', (data) => {
            const roomId = socketRoomMap[socket.id];
            // Valider le placement du mur et mettre à jour l'état du jeu
            const validWallPlacement = validateWallPlacement(data); // Cette fonction doit être définie
            if (validWallPlacement) {
                // Mettre à jour l'état du jeu
                const updatedGameState = updateGameState(data);
                // Envoyer la mise à jour à tous les joueurs dans la room
                onlineSocket.in(roomId).emit('updateGameState', updatedGameState);
            } else {
                // Envoyer un message d'erreur au joueur qui a tenté de placer le mur
                socket.emit('invalidWallPlacement', 'Placement de mur invalide.');
            }
        });

    });

    function getPlayerRoleByIndex(players, currentPlayerIndex) {
        // Si l'index du joueur actuel est 0, alors c'est le rôle 'player1', sinon 'player2'.
        // Ceci est basé sur la supposition que l'ordre des joueurs dans le tableau est [player1, player2].
        return currentPlayerIndex === 0 ? 'player1' : 'player2';
    }

    async function switchTurn(roomId) {
        try {
            const room = await Onlinedb.getRoomState(roomId);
            if (!room) {
                throw new Error(`Aucune salle trouvée avec l'ID: ${roomId}`);
            }

            // Calculer l'index du prochain joueur
            const nextPlayerIndex = (room.currentPlayerIndex + 1) % room.players.length;

            // Mettre à jour l'index du joueur actuel dans l'état de la salle
            await Onlinedb.updateRoomState(roomId, { currentPlayerIndex: nextPlayerIndex });

            // Récupérer l'état mis à jour de la salle
            const updatedRoom = await Onlinedb.getRoomState(roomId);

            // Déterminer le rôle du joueur actuel basé sur l'index mis à jour
            const currentPlayerRole = getPlayerRoleByIndex(updatedRoom.players, updatedRoom.currentPlayerIndex);

            // Récupérer l'état complet du jeu, y compris les positions des joueurs, les murs, etc.
            const gameState = await Onlinedb.getGameState(roomId);

            // S'assurer que l'état du jeu inclut le joueur actuel correct
            gameState.currentPlayer = currentPlayerRole;

            // Envoyer l'état du jeu mis à jour à tous les clients dans la salle
            onlineSocket.in(roomId).emit('updateGameState', gameState);

            console.log(`Tour changé à ${currentPlayerRole} dans la salle ${roomId}`);
        } catch (error) {
            console.error(`Erreur dans switchTurn pour la salle ${roomId}:`, error);
        }

    }




