// function to assign user's urls to their own account
module.exports = function getUsersUrls(urlDatabase, userId) {
  let userUrls = {};
  for(let key in urlDatabase) {
    if(urlDatabase[key].userId === userId) {
      userUrls[key] = urlDatabase[key].longURL;
    }
  }
  return userUrls;
}