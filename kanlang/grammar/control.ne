@lexer lexer
@include "./helpers.ne"
@include "./expression.ne"

if -> "if" __ paren[expression] __ block[statement:+]
    | "if" __ paren[expression] __ block[statement:+] elif
    | "if" __ paren[expression] __ block[statement:+] else
elif -> "else" "if" __ paren[expression] __ block[statement:+] elif:?
      | "else" "if" __ paren[expression] __ block[statement:+] else
else -> "else" __ paren[expression] __ block[statement:+]