// Copyright 2010, Blagovest Dachev

// A very minimal subset of jQuery for the purpose of testing sizzle.

exports.init = function(window) {
    var jQuery = function(selector, context) {
		// The jQuery object is actually just the init constructor 'enhanced'
		return new jQuery.fn.init(selector, context);
	},

	// Use the correct document accordingly with window argument (sandbox)
	document = window.document,

	// A central reference to the root jQuery(document)
	rootjQuery,

	// A simple way to check for HTML strings or ID strings
	// (both of which we optimize for)
	quickExpr = /^[^<]*(<[\w\W]+>)[^>]*$|^#([\w-]+)$/,

	// Is it a simple selector
	isSimple = /^.[^:#\[\.,]*$/,

	// Check if a string has a non-whitespace character in it
	rnotwhite = /\S/,

	// Used for trimming whitespace
	rtrim = /^(\s|\u00A0)+|(\s|\u00A0)+$/g,

	// Match a standalone tag
	rsingleTag = /^<(\w+)\s*\/?>(?:<\/\1>)?$/,

	// Save a reference to some core methods
	toString = Object.prototype.toString,
	hasOwnProperty = Object.prototype.hasOwnProperty,
	push = Array.prototype.push,
	slice = Array.prototype.slice,
	indexOf = Array.prototype.indexOf;
	
	
    jQuery.fn = jQuery.prototype = {
        init: function(selector, context) {
            var match, elem, ret, doc;
    
            // Handle $(""), $(null), or $(undefined)
            if ( !selector ) {
                return this;
            }
    
            // Handle $(DOMElement)
            if ( selector.nodeType ) {
                this.context = this[0] = selector;
                this.length = 1;
                return this;
            }
    
            // Handle HTML strings
            if ( typeof selector === "string" ) {
                // Are we dealing with HTML string or an ID?
                match = quickExpr.exec( selector );
    
                // Verify a match, and that no context was specified for #id
                if ( match && (match[1] || !context) ) {
    
                    // HANDLE: $(html) -> $(array)
                    if ( match[1] ) {
                        doc = (context ? context.ownerDocument || context : document);
    
                        // If a single string is passed in and it's a single tag
                        // just do a createElement and skip the rest
                        ret = rsingleTag.exec( selector );
    
                        if ( ret ) {
                            if ( jQuery.isPlainObject( context ) ) {
                                selector = [ document.createElement( ret[1] ) ];
                                jQuery.fn.attr.call( selector, context, true );
    
                            } else {
                                selector = [ doc.createElement( ret[1] ) ];
                            }
    
                        } else {
                            ret = buildFragment( [ match[1] ], [ doc ] );
                            selector = (ret.cacheable ? ret.fragment.cloneNode(true) : ret.fragment).childNodes;
                        }
                        
                        return jQuery.merge( this, selector );
                    
                    // HANDLE: $("#id")
                    } else {
                        elem = document.getElementById( match[2] );
    
                        if ( elem ) {
                            // Otherwise, we inject the element directly into the jQuery object
                            this.length = 1;
                            this[0] = elem;
                        }
    
                        this.context = document;
                        this.selector = selector;
                        return this;
                    }
    
                // HANDLE: $("TAG")
                } else if ( !context && /^\w+$/.test( selector ) ) {
                    this.selector = selector;
                    this.context = document;
                    selector = document.getElementsByTagName( selector );
    
                // HANDLE: $(expr, $(...))
                } else if ( !context || context.jquery ) {
                    return (context || rootjQuery).find( selector );
    
                // HANDLE: $(expr, context)
                // (which is just equivalent to: $(context).find(expr)
                } else {
                    return jQuery( context ).find( selector );
                }
    
            // HANDLE: $(function)
            // Shortcut for document ready
            }
    
            if (selector.selector !== undefined) {
                this.selector = selector.selector;
                this.context = selector.context;
            }
    
            return jQuery.isArray( selector ) ?
                this.setArray( selector ) :
                jQuery.makeArray( selector, this );
        },
    
        // Start with an empty selector
        selector: "",
    
        // The current version of jQuery being used
        jquery: "1.4b1pre",
    
        // The default length of a jQuery object is 0
        length: 0,
    
        // The number of elements contained in the matched element set
        size: function() {
            return this.length;
        },
    
        toArray: function(){
            return slice.call( this, 0 );
        },
    
        // Get the Nth element in the matched element set OR
        // Get the whole matched element set as a clean array
        get: function( num ) {
            return num == null ?
    
                // Return a 'clean' array
                this.toArray() :
    
                // Return just the object
                ( num < 0 ? this.slice(num)[ 0 ] : this[ num ] );
        },
    
        // Take an array of elements and push it onto the stack
        // (returning the new matched element set)
        pushStack: function( elems, name, selector ) {
            // Build a new jQuery matched element set
            var ret = jQuery( elems || null );
    
            // Add the old object onto the stack (as a reference)
            ret.prevObject = this;
    
            ret.context = this.context;
    
            if ( name === "find" ) {
                ret.selector = this.selector + (this.selector ? " " : "") + selector;
            } else if ( name ) {
                ret.selector = this.selector + "." + name + "(" + selector + ")";
            }
    
            // Return the newly-formed element set
            return ret;
        },
    
        // Force the current matched set of elements to become
        // the specified array of elements (destroying the stack in the process)
        // You should use pushStack() in order to do this, but maintain the stack
        setArray: function( elems ) {
            // Resetting the length to 0, then using the native Array push
            // is a super-fast way to populate an object with array-like properties
            this.length = 0;
            push.apply( this, elems );
    
            return this;
        },
    
        // Execute a callback for every element in the matched set.
        // (You can seed the arguments with an array of args, but this is
        // only used internally.)
        each: function( callback, args ) {
            return jQuery.each( this, callback, args );
        },
        
        eq: function( i ) {
            return i === -1 ?
                this.slice( i ) :
                this.slice( i, +i + 1 );
        },
    
        first: function() {
            return this.eq( 0 );
        },
    
        last: function() {
            return this.eq( -1 );
        },
    
        slice: function() {
            return this.pushStack( slice.apply( this, arguments ),
                "slice", slice.call(arguments).join(",") );
        },
    
        map: function( callback ) {
            return this.pushStack( jQuery.map(this, function(elem, i){
                return callback.call( elem, i, elem );
            }));
        },
        
        end: function() {
            return this.prevObject || jQuery(null);
        },
    
        // For internal use only.
        // Behaves like an Array's method, not like a jQuery method.
        push: push,
        sort: [].sort,
        splice: [].splice
    };
    
    // Give the init function the jQuery prototype for later instantiation
    jQuery.fn.init.prototype = jQuery.fn;

    jQuery.extend = jQuery.fn.extend = function() {
        // copy reference to target object
        var target = arguments[0] || {}, i = 1, length = arguments.length, deep = false, options, name, src, copy;
    
        // Handle a deep copy situation
        if ( typeof target === "boolean" ) {
            deep = target;
            target = arguments[1] || {};
            // skip the boolean and the target
            i = 2;
        }
    
        // Handle case when target is a string or something (possible in deep copy)
        if ( typeof target !== "object" && !jQuery.isFunction(target) ) {
            target = {};
        }
    
        // extend jQuery itself if only one argument is passed
        if ( length === i ) {
            target = this;
            --i;
        }
        
        for ( ; i < length; i++ ) {
            // Only deal with non-null/undefined values
            if ( (options = arguments[ i ]) != null ) {
                // Extend the base object
                for ( name in options ) {
                    src = target[ name ];
                    copy = options[ name ];
    
                    // Prevent never-ending loop
                    if ( target === copy ) {
                        continue;
                    }
    
                    // Recurse if we're merging object literal values
                    if ( deep && copy && jQuery.isPlainObject(copy) ) {
                        // Don't extend not object literals
                        var clone = src && jQuery.isPlainObject(src) ? src : {};
    
                        // Never move original objects, clone them
                        target[ name ] = jQuery.extend( deep, clone, copy );
    
                    // Don't bring in undefined values
                    } else if ( copy !== undefined ) {
                        target[ name ] = copy;
                    }
                }
            }
        }
        
        // Return the modified object
        return target;
    };
    
    jQuery.extend({
        // See test/unit/core.js for details concerning isFunction.
        // Since version 1.3, DOM methods and functions like alert
        // aren't supported. They return false on IE (#2968).
        isFunction: function( obj ) {
            return toString.call(obj) === "[object Function]";
        },
    
        isArray: function( obj ) {
            return toString.call(obj) === "[object Array]";
        },
    
        isPlainObject: function( obj ) {
            // Must be an Object.
            // Because of IE, we also have to check the presence of the constructor property.
            // Make sure that DOM nodes and window objects don't pass through, as well
            if ( !obj || toString.call(obj) !== "[object Object]" || obj.nodeType || obj.setInterval ) {
                return false;
            }
            
            // Not own constructor property must be Object
            if ( obj.constructor
                && !hasOwnProperty.call(obj, "constructor")
                && !hasOwnProperty.call(obj.constructor.prototype, "isPrototypeOf") ) {
                return false;
            }
            
            // Own properties are enumerated firstly, so to speed up,
            // if last one is own, then all properties are own.
        
            var key;
            for ( key in obj ) {}
            
            return key === undefined || hasOwnProperty.call( obj, key );
        },
    
        isEmptyObject: function( obj ) {
            for ( var name in obj ) {
                return false;
            }
            return true;
        },
    
        nodeName: function( elem, name ) {
            return elem.nodeName && elem.nodeName.toUpperCase() === name.toUpperCase();
        },
    
        // args is for internal usage only
        each: function( object, callback, args ) {
            var name, i = 0,
                length = object.length,
                isObj = length === undefined || jQuery.isFunction(object);
    
            if ( args ) {
                if ( isObj ) {
                    for ( name in object ) {
                        if ( callback.apply( object[ name ], args ) === false ) {
                            break;
                        }
                    }
                } else {
                    for ( ; i < length; ) {
                        if ( callback.apply( object[ i++ ], args ) === false ) {
                            break;
                        }
                    }
                }
    
            // A special, fast, case for the most common use of each
            } else {
                if ( isObj ) {
                    for ( name in object ) {
                        if ( callback.call( object[ name ], name, object[ name ] ) === false ) {
                            break;
                        }
                    }
                } else {
                    for ( var value = object[0];
                        i < length && callback.call( value, i, value ) !== false; value = object[++i] ) {}
                }
            }
    
            return object;
        },
    
        trim: function( text ) {
            return (text || "").replace( rtrim, "" );
        },
    
        // results is for internal usage only
        makeArray: function( array, results ) {
            var ret = results || [];
    
            if ( array != null ) {
                // The window, strings (and functions) also have 'length'
                // The extra typeof function check is to prevent crashes
                // in Safari 2 (See: #3039)
                if ( array.length == null || typeof array === "string" || jQuery.isFunction(array) || (typeof array !== "function" && array.setInterval) ) {
                    push.call( ret, array );
                } else {
                    jQuery.merge( ret, array );
                }
            }
    
            return ret;
        },
    
        inArray: function( elem, array ) {
            if ( array.indexOf ) {
                return array.indexOf( elem );
            }
    
            for ( var i = 0, length = array.length; i < length; i++ ) {
                if ( array[ i ] === elem ) {
                    return i;
                }
            }
    
            return -1;
        },
    
        merge: function( first, second ) {
            var i = first.length, j = 0;
    
            if ( typeof second.length === "number" ) {
                for ( var l = second.length; j < l; j++ ) {
                    first[ i++ ] = second[ j ];
                }
            } else {
                while ( second[j] !== undefined ) {
                    first[ i++ ] = second[ j++ ];
                }
            }
    
            first.length = i;
    
            return first;
        },
    
        grep: function( elems, callback, inv ) {
            var ret = [];
    
            // Go through the array, only saving the items
            // that pass the validator function
            for ( var i = 0, length = elems.length; i < length; i++ ) {
                if ( !inv !== !callback( elems[ i ], i ) ) {
                    ret.push( elems[ i ] );
                }
            }
    
            return ret;
        },
    
        // arg is for internal usage only
        map: function( elems, callback, arg ) {
            var ret = [], value;
    
            // Go through the array, translating each of the items to their
            // new value (or values).
            for ( var i = 0, length = elems.length; i < length; i++ ) {
                value = callback( elems[ i ], i, arg );
    
                if ( value != null ) {
                    ret[ ret.length ] = value;
                }
            }
    
            return ret.concat.apply( [], ret );
        }
    });
    
    if ( indexOf ) {
        jQuery.inArray = function( elem, array ) {
            return indexOf.call( array, elem );
        };
    }
    
    rootjQuery = jQuery(document);
    
    // Mutifunctional method to get and set values to a collection
    // The value/s can be optionally by executed if its a function
    function access( elems, key, value, exec, fn, pass ) {
        var length = elems.length;
        
        // Setting many attributes
        if ( typeof key === "object" ) {
            for ( var k in key ) {
                access( elems, k, key[k], exec, fn, value );
            }
            return elems;
        }
        
        // Setting one attribute
        if ( value !== undefined ) {
            // Optionally, function values get executed if exec is true
            exec = !pass && exec && jQuery.isFunction(value);
            
            for ( var i = 0; i < length; i++ ) {
                fn( elems[i], key, exec ? value.call( elems[i], i, fn( elems[i], key ) ) : value, pass );
            }
            
            return elems;
        }
        
        // Getting an attribute
        return length ? fn( elems[0], key ) : null;
    }
    
    function now() {
        return (new Date).getTime();
    }
    
    // support
    (function() {
        jQuery.support = {};
    
        var root = document.documentElement,
            script = document.createElement("script"),
            div = document.createElement("div"),
            id = "script" + now();
    
        div.style.display = "none";
        div.innerHTML = "   <link/><table></table><a href='/a' style='color:red;float:left;opacity:.55;'>a</a><input type='checkbox'/>";
    
        var all = div.getElementsByTagName("*"),
            a = div.getElementsByTagName("a")[0];
    
        // Can't get basic test support
        if ( !all || !all.length || !a ) {
            return;
        }
    
        jQuery.support = {
            // IE strips leading whitespace when .innerHTML is used
            leadingWhitespace: div.firstChild.nodeType === 3,
    
            // Make sure that tbody elements aren't automatically inserted
            // IE will insert them into empty tables
            tbody: !div.getElementsByTagName("tbody").length,
    
            // Make sure that link elements get serialized correctly by innerHTML
            // This requires a wrapper element in IE
            htmlSerialize: !!div.getElementsByTagName("link").length,
    
            // Get the style information from getAttribute
            // (IE uses .cssText insted)
            style: /red/.test( a.getAttribute("style") ),
    
            // Make sure that URLs aren't manipulated
            // (IE normalizes it by default)
            hrefNormalized: a.getAttribute("href") === "/a",
    
            // Make sure that element opacity exists
            // (IE uses filter instead)
            // Use a regex to work around a WebKit issue. See #5145
            opacity: /^0.55$/.test( a.style.opacity ),
    
            // Verify style float existence
            // (IE uses styleFloat instead of cssFloat)
            cssFloat: !!a.style.cssFloat,
    
            // Make sure that if no value is specified for a checkbox
            // that it defaults to "on".
            // (WebKit defaults to "" instead)
            checkOn: div.getElementsByTagName("input")[0].value === "on",
    
            // Make sure that a selected-by-default option has a working selected property.
            // (WebKit defaults to false instead of true, IE too, if it's in an optgroup)
            optSelected: document.createElement("select").appendChild( document.createElement("option") ).selected,
    
            parentNode: div.removeChild( div.appendChild( document.createElement("div") ) ).parentNode === null,
    
            // Will be defined later
            deleteExpando: true,
            checkClone: false,
            scriptEval: false,
            noCloneEvent: true,
            boxModel: null
        };
    
        script.type = "text/javascript";
        try {
            script.appendChild( document.createTextNode( "window." + id + "=1;" ) );
        } catch(e) {}
    
        root.insertBefore( script, root.firstChild );
    
        // Make sure that the execution of code works by injecting a script
        // tag with appendChild/createTextNode
        // (IE doesn't support this, fails, and uses .text instead)
        if ( window[ id ] ) {
            jQuery.support.scriptEval = true;
            delete window[ id ];
        }
    
        // Test to see if it's possible to delete an expando from an element
        // Fails in Internet Explorer
        try {
            delete script.test;
        
        } catch(e) {
            jQuery.support.deleteExpando = false;
        }
    
        root.removeChild( script );
        
        jQuery.support.noCloneEvent = false;
    
        div = document.createElement("div");
        div.innerHTML = "<input type='radio' name='radiotest' checked='checked'/>";
    
        var fragment = document.createDocumentFragment();
        fragment.appendChild( div.firstChild );
    
        // WebKit doesn't clone checked state correctly in fragments
        jQuery.support.checkClone = fragment.cloneNode(true).cloneNode(true).lastChild.checked;
        jQuery.boxModel = jQuery.support.boxMode = false;
        jQuery.support.submitBubbles = false;
        jQuery.support.changeBubbles = false;
    
        // release memory in IE
        root = script = div = all = a = null;
    })();
    
    
    var rclass = /[\n\t]/g,
        rspace = /\s+/,
        rreturn = /\r/g,
        rspecialurl = /href|src|style/,
        rtype = /(button|input)/i,
        rfocusable = /(button|input|object|select|textarea)/i,
        rclickable = /^(a|area)$/i,
        rradiocheck = /radio|checkbox/;
    
    jQuery.fn.extend({
        attr: function( name, value ) {
            return access( this, name, value, true, jQuery.attr );
        },
    
        removeAttr: function( name, fn ) {
            return this.each(function(){
                jQuery.attr( this, name, "" );
                if ( this.nodeType === 1 ) {
                    this.removeAttribute( name );
                }
            });
        },
    
        addClass: function( value ) {
            if ( jQuery.isFunction(value) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.addClass( value.call(this, i, self.attr("class")) );
                });
            }
    
            if ( value && typeof value === "string" ) {
                var classNames = (value || "").split( rspace );
    
                for ( var i = 0, l = this.length; i < l; i++ ) {
                    var elem = this[i];
    
                    if ( elem.nodeType === 1 ) {
                        if ( !elem.className ) {
                            elem.className = value;
    
                        } else {
                            var className = " " + elem.className + " ";
                            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                                if ( className.indexOf( " " + classNames[c] + " " ) < 0 ) {
                                    elem.className += " " + classNames[c];
                                }
                            }
                        }
                    }
                }
            }
    
            return this;
        },
    
        removeClass: function( value ) {
            if ( jQuery.isFunction(value) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.removeClass( value.call(this, i, self.attr("class")) );
                });
            }
    
            if ( (value && typeof value === "string") || value === undefined ) {
                var classNames = (value || "").split(rspace);
    
                for ( var i = 0, l = this.length; i < l; i++ ) {
                    var elem = this[i];
    
                    if ( elem.nodeType === 1 && elem.className ) {
                        if ( value ) {
                            var className = (" " + elem.className + " ").replace(rclass, " ");
                            for ( var c = 0, cl = classNames.length; c < cl; c++ ) {
                                className = className.replace(" " + classNames[c] + " ", " ");
                            }
                            elem.className = className.substring(1, className.length - 1);
    
                        } else {
                            elem.className = "";
                        }
                    }
                }
            }
    
            return this;
        },
    
        toggleClass: function( value, stateVal ) {
            var type = typeof value, isBool = typeof stateVal === "boolean";
    
            if ( jQuery.isFunction( value ) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.toggleClass( value.call(this, i, self.attr("class"), stateVal), stateVal );
                });
            }
    
            return this.each(function() {
                if ( type === "string" ) {
                    // toggle individual class names
                    var className, i = 0, self = jQuery(this),
                        state = stateVal,
                        classNames = value.split( rspace );
    
                    while ( (className = classNames[ i++ ]) ) {
                        // check each className given, space seperated list
                        state = isBool ? state : !self.hasClass( className );
                        self[ state ? "addClass" : "removeClass" ]( className );
                    }
    
                } else if ( type === "undefined" || type === "boolean" ) {
                    if ( this.className ) {
                        // store className if set
                        jQuery.data( this, "__className__", this.className );
                    }
    
                    // toggle whole className
                    this.className = this.className || value === false ? "" : jQuery.data( this, "__className__" ) || "";
                }
            });
        },
    
        hasClass: function( selector ) {
            var className = " " + selector + " ";
            for ( var i = 0, l = this.length; i < l; i++ ) {
                if ( (" " + this[i].className + " ").replace(rclass, " ").indexOf( className ) > -1 ) {
                    return true;
                }
            }
    
            return false;
        },
    
        val: function( value ) {
            if ( value === undefined ) {
                var elem = this[0];
    
                if ( elem ) {
                    if ( jQuery.nodeName( elem, "option" ) ) {
                        return (elem.attributes.value || {}).specified ? elem.value : elem.text;
                    }
    
                    // We need to handle select boxes special
                    if ( jQuery.nodeName( elem, "select" ) ) {
                        var index = elem.selectedIndex,
                            values = [],
                            options = elem.options,
                            one = elem.type === "select-one";
    
                        // Nothing was selected
                        if ( index < 0 ) {
                            return null;
                        }
    
                        // Loop through all the selected options
                        for ( var i = one ? index : 0, max = one ? index + 1 : options.length; i < max; i++ ) {
                            var option = options[ i ];
    
                            if ( option.selected ) {
                                // Get the specifc value for the option
                                value = jQuery(option).val();
    
                                // We don't need an array for one selects
                                if ( one ) {
                                    return value;
                                }
    
                                // Multi-Selects return an array
                                values.push( value );
                            }
                        }
    
                        return values;
                    }
    
                    // Handle the case where in Webkit "" is returned instead of "on" if a value isn't specified
                    if ( rradiocheck.test( elem.type ) && !jQuery.support.checkOn ) {
                        return elem.getAttribute("value") === null ? "on" : elem.value;
                    }
                    
    
                    // Everything else, we just grab the value
                    return (elem.value || "").replace(rreturn, "");
    
                }
    
                return undefined;
            }
    
            var isFunction = jQuery.isFunction(value);
    
            return this.each(function(i) {
                var self = jQuery(this), val = value;
    
                if ( this.nodeType !== 1 ) {
                    return;
                }
    
                if ( isFunction ) {
                    val = value.call(this, i, self.val());
                }
    
                // Typecast each time if the value is a Function and the appended
                // value is therefore different each time.
                if ( typeof val === "number" ) {
                    val += "";
                }
    
                if ( jQuery.isArray(val) && rradiocheck.test( this.type ) ) {
                    this.checked = jQuery.inArray( self.val(), val ) >= 0;
    
                } else if ( jQuery.nodeName( this, "select" ) ) {
                    var values = jQuery.makeArray(val);
    
                    jQuery( "option", this ).each(function() {
                        this.selected = jQuery.inArray( jQuery(this).val(), values ) >= 0;
                    });
    
                    if ( !values.length ) {
                        this.selectedIndex = -1;
                    }
    
                } else {
                    this.value = val;
                }
            });
        }
    });
    
    jQuery.extend({
        attrFn: {
            val: true,
            css: true,
            html: true,
            text: true,
            data: true,
            width: true,
            height: true,
            offset: true
        },
            
        attr: function( elem, name, value, pass ) {
            // don't set attributes on text and comment nodes
            if ( !elem || elem.nodeType === 3 || elem.nodeType === 8 ) {
                return undefined;
            }
    
            if ( pass && name in jQuery.attrFn ) {
                return jQuery(elem)[name](value);
            }
    
            var notxml = elem.nodeType !== 1 || !jQuery.isXMLDoc( elem ),
                // Whether we are setting (or getting)
                set = value !== undefined;
    
            // Try to normalize/fix the name
            name = notxml && jQuery.props[ name ] || name;
    
            // Only do all the following if this is a node (faster for style)
            if ( elem.nodeType === 1 ) {
                // These attributes require special treatment
                var special = rspecialurl.test( name );
    
                // Safari mis-reports the default selected property of an option
                // Accessing the parent's selectedIndex property fixes it
                if ( name === "selected" && !jQuery.support.optSelected ) {
                    var parent = elem.parentNode;
                    if ( parent ) {
                        parent.selectedIndex;
        
                        // Make sure that it also works with optgroups, see #5701
                        if ( parent.parentNode ) {
                            parent.parentNode.selectedIndex;
                        }
                    }
                }
    
                // If applicable, access the attribute via the DOM 0 way
                if ( name in elem && notxml && !special ) {
                    if ( set ) {
                        // We can't allow the type property to be changed (since it causes problems in IE)
                        if ( name === "type" && rtype.test( elem.nodeName ) && elem.parentNode ) {
                            throw "type property can't be changed";
                        }
    
                        elem[ name ] = value;
                    }
    
                    // browsers index elements by id/name on forms, give priority to attributes.
                    if ( jQuery.nodeName( elem, "form" ) && elem.getAttributeNode(name) ) {
                        return elem.getAttributeNode( name ).nodeValue;
                    }
    
                    // elem.tabIndex doesn't always return the correct value when it hasn't been explicitly set
                    // http://fluidproject.org/blog/2008/01/09/getting-setting-and-removing-tabindex-values-with-javascript/
                    if ( name === "tabIndex" ) {
                        var attributeNode = elem.getAttributeNode( "tabIndex" );
    
                        return attributeNode && attributeNode.specified ?
                            attributeNode.value :
                            rfocusable.test( elem.nodeName ) || rclickable.test( elem.nodeName ) && elem.href ?
                                0 :
                                undefined;
                    }
    
                    return elem[ name ];
                }
    
                if ( !jQuery.support.style && notxml && name === "style" ) {
                    if ( set ) {
                        elem.style.cssText = "" + value;
                    }
    
                    return elem.style.cssText;
                }
    
                if ( set ) {
                    // convert the value to a string (all browsers do this but IE) see #1070
                    elem.setAttribute( name, "" + value );
                }
    
                var attr = !jQuery.support.hrefNormalized && notxml && special ?
                        // Some attributes require a special call on IE
                        elem.getAttribute( name, 2 ) :
                        elem.getAttribute( name );
    
                // Non-existent attributes return null, we normalize to undefined
                return attr === null ? undefined : attr;
            }
    
            // elem is actually elem.style ... set the style
            // Using attr for specific style information is now deprecated. Use style insead.
            return jQuery.style( elem, name, value );
        }
    });
    
    jQuery.props = {
        "for": "htmlFor",
        "class": "className",
        readonly: "readOnly",
        maxlength: "maxLength",
        cellspacing: "cellSpacing",
        rowspan: "rowSpan",
        colspan: "colSpan",
        tabindex: "tabIndex",
        usemap: "useMap",
        frameborder: "frameBorder"
    };
    
    var runtil = /Until$/,
        rparentsprev = /^(?:parents|prevUntil|prevAll)/,
        // Note: This RegExp should be improved, or likely pulled from Sizzle
        rmultiselector = /,/,
        slice = Array.prototype.slice;
    
    // Implement the identical functionality for filter and not
    var winnow = function( elements, qualifier, keep ) {
        if ( jQuery.isFunction( qualifier ) ) {
            return jQuery.grep(elements, function( elem, i ) {
                return !!qualifier.call( elem, i, elem ) === keep;
            });
    
        } else if ( qualifier.nodeType ) {
            return jQuery.grep(elements, function( elem, i ) {
                return (elem === qualifier) === keep;
            });
    
        } else if ( typeof qualifier === "string" ) {
            var filtered = jQuery.grep(elements, function( elem ) {
                return elem.nodeType === 1;
            });
    
            if ( isSimple.test( qualifier ) ) {
                return jQuery.filter(qualifier, filtered, !keep);
            } else {
                qualifier = jQuery.filter( qualifier, elements );
            }
        }
    
        return jQuery.grep(elements, function( elem, i ) {
            return (jQuery.inArray( elem, qualifier ) >= 0) === keep;
        });
    };
    
    // traversing
    jQuery.fn.extend({
        find: function( selector ) {
            var ret = this.pushStack( "", "find", selector ), length = 0;
    
            for ( var i = 0, l = this.length; i < l; i++ ) {
                length = ret.length;
                jQuery.find( selector, this[i], ret );
    
                if ( i > 0 ) {
                    // Make sure that the results are unique
                    for ( var n = length; n < ret.length; n++ ) {
                        for ( var r = 0; r < length; r++ ) {
                            if ( ret[r] === ret[n] ) {
                                ret.splice(n--, 1);
                                break;
                            }
                        }
                    }
                }
            }
    
            return ret;
        },
    
        has: function( target ) {
            var targets = jQuery( target );
            return this.filter(function() {
                for ( var i = 0, l = targets.length; i < l; i++ ) {
                    if ( jQuery.contains( this, targets[i] ) ) {
                        return true;
                    }
                }
            });
        },
    
        not: function( selector ) {
            return this.pushStack( winnow(this, selector, false), "not", selector);
        },
    
        filter: function( selector ) {
            return this.pushStack( winnow(this, selector, true), "filter", selector );
        },
        
        is: function( selector ) {
            return !!selector && jQuery.filter( selector, this ).length > 0;
        },
    
        closest: function( selectors, context ) {
            if ( jQuery.isArray( selectors ) ) {
                var ret = [], cur = this[0], match, matches = {}, selector;
    
                if ( cur && selectors.length ) {
                    for ( var i = 0, l = selectors.length; i < l; i++ ) {
                        selector = selectors[i];
    
                        if ( !matches[selector] ) {
                            matches[selector] = jQuery.expr.match.POS.test( selector ) ? 
                                jQuery( selector, context || this.context ) :
                                selector;
                        }
                    }
    
                    while ( cur && cur.ownerDocument && cur !== context ) {
                        for ( selector in matches ) {
                            match = matches[selector];
    
                            if ( match.jquery ? match.index(cur) > -1 : jQuery(cur).is(match) ) {
                                ret.push({ selector: selector, elem: cur });
                                delete matches[selector];
                            }
                        }
                        cur = cur.parentNode;
                    }
                }
    
                return ret;
            }
    
            var pos = jQuery.expr.match.POS.test( selectors ) ? 
                jQuery( selectors, context || this.context ) : null;
    
            return this.map(function(i, cur){
                while ( cur && cur.ownerDocument && cur !== context ) {
                    if ( pos ? pos.index(cur) > -1 : jQuery(cur).is(selectors) ) {
                        return cur;
                    }
                    cur = cur.parentNode;
                }
                return null;
            });
        },
        
        // Determine the position of an element within
        // the matched set of elements
        index: function( elem ) {
            if ( !elem || typeof elem === "string" ) {
                return jQuery.inArray( this[0],
                    // If it receives a string, the selector is used
                    // If it receives nothing, the siblings are used
                    elem ? jQuery( elem ) : this.parent().children() );
            }
            // Locate the position of the desired element
            return jQuery.inArray(
                // If it receives a jQuery object, the first element is used
                elem.jquery ? elem[0] : elem, this );
        },
    
        add: function( selector, context ) {
            var set = typeof selector === "string" ?
                    jQuery( selector, context || this.context ) :
                    jQuery.makeArray( selector ),
                all = jQuery.merge( this.get(), set );
    
            return this.pushStack( set[0] && (set[0].setInterval || set[0].nodeType === 9 || (set[0].parentNode && set[0].parentNode.nodeType !== 11)) ?
                jQuery.unique( all ) :
                all );
        },
    
        andSelf: function() {
            return this.add( this.prevObject );
        }
    });
    
    // A painfully simple check to see if an element is disconnected
    // from a document (should be improved, where feasible).
    function isDisconnected( node ) {
        return !node || !node.parentNode || node.parentNode.nodeType === 11;
    }
    
    jQuery.each({
        parent: function( elem ) {
            var parent = elem.parentNode;
            return parent && parent.nodeType !== 11 ? parent : null;
        },
        parents: function( elem ) {
            return jQuery.dir( elem, "parentNode" );
        },
        parentsUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "parentNode", until );
        },
        next: function( elem ) {
            return jQuery.nth( elem, 2, "nextSibling" );
        },
        prev: function( elem ) {
            return jQuery.nth( elem, 2, "previousSibling" );
        },
        nextAll: function( elem ) {
            return jQuery.dir( elem, "nextSibling" );
        },
        prevAll: function( elem ) {
            return jQuery.dir( elem, "previousSibling" );
        },
        nextUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "nextSibling", until );
        },
        prevUntil: function( elem, i, until ) {
            return jQuery.dir( elem, "previousSibling", until );
        },
        siblings: function( elem ) {
            return jQuery.sibling( elem.parentNode.firstChild, elem );
        },
        children: function( elem ) {
            return jQuery.sibling( elem.firstChild );
        },
        contents: function( elem ) {
            return jQuery.nodeName( elem, "iframe" ) ?
                elem.contentDocument || elem.contentWindow.document :
                jQuery.makeArray( elem.childNodes );
        }
    }, function( name, fn ) {
        jQuery.fn[ name ] = function( until, selector ) {
            var ret = jQuery.map( this, fn, until );
            
            if ( !runtil.test( name ) ) {
                selector = until;
            }
    
            if ( selector && typeof selector === "string" ) {
                ret = jQuery.filter( selector, ret );
            }
    
            ret = this.length > 1 ? jQuery.unique( ret ) : ret;
    
            if ( (this.length > 1 || rmultiselector.test( selector )) && rparentsprev.test( name ) ) {
                ret = ret.reverse();
            }
    
            return this.pushStack( ret, name, slice.call(arguments).join(",") );
        };
    });
    
    jQuery.extend({
        filter: function( expr, elems, not ) {
            if ( not ) {
                expr = ":not(" + expr + ")";
            }
    
            return jQuery.find.matches(expr, elems);
        },
        
        dir: function( elem, dir, until ) {
            var matched = [], cur = elem[dir];
            while ( cur && cur.nodeType !== 9 && (until === undefined || cur.nodeType !== 1 || !jQuery( cur ).is( until )) ) {
                if ( cur.nodeType === 1 ) {
                    matched.push( cur );
                }
                cur = cur[dir];
            }
            return matched;
        },
    
        nth: function( cur, result, dir, elem ) {
            result = result || 1;
            var num = 0;
    
            for ( ; cur; cur = cur[dir] ) {
                if ( cur.nodeType === 1 && ++num === result ) {
                    break;
                }
            }
    
            return cur;
        },
    
        sibling: function( n, elem ) {
            var r = [];
            
            for ( ; n; n = n.nextSibling ) {
                if ( n.nodeType === 1 && n !== elem ) {
                    r.push( n );
                }
            }
            
            return r;
        }
    });
    
    // manipulation
    var rinlinejQuery = / jQuery\d+="(?:\d+|null)"/g,
	rleadingWhitespace = /^\s+/,
	rxhtmlTag = /(<([\w:]+)[^>]*?)\/>/g,
	rselfClosing = /^(?:area|br|col|embed|hr|img|input|link|meta|param)$/i,
	rtagName = /<([\w:]+)/,
	rtbody = /<tbody/i,
	rhtml = /<|&#?\w+;/,
	rnocache = /<script|<object|<embed|<option|<style/i,
	rchecked = /checked\s*(?:[^=]|=\s*.checked.)/i,  // checked="checked" or checked (html5)
	fcloseTag = function( all, front, tag ) {
		return rselfClosing.test( tag ) ?
			all :
			front + "></" + tag + ">";
	},
	wrapMap = {
		option: [ 1, "<select multiple='multiple'>", "</select>" ],
		legend: [ 1, "<fieldset>", "</fieldset>" ],
		thead: [ 1, "<table>", "</table>" ],
		tr: [ 2, "<table><tbody>", "</tbody></table>" ],
		td: [ 3, "<table><tbody><tr>", "</tr></tbody></table>" ],
		col: [ 2, "<table><tbody></tbody><colgroup>", "</colgroup></table>" ],
		area: [ 1, "<map>", "</map>" ],
		_default: [ 0, "", "" ]
	};

    wrapMap.optgroup = wrapMap.option;
    wrapMap.tbody = wrapMap.tfoot = wrapMap.colgroup = wrapMap.caption = wrapMap.thead;
    wrapMap.th = wrapMap.td;
    
    // IE can't serialize <link> and <script> tags normally
    if ( !jQuery.support.htmlSerialize ) {
        wrapMap._default = [ 1, "div<div>", "</div>" ];
    }
    
    jQuery.fn.extend({
        text: function( text ) {
            if ( jQuery.isFunction(text) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    self.text( text.call(this, i, self.text()) );
                });
            }
    
            if ( typeof text !== "object" && text !== undefined ) {
                return this.empty().append( (this[0] && this[0].ownerDocument || document).createTextNode( text ) );
            }
    
            return jQuery.text( this );
        },
    
        wrapAll: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function(i) {
                    jQuery(this).wrapAll( html.call(this, i) );
                });
            }
    
            if ( this[0] ) {
                // The elements to wrap the target around
                var wrap = jQuery( html, this[0].ownerDocument ).eq(0).clone(true);
    
                if ( this[0].parentNode ) {
                    wrap.insertBefore( this[0] );
                }
    
                wrap.map(function() {
                    var elem = this;
    
                    while ( elem.firstChild && elem.firstChild.nodeType === 1 ) {
                        elem = elem.firstChild;
                    }
    
                    return elem;
                }).append(this);
            }
    
            return this;
        },
    
        wrapInner: function( html ) {
            if ( jQuery.isFunction( html ) ) {
                return this.each(function(i) {
                    jQuery(this).wrapInner( html.call(this, i) );
                });
            }
    
            return this.each(function() {
                var self = jQuery( this ), contents = self.contents();
    
                if ( contents.length ) {
                    contents.wrapAll( html );
    
                } else {
                    self.append( html );
                }
            });
        },
    
        wrap: function( html ) {
            return this.each(function() {
                jQuery( this ).wrapAll( html );
            });
        },
    
        unwrap: function() {
            return this.parent().each(function() {
                if ( !jQuery.nodeName( this, "body" ) ) {
                    jQuery( this ).replaceWith( this.childNodes );
                }
            }).end();
        },
    
        append: function() {
            return this.domManip(arguments, true, function( elem ) {
                if ( this.nodeType === 1 ) {
                    this.appendChild( elem );
                }
            });
        },
    
        prepend: function() {
            return this.domManip(arguments, true, function( elem ) {
                if ( this.nodeType === 1 ) {
                    this.insertBefore( elem, this.firstChild );
                }
            });
        },
    
        before: function() {
            if ( this[0] && this[0].parentNode ) {
                return this.domManip(arguments, false, function( elem ) {
                    this.parentNode.insertBefore( elem, this );
                });
            } else if ( arguments.length ) {
                var set = jQuery(arguments[0]);
                set.push.apply( set, this.toArray() );
                return this.pushStack( set, "before", arguments );
            }
        },
    
        after: function() {
            if ( this[0] && this[0].parentNode ) {
                return this.domManip(arguments, false, function( elem ) {
                    this.parentNode.insertBefore( elem, this.nextSibling );
                });
            } else if ( arguments.length ) {
                var set = this.pushStack( this, "after", arguments );
                set.push.apply( set, jQuery(arguments[0]).toArray() );
                return set;
            }
        },
        
        // keepData is for internal use only--do not document
        remove: function( selector, keepData ) {
            for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
                if ( !selector || jQuery.filter( selector, [ elem ] ).length ) {
                    if ( !keepData && elem.nodeType === 1 ) {
                        jQuery.cleanData( elem.getElementsByTagName("*") );
                        jQuery.cleanData( [ elem ] );
                    }
    
                    if ( elem.parentNode ) {
                         elem.parentNode.removeChild( elem );
                    }
                }
            }
            
            return this;
        },
    
        empty: function() {
            for ( var i = 0, elem; (elem = this[i]) != null; i++ ) {
                // Remove element nodes and prevent memory leaks
                if ( elem.nodeType === 1 ) {
                    jQuery.cleanData( elem.getElementsByTagName("*") );
                }
    
                // Remove any remaining nodes
                while ( elem.firstChild ) {
                    elem.removeChild( elem.firstChild );
                }
            }
            
            return this;
        },
    
        clone: function( events ) {
            // Do the clone
            var ret = this.map(function() {
                if ( !jQuery.support.noCloneEvent && !jQuery.isXMLDoc(this) ) {
                    // IE copies events bound via attachEvent when
                    // using cloneNode. Calling detachEvent on the
                    // clone will also remove the events from the orignal
                    // In order to get around this, we use innerHTML.
                    // Unfortunately, this means some modifications to
                    // attributes in IE that are actually only stored
                    // as properties will not be copied (such as the
                    // the name attribute on an input).
                    var html = this.outerHTML, ownerDocument = this.ownerDocument;
                    if ( !html ) {
                        var div = ownerDocument.createElement("div");
                        div.appendChild( this.cloneNode(true) );
                        html = div.innerHTML;
                    }
    
                    return jQuery.clean([html.replace(rinlinejQuery, "")
                        // Handle the case in IE 8 where action=/test/> self-closes a tag
                        .replace(/=([^="'>\s]+\/)>/g, '="$1">')
                        .replace(rleadingWhitespace, "")], ownerDocument)[0];
                } else {
                    return this.cloneNode(true);
                }
            });
    
            // Copy the events from the original to the clone
            if ( events === true ) {
                cloneCopyEvent( this, ret );
                cloneCopyEvent( this.find("*"), ret.find("*") );
            }
    
            // Return the cloned set
            return ret;
        },
    
        html: function( value ) {
            if ( value === undefined ) {
                return this[0] && this[0].nodeType === 1 ?
                    this[0].innerHTML.replace(rinlinejQuery, "") :
                    null;
    
            // See if we can take a shortcut and just use innerHTML
            } else if ( typeof value === "string" && !rnocache.test( value ) &&
                (jQuery.support.leadingWhitespace || !rleadingWhitespace.test( value )) &&
                !wrapMap[ (rtagName.exec( value ) || ["", ""])[1].toLowerCase() ] ) {
    
                value = value.replace(rxhtmlTag, fcloseTag);
    
                try {
                    for ( var i = 0, l = this.length; i < l; i++ ) {
                        // Remove element nodes and prevent memory leaks
                        if ( this[i].nodeType === 1 ) {
                            jQuery.cleanData( this[i].getElementsByTagName("*") );
                            this[i].innerHTML = value;
                        }
                    }
    
                // If using innerHTML throws an exception, use the fallback method
                } catch(e) {
                    this.empty().append( value );
                }
    
            } else if ( jQuery.isFunction( value ) ) {
                this.each(function(i){
                    var self = jQuery(this), old = self.html();
                    self.empty().append(function(){
                        return value.call( this, i, old );
                    });
                });
    
            } else {
                this.empty().append( value );
            }
    
            return this;
        },
    
        replaceWith: function( value ) {
            if ( this[0] && this[0].parentNode ) {
                // Make sure that the elements are removed from the DOM before they are inserted
                // this can help fix replacing a parent with child elements
                if ( jQuery.isFunction( value ) ) {
                    return this.each(function(i) {
                        var self = jQuery(this), old = self.html();
                        self.replaceWith( value.call( this, i, old ) );
                    });
                }
    
                if ( typeof value !== "string" ) {
                    value = jQuery(value).detach();
                }
    
                return this.each(function() {
                    var next = this.nextSibling, parent = this.parentNode;
    
                    jQuery(this).remove();
    
                    if ( next ) {
                        jQuery(next).before( value );
                    } else {
                        jQuery(parent).append( value );
                    }
                });
            } else {
                return this.pushStack( jQuery(jQuery.isFunction(value) ? value() : value), "replaceWith", value );
            }
        },
    
        detach: function( selector ) {
            return this.remove( selector, true );
        },
    
        domManip: function( args, table, callback ) {
            var results, first, value = args[0], scripts = [], fragment, parent;
    
            // We can't cloneNode fragments that contain checked, in WebKit
            if ( !jQuery.support.checkClone && arguments.length === 3 && typeof value === "string" && rchecked.test( value ) ) {
                return this.each(function() {
                    jQuery(this).domManip( args, table, callback, true );
                });
            }
    
            if ( jQuery.isFunction(value) ) {
                return this.each(function(i) {
                    var self = jQuery(this);
                    args[0] = value.call(this, i, table ? self.html() : undefined);
                    self.domManip( args, table, callback );
                });
            }
    
            if ( this[0] ) {
                parent = value && value.parentNode;
    
                // If we're in a fragment, just use that instead of building a new one
                if ( jQuery.support.parentNode && parent && parent.nodeType === 11 && parent.childNodes.length === this.length ) {
                    results = { fragment: parent };
    
                } else {
                    results = buildFragment( args, this, scripts );
                }
                
                fragment = results.fragment;
                
                if ( fragment.childNodes.length === 1 ) {
                    first = fragment = fragment.firstChild;
                } else {
                    first = fragment.firstChild;
                }
    
                if ( first ) {
                    table = table && jQuery.nodeName( first, "tr" );
    
                    for ( var i = 0, l = this.length; i < l; i++ ) {
                        callback.call(
                            table ?
                                root(this[i], first) :
                                this[i],
                            i > 0 || results.cacheable || this.length > 1  ?
                                fragment.cloneNode(true) :
                                fragment
                        );
                    }
                }
    
                if ( scripts.length ) {
                    jQuery.each( scripts, evalScript );
                }
            }
    
            return this;
    
            function root( elem, cur ) {
                return jQuery.nodeName(elem, "table") ?
                    (elem.getElementsByTagName("tbody")[0] ||
                    elem.appendChild(elem.ownerDocument.createElement("tbody"))) :
                    elem;
            }
        }
    });
	
    function buildFragment( args, nodes, scripts ) {
        var fragment, cacheable, cacheresults,
            doc = (nodes && nodes[0] ? nodes[0].ownerDocument || nodes[0] : document);
    
        // Only cache "small" (1/2 KB) strings that are associated with the main document
        // Cloning options loses the selected state, so don't cache them
        // IE 6 doesn't like it when you put <object> or <embed> elements in a fragment
        // Also, WebKit does not clone 'checked' attributes on cloneNode, so don't cache
        if ( args.length === 1 && typeof args[0] === "string" && args[0].length < 512 && doc === document &&
            !rnocache.test( args[0] ) && (jQuery.support.checkClone || !rchecked.test( args[0] )) ) {
    
            cacheable = true;
            cacheresults = jQuery.fragments[ args[0] ];
            if ( cacheresults ) {
                if ( cacheresults !== 1 ) {
                    fragment = cacheresults;
                }
            }
        }
    
        if ( !fragment ) {
            fragment = doc.createDocumentFragment();
    		jQuery.clean( args, doc, fragment, scripts );
        }
    
        if ( cacheable ) {
            jQuery.fragments[ args[0] ] = cacheresults ? fragment : 1;
        }
    
        return { fragment: fragment, cacheable: cacheable };
    }
    
    jQuery.each({
        appendTo: "append",
        prependTo: "prepend",
        insertBefore: "before",
        insertAfter: "after",
        replaceAll: "replaceWith"
    }, function( name, original ) {
        jQuery.fn[ name ] = function( selector ) {
            var ret = [], insert = jQuery( selector ),
                parent = this.length === 1 && this[0].parentNode;
            
            if ( parent && parent.nodeType === 11 && parent.childNodes.length === 1 && insert.length === 1 ) {
                insert[ original ]( this[0] );
                return this;
                
            } else {
                for ( var i = 0, l = insert.length; i < l; i++ ) {
                    var elems = (i > 0 ? this.clone(true) : this).get();
                    jQuery.fn[ original ].apply( jQuery(insert[i]), elems );
                    ret = ret.concat( elems );
                }
            
                return this.pushStack( ret, name, insert.selector );
            }
        };
    });
    
    jQuery.extend({
        clean: function( elems, context, fragment, scripts ) {
            context = context || document;
    
            // !context.createElement fails in IE with an error but returns typeof 'object'
            if ( typeof context.createElement === "undefined" ) {
                context = context.ownerDocument || context[0] && context[0].ownerDocument || document;
            }
    
            var ret = [];
    
            for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
                if ( typeof elem === "number" ) {
                    elem += "";
                }
    
                if ( !elem ) {
                    continue;
                }
    
                // Convert html string into DOM nodes
                if ( typeof elem === "string" && !rhtml.test( elem ) ) {
                    elem = context.createTextNode( elem );
    
                } else if ( typeof elem === "string" ) {
                    // Fix "XHTML"-style tags in all browsers
                    elem = elem.replace(rxhtmlTag, fcloseTag);
    
                    // Trim whitespace, otherwise indexOf won't work as expected
                    var tag = (rtagName.exec( elem ) || ["", ""])[1].toLowerCase(),
                        wrap = wrapMap[ tag ] || wrapMap._default,
                        depth = wrap[0],
                        div = context.createElement("div");
    
                    // Go to html and back, then peel off extra wrappers
                    div.innerHTML = wrap[1] + elem + wrap[2];
    
                    // Move to the right depth
                    while ( depth-- ) {
                        div = div.lastChild;
                    }
    
                    // Remove IE's autoinserted <tbody> from table fragments
                    if ( !jQuery.support.tbody ) {
    
                        // String was a <table>, *may* have spurious <tbody>
                        var hasBody = rtbody.test(elem),
                            tbody = tag === "table" && !hasBody ?
                                div.firstChild && div.firstChild.childNodes :
    
                                // String was a bare <thead> or <tfoot>
                                wrap[1] === "<table>" && !hasBody ?
                                    div.childNodes :
                                    [];
    
                        for ( var j = tbody.length - 1; j >= 0 ; --j ) {
                            if ( jQuery.nodeName( tbody[ j ], "tbody" ) && !tbody[ j ].childNodes.length ) {
                                tbody[ j ].parentNode.removeChild( tbody[ j ] );
                            }
                        }
    
                    }
    
                    // IE completely kills leading whitespace when innerHTML is used
                    if ( !jQuery.support.leadingWhitespace && rleadingWhitespace.test( elem ) ) {
                        div.insertBefore( context.createTextNode( rleadingWhitespace.exec(elem)[0] ), div.firstChild );
                    }
    
                    elem = div.childNodes;
                }
    
                if ( elem.nodeType ) {
                    ret.push( elem );
                } else {
                    ret = jQuery.merge( ret, elem );
                }
            }
    
            if ( fragment ) {
                for ( var i = 0; ret[i]; i++ ) {
                    if ( scripts && jQuery.nodeName( ret[i], "script" ) && (!ret[i].type || ret[i].type.toLowerCase() === "text/javascript") ) {
                        scripts.push( ret[i].parentNode ? ret[i].parentNode.removeChild( ret[i] ) : ret[i] );
                    
                    } else {
                        if ( ret[i].nodeType === 1 ) {
                            ret.splice.apply( ret, [i + 1, 0].concat(jQuery.makeArray(ret[i].getElementsByTagName("script"))) );
                        }
                        fragment.appendChild( ret[i] );
                    }
                }
            }
    
            return ret;
        },
        
        cleanData: function( elems ) {
            return;
        
            var data, id, cache = jQuery.cache,
                special = jQuery.event.special,
                deleteExpando = jQuery.support.deleteExpando;
            
            for ( var i = 0, elem; (elem = elems[i]) != null; i++ ) {
                id = elem[ jQuery.expando ];
                
                if ( id ) {
                    data = cache[ id ];
                    
                    if ( data.events ) {
                        for ( var type in data.events ) {
                            if ( special[ type ] ) {
                                jQuery.event.remove( elem, type );
    
                            } else {
                                removeEvent( elem, type, data.handle );
                            }
                        }
                    }
                    
                    if ( deleteExpando ) {
                        delete elem[ jQuery.expando ];
    
                    } else if ( elem.removeAttribute ) {
                        elem.removeAttribute( jQuery.expando );
                    }
                    
                    delete cache[ id ];
                }
            }
        }
    });
    
    jQuery.fragments = {};
            
    // EXPOSE
    return jQuery;
}	
	
	
	











