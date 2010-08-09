// Copyright 2010, Blagovest Dachev

// This is just a set of hacks to provide the absolute minimum DOM implementation required by sizzle.

var libxml = require('libxmljs'),
    undefined;

exports.createHTMLDocument = createHTMLDocument;


function createHTMLDocument(html) {
    var doc = libxml.parseHtmlString(html);
    
    return new HTMLDocument(doc);
}

function createHTMLFragment(ownerDocument) {
    var doc     = createHTMLDocument('<html><body><div></div></body></html>'),
        element = doc.body.firstChild;
    
    element._n.remove();
    element._n._isFragment = true;
    
    element._d = ownerDocument._d;
    
    var nodes = element.getElementsByTagName('*');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i]._d  = ownerDocument._d;
        nodes[i]._dd = ownerDocument;
    }
    
    return element;
}

function createHTMLElement(e) {
    return e._nn || new HTMLElement(e);
}

function createHTMLElements(nodes) {
    var elements = [];
    
    for (var i = 0; i < (nodes || []).length; i++) {
        elements.push(createHTMLElement(nodes[i]));
    }
    
    return elements;
}

function cloneAndImportNode(document, nodeIn) {
    var attrsIn  = nodeIn.attrs(),
        attrsOut = {},
        nodeName = nodeIn.name();
        
    if (nodeName == 'text') {
        return createTextNode(document, nodeIn.text());
    }
    
    // create an attributes object that can be used by the libxml.Element constructor
    for (var i = 0; i < attrsIn.length; i++) {
        var attrNode = attrsIn[i],
            attrName = attrNode.name(),
            attrVal  = attrNode.value();
        
        attrsOut[attrName] = attrVal;
    }
    
    // create the new element
    var nodeOut  = new libxml.Element(document, nodeName, attrsOut),
        children = nodeIn.childNodes();
    
    // add childrent
    for (var i = 0; i < children.length; i++) {
        var child     = children[i],
            childName = child.name();
            
        if (childName == 'comment') {
            continue;
        }
        
        nodeOut.addChild(cloneAndImportNode(document, child));
    }
    
    return nodeOut;
}

function createTextNode(document, text) {
    var node = new libxml.Element(document, 'span', {}, text).childNodes()[0];
    
    node.remove();
    
    return node;
}




function HTMLDocument(d) {
    d._dd = this;
    
    this._d = d;
    
    this.body = this.getElementsByTagName('body')[0];
    this.documentElement = createHTMLElement(this._d.root());
}
HTMLDocument.prototype.ELEMENT_NODE                  = 1;
HTMLDocument.prototype.ATTRIBUTE_NODE                = 2;
HTMLDocument.prototype.TEXT_NODE                     = 3;
HTMLDocument.prototype.CDATA_SECTION_NODE            = 4;
HTMLDocument.prototype.ENTITY_REFERENCE_NODE         = 5;
HTMLDocument.prototype.ENTITY_NODE                   = 6;
HTMLDocument.prototype.PROCESSING_INSTRUCTION_NODE   = 7;
HTMLDocument.prototype.COMMENT_NODE                  = 8;
HTMLDocument.prototype.DOCUMENT_NODE                 = 9;
HTMLDocument.prototype.DOCUMENT_TYPE_NODE            = 10;
HTMLDocument.prototype.DOCUMENT_FRAGMENT_NODE        = 11;
HTMLDocument.prototype.NOTATION_NODE                 = 12;

HTMLDocument.prototype.DOCUMENT_POSITION_SAME         = 0x00;
HTMLDocument.prototype.DOCUMENT_POSITION_DISCONNECTED = 0x01;
HTMLDocument.prototype.DOCUMENT_POSITION_PRECEDING    = 0x02;
HTMLDocument.prototype.DOCUMENT_POSITION_FOLLOWING    = 0x04;
HTMLDocument.prototype.DOCUMENT_POSITION_CONTAINS     = 0x08;
HTMLDocument.prototype.DOCUMENT_POSITION_CONTAINED_BY = 0x10;

HTMLDocument.prototype.nodeName = '#document';

