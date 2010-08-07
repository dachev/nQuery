#!/usr/bin/env node

var http     = require('http'),
    fs       = require('fs'),
    events   = require('events'),
    inherits = require('sys').inherits,
    dominiq  = require('./dominiq'),
    sizzle   = require('./sizzle');

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

function FileClient(path) {
    var self = this;
    
    fs.readFile(path, 'utf8', function (err, html) {
        if (err) {
            self.emit('done', err, '');
        }
        else {
            self.emit('done', 200, html);
        }
    });
}
inherits(FileClient, events.EventEmitter); 



var client = new FileClient('/Users/blago/Desktop/nquery/test/fixtures/index.html');
client.on('done', function(status, html) {
    if (status != 200) {
        throw 'unable to download page';
    }

    var window   = {};
        document = dominiq.createHTMLDocument(html),
        selector = sizzle.sizzleInit(window, document),
        nodes    = selector('*');
    
    var good = true;
    for (var i = 0; i < nodes.length; i++)
		if (nodes[i].nodeType == 8)
			good = false;
    
    console.dir(good);
    //var doc = dominiq.createHTMLDocument('<html><body><![CDATA[ ]]>></body></html>');
    //console.dir(doc.body.firstChild.nodeName);
});
 






