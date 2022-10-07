const express = require('express'),
    router = express.Router({ mergeParams: true });

router.get('/', async (req, res) => {
    res.render('home', { title: "Bloggr Website"});
}); 


module.exports = router;