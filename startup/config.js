const config = require('config');

module.exports = function() {
    if(!config.has('jwtPrivateKey')){
        console.error('FATAL ERROR: jwtPrivateKey is not defined');
        process.exit(1);
      }
}