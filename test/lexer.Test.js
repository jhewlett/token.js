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

test("ignore is a function on the namespace that returns undefined", function() {
    assertEquals('function', typeof JSLex.ignore);
    assertEquals(undefined, JSLex.ignore());
});

test("Tokenize with two tokens", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('ab',
        [
            [/[a-z]/, function(match) {return 'LETTER: ' + match;}]
        ]);

    assertEquals(['LETTER: a', 'LETTER: b'], lexer.tokenize());
});

test("Tokenize does not include null or undefined values", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('abc',
        [
            [/a/, JSLex.ignore],
            [/b/, null],
            [/c/, 'C']
        ]);

    assertEquals(['C'], lexer.tokenize());
});

test("hasMoreTokens", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('ab',
        [
            [/a/, JSLex.ignore],
            [/b/, JSLex.ignore]
        ]);

    assertTrue(lexer.hasMoreTokens());
    lexer.getNextToken();
    assertTrue(lexer.hasMoreTokens());
    lexer.getNextToken();
    assertFalse(lexer.hasMoreTokens());
});

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

test("getNextToken throws NoInputError if all input consumed", function() {
    expect(2);

    var lexer = new JSLex.Lexer();
    lexer.init('',
        [
            [/a/, JSLex.ignore]
        ]);

    try {
        lexer.getNextToken();
    } catch(e) {
        assertEquals('NoInputError', e.name);
        assertTrue(e.message.indexOf('No more input') > -1);
    }
});

//todo: is the situation in index.html a bug? How do I handle different matches?
// Just say that anything that doesn't return a value (eventually) should not consume?