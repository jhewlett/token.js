var JSLex = JSLex || {};

JSLex.Lexer = function(){
    var _dict,
        _input;

    var init = function(input, rules) {
        _input = input;
        prepareRules(rules);
    }

    var prepareRules = function(rules) {
        _dict = {};

        var lines = rules.split('\n');

        for(var i = 0; i < lines.length; i++) {
            var ruleParts = lines[i].split('->');

            if (ruleParts.length === 2) {
                _dict[ruleParts[0].trim()] = ruleParts[1].trim();
            }
        }
    }

    var getNextToken = function() {
        for(var key in _dict) {
            var regex = new RegExp(key);

            var match = _input.search(regex);

            if (match === 0) {
                _input = _input.replace(regex, '');

                if (_dict[key] !== 'IGNORE') {
                    return _dict[key];
                } else {
                    return getNextToken();
                }
            }
        }

        throw "Invalid token: '" + _input[0] + "'";
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