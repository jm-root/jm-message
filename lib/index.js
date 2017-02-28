var service = require('./service');

module.exports = function(opts){
    opts = opts || {};
    var o = service(opts);
    return o;
};
