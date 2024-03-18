import {validateJwt} from "../auth/jwtParserBack.sockets";

const PARAMS = "params";
const BODY = "body";
const USER_ID = "userId";

const USERNAME = "username";

function sendResponse(response, statusCode, message) {
    response.statusCode = statusCode;
    response.end(message);
}

function urlNotFound(request, response) {
    console.log("URL", request.url, "not supported");
    sendResponse(response, 404, "URL " + request.url + " not supported");
}

function checkAuthorization(request) {
    if (request.headers.authorization === undefined || request.headers.authorization.split(" ")[0] !== "Bearer") {
        return false;
    }

    let userToken = request.headers.authorization.split(" ")[1];

    try {
        let decoded = validateJwt(userToken);
        request[USER_ID] = decoded.userId;
        request[USERNAME] = decoded.username;
    } catch (err) {
        return false;
    }
    return true;
}

function authorizeRequest(request, response) {
    if (!checkAuthorization(request)) {
        sendResponse(response, 401, "Unauthorized");
        return false;
    }
    return true;
}

export {sendResponse, checkAuthorization, authorizeRequest, urlNotFound, PARAMS, BODY, USER_ID, USERNAME};











import {JWTSecretCode} from "../credentials/credentials.sockets"; //clé secrète
import crypto from "crypto"

function validateJwt(token) {
    const [headerEncoded, payloadEncoded, signatureEncoded] = token.split('.');

    const header = JSON.parse(Buffer.from(headerEncoded, 'base64url').toString());
    const payload = JSON.parse(Buffer.from(payloadEncoded, 'base64url').toString());

    if (header.alg !== 'HS256') {
        throw new Error('Invalid algorithm');
    }

    // Verify the payload
    if (payload.exp && Date.now() >= payload.exp * 1000) {
        throw new Error('Token has expired');
    }

    const hash = crypto.createHmac('sha256', JWTSecretCode)
        .update(`${headerEncoded}.${payloadEncoded}`)
        .digest('base64url');

    if (hash !== signatureEncoded) {
        throw new Error('Invalid token');
    }

    return payload;

}

function isTokenValid(token) {
    let parsedJwt = validateJwt(token);
    if (parsedJwt === null) {
        return false;
    }
    let expirationTime = parsedJwt.exp;
    let currentTime = Date.now() / 1000;
    return currentTime < expirationTime;
}

export {validateJwt, isTokenValid};