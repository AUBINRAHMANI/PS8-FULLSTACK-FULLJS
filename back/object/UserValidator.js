 import {sha256} from "js-sha256";
 import {jsonValidator} from "../util/jsonValidator.js";


export default class UserValidator {
    static schema = {
        username: 'string', mail: 'string', password: 'string'
    }

    static convertSignUp(data) {
        return UserValidator.hashPassword(jsonValidator(data, UserValidator.schema));
    }

    static convertLogin(data) {
        return UserValidator.hashPassword(jsonValidator(data, UserValidator.schema));
    }

    static hashPassword(data) {
        data.password = sha256(data.password)
        return data;
    }

    static validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(String(email).toLowerCase());
    }

    static checkUserConstraints(user) {
        if (user.username.length > 16 || user.username.length === 0) {
            throw new Error(`The length of username field ${user.username.length} is invalid, should be between 1 and 16`)
        }

        if (!UserValidator.validateEmail(user.mail)) {
            throw new Error(`The email field ${user.mail} is invalid`)
        }

        if (user.password.length === 0) {
            throw new Error(`The password is empty`)
        }
    }
}


