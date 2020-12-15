const express = require("express");
const router = express.Router();

// @Route   GET api/Auth
// @desc    Auth route
// @access  Public
router.get("/", (req, res) => {
  res.send("Profile Route");
});

module.exports = router;
