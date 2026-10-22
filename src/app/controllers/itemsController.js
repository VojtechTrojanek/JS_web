const model = require('../models/itemsModel.js');

exports.show = (req, res) => {
    res.render('index', {
        titulek: 'Driveway',
        items: model.getItems(),
        showOffers: true
    });
};

exports.create = (req, res) => {
    model.addItem(req.body.name, Number(req.body.price), req.body.description, req.body.image);
    res.redirect(req.body.showOffers ? '/items#vozy' : '/#vozy');
};

exports.remove = (req, res) => {
    const id = req.params.id;
    model.deleteItem(id);
    res.redirect(req.body.showOffers ? '/items#vozy' : '/#vozy');
};