HTMLDocument.prototype.toString = function() {
    var str = this._d.toString(),
        idx = str.indexOf('>'),
        len = idx < 0 ? 0 : idx+1;
    
    return ['[object: ',']'].join(str.substr(0, len));
}

HTMLDocument.prototype.__defineGetter__('nodeType', function() {
    return this.DOCUMENT_NODE;
});

HTMLDocument.prototype.createElement = function(name) {
    var node = new libxml.Element(this._d, name);
    
    return createHTMLElement(node);
};

HTMLDocument.prototype.createComment = function() {
    //FIXME: libxmljs doesn't provide the means to do this. Also adopting nodes is problematic
    var doc  = libxml.parseHtmlString('<html><body><!-- --></body></html>'),
        body = doc.root().child(0),
        node = body.child(0);
        
    node.remove();
    node._d  = this._d;
    node._dd = this;

    return createHTMLElement(node);
};

HTMLDocument.prototype.createTextNode = function(text) {
    var node = createTextNode(this._d, text);
    
    node._d  = this._d;
    node._dd = this;
    
    return createHTMLElement(node);
}

HTMLDocument.prototype.createDocumentFragment = function() {
    //FIXME: libxmljs doesn't provide the means to do this. Also adopting nodes is problematic
    return createHTMLFragment(this);
}

HTMLDocument.prototype.getElementById = function(id) {
    var nodes = this._d.find("//*[@id='" + id + "']");
    
    return nodes.length > 0 ? createHTMLElement(nodes[0]) : null;
};

HTMLDocument.prototype.getElementsByTagName = function(name) {
    var nodes = this._d.find('//' + name);
    
    return createHTMLElements(nodes);
};








function HTMLElement(node) {
    this._n  = node;
    this._d  = node._d  || (node.doc && node.doc()) || null;
    this._dd = node._dd || (this._d && this._d._dd) || null;
    
    node._nn = this;
    node._d  = this._d;
    node._dd = this._dd;
    
    this.style = {};
}

HTMLElement.prototype.__defineGetter__('textContent', function() {
    return this._n.text();
});

HTMLElement.prototype.__defineGetter__('selected', function() {
    return this.getAttribute('selected') ? true : false;
});

HTMLElement.prototype.__defineSetter__('selected', function() {
    this._n.attr({'checked':val});
});

HTMLElement.prototype.__defineGetter__('checked', function() {
    return this.getAttribute('checked') ? true : false;
});

HTMLElement.prototype.__defineSetter__('checked', function() {
    this._n.attr({'checked':val});
});

HTMLElement.prototype.__defineGetter__('id', function() {
    return this.getAttribute('id') || undefined;
});

HTMLElement.prototype.__defineSetter__('id', function() {
    this._n.attr({'id':val});
});

HTMLElement.prototype.__defineGetter__('className', function() {
    return this.getAttribute('class') || undefined;
});

HTMLElement.prototype.__defineSetter__('className', function(val) {
    this._n.attr({'class':val});
});

HTMLElement.prototype.__defineGetter__('type', function() {
    return this.getAttribute('type') || undefined;
});

HTMLElement.prototype.__defineSetter__('type', function(val) {
    this._n.attr({'type':val});
});

HTMLElement.prototype.__defineGetter__('name', function() {
    return this.getAttribute('name') || undefined;
});

HTMLElement.prototype.__defineSetter__('name', function(val) {
    this._n.attr({'name':val});
});


HTMLElement.prototype.__defineGetter__('nodeType', function() {
    //FIXME: libxmljs doesn't provide the means to do this. This is a hack.
    var name = this.nodeName;
    
    switch (name) {
        case 'TEXT':
            return this.ownerDocument.TEXT_NODE;
            break;
        case 'COMMENT':
            return this.ownerDocument.COMMENT_NODE;
            break;
        case '#DOCUMENT-FRAGMENT':
            return this.ownerDocument.DOCUMENT_FRAGMENT_NODE;
            break;
    }
    
    return this.ownerDocument.ELEMENT_NODE;
});

HTMLElement.prototype.__defineGetter__('nodeName', function() {
    var name = this._n.name();
    
    if (this._n._isFragment) {
        name = '#document-fragment';
    }
    
    return name.toUpperCase();
});

