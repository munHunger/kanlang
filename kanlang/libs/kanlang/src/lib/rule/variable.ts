import { State } from '../earley';
import { ParseTree } from '../parseTree';
import { Token } from '../tokenizer';
import { Expression } from './';
import { NewRuleType, Rule } from './rule';

export class VariableAssignment extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['keyword', 'let'],
          'identifier',
          ['operator', '='],
          new Expression(),
        ],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(
              1
            )} := ${this.children[0].toString()} ${this.printScope()}`;
          }
          validate(): void {
            this.addToScope({
              name: this.tokenValue(1),
              type: this.children[0].type(),
            });
          }
        },
      },
    ];
  }
}
