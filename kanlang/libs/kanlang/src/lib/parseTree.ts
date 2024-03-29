import * as builtins from './builtin';
import { CompileError } from './compileError';
import { State } from './earley';
import { levenshteinDistance } from './levenstein';
import { Rule } from './rule/rule';
import { Declaration } from './semantic';
import { Token } from './tokenizer';

export class Transformation {
  constructor(public from: string[], public to: string[]) {}

  private safePart(part: string): string {
    return part.replace(/\[/g, 'Array_').replace(/\]/g, '');
  }

  get functionName(): string {
    return [
      ...this.from.map(this.safePart),
      '_',
      ...this.to.map(this.safePart),
    ].join('_');
  }
}
const primitives = ['num', 'boolean', 'string'];
export class TransformationTree {
  children: TransformationTree[] = [];
  constructor(
    public transformation?: Transformation,
    public declaration?: Declaration
  ) {}

  toJs(): string[] {
    if (this.declaration) return [this.declaration.name];
    if (this.transformation) {
      if (this.children.includes(undefined)) return []; //this means one or more arguments can't be found
      const children = this.children.map((child) => child.toJs()).flat();
      return [this.transformation.functionName + `(${children.join(', ')})`]; //TODO: handle variable
    }
    return this.children.map((child) => child.toJs()).flat();
  }
  //Shamelessly stolen: https://stackoverflow.com/questions/53311809/all-possible-combinations-of-a-2d-array-in-javascript
  combos(list, n = 0, result = [], current = []) {
    if (n === list.length) result.push(current);
    else
      list[n].forEach((item) =>
        this.combos(list, n + 1, result, [...current, item])
      );

    return result;
  }

  filterIncludeVariable(declaration: Declaration): TransformationTree {
    if (this.declaration) {
      if (this.declaration.name != declaration.name) {
        return undefined; //I have honestly no idea why this works, but seems like it does
      }
    }
    if (this.transformation) {
    }
    this.children = this.children.filter((child) =>
      child.filterIncludeVariable(declaration)
    );
    return this;
  }
  toJs2(): string[] {
    if (this.declaration) return [this.declaration.name];
    if (this.transformation) {
      const children = this.children.map((child) => child.toJs2());
      return this.combos(children).map(
        (args) => this.transformation.functionName + `(${args.join(', ')})`
      );
    }
    return this.children.map((child) => child.toJs2()).flat();
  }
}

export class ParseTree {
  static errors: CompileError[] = [];
  children: ParseTree[] = [];
  scope: Record<string, Declaration> = {};
  transformation: Transformation[] = [];
  constructor(
    public rule: Rule,
    public state: State,
    public parent?: ParseTree
  ) {
    if (!parent) {
      this.builtins.forEach((method) => {
        method.getTypes().forEach((type) => this.addToScope(type));
        this.addTransformation(method.getTransformation());
      });
    }
  }

  get builtins(): builtins.Builtin[] {
    return Object.values(builtins)
      .filter((v) => v.prototype instanceof builtins.Builtin)
      .map((c: any) => new c() as builtins.Builtin);
  }

  flatten(): ParseTree[] {
    return this.children.concat(
      this.children.map((child) => child.flatten()).flat()
    );
  }

  getSuperTypeOfMatching(
    type: string,
    filter: (type: string) => boolean
  ): string {
    const declaration = this.getDeclaration(type);
    if (filter(type)) return type;
    if (declaration && declaration.type?.alias) {
      return this.getSuperTypeOfMatching(declaration.type.alias, filter);
    }
  }

  isArrayType(type: string): boolean {
    return /^\[.+\]$/.test(type);
  }

  unNestArrayType(type: string): string {
    return type.slice(1, -1);
  }

  getTransformationPaths(
    type: string,
    blockVariable?: string
  ): TransformationTree {
    const tree = new TransformationTree();
    tree.children = tree.children.concat(
      this.getAllDeclarationsInScope()
        .filter((v) => v.variable && blockVariable != v.name)
        .filter((v) => v.variable.type === type)
        .map((v) => new TransformationTree(undefined, v))
    );
    tree.children = tree.children.concat(
      this.allTransformations
        .filter((t) => t.to.includes(type))
        .filter((t) => {
          const fn = this.getParentOfTypeString('Function') as any;
          if (fn) {
            try {
              if (fn.functionTransform.functionName == t.functionName)
                return false; //Blocks recursion
            } catch (e) {
              //Do nothing, hacky, but likely in wrong compiler stage
            }
          }
          return true;
        })
        .map((producer) => {
          if (producer.from.length == 0) {
            return new TransformationTree(producer);
          } else {
            const transform = new TransformationTree(producer);
            transform.children = producer.from.map((arg) =>
              this.getTransformationPaths(arg, blockVariable)
            );
            if (transform.children.length != producer.from.length)
              throw new Error('validation error. cannot find all children');
            return transform;
          }
        })
    );
    return tree;
  }

