process.chdir(__dirname);

var nodeunit = require('nodeunit');
var fs       = require('fs');
var sys      = require('sys');
var nquery   = require('../lib/nquery');
var html     = fs.readFileSync('./fixtures/index.html', 'utf8');
var $        = nquery.createHtmlDocument(html);
var doc      = $.window.document;

exports.testElement = function(test) {
    test.expect(19);
    
    test.ok($('*').size() >= 30, 'Select all');
    
    var all  = $('*'),
        good = true;
    for (var i = 0; i < all.length; i++) {
        if (all[i].nodeType == 8) {
            good = false;
        }
    }
    
    test.ok(good, 'Select all elements, no comment nodes');
    t('Element Selector', 'p', ['firstp', 'ap', 'sndp', 'en', 'sap', 'first'], doc, $, test);
    t('Element Selector', 'body', ['body'], doc, $, test);
    t('Element Selector', 'html', ['html'], doc, $, test);
    t('Parent Element', 'div p', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    test.equals($('param', '#object1').length, 2, 'Object/param as context');
    
    test.same($('p', doc.getElementsByTagName('div')).get(), q(doc, ['firstp','ap','sndp','en','sap','first']), 'Finding elements with a context.');
    test.same($('p', 'div').get(), q(doc, ['firstp','ap','sndp','en','sap','first']), 'Finding elements with a context.');
    test.same($('p', $('div')).get(), q(doc, ['firstp','ap','sndp','en','sap','first']), 'Finding elements with a context.');
    test.same($('div').find('p').get(), q(doc, ['firstp','ap','sndp','en','sap','first']), 'Finding elements with a context.');
    test.same($('#form').find('select').get(), q(doc, ['select1','select2','select3']), 'Finding selects with a context.' );
    
    test.ok($('#length').length, '&lt;input name="length"&gt; cannot be found under IE, see #945');
    test.ok($('#lengthtest input').length, '&lt;input name="length"&gt; cannot be found under IE, see #945');
    
    // Check for unique-ness and sort order
    test.same($('*').get(), $('*, *').get(), 'Check for duplicates: *, *');
    test.same($('p').get(), $('p, div p').get(), 'Check for duplicates: p, div p');

    t('Checking sort order', 'h2, h1', ['qunit-header', 'qunit-banner', 'qunit-userAgent'], doc, $, test);
    t('Checking sort order', 'h2:first, h1:first', ['qunit-header', 'qunit-banner'], doc, $, test);
    t('Checking sort order', 'p, p a', ['firstp', 'simon1', 'ap', 'google', 'groups', 'anchor1', 'mark', 'sndp', 'en', 'yahoo', 'sap', 'anchor2', 'simon', 'first'], doc, $, test);

    test.done();
    reset();
}

exports.testBroken = function(test) {
    test.expect(8);
    
    function broken(name, selector) {
        try {
            $(selector);
            test.ok( false, name + ": " + selector );
        } catch(e) {
            test.ok(typeof e === "string" && e.indexOf("Syntax error") >= 0, name + ": " + selector );
        }
    }

    broken( "Broken Selector", "[", [] );
    broken( "Broken Selector", "(", [] );
    broken( "Broken Selector", "{", [] );
    broken( "Broken Selector", "<", [] );
    broken( "Broken Selector", "()", [] );
    broken( "Broken Selector", "<>", [] );
    broken( "Broken Selector", "{}", [] );
    broken( "Doesn't exist", ":visble", [] );

    test.done();
    reset();
}

exports.testId = function(test) {
    test.expect(28);
    
    t('ID Selector', '#body', ['body'], doc, $, test);
    t('ID Selector w/ Element', 'body#body', ['body'], doc, $, test);
    t('ID Selector w/ Element', 'ul#first', [], doc, $, test);
    t('ID selector with existing ID descendant', '#firstp #simon1', ['simon1'], doc, $, test);
    t('ID selector with non-existant descendant', '#firstp #foobar', [], doc, $, test);
    t('ID selector using UTF8', '#台北Táiběi', ['台北Táiběi'], doc, $, test);
    t('Multiple ID selectors using UTF8', '#台北Táiběi, #台北', ['台北Táiběi','台北'], doc, $, test);
    t('Descendant ID selector using UTF8', 'div #台北', ['台北'], doc, $, test);
    t('Child ID selector using UTF8', 'form > #台北', ['台北'], doc, $, test);
    
    t('Escaped ID', '#foo\\:bar', ['foo:bar'], doc, $, test);
    t('Escaped ID', '#test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);
    t('Descendant escaped ID', 'div #foo\\:bar', ['foo:bar'], doc, $, test);
    t('Descendant escaped ID', 'div #test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);
    t('Child escaped ID', 'form > #foo\\:bar', ['foo:bar'], doc, $, test);
    t('Child escaped ID', 'form > #test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);
    
    t('ID Selector, child ID present', '#form > #radio1', ['radio1'], doc, $, test); // bug #267
    t('ID Selector, not an ancestor ID', '#form #first', [], doc, $, test);
    t('ID Selector, not a child ID', '#form > #option1a', [], doc, $, test);
    
    t('All Children of ID', '#foo > *', ['sndp', 'en', 'sap'], doc, $, test);
    t('All Children of ID with no children', '#firstUL > *', [], doc, $, test);

    var a = $('<div><a name="tName1">tName1 A</a><a name="tName2">tName2 A</a><div id="tName1">tName1 Div</div></div>').appendTo('#main');
    test.equals($('#tName1')[0].id, 'tName1', 'ID selector with same value for a name attribute');
    test.equals($("#tName2").length, 0, 'ID selector non-existing but name attribute on an A tag');
    a.remove();
    
    t("ID Selector on Form with an input that has a name of 'id'", '#lengthtest', ['lengthtest'], doc, $, test);
    t('ID selector with non-existant ancestor', '#asdfasdf #foobar', [], doc, $, test); // bug #986
    test.same($('body').find('div#form').get(), [], 'ID selector within the context of another element');
    t('Underscore ID', '#types_all', ['types_all'], doc, $, test);
    t('Dash ID', '#fx-queue', ['fx-queue'], doc, $, test);
    t('ID with weird characters in it', '#name\\+value', ['name+value'], doc, $, test);
    
    test.done();
    reset();
}

exports.testClass = function(test) {
    test.expect(22);
    
    t('Class Selector', '.blog', ['mark','simon'], doc, $, test);
    t('Class Selector', '.GROUPS', ['groups'], doc, $, test);
    t('Class Selector', '.blog.link', ['simon'], doc, $, test);
    t('Class Selector w/ Element', 'a.blog', ['mark','simon'], doc, $, test);
    t('Parent Class Selector', 'p .blog', ['mark','simon'], doc, $, test);
    
    test.same($('.blog', doc.getElementsByTagName('p')).get(), q(doc, ['mark', 'simon']), 'Finding elements with a context.');
    test.same($('.blog', 'p').get(), q(doc, ['mark', 'simon']), 'Finding elements with a context.');
    test.same($('.blog',$('p')).get(), q(doc, ['mark', 'simon']), 'Finding elements with a context.');
    test.same($('p').find('.blog').get(), q(doc, ['mark', 'simon']), 'Finding elements with a context.');
    
    t('Class selector using UTF8', '.台北Táiběi', ['utf8class1'], doc, $, test);
    //t('Class selector using UTF8', '.台北', ['utf8class1','utf8class2'], doc, $, test);
    t('Class selector using UTF8', '.台北Táiběi.台北', ['utf8class1'], doc, $, test);
    t('Class selector using UTF8', '.台北Táiběi, .台北', ['utf8class1','utf8class2'], doc, $, test);
    t('Descendant class selector using UTF8', 'div .台北Táiběi', ['utf8class1'], doc, $, test);
    t('Child class selector using UTF8', 'form > .台北Táiběi', ['utf8class1'], doc, $, test);
    
    t('Escaped Class', '.foo\\:bar', ['foo:bar'], doc, $, test);
    t('Escaped Class', '.test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);
    t('Descendant scaped Class', 'div .foo\\:bar', ['foo:bar'], doc, $, test);
    t('Descendant scaped Class', 'div .test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);
    t('Child escaped Class', 'form > .foo\\:bar', ['foo:bar'], doc, $, test);
    t('Child escaped Class', 'form > .test\\.foo\\[5\\]bar', ['test.foo[5]bar'], doc, $, test);

    var div = doc.createElement('div');
    div.innerHTML = "<div class='test e'></div><div class='test'></div>";
    test.same($('.e', div).get(), [div.firstChild], 'Finding a second class.');
    
    div.lastChild.className = 'e';
    test.same($('.e', div).get(), [div.firstChild, div.lastChild], 'Finding a modified class.');
    
    test.done();
    reset();
}

exports.testName = function(test) {
    test.expect(14);
    
    t('Name selector', 'input[name=action]', ['text1'], doc, $, test);
    t('Name selector with single quotes', "input[name='action']", ['text1'], doc, $, test);
    t('Name selector with double quotes', 'input[name="action"]', ['text1'], doc, $, test);

    t('Name selector non-input', '[name=test]', ['length', 'fx-queue'], doc, $, test);
    t('Name selector non-input', '[name=div]', ['fadein'], doc, $, test);
    t('Name selector non-input', '*[name=iframe]', ['iframe'], doc, $, test);
    
    t('Name selector for grouped input', "input[name='types[]']", ['types_all', 'types_anime', 'types_movie'], doc, $, test);
    
    test.same($('#form').find('input[name=action]').get(), q(doc, ['text1']), 'Name selector within the context of another element');
    test.same($('#form').find("input[name='foo[bar]']").get(), q(doc, ['hidden2']), 'Name selector for grouped form element within the context of another element');
    
    var a = $('<div><a id="tName1ID" name="tName1">tName1 A</a><a id="tName2ID" name="tName2">tName2 A</a><div id="tName1">tName1 Div</div></div>').appendTo('#main').children();
    
    test.equals(a.length, 3, 'Make sure the right number of elements were inserted.');
    test.equals(a[1].id, 'tName2ID', 'Make sure the right number of elements were inserted.');
    
    t('Find elements that have similar IDs', '[name=tName1]', ['tName1ID'], doc, $, test);
    t('Find elements that have similar IDs', '[name=tName2]', ['tName2ID'], doc, $, test);
    t('Find elements that have similar IDs', '#tName2ID', ['tName2ID'], doc, $, test);

    a.remove();
    
    test.done();
    reset();
}

exports.testMultiple = function(test) {
    test.expect(4);
    
    t('Comma Support', 'h2, p', ['qunit-banner','qunit-userAgent','firstp','ap','sndp','en','sap','first'], doc, $, test);
    t('Comma Support', 'h2 , p', ['qunit-banner','qunit-userAgent','firstp','ap','sndp','en','sap','first'], doc, $, test);
    t('Comma Support', 'h2 , p', ['qunit-banner','qunit-userAgent','firstp','ap','sndp','en','sap','first'], doc, $, test);
    t('Comma Support', 'h2,p', ['qunit-banner','qunit-userAgent','firstp','ap','sndp','en','sap','first'], doc, $, test);
    
    test.done();
    reset();
}

exports.testChildAndAdjacent = function(test) {
    test.expect(27);
    
    t('Child', 'p > a', ['simon1','google','groups','mark','yahoo','simon'], doc, $, test);
    t('Child', 'p> a', ['simon1','google','groups','mark','yahoo','simon'], doc, $, test);
    t('Child', 'p >a', ['simon1','google','groups','mark','yahoo','simon'], doc, $, test);
    t('Child', 'p>a', ['simon1','google','groups','mark','yahoo','simon'], doc, $, test);
    t('Child w/ Class', 'p > a.blog', ['mark','simon'], doc, $, test);
    
    t('All Children', 'code > *', ['anchor1','anchor2'], doc, $, test);
    t('All Grandchildren', 'p > * > *', ['anchor1','anchor2'], doc, $, test);
    t('Adjacent', 'a + a', ['groups'], doc, $, test);
    t('Adjacent', 'a +a', ['groups'], doc, $, test);
    t('Adjacent', 'a+ a', ['groups'], doc, $, test);
    t('Adjacent', 'a+a', ['groups'], doc, $, test);
    t('Adjacent', 'p + p', ['ap','en','sap'], doc, $, test);
    t('Adjacent', 'p#firstp + p', ['ap'], doc, $, test);
    t('Adjacent', 'p[lang=en] + p', ['sap'], doc, $, test);
    t('Adjacent', 'a.GROUPS + code + a', ['mark'], doc, $, test);
    t('Comma, Child, and Adjacent', 'a + a, code > a', ['groups','anchor1','anchor2'], doc, $, test);

    t('Element Preceded By', 'p ~ div', ['foo', 'moretests','tabindex-tests', 'liveHandlerOrder', 'siblingTest'], doc, $, test);
    t('Element Preceded By', '#first ~ div', ['moretests','tabindex-tests', 'liveHandlerOrder', 'siblingTest'], doc, $, test);
    t('Element Preceded By', '#groups ~ a', ['mark'], doc, $, test);
    t('Element Preceded By', '#length ~ input', ['idTest'], doc, $, test);
    t('Element Preceded By', '#siblingfirst ~ em', ['siblingnext'], doc, $, test);
    
    t('Verify deep class selector', 'div.blah > p > a', [], doc, $, test);

    t('No element deep selector', 'div.foo > span > a', [], doc, $, test);

    test.same($('> :first', doc.getElementById('nothiddendiv')).get(), q(doc, ['nothiddendivchild']), 'Verify child context positional selctor' );
    test.same($('> :eq(0)', doc.getElementById('nothiddendiv')).get(), q(doc, ['nothiddendivchild']), 'Verify child context positional selctor' );
    test.same($('> *:first', doc.getElementById('nothiddendiv')).get(), q(doc, ['nothiddendivchild']), 'Verify child context positional selctor' );
    
    t('Non-existant ancestors', '.fototab > .thumbnails > a', [], doc, $, test);
    
    test.done();
    reset();
}

exports.testAttributes = function(test) {
    test.expect(33);
    
    t('Attribute Exists', 'a[title]', ['google'], doc, $, test);
    t('Attribute Exists', '*[title]', ['google'], doc, $, test);
    t('Attribute Exists', '[title]', ['google'], doc, $, test);
    t('Attribute Exists', 'a[ title ]', ['google'], doc, $, test);

    t('Attribute Equals', "a[rel='bookmark']", ['simon1'], doc, $, test);
    t('Attribute Equals', 'a[rel="bookmark"]', ['simon1'], doc, $, test);
    t('Attribute Equals', 'a[rel=bookmark]', ['simon1'], doc, $, test);
    t('Attribute Equals', "a[href='http://www.google.com/']", ['google'], doc, $, test);
    t('Attribute Equals', "a[ rel = 'bookmark' ]", ['simon1'], doc, $, test);
    
    doc.getElementById('anchor2').href = '#2';
    
    t('href Attribute', 'p a[href^=#]', ['anchor2'], doc, $, test);
    t('href Attribute', 'p a[href*=#]', ['simon1', 'anchor2'], doc, $, test);
    
    t('for Attribute', 'form label[for]', ['label-for'], doc, $, test);
    t('for Attribute in form', '#form [for=action]', ['label-for'], doc, $, test);
    
    t('Attribute containing []', "input[name^='foo[']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name^='foo[bar]']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name*='[bar]']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name$='bar]']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name$='[bar]']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name$='foo[bar]']", ['hidden2'], doc, $, test);
    t('Attribute containing []', "input[name*='foo[bar]']", ['hidden2'], doc, $, test);

    t('Multiple Attribute Equals', "#form input[type='radio'], #form input[type='hidden']", ['radio1', 'radio2', 'hidden1'], doc, $, test);
    t('Multiple Attribute Equals', "#form input[type='radio'], #form input[type=\"hidden\"]", ['radio1', 'radio2', 'hidden1'], doc, $, test);
    t('Multiple Attribute Equals', "#form input[type='radio'], #form input[type=hidden]", ['radio1', 'radio2', 'hidden1'], doc, $, test);

    t('Attribute selector using UTF8', 'span[lang=中文]', ['台北'], doc, $, test);

    t('Attribute Begins With', "a[href ^= 'http://www']", ['google','yahoo'], doc, $, test);
    t('Attribute Ends With', "a[href $= 'org/']", ['mark'], doc, $, test);
    t('Attribute Contains', "a[href *= 'google']", ['google','groups'], doc, $, test);
    t('Attribute Is Not Equal', "#ap a[hreflang!='en']", ['google','groups','anchor1'], doc, $, test);

    t('Empty values', "#select1 option[value='']", ['option1a'], doc, $, test);
    t('Empty values', "#select1 option[value!='']", ['option1b','option1c','option1d'], doc, $, test);
    
    //t('Select options via :selected', '#select1 option:selected', ['option1a'], doc, $, test);
    t('Select options via :selected', '#select2 option:selected', ['option2d'], doc, $, test);
    t('Select options via :selected', '#select3 option:selected', ['option3b', 'option3c'], doc, $, test);
    
    t( 'Grouped Form Elements', "input[name='foo[bar]']", ['hidden2'], doc, $, test);
    
    test.done();
    reset();
}

exports.testPseudoChild = function(test) {
    test.expect(31);
    
    t('First Child', 'p:first-child', ['firstp','sndp'], doc, $, test);
    t('Last Child', 'p:last-child', ['sap'], doc, $, test);
    t('Only Child', 'a:only-child', ['simon1','anchor1','yahoo','anchor2','liveLink1','liveLink2'], doc, $, test);
    t('Empty', 'ul:empty', ['firstUL'], doc, $, test);
    t('Is A Parent', 'p:parent', ['firstp','ap','sndp','en','sap','first'], doc, $, test);

    t('First Child', 'p:first-child', ['firstp','sndp'], doc, $, test);
    t('Nth Child', 'p:nth-child(1)', ['firstp','sndp'], doc, $, test);
    t('Not Nth Child', 'p:not(:nth-child(1))', ['ap','en','sap','first'], doc, $, test);

    // Verify that the child position isn't being cached improperly
    $('p:first-child').after('<div></div>');
    $('p:first-child').before('<div></div>').next().remove();

    t('First Child', 'p:first-child', [], doc, $, test);
    
    reset();
    
    t('Last Child', 'p:last-child', ['sap'], doc, $, test);
    t('Last Child', 'a:last-child', ['simon1','anchor1','mark','yahoo','anchor2','simon','liveLink1','liveLink2'], doc, $, test);

    t('Nth-child', '#main form#form > *:nth-child(2)', ['text1'], doc, $, test);
    t('Nth-child', '#main form#form > :nth-child(2)', ['text1'], doc, $, test);

    t('Nth-child', '#form select:first option:nth-child(3)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(0n+3)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(1n+0)', ['option1a', 'option1b', 'option1c', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(1n)', ['option1a', 'option1b', 'option1c', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(n)', ['option1a', 'option1b', 'option1c', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(even)', ['option1b', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(odd)', ['option1a', 'option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(2n)', ['option1b', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(2n+1)', ['option1a', 'option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n+1)', ['option1a', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n+2)', ['option1b'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n+3)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n-1)', ['option1b'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n-2)', ['option1a', 'option1d'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n-3)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(3n+0)', ['option1c'], doc, $, test);
    t('Nth-child', '#form select:first option:nth-child(-n+3)', ['option1a', 'option1b', 'option1c'], doc, $, test);
    
    test.done();
    reset();
}

exports.testPseudoMisc = function(test) {
    test.expect(6);
    
    t('Headers', ':header', ['qunit-header', 'qunit-banner', 'qunit-userAgent'], doc, $, test);
    t('Has Children - :has()', 'p:has(a)', ['firstp','ap','en','sap'], doc, $, test);
    
    t('Text Contains', "a:contains('Google')", ['google','groups'], doc, $, test);
    t('Text Contains', "a:contains('Google Groups')", ['groups'], doc, $, test);
    
    t('Text Contains', "a:contains('Google Groups (Link)')", ['groups'], doc, $, test);
    t('Text Contains', "a:contains('(Link)')", ['groups'], doc, $, test);
    
    test.done();
    reset();
}

exports.testPseudoNot = function(test) {
    test.expect(24);
    
    t('Not', 'a.blog:not(.link)', ['mark'], doc, $, test);
    t('Not - multiple', "#form option:not(:contains('Nothing'),#option1b,:selected)", ['option1c', 'option1d', 'option2b', 'option2c', 'option3d', 'option3e'], doc, $, test);
    t('Not - recursive', "#form option:not(:not(:selected))[id^='option3']", [ 'option3b', 'option3c'], doc, $, test);

    t(':not() failing interior', 'p:not(.foo)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not() failing interior', 'p:not(div.foo)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not() failing interior', 'p:not(p.foo)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not() failing interior', 'p:not(#blargh)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not() failing interior', 'p:not(div#blargh)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not() failing interior', 'p:not(p#blargh)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    
    t(':not Multiple', 'p:not(a)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not Multiple', 'p:not(a, b)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not Multiple', 'p:not(a, b, div)', ['firstp','ap','sndp','en','sap','first'], doc, $, test);
    t(':not Multiple', 'p:not(p)', [], doc, $, test);
    t(':not Multiple', 'p:not(a,p)', [], doc, $, test);
    t(':not Multiple', 'p:not(p,a)', [], doc, $, test);
    t(':not Multiple', 'p:not(a,p,b)', [], doc, $, test);
    t(':not Multiple', ':input:not(:image,:input,:submit)', [], doc, $, test);
    
    t('No element not selector', '.container div:not(.excluded) div', [], doc, $, test);
    
    t(':not() Existing attribute', '#form select:not([multiple])', ['select1', 'select2'], doc, $, test);
    t(':not() Equals attribute', '#form select:not([name=select1])', ['select2', 'select3'], doc, $, test);
    t(':not() Equals quoted attribute', "#form select:not([name='select1'])", ['select2', 'select3'], doc, $, test);

    t(':not() Multiple Class', '#foo a:not(.blog)', ['yahoo','anchor2'], doc, $, test);
    t(':not() Multiple Class', '#foo a:not(.link)', ['yahoo','anchor2'], doc, $, test);
    t(':not() Multiple Class', '#foo a:not(.blog.link)', ['yahoo','anchor2'], doc, $, test);
    
    test.done();
    reset();
}

exports.testPseudoPosition = function(test) {
    test.expect(25);
    
    t('nth Element', 'p:nth(1)', ['ap'], doc, $, test);
    t('First Element', 'p:first', ['firstp'], doc, $, test);
    t('Last Element', 'p:last', ['first'], doc, $, test);
    t('Even Elements', 'p:even', ['firstp','sndp','sap'], doc, $, test);
    t('Odd Elements', 'p:odd', ['ap','en','first'], doc, $, test);
    t('Position Equals', 'p:eq(1)', ['ap'], doc, $, test);
    t('Position Greater Than', 'p:gt(0)', ['ap','sndp','en','sap','first'], doc, $, test);
    t('Position Less Than', 'p:lt(3)', ['firstp','ap','sndp'], doc, $, test);

    t('Check position filtering', 'div#nothiddendiv:eq(0)', ['nothiddendiv'], doc, $, test);
    t('Check position filtering', 'div#nothiddendiv:last', ['nothiddendiv'], doc, $, test);
    t('Check position filtering', 'div#nothiddendiv:not(:gt(0))', ['nothiddendiv'], doc, $, test);
    t('Check position filtering', '#foo > :not(:first)', ['en', 'sap'], doc, $, test);
    t('Check position filtering', 'select > :not(:gt(2))', ['option1a', 'option1b', 'option1c'], doc, $, test);
    t('Check position filtering', 'select:lt(2) :not(:first)', ['option1b', 'option1c', 'option1d', 'option2a', 'option2b', 'option2c', 'option2d'], doc, $, test);
    t('Check position filtering', 'div.nothiddendiv:eq(0)', ['nothiddendiv'], doc, $, test);
    t('Check position filtering', 'div.nothiddendiv:last', ['nothiddendiv'], doc, $, test);
    t('Check position filtering', 'div.nothiddendiv:not(:lt(0))', ['nothiddendiv'], doc, $, test);

    t('Check element position', 'div div:eq(0)', ['nothiddendivchild'], doc, $, test);
    t('Check element position', 'div div:eq(5)', ['t2037'], doc, $, test);
    t('Check element position', 'div div:eq(28)', ['hide'], doc, $, test);
    t('Check element position', 'div div:first', ['nothiddendivchild'], doc, $, test);
    t('Check element position', 'div > div:first', ['nothiddendivchild'], doc, $, test);
    t('Check element position', '#dl div:first div:first', ['foo'], doc, $, test);
    t('Check element position', '#dl div:first > div:first', ['foo'], doc, $, test);
    t('Check element position', 'div#nothiddendiv:first > div:first', ['nothiddendivchild'], doc, $, test);
    
    test.done();
    reset();
}

exports.testPseudoForm = function(test) {
    test.expect(7);
    
    t('Form element :input', '#form :input', ['text1', 'text2', 'radio1', 'radio2', 'check1', 'check2', 'hidden1', 'hidden2', 'name', 'search', 'button', 'area1', 'select1', 'select2', 'select3'], doc, $, test);
    t('Form element :radio', '#form :radio', ['radio1', 'radio2'], doc, $, test);
    t('Form element :checkbox', '#form :checkbox', ['check1', 'check2'], doc, $, test);
    t('Form element :text', '#form :text:not(#search)', ['text1', 'text2', 'hidden2', 'name'], doc, $, test);
    t('Form element :radio:checked', '#form :radio:checked', ['radio2'], doc, $, test);
    t('Form element :checkbox:checked', '#form :checkbox:checked', ['check1'], doc, $, test);
    t('Form element :radio:checked, :checkbox:checked', '#form :radio:checked, #form :checkbox:checked', ['radio2', 'check1'], doc, $, test);

    //t('Selected Option Element', '#form option:selected', ['option1a','option2d','option3b','option3c'], doc, $, test);
    
    test.done();
    reset();
}



var $main   = $('#main'),
    fixture = $main[0].innerHTML;
function reset() {
    $main[0].innerHTML = fixture;
}

//console.log($('div').get());
//console.log(process);
//console.log(fixture.substr(0,100));

function q(d,c) {
    var r = [];

    for (var i = 0; i < c.length; i++) {
        r.push(d.getElementById(c[i]));
    }

    return r;
}

function t(a,b,c,d,$,t) {
    var n = $(b).get();

    t.same(n, q(d,c), a + ' (' + b + ')');
}












