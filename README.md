# rainforest-auth
Allows verification of [Rainforest](https://www.rainforestqa.com/) webhook signed messages using your private API key, and advanced (aka long-initializing) webhooks with a callback URL. For more information on webhooks, see the [Rainforest docs here](https://help.rainforestqa.com/developer-tools/integrations/webhooks).

This is a port of the offical Ruby Gem at https://github.com/rainforestapp/auth

## Installation

```bash
npm install rainforest-auth --save
```

## Usage

This assumes the context is within an express app.

```javascript
var http = require('http');
var RFA = require('rainforest-auth');
var auth = new RFA('YOUR_KEY_HERE');

app.post('/webhooks/rainforest', function (req, res, next) {
    if (req.body.callback_type != 'before_run') {
        return res.send(200);
    }

    if (!auth.verify(req.body.digest, req.body.callback_type, req.body.options)) {
        return res.send(403);
    }
    
    // Send our response right away, then continue on...
    res.send(202);

    var callback_url = auth.get_run_callback(req.body.run_id, req.body.callback_type);
    do_some_slow_initialization(function (err) {
        if (err) {
            // handle error
        }
        else {
            // Note the ruby example code suggests trying this up to 5 times
            // so you might want to use async.doWhilst() for that.
            http.request(callback_url, function (res) {
                // most of this is not required - just here for logging
                console.log('RAINFOREST STATUS: ' + res.statusCode);
                console.log('RAINFOREST HEADERS: ' + JSON.stringify(res.headers));
                res.setEncoding('utf8');
                res.on('data', function (chunk) {
                  console.log('RAINFOREST BODY: ' + chunk);
                });
            })
        }
    });    
})
```
