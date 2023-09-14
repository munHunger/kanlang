<script>
	import Version from '../Version.svelte'
</script>

# Kanlang

<Version />

What is kanlang?

It is a programming language built to explore transformation oriented programming.
Meaning that it is an attempt at a paradigm shift from object orientation to something else.

The shortest way to describe what Kanlang is without introducing any new concepts is to say that it is a programming language in which you are not allowed to name your functions or for that matter call them directly.

## Installing

Install the vscode extension from the `.vsix` file in the [latest release](https://github.com/munHunger/kanlang/releases).

Download the [Kanlang compiler binary](https://github.com/munHunger/kanlang/releases) from the same place and put it in your path. (note that it has only been tested on linux)

It is then as simple as running this in your terminal.

```bash
kanlang file.kan && node file.kan.js
```

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
	if k < 0 {
		return "must be larger than 0" as Error;
	}
	return k + 273.15 as Celsius;
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

## Explicit type conversion

There can be scenarios where you happen to have two values of the same type in your scope, and you request a variable requiring one variable of that type.

This scenario should generally be avoided, or if you end up in such a scenario you should aim to alias your types to provide additional information.

For example in the temperature case, it might be relevant to do something like this.

```kanlang
type Celsius alias num
type NonFreezingCelsius alias Celsius
```

both types will behave the same, but the type add a layer of metadata that distinguish them from each other.

However you can end up in the scenario where you want the transformation of multiple variables.
In which case you can explicitly ask for a variable to be converted using the `to` keyword.

```kanlang
a := 0 as Celsius;
b := 32 as Celsius;
x := a to Kelvin;
y := b to Kelvin;
```

## Running the code

After creating all rules you need a way to start the transformation.
This is done by creating the `main` rule.

```kanlang
(): SysCode {
	return true as SysCode;
}
```

`SysCode` is an alias for `boolean` and should indicate if the program terminated correctly or not.

This rule will be the starting point of your program.

## Logging

Running the code in itself might not be of any value unless you can see the result of it.
So here is a minimal `Hello World` written in kanlang

```kanlang
(): SysCode {
	msg := "hello world" as LogMsg; *LogResult;
	return true as SysCode;
}
```

## Working with strings

Lets say you have two strings

```kanlang
a := "Hello";
b := "World";
```

And you want to join them.
The language becomes a bit odd here, because there are no functions on strings.
And if we were to create a transformer it would take two of the same argument `a: string, b: string`, which would confuse the compiler in terms of what is prefix and what is suffix.

So we solve this by using type aliases.

```kanlang
a := "Hello" as PrefixString;
b := "World" as SuffixString;
c := *StringConcat as LogMsg; *LogResult; //prints "HelloWorld"
```

You can also convert numbers to strings.

```kanlang
a := "Hello" as PrefixString;
x := 42;
b := *NumericString as SuffixString;
c := *StringConcat as LogMsg; *LogResult; //prints "Hello42"
```

Getting the length of a string is pretty straightforwards.

```kanlang
a := "Hello World" to StringLength;
//a = 11. of course the same can be done without targeting a
```

If you need to iterate over parts of a string you can first split it.

```kanlang
a := "hello world";
b := " " as SplitOperator;
for w in *[SubString] {
    msg := w as LogMsg; *LogResult; //prints "hello" and then "world"
}
```

## Arrays

There is some support for arrays in kanlang.

You can create them in a pretty straightforwards fashion.

```kanlang
numbers := [1, 2, 3, 4, 5, 6];
```

You can create empty arrays.

```kanlang
arr := [];
```

but the type system will be confused. So it should be cast to a type.

```kanlang
arr := [] as [num];
```

And you can extract data from it

```kanlang
slice := numbers[0..3]; //get sub array from index 0 inclusive, to index 3 exclusive
direct := numbers[3]; //get value at index 3
```

Note that you cannot mix types. i.e. this is not allowed

```kanlang
arr := [1,2,"3"];
```

Aside from this you can also destruct an array in the scope of creating an array.
A lot of words to say that you can join 2 arrays like this.

```kanlang
arr1 := [1,2,3];
arr2 := [4,5,6];
join := [...arr1, ...arr2];
```

An array can be iterated over like this

```kanlang
sum := 0;
for i in [1,2,3,4,5] {
	sum = sum + i;
}
```

## File system

This part will not work if you intend to run the output in the browser.
But if you run it on a desktop javascript runtime such as node, then this should allow you to read a file.

```kanlang
path := "/tmp/kanlang.test" as FilePath;
msg := *FileContent as LogMsg; *LogResult;
```

## Examples

At current time there isn't a lot of example code, but you can take a look in the [example folder](https://github.com/munHunger/kanlang/tree/main/examples) of the repository.
