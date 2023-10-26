const express = require('express');
const route = express.Router();
const { createUser, getUser, editProfileUser, getUserEspecifico, getUserEspecificoId } = require('../controllers/users');
const {  } = require('../middleware/jwt')

route.get('/', getUser);
route.get('/:token', getUserEspecifico);
route.get('/id/:id', getUserEspecificoId);
route.post('/', createUser)
route.put(`/:id`, editProfileUser);

module.exports = route;