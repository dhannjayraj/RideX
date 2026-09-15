const express = require("express");

const authController = require("../controllers/auth.controller");

const { validateRegister, validateEmailOtp, validatePhoneOtp, validateResendOtp } = require("../validators/auth.validator");

const router = express.Router();

router.post("/register", validateRegister, authController.register);

router.post("/verify-email-otp", validateEmailOtp, authController.verifyEmailOtp);

router.post("/verify-phone-otp", validatePhoneOtp, authController.verifyPhoneOtp);

router.post("/resend-otp", validateResendOtp, authController.resendOtp);

module.exports = router;
