"use strict";

import {JWTSecretCode} from "../credentials/credentials.js";
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

