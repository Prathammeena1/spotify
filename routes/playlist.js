const mongoose = require('mongoose')

const playlistSchema = new mongoose.Schema({
    name: String,
    description: String,
    owner: { type: mongoose.Schema.Types.ObjectId, ref: 'Users' },
    music: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Music' }]
});

module.exports = mongoose.model('Playlist',playlistSchema)