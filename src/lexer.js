var TokenJS = TokenJS || {};

TokenJS.Ignore = {
    toString: function() {
        return 'Ignored rule'
    }
};

TokenJS.EndOfStream = {
    toString: function() {
        return "End of token stream";
    }
};

TokenJS.SyntaxError = function(message) {
    this.name = "SyntaxError";
    this.message = message;
};

TokenJS.Lexer = function(){
    var _rules,
        _input,
        _index;

    var init = function(input, rules) {
        _input = input;
        _rules = rules;
        _index = 0;
    };

    var getNextToken = function() {
        if (_index >= _input.length) return TokenJS.EndOfStream;

        var matchText;

        for(var i = 0; i < _rules.length; i++) {
            var regex = _rules[i][0];
            var value = _rules[i][1];

            var match = regex.exec(_input.substring(_index));

            if (match && match.index === 0) {
                matchText = match[0];

                if (typeof value === 'function') {
                    var returnValue = value(matchText);
                    if (returnValue === TokenJS.Ignore) {
                        consume(matchText);
                        return getNextToken();
                    } else if (hasValue(returnValue)) {
                        consume(matchText);
                        return {text: matchText, token: returnValue};
                    }
                } else {
                    consume(matchText);
                    if (value === TokenJS.Ignore) {
                        return getNextToken();
                    } else {
                        return {text: matchText, token: value};
                    }
                }
            }
        }

        throw new TokenJS.SyntaxError("Invalid character '" + _input[_index] + "' at index " + (_index + 1));
    };

    var consume = function(match) {
        _index += match.length;
    };

    var tokenize = function() {
        _index = 0;
        var allTokens = [];
        var token = getNextToken();
        while (token !== TokenJS.EndOfStream) {
            allTokens.push(token);
            token = getNextToken();
        }

        return allTokens;
    };

    var hasValue = function(variable) {
        return typeof variable !== 'undefined' && variable !== null;
    };

    return {
        init: init,
        getNextToken: getNextToken,
        tokenize: tokenize
    };
};