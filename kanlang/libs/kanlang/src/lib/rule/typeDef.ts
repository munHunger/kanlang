import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeDef extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        root: 0,
        parts: [
          ['keyword', 'type'],
          'identifier',
          ['keyword', 'alias'],
          'identifier',
        ],
        treeClass: class extends ParseTree {
          toString(): string {
            return `{${this.tokenValue(1)} is ${this.tokenValue(3)}}`;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.tokenValue(3));
            this.addToScope({
              name: this.tokenValue(1),
              type: {
                alias: this.tokenValue(3),
              },
            });
          }
        },
      },
    ];
  }
}
