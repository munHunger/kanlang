import { default as grammar } from "../grammar/out/grammar";
import * as nearley from "nearley";
import {
  AnnotatedNode,
  AstNode,
  Expression,
  Fn,
  Statement,
  isFunction,
  isStatement,
} from "./types";
export interface KanlangOutput {
  code: string;
}

export class KanlangCompiler {
  input: string; // input source code
  constructor() {
    console.log("KanlangCompiler created");
  }

  feed(input: string): KanlangOutput {
    // Create a Parser object from our grammar.
    const parser = new nearley.Parser(nearley.Grammar.fromCompiled(grammar), {
      keepHistory: true,
    });

    console.log(input);
    // Parse something!
    parser.feed(input);
    let ast = parser.results[0];
    // parser.results is an array of possible parsings.
    console.log(ast);

    let annotateTree = this.annotateTree(ast);
    console.log(JSON.stringify(annotateTree, null, 2));

    let output = this.codeGeneration(annotateTree);
    console.log(output);
    return { code: output };
  }

  annotateTree(tree: AstNode, parent: AnnotatedNode = null): AnnotatedNode {
    if (isFunction(tree)) {
      let metadata = {
        variableMap: {},
        functionMap: {},
      };
      metadata.functionMap[tree.function.signature.name] = tree;
      tree.function.signature.args.forEach(
        (arg) => (metadata.variableMap[arg.name] = arg)
      );
      let annotateTree = { ...tree, ...metadata, parent };
      tree.function.body.forEach((statement) => {
        this.annotateTree(statement, annotateTree);
      });
      return annotateTree;
    } else if (isStatement(tree)) {
      let metadata = {
        variableMap: {},
        functionMap: {},
      };
      let annotateTree = { ...tree, ...metadata, parent };
      return annotateTree;
    }
    throw "Unrecognized node type";
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
    throw "Unrecognized expression type";
  }

  codeGeneration(node: AnnotatedNode): string {
    if (isFunction(node)) {
      return `function ${
        node.function.signature.name
      }(${node.function.signature.args.map((v) => v.name).join(",")}) {
        ${node.function.body
          .map((statement) => this.codeGeneration(statement as AnnotatedNode))
          .join("\n")}
      }`;
    } else if (isStatement(node)) {
      if (node.return) {
        return `return ${this.expressionCodeGeneration(node.return)}`;
      }
      throw "Unrecognized statement type:" + JSON.stringify(node);
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
