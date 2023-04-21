@lexer lexer

#celcius * 9 / 5 + 32

paren[X] -> "(" $X ")" {% d => d[1] %}
expression -> exp _ operator _ expression {% d => ({op: d[2], args: [d[0], d[4]]}) %}
            | exp {% id %}
            | operator __ exp {% d => ({op: d[0], args: [d[2]]}) %} # call operator with right
            | exp __ operator {% d => ({op: d[2], args: [d[0]]}) %} # call operator with right
            #| operator _ "(" _ expression _ ("," _ expression):+ _ ")"     # call operator with right
            #| "(" _ expression _ ")"             # group
            #| variableName {% d => ({var: d[0]}) %}
            #| constant {% id %}
            #| "(" _ ")"
            #| null # needed for functions without arguments, ex: print()
exp -> paren[ expression ] {% d => d[0][0] %} # The extra index seems like a hack
      | variableName {% d => ({var: d[0]}) %}
      | constant {% d => ({const: d[0]}) %}
# print "hello world"
# print ("hello world")
# concat ("hello", "world")
# "hello" concat "world"

# function { op: concat, args : hello, world}

# (1, 3) <- not legal unless prefixed by operator. + (1, 3) is legal

constant -> %number {% d => parseInt(d[0].value) %}


operator -> mathFunctions {% d => d[0][0].value %}
          | variableName {%
    function(d,l, reject) {
        if (variables.has(d[0])) {
            return reject;
        } else {
            return { fn: d[0] };
        }
    }
%}

mathFunctions -> "+" | "-" | "*" | "/" | "%" | "**" | "==" | "!=" | "===" | "!==" | "<" | "<=" | ">" | ">=" | "&&" | "||" | "!" | "??"