HTMLElement.prototype.__defineGetter__('firstChild', function() {
    var nodes = this._n.childNodes(),
        first = nodes && nodes[0] || null;
    
    return first ? createHTMLElement(first) : null;
});

HTMLElement.prototype.__defineGetter__('lastChild', function() {
    var nodes = this._n.childNodes(),
        last  = nodes && nodes.length && nodes[nodes.length-1] || null;
    
    return last ? createHTMLElement(last) : null;
});

HTMLElement.prototype.__defineGetter__('nextSibling', function() {
    var nodes = this._n.nextSibling();
    
    return nodes ? createHTMLElement(nodes) : null;
});

HTMLElement.prototype.__defineGetter__('previousSibling', function() {
    var nodes = this._n.prevSibling();
    
    return nodes ? createHTMLElement(nodes) : null;
});

HTMLElement.prototype.__defineGetter__('childNodes', function() {
    var nodes = this._n.childNodes();
    
    return createHTMLElements(nodes);
});

HTMLElement.prototype.__defineGetter__('innerHTML', function() {
    var html  = '',
        nodes = this._n.childNodes();
        
    for (var i = 0; i < nodes.length; i++) {
        html += nodes[i].toString();
    }
    
    return html;
});

HTMLElement.prototype.__defineSetter__('innerHTML', function(html) {
    //FIXME: libxmljs doesn't provide the means to do this. Also sucks at adopting nodes
    
    // clear element
    var nodes = this._n.childNodes();
    for (var i = 0; i < nodes.length; i++) {
        nodes[i].remove();
    }
    
    // set new content
    var doc   = libxml.parseHtmlString('<html><body>' + html + '</body></html>'),
        body  = doc.root().child(0),
        nodes = body.childNodes();
    
    for (var i = 0; i < nodes.length; i++) {
        //FIXME: we can't create comment nodes with libxmljs
        if (nodes[i].name() == 'comment') {
            continue;
        }
        
        var node = cloneAndImportNode(this._d, nodes[i]);
        node._d  = this._d;
        node._dd = this._dd;
        
        this._n.addChild(node);
    }
});

HTMLElement.prototype.__defineGetter__('ownerDocument', function() {
    return this._dd;
});

HTMLElement.prototype.__defineGetter__('parentNode', function() {
    var parent = this._n.parent();
    
    if (!parent) { return null; }
    
    return parent == this._n._d ?
        this._n._dd :
        createHTMLElement(parent);
});

HTMLElement.prototype.toString = function() {
    var str = this._n.toString(),
        idx = str.indexOf('>'),
        len = idx < 0 ? 0 : idx+1;
    
    return ['[object: ',']'].join(str.substr(0, len));
}

HTMLElement.prototype.insertBefore = function(newElement, referenceElement) {
    if (newElement._n._isFragment === true) {
        var nodes = newElement._n.childNodes();
        for (var i = 0; i < nodes.length; i++) {
            delete nodes[i].path;
            delete nodes[i].trail;
            referenceElement._n.addPrevSibling(nodes[i]);
        }
    }
    else {
        delete newElement.path;
        delete newElement.trail;
        referenceElement._n.addPrevSibling(newElement._n);
    }
};

HTMLElement.prototype.cloneNode = function(deep) {
    //FIXME: libxmljs doesn't provide the means to do this. Also adopting nodes is problematic
    
    var html = this._n.toString();
    
    // create new content
    var doc   = libxml.parseHtmlString('<html><body>' + html + '</body></html>'),
        body  = doc.root().child(0),
        node  = body.child(0);
        //node  = cloneAndImportNode(this._d, body.child(0));
    
    //console.log(body.child(0).toString());
    //console.log(node.toString());
    //console.log(body.child(0).parent() == this._d);
    //console.log(node.parent() == this._d);
    
    node._d  = this._d;
    node._dd = this._dd;
    
    if (this._n._isFragment) {
        node._isFragment = true;
    }
    
    if (deep !== true) {
        var nodes = node.childNodes();
        for (var i = 0; i < nodes.length; i++) {
            nodes[i].remove();
        }
    }
    
    var nodes = node.find('.//*');
    for (var i = 0; i < nodes.length; i++) {
        nodes[i]._d  = this._d;
        nodes[i]._dd = this._dd;
    }
    
    return createHTMLElement(node);
};

