var JSLex = JSLex || {};

JSLex.Ignore = {
    toString: function() {
        return 'Ignored token'
    }
};

JSLex.EndOfStream = {
    toString: function() {
        return "End of stream";
    }
};

JSLex.SyntaxError = function(message) {
    this.name = "SyntaxError";
    this.message = message;
};

JSLex.Lexer = function(){
    var _rules,
        _input,
        _index;

    var init = function(input, rulesArr) {
        _input = input;
        _rules = rulesArr;
        _index = 0;
    };

    //if rule has no return value, try next rules until a value is returned. If no value is returned,
    // and no ignore is found, then it's a lex error
    var getNextToken = function() {
        if (_index >= _input.length) return JSLex.EndOfStream;

        var matchText;

        for(var i = 0; i < _rules.length; i++) {
            var regex = _rules[i][0];
            var value = _rules[i][1];

            var match = regex.exec(_input.substring(_index));

            if (match && match.index === 0) {
                matchText = match[0];

                if (typeof value === 'function') {
                    var returnValue = value(match[0]);
                    if (returnValue === JSLex.Ignore) {
                        consume(matchText);
                        return getNextToken();
                    } else if (hasValue(returnValue)) {
                        consume(matchText);
                        return returnValue;
                    }
                } else {
                    consume(matchText);
                    if (value === JSLex.Ignore) {
                        return getNextToken();
                    } else {
                        return value;
                    }
                }
            }
        }

        throw new JSLex.SyntaxError("Invalid character '" + _input[_index] + "' at index " + (_index + 1));
    };

    var consume = function(match) {
        _index += match.length;
    };

    var tokenize = function() {
        var allTokens = [];
        var token = getNextToken();
        while (token !== JSLex.EndOfStream) {
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