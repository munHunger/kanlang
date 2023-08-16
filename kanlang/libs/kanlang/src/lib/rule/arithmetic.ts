import { CompileError } from '../compileError';
import { levenshteinDistance } from '../levenstein';
import { ParseTree } from '../parseTree';
import { Token } from '../tokenizer';
import { NewRuleType, Rule } from './rule';

export class Arithmetic extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Sum()],
        meta: () => ({ type: 'num' }),
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
        meta: () => ({ type: 'num' }),
        treeClass: class extends ParseTree {
          toString(): string {
            return `+(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
        },
      },
      {
        root: 1,
        parts: [new Product(), ['operator', '-'], this],
        meta: () => ({ type: 'num' }),
        treeClass: class extends ParseTree {
          toString(): string {
            return `-(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
        },
      },
      {
        root: 0,
        parts: [new Product()],
        meta: () => ({ type: 'num' }),
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
        meta: () => ({ type: 'num' }),
        treeClass: class extends ParseTree {
          toString(): string {
            return `*(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
        },
      },
      {
        root: 1,
        parts: [this, ['operator', '/'], new Atom()],
        meta: () => ({ type: 'num' }),
        treeClass: class extends ParseTree {
          toString(): string {
            return `/(${this.children[0].toString()}, ${this.children[1].toString()})`;
          }
        },
      },
      {
        root: 0,
        parts: [new Atom()],
        meta: () => ({ type: 'num' }),
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
        meta: () => ({ type: 'num' }),
        treeClass: class extends ParseTree {
          toString(): string {
            return this.tokenValue(0);
          }
        },
      },
      {
        root: 0,
        parts: ['identifier'],
        meta: () => ({ type: 'num' }), //Figure out semantically if the types match
        treeClass: class extends ParseTree {
          toString(): string {
            return `<${this.tokenValue(0)}>`;
          }
          validate(): void {
            if (!this.getDeclaration(this.tokenValue(0)))
              this.addError(`variable ${this.tokenValue(0)} is not defined`);
          }
        },
        semantic: (scope, state) => {
          const currentToken = state.tree[0] as Token;
          const variable = scope[currentToken.value];
          if (!variable) {
            const didYouMean = Object.values(scope)
              .map((v) => [levenshteinDistance(currentToken.value, v.name), v])
              .filter((v) => v[0] < 2)
              .sort((a, b) => a[0] - b[0])[0];
            throw new CompileError(
              currentToken,
              `variable ${currentToken.value} is not defined.` +
                (didYouMean ? `did you mean '${didYouMean[1].name}'` : '')
            );
          }
          if (variable.variable.type != 'num')
            throw new CompileError(
              currentToken,
              `variable ${currentToken.value} is not numeric`
            );
          return undefined; //We aren't altering the scope, just validating it
        },
      },
    ];
  }
}
