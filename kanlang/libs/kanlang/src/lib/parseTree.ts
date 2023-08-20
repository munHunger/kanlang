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
    public rule: Rule,
    private state: State,
    public parent?: ParseTree
  ) {}

  getDeclaration(name: string): Declaration | undefined {
    if (this.scope[name]) return this.scope[name];
    else if (this.parent) return this.parent.getDeclaration(name);
  }

  getAllDeclarationsInScope(): Declaration[] {
    if (this.parent) {
      return Object.values(this.scope).concat(
        this.parent.getAllDeclarationsInScope()
      );
    }
    return Object.values(this.scope);
  }

  tokenValue(index: number): string {
    return (this.state.tree[index] as Token).value;
  }

  getParentOfType(c: typeof Rule): ParseTree | undefined {
    if (this.parent) {
      if (this.parent.rule instanceof c) return this.parent;
      else return this.parent.getParentOfType(c);
    }
  }

  toString(): string {
    return '';
  }

  printScope(): string {
    return `[${this.getAllDeclarationsInScope()
      .map((d) => `${d.name}: ${d.variable.type}`)
      .sort((a, b) => a.localeCompare(b))
      .join(', ')}]`;
  }

  type(): string {
    return '';
  }

  addToScope(declaration: Declaration) {
    if (!this.parent) {
      this.scope[declaration.name] = declaration;
    } else {
      this.parent.scope[declaration.name] = declaration;
    }
  }

  mergeParentScope() {
    Object.values(this.scope).forEach((v) => this.addToScope(v));
  }

  validate() {
    //Left empty, to be implemented further down
  }

  get allTokens(): Token[] {
    return this.state.tree
      .filter((part): part is Token => (part as Token).value != undefined)
      .concat(this.children.map((child) => child.allTokens).flat())
      .sort((a, b) => a.start - b.start);
  }

  addError(message: string) {
    ParseTree.errors.push(new CompileError(this.allTokens, message));
  }

  addChild(child: ParseTree) {
    this.children.push(child);
  }
}
