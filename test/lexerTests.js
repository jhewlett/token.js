module('getNextToken');

test("Single token with simple rule returns the value", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('0', {
        root: [
            [/[0-9]/, 'DIGIT']
    ]});

    assertEquals({text: '0', token: 'DIGIT'}, lexer.getNextToken());
});

test("Single token with function returns the value of the function", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('a', {
        root: [
            [/a/, function (text) {
                return text + text;
            }]
        ]
    });

    assertEquals({text: 'a', token: 'aa'}, lexer.getNextToken());
});

test("First matching rule has a side effect, second matching rule returns its value, third matching rule is ignored", function () {
    var lexer = new TokenJS.Lexer();
    var capture = '';
    lexer.init('a', {
        root: [
            [/./, function () {
                capture = 'sideEffect1';
            }],
            [/a/, 'LETTER'],
            [/./, function () {
                capture = 'sideEffect2';
            }]
        ]
    });

    assertEquals({text: 'a', token: 'LETTER'}, lexer.getNextToken());
    assertEquals('sideEffect1', capture);
});

test("If all remaining text is ignored, getNextToken returns EndOfStream", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('  ', {
        root: [
            [/\s+/, TokenJS.Ignore]
        ]
    });

    var token = lexer.getNextToken();
    assertEquals(TokenJS.EndOfStream, token);
});

test("TokenJS.Ignore consumes text but does not return a token", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init(' +', {
        root: [
            [/\s/, TokenJS.Ignore],
            [/\+/, 'PLUS']
        ]
    });

    var token = lexer.getNextToken();
    assertEquals({text: '+', token: 'PLUS'}, token);
});

test("Function that returns TokenJS.Ignore acts the same as using TokenJS.Ignore directly", function () {
    var numSpaces = 0;
    var lexer = new TokenJS.Lexer();
    lexer.init(' +', {
        root: [
            [/\s/, function () {
                numSpaces++;
                return TokenJS.Ignore;
            }],
            [/\+/, 'PLUS']
        ]
    });

    var token = lexer.getNextToken();
    assertEquals({text: '+', token: 'PLUS'}, token);
    assertEquals(1, numSpaces);
});

 test("getNextToken throws NoMatchError if no match found", function () {
    expect(4);

    var lexer = new TokenJS.Lexer();
    lexer.init('ab', {
        root: [
            [/b/, TokenJS.Ignore]
        ]
    });

    try {
        lexer.getNextToken();
    } catch (e) {
        assertEquals('SyntaxError', e.name);
        assertTrue(e.message.indexOf('Invalid character') > -1);
        assertTrue(e.message.indexOf("'a'") > -1);
        assertTrue(e.message.indexOf("index 1") > -1);
    }
});

test("NoMatchError displays the right character and index", function () {
    expect(2);

    var lexer = new TokenJS.Lexer();
    lexer.init('ab', {
        root: [
            [/a/, TokenJS.Ignore]
        ]
    });

    try {
        lexer.getNextToken();
    } catch (e) {
        assertTrue(e.message.indexOf("'b'") > -1);
        assertTrue(e.message.indexOf("index 2") > -1);
    }
});

module('tokenize');

test("Tokenize with two tokens", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('ab', {
        root: [
            [/[a-z]/, function (match) {
                return 'LETTER: ' + match;
            }]
        ]
    });

    assertEquals([
        {text: 'a', token: 'LETTER: a'},
        {text: 'b', token: 'LETTER: b'}
    ], lexer.tokenize());
});

test("Tokenize does not include ignored values", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('abc', {
        root: [
            [/a/, TokenJS.Ignore],
            [/b/, TokenJS.Ignore],
            [/c/, 'C']
        ]
    });

    assertEquals([{text: 'c', token: 'C'}], lexer.tokenize());
});

test("Tokenize resets the index", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('a', {
        root: [
            [/a/, 'A']
        ]
    });

    lexer.getNextToken();

    assertEquals([{text: 'a', token: 'A'}], lexer.tokenize());
});

test("Lexer picks the rule with the longest match (maximal munch)", function () {
    var lexer = new TokenJS.Lexer();
    lexer.init('var variant', {
        root: [
            [/\s+/, TokenJS.Ignore],
            [/var/, 'VAR'],
            [/[a-z]+/, 'ID']
        ]
    });

    assertEquals([{text: 'var', token: 'VAR'}, {text: 'variant', token: 'ID'}], lexer.tokenize());
});

module('state');

test("Two different states, does not match rule from another state", function() {
    expect(1);

    var lexer = new TokenJS.Lexer();
    lexer.init('a', {
        root: [
            [/[0-9]/, 'DIGIT']
        ],
        secondary: [
            [/a/, 'A']
        ]
    });

    try {
        lexer.getNextToken();
    } catch(e) {
        assertEquals('SyntaxError', e.name);
    }
});

test("Switching states", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('ab', {
        root: [
            [/a/, function() {
                this.state('secondary');
                return 'A';
            }]
        ],
        secondary: [
            [/b/, 'B']
        ]
    });

    assertEquals([{text: 'a', token: 'A'}, {text: 'b', token: 'B'}], lexer.tokenize());
});

test("Switching states to handle comments", function() {
    var lexer = new TokenJS.Lexer();
    lexer.init('before<!-- consumed-text with before and after and -- dashes -->after', {
        root: [
            [/before/, 'BEFORE'],
            [/after/, 'AFTER'],
            [/<!--/, function() {
                this.state('comment');
                return TokenJS.Ignore;
            }]
        ],
        comment: [
            [/-->/, function() {
                this.state('root');
                return TokenJS.Ignore;
            }],
            [/./, TokenJS.Ignore]
        ]
    });

    assertEquals([{text: 'before', token: 'BEFORE'}, {text: 'after', token: 'AFTER'}], lexer.tokenize());
});

test("Switching states without returning a token is a syntax error.", function() {
    expect(3);

    var lexer = new TokenJS.Lexer();
    lexer.init('a',
        {
            root: [
                [/a/, function() {
                    this.state('secondary');
                }],
                [/a/, 'A']
            ],
            secondary: [
            ]
        });

    try {
        lexer.getNextToken();
    } catch(e) {
        assertEquals('SyntaxError', e.name);
        assertTrue(e.message.indexOf('Invalid character') > -1);
        assertTrue(e.message.indexOf("'a'") > -1);
    }
});

test("switching to a state that doesn't exist throws a state error", function() {
    expect(2);
    var lexer = new TokenJS.Lexer();

    try {
        lexer.init('a', {
            root: [
                [/a/, 'A']
            ]
        });

        lexer.state('none');
    } catch(e) {
        assertEquals('StateError', e.name);
        assertTrue(e.message.indexOf("Missing state: 'none'") > -1);
    }
});

module('reset');

test('reset sets the index back to 0', function() {
   var lexer = new TokenJS.Lexer();
    lexer.init('ab', {
        root: [
            [/a/, 'A']
        ]
    });

    var expected = {text: 'a', token: 'A'};

    assertEquals(expected, lexer.getNextToken());
    lexer.reset();
    assertEquals(expected, lexer.getNextToken());
});