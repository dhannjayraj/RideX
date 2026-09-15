const authService = require("../services/auth.service");

const register = async (req, res, next) => {
  try {
    const user = await authService.register(req.body);

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyEmailOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await authService.verifyEmailOtp({
      userId,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

const verifyPhoneOtp = async (req, res, next) => {
  try {
    const { userId, otp } = req.body;

    const user = await authService.verifyPhoneOtp({
      userId,
      otp,
    });

    return res.status(200).json({
      success: true,
      message: "Phone verified successfully",
      data: {
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  verifyEmailOtp,
  verifyPhoneOtp
};
