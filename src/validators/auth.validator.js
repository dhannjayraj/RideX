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

module.exports = {
  validateRegister,
};
