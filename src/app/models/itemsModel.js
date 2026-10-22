const jsondb = require('simple-json-db');
const db = new jsondb('./app/data/items.json');

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
