import { levenshteinDistance } from '../levenstein';
import { ParseTree } from '../parseTree';
import { Expression } from './';
import { NewRuleType, Rule } from './rule';

export class VariableAssignment extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          'identifier',
          ['punct', ':'],
          ['operator', '='],
          new Expression(),
        ],
        treeClass: class extends VariableTree {
          getName(): string {
            return this.tokenValue(0);
          }
          toJs(): string {
            return `let ${this.getName()} = ${this.children[0].toJs()}`;
          }
          toString(): string {
            return `${this.getName()} := ${this.children[0].toString()} ${this.printScope()}`;
          }
          validate(): void {
            this.addToScope({
              name: this.getName(),
              variable: {
                constant: false,
                type: this.children[0].type(),
              },
            });
          }
        },
      },
      {
        parts: [new Variable(), ['operator', '='], new Expression()],
        treeClass: class extends VariableTree {
          getName(): string {
            return (this.children[0] as VariableTree).getName();
          }
          toJs(): string {
            return `${this.getName()} = ${this.children[1].toJs()}`;
          }
          toString(): string {
            return `${this.getName()} = ${this.children[1].toString()} ${this.printScope()}`;
          }
          validate(): void {
            if (this.children[0].type() != this.children[1].type()) {
              this.addError(
                `cannot change variable type, from ${this.children[0].type()} to ${this.children[1].type()}`
              );
            }
          }
        },
      },
    ];
  }
}

export class VariableTree extends ParseTree {
  getName(): string {
    throw new Error('need to impl getName');
  }
}

export class Variable extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: ['identifier'],
        treeClass: class extends VariableTree {
          toString(): string {
            return `<${this.tokenValue(0)}>`;
          }
          toJs(): string {
            return `${this.tokenValue(0)}`;
          }
          validate(): void {
            if (!this.getDeclaration(this.getName())) {
              const didYouMean = this.getAllDeclarationsInScope()
                .map((v) => [levenshteinDistance(this.getName(), v.name), v])
                .filter((v) => v[0] < 2)
                .sort((a, b) => a[0] - b[0])[0];
              this.addError(
                `variable ${this.getName()} is not defined.` +
                  (didYouMean ? `\ndid you mean '${didYouMean[1].name}'` : '')
              );
            }
          }
          getName(): string {
            return this.tokenValue(0);
          }
          type(): string {
            return this.getDeclaration(this.getName()).variable.type;
          }
        },
      },
    ];
  }
}
