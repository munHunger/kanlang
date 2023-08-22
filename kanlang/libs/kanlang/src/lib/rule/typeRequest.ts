import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeRequest extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [['operator', '*'], 'identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(1)} fetched from scope`;
          }
          validate(): void {
            //TODO: validate it
          }
        },
      },
    ];
  }
}
