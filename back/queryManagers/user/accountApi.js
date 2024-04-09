
import UserValidator from "../../object/UserValidator.js";
import userdb from "../../database/userdb.js";
import jwt from "jsonwebtoken";
import {BODY, sendResponse} from "../utilsApi.js";
import {JWTSecretCode} from "../../credentials/credentials.js";

function userSignUp(request, response) {
    let user;
    try {
        user = UserValidator.convertSignUp(request[BODY]);
        UserValidator.checkUserConstraints(user);
    } catch (err) {
        console.log("User not valid: ", err);
        sendResponse(response, 400, "The object user is malformed " + JSON.stringify(err));
    }

    userdb.addUser(user).then((userCreated) => {
        // Everything went well, we can send a response.
        sendResponse(response, 201, "OK");
    }).catch((err) => {
        console.log("User not added: ", err);
        sendResponse(response, 409, "User not created: " + JSON.stringify(err));
    });
}

function userLogIn(request, response) {
    // need to search the user in the database and check error
    let user;
    try {
        user = UserValidator.convertLogin(request[BODY]);
    } catch (err) {
        console.log("User not found ", err);
        sendResponse(response, 404, "User not found: " + JSON.stringify(err));
    }

    userdb.getUser(user).then((userFound) => {
        // Returns a Json Web Token containing the name. We know this token is an acceptable proof of
        // identity since only the server know the secretCode.
        let payload = {
            userId: userFound._id.toString(),
            username: userFound.username
        };

        let token = jwt.sign(payload, JWTSecretCode, {expiresIn: "1d"})
        sendResponse(response, 200, token);
    }).catch((err) => {
        console.log("User not found: ", err);
        sendResponse(response, 404, "User not found: " + JSON.stringify(err));
    });
}

export {userSignUp, userLogIn};
