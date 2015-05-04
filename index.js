"use strict";

var crypto = require('crypto');

function RainForestAuth (key) {
    this.key = key;
}

RainForestAuth.prototype.get_run_callback = function (run_id, callback_type) {
    var digest = this.sign(callback_type, {run_id: run_id});
    return "https://app.rainforestqa.com/api/1/callback/run/" + run_id + "/" + callback_type + "/" + digest;
}

RainForestAuth.prototype.sign = function (callback_type, options) {
    var hmac = crypto.createHmac('sha1', this.key);
    hmac.update(merge_data(callback_type, options));
    return hmac.digest('hex');
}

// Verify a digest vs callback_type and options
RainForestAuth.prototype.verify = function (digest, callback_type, options) {
    return digest == this.sign(callback_type, options)
}

function merge_data (callback_type, options) {
    return JSON.stringify({callback_type: callback_type, options: options});
}

module.exports = RainForestAuth;
