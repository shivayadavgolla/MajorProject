const mongoose = require('mongoose')

function connect () {
    mongoose.set('useCreateIndex', true);
    //mongoose.connect(dbURI, { useNewUrlParser: true, useUnifiedTopology: true });
    mongoose.connect('mongodb://localhost/shiva',{useNewUrlParser: true})
}

module.exports = connect