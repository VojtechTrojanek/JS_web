// instalace balicku s knihovnou Express
const express = require('express');
const session = require('express-session');
const crypto = require('crypto');
const userModel = require('./models/usersModel.js');
// vytvoreni aplikace
const app = express();

// zvoleny jazyk pro sablonovani
app.set('view engine', 'ejs');
// nastaveni slozky se sablonami
app.set('views', './app/views');

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex'),
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
app.use(express.static('./public'));

// zpracovani dynamickych URL provadi router
app.use(require('./routes/defaultRouter'));

// vystaveni aplikace pro pouziti v server.js
module.exports = app;
