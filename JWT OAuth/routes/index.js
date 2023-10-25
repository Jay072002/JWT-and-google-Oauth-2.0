const router = require("express").Router();
const authRouter = require("./auth");

// Auth Routes goes here
router.use("/auth", authRouter);

module.exports = router;
