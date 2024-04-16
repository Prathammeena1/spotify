const mongoose = require('mongoose')
const plm = require('passport-local-mongoose')

mongoose.connect('mongodb://0.0.0.0/spotifyClone')

const userSchema = mongoose.Schema({
  username:String,
  name:String,
  email: {
    type: String,
    unique: true,
    required: true
  },
  password:String
})

userSchema.plugin(plm)

module.exports = mongoose.model('Users',userSchema);