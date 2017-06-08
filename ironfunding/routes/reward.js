const express                 = require('express');
const moment                  = require('moment');
const Campaign                = require('../models/campaign');
const Reward                  = require('../models/reward');
const { authorizeCampaign }   = require('../middleware/campaign-middleware');
const router                  = express.Router();
const ObjectId                = require('mongoose').Types.ObjectId;

router.get('/campaigns/:id/rewards/new', authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    res.render('rewards/new', { campaign });
  });
});

router.get('/campaigns/:id/rewards', (req, res, next) => {
  Campaign
    .findById(req.params.id)
    .populate('rewards')
    .exec(   (err, campaign) => {
      if (err || !campaign){ return next(new Error("404")); }
      res.render('rewards/index', { campaign });
    });
});


router.post('/campaigns/:id/rewards', authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err || !campaign) { return next(new Error("404")); }

    const reward = new Reward({
      title      : req.body.title,
      description: req.body.description,
      amount     : req.body.amount,
      delivery   : req.body.delivery,
      _campaign  : campaign._id
    });

    reward.save( (err) => {
      if (err){
        return res.render('rewards/new', { errors: reward.errors });
      }

      campaign.rewards.push(reward._id);
      campaign.save( (err) => {
        if (err) {
          return next(err);
        } else {
          return res.redirect(`/campaigns/${campaign._id}`);
        }
      });
    });
  });
});


module.exports = router;
