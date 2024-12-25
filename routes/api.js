const express = require('express');
const { getHello, getPetrol, getAllUsers, handleLogin, createUser, getUserInfo, getPriceOfDay, checkAccessToken, getNews, getListDate, saveFav, removeFav, checkFav } = require('../controllers/petrolController');
const { auth } = require('../middleware/authentication');
const routerAPI = express.Router();

routerAPI.all("*", auth)

routerAPI.get('/hello', getHello);
routerAPI.get('/petrol', getPetrol);
routerAPI.get('/user-info', getUserInfo);
routerAPI.get('/users', getAllUsers);
routerAPI.post('/petrol-date', getPriceOfDay);
routerAPI.post('/login', handleLogin);
routerAPI.post('/register', createUser);
routerAPI.get('/check-login', checkAccessToken);
routerAPI.get('/news', getNews);
routerAPI.get('/list-date', getListDate)
routerAPI.post('/favorite', saveFav)
routerAPI.get('/unfavorite', removeFav);
routerAPI.get('/check-fav', checkFav);
module.exports = routerAPI;