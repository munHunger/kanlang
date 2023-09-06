import { ParseTree } from '../parseTree';
import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';
import { Variable, VariableTree } from './variable';

export class BooleanRule extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: ['boolean'],
        treeClass: class extends ParseTree {
          type(): string {
            return 'boolean';
          }
          toString(): string {
            return `${this.tokenValue(0)}`;
          }
          toJs(): string {
            return `${this.tokenValue(0)}`;
          }
        },
      },
      {
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
          }
          type(): string {
            return this.children[0].type();
          }
        },
      },
      {
        parts: [['operator', '!'], 'boolean'],
        treeClass: class extends ParseTree {
          type(): string {
            return 'boolean';
          }
          toString(): string {
            return this.toJs();
          }
          toJs(): string {
            return `!${this.tokenValue(1)}`;
          }
        },
      },
      ...['==', '<=', '>=', '<', '>'].map(
        (operator) =>
          ({
            parts: [new Expression(), ['operator', operator], new Expression()],
            treeClass: class extends ParseTree {
              type(): string {
                return 'boolean';
              }
              toString(): string {
                return this.toJs();
              }
              toJs(): string {
                return `${this.children[0].toJs()} ${operator} ${this.children[1].toJs()}`;
              }
              validate(): void {
                if (
                  this.getSupertype(this.children[0].type()) !=
                  this.getSupertype(this.children[1].type())
                )
                  this.addError(
                    'cannot do a boolean comparison of different types'
                  );
              }
            },
          } as NewRuleType)
      ),
    ];
  }
}
