function parseJwt(token) {
    if (token === null || token.indexOf(".") === -1)
        return null;
    let base64Url = token.split('.')[1];
    let base64 = base64Url.replace('-', '+').replace('_', '/');
    return JSON.parse(window.atob(base64));
}

function isTokenValid(token) {
    let parsedJwt = parseJwt(token);
    if (parsedJwt === null)
        return false;
    let expirationTime = parsedJwt.exp;
    let currentTime = Date.now() / 1000;
    return currentTime < expirationTime;
}

export {parseJwt, isTokenValid};
