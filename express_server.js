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

// Create a database

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com",
};

//Routes
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

// Search urls
app.get("/urls", (req, res) => {
  let templateVars = { urls:
    urlDatabase
  };
  res.render("urls_index", templateVars);
});
// Create Url

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
   // urlDatabase.(req.body);
  res.redirect(`/urls/${shortURL}`);
});

// app.get("/u/:shortURL", (req, res) => {
//   const shortURL = req.params.id;
//   let longURL = urlDatabase.shortURL;
//   res.redirect("urls_show", longURL);
// });

// Retrieve url
app.get("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  let templateVars = { shortURL, fullURL: urlDatabase[shortURL] };
  res.render("urls_show", templateVars);
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});