const express  = require('express');
const Campaign = require('../models/campaign');
const TYPES    = require('../models/campaign-types');
const router   = express.Router();
const moment   = require('moment');

// Route to upload from project base path
const multer             = require('multer');
const upload = multer({ dest: './public/uploads/' });

const {
    ensureLoggedIn
  }  = require('connect-ensure-login');
//const authorizeCampaign = require('../middleware/campaign-authorization');
const {
    authorizeCampaign,
    checkOwnership
  } = require('../middleware/campaign-authorization');



router.get('/new', ensureLoggedIn('/login'), (req, res) => {
  console.log("en router.get /new in campaings.js");
  res.render('campaigns/new', { types: TYPES, req });
});

router.post('/', ensureLoggedIn('/login'), (req, res, next) => {
  const newCampaign = new Campaign({
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline,
    // We're assuming a user is logged in here
    // If they aren't, this will throw an error
    _creator: req.user._id
  });

  newCampaign.save( (err) => {
        if (err) {
          console.log(err);
          res.render('campaigns/new', { err, campaign: newCampaign, types: TYPES, req });
        } else {
          res.redirect(`/campaigns/${newCampaign._id}`);
        }
      });

});

router.get('/:id', checkOwnership, (req, res, next) => {
  console.log("res.locals.campaignIsCurrentUsers: "+res.locals.campaignIsCurrentUsers);
  console.log("user name: "+req.user.username);
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err){ return next(err); }

    campaign.populate('_creator', (err, campaign) => {
      if (err){ return next(err); }
      return res.render('campaigns/show', { campaign,user:req.user,req });
    });
  });
});

router.get('/:id/edit', [ensureLoggedIn('/login'),authorizeCampaign], (req, res, next) => {
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err)       { return next(err); }
    if (!campaign) { return next(new Error("404")); }
    return res.render('campaigns/edit', { campaign, types: TYPES,req });
  });
});

router.post('/:id', [ensureLoggedIn('/login'),authorizeCampaign], (req, res, next) => {
  const updates = {
    title: req.body.title,
    goal: req.body.goal,
    description: req.body.description,
    category: req.body.category,
    deadline: req.body.deadline
  };
  Campaign.findByIdAndUpdate(req.params.id, updates, (err, campaign) => {
    if (err)       { return res.render('campaigns/edit', { campaign, errors: campaign.errors }); }
    if (!campaign) { return next(new Error("404")); }
    return res.redirect(`/campaigns/${campaign._id}`);
  });
});


router.get('/:id/image',[ensureLoggedIn('/login'),authorizeCampaign],(req,res,next)=>{
console.log("En router.get id upload");
  Campaign.findById(req.params.id, (err, campaign) => {
    if (err)       { return next(err); }
    if (!campaign) { return next(new Error("404")); }
    return res.render('campaigns/image',{campaign, req});
  });
});


router.post('/:id/image', upload.single('photo'), function(req, res){

  let pic;
  if (req.body.photoUrl != undefined && req.body.photoUrl !== ""){
      pic = req.body.photoUrl;
  } else {
      pic = `/uploads/${req.file.filename}`;
  }

  Campaign.findByIdAndUpdate(req.params.id,{pic_path : pic},(err,campaign) => {
    if (err)       { return res.render('campaigns/edit', { campaign, errors: campaign.errors }); }
    if (!campaign) { return next(new Error("404")); }
    return res.redirect(`/campaigns/${campaign._id}`);
  });
});

module.exports = router;
