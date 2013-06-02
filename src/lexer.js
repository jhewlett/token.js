var TokenJS = TokenJS || {};

TokenJS.Ignore = {
    toString: function() {
        return 'Ignored rule';
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

TokenJS.StateError = function(message) {
    this.name = "StateError";
    this.message = message;
};

TokenJS.Lexer = function(){
    var _rules;
    var _currentState;
    var _input;
    var _index;

    var init = function(input, rules) {
        _input = input;
        _rules = rules;
        _index = 0;
        state('root');
    };

    var getNextToken = function() {
        if (_index >= _input.length) {
            return TokenJS.EndOfStream;
        }

        var matchText;
        var currentRules = _rules[_currentState];

        for(var i = 0; i < currentRules.length; i++) {
            var regex = currentRules[i][0];
            var value = currentRules[i][1];

            var match = regex.exec(_input.substring(_index));

            if (match && match.index === 0) {
                matchText = match[0];

                if (typeof value === 'function') {
                    var returnValue = value.call(callbackContext, matchText);
                    if (returnValue === TokenJS.Ignore) {
                        consume(matchText);
                        return getNextToken();
                    } else if (hasValue(returnValue)) {
                        consume(matchText);
                        return {text: matchText, token: returnValue};
                    } else if (changedStateWithoutReturningToken(currentRules)) {
                        throwSyntaxError();
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

        throwSyntaxError();
    };

    var changedStateWithoutReturningToken = function(currentRules) {
        return _rules[_currentState] !== currentRules;
    };

    var throwSyntaxError = function() {
        throw new TokenJS.SyntaxError("Invalid character '" + _input[_index] + "' at index " + (_index + 1));
    };

    var state = function(newState) {
        if (!_rules.hasOwnProperty(newState)) {
            throw new TokenJS.StateError("Missing state: '" + newState + "'.");
        }
        _currentState = newState;
    };

    var consume = function(match) {
        _index += match.length;
    };

    var reset = function() {
        _index = 0;
    };

    var tokenize = function() {
        reset();
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

    var callbackContext = {
        state: state
    };

    return {
        init: init,
        getNextToken: getNextToken,
        tokenize: tokenize,
        state: state,
        reset: reset
    };
};