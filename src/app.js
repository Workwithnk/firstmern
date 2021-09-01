require("dotenv").config();
const express = require("express");
const app = express();
require("./database/connDB");
const userCollection = require("./models/userColle");
const bcrypt = require("bcrypt");
const path = require("path");
const hbs = require("hbs");
const port = process.env.PORT || 3000;

const static_path = path.join(__dirname, "../public");
const views_path = path.join(__dirname, "../templates/views");
const partials_path = path.join(__dirname, "../templates/partials");

app.use(express.static(static_path));
app.set("view engine", "hbs");
app.set("views", views_path);
hbs.registerPartials(partials_path);

app.use(express.urlencoded({ extended: false }));

app.get("/", (req, res) => {
  res.render("index");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.post("/register", async (req, res) => {
  try {
    const userData = new userCollection({
      userName: req.body.userName,
      userEmail: req.body.userEmail,
      userPass: req.body.userPass,
    });

    // middleware to generate tokens
    const token = await userData.generateToken();
    const allData = await userData.save();
    res.status(201).render("index");
  } catch (e) {
    res.status(404).send(`Something is wrong : ${e}`);
  }
});

app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", async (req, res) => {
  try {
    const usrEmail = req.body.usrEmail;
    const usrPass = req.body.usrPass;
    const mathData = await userCollection.findOne({ userEmail: usrEmail });
    const hashVal = await bcrypt.compare(usrPass, mathData.userPass);
    const token = await mathData.generateToken();

    if (hashVal) {
      res.status(200).render("index");
    } else {
      res.status(400).send("Password is incorrect");
    }
  } catch (e) {
    res.status(400).send(`Something went wrong : ${e}`);
  }
});

app.listen(port, () => {
  console.log(`server is runnig on port ${port}`);
});
