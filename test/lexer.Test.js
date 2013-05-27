module('All Tests');

test("Single token with simple rule returns the value", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('0',
    [
        [/[0-9]/, 'DIGIT']
    ]);

    assertEquals('DIGIT', lexer.getNextToken());
});

test("Single token with function returns the value of the function", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('a',
        [
            [/a/, function(text) {return text + text;}]
        ]);

    assertEquals('aa', lexer.getNextToken());
});

test("First matching rule has a side effect, second matching rule returns its value, third matching rule is ignored", function() {
    var lexer = new JSLex.Lexer();
    var capture = '';
    lexer.init('a',
        [
            [/./, function() { capture = 'sideEffect1'; }],
            [/a/, 'LETTER'],
            [/./, function() { capture = 'sideEffect2'; }]
        ]);

    assertEquals('LETTER', lexer.getNextToken());
    assertEquals('sideEffect1', capture);
});

test("If all remaining text is ignored, getNextToken returns EndOfStream", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('  ',
        [
            [/\s+/, JSLex.Ignore]
        ]);

    var token = lexer.getNextToken();
    assertEquals(JSLex.EndOfStream, token);
});

test("JSLex.Ignore consumes text but does not return a token", function() {
    var lexer = new JSLex.Lexer();
    lexer.init(' +',
        [
            [/\s/, JSLex.Ignore],
            [/\+/, 'PLUS']
        ]);

    var token = lexer.getNextToken();
    assertEquals('PLUS', token);
});

test("Function that returns JSLex.Ignore acts the same as using JSLex.Ignore directly", function() {
    var numSpaces = 0;
    var lexer = new JSLex.Lexer();
    lexer.init(' +',
        [
            [/\s/, function() { numSpaces++; return JSLex.Ignore; }],
            [/\+/, 'PLUS']
        ]);

    var token = lexer.getNextToken();
    assertEquals('PLUS', token);
    assertEquals(1, numSpaces);
});

test("Tokenize with two tokens", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('ab',
        [
            [/[a-z]/, function(match) {return 'LETTER: ' + match;}]
        ]);

    assertEquals(['LETTER: a', 'LETTER: b'], lexer.tokenize());
});

//todo: is this test irrelevant since everything (except ignore) must return a value now?
//test("Tokenize does not include null or undefined values", function() {
//    var lexer = new JSLex.Lexer();
//    lexer.init('abc',
//        [
//            [/a/, undefined],
//            [/b/, null],
//            [/c/, 'C']
//        ]);
//
//    assertEquals(['C'], lexer.tokenize());
//});

test("getNextToken throws NoMatchError if no match found", function() {
    expect(3);

    var lexer = new JSLex.Lexer();
    lexer.init('ab',
        [
            [/b/, JSLex.ignore]
        ]);

    try {
        lexer.getNextToken();
    } catch(e) {
        assertEquals('SyntaxError', e.name);
        assertTrue(e.message.indexOf('Invalid character') > -1);
        assertTrue(e.message.indexOf("'a'") > -1);
    }
});

//todo: is the situation in index.html a bug? How do I handle different matches?
// Just say that anything that doesn't return a value (eventually) should not consume?