const express = require("express");
const router = express.Router();

const generateRandomString = require ("../functions/randomString");
const getUsersUrls = require ("../functions/getUsersUrls");

module.exports = function (urlDatabase, users) {
  
  router.get("/", (req, res) => {
    if(!req.session.userId) {
      res.send("Please log in to see your urls");
      return;
    }
    const user = users[req.session.userId];
    let userUrls = getUsersUrls(urlDatabase, req.session.userId);
    let templateVars = {
      urls: userUrls
    };
    res.render("urls_index", templateVars);
  });
  // route to go the form to create new urls
  router.get("/new", (req, res) => {
    if(req.session.userId === undefined){
      res.redirect("/login");
    } else {
      const { users } = req.session;
      res.render("urls_new");
      return;
    }
  });
  // route to create new short url
  router.post("/", (req, res) => {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userId: req.session.userId
    };
    res.redirect("/urls");
  });
  
  // Retrieve url
  router.get("/:id", (req, res) => {
    if(!req.session.userId) {
      res.redirect("/urls");
      return;
    }
    const shortURL = req.params.id;
    let templateVars = {
      shortURL,
      longURL: urlDatabase[shortURL].longURL,
      userId: req.session.userId
    };
    if(urlDatabase[shortURL].userId !== req.session.userId) {
      res.redirect("/urls");
    } else {
      res.render("urls_show", templateVars);
      return;
    }
  });

  // Update an URL
  router.post("/:id", (req, res) => {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  });

  
  return router;
}
