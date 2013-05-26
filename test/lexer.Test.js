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
