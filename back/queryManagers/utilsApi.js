import {validateJwt} from "../auth/jwtParserBack.js";

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






