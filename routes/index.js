const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const userModel = require('./users.js')
const GoogleStrategy = require('passport-google-oidc');
const upload = require('./multerImage.js')
const musicModel = require('./music.js')
const fs = require('fs')
const path = require('path')


passport.use(new GoogleStrategy({
  clientID: process.env['GOOGLE_CLIENT_ID'],
  clientSecret: process.env['GOOGLE_CLIENT_SECRET'],
  callbackURL: '/oauth2/redirect/google',
  scope: ['profile', 'email']
}, async function verify(issuer, profile, cb) {
  const user = await userModel.findOne({ email: profile.emails[0].value })
  if (user) {
    return cb(null, user)
  }
  const newUser = await userModel.create({
    name: profile.displayName,
    email: profile.emails[0].value
  })
  return cb(null, newUser);
}));

passport.use(new localStrategy(userModel.authenticate()));



function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) return next();
  res.redirect('/login');
}



router.get('/', (req, res) => {
  res.render('index.ejs')
});
router.get('/login', (req, res) => {
  res.render('login.ejs')
});

router.get('/home', isLoggedIn, async (req, res) => {
  const loggedInUser = await userModel.findOne({_id:req.user.id})
  const songs  = await musicModel.find();
  res.render('home.ejs',{songs})
});

router.get('/uploadSong', isLoggedIn, async (req, res) => {
  res.render('uploadSong.ejs')
});

router.post('/upload', isLoggedIn, upload.fields([
  { name: 'image', maxCount: 1 },
  { name: 'music', maxCount: 1 }
]), async (req, res) => {
  const loggedInUser = await userModel.findOne({_id:req.user.id})
  const newAudio = await musicModel.create({
    songName: req.body.songName,
    artistName: req.body.artistName,
    image: req.files.image[0].filename,
    audio: req.files.music[0].filename,
    user: loggedInUser._id
  })
  res.redirect('/home')
});



 router.get('/stream/:fileName', isLoggedIn, async (req, res, next) => {

  const range = req.headers.range

  const parts = range.replace('bytes=', "").split("-")
  const start = parseInt(parts[ 0 ], 10)
  let chunkSize = 1024 * 1024 * 3
  let end = start + chunkSize - 1

  const file = fs.statSync(`./public/uploads/${req.params.fileName}`)
  const fileSize = file.size

  if (end >= fileSize) {
    end = fileSize - 1
    chunkSize = start - end + 1
  }

  const head = {
    "Content-Range": `bytes ${start}-${end}/${fileSize}`,
    "Accept-Ranges": "bytes",
    "Content-Length": chunkSize - 1,
    "Content-Type": "video/mp4"
  }

  res.writeHead(206, head)

  fs.createReadStream(`./public/uploads/${req.params.fileName}`, {
    start, end
  }).pipe(res)


  

})






router.get('/login/federated/google', passport.authenticate('google'));

router.get('/oauth2/redirect/google', passport.authenticate('google', {
  successRedirect: '/home',
  failureRedirect: '/login'
}));
router.post("/register", function (req, res) {
  const userData = new userModel({
    username: req.body.username,
    name: req.body.name,
    email: req.body.email,
  })

  userModel.register(userData, req.body.password)
    .then(function () {
      passport.authenticate("local")(req, res, function () {
        res.redirect('/home');
      })
    })
})

router.post('/login', passport.authenticate('local', {
  successRedirect: '/home',
  failureRedirect: '/login'
}), function (req, res) { })

router.get('/logout', (req, res) => {
  req.logout(function () {
    res.redirect('/login');
  });
});








module.exports = router;
