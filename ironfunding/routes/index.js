const express = require('express');
const router = express.Router();
const Campaign = require('../models/campaign');

/* GET home page. */
router.get('/', function(req, res, next) {
  //res.render('index');
  // New
  Campaign
    .find({})
    .populate('_creator')
    .exec( (err, campaigns) => {
        res.render('index', { campaigns,req });
    });
});




module.exports = router;
