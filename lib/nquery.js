var Dominiq  = require('./dominiq');
var Sizzle   = require('./sizzle');
var jQuery   = require('./jqresque');

exports.createHtmlDocument = function(html) {
    var doc      = Dominiq.createHTMLDocument(html);
    var window   = {document:doc};
    var sizzle   = Sizzle.init(window);
    var $        = jQuery.init(window);
    
    $.find      = sizzle;
    $.expr      = sizzle.selectors;
    $.expr[":"] = $.expr.filters;
    $.unique    = sizzle.uniqueSort;
    $.text      = sizzle.getText;
    $.isXMLDoc  = sizzle.isXML;
    $.contains  = sizzle.contains;
    $.window    = window;
    
    return $;
};