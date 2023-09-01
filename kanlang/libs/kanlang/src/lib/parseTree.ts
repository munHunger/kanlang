import { CompileError } from './compileError';
import { State } from './earley';
import { Rule } from './rule/rule';
import { Declaration } from './semantic';
import { Token } from './tokenizer';

export class Transformation {
  constructor(public from: string[], public to: string[]) {}

  get functionName(): string {
    return [...this.from, '_', ...this.to].join('_');
  }
}

export class TransformationTree {
  children: TransformationTree[] = [];
  constructor(
    public transformation?: Transformation,
    public declaration?: Declaration
  ) {}

  toJs(): string[] {
    if (this.declaration) return [this.declaration.name];
    if (this.transformation) {
      const children = this.children.map((child) => child.toJs()).flat();
      return [this.transformation.functionName + `(${children.join(', ')})`]; //TODO: handle variable
    }
    return this.children.map((child) => child.toJs()).flat();
  }
}

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

  flatten(): ParseTree[] {
    return this.children.concat(
      this.children.map((child) => child.flatten()).flat()
    );
  }

  getTransformationPath(
    type: string,
    blockVariable?: string
  ): TransformationTree {
    const varInScope = this.getAllDeclarationsInScope()
      .filter((v) => v.variable && blockVariable != v.name)
      .find((v) => v.variable.type === type);
    if (varInScope) return new TransformationTree(undefined, varInScope);
    const root = new TransformationTree();
    root.children = this.allTransformations
      .filter((t) => t.to.includes(type))
      .map((producer) => {
        if (producer.from.length == 0) return new TransformationTree(producer);
        else {
          const tranform = new TransformationTree(producer);
          tranform.children = producer.from.map((arg) =>
            this.getTransformationPath(arg, blockVariable)
          );
          return tranform;
        }
      });
    return root;
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

  getChildrenOfType<T extends ParseTree>(c: typeof ParseTree): T[] {
    return this.children
      .filter((child) => child instanceof c)
      .concat(this.children.map((child) => child.getChildrenOfType(c)).flat())
      .map((child) => child as T);
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

  /**
   * To be called before validation and before drilling down to children
   */
  preValidate() {
    //Left empty, to be implemented further down
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
