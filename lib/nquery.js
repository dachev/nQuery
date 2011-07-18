var dominiq = require('./dominiq');
var sizzle  = require('./sizzle');

exports.createHtmlDocument = function(html) {
    var doc    = dominiq.createHTMLDocument(html);
    var window = {document:doc};
    
    return sizzle.init(window);
};