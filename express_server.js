const express = require("express");
const app = express();
const PORT = process.env.PORT || 8080
const bcrypt = require("bcrypt");
const { hashSync, compareSync } = require("bcrypt");
const password = "purple-monkey-dinosaur";
const hashed_password = hashSync(password, 10);

// const uuid = require("uuid")

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
  res.locals.userId = req.cookies.userId;
  res.locals.user = users[req.cookies.userId]
  next();
})

// Create URLs routes

let urlDatabase = {
  "b2xVn2": {
    userId : "b2ba45",
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

const emailExists = (email, users) => {
  for(userId in users) {
    if (users[userId].email === email) {
      return true;
    }
  }
  return false;
}

const validUser = (email, password) => {
 for(userId in users) {
    if (users[userId].email === email) {
      if(bcrypt.compareSync(password, users[userId].password)) {
        return userId;
      }
    }
  }
  return null;
}

function getUsersUrls(userId) {
  let userUrls = {};
  for(let key in urlDatabase) {
    if(urlDatabase[key].userId === userId) {
      userUrls[key] = urlDatabase[key].longURL;
    }
  }
  return userUrls;
}
//Routes
app.get("/hello", (req, res) => {
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});




// Search urls
app.get("/urls", (req, res) => {
  if(!req.cookies.userId) {
    res.send("Please log in to see your urls")
    return;
  }
  const user = users[req.cookies.userId];
  let userUrls = getUsersUrls(req.cookies.userId);
  let templateVars = {
    urls: userUrls
  };
  res.render("urls_index", templateVars);
});

// Create Url
app.get("/urls/new", (req, res) => {
  if(req.cookies.userId == undefined){
    res.redirect("/login");
  }else{
    const { users } = req.cookies;
    res.render("urls_new");
    return;
  }
});

app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = {
    longURL: req.body.longURL,
    userId: req.cookies.userId
  };
  res.redirect("/urls");
});

// Everyone can see urls
app.get("/", (req, res) => {
  let templateVars = {
    urls: urlDatabase
  };
  res.render("front-page", templateVars);
})
// Retrieve url
app.get("/urls/:id", (req, res) => {
  if(!req.cookies.userId) {
    res.redirect("/urls");
    return;
  }
  const shortURL = req.params.id;
  let templateVars = {
    shortURL,
    longURL: urlDatabase[shortURL].longURL,
    userId: req.cookies.userId
  };
  if(urlDatabase[shortURL].userId != req.cookies.userId) {
    // console.log("tin", urlDatabase[shortURL].userId != req.cookies.userId)
    res.redirect("/urls");
  } else {
    res.render("urls_show", templateVars);
    return;
  }
});
// Update an URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL].longURL = req.body.longURL;
  res.redirect("/urls");
});

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
  if(!req.body.email || !req.body.password) {
    res.status(403);
    res.send("Where is the email or password bruh");
    return;
  }

  let userId = validUser(req.body.email, req.body.password);
  // console.log(userId);

  if(userId) {
    res.cookie("userId", userId);
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
  const randomID = generateRandomString();
  const id = randomID;
  const email = req.body.email;
  const password = req.body.password;
  const doesEmailExist = emailExists(email, users);
  // Response for when user forget to enter email or password
  if (!password || !email) {
    res.status(404);
    res.send('please enter your email or password');
    return;
  }

  // Response for when eamil has already existed
  if (doesEmailExist) {
    res.status(404);
    res.send('your email has been registered in our system');
    return;
  }
  users[randomID] = {
    id,
    email,
    password: bcrypt.hashSync(password, 10)
  };
  res.cookie("userId", id);
  res.redirect("/urls");
});

// Logout and clear cookies
app.post("/logout", (req, res) => {
  res.clearCookie("userId");
  res.redirect("/urls");
});


app.post("/urls/:id/delete", (req, res) => {
  if(!req.cookies.userId) {
    res.send("You are not logged in")
    return;
  }
  const url = urlDatabase[req.params.id];
  if(req.cookies.userId != url.userId) {
    res.send("You do not own that url");
    return;
  }
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}`);
});