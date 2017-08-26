const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080;

// installing bcrypt package
const bcrypt = require("bcrypt");
const { hashSync, compareSync } = require("bcrypt");
const password = "purple-monkey-dinosaur";
const hashed_password = hashSync(password, 10);

// require modules
const urlsRoutes = require("./router/urlsRoutes");
const generateRandomString = require("./functions/randomString")

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

// function to verify if email has alreay been registered in the system
const emailExists = (email, users) => {
  for(const userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
};

// function to verify if a user has entered correct email and password
const validUser = (email, password) => {
  for(const userId in users) {
    if (users[userId].email === email) {
      if(bcrypt.compareSync(password, users[userId].password)) {
        return userId;
      }
    }
  }
  return null;
};

// Routes for urls
app.get("/", (req, res) => {
  res.redirect("/urls");
});
app.use("/urls", urlsRoutes(urlDatabase, users))

// Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL].longURL;
  res.redirect(longURL);
});

// Login route
app.get("/login", (req, res) => {
  res.render("login");
});

app.post("/login", (req, res) => {
  // error message if either email or password is missing
  if(!req.body.email || !req.body.password) {
    res.status(403);
    res.send("Please enter email or password");
    return;
  }

  let userId = validUser(req.body.email, req.body.password);
  // if the login id matchs with the session id, access is granted
  if(userId) {
    req.session.userId = userId;
    res.redirect("/urls");
  } else {
    res.status(403).send("Email or password is not valid <br><a href='/login'>return to login page</a>");
  }
});
// User registration
app.get("/register", (req, res) => {
  res.render("user_register");
});
// Adding new user to users database
app.post("/register", (req, res) => {
  const id = generateRandomString();
  const email = req.body.email;
  const password = req.body.password;
  const doesEmailExist = emailExists(email, users);
  // Response for when user forget to enter email or password
  if (!password || !email) {
    res.status(404);
    res.send('please enter your email and password');
    return;
  }

  // Response for when email has already existed
  if (doesEmailExist) {
    res.status(404);
    res.send('your email has been registered in our system');
    return;
  }
  // if user has not been registered, save the information into the database
  users[randomID] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  req.session.userId = id;
  res.redirect("/urls");
});

// Logout and clear cookies
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// Delete existing URLs
app.post("/urls/:id/delete", (req, res) => {
  // if users are not logged in, they can't delete the URLs
  if(!req.session.userId) {
    res.send("You are not logged in");
    return;
  }
  const url = urlDatabase[req.params.id];
  // if the users don't own the urls, they can't delete it.
  if(req.session.userId != url.userId) {
    res.send("You do not own that url");
    return;
  }
  // delete req is approved
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});