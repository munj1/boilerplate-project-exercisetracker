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
  date: { type: Date, default: Date.now },
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
  const { description, duration, date } = req.body;
  const { _id: userId } = req.params;

  try {
    const user = await User.findById(userId);
    const username = user.username;

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

    await newExercise.save();
    res.json({
      username,
      description: newExercise.description,
      duration: newExercise.duration,
      date: newExercise.date.toDateString(),
      _id: userId,
    });
  } catch (err) {
    console.log("error occured in post request (exercise)", err);
    res.json({ error: err.message });
  }
});

app.get("/api/users/:_id/logs", async (req, res) => {
  const { _id: userId } = req.params;
  const user = await User.findById(userId);
  const limit = Number(req.query.limit) || 0;
  const from = req.query.from || new Date(0);
  const to = req.query.to || new Date(Date.now());

  const currentLog = await Exercise.find({
    userId,
    date: { $gte: from, $lte: to },
  })
    .select("-_id -userid -__v -username")
    .limit(limit);

  let userLog = currentLog.map((item) => {
    return {
      description: item.description,
      duration: item.duration,
      date: item.date.toDateString(),
    };
  });

  res.json({
    _id: userId,
    username: user.username,
    count: currentLog.length,
    log: userLog,
  });
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
