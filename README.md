token.js
========

Token.js is a simple lexer written in JavaScript. You specify rules with regular expressions and then a token to return or, optionally, a function to execute.

Example usage:

```javascript
var numIDs = 0;
var lexer = new TokenJS.Lexer();
lexer.init('num := 3 + 4 #add the numbers', {
  root: [
    [/#.*/, TokenJS.Ignore],  //ignore comments
    [/\s+/, TokenJS.Ignore],  //ignore whitespace
    [/[a-zA-Z]+/, function() {
      numIDs++;     //perform a side-effect
      return 'ID';
    }],
    [/[0-9]+/, 'NUMBER'],
    [/:=/, 'ASSIGN'],
    [/\+/, 'PLUS']
  ]
});

console.log(lexer.tokenize());
console.log("Identifiers: " + numIDs);
```

This outputs the following:

```javascript
[{text: "num", token: "VAR"}, {text: ":=", token: "ASSIGN"}, {text: "3", token: "NUMBER"},
 {text: "+", token: "PLUS"}, {text: "4", token: "NUMBER"}]
Identifiers: 1  
```

init
----

The first argument to ```init``` is the input text. The second is an object consisting of arrays of rules. Each rule is a tuple consisting of a regular expression followed by either a token, a function to execute, or ```TokenJS.Ignore```.

`root` is a required rule set and indicates the default state of the lexer. Additional rules may be added as needed. See `state` below for instructions on switching states.

As the example above illustrates, use ```TokenJS.Ignore``` to indicate that characters should be consumed without producing a token. This is useful for discarding whitespace and comments.

A custom function takes the matched text as a parameter. The return value of the function will be the token. If a function does not return a value, as in the example above, then the lexer will consider the rest of the rules for the current state until it either 1) finds a value and returns that as a token, 2) ```TokenJS.Ignore``` is encountered, or 3) the rules are exhausted, in which case a syntax error will be thrown.

In the case of multiple matches, the rule producing the longest match will be taken. If there is a tie for longest match, the first rule will be used.

tokenize
--------

```tokenize``` returns an array of all resulting tokens. Any side effects resulting from functions will also be executed.

getNextToken
------------

To get tokens one at a time, call ```getNextToken```. When all input is exhausted, ```getNextToken``` will return ```TokenJS.EndOfStream```.

```javascript
var token = getNextToken();
while (token !== TokenJS.EndOfStream) {
  console.log(token);
  token = getNextToken();
}
```

state
-----

Sometimes it is helpful to change states within your lexer to match on different rules.

To change the state of the lexer, call `this.state` in your callback function, passing the new state as a string. Note that after changing state within a function, you must return either a token or `TokenJS.Ignore`. Otherwise a syntax error will be raised.

Here is an example of using states to handle HTML comments:

```javascript
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
      return TokenJS.Ignore;  //omitting this will cause a syntax error
    }],
    [/./, TokenJS.Ignore] //consume anything that is not an end-of-comment
  ]
});
```

Output:

```javascript
[{text: 'before', token: 'BEFORE'}, {text: 'after', token: 'AFTER'}]
```

reset
-------

Use the `reset` method to reset the lexer to the `root` state and start scanning from the beginning. This is called implicitly whenever you call `tokenize`.
