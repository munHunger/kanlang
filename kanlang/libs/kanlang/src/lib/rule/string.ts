import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class StringRule extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: ['literal'],
        treeClass: class extends ParseTree {
          type(): string {
            return 'string';
          }
          toString(): string {
            return `${this.tokenValue(0)}`;
          }
          toJs(): string {
            return `${this.tokenValue(0)}`;
          }
        },
      },
    ];
  }
}
