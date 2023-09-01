import { ParseTree } from '../parseTree';
import { Body } from './body';
import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';

export class If extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['keyword', 'if'],
          new Expression(),
          ['punct', '{'],
          new Body(),
          ['punct', '}'],
        ],
        treeClass: class extends ParseTree {
          toJs(): string {
            return `if (${this.children[0].toJs()}) {${
              this.children[1]?.toJs() || ''
            }}`;
          }

          validate(): void {
            if (this.children[0].type() != 'boolean') {
              this.addError(
                'expression is not of type boolean. Recieved ' +
                  this.children[0].type()
              );
            }
          }
        },
      },
    ];
  }
}
