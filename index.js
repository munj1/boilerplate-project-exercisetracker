const express = require("express");
const app = express();
const cors = require("cors");
require("dotenv").config();

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: false }));

app.use(cors());
app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

// initialize mongoDB
const mongoose = require("mongoose");
mongoose
  .connect(process.env.MONGO_URI, {})
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.log(err));

// create user schema
const userSchema = new mongoose.Schema({
  username: { type: String, required: true },
});
const User = mongoose.model("User", userSchema);

// create exercise schema
const exerciseSchema = new mongoose.Schema({
  username: { type: String, required: true },
  userId: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true },
  date: { type: String, required: true },
});
const Exercise = mongoose.model("Exercise", exerciseSchema);

app.post("/api/users", (req, res) => {
  const { username } = req.body;
  const newUser = new User({ username });
  newUser.save((err, data) => {
    if (err) return console.log(err);
    res.json({ username: data.username, _id: data._id });
    console.log("New user added", data);
  });
});

app.get("/api/users", (req, res) => {
  User.find({}, (err, data) => {
    if (err) return console.log(err);
    const userList = data.map((item) => ({
      _id: item._id,
      username: item.username,
    }));
    res.json(userList);
  });
});

app.post("/api/users/:_id/exercises", async (req, res) => {
  // body => description, duration, date, _id
  const { description, duration, date, ":_id": userId } = req.body;

  User.findById(userId, (err, user) => {
    if (err)
      return res.send(
        "Unknown userId (error occured during connecting mongoDB)"
      );
    if (!user) return res.send("Unknown userId");

    username = user.username;

    // parse date time, format to date string
    let dateObj = new Date(date);
    if (dateObj == "Invalid Date") dateObj = new Date();
    const dateStr = dateObj.toDateString();

    const newExercise = new Exercise({
      username,
      userId,
      description,
      duration,
      date: dateStr,
    });

    newExercise.save((err, data) => {
      if (err) return console.log(err);
      res.json({
        _id: data.userId,
        username: data.username,
        date: data.date,
        duration: data.duration,
        description: data.description,
      });
      console.log("New exercise added", data);
    });
  });
});

app.get("/api/users/:_id/logs", (req, res) => {
  const { _id: userId } = req.params;
  // query => from, to, limit
  const { from, to, limit } = req.query;

  // query data from MongoDB (exercise collection)
  Exercise.find({ userId }, (err, exercises) => {
    if (err) return console.log(err);
    // filter data by from, to, limit
    let result = exercises;
    if (from) {
      result = result.filter((exercise) => {
        return new Date(exercise.dateStr) >= new Date(from);
      });
    }
    if (to) {
      result = result.filter((exercise) => {
        return new Date(exercise.dateStr) <= new Date(to);
      });
    }
    if (limit) {
      result = result.slice(0, limit);
    }

    // return data
    res.json({
      username: exercises[0].username,
      count: result.length,
      _id: userId,
      log: exercises.map((exercise) => ({
        description: exercise.description,
        duration: exercise.duration,
        date: exercise.date,
      })),
    });
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
