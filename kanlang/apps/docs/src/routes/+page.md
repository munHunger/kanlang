<script>
	import Version from './Version.svelte'
</script>

# Kanlang

<Version />

What is kanlang?

It is a programming language built to explore transformation oriented programming.
Meaning that it is an attempt at a paradigm shift from object orientation to something else.

The shortest way to describe what Kanlang is without introducing any new concepts is to say that it is a programming language in which you are not allowed to name your functions or for that matter call them directly.

## Installing

_TODO: write install instructions_

If you prefer to try it before downloading you can have a look at the [web editor](/web)

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
	return c + 273.15;
}
```

And here comes the question: How do I invoke the rule if I don't have a name handle for it?
Short answer is that you don't. But you leave it to the compiler.

So instead of doing a normal function call you tell the compiler that the body of your rule requires a value of a certain type.

```kanlang
(c:Celsius): Kelvin {
	return c + 273.15;
}

(f: Fahrenheit): Kelvin {
	c := (f - 32) * 5 / 9 as Celsius; //Assign the converted value of f to c
	return *Kelvin; //Request a value of type Kelvin and return it
}
```

This works since there is a rule in the scope that transforms from `Celsius` to `Kelvin`, and in the current scope there is a variable `c` of type `Celsius`. So the compiler figures out what you want to do and calls the function for you.

## Multiple return

A rule can have multiple return types, such as

```kanlang
(k: Kelvin): Celsius | Error {
	if k { //TODO: don't support comparators at the moment
		return 0 as Error
	}
	return k + 273.15 as Celsius
}
```

This makes it a bit complicated as the type request needs to handle all possible return types.
So a request will look like this

```kanlang
{
	*Celsius {
		e: Error {
			return e; //escapes current context and can be used as a default
		}
	}
}
```

Note that not taking care of all types results in compile errors.
And not having return statements for each type in rule signature also results in compile errors.

## Types

Since there are no accessible function handles and no way to directly pick and choose which function to call you have to be quite strict with the types.

For instance if you have a type `User`, you might want to create an alias for it named `AuthenticatedUser`. By doing this you know that if you have a variable of type `AuthenticatedUser` you don't have to care about checking it against the auth system. But at the same time `AuthenticatedUser` can be nothing more than an alias for `User`, meaning that they behave the same way (both have an `email` property) and if you do not care if the user is authenticated or not, you might as well just use `User`.

So how does types work in Kanlang?
You can create an alias like this

```kanlang
type Celsius alias num
```

And these aliases can chain however long you want, for instance

```kanlang
type NonFreezingCelsius alias Celsius
```

Aliases can also be created inline of functions.
So instead of writing

```kanlang
type Celsius alias num
(c: Celsius): num {
	//...
}
```

you can inline the type by omitting the `type` keyword

```kanlang
(c: Celsius alias num): num {
	//...
}
```

```info
Note that in current version only num and boolean exists as primitive types.
And there is no way to create complex types
```

## Running the code

After creating all rules you need a way to start the transformation.
This is done by creating the `main` rule.

```kanlang
(): SysCode {

}
```

`SysCode` is an alias for `boolean` and should indicate if the program terminated correctly or not.

This rule will be the starting point of your program.
