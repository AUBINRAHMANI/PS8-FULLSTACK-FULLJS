import { MongoClient } from 'mongodb';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

const SECRET_KEY = 'votre_cle_secrete';




exports.registerUser = async (users, reqBody) => {
    const { email, password } = reqBody;
    const existingUser = await users.findUserByEmail(email);

    if (existingUser) {
        throw new Error('Email déjà utilisé');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    await users.createUser(email, hashedPassword);

    const token = jwt.sign({ email }, SECRET_KEY);
    return { message: 'Inscription réussie', token };
};

exports.loginUser = async (users, reqBody) => {
    const { email, password } = reqBody;
    const user = await users.findUserByEmail(email);

    if (!user) {
        throw new Error('Utilisateur non trouvé');
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
        throw new Error('Mot de passe incorrect');
    }

    const token = jwt.sign({ email }, SECRET_KEY);
    return { token };
};


/*
// Helper pour lire le corps de la requête
const getRequestBody = async (req) => {
    return new Promise((resolve, reject) => {
        try {
            let body = '';
            req.on('data', (chunk) => {
                body += chunk.toString();
            });
            req.on('end', () => {
                resolve(JSON.parse(body));
            });
        } catch (error) {
            reject(error);
        }
    });
};

// Register new user
export const registerUser = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { username, password } = body;

        const salt = await bcrypt.genSalt(10);
        const hashedPass = await bcrypt.hash(password, salt);

        // Connexion à la base de données
        const db = client.db('DatabaseName');
        const userModel = new UserModel(db);

        // Vérifier si l'utilisateur existe déjà
        const oldUser = await userModel.getUserByUsername(username);
        if (oldUser) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "User already exists" }));
            return;
        }

        // Créer un nouvel utilisateur
        const user = await userModel.createUser(username, hashedPass);
        const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWTKEY, { expiresIn: "1h" });

        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ user, token }));
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.message }));
    }
};

// Login user
export const loginUser = async (req, res) => {
    try {
        const body = await getRequestBody(req);
        const { username, password } = body;

        // Connexion à la base de données
        const db = client.db('DatabaseName');
        const userModel = new UserModel(db);

        const user = await userModel.getUserByUsername(username);
        if (user && await bcrypt.compare(password, user.password)) {
            const token = jwt.sign({ username: user.username, id: user._id }, process.env.JWTKEY, { expiresIn: "1h" });
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ user, token }));
        } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ message: "Authentication failed" }));
        }
    } catch (error) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ message: error.toString() }));
    }
};*/
