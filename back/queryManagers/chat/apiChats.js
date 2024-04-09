
import chatdb from "../../database/chatdb.js";
import {checkAuthorization, PARAMS, sendResponse, urlNotFound, USER_ID} from "../utilsApi.js";
import SchemaValidator from "../../util/SchemaValidator.js";

function messagesApiGet(request, response, urlPathArray) {
    if (!checkAuthorization(request, response)) {
        return;
    }

    let userIdEmitTheRequest = request[USER_ID];
    let paramsObject = request[PARAMS];

    const schemaGetQuery = {
        type: "object",
        properties: {
            friendId: {"type": "string"},
            numberMessagesToGet: {"type": "string"},
            numberMessagesToSkip: {"type": "string"}
        },
        required: ["friendId", "numberMessagesToGet", "numberMessagesToSkip"]
    }
    switch (urlPathArray[0]) {
        case "get":
            let schemaValidator = new SchemaValidator();
            let validationFunction = schemaValidator.compile(schemaGetQuery);
            let paramsObject = request[PARAMS];

            if (!validationFunction(paramsObject)) {
                sendResponse(response, 400, "Bad request : Query is not valid");
                return;
            }


            if (!(checkStringIsPositiveInteger(paramsObject.numberMessagesToSkip)
                && checkStringIsPositiveInteger(paramsObject.numberMessagesToGet))) {
                sendResponse(response, 400, "Bad request : the value in the query are not positive integer");
            }

            let numberMessagesToSkip = parseInt(paramsObject.numberMessagesToSkip);
            let numberMessagesToGet = parseInt(paramsObject.numberMessagesToGet);
            let friendId = paramsObject.friendId;

            getMessages(userIdEmitTheRequest, friendId, numberMessagesToGet, numberMessagesToSkip, response);
            break;
        default:
            urlNotFound(request, response)
            break;
    }
}

function getMessages(userIdEmitTheRequest, friendId, numberMessagesToGet, numberMessagesToSkip, response) {
    chatdb.getMessages(userIdEmitTheRequest, friendId, numberMessagesToGet, numberMessagesToSkip).then((result) => {
        sendResponse(response, 200, JSON.stringify(result));
    }).catch((err) => {
        sendResponse(response, 404, "Messages not found : " + err);
    });
}

function checkStringIsPositiveInteger(string) {
    let number = parseInt(string);
    return !isNaN(number) && number >= 0;
}


export {messagesApiGet};
