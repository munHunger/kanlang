import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeRequest extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: ['identifier', ['punct', ':'], ['operator', '*'], 'identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.tokenValue(0)} from ${this.tokenValue(
              3
            )} should be a chain here`;
          }
          validate(): void {
            //TODO: validate it
          }
        },
      },
    ];
  }
}
