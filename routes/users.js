const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')
const playlist = require('./playlist')

mongoose.connect('mongodb://0.0.0.0/spotifyClone')

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password:String,
  playlists:[{type:mongoose.Schema.Types.ObjectId,ref:'Playlist'}]
})

userSchema.plugin(plm)

module.exports = mongoose.model('Users',userSchema);