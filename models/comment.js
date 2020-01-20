var mongoose = require("mongoose");

var Schema = mongoose.Schema;


var CommentSchema = new Schema({
  // `title` is required and of type String
  name: {
    type: String,
  },
  // `link` is required and of type String
  body: {
    type: String,
    required: true
  },
});

// This creates our model from the above schema, using mongoose's model method
var Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;