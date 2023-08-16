import { ParseTree } from '../parseTree';
import { Expression } from './expression';
import { NewRuleType, Rule } from './rule';

export class Body extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [new Expression(), ['punct', ';']],
        carryScope: true,
        treeClass: class extends ParseTree {
          toString(): string {
            return 'body';
          }
        },
      },
      {
        root: 0,
        parts: [this, new Expression(), ['punct', ';']],
        carryScope: true,
      },
    ];
  }
}
