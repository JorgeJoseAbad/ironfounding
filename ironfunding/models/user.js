// models/user.js
const mongoose = require('mongoose');
const Schema   = mongoose.Schema;

const UserSchema = new Schema({
  email      : String,
  username   : String,
  password   : String,
  description: String,
  imgUrl     : {
    type: String,
    default: "https://theeyetravels.com/wp-content/uploads/2014/12/Beethoven-3.jpg" 
  }
});

const User = mongoose.model('User', UserSchema);
module.exports = User;
