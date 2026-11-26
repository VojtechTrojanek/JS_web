// instalace balicku s knihovnou Express
const express = require('express');
const session = require('express-session');
const FileStore = require('session-file-store')(session);
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const userModel = require('./models/usersModel.js');
// vytvoreni aplikace
const app = express();

const getSessionSecret = () => {
    if (process.env.SESSION_SECRET) return process.env.SESSION_SECRET;

    const secretPath = path.join(__dirname, 'data', 'session-secret');
    try {
        const existingSecret = fs.readFileSync(secretPath, 'utf8').trim();
        if (existingSecret) return existingSecret;
        throw new Error('The saved session secret is empty.');
    } catch (error) {
        if (error.code !== 'ENOENT') throw error;
    }

    const generatedSecret = crypto.randomBytes(32).toString('hex');
    try {
        fs.writeFileSync(secretPath, generatedSecret, { encoding: 'utf8', flag: 'wx', mode: 0o600 });
        return generatedSecret;
    } catch (error) {
        if (error.code !== 'EEXIST') throw error;
        const existingSecret = fs.readFileSync(secretPath, 'utf8').trim();
        if (!existingSecret) throw new Error('The saved session secret is empty.');
        return existingSecret;
    }
};

const sessionSecret = getSessionSecret();
const sessionDirectory = path.join(__dirname, 'data', 'sessions');
fs.mkdirSync(sessionDirectory, { recursive: true });
const sessionStore = new FileStore({
    path: sessionDirectory,
    ttl: 24 * 60 * 60,
    retries: 0,
    secret: sessionSecret
});
const getStoredSession = sessionStore.get.bind(sessionStore);
sessionStore.get = (sessionId, callback) => {
    getStoredSession(sessionId, (error, storedSession) => {
        if (error && error.code === 'ENOENT') return callback(null, null);
        callback(error, storedSession);
    });
};

// zvoleny jazyk pro sablonovani
app.set('view engine', 'ejs');
// nastaveni slozky se sablonami
app.set('views', path.join(__dirname, 'views'));

app.use(express.urlencoded({ extended: false }));
app.use(session({
    store: sessionStore,
    secret: sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 24 * 60 * 60 * 1000
    }
}));

app.use((req, res, next) => {
    const user = req.session.userId && userModel.getUserById(req.session.userId);
    if (user) {
        res.locals.currentUser = { id: user.id, name: user.name, email: user.email };
    } else {
        if (req.session.userId) req.session.userId = null;
        res.locals.currentUser = null;
    }
    next();
});

// misto se statickymi soubory (HTML, CSS, obrazky, ...)
app.use(express.static(path.join(__dirname, '..', 'public')));

// zpracovani dynamickych URL provadi router
app.use(require('./routes/defaultRouter'));

// vystaveni aplikace pro pouziti v server.js
module.exports = app;
