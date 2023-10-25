const router = require("express").Router();
const { generateTokens } = require("../controller/generateTokens");

router.post("/generateTokens", generateTokens);

module.exports = router;
