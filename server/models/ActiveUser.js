const mongoose = require('mongoose');

const activeUserSchema = mongoose.Schema([{
    username: {
        type: String,
        required: true
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}]);

module.exports = mongoose.model('ActiveUser', activeUserSchema);