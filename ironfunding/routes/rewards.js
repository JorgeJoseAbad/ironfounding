const express                 = require('express');
const moment                  = require('moment');
const Campaign                = require('../models/campaign');
const Reward                  = require('../models/reward');
const { authorizeCampaign }   = require('../middleware/campaign-authorization');
const router                  = express.Router();
const ObjectId                = require('mongoose').Types.ObjectId;
const {ensureLoggedIn}        = require('connect-ensure-login');

router.get('/campaigns/:id/rewards/new', authorizeCampaign, (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    console.log("in busqueda de rewards/new");
    res.render('rewards/new', { campaign,req });
  });
});

router.get('/campaigns/:id/rewards', (req, res, next) => {
  Campaign
    .findById(req.params.id)
    .populate({
      path: 'rewards',
      match: { bidders: { $ne: req.user._id }}
    })
    .exec(   (err, campaign) => {
      if (err || !campaign){ return next(new Error("404")); }
      res.render('rewards/index', { campaign,req });
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
      _campaign  : campaign._id,
      bidders    : req.user //tentativo para incorporar bidders
    });

    reward.save( (err) => {
      if (err){
        return res.render('rewards/new', { errors: reward.errors });
      }

      campaign.rewards.push(reward._id);
      campaign.save( (err) => {
        if (err) {
          console.log("en campaign.save error");
          return next(err);
        } else {
          console.log("en campaign.save redirect");
          return res.redirect(`/campaigns/${campaign._id}`);
        }
      });
    });
  });
});

router.post('/rewards/:id/donate', ensureLoggedIn('/login'), (req, res, next) => {
  console.log("in rewards/id/donate");
  Reward.findById(req.params.id, (err, reward) => {
    console.log("in reward findById");
    if (reward && !reward.biddedOnBy(req.user)){
      console.log("in if rewards..");
      reward.bidders.push(req.user._id);

      reward.save( (err) => {
        console.log("in rewards save");
        if (err){
          console.log(err);
          res.json(err);
        } else {
          // Increment the campaign's backerCount and totalPledged
          // We have to add this function
          reward.registerWithCampaign(reward.amount, (err) => {
            console.log("in reward.registerWithCampaign");
            if (err) { return res.json(err); }
            return res.json(reward);

          });
        }
      });

    } else {
      res.json("Already bidded on reward");
    }

  });
});


module.exports = router;
