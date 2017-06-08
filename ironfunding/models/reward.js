const mongoose = require('mongoose');
const User     = require('./user');
const Campaign = require('./campaign');
const Schema   = mongoose.Schema;

const RewardSchema = new Schema({
  title      : { type: String, required: true },
  description: { type: String, required: true },
  amount     : { type: Number, required: true, min: 0 },
  delivery   : { type: Date, required: true },
  _campaign  : { type: Schema.Types.ObjectId, ref: 'Campaign' },
  bidders    : [ { type: Schema.Types.ObjectId,  ref: 'User' } ]

});

const Reward = mongoose.model('Reward', RewardSchema);

module.exports = Reward;
