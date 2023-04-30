@{%
const moo = require("moo");

const lexer = moo.compile({
  ws:     /[ \t]+/,
  number: /[0-9]+/,
  symbolName: {match: /[a-z][a-z0-9A-Z]*/, type: moo.keywords({
        'keyword': ['while', 'if', 'else', 'return'],
        'builtins': ['print', 'split']
      })},
  typeName: /[A-Z][a-z0-9A-Z]*/,
  lparen:  '(',
  rparen:  ')',
  lbracket: '{',
  rbracket: '}',
  lsbracket: '[',
  rsbracket: ']',
  NL:      { match: /\n/, lineBreaks: true },
  op: ['+','/','*'],
  eq: '=',
  string: /".*?"/
});

const variables = new Set();

function idValue(d) { return d[0].value ?? d[0]; }
%}

# Pass your lexer object using the @lexer option:
@lexer lexer
@preprocessor typescript

@include "./expression.ne"
@include "./helpers.ne"

main -> function {% d => ({root: d}) %}
      | statement {% d => ({root: d}) %}
      | %NL {% d => ({root: undefined}) %}
      | main main {% d => ({root: d.map(d => d.root).filter(v => v).flat()}) %}

function -> functionSignature __ block[statement:+] {% d => 
({function: {signature: d[0], body: d[2].flat()}}) %}


functionSignature -> "fn" _ %symbolName paren[argsArray:?] _ variableType {% d => 
({name: d[2].value, args: d[3].filter(v=>v), returnType: d[5]}) %}

argsArray -> variableName _ variableType {% d => ({name: d[0], type: d[2]}) %}
           | variableName _ variableType "," __ argsArray

variableName -> %symbolName {% d => d[0].value %}
variableType -> %typeName                                    {% d => ({type: d[0].value}) %}
              | bracket[variableType]                        {% d => ({type: d[0], array: true}) %}
              | %typeName _ "alias" _ primitiveType          {% d => ({type: d[0].value, alias: d[4]}) %}
              | %typeName _ "alias" _ bracket[primitiveType] {% d => ({type: d[0].value, alias: d[4], array: true}) %}

primitiveType -> "num"    {% idValue %}
               | "string" {% idValue %}
               | "bool"   {% idValue %}

statement -> __ expression %NL {% d => ({ expression: d[1] }) %}
           # Implicit create if not exists 
           | variableName _ "=" _ expression  %NL {% d => ({ assignment: {type: {type: undefined}, name: d[2], value: d[6]}}) %} # assignment
           # variable creation
           | __ primitiveType _ variableName _ "=" _ expression %NL {% d => ({ assignment: {type: {type: d[1]}, name: d[3], value: d[7]}}) %}
           | __ variableType _ variableName _ "=" _ expression %NL {% d => {
              variables.add(d[3])
              return { assignment: {type: d[1], name: d[3], value: d[7]}}} %}
           # dependency injection
           | __ variableType _ variableName %NL {% d => ({dependency: {type: d[1], name: d[3]}}) %}
           # return statement
           | __ "return" _ expression %NL {% d => ({return: d[3]})%}
           # Type alias declaration
           | __ variableType %NL {% d => ({typeDef: d[1]})%}
           | if

__ -> _:?
_ -> %ws
   | %NL