function Intent(verb, path, parameters) {
  this.verb = verb;
  this.path = path;
  this.parameters = parameters;

  this.getQueryString = function getQueryString() {
    var keys = [];
    for(var k in parameters) {
      if(parameters.hasOwnProperty(k)) {
        keys.push(k);
      }
    }
    if(keys.length == 0) {
      return '';
    }
    keys.sort();
    var components = [];
    for(var i = 0; i < keys.length; i++) {
      var key = keys[i];
      components.push(key + "=" + parameters[key]);
    }
    return '?' + components.join('&');
  }

  this.getPath = function getPath() {
    return path + this.getQueryString();
  }

  this.sign = function sign(key, secret, expiresAt) {
    signature = new Signature(key, this, secret, expiresAt);
    return new SignedAction(this, signature);
  }

  this.toString = function toString() {
    return this.verb + ' ' + this.getPath();
  }
}

function Signature(key, intent, secret, expiresAt) {
  this.crypto = require('crypto');
  this.SEPARATOR = '--';
  this.DIGEST = 'sha256';

  this.key = key;
  this.intent = intent;
  this.secret = secret;
  this.expiresAt = expiresAt;

  this.toString = function toString() {
    var signedAt = Math.floor((new Date()).getTime() / 1000).toString();
    var expiresAt = Math.floor(this.expiresAt.getTime() / 1000).toString();
    var string = this.key + expiresAt + signedAt + intent.toString();
    var hmac = crypto.createHmac(this.DIGEST, this.secret, true);
    hmac.update(string);
    var token = hmac.digest('hex');
    var encodedToken = (new Buffer(token).toString('base64')).replace(/\n/, '');
    var params = [ encodedToken, this.key, expiresAt, signedAt ].join(this.SEPARATOR);
    return (new Buffer(params)).toString('base64').replace(/\n/, '');
  }
}

function SignedAction(intent, signature) {
  this.PARAMETER_SIGNATURE = 'verify_signature';
  this.PARAMETER_PUBLIC_KEY = 'verify_public_key';

  this.intent = intent;
  this.signature = signature;

  this.getSignedPath = function getSignedPath() {
    var path = intent.getPath();
    var sig = this.PARAMETER_SIGNATURE + '=' + signature.toString();
    var key = this.PARAMETER_PUBLIC_KEY + '=' + signature.key;
    var qs = sig + '&' + key;
    if(path.indexOf('?') >= 0) {
      return path + '&' + qs;
    } else {
      return path + '?' + qs;
    }
  }
}

module.exports = {
  expressIntent: function(verb, path, parameters) {
    return new Intent(verb, path, parameters);
  },
}
