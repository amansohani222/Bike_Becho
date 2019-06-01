var mongoose = require("mongoose");

var vechileSchema = mongoose.Schema({
 name: String,
 image: String,
 price: String,
 description: String,
 author: {
  id: {
   type: mongoose.Schema.Types.ObjectId,
   ref: "user"
  },
  username: String
 },
 comments: [{
     type: mongoose.Schema.Types.ObjectId,
     ref: "comment"
 }]
});



module.exports = mongoose.model("vechile", vechileSchema);