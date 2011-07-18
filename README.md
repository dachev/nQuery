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
make test
```

## Demo
To run the demo, go to the `examples` directory and run

``` bash
node web.js
```

## How to use

``` javascript
var nquery = require('nquery');
var html   = '<html><head></head><body><div id="test" class="test">google</div></body></html>';
var $      = nquery.createHtmlDocument(html);
var $divs  = $('div.test');

for (var i = 0; i < $divs.length; i++) {
    console.log($divs[i].toString());
}
```
