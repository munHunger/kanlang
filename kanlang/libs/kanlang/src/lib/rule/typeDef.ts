import { ParseTree } from '../parseTree';
import { NewRuleType, Rule } from './rule';

export class TypeDef extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: [
          ['keyword', 'type'],
          'identifier',
          ['keyword', 'alias'],
          new Type(),
        ],
        treeClass: class extends ParseTree {
          toString(): string {
            return `{${this.tokenValue(1)} is ${this.children[0].toString()}}`;
          }
          validate(): void {
            this.validateIfTypeIsDefined(this.children[0].toString());
            this.addToScope({
              name: this.tokenValue(1),
              type: {
                alias: this.children[0].toString(),
              },
            });
          }
        },
      },
    ];
  }
}

export class Type extends Rule {
  get rules(): NewRuleType[] {
    return [
      {
        parts: ['identifier'],
        treeClass: class extends ParseTree {
          toString(): string {
            return this.tokenValue(0);
          }
        },
      },
      {
        parts: [['punct', '['], 'identifier', ['punct', ']']],
        treeClass: class extends ParseTree {
          toString(): string {
            return `[${this.tokenValue(1)}]`;
          }
        },
      },
    ];
  }
}
