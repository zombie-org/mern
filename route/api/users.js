const express = require("express");
const { check, validationResult } = require("express-validator");
const router = express.Router();
const config = require("config");

const bcrypt = require("bcryptjs");
const gravatar = require("gravatar");
const jwt = require("jsonwebtoken");
//create User model for DB
const User = require("../../models/User");

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
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    //user Registeration
    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      //get user Gravatar

      const avatar = gravatar.url(email, {
        s: "200",
        r: "pg",
        d: "mm",
      });

      user = new User({
        name,
        email,
        avatar,
        password,
      });

      //Encrypt Password
      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();
      //return jsonwebtoken
      const payload = {
        user: {
          id: user.id,
        },
      };

      jwt.sign(
        payload,
        config.get("jwtToken"),
        { expiresIn: 360000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
      //res.send("User Register");
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  }
);

module.exports = router;
