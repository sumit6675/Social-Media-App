const express = require("express");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const usersRoute = express.Router();
const bcrypt = require("bcrypt");
const { UserModel, PostModel } = require("../Models/Model");

usersRoute.post("/register", async (req, res) => {
  const { name, email, password, dob, bio } = req.body;
  try {
    if (name && email && password && dob && bio) {
      const cheak = await UserModel.find({ email: email });
      if (cheak.length > 0) {
        res.status(401).json({ message: "Email already register" });
      } else {
        bcrypt.hash(password, 8, async (err, hash) => {
          const user = new UserModel({
            name,
            email,
            password: hash,
            dob,
            bio,
          });
          await user.save();
          // res.send("Registered")
          res.status(201).json({ message: "Registered", user });
        });
      }
    } else {
      res.status(401).json({
        message:
          "Please chacke the email and password. password should be at least 8 characters and having small character and special character",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: "Something went wrong",
    });
  }
});

usersRoute.get("/users", async (req, res) => {
  try {
    const userData = await UserModel.find();
    res.status(200).json({ Data: userData });
  } catch (err) {
    console.log(err);
    res.status(401).json({
      message: "Something went wrong",
    });
  }
});

usersRoute.get("/users/:id/friends", async (req, res) => {
  const userId = req.params.id;

  try {
    const user = await UserModel.findById(userId).populate("friends");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const friends = user.friends.map((friend) => ({
      id: friend._id,
      name: friend.name,
      email: friend.email,
      dob: friend.dob,
      bio: friend.bio,
    }));

    res.status(200).json({ friends });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.post("/users/:id/friends", async (req, res) => {
  const userId = req.params.id;
  const { friendId } = req.body;
  try {
    const user = await UserModel.findByIdAndUpdate(
      userId,
      { $addToSet: { friendRequests: friendId } },
      { new: true }
    ).populate("friendRequests");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const friends = user.friendRequests.map((friend) => ({
      id: friend._id,
      name: friend.name,
      email: friend.email,
      dob: friend.dob,
      bio: friend.bio,
    }));

    res.status(201).json({ friends });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.put("/users/:id/friends/:friendId", async (req, res) => {
  const userId = req.params.id;
  const friendId = req.params.friendId;
  const { accepted } = req.body;

  try {
    const user = await UserModel.findById(userId);
    const friend = await UserModel.findById(friendId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    if (!friend) {
      return res.status(404).json({ message: "Friend not found" });
    }
    const index = user.friendRequests.findIndex(
      (request) => request.toString() === friendId
    );
    if (index === -1) {
      return res.status(404).json({ message: "Friend request not found" });
    }
    if (accepted) {
      user.friends.addToSet(friendId);
      friend.friends.addToSet(userId);
      user.friendRequests.splice(index, 1);
      await Promise.all([user.save(), friend.save()]);
    } else {
      user.friendRequests.splice(index, 1);
      await user.save();
    }
    res.status(204).json({ message: "Friend request updated successfully" });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.get("/posts", async (req, res) => {
  try {
    const postsData = await PostModel.find();
    res.status(200).json({ Data: postsData });
  } catch (err) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.post("/posts", async (req, res) => {
  const { userId, text } = req.body;
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    const post = new PostModel({
      user: user._id,
      text: text,
    });
    await post.save();
    user.posts.addToSet(post._id);
    await user.save();
    res.status(201).json({ message: "Post created successfully", post: post });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.put("/posts/:id", async (req, res) => {
  const { text, image } = req.body;
  try {
    const post = await PostModel.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    if (text) {
      post.text = text;
    }

    if (image) {
      post.image = image;
    }
    await post.save();
    res.status(204).json({ message: "Post updated successfully", post: post });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.delete("/posts/:id", async (req, res) => {
  try {
    const post = await PostModel.findByIdAndRemove(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(202).json({ message: "Post deleted successfully", post: post });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: "Server error" });
  }
});

usersRoute.put('/posts/:id/like', async (req, res) => {
  const{userId}=req.body
  try {
    const post = await PostModel.findByIdAndUpdate(
      req.params.id,
      { $addToSet: { likes: userId } },
      { new: true }
    ).populate('likes');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    res.json({ message: 'Post liked successfully', post: post });
  } catch (error) {
    console.error(error);
    res.status(401).json({ message: 'Server error' });
  }
});

module.exports = {
  usersRoute,
};
