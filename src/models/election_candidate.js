// Load required modules
const mongoose = require('mongoose');

var ElectionCandidateSchema = new mongoose.Schema({
    name: {
        type: String,
        trim: true
    },
    photo_url: String,
    election: {type: Schema.Types.ObjectId, ref: 'Election'},
    categories: [{type: Schema.Types.ObjectId, ref: 'ElectionCategory'}]
}, {
    timestamps: true
});

var ElectionCandidate = mongoose.model('ElectionCandidate', ElectionCandidateSchema);
module.exports = ElectionCandidate;