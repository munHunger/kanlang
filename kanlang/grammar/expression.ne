@lexer lexer
@include "./helpers.ne"

paren[X] -> "(" $X ")" {% d => d[1] %}
expression -> exp space operator space expression {% d => ({op: d[2], args: [d[0], d[4]]}) %}
            | exp {% id %}
            | operator space exp {% d => ({op: d[0], args: [d[2]]}) %} # call operator with right
            | exp space operator {% d => ({op: d[2], args: [d[0]]}) %} # call operator with right
            #Lambda
            | block[expression %NL statement:+] #TODO: fix the processing

            #| operator _ "(" _ expression _ ("," _ expression):+ _ ")"     # call operator with right
            #| "(" _ expression _ ")"             # group
            #| variableName {% d => ({var: d[0]}) %}
            #| constant {% id %}
            #| "(" _ ")"
            #| null # needed for functions without arguments, ex: print()
exp -> paren[ expression ] {% d => d[0][0] %} # The extra index seems like a hack
      | variableName {% d => ({var: d[0]}) %}
      | constant {% d => ({const: d[0]}) %}
constant -> %number {% d => parseInt(d[0].value) %}
          | %string {% d => d[0].value %}
          | "[" "]" #TODO: not sure how to handle this one


operator -> mathFunctions {% d => d[0][0].value %}
          | builtins {% d => ({ builtin: d[0] }) %}
          | variableName {%
    function(d,l, reject) {
        if (variables.has(d[0])) {
            return reject;
        } else {
            return { fn: d[0] };
        }
    }
%}

builtins -> %builtins {% idValue %}
mathFunctions -> "+" | "-" | "*" | "/" | "%" | "**" | "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "&&" | "||" | "!" | "??"

space -> %ws:?