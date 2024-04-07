
import gamedb from "../database/gamedb.js";

export class GameEngineDBUtil {
    static saveGameEngineDB(gameEngineToSave) {
        // save the object to the database

        if (gameEngineToSave.isGameOver) {
            console.log("The game is over, it will not be saved to the database");
            return;
        }

        let data = {
            gameId: gameEngineToSave.id,
            player1: gameEngineToSave.player1.id,
            player2: gameEngineToSave.player2.id,
            gameEngine: gameEngineToSave
        }

        gamedb.addGame(data).then(function (result) {
            console.log("The game was saved to the database ! with ", gameEngineToSave.turns.length, "turns played");
            return result;
        }).catch(function (error) {
            console.log("error while saving the game to the database");
            console.log(error);
        });
    }

    static removeGameEngineFromDB(id) {
        gamedb.removeGame(id).then(function (result) {
            console.log("The game was removed from the database");
            return result;
        }).catch(function (error) {
            console.log("error while removing the game from the database");
            console.log(error);
        });
    }
}


