import {MongoClient, ObjectId} from "mongodb";



class UserDb {
    constructor() {
        this.client = new MongoClient("mongodb://root:example@mongodb:27017");
    }

    async connect() {
        try {
            await this.client.connect();
            this.database = this.client.db("DatabaseName");
            this.users = this.database.collection("users" + "");
        } catch (error) {
            console.error(error);
        }
    }

    async verifyConnection() {
        if (typeof this.users !== 'undefined') return;
        await this.connect();
    }

    async addUser(data) {
        await this.verifyConnection();
        try {
            if (!await this.existsUser(data)) {
                console.log("User doesn't exist, adding user");
                return await this.users.insertOne(data);
            }
        } catch (error) {
            console.error(error);
        }

        throw new Error("User already exists")
    }

    // if the user has a username and an email, it will only use the username
    async getUser(data) {
        await this.verifyConnection();
        let user;

        // our front only send the property username, but it can be the username or the email
        if (data.hasOwnProperty("username")) {
            try {
                user = await this.users.findOne({username: data.username, password: data.password});
                if (user === null) {
                    user = await this.users.findOne({mail: data.username, password: data.password});
                }
            } catch (error) {
                console.error(error);
            }

            if (user === null) {
                throw new Error("User" + user + "not found while searching for :" + data);
            }
            return user;
        }

        // for to be conformed with the api
        if (data.hasOwnProperty("mail")) {
            try {
                user = await this.users.findOne({mail: data.mail, password: data.password});
            } catch (error) {
                console.error(error);

            }

            if (user === null) {
                throw new Error("User" + user + "not found while searching for :" + data);
            }
            return user;
        }
    }

    async existsUser(data) {
        await this.verifyConnection();
        try {
            const sameUserName = await this.users.findOne({username: data.username});
            const sameEmail = await this.users.findOne({mail: data.mail});
            return !(sameUserName === null && sameEmail === null);
        } catch (error) {
            console.error(error);
        }
    }

    async checkUserExists(userId) {
        await this.verifyConnection();
        // findOne returns null if no data was not found
        if (await this.users.findOne({_id: new ObjectId(userId)}) === null) {
            throw new Error("User " + userId + " doesn't exist");
        }
    }

    async getUsersByIds(arrayUserId) {
        await this.verifyConnection();
        arrayUserId = arrayUserId.map((userId) => new ObjectId(userId));
        let res = await this.users.find({_id: {$in: arrayUserId}}, {projection: {password: 0, mail: 0}}).toArray();
        res.forEach(e => {
            e["userId"] = e["_id"].toString();
            delete e["_id"];
        });
        return res;
    }

    async getUserById(userId) {
        await this.verifyConnection();
        let user = await this.users.findOne({_id: new ObjectId(userId)}, {projection: {password: 0, mail: 0}});
        user["userId"] = user["_id"].toString();
        delete user["_id"];
        return user;
    }

    async getUsersByNameRegex(name) {
        await this.verifyConnection();

        // contains the name in the username
        // flags i for case-insensitive
        let res = await this.users.find(
            {username: new RegExp(name, 'i')},
            {
                projection:
                    {password: 0, mail: 0}
            }
        ).toArray();

        res.forEach(e => {
            e["userId"] = e["_id"].toString();
            delete e["_id"];
        });

        return res;
    }

    async getUsername(userId) {
        await this.verifyConnection();
        return await this.users.findOne({_id: new ObjectId(userId)}, {projection: {username: 1}});
    }

    async getAllUsers() {
        await this.verifyConnection();
        return await this.users.find({}).toArray();
    }


}

export default new UserDb();