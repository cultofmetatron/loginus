var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/loginus');

module.exports = mongoose;
