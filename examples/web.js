#!/usr/bin/env node

var http     = require('http');
var events   = require('events');
var inherits = require('sys').inherits;
var nquery   = require('../lib/nquery');

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


