const bcrypt = require('bcrypt');
const model = require('../models/usersModel.js');
const itemsModel = require('../models/itemsModel.js');

const titulek = 'Driveway';
const passwordRounds = 12;

const renderProfile = (res, user, error, status = 200) => {
    res.status(status).render('profile', {
        titulek,
        user: { name: user.name, email: user.email },
        rentedItems: itemsModel.getItems().filter((item) => String(item.rentedBy) === String(user.id)),
        error
    });
};

const renderForm = (res, view, error, status = 200) => {
    res.status(status).render(view, { titulek, error });
};

const regenerateSession = (req) => new Promise((resolve, reject) => {
    req.session.regenerate((error) => error ? reject(error) : resolve());
});

const destroySession = (req) => new Promise((resolve, reject) => {
    req.session.destroy((error) => error ? reject(error) : resolve());
});

exports.showRegister = (req, res) => {
    if (req.session.userId) return res.redirect('/users/profile');
    renderForm(res, 'register', '');
};

exports.register = async (req, res) => {
    const name = typeof req.body.name === 'string' ? req.body.name.trim() : '';
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';

    if (!name || name.length > 80 || email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        || password.length < 8 || password.length > 128) {
        return renderForm(res, 'register', 'Zadejte platné jméno a e-mail. Heslo musí mít 8 až 128 znaků.', 400);
    }
    if (model.getUserByEmail(email)) {
        return renderForm(res, 'register', 'Účet s tímto e-mailem již existuje.', 409);
    }

    const passwordHash = await bcrypt.hash(password, passwordRounds);
    const user = model.addUser(name, email, passwordHash);
    await regenerateSession(req);
    req.session.userId = user.id;
    res.redirect('/users/profile');
};

exports.showLogin = (req, res) => {
    if (req.session.userId) return res.redirect('/users/profile');
    renderForm(res, 'login', '');
};

exports.login = async (req, res) => {
    const email = typeof req.body.email === 'string' ? req.body.email.trim().toLowerCase() : '';
    const password = typeof req.body.password === 'string' ? req.body.password : '';
    const user = model.getUserByEmail(email);

    if (!user || !await bcrypt.compare(password, user.passwordHash)) {
        return renderForm(res, 'login', 'Neplatný e-mail nebo heslo.', 401);
    }

    await regenerateSession(req);
    req.session.userId = user.id;
    res.redirect('/users/profile');
};

exports.requireAuth = (req, res, next) => {
    if (!req.session.userId) return res.redirect('/users/login');
    next();
};

exports.showProfile = (req, res) => {
    const user = model.getUserById(req.session.userId);
    if (!user) {
        req.session.userId = null;
        return res.redirect('/users/login');
    }
    renderProfile(res, user, '');
};

exports.returnItem = (req, res) => {
    const user = model.getUserById(req.session.userId);
    if (!user) return res.status(404).render('error');

    const result = itemsModel.returnItem(req.params.id, user.id);
    if (result === 'returned') return res.redirect('/users/profile');

    renderProfile(
        res,
        user,
        result === 'not-found' ? 'Tento vůz již není v nabídce.' : 'Tento vůz není pronajatý vaším účtem.',
        result === 'not-found' ? 404 : 403
    );
};

exports.logout = async (req, res) => {
    await destroySession(req);
    res.clearCookie('connect.sid');
    res.redirect('/');
};

exports.deleteProfile = async (req, res) => {
    const user = model.getUserById(req.session.userId);
    if (!user) return res.status(404).render('error');

    const password = typeof req.body.password === 'string' ? req.body.password : '';
    if (!password || !await bcrypt.compare(password, user.passwordHash)) {
        return renderProfile(res, user, 'Zadané heslo není správné. Profil nebyl smazán.', 401);
    }

    itemsModel.releaseRentalsByUserId(user.id);
    if (!model.deleteUser(user.id)) return res.status(404).render('error');
    await destroySession(req);
    res.clearCookie('connect.sid');
    res.redirect('/');
};
