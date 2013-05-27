module('Lexer.js');

test("Single token with simple rule returns the value", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('0',
    [
        [/[0-9]/, 'DIGIT']
    ]);

    assertEquals('DIGIT', lexer.getNextToken());
});

test("Single token with function returns the value of the function", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('a',
        [
            [/a/, function(text) {return text + text;}]
        ]);

    assertEquals('aa', lexer.getNextToken());
});

test("First matching rule has a side effect, second matching rule returns its value, third matching rule is ignored", function() {
    var lexer = new TokenJS.Lexer();
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
    var lexer = new TokenJS.Lexer();
    lexer.init('  ',
        [
            [/\s+/, TokenJS.Ignore]
        ]);

    var token = lexer.getNextToken();
    assertEquals(TokenJS.EndOfStream, token);
});

test("TokenJS.Ignore consumes text but does not return a token", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init(' +',
        [
            [/\s/, TokenJS.Ignore],
            [/\+/, 'PLUS']
        ]);

    var token = lexer.getNextToken();
    assertEquals('PLUS', token);
});

test("Function that returns TokenJS.Ignore acts the same as using TokenJS.Ignore directly", function() {
    var numSpaces = 0;
    var lexer = new TokenJS.Lexer();
    lexer.init(' +',
        [
            [/\s/, function() { numSpaces++; return TokenJS.Ignore; }],
            [/\+/, 'PLUS']
        ]);

    var token = lexer.getNextToken();
    assertEquals('PLUS', token);
    assertEquals(1, numSpaces);
});

test("Tokenize with two tokens", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('ab',
        [
            [/[a-z]/, function(match){
                return 'LETTER: ' + match;
            }]
        ]);

    assertEquals(['LETTER: a', 'LETTER: b'], lexer.tokenize());
});

test("Tokenize does not include ignored values", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('abc',
        [
            [/a/, TokenJS.Ignore],
            [/b/, TokenJS.Ignore],
            [/c/, 'C']
        ]);

    assertEquals(['C'], lexer.tokenize());
});

test("getNextToken throws NoMatchError if no match found", function() {
    expect(4);

    var lexer = new TokenJS.Lexer();
    lexer.init('ab',
        [
            [/b/, TokenJS.Ignore]
        ]);

    try {
        lexer.getNextToken();
    } catch(e) {
        assertEquals('SyntaxError', e.name);
        assertTrue(e.message.indexOf('Invalid character') > -1);
        assertTrue(e.message.indexOf("'a'") > -1);
        assertTrue(e.message.indexOf("index 1") > -1);
    }
});

test("NoMatchError displays the right character", function() {
    expect(2);

    var lexer = new TokenJS.Lexer();
    lexer.init('ab',
        [
            [/a/, TokenJS.Ignore]
        ]);

    try {
        lexer.getNextToken();
    } catch(e) {
        assertTrue(e.message.indexOf("'b'") > -1);
        assertTrue(e.message.indexOf("index 2") > -1);
    }
});