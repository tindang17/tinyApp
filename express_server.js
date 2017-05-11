const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080

// Function to generate randone string



function generateRandomString() {
  return Math.random().toString(36).substr(2, 6);
}

// Configuration
app.set("view engine", "ejs");

//Middlewares
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

const cookieParser = require("cookie-parser");
app.use(cookieParser());

app.use((req, res, next) => {
  res.locals.username = req.cookies.username
  next();
})
// Create URLs routes

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};


// Create users route
const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
 "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
}



//Routes
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// Search urls
app.get("/urls", (req, res) => {
  const { username } = req.cookies
  let templateVars = {
    urls: urlDatabase,
    username
  };
  res.render("urls_index", templateVars);
});
// Create Url

app.get("/urls/new", (req, res) => {
  const { username } = req.cookies
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// Retrieve url
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const { username } = req.cookies
  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL],
    username
  };
  res.render("urls_show", templateVars);
});
// Update an URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// Redirect to the longURL
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  let longURL = urlDatabase[shortURL];
  res.redirect(longURL);
});

// Login route
app.post("/login", (req, res) => {
  const { username } = req.body;
  res.cookie("username", username);
  res.redirect("/urls");
});

// Logout and clear cookies
app.post("/logout", (req, res) => {
  const { username } = req.body;
  res.clearCookie("username", username);
  res.redirect("/urls");
});





// User registration
app.get("/register", (req, res) => {
  res.render("user_register");
});

app.post("/register", (req, res) => {
  let userRandomID = generateRandomString();
  const id = userRandomID;
  const email = req.body.email;
  const password = req.body.password;
  users[userRandomID] = {
    id,
    email,
    password
  };
  res.cookie("user_ID", id);
  console.log(users);
  res.redirect("/urls");
});
// Delete an URL
app.post("/urls/:id/delete", (req, res) => {
    delete urlDatabase[req.params.id];
    res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});