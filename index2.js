// require("dotenv").config();
// const bodyParser = require("body-parser");
// const mongoose = require("mongoose");
// const express = require("express");
// const cors = require("cors");
// const app = express();

// const port = process.env.PORT || 3000;
// mongoose.connect(process.env.MONGO_URI);

// const userSchema = new mongoose.Schema({
//   username: { type: String, required: true },
// });
// const User = mongoose.model("User", userSchema);

// const logSchema = new mongoose.Schema({
//   userid: String,
//   username: String,
//   description: String,
//   duration: Number,
//   date: { type: Date, default: Date.now },
// });
// const Log = mongoose.model("Log", logSchema);

// app.use(cors());
// app.use(express.static("public"));
// app.use(bodyParser.json());
// app.use(bodyParser.urlencoded({ extended: true }));

// app.get("/", (req, res) => {
//   res.sendFile(__dirname + "/views/index.html");
// });

// app.post("/api/users", async (req, res) => {
//   let newUsername = req.body.username;
//   if (newUsername) {
//     let newUser = new User({
//       username: newUsername,
//     });
//     try {
//       await newUser.save();
//       res.json({
//         username: newUser.username,
//         _id: newUser._id,
//       });
//     } catch (error) {
//       res.json({ error: error.message });
//     }
//   } else {
//     return console.log("Invalid Username");
//   }
// });

// app.get("/api/users", async (req, res) => {
//   try {
//     let allUsers = await User.find({});
//     res.json(allUsers);
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });

// app.post("/api/users/:_id/exercises", async (req, res) => {
//   const id = req.params._id;
//   try {
//     const currentUser = await User.findById(id);
//     if (!currentUser) {
//       res.end("User not found");
//     }

//     const newLog = new Log({
//       userid: id,
//       username: currentUser.username,
//       description: req.body.description,
//       duration: Number(req.body.duration),
//       date: req.body.date
//         ? new Date(req.body.date).toDateString()
//         : new Date().toDateString(),
//     });

//     await newLog.save();

//     res.json({
//       username: newLog.username,
//       description: newLog.description,
//       duration: newLog.duration,
//       date: newLog.date.toDateString(),
//       _id: id,
//     });
//   } catch (error) {
//     res.json({ error: error.message });
//   }
// });

// app.get("/api/users/:_id/logs", async (req, res) => {
//   const id = req.params._id;
//   const currentUser = await User.findById(id);
//   const limit = Number(req.query.limit) || 0;
//   const from = req.query.from || new Date(0);
//   const to = req.query.to || new Date(Date.now());

//   const currentLog = await Log.find({
//     userid: id,
//     date: { $gte: from, $lte: to },
//   })
//     .select("-_id -userid -__v")
//     .limit(limit);

//   let userLog = currentLog.map((item) => {
//     return {
//       description: item.description,
//       duration: item.duration,
//       //
//       date: item.date.toLocaleDateString(),
//     };
//   });

//   res.json({
//     _id: id,
//     username: currentUser.username,
//     count: currentLog.length,
//     log: userLog,
//   });
// });

// const listener = app.listen(process.env.PORT || 3000, () => {
//   console.log("Your app is listening on port " + listener.address().port);
// });
