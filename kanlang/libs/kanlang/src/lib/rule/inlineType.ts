import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';
import { Type } from './typeDef';

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
        parts: [['punct', '['], 'identifier', ['punct', ']']],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.type();
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.type());
          }
          type(): string {
            return `[${this.tokenValue(1)}]`;
          }
        },
      },
      {
        parts: ['identifier', ['keyword', 'alias'], new Type()],
        treeClass: class extends ParseTree {
          toString(): string {
            return `{${this.tokenValue(0)} is ${this.children[0].toString()}}`;
          }
          toJs(): string {
            return ``;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.children[0].toString());
            this.addToScope({
              name: this.tokenValue(0),
              type: {
                alias: this.children[0].toString(),
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
