const winston = require('winston');
//require('winston-mongodb');
require('express-async-errors');

module.exports = function() {
    process.on('uncaughtException', (ex) => {
        console.log('UNCAUGHT EXCEPTION');
        winston.error(ex.message, ex);
    });
    
    // winston.exceptions.handle(    
    //     new winston.transports.File({ filename: 'uncaughtExceptions.log'})
    // );
    
    process.on('unhandledRejection', (ex) => {
        console.log('UNCAUGHT REJECTION');
        winston.error(ex.message, ex);
    });
    
    winston.add(new winston.transports.File({ filename: 'logfile.log' }));
    // winston.add(
    //     new winston.transports.MongoDB({ 
    //         db: "mongodb://localhost/vidly",
    //         level: 'error' }));
    
    //throw new Error('Something failed during startup');
    // const p = Promise.reject(new Error('Something failed miserably'));
    // p.then(() => console.log('Done'));
    
}