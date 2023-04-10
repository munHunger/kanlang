import { default as grammar } from "../grammar/out/grammar";
import * as nearley from "nearley";
import {
  AnnotatedNode,
  AstNode,
  Expression,
  Fn,
  StackFrame,
  Statement,
  isAssignment,
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

    input = this.removeLineComments(input);

    parser.feed(input);
    let ast = parser.results[0];

    let output = this.codeGeneration(ast, {
      functionMap: {},
      variableMap: {},
      types: new Set(),
    });
    console.log(output);
    return { code: output };
  }

  expressionCodeGeneration(node: Expression): string {
    if (node.const) return `${node.const}`;
    if (node.op) {
      if (["+", "-", "*", "/"].includes(node.op)) {
        return `${this.expressionCodeGeneration(node.args[0])} ${
          node.op
        } ${this.expressionCodeGeneration(node.args[1])}`;
      }
    }
    if (node.var) return node.var; //TODO: check if var is in scope
    throw new Error(`Unrecognized expression type ${JSON.stringify(node)}`);
  }

  isVariableInScope(name: string, frame: StackFrame): boolean {
    if (frame.variableMap[name]) return true;
    if (frame.prev) return this.isVariableInScope(name, frame.prev);
    return false;
  }

  isTypeDeclared(type: string, frame: StackFrame): boolean {
    for (let t of frame.types) {
      if (t.type === type) return true;
    }
    return false;
  }

  codeGeneration(node: AstNode, frame: StackFrame): string {
    if (isFunction(node)) {
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
    } else if (isStatement(node)) {
      if (node.return) {
        return `return ${this.expressionCodeGeneration(node.return)}`;
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
