import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class InlineType extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: ['identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return `${this.type()}`;
          }
          toJs(): string {
            return ``;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.type());
          }
          type(): string {
            return this.tokenValue(0);
          }
        },
      },
      {
        parts: ['identifier', ['keyword', 'alias'], 'identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return `{${this.tokenValue(0)} is ${this.tokenValue(2)}}`;
          }
          toJs(): string {
            return ``;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.tokenValue(2));
            this.addToScope({
              name: this.tokenValue(0),
              type: {
                alias: this.tokenValue(2),
              },
            });
            this.mergeParentScope();
          }
          type(): string {
            return this.tokenValue(0);
          }
        },
      },
    ];
  }
}
