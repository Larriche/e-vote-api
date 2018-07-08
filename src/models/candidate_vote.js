// Load required modules
const mongoose = require('mongoose');

var CandidateVoteSchema = new mongoose.Schema({
    category: {type: Schema.Types.ObjectId, ref: 'ElectionCategory'},
    candidate: {type: Schema.Types.ObjectId, ref: 'ElectionCandidate'},
    votes: Number
});

var CandidateVote = mongoose.model('CandidateVote', CandidateVoteSchema);
module.exports = CandidateVote;