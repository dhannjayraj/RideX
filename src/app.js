const express = require("express");

const authRoutes = require("./routes/auth.routes");

const errorMiddleware = require("./middlewares/error.middleware");

const app = express();

app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "RideX Api is running",
  });
});

app.use("/api/auth", authRoutes);

app.use(errorMiddleware);

module.exports = app;
