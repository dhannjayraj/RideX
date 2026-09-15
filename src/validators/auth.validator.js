const validateRegister = (req, res, next) => {
  const { firstName, lastName, email, phone, password } = req.body;

  const errors = [];

  if (!firstName || typeof firstName !== "string") {
    errors.push("First name is required");
  }

  if (!email || typeof email !== "string") {
    errors.push("Email is required");
  }

  if (!phone || typeof phone !== "string") {
    errors.push("Phone is required");
  }

  if (!password || typeof password !== "string") {
    errors.push("Password is required");
  }

  if (password && password.length < 8) {
    errors.push("Password must be at least 8 characters");
  }

  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    errors.push("Invalid email format");
  }

  if (phone && !/^[0-9]{10,15}$/.test(phone)) {
    errors.push("Invalid phone number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateEmailOtp = (req, res, next) => {
  const { userId, otp } = req.body;

  const errors = [];

  if (!userId) {
    errors.push("User ID is required");
  }

  if (!otp) {
    errors.push("OTP is required");
  }

  if (otp && !/^[0-9]{6}$/.test(otp)) {
    errors.push("OTP must be a 6-digit number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validatePhoneOtp = (req, res, next) => {
  const { userId, otp } = req.body;

  const errors = [];

  if (!userId) {
    errors.push("User ID is required");
  }

  if (!otp) {
    errors.push("OTP is required");
  }

  if (otp && !/^[0-9]{6}$/.test(otp)) {
    errors.push("OTP must be a 6-digit number");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

const validateResendOtp = (req, res, next) => {
  const { userId, channel } = req.body;

  const errors = [];

  if (!userId) {
    errors.push("User ID is required");
  }

  if (!channel) {
    errors.push("Channel is required");
  }

  if (channel && !["EMAIL", "PHONE"].includes(channel)) {
    errors.push("Channel must be EMAIL or PHONE");
  }

  if (errors.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors,
    });
  }

  next();
};

module.exports = {
  validateRegister,
  validateEmailOtp,
  validatePhoneOtp,
  validateResendOtp
};
