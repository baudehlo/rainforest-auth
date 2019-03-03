"use strict";

var crypto = require('crypto');

function RainForestAuth (key, keyHash) {
    this.key = key;

    if (!this.key) {
        this.key_hash = keyHash;
    } else {
        const hash = crypto.createHash('sha256');
        hash.update(key);
        this.key_hash = hash.digest('hex');
    }
}

RainForestAuth.prototype.get_run_callback = function (run_id, callback_type) {
    var digest = this.sign(callback_type, {run_id: run_id});
    return "https://app.rainforestqa.com/api/1/callback/run/" + run_id + "/" + callback_type + "/" + digest;
}

RainForestAuth.prototype.sign_old = function (callback_type, options = null) {
    var hmac = crypto.createHmac('sha1', this.key);
    hmac.update(merge_data(callback_type, options));
    return hmac.digest('hex');
}

RainForestAuth.prototype.sign = function (callback_type, options = null) {
    var hmac = crypto.createHmac('sha1', this.key_hash);
    hmac.update(merge_data(callback_type, options));
    return hmac.digest('hex');
}

// Verify a digest vs callback_type and options
RainForestAuth.prototype.verify = function (digest, callback_type, options) {
    if (!this.key) {
        return digest === this.sign(callback_type, options);
    }
    return digest === this.sign(callback_type, options) || digest === this.sign_old(callback_type, options);
}

function merge_data (callback_type, options) {
    return JSON.stringify({callback_type: callback_type, options: options});
}

module.exports = RainForestAuth;
