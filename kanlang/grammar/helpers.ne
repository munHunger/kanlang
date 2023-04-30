@lexer lexer

paren[X] ->   "(" __ $X __ ")" {% d => d[2] %}
block[X] ->   "{" __ $X __ "}" {% d => d[2] %}
bracket[X] -> "[" __ $X __ "]" {% d => d[2] %}