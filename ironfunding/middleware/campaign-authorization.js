// middleware/campaign-authorization.js
const Campaign = require('../models/campaign.js');

function authorizeCampaign(req, res, next){
  Campaign.findById(req.params.id, (err, campaign) => {
    console.log("in findById de autorhizecampaign");
    // If there's an error, forward it
    if (err)      { return next(err); }
    // If there is no campaign, return a 404
    if (!campaign){ return next(new Error('404')); }
    // If the campaign belongs to the user, next()
    if (campaign.belongsTo(req.user)){
      return next();
    } else {
      return res.redirect(`/campaigns/${campaign._id}`);
    }
  });
}

function checkOwnership(req, res, next){
  console.log(req.params);
  console.log(req.user);
  if (req.user===undefined){
    return res.redirect(`/login`); //if no user logged go to login page
  } else {
    Campaign.findById(req.params.id, (err, campaign) => {
      if (err){ return next(err); }

      if (!campaign){return next(new Error('404')); }

      if (campaign.belongsTo(req.user)){
        res.locals.campaignIsCurrentUsers = true;
      } else {
        res.locals.campaignIsCurrentUsers = false;
      }
      return next();
    });
  }
}


module.exports = {
  authorizeCampaign,
  checkOwnership
};
