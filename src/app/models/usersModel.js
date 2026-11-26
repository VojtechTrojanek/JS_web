const jsondb = require('simple-json-db');
const path = require('path');
const db = new jsondb(path.join(__dirname, '..', 'data', 'users.json'));

const getUsers = () => db.JSON();

exports.getUserByEmail = (email) => getUsers().find((user) => user.email === email);

exports.getUserById = (id) => getUsers().find((user) => String(user.id) === String(id));

exports.addUser = (name, email, passwordHash) => {
    const users = getUsers();
    const id = users.reduce((nextId, user) => Math.max(nextId, Number(user.id) + 1), 1);
    const user = { id, name, email, passwordHash };

    users.push(user);
    db.JSON(users);
    db.sync();
    return user;
};

exports.deleteUser = (id) => {
    const users = getUsers();
    const index = users.findIndex((user) => String(user.id) === String(id));

    if (index === -1) return false;

    users.splice(index, 1);
    db.JSON(users);
    db.sync();
    return true;
};
