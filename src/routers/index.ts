const express = require('express');
const router = express.Router();
const userRoutes = require('./users.router');
const storeRoutes = require("./store.router");

const defaultRoutes = [
  {
    path: '/users',
    route: userRoutes
  },
  {
    path:"/stores",
    route:storeRoutes
  }
];
defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
