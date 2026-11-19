const model = require('../models/itemsModel.js');

// vytvoreni routeru (expressova miniaplikace)
const router = require('express').Router();
const titulek = 'Driveway';

// reakce na custom URL, ktere server obsluhuje
router.get(['/', '/index'], (req, res) => {
	res.render('index', {
		titulek,
		items: model.getItems(),
		showOffers: false
	});
});

router.get('/about', (req, res) => {
	res.render('about', { titulek });
});

router.use('/items', require('./itemsRouter.js'));
router.use('/users', require('./usersRouter.js'));

// odchyceni neznamych URL
router.use((req, res) => {
	res.render('error');
});

// export kodu routeru do hlavni aplikace
module.exports = router;