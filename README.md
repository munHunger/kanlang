# kanlang

A generic programming language

read about the inception of this language [here](https://blog.wunderdev.com/blog/kanlang/1/)

## Principles

The core idea of this language is to implement a transformation oriented design right into the language.

With that in mind, we can remove all function names and only look at input/output types.
So Kanlang is a programing language without function names, and it also lacks function invocations as it is missing handles for those. Instead it is being done by requesting the type that the function returns.

## Output

This language is not really intended to be used anywhere, but to increase portability I have decided to compile Kanlang horizontally to javascript

## Getting started

Install the vscode extension from the `.vsix` file in the latest [release](https://github.com/munHunger/kanlang/releases).

Download the Kanlang compiler binary from the same place and put it in your path.
(note that it has only been tested on linux)

Finally I recomend reading the [docs](https://kanlang.wunderdev.com/docs) on how to code in kanlang.
