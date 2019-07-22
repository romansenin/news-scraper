const mongoose = require("mongoose");

const Schema = mongoose.Schema;

var CommentSchema = new Schema({
  title: String,
  body: String
});

const Comment = mongoose.model("Comment", CommentSchema);

// Export the Comment model
module.exports = Comment;