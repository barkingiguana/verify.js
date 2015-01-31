# verify.js

Node.js port of https://github.com/barkingiguana/verify

I got fed up of people tellingme they couldn't use time based signed
actions because there was no client library for Node.js.

I'm sure there are lots of valid criticisms for the approach I've taken in
`BarkingIguana::Verify`. I'd like to hear *those* and not whining about
lack of suitable clients libraries.

## Installing

```
npm install barkingiguana-verify
```

## Usage

```javascript
verify  = require('barkingiguana-verify');

baseUrl = 'http://example.com';
username = 'craigw';
password = '123456-1234-1234-123456';
intent = verify.expressIntent('DELETE', '/resource/123', { confirm: true });
intentExpiry = new Date();
intentExpiry.setTime(1422724138000);
action = intent.sign(username, password, intentExpiry);
url = baseUrl + action.getSignedPath();

// Now make the request to that URL.
require('request')({ uri: url, method: "DELETE" }, function(error, response, body) {
  console.log("Performed action")
})
```
