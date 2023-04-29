require("dotenv").config();
const express = require("express");
const app = express();
const cors = require("cors");
const { connection } = require("./config/db");
const { usersRoute } = require("./Routes");

app.use(cors({ origin: "*" }));

app.use(express.json())

app.get("/", (req, res) => {
  res.send("Welcome to Social Media App");
});

app.use("/api",usersRoute)

app.listen(process.env.port, async (req, res) => {
  console.log(`Server is listening on ${process.env.port}`);
  try {
    await connection;
    console.log("connected to database");
  } catch (err) {
    console.log(err);
  }
});
