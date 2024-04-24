const mongoose = require('mongoose')
const dbconnect = require('../db')
const bcrypt = require('bcryptjs');

//Call the db to connect the mongo db
dbconnect()

// User Schema
const User1Schema = mongoose.Schema({
    name: {
        type: String
    },
    username: {
        type: String,
        unique: true,
        required: true
    },
    email:  {
        type: String
    },
    password: {
        type: String,
        required: true
    },
    role: {
        type: String,
        default:'user1'
    }
});

const User1 = module.exports = mongoose.model('User1', User1Schema);

module.exports.registerUser1 = function (newUser1, callback) {
    bcrypt.genSalt(10, (err, salt) => {
        bcrypt.hash(newUser1.password, salt, (err, hash) => {
            if (err) {
                console.log(err);
            }
            newUser1.password = hash;
            newUser1.save(callback);
        });
    });
}

module.exports.getUser1ByUsername = function(username, callback){
    const query = {username: username}
    User1.findOne(query, callback);
}
  
module.exports.getUser1ById = function(id, callback){
    User1.findById(id, callback);
}

module.exports.comparePassword = function(candidatePassword, hash, callback){
    bcrypt.compare(candidatePassword, hash, (err, isMatch) => {
        if(err) throw err;
        callback(null, isMatch);
    });
}

// module.exports.getEngineer = function(callback){
//     const query = {role: "jeng"}
//     User.find(query, callback);
// }

