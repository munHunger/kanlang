import { ParseTree } from '../parseTree';
import { Expression } from './';
import { NewRuleType, Rule } from './rule';

export class VariableAssignment extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          'identifier',
          ['punct', ':'],
          ['operator', '='],
          new Expression(),
        ],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(
              0
            )} := ${this.children[0].toString()} ${this.printScope()}`;
          }
          validate(): void {
            this.addToScope({
              name: this.tokenValue(0),
              type: this.children[0].type(),
            });
          }
        },
      },
    ];
  }
}
