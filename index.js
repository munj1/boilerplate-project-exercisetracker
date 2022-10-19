const express = require("express");
const app = express();
const cors = require("cors");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
// console.log(mongoose.connection.readyState);
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});
const exerciseSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: Date,
});
let User = mongoose.model("users", userSchema);
let Exercise = mongoose.model("exercise", exerciseSchema);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
app.use(express.static("public"));

// API endpoints
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// Create a New User
app.post("/api/users", (req, res) => {
  try {
    let user = new User({ username: req.body.username });
    user.save((err, data) => {
      if (err) {
        res.send("Error saving new user");
      }
      res.json(data);
    });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

// List all users
app.get("/api/users", (req, res) => {
  User.find({}, (err, users) => {
    if (err || !users) {
      res.send("Error finding users");
    } else {
      res.json(users);
    }
  });
});

// Add exercise
app.post("/api/users/:_id/exercises", (req, res) => {
  try {
    const userId = req.params._id;
    const { description, duration, date } = req.body;
    let exDate = date ? new Date(date) : new Date();

    User.findById(userId, (err, userData) => {
      if (err || !userData) {
        res.send("Error finding the user");
      } else {
        let exercise = new Exercise({
          userId: userId,
          description: description,
          duration: Number(duration),
          date: exDate,
        });
        exercise.save((err, exData) => {
          if (err || !exData) {
            res.send("Error saving new exercise");
          } else {
            res.json({
              _id: userId,
              username: userData.username,
              description: description,
              duration: Number(duration),
              date: exDate.toDateString(),
            });
          }
        });
      }
    });
  } catch (error) {
    console.log(error);
    res.json({ error: error });
  }
});

// get user's exercise log
// GET /api/users/:_id/logs?[from][&to][&limit]
app.get("/api/users/:_id/logs", (req, res) => {
  const userId = req.params._id;
  const { from, to, limit } = req.query;
  User.findById(userId, (err, userData) => {
    if (err || !userData) {
      res.send("Error finding the user");
    } else {
      let filter = { userId };
      if (from || to) {
        let dateObj = {};
        let dateRegex = /\d{4}-\d{2}-\d{2}/;
        if (from.match(dateRegex)) {
          dateObj["$gte"] = new Date(from);
        }
        if (to.match(dateRegex)) {
          dateObj["$lte"] = new Date(to);
        }
        filter.date = dateObj;
      }
      Exercise.find(filter)
        .limit(Number(limit))
        .exec((err, data) => {
          if (err || !data) {
            res.send("Cannot retrieve any exercise");
          } else {
            const log = data.map((d) => ({
              description: d.description,
              duration: d.duration,
              date: d.date.toLocaleDateString(),
            }));
            res.json({
              username: userData.username,
              count: data.length,
              _id: userId,
              log: log,
            });
          }
        });
    }
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
