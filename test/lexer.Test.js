module('getNextToken');

test("Single token with single rule is returned", function() {
    var lexer = new JSLex.Lexer();
    lexer.init('0',
    [
        [/[0-9]/, 'DIGIT']
    ]);

    equal('DIGIT', lexer.getNextToken());
});
