nQuery
=====================================
A [node.js](http://github.com/ry/node) plugin that brings [sizzle](http://github.com/jeresig/sizzle) and [libxmljs](http://github.com/polotek/libxmljs) together. Currently it passes all relevant sizzle tests when used with an HTML document.

## Requirements
- Node v0.1.102+
- libxmljs v0.4.0+

## How to install

    npm install nquery

## How to test
To run the tests, go to the project's root directory and run
``` bash
    node test.js
```

## Demo
To run the demo, go to the `examples` directory and run
``` bash
    node web.js
```

## How to use

``` javascript
var http     = require('http');
var events   = require('events');
var inherits = require('sys').inherits;
var nquery   = require('nquery');

function WebClient(host, path) {
    var self       = this,
        transport  = http.createClient(80, host),
        request    = transport.request('GET', path, {'host': host});

    request.end();

    request.on('response', function (response) {
        if (response.statusCode != 200) {
            self.emit('done', response.statusCode, '');
        }
        else {
            var html = '';

            response.setEncoding('utf8');
            response.on('data', function (chunk) {
                html += chunk;
            });
            response.on('end', function (chunk) {
                self.emit('done', 200, html);
            });
        }
    });
}
inherits(WebClient, events.EventEmitter);

var client = new WebClient('www.yahoo.com', '/');
client.on('done', function(status, html) {
    if (status != 200) {
        throw 'unable to download page';
    }

    var doc  = nquery.createHtmlDocument(html);
    var divs = doc('div');

    for (var i = 0; i < divs.length; i++) {
        console.log(divs[i].toString());
    }
});
```
