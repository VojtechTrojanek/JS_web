const model = require('../models/itemsModel.js');

exports.show = (req, res) => {
    res.render('index', {
        titulek: 'Driveway',
        items: model.getItems(),
        showOffers: true,
        rentalError: ''
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

exports.rent = (req, res) => {
    const result = model.rentItem(req.params.id, req.session.userId);

    if (result === 'rented') return res.redirect('/items#vozy');

    res.status(result === 'not-found' ? 404 : 409).render('index', {
        titulek: 'Driveway',
        items: model.getItems(),
        showOffers: true,
        rentalError: result === 'not-found'
            ? 'Tento vůz již není v nabídce.'
            : 'Tento vůz již byl pronajat.'
    });
};
