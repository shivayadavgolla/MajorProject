const mongoose = require('mongoose')
const dbconnect = require('../db')
const bcrypt = require('bcryptjs')

//Call the db to connect the mongo db
dbconnect()

const CategorySchema = mongoose.Schema({

    group: {
        type: String,
        required: true
    },
    category: {
        type: String,
        required: true
    },
});

const Category = module.exports = mongoose.model('Category', CategorySchema);

module.exports.getAllCategories = function (callback) {
    Category.find(callback);
};


// CategorySchema.statics.findCategoryByName = function(categoryName, callback) {
//     const query = { category: categoryName };
//     return this.findOne(query, callback);
// };

module.exports.deleteByGroupName = async function(group) {
    try {
        const result = await this.deleteMany({ group });
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

CategorySchema.statics.findOne = function(query, callback) {
    return this.model('Category').findOne(query, callback);
 };

 module.exports.deleteOneByName = async function(group, category) {
    try {
        const result = await this.deleteOne({ group, category });
        return result;
    } catch (error) {
        throw new Error(error.message);
    }
};

module.exports.registerCategory = function (newCategory, callback) {
    newCategory.save((err, category) => {
        if (err) {
            return callback(err, null);
        }
        callback(null, category);
    });
};

