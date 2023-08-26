import { CompileError } from './compileError';
import { State } from './earley';
import { Rule } from './rule/rule';
import { Declaration } from './semantic';
import { Token } from './tokenizer';

export type Transformation = { from: string[]; to: string[] };

export class ParseTree {
  static errors: CompileError[] = [];
  children: ParseTree[] = [];
  scope: Record<string, Declaration> = {};
  transformation: Transformation[] = [];
  constructor(
    public rule: Rule,
    private state: State,
    public parent?: ParseTree
  ) {}

  transformationToFunctionName(t: Transformation): string {
    return [...t.from, '_', ...t.to].join('_');
  }

  get allTransformations(): Transformation[] {
    return this.transformation.concat(this.parent?.allTransformations || []);
  }

  addTransformation(transformation: Transformation) {
    (this.parent || this).transformation.push(transformation);
  }

  varIsOfType(variable: string, type: string): boolean {
    const d = this.getDeclaration(variable);
    if (!d) return false;
    else if (d.variable && d.variable.type === type) {
      return true;
    } else if (d.type && d.type.alias == type) {
      return true;
    }
    const t = this.getDeclaration(d.variable.type);
    if (t) {
      return this.varIsOfType(t.name, type);
    }
  }

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

  toJs(): string {
    throw new Error(
      `Seems like there is a missing code generation step for rule ${this.rule.ruleName}`
    );
  }

  toString(): string {
    return '';
  }

  printScope(): string {
    return `[${[
      ...new Set(
        this.getAllDeclarationsInScope().map((d) => {
          if (d.variable) return `${d.name}: ${d.variable.type}`;
          else if (d.type) return `{${d.name} is ${d.type.alias}}`;
        })
      ),
    ]
      .sort((a, b) => a.localeCompare(b))
      .join(', ')}]`;
  }

  type(): string {
    return '';
  }

  addToScope(declaration: Declaration, unsafe = false) {
    if (this.getDeclaration(declaration.name)) {
      if (!unsafe) {
        this.addError(
          `${declaration.name} is already declared. Cannot reassign it`
        );
      }
    } else if (!this.parent) {
      this.scope[declaration.name] = declaration;
    } else {
      this.parent.scope[declaration.name] = declaration;
    }
  }

  mergeParentScope() {
    Object.values(this.scope).forEach((v) => this.parent.addToScope(v, true));
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
