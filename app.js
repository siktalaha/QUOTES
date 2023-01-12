require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const ejs = require("ejs");
const md5 = require("md5");
const message = "Logged on";
const PORT = 3000;
var signedT = false;
var name = "";
var cnt_log = 1;
const app = express();
const request = require("request");
app.use(express.static("public"));
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({ extended: true }));

mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    console.log("Mongodb connected");
  })
  .catch((err) => {
    console.log(err);
  });
const userSchema = new mongoose.Schema({
  fname: String,
  lname: String,
  cntlog: Number,
  pwd: String,
});

const User = new mongoose.model("UserFinalQuote", userSchema);
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/quotes", (req, res) => {
  if (signedT) {
    request.get(
      {
        url: "https://zenquotes.io/api/quotes",
      },
      function (error, response, body) {
        if (error) return console.error("Request failed:", error);
        else if (response.statusCode != 200)
          return console.error(
            "Error:",
            response.statusCode,
            body.toString("utf8")
          );
        else {
          var quotes = JSON.parse(body);

          res.render("quotes", { qu: quotes, name: name });
        }
      }
    );
  } else {
    res.render("error");
  }
});
app.get("/login", (req, res) => {
  res.render("login");
});
app.post("/login", (req, res) => {
  console.log(req.body.fname_user);
  cnt_log = cnt_log + 1;
  User.findOneAndUpdate(
    { fname: req.body.fname_user, lname: req.body.lname_user },
    { $set: { cntlog: cnt_log } },
    (err, fnd) => {
      if (err) {
        console.log(err);
      } else {
        if (fnd) {
          if (fnd.pwd == md5(req.body.password)) {
            signedT = true;
            name = req.body.fname_user;

            res.redirect("/quotes");
          }
        }
      }
    }
  );
});

app.get("/register", (req, res) => {
  res.render("register");
});
app.post("/register", (req, res) => {
  console.log(req.body.fname_user);
  const newUser = new User({
    fname: req.body.fname_user,
    lname: req.body.lname_user,
    pwd: md5(req.body.password),
    cntlog: cnt_log,
  });
  newUser.save((err) => {
    if (!err) {
      console.log("User added succesfully");
      signedT = true;
      name = req.body.fname_user;

      res.redirect("/quotes");
    } else {
      console.log("Error in adding");
    }
  });
});
app.post("/login", (req, res) => {
  console.log(req);
});
app.listen(PORT, () => {
  console.log("Port runnning");
});
