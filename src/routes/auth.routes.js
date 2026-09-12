const express = require("express");

const authController = require("../controllers/auth.controller");

const { validateRegister } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validateRegister, authController.register);

module.exports = router;
