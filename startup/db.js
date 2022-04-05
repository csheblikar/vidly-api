const mongoose = require('mongoose');
// eslint-disable-next-line no-unused-vars
const winston = require('winston');
const config = require('config');

module.exports = function () {
    const db = config.get('db');
    mongoose.connect(db).then(() => console.log(`Connected to ${db}...`));
    // .then => winston.info('Connected to MongoDB...'));
};
