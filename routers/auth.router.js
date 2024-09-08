const express = require("express");
const router = express.Router();

const authController = require("../controllers/auth.controller.js");

router
  .post("/login", authController.login)
  .post("/register", authController.register);

module.exports = router;
