import { levenshteinDistance } from '../levenstein';
import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

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
        parts: ['number'],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.tokenValue(0);
          }
          type(): string {
            return 'num';
          }
        },
      },
      {
        root: 0,
        parts: ['identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return `<${this.tokenValue(0)}>`;
          }
          validate(): void {
            const name = this.tokenValue(0);
            if (!this.getDeclaration(name)) {
              const didYouMean = this.getAllDeclarationsInScope()
                .map((v) => [levenshteinDistance(name, v.name), v])
                .filter((v) => v[0] < 2)
                .sort((a, b) => a[0] - b[0])[0];
              this.addError(
                `variable ${name} is not defined` +
                  (didYouMean ? `did you mean '${didYouMean[1].name}'` : '')
              );
            } else if (this.getDeclaration(name).type != 'num')
              this.addError(`variable ${name} is not numeric`);
          }
          type(): string {
            return 'num';
          }
        },
      },
    ];
  }
}
