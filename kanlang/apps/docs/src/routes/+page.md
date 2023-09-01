# Kanlang

What is kanlang?

It is a programming language built to explore transformation oriented programming.
Meaning that it is an attempt at a paradigm shift from object orientation to something else.

The shortest way to describe what Kanlang is without introducing any new concepts is to say that it is a programming language in which you are not allowed to name your functions or for that matter call them directly.

## Transformation Oriented Programming (TOP)

TOP is unfortunately not a well known concept. However it was introduced in 2003 by [_V.L. WINTER ET AL_](https://www.sciencedirect.com/science/article/abs/pii/S0065245803580020?via%3Dihub).
They coined the term, but noted that the programming methodology wasn't new and has in fact been used in compilers among other things.

So, TOP is in essence a set of rules. For instance:

```
P -> "(" E ")" E

E -> null
   | "(" E ")" E
```

What can we do with those 2 rules?
Well we can check if a string contains matched parenthesis.
So given the string `(()())(())` and those rules we can easily see that all parenthesis are closed properly.
And we can make sure that `)(` is not valid, even though they have the same amount of opening and closing parenthesis.

```
P
(E)E
((E)E)E
((null)E)E
(()(E))E
(()(null))E
(()())(E)E
(()())((E)E)E
(()())((null)E)E
(()())(()null)E
(()())(())null
(()())(())
```

This methodology can provide pretty simple solutions to what can otherwise be complex problems.
For instance in the parenthesis example you might run into some issues if tasked with creating an AST showing what is contained in what parenthesis.
Whereas with TOP, this is a trivial problem.

## TOP in Kanlang

Rules are defined as a set of input arguments and a set of output types, with a function body that resolves the output.

```kanlang
(c:Celsius): Kelvin {
	return c + 273,15;
}
```
