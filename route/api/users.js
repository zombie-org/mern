const express = require("express");
const { check, validationResult } = require("express-validator/check");
const router = express.Router();
// @route   POST api/users
// @desc    TO verify and handle user input req
// @access  Public
router.post(
  "/",
  [
    check("name", "Name is Required").not().isEmpty(),
    check("email", "Please enter a valid email address").isEmail(),
    check("password", "Password length needs to be of minimum 6 ").isLength({
      min: 6,
    }),
  ],
  (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    res.send("User Route");
  }
);

module.exports = router;
