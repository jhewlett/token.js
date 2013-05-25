var JSLex = JSLex || {};

JSLex.Lexer = function(){
    var _rules,
        _input;

    var init = function(input, rulesArr) {
        _input = input;
        _rules = rulesArr;
    }

    var getNextToken = function() {
        var tempMatch;

        for(var i = 0; i < _rules.length; i++) {

            var regex = _rules[i][0];
            var value = _rules[i][1];

            var match = regex.exec(_input);

            //if it's a function that has no return value, then keep going through actions. If another rules is found that returns a value,
            //consume the text then. Otherwise, consume it after exhausting all rules.

            //todo: cover with tests
            //todo: don't repeat input replace so much

            if (match && match.index === 0) {
                if (typeof value === 'function') {
                    var returnValue = value(match[0]);
                    if (returnValue) {
                        _input = _input.replace(match[0], '');
                        return returnValue;
                    } else {
                        tempMatch = match[0];
                    }
                } else if (value !== '') {
                    _input = _input.replace(match[0], '');
                    return value;
                } else {
                    _input = _input.replace(match[0], '');
                    return getNextToken();
                }
            }

            if (i === _rules.length - 1 && tempMatch) {
                _input = _input.replace(tempMatch, '');
                return;
            }
        }

        throw "Invalid character: '" + _input[0] + "'";
    }

    var tokenize = function() {
        var allTokens = [];
        while (_input.length > 0) {
            var token = getNextToken();
            if (token) {
                allTokens.push(token);
            }
        }

        return allTokens;
    }

    return {
        init: init,
        getNextToken: getNextToken,
        tokenize: tokenize
    };
}