const express = require('express');
const router = express.Router();
const session = require('express-session')
const passport = require('passport')
const localStrategy = require('passport-local')
const userModel = require('./users.js')
const GoogleStrategy = require('passport-google-oidc');
const upload = require('./multerImage.js')
const musicModel = require('./music.js')
const fs = require('fs')
const path = require('path')
const playlistModel = require('./playlist.js')
const crypto = require('crypto');


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
  const loggedInUser = await userModel.findOne({_id:req.user.id}).populate('playlists')
  const songs  = await musicModel.find();
  res.render('home.ejs',{loggedInUser,songs})
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


router.get('/createPlaylist',async (req,res,next)=>{
  const loggedInUser = await userModel.findOne({_id:req.user.id})
  const random = crypto.randomBytes(2).toString('hex')
  const newPlaylist = await playlistModel.create({
    name:`New playlist #${random}`
  })
  await loggedInUser.playlists.push(newPlaylist._id)
  await loggedInUser.save()
  res.redirect('/home')
})

router.get('/deletePlaylist/:playlistId',async(req,res)=>{
  const loggedInUser = await userModel.findOne({_id:req.user.id})
  await playlistModel.findOneAndDelete({_id:req.params.playlistId})
  const index = loggedInUser.playlists.indexOf(req.params.playlistId)
  loggedInUser.playlists.splice(index,1)
  await loggedInUser.save()
  res.redirect('back')
})

router.get('/find/playlist/:playlistId',async(req,res)=>{
  const playlist = await playlistModel.findOne({_id:req.params.playlistId}).populate('music')
  res.json(playlist);
})

router.get('/searchSong/:songName', async (req, res) => {
  const { songName } = req.params;
  try {
    // Define your regex pattern
    const regexPattern = new RegExp(songName, 'i'); // 'i' flag for case-insensitive matching

    // Find documents where the song name matches the regex pattern
    const songs = await musicModel.find({ songName: regexPattern });

    res.json({ songs });
  } catch (error) {
    console.error('Error searching for songs:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

router.post('/addSongToPlaylist', async (req, res) => {
  const {songId,playlistId} = req.body
  const playlist = await playlistModel.findOne({_id:playlistId})
  if(playlist.music.indexOf(songId) == -1){
    playlist.music.push(songId)
    await playlist.save()
    const playlist1 = await playlistModel.findOne({_id:playlistId}).populate('music')
    res.json(playlist1)
  }
});

router.get('/deleteSongFromPlaylist/:playlistId/:songId', async (req, res) => {
  const playlist = await playlistModel.findOne({_id:req.params.playlistId});
  const index = playlist.music.indexOf(req.params.songId);
  playlist.music.splice(index,1);
  await playlist.save()
  res.redirect('back')
});





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
