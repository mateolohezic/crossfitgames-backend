const User = require('../model/users');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const moment = require('moment');
const { connectDB, disconnectDB } = require('../database/db');
require('dotenv').config();
const secretToken = process.env.SECRET_TOKEN

const getUser = async (req, res) => {
  try {
    const users = await User.find({})
    res.status(200).send(users);
  } catch (error) {
    res.status(206).json({ error: error.message });
  }
}

const plantilla = async () => {
  try {
    await connectDB()
    console.log('holaaaa');
    await disconnectDB()
  } catch (error) {
    console.log(error);
  }
}

// GET USER CON TOKEN:
const getUserEspecifico = async (req, res) => {
  try {
    const token = req.params.token;
    if (!token) {
      return res.status(401).json({ message: 'No se encontró el token.' });
    }
    const { userId } = jwt.verify(token, secretToken);
    try {
      const user = await User.findById(userId);
      if (!user) {
        res.status(404).json({ message: 'El usuario no existe.' });
        return 
      }
      res.status(200).json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      res.status(401).json({ message: 'Token invalido.' });
    } else if (error.name === 'TokenExpiredError') {
      res.status(401).json({ message: 'Su sesión expiro.' });
    } else {
      res.status(500).json({ message: 'Ocurrió un error inesperado.' });
    }
  }
};

// GET USER CON ID DE MONGOOSE:
const getUserEspecificoId = async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(206).send('Invalid user ID');
  } else {
    try {
      const user = await User.findById(id);
      res.status(200).send(user);
    } catch (error) {
      res.status(206).json({ error: error.message });
    }
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error:"Email can't be empty" });
  }

  if (!password) {
    return res.status(400).json({ error:"Password can't be empty" });
  }

  try {
    const user = await User.findOne({ email });
    
    if (!user || !user.status ) {
        return res.status(401).json({ error:"Datos incorrectos." });
    }

    const validPassword = bcrypt.compareSync(password, user.password);
    if (!validPassword) {
        return res.status(401).json({ error:"Datos incorrectos." });
    }

    const token = jwt.sign({ userId: user._id, permissions: user.permissions }, secretToken, { expiresIn: '1y' });
    
    res.status(200).json({ token });

  } catch (error) {
    console.log(error);
    res.status(500).json({
        error: error.message,
    });
  }
}

const createUser = async (req, res) => {
  const { email, password, birthdate, location, name, surname } = req.body;
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/i;
  const passwordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{6,25}$/;
  
  if (!emailPattern.test(email)) {
    res.status(400).json({ error: 'Correo electrónico invalido.' });
    return;
  }
  if (!passwordPattern.test(password)) {
    res.status(400).json({ error: 'Contraseña invalida.' });
    return;
  }
  const emailInUse = await User.findOne({ email });
  if (emailInUse) {
    res.status(400).json({ error: 'Este correo electrónico se encuentra en uso.' });
    return;
  } 
  
  const saltRound = 13; 
  const passwordEncripted = bcrypt.hashSync(password, saltRound);

  const permissions = 'user';
  const status = true;
  const startDate = moment().format('DD/MM/YYYY');
  
  const newUser = new User({
      name,
      surname,
      email,
      password: passwordEncripted,
      location,
      birthdate,
      startDate,
      status,
      permissions,
    });
    await newUser.save();
    res.status(200).json({});
}

const editProfileUser = async (req, res) => {
  try {
    const { id } = req.params
    const { name, surname, location, birthdate } = req.body

    await User.findByIdAndUpdate(id, {
      name,
      surname,
      location,
      birthdate,
    })
    res.status(200).json({})
  } catch (error) {
    res.status(500).json({ error })
  }
};

module.exports = { createUser, getUser, editProfileUser, getUserEspecifico, getUserEspecificoId }