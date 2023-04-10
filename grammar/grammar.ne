@{%
const moo = require("moo");

const lexer = moo.compile({
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  symbolName: /[a-z][a-z0-9A-Z]+/,
  typeName: /[A-Z][a-z0-9A-Z]+/,
  lparen:  '(',
  rparen:  ')',
  lbracket: '{',
  rbracket: '}',
  NL:      { match: /\n/, lineBreaks: true },
  op: ['+','/','*'],
  eq: '=',
});

function idValue(d) { return d[0].value ?? d[0]; }
%}

# Pass your lexer object using the @lexer option:
@lexer lexer
@preprocessor typescript

@include "./expression.ne"


main -> function {% idValue %}

paren[X] -> "(" $X ")" {% d => d[1] %}
block[X] -> "{" __ $X __ "}" {% d => d[2] %}

function -> functionSignature __ block[statement:+] {% d => 
({function: {signature: d[0], body: d[2].flat()}}) %}


functionSignature -> "fn" _ %symbolName paren[argsArray] _ variableType {% d => 
({name: d[2].value, args: d[3], returnType: d[5]}) %}

argsArray -> variableName _ variableType {% d => ({name: d[0], type: d[2]}) %}
           | variableName _ variableType "," __ argsArray

variableName -> %symbolName {% d => d[0].value %}
variableType -> %typeName {% d => ({type: d[0].value}) %}
              | %typeName _ "alias" _ primitiveType {% d => ({type: d[0].value, alias: d[4]}) %}

primitiveType -> "num"    {% idValue %}
               | "string" {% idValue %}
               | "bool"   {% idValue %}

statement -> expression %NL {% idValue %}
           #| variableName _ "=" _ statement # assignment
           | primitiveType _ variableName _ "=" _ statement {% d => ({ assignment: {type: {type: d[0]}, name: d[2], value: d[6]}}) %}# variable creation
           # return statement
           | "return" _ statement {% d => ({return: d[2]})%}

__ -> _:?
_ -> %ws
   | %NL