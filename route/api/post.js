const express = require("express");
const router = express.Router();
const { check, validationResult } = require('express-validator');
const auth = require('../../middleware/auth');

const Post = require('../../models/Post');
const Profile = require('../../models/Profile');
const User = require('../../models/User');

// @Route   post api/post
// @desc    Post route
// @access  private
router.post("/", [ auth, [
      check('text', 'Text is required').not().isEmpty()
    ]
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json( {errors: errors.array()} );
    }

    try {
      const user = await User.findById(req.user.id).select('-password');

      const newPost = new Post({
        name: user.name,
        text: req.body.text,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  });
  // @Route   post api/post
  // @desc    Post route
  // @access  private
  router.get('/', auth, async (req, res) => {
    try {
      const posts = await Post.find().sort( {date: -1} );

      res.json(posts);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  });

  // @Route   get api/post
  // @desc    get post by id
  // @access  private
  router.get('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById( req.params.id );

      if(!post){
        return res.status(404).json({ msg: "Post Not Found" });
      }

      res.json(post);
    } catch (err) {
      console.error(err.message);
      if(err.kind === 'ObjectId'){
        return res.status(404).json({ msg: "Post Not Found" });
      }
      return res.status(500).send("Server Error");
    }
  });

  // @Route   post api/post
  // @desc    Post route
  // @access  private
  router.delete('/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);

      if(!post){
        return res.status(404).json({ msg: "Post Not Found" });
      }
      // check user
      if(post.user.toString() !== req.user.id){
        return res.status(401).json({msg: "User Not Authorize"});
      }

      await post.remove();
      res.json({msg: "Post removed"});
    } catch (err) {
      console.error(err.message);
      if(err.kind === 'ObjectId'){
        return res.status(404).json({ msg: "Post Not Found" });
      }
      return res.status(500).send("Server Error");
    }
  });

  // @Route   put api/post/like/:id
  // @desc    post route
  // @access  private
  router.put('/like/:id', auth, async (req, res) => {
    try {
      const post = await Post.findById(req.params.id);
      if (!post){

      }

      // check if the post has already been linkedin
      if(post.likes.filter(like => like.user.toString() === req.user.id).length >0){

        console.log(post.likes.filter(like =>
          like.user.toString() === req.user.id).length);

        return res.status(400).json({msg: "Post already liked"});
      }

      post.likes.unshift({ user: req.user.id});
      await post.save();

      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  });

  // @Route   put api/post/unlike/:id
  // @desc    unlike route
  // @access  private
  router.put('/unlike/:id', auth, async (req, res) => {

    try {
      const post = await Post.findById(req.params.id);
      if (!post){

      }

      // check if the post has already been linkedin
      if(post.likes.filter(like => like.user.toString() === req.user.id).length === 0){

        console.log(post.likes.filter(like =>
          like.user.toString() === req.user.id).length);

        return res.status(400).json({msg: "Post has not yet liked"});
      }
      // get remove like
      const removeIndex = post.likes.map(like => like.user.toString).indexOf(req.user.id);

      post.likes.splice(removeIndex, 1);

      await post.save();
      res.json(post.likes);
    } catch (err) {
      console.error(err.message);
      return res.status(500).send("Server Error");
    }
  });

  // @Route   post api/post/comment/:id
  // @desc    add comment on post
  // @access  private
  router.post("/comment/:id", [ auth, [
        check('text', 'Text is required').not().isEmpty()
      ]
    ],
    async (req, res) => {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json( {errors: errors.array()} );
      }

      try {
        const user = await User.findById(req.user.id).select('-password');
        const post = await Post.findById(req.params.id);

        const newComment = {
          name: user.name,
          text: req.body.text,
          avatar: user.avatar,
          user: req.user.id
        };

        post.comments.unshift(newComment);
        await post.save();
        res.json(post.comments);

      } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
      }
    });

    // @Route   delete api/post/comment/:id/:comment_id
    // @desc    delete comment on post
    // @access  private

    router.delete('/comment/:id/:comment_id', auth, async (req, res) => {
      try {
        const post = await Post.findById(req.params.id);
        //pull out comment
        const comment = await post.comments.find(comment => comment.id === req.params.comment_id);

        //check for comment
        if(!comment) {
          return res.status(404).json({ msg: 'Comment does not exist'} );
        }

        //check user
        if(comment.user.toString() !== req.user.id){
          return res.status(401).json({ msg: 'User not authorized'} );
        }
        //remove comment
        const removeIndex = await post.comments.map(comment => comment.user.toString()).indexOf(req.user.id);

        post.comments.splice(removeIndex, 1);

        await post.save();
        res.json(post.comments);


      } catch (err) {
        console.error(err.message);
        return res.status(500).send("Server Error");
      }
    });
module.exports = router;
