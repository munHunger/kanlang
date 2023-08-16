import { CompileError } from './compileError';
import { State } from './earley';
import { Rule } from './rule/rule';
import { Declaration } from './semantic';
import { Token } from './tokenizer';

export class ParseTree {
  static errors: CompileError[] = [];
  children: ParseTree[] = [];
  scope: Record<string, Declaration> = {};
  constructor(
    private rule: Rule,
    private state: State,
    private parent?: ParseTree
  ) {}

  getDeclaration(name: string): Declaration | undefined {
    if (this.scope[name]) return this.scope[name];
    else if (this.parent) return this.parent.getDeclaration(name);
  }

  tokenValue(index: number): string {
    return (this.state.tree[index] as Token).value;
  }

  toString(): string {
    return '';
  }

  addToState(declaration: Declaration) {
    if (!this.parent) throw new Error("can't add state to root node");
    this.parent.state[declaration.name] = declaration;
  }

  validate() {
    //Left empty, to be implemented further down
  }

  addError(message: string) {
    ParseTree.errors.push(new CompileError(null, message));
  }

  addChild(child: ParseTree) {
    this.children.push(child);
  }
}
