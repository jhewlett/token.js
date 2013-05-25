var JSLex = JSLex || {};

JSLex.Lexer = function(){
    var _rules,
        _input;

    var init = function(input, rulesArr) {
        _input = input;
        _rules = rulesArr;
    }

    var getNextToken = function() {
        for(var i = 0; i < _rules.length; i++) {

            var regex = _rules[i][0];
            var value = _rules[i][1];

            var match = _input.search(regex);

            if (match === 0) {
                _input = _input.replace(regex, '');

                if (value !== 'IGNORE') {
                    return value;
                } else {
                    return getNextToken();
                }
            }
        }

        throw "Invalid character: '" + _input[0] + "'";
    }

    var tokenize = function() {
        var allTokens = [];
        while (_input.length > 0) {
            allTokens.push(getNextToken());
        }

        return allTokens;
    }

    return {
        init: init,
        getNextToken: getNextToken,
        tokenize: tokenize
    };
}