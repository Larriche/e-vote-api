// Load required modules
const mongoose = require('mongoose');

var ElectionCategorySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    election: {type: Schema.Types.ObjectId, ref: 'Election'}
}, {
    timestamps: true
});

var ElectionCategory = mongoose.model('ElectionCategory', ElectionCategorySchema);
module.exports = ElectionCategory;