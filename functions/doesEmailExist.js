// function to verify if email has alreay been registered in the system
module.exports = function doesEmailExist (email, users) {
  for(const userId in users) {
    users[userId].email === email ? true : false
  }
};