  getTransformationPath(
    type: string,
    blockVariable?: string
  ): TransformationTree {
    const varInScope = this.getAllDeclarationsInScope()
      .filter((v) => v.variable && blockVariable != v.name)
      .find((v) => this.varIsOfType(v.name, type));
    if (varInScope) {
      return new TransformationTree(undefined, varInScope);
    }
    const root = new TransformationTree();
    root.children = this.allTransformations
      .filter((t) => t.to.includes(type))
      .filter((t) => {
        const fn = this.getParentOfTypeString('Function') as any;
        if (fn) {
          try {
            if (fn.functionTransform.functionName == t.functionName)
              return false; //Blocks recursion
          } catch (e) {
            //Do nothing, hacky, but likely in wrong compiler stage
          }
        }
        return true;
      })
      .map((producer) => {
        if (producer.from.length == 0) {
          return new TransformationTree(producer);
        } else {
          const transform = new TransformationTree(producer);
          transform.children = producer.from.map((arg) =>
            this.getTransformationPath(arg, blockVariable)
          );
          if (transform.children.length != producer.from.length)
            throw new Error('validation error. cannot find all children');
          return transform;
        }
      });
    if (root.children.length == 0) {
      //This isn't really an error we can't recover from
      // console.log(`got no children for ${type}\n${this.printScope()}\n\n`);
      return undefined;
    }
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
    else if (d.variable) {
      if (d.variable.type === type) {
        return true;
      } else {
        const t = this.getDeclaration(d.variable.type);
        if (t) {
          return this.varIsOfType(t.name, type);
        }
      }
    } else if (d.type && d.type.alias == type) {
      return true;
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

  //TODO: can we merge these two?
  getParentOfType(
    c: typeof Rule,
    stoppingRule?: typeof ParseTree
  ): ParseTree | undefined {
    if (stoppingRule && this instanceof stoppingRule) {
      return undefined;
    }
    if (this.parent) {
      if (this.parent.rule instanceof c) return this.parent;
      else return this.parent.getParentOfType(c, stoppingRule);
    }
  }
  getParentOfTypeString(c: string): ParseTree | undefined {
    if (this.parent) {
      if (this.parent.rule.constructor.name === c) return this.parent;
      else return this.parent.getParentOfTypeString(c);
    }
  }

  getChildrenOfRuleType(c: typeof Rule): ParseTree[] {
    return this.children.filter((child) => child.rule instanceof c);
  }

  getChildrenOfType<T extends ParseTree>(
    c: typeof ParseTree,
    stoppingRule?: typeof ParseTree
  ): T[] {
    return this.children
      .filter((child) => child instanceof c)
      .concat(
        this.children
          .filter(
            (c) => stoppingRule == undefined || !(c instanceof stoppingRule)
          )
          .map((child) => child.getChildrenOfType(c, stoppingRule))
          .flat()
      )
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
        this.getAllDeclarationsInScope()
          .filter(
            (d) =>
              ![
                'SysCode',
                ...this.builtins
                  .map((b) => b.getTypes().map((type) => type.name))
                  .flat(),
              ].includes(d.name)
          ) //Don't care about builtins
          .map((d) => {
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

  addToChildScope(declaration: Declaration) {
    this.scope[declaration.name] = declaration;
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

  removeFromScope(name: string) {
    if (!this.parent) {
      delete this.scope[name];
    } else {
      delete this.parent.scope[name];
    }
  }

  mergeParentScope() {
    if (!this.parent) return; //Mainly used for testing when the the root is nonsensical
    Object.values(this.scope).forEach((v) => this.parent.addToScope(v, true));
  }

  /**
   * To be called before validation and before drilling down to children
   */
  preValidate() {
    //Left empty, to be implemented further down
  }
  /**
   * To be called after each added child
   */
  postChildAdded() {
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

  getChildStartingOnToken(token: Token): ParseTree {
    const firstToken = this.state.tree[0];
    if ((firstToken as Token).value != undefined && this.children.length == 0) {
      if ((firstToken as Token).start == token.start) return this;
    }
    return this.children
      .map((c) => c.getChildStartingOnToken(token))
      .filter((v) => v)[0];
  }

  validateIfTypeIsDefined(type: string) {
    if (this.isArrayType(type)) {
      type = this.unNestArrayType(type); //A bit afraid of the implications of this one, but in theory an array of a type is not a new type
    }
    if (primitives.includes(type)) return; //Primitive types
    const declaration = this.getDeclaration(type);
    if (!declaration) {
      if (type == 'SysCode') {
        this.addToScope({
          name: 'SysCode',
          type: { alias: 'boolean' },
        });
        return this.validateIfTypeIsDefined(type);
      }
      const allDeclarations = this.getAllDeclarationsInScope()
        .filter((v) => v.type)
        .map((d) => d.name);
      const close = allDeclarations
        .sort(
          (a, b) => levenshteinDistance(a, type) - levenshteinDistance(b, type) //TODO: pre-compute this as it is really slow
        )
        .slice(0, 3);
      this.addError(
        `'${type}' does not exist as a type.\nDid you mean any of (${close.join(
          ', '
        )}) \nPossible types are: \n    ${allDeclarations.join('\n    ')}`
      );
    }
  }

  getSupertype(type: string): string {
    if (primitives.includes(type)) return type;
    const declaration = this.getDeclaration(type);
    if (declaration?.type?.alias) {
      return this.getSupertype(declaration.type?.alias);
    }
    return type;
  }

  addError(message: string) {
    ParseTree.errors.push(new CompileError(this.allTokens, message));
  }

  addChild(child: ParseTree) {
    this.children.push(child);
  }
}
