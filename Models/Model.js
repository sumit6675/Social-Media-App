const mongoose = require("mongoose");
const ObjectId = require('mongoose').ObjectId;
const userSchema = mongoose.Schema({
  name: { type: String, require: true },
  email: { type: String, require: true },
  password: { type: String, require: true },
  dob: { type: String,  require: true },
  bio: { type: String, require: true },
  posts: [{ type: ObjectId, ref: "Post" }],
  friends: [{ type: ObjectId, ref: "User" }],
  friendRequests: [{ type: ObjectId, ref: "User" }],
});

const postSchema = mongoose.Schema({
  user: { type: ObjectId, ref: "User" },
  text: { type: String, require: true },
  image: { type: String, require: true },
  createdAt: { type: String, default:Date.now()},
  likes: [{ type: ObjectId, ref: "User" }],
  comments: [
    {
      user: { type: ObjectId, ref: "User" },
      text: String,
      createdAt: Date,
    },
  ],
});

const UserModel = mongoose.model("User", userSchema);

const PostModel = mongoose.model("Post", postSchema);

module.exports = {
  UserModel,
  PostModel,
};
