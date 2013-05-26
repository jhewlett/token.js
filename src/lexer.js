var JSLex = JSLex || {};

JSLex.ignore = function() {};

JSLex.SyntaxError = function(message) {
    this.name = "SyntaxError";
    this.message = message;
}

JSLex.EndOfFileError = function(message) {
    this.name = "NoInputError";
    this.message = message;
}

JSLex.Lexer = function(){
    var _rules,
        _input;

    var init = function(input, rulesArr) {
        _input = input;
        _rules = rulesArr;
    }

    var hasMoreTokens = function() {
        return _input.length > 0;
    }

    var getNextToken = function() {
        if (!hasMoreTokens()) {
            throw new JSLex.EndOfFileError('No more input to consume.');
        }

        var matchText;

        for(var i = 0; i < _rules.length; i++) {

            var regex = _rules[i][0];
            var value = _rules[i][1];

            var match = regex.exec(_input);

            if (match && match.index === 0) {
                matchText = match[0];

                if (typeof value !== 'function') {
                    consume(matchText);
                    return value;
                } else {
                    var returnValue = value(match[0]);
                    if (hasValue(returnValue)) {
                        consume(matchText);
                        return returnValue;
                    }
                }
            }

            var allRulesExhausted = (i === _rules.length - 1);
            if (allRulesExhausted && matchText) {
                consume(matchText);
                return;
            }
        }


        throw new JSLex.SyntaxError("Invalid character: '" + _input[0].toString() + "'");
    }

    var consume = function(match) {
        _input = _input.replace(match, '');
    }

    var tokenize = function() {
        var allTokens = [];
        while (hasMoreTokens()) {
            var token = getNextToken();
            if (hasValue(token)) {
                allTokens.push(token);
            }
        }

        return allTokens;
    }

    var hasValue = function(variable) {
        return typeof variable !== 'undefined' && variable !== null;
    }

    return {
        init: init,
        getNextToken: getNextToken,
        tokenize: tokenize,
        hasMoreTokens: hasMoreTokens
    };
}