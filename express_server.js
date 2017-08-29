const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// require modules
const urlsRoutes = require("./router/urlsRoutes");
const usersRoutes = require("./router/usersRoutes");
const generateRandomString = require("./functions/randomString");
// Configuration
app.set("view engine", "ejs");

//Middlewares
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

// cookies session
const cookieSession = require("cookie-session");
app.use(cookieSession({
  name: "session",
  secret: "allKindOfGainz"
}));

app.use((req, res, next) => {
  res.locals.userId = req.session.userId;
  res.locals.user = users[req.session.userId];
  next();
});
// Create URLs routes

let urlDatabase = {
  "b2xVn2": {
    userId: "b2ba45",
    longURL: "http://www.lighthouselabs.ca",
    shortURL: "b2xVn2"
  },
  "9sm5xK": {
    userId: "lk24aa",
    longURL: "http://www.google.com",
    shortURL: "9sm5xK"
  }
};

// Create users route
let users = {
  "b2ba45": {
    userId: "b2ba45",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "lk24aa": {
    userId: "lk24aa",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// Routes for urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.use("/urls", urlsRoutes(urlDatabase, users));

// Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});
// Routes for users

app.use("/", usersRoutes(users));

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});