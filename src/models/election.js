// Load required modules
const mongoose = require('mongoose');
const Schema = mongoose.Schema;

var ElectionSchema = new Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    start_time: Date,
    end_time: Date,
    code: String,
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    categories: [{type: Schema.Types.ObjectId, ref: 'ElectionCategory'}]
}, {
    timestamps: true
});

var Election = mongoose.model('Election', ElectionSchema);
module.exports = Election;