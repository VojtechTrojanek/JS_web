const jsondb = require('simple-json-db');
const path = require('path');
const db = new jsondb(path.join(__dirname, '..', 'data', 'items.json'));

exports.getItems = () => db.JSON();

exports.addItem = (name, price, description, image) => {
    const items = db.JSON();
    let id = 1;

    for (const item of items) {
        if (item.id >= id) id = item.id + 1;
    }

    items.push({ id, name, price, description, image });
    db.JSON(items);
    db.sync();
};

exports.deleteItem = (id) => {
    const items = db.JSON();

    for (const i in items) {
        if (items[i].id == id) {
            items.splice(i, 1);
            db.JSON(items);
            db.sync();
            return true;
        }
    }

    return false;
};

exports.rentItem = (id, userId) => {
    const items = db.JSON();
    const item = items.find((entry) => String(entry.id) === String(id));

    if (!item) return 'not-found';
    if (item.rentedBy) return 'unavailable';

    item.rentedBy = userId;
    db.JSON(items);
    db.sync();
    return 'rented';
};

exports.returnItem = (id, userId) => {
    const items = db.JSON();
    const item = items.find((entry) => String(entry.id) === String(id));

    if (!item) return 'not-found';
    if (String(item.rentedBy) !== String(userId)) return 'not-renter';

    delete item.rentedBy;
    db.JSON(items);
    db.sync();
    return 'returned';
};

exports.releaseRentalsByUserId = (userId) => {
    const items = db.JSON();
    let updated = false;

    for (const item of items) {
        if (String(item.rentedBy) === String(userId)) {
            delete item.rentedBy;
            updated = true;
        }
    }

    if (updated) {
        db.JSON(items);
        db.sync();
    }
};
