const mongoose = require('mongoose')


const musicSchema = mongoose.Schema({
  songName:String,
  artistName:String,
  image:String,
  audio:String,
  user:{type:mongoose.Schema.Types.ObjectId,ref:'Users'}
})


module.exports = mongoose.model('Music',musicSchema);