const express = require('express'),
    router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
    res.render('home');
}); 

module.exports = router;