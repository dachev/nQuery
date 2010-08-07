node-sizzle
=====================================
A [node.js](http://github.com/ry/node) plugin that brings [sizzle](http://github.com/jeresig/sizzle) and [libxmljs](http://github.com/polotek/libxmljs) together. Currently it passes all relevant sizzle tests when used with an HTML document.

## Requirements
- Node v0.1.102+
- libxmljs v0.4.0+

## How to test
To run the tests, go to the project's root directory and run
    node test.js

## Demo
To run the tests, go to the `example` directory and run
    node web.js

## How to use
    var http     = require('http'),
        fs       = require('fs'),
        inherits = require('sys').inherits,
        dominiq  = require('../lib/dominiq'),
        sizzFact = require('../lib/sizzle');

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
    
        var doc      = dominiq.createHTMLDocument(html),
            window   = {document:doc},
            sizzle   = sizzFact.sizzleInit(window),
            divs     = sizzle('div');
    
        for (var i = 0; i < divs.length; i++) {
            console.log(divs[i]);
        }
    });