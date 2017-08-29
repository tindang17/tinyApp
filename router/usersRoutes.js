const express = require("express");
const router = express.Router();

const bcrypt = require("bcrypt");
const { hashSync, compareSync } = require("bcrypt");
const password = "purple-monkey-dinosaur";
const hashed_password = hashSync(password, 10);

const generateRandomString = require("../functions/randomString");
const doesEmailExist = require("../functions/doesEmailExist");

module.exports = function (users) {
  function isUserValid (email, password){
    for(const userId in users) {
      if (users[userId].email === email) {
        if(bcrypt.compareSync(password, users[userId].password)) {
          return userId;
        }
      }
    }
    return null;
  };
  // Login route
  router.get("/register", (req, res) => {
    res.render("user_register");
  });

  router.post("/register", (req, res) => {
    const id = generateRandomString();
    const email = req.body.email;
    const password = req.body.password;
    // Response for when user forget to enter email or password
    if (!password || !email) {
      res.status(404);
      res.send('please enter your email and password');
      return;
    }

    // Response for when email has already existed
    if (doesEmailExist(email, users)) {
      res.status(404);
      res.send('your email has been registered in our system');
      return;
    }
    // if user has not been registered, save the information into the database
    users[id] = {
      id,
      email,
      password: bcrypt.hashSync(password, 10)
    };
    req.session.userId = id;
    res.redirect("/urls");
  });
  
  router.get("/login", (req, res) => {
    res.render("login");
  });

  router.post("/login", (req, res) => {
    // error message if either email or password is missing
    if(!req.body.email || !req.body.password) {
      res.status(403);
      res.send("Please enter email or password <br><a href='/login'>login page</a>");
      return;
    }

    let userId = isUserValid(req.body.email, req.body.password);
    // if the login id matchs with the session id, access is granted
    if(userId) {
      req.session.userId = userId;
      res.redirect("/urls");
    } else {
      res.status(403).send("Email or password is not valid <br><a href='/login'>return to login page</a>");
    }
  });

  // Logout and clear cookies
  router.post("/logout", (req, res) => {
    req.session = null;
    res.redirect("/urls");
  });
  
  return router;
}