HTMLElement.prototype.appendChild = function(newElement) {
    if (newElement._n._isFragment === true) {
        var nodes = newElement._n._childNodes();
        for (var i = 0; i < nodes.length; i++) {
            delete nodes[i].path;
            delete nodes[i].trail;
            nodes[i]._d  = this._d;
            nodes[i]._dd = this._dd;
            this._n.addChild(nodes[i]);
        }
    }
    else {
        delete newElement.path;
        delete newElement.trail;
        newElement._d  = this._d;
        newElement._dd = this._dd;
        this._n.addChild(newElement._n);
    }
    
    var newestElement = this.lastChild;
    
    return newestElement;
};

HTMLElement.prototype.removeChild = function(child) {
    delete child.path;
    delete child.trail;

    child._n.remove();
    
    return child;
};

HTMLElement.prototype.getElementsByTagName = function(name) {
    var nodes = this._n.find('.//' + name);
    
    return createHTMLElements(nodes);
};

var props = {
    htmlFor     : "for",
    className   : "class",
    readOnly    : 'readonly',
    maxLength   : 'maxlength',
    cellSpacing : 'cellspacing',
    rowSpan     : 'rowspan',
    colSpan     : 'colspan',
    tabIndex    : 'tabindex',
    useMap      : 'usemap',
    frameBorder : 'frameborder'
}

HTMLElement.prototype.getAttribute = function(name) {
    var node = this._n.attr(props[name] || name);
    
    return node ? node.value() : null;
}

HTMLElement.prototype.compareDocumentPosition = function(other) {
    var order = HTMLDocument.prototype;
     
    // cache xpaths
    if (!this._n._path) {
        this._n._path  = this._n.path();
        this._n._trail = this._n._path.split('/');
    }
    if (!other._n._path) {
        other._n._path  = other._n.path();
        other._n._trail = other._n._path.split('/');
    }
        
    // same node
    if (this._n === other._n) {
        return order.DOCUMENT_POSITION_SAME;
    }

    if (this._d !== other._d) {
        return order.DOCUMENT_POSITION_DISCONNECTED;
    }
    
    var tPath  = this._n._path,
        oPath  = other._n._path;
    
    // contains, e.g '/html/head'.compareDocumentPosition('/html')
    if (tPath.indexOf(oPath) == 0) {
        return order.DOCUMENT_POSITION_CONTAINS | order.DOCUMENT_POSITION_PRECEDING;
    }
    // contained by, e.g '/html'.compareDocumentPosition('/html/head')
    if (oPath.indexOf(tPath) == 0) {
        return order.DOCUMENT_POSITION_CONTAINED_BY | order.DOCUMENT_POSITION_FOLLOWING;
    }
    
    var tTrail = this._n._trail,
        oTrail = other._n._trail,
        dTrail = [''],
        idx    = 1;
    
    while (tTrail[idx] && oTrail[idx] && tTrail[idx] === oTrail[idx]) {
        dTrail.push(tTrail[idx++]);
    }
    
    // given '/html/head/style'.compareDocumentPosition('/html/body/div/span')
    var commonAncestor   = this._n.get(dTrail.join('/')),    // /html
        thisAncestor     = commonAncestor.get(tTrail[idx]),  // /html/head
        otherAncestor    = commonAncestor.get(oTrail[idx]),  // /html/body
        ancestorSiblings = commonAncestor.childNodes();      // /html/*
    
    for (var i = 0; i < ancestorSiblings.length; i++) {
        var sibling = ancestorSiblings[i];
        
        if (sibling === thisAncestor) {
            return order.DOCUMENT_POSITION_FOLLOWING;
        }
        if (sibling === otherAncestor) {
            return order.DOCUMENT_POSITION_PRECEDING;
        }
    }
    
    throw 'Not possible?';
}











