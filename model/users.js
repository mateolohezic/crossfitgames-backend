const { Schema, model } = require('mongoose');

const user = new Schema({
  name: String,
  surname: String,
  email: String,
  password: String,
  venture: String,
  location: String,
  birthdate: String,
  startDate: String,
  status: Boolean,
  permissions: String,
});

module.exports = model('User', user);