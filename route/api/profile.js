const express = require("express");
const router = express.Router();
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");
const request = require('request');
const config = require('config');

const { check, validationResult } = require('express-validator/check');
// @Route   GET api/Profile/me
// @desc    Auth route
// @access  Private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({
      user: req.user.id,
    }).populate("user", ["name", "avatar"]);

    if (!profile) {
      return res.status(400).json({ msg: "User Profile does not exist" });
    }

    res.send({ profile });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @Route   POST api/Profile/me
// @desc    Profile route
// @access  Private

router.post('/',
  [ auth,
    check('status', 'is required').not().isEmpty(),
    check('skills', 'is required').not().isEmpty()
  ], async (req, res) => {

      const errors = validationResult(req);
      if(!errors.isEmpty()){
        return res.status(400).json( {errors: errors.array()} );
      }

      const {
        company,
        website,
        status,
        location,
        bio,
        githubuser,
        skills,
        linkedin,
        facebook,
        twitter,
        youtube,
        instagram
      } = req.body;

      // build profileFields

      const profileFields = {};
      profileFields.user = req.user.id;
      if(company) profileFields.company = company;
      if(website) profileFields.website = website;
      if(status) profileFields.status = status;
      if(location) profileFields.location = location;
      if(bio) profileFields.bio = bio;
      if(githubuser) profileFields.githubuser = githubuser;

      if(skills) {
        profileFields.skills = skills.split(',').map(skill => skill.trim());
      }

      profileFields.social = {};
      if(twitter) profileFields.social.twitter = twitter;
      if(facebook) profileFields.social.facebook = facebook;
      if(linkedin) profileFields.social.linkedin = linkedin;
      if(youtube) profileFields.social.youtube = youtube;
      if(instagram) profileFields.social.instagram = instagram;

      try {

      let profile = await Profile.findOne( {user: req.user.id} );

      if(profile) {
        profile = Profile.findOneAndUpdate( {user: req.user.id}, {$set: profileFields}, {new: true} );
        return res.json(profile);
      }
      profile = new Profile(profileFields);

      await profile.save();
      return res.json(profile);

    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
});
// @Route   GET api/Profile/
// @desc    Auth route
// @access  Public

  router.get('/',async (req, res) => {
    try {
      const profiles = await Profile.find().populate('user', ['name', 'avatar']);
      res.json( {profiles} );
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  });


  // @Route   GET api/Profile/user/:user_id
  // @desc    Profile route
  // @access  public
  router.get('/user/:user_id', async (req, res) => {
    try {
      const profile = await Profile.findOne( {user: req.params.user_id} ).populate('user', ['name', 'avatar']);

      if (!profile) {
        return res.status(400).json( {errors: [{msg: "Profile Not Found"}]} );
      }
      res.json( {profile} );
    } catch (err) {
      console.error(err.message);
      if(err.kind == 'ObjectId'){
        return res.status(400).json({errors: [{msg: "Profile Not Found"}]});
      }
      return res.status(500).send("Server Error");
    }
  });

  // @Route   delete api/Profile/
  // @desc    Profile route
  // @access  Private
  router.delete("/", auth, async (req, res) => {


    try {
// TODO: add function to remove user's posts

        // remove profile
        await Profile.findOneAndRemove({
        user: req.user.id,
      });
      // remove User
      await User.findOneAndRemove({_id: req.user.id});

      res.send({msg: "User Deleted"});
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });

  // @Route   put api/Profile/experience
  // @desc    Profile route
  // @access  Private
router.put('/experience', [auth,
  check('title', "Must be entered").not().isEmpty(),
  check('company', "Company Name is Required").not().isEmpty(),
  check('from', "Joining Date is Required").not().isEmpty(),
  check('current', "Current Status with company is required").not().isEmpty(),
  check('location', "Location of company is required").not().isEmpty()
], async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    console.error(errors.message);
    return res.status(400).json( {errors: errors.array() } );
  }

  const {
    title,
    company,
    from,
    to,
    description,
    current,
    location
  } = req.body;

  const newExp = {
    title,
    company,
    from,
    to,
    description,
    current,
    location
  };

  try {

    const profile = await Profile.findOne( {user: req.user.id } );

    profile.experience.unshift(newExp);

    await profile.save();

    res.json( {profile} );

  }catch (err) {
    console.error(err.message)
    return res.status(500).send("Server Error" );
  }

});

// @Route   delete api/Profile/experience/:exp_id
// @desc    Profile route
// @access  Private

router.delete("/experience/:exp_id", auth, async (req, res) => {

  try {
    const profile = await Profile.findOne( {user: req.user.id} );

    if (profile){
      const removeIndex = profile.experience.map(item => item.id).indexOf(req.params.exp_id);

      profile.experience.splice(removeIndex, 1);

      await profile.save();

      res.json( {profile} );
    }
  }catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});

// @Route   put api/Profile/education
// @desc    Profile route
// @access  Private
router.put('/education', [auth,
check('school', "School name is required").not().isEmpty(),
check('degree', "degree Name is Required").not().isEmpty(),
check('from', "Joining Date is Required").not().isEmpty(),
check('current', "Current Status with school is required").not().isEmpty(),
check('fieldofstudy', "field of study is required").not().isEmpty()
], async (req, res) => {

const errors = validationResult(req);

if (!errors.isEmpty()) {
  console.error(errors.message);
  return res.status(400).json( {errors: errors.array() } );
}

const {
  school,
  degree,
  from,
  to,
  fieldofstudy,
  current,
  description
} = req.body;

const newEdu = {
  school,
  degree,
  from,
  to,
  fieldofstudy,
  current,
  description
};

try {

  const profile = await Profile.findOne( {user: req.user.id } );

  profile.education.unshift(newEdu);

  await profile.save();

  res.json( {profile} );

}catch (err) {
  console.error(err.message)
  return res.status(500).send("Server Error" );
}

});

// @Route   delete api/Profile/education/:edu_id
// @desc    Profile route
// @access  Private

router.delete("/education/:edu_id", auth, async (req, res) => {

try {
  const profile = await Profile.findOne( {user: req.user.id} );

  if (profile){
    const removeIndex = profile.education.map(item => item.id).indexOf(req.params.edu_id);

    profile.education.splice(removeIndex, 1);

    await profile.save();

    res.json( {profile} );
  }
}catch (err) {
  console.error(err.message);
  return res.status(500).send("Server Error");
}
});

// @Route   get api/Profile/github/username
// @desc    Profile route
// @access  public
router.get("/github/:username", async (req, res) => {
  try {

    const options =  {
      uri: `https://api.github.com/users/${req.params.username}/repos?per_page=5&sort=created:asc&client_id=${config.get("githubClientId")}&client_secret=${config.get("githubSecret")}`,
      method: "GET",
      headers: { 'user-agent': 'node.js'}
    };

    request(options, (error, response, body) => {
      if (error) console.error(error);

      if(response.statusCode !== 200){
          return res.status(404).json( {msg: "No github Profile found"} );
      }

      res.json(JSON.parse(body));
    });

  } catch (err) {
    console.error(err.message);
    return res.status(500).send("Server Error");
  }
});
module.exports = router;
