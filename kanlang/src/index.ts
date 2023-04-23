import { default as grammar } from "./grammar/out/grammar";
import * as nearley from "nearley";
import {
  AnnotatedNode,
  AstNode,
  Expression,
  Fn,
  StackFrame,
  Statement,
  isAssignment,
  isDependencyInjection,
  isFunction,
  isRoot,
  isStatement,
  isTypeDef,
} from "./types";
export interface KanlangOutput {
  code: string;
}

export class KanlangCompiler {
  input: string; // input source code
  ast: AstNode;
  constructor() {
    console.log("KanlangCompiler created");
  }

  removeLineComments(input: string) {
    return input
      .split("\n")
      .map((line) => {
        if (line.includes("//")) {
          return line.substring(0, line.indexOf("//"));
        }
        return line;
      })
      .map((line) => line.trim()) //Leading and trailing spaces are a pain
      .filter((v) => v !== "")
      .join("\n");
  }

  feed(input: string): KanlangOutput {
    // Create a Parser object from our grammar.
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), {
      keepHistory: true,
    });

    this.input = this.removeLineComments(input) + "\n";

    parser.feed(this.input);
    this.ast = parser.results[0];
    if (parser.results.length > 1) {
      console.warn(
        "Grammar is ambiguous, using first result. Got " +
          parser.results.length +
          " results"
      );
    }

    if (!this.ast) throw new Error("Parser failed to produce an AST");

    let output = this.codeGeneration(this.ast, {
      functionMap: {},
      variableMap: {},
      types: new Set(),
    });
    console.log(output);
    return { code: output };
  }

  expressionCodeGeneration(node: Expression): string {
    if (!node) throw new Error("Cannot generate expression from null node");
    const exp = node;
    if (!exp) throw node;
    if (exp.const) return `${exp.const}`;
    if (exp.op && typeof exp.op === "string") {
      if (["+", "-", "*", "/"].includes(exp.op)) {
        if (exp.args.length !== 2)
          throw new Error(
            `Expected 2 arguments for ${exp.op} but got ${
              exp.args.length
            } arguments. ${JSON.stringify(exp.args)}\n${JSON.stringify(
              this.ast,
              null,
              2
            )}`
          );
        return `${this.expressionCodeGeneration(exp.args[0])} ${
          exp.op
        } ${this.expressionCodeGeneration(exp.args[1])}`;
      }
    }
    if (exp.op && typeof exp.op === "object") {
      if (exp.op.fn) {
        return `${exp.op.fn}(${exp.args
          .map((arg) => this.expressionCodeGeneration(arg))
          .join(", ")})`;
      }
      if (exp.op.builtin) {
        switch (exp.op.builtin) {
          case "print":
            return `console.log(${exp.args
              .map((arg) => this.expressionCodeGeneration(arg))
              .join(", ")})`;
          default:
            throw new Error(
              `built in function ${exp.op.builtin} is not yet implemented`
            );
        }
      }
    }
    if (exp.var) return exp.var; //TODO: check if var is in scope
    throw new Error(`Unrecognized expression type ${JSON.stringify(node)}`);
  }

  isVariableInScope(name: string, frame: StackFrame): boolean {
    if (frame.variableMap[name]) return true;
    if (frame.prev) return this.isVariableInScope(name, frame.prev);
    return false;
  }
  isFunctionInScope(name: string, frame: StackFrame): boolean {
    if (frame.functionMap[name]) return true;
    if (frame.prev) return this.isFunctionInScope(name, frame.prev);
    return false;
  }

  isReturnTypeInUse(type: string, frame: StackFrame): boolean {
    for (let fn of Object.values(frame.functionMap)) {
      if (fn.function.signature.returnType.type === type) return true;
    }
    if (frame.prev) return this.isReturnTypeInUse(type, frame.prev);
    return false;
  }

  isTypeDeclared(type: string, frame: StackFrame): boolean {
    for (let t of frame.types) {
      if (t.type === type) return true;
    }
    return false;
  }

  dependencyInjectionCodeGeneration(
    type: string,
    frame: StackFrame
  ): string | undefined {
    for (let fn of Object.values(frame.functionMap)) {
      if (fn.function.signature.returnType.type === type) {
        if (fn.function.signature.args.length > 0) {
          let args = fn.function.signature.args.map((arg) =>
            this.dependencyInjectionCodeGeneration(arg.type.type, frame)
          );
          if (args.includes(undefined)) return undefined;
          var fnArgs = args.join(", ");
        }
        return `${fn.function.signature.name}(${fnArgs || ""})`;
      }
    }
    for (let v of Object.entries(frame.variableMap)) {
      if (v[1].type === type) {
        return v[0];
      }
    }
    if (frame.prev)
      return this.dependencyInjectionCodeGeneration(type, frame.prev);
    return undefined;
  }

  codeGeneration(node: AstNode, frame: StackFrame): string {
    if (isFunction(node)) {
      if (this.isFunctionInScope(node.function.signature.name, frame))
        throw new Error(
          `Function ${node.function.signature.name} already declared`
        );
      if (
        this.isReturnTypeInUse(node.function.signature.returnType.type, frame)
      )
        throw new Error(
          `Return type ${node.function.signature.returnType.type} already in declared`
        );
      for (let argType of node.function.signature.args) {
        if (!this.isTypeDeclared(argType.type.type, frame)) {
          if (argType.type.alias && typeof argType.type.alias === "string") {
            // inline definition of an alias for a primitive value
            frame.types.add(argType.type);
          } else
            throw new Error(
              `Unrecognized type ${argType.type.type} for argument ${argType.name} on function ${node.function.signature.name}`
            );
        }
      }
      frame.functionMap[node.function.signature.name] = node;
      let newFrame: StackFrame = {
        prev: frame,
        variableMap: {},
        functionMap: {},
        types: frame.types,
      };
      return `function ${
        node.function.signature.name
      }(${node.function.signature.args.map((v) => v.name).join(",")}) {
        ${node.function.body
          .map((statement) => this.codeGeneration(statement, newFrame))
          .join("\n")}
      }`;
    } else if (isTypeDef(node)) {
      if (this.isTypeDeclared(node.typeDef.type, frame))
        throw new Error(`Type ${node.typeDef.type} already declared`);
      frame.types.add(node.typeDef);
      return ""; //compiling to js, so we don't need to declare types
    } else if (isAssignment(node)) {
      if (this.isVariableInScope(node.assignment.name, frame))
        throw new Error(`Variable ${node.assignment.name} already declared`);
      //TODO: check variable type
      frame.variableMap[node.assignment.name] = node.assignment.type;
      return `let ${node.assignment.name} = ${this.expressionCodeGeneration(
        node.assignment.value
      )}`;
    } else if (isRoot(node)) {
      return node.root
        .map((statement) => this.codeGeneration(statement, frame))
        .join("\n");
    } else if (isDependencyInjection(node)) {
      let dep = this.dependencyInjectionCodeGeneration(
        node.dependency.type.type,
        frame
      );
      if (!dep)
        throw new Error(
          `No dependency injection found for type ${node.dependency.type.type}`
        );
      return `let ${node.dependency.name} = ${dep}`;
    } else if (isStatement(node)) {
      if (node.return) {
        return `return ${this.expressionCodeGeneration(node.return)}`;
      }
      if (node.expression) {
        return this.expressionCodeGeneration(node.expression);
      }
      throw "Unrecognized statement type:" + JSON.stringify(node, null, 2);
    }
  }
}

class ErrorHandling {
  constructor() {
    console.log("ErrorHandling created");
  }

  error() {
    console.log("error");
    throw "error not implemented";
  }
}
