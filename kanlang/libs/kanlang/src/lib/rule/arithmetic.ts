import { levenshteinDistance } from '../levenstein';
import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';
import { TypeRequest } from './typeRequest';
import { Variable, VariableTree } from './variable';

export class Arithmetic extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Sum()],
        invisibleNode: true,
      },
    ];
  }
}

export class Sum extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 1,
        parts: [new Product(), ['operator', '+'], this],
        treeClass: class extends ParseTree {
          toString(): string {
            return `+(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
          toJs(): string {
            return `${this.children[0].toJs()} + ${this.children[1].toJs()}`;
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 1,
        parts: [new Product(), ['operator', '-'], this],
        treeClass: class extends ParseTree {
          toString(): string {
            return `-(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
          toJs(): string {
            return `${this.children[0].toJs()} - ${this.children[1].toJs()}`;
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 0,
        parts: [new Product()],
        invisibleNode: true,
      },
    ];
  }
}

export class Product extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 1,
        parts: [this, ['operator', '*'], new Atom()],
        treeClass: class extends ParseTree {
          toString(): string {
            return `*(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
          toJs(): string {
            return `${this.children[0].toJs()} * ${this.children[1].toJs()}`;
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 1,
        parts: [this, ['operator', '/'], new Atom()],
        treeClass: class extends ParseTree {
          toString(): string {
            return `/(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
          toJs(): string {
            return `${this.children[0].toJs()} / ${this.children[1].toJs()}`;
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 0,
        parts: [new Atom()],
        invisibleNode: true,
      },
    ];
  }
}

export class Atom extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['punct', '('], new Arithmetic(), ['punct', ')']],
        treeClass: class extends ParseTree {
          toString(): string {
            return `(${this.children[0].toString()})`;
          }
          toJs(): string {
            return `(${this.children[0].toJs()})`;
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 0,
        parts: ['number'],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.tokenValue(0);
          }
          toJs(): string {
            return this.tokenValue(0);
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 0,
        parts: [new Variable()],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.children[0].toString();
          }
          toJs(): string {
            return this.children[0].toJs();
          }
          validate(): void {
            const varName = (this.children[0] as VariableTree).getName();
            const declaration = this.getDeclaration(varName);
            if (
              !this.varIsOfType(varName, 'num') &&
              this.getSupertype(declaration.variable.type) != 'num'
            )
              this.addError(
                `variable ${varName} of type ${
                  declaration.variable.type
                } is not numeric\n\n${JSON.stringify(
                  this.getAllDeclarationsInScope(),
                  null,
                  2
                )}`
              );
          }
          type(): string {
            return this.children[0].type();
          }
        },
      },
      {
        root: 0,
        parts: [new TypeRequest()],
        invisibleNode: true,
      },
    ];
  }